import { auth } from "@/auth";
import { extractMediaInfo, getYouTubeMetadata } from "@/lib/server/helpers";
import { hasRoomAccess } from "@/lib/server/mongodb/helpers";
import MongoClient from "@/lib/server/mongodb/client";

import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";
import PartySocket from "partysocket";

export async function POST(req: NextRequest) {
  console.log("[QUEUE][POST] Request received");

  try {
    const session = await auth();
    console.log("[QUEUE][POST] Session:", session?.user?.id);

    if (!session?.user?.id) {
      console.warn("[QUEUE][POST] Unauthorized request");
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { roomId, uri } = await req.json();
    console.log("[QUEUE][POST] Payload:", { roomId, uri });

    if (!roomId || !uri) {
      console.warn("[QUEUE][POST] Missing parameters");
      return NextResponse.json(
        { message: "Missing roomId or uri" },
        { status: 400 }
      );
    }

    const roomObjectId = new ObjectId(roomId);
    const userObjectId = new ObjectId(session.user.id);

    const hasAccess = await hasRoomAccess(roomObjectId, userObjectId);
    console.log("[QUEUE][POST] Access check:", hasAccess);

    if (!hasAccess) {
      console.warn("[QUEUE][POST] Access denied");
      return NextResponse.json({ message: "Access denied" }, { status: 403 });
    }

    const mediaInfo = extractMediaInfo(uri);
    console.log("[QUEUE][POST] Extracted media info:", mediaInfo);

    if (!mediaInfo?.id) {
      console.warn("[QUEUE][POST] Failed to extract track ID");
      return NextResponse.json(
        { message: "Failed to extract track ID" },
        { status: 400 }
      );
    }

    const db = await MongoClient.db();
    const trackId = mediaInfo.id;

    console.log("[QUEUE][POST] Checking existing track:", trackId);
    let track = await db.collection("tracks").findOne({ trackId });

    if (!track) {
      console.log("[QUEUE][POST] Track not found, fetching metadata");

      const metadata = await getYouTubeMetadata(trackId);
      if (!metadata) {
        console.error("[QUEUE][POST] Metadata fetch failed");
        return NextResponse.json(
          { message: "Failed to fetch metadata" },
          { status: 500 }
        );
      }

      const { insertedId } = await db.collection("tracks").insertOne(metadata);
      console.log("[QUEUE][POST] Track inserted:", insertedId.toString());

      track = { ...metadata, _id: insertedId };
    } else {
      console.log("[QUEUE][POST] Track already exists:", track._id.toString());
    }

    const last = await db
      .collection("queue")
      .findOne({ roomId: roomObjectId }, { sort: { position: -1 } });

    const position = typeof last?.position === "number" ? last.position + 1 : 1;
    console.log("[QUEUE][POST] Next queue position:", position);

    const now = new Date();

    const { insertedId } = await db.collection("queue").insertOne({
      roomId: roomObjectId,
      trackId: track._id,
      position,
      status: "queued",
      addedBy: userObjectId,
      addedAt: now,
    });

    console.log("[QUEUE][POST] Queue item inserted:", insertedId.toString());

    const payload = {
      _id: insertedId.toString(),
      position,
      addedBy: userObjectId.toString(),
      addedAt: now,
      track: {
        _id: track._id.toString(),
        trackId: track.trackId,
        title: track.title,
        publisher: track.publisher,
        thumbnail: track.thumbnail,
        provider: track.provider,
      },
    };

    console.log("[QUEUE][POST] Broadcasting TRACK_ADDED event");

    await new Promise<void>((resolve) => {
      const socket = new PartySocket({
        host: process.env.NEXT_PUBLIC_PARTYKIT_HOST!,
        room: roomId,
      });

      socket.addEventListener("open", () => {
        console.log("[QUEUE][POST] PartySocket connected");

        socket.send(JSON.stringify({ type: "TRACK_ADDED", payload }));

        console.log("[QUEUE][POST] Event sent, closing socket");
        socket.close();
        resolve();
      });

      socket.addEventListener("error", (err) => {
        console.error("[QUEUE][POST] PartySocket error:", err);
        socket.close();
        resolve();
      });
    });

    console.log("[QUEUE][POST] Success response");
    return NextResponse.json(payload);
  } catch (err) {
    console.error("[QUEUE][POST] Unexpected error:", err);

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  console.log("[QUEUE][PATCH] Request received");

  const session = await auth();
  console.log("[QUEUE][PATCH] Session:", session?.user?.id);

  if (!session?.user?.id) {
    console.warn("[QUEUE][PATCH] Unauthorized request");
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { queueId, roomId, status } = await req.json();
  console.log("[QUEUE][PATCH] Payload:", { queueId, roomId, status });

  if (!["queued", "played"].includes(status)) {
    console.warn("[QUEUE][PATCH] Invalid status");
    return NextResponse.json(
      { message: "Invalid status value" },
      { status: 400 }
    );
  }

  const roomObjectId = new ObjectId(roomId);
  const queueObjectId = new ObjectId(queueId);
  const userObjectId = new ObjectId(session.user.id);

  const hasAccess = await hasRoomAccess(roomObjectId, userObjectId);
  console.log("[QUEUE][PATCH] Access check:", hasAccess);

  if (!hasAccess) {
    console.warn("[QUEUE][PATCH] Access denied");
    return NextResponse.json({ message: "Access denied" }, { status: 403 });
  }

  const db = await MongoClient.db();

  const result = await db.collection("queue").updateOne(
    { _id: queueObjectId, roomId: roomObjectId, status: "queued" },
    {
      $set: {
        status,
        position: null,
        playedAt: new Date(),
      },
    }
  );

  console.log("[QUEUE][PATCH] Update result:", result);

  if (result.matchedCount === 0) {
    console.warn("[QUEUE][PATCH] Queue item not found");
    return NextResponse.json(
      { message: "Queue item not found or already updated" },
      { status: 404 }
    );
  }

  console.log("[QUEUE][PATCH] Success response");
  return NextResponse.json({ success: true });
}