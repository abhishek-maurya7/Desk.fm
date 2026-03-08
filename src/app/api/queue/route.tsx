import { auth } from "@/auth";
import { extractMediaInfo, getYouTubeMetadata } from "@/lib/server/helpers";
import { hasRoomAccess } from "@/lib/server/mongodb/helpers";
import MongoClient from "@/lib/server/mongodb/client";

import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";
import PartySocket from "partysocket";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { roomId, uri, senderConnectionId } = await req.json();

    if (!roomId || !uri || !senderConnectionId) {
      return NextResponse.json(
        { message: "Missing roomId or uri or senderConnectionId" },
        { status: 400 },
      );
    }

    const roomObjectId = new ObjectId(roomId);
    const userObjectId = new ObjectId(session.user.id);

    const hasAccess = await hasRoomAccess(roomObjectId, userObjectId);

    if (!hasAccess) {
      return NextResponse.json({ message: "Access denied" }, { status: 403 });
    }

    const mediaInfo = extractMediaInfo(uri);

    if (!mediaInfo?.id) {
      return NextResponse.json(
        { message: "Failed to extract track ID" },
        { status: 400 },
      );
    }

    const db = await MongoClient.db();
    const trackId = mediaInfo.id;

    let track = await db.collection("tracks").findOne({ trackId });

    if (!track) {
      const metadata = await getYouTubeMetadata(trackId);
      if (!metadata) {
        return NextResponse.json(
          { message: "Failed to fetch metadata" },
          { status: 500 },
        );
      }

      const { insertedId } = await db.collection("tracks").insertOne(metadata);

      track = { ...metadata, _id: insertedId };
    }

    const last = await db
      .collection("queue")
      .findOne({ roomId: roomObjectId }, { sort: { position: -1 } });

    const position = typeof last?.position === "number" ? last.position + 1 : 1;

    const now = new Date();

    const { insertedId } = await db.collection("queue").insertOne({
      roomId: roomObjectId,
      trackId: track._id,
      position,
      status: "queued",
      addedBy: userObjectId,
      addedAt: now,
    });

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

    await new Promise<void>((resolve) => {
      const socket = new PartySocket({
        host: process.env.NEXT_PUBLIC_PARTYKIT_HOST!,
        room: roomId,
      });

      socket.addEventListener("open", () => {
        socket.send(
          JSON.stringify({
            type: "TRACK_ADDED",
            payload,
            senderConnectionId: senderConnectionId,
          }),
        );

        socket.close();
        resolve();
      });

      socket.addEventListener("error", () => {
        socket.close();
        resolve();
      });
    });

    return NextResponse.json(payload);
  } catch {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { queueId, roomId, status, senderConnectionId } = await req.json();

  if (!["queued", "played"].includes(status)) {
    return NextResponse.json(
      { message: "Invalid status value" },
      { status: 400 },
    );
  }

  const roomObjectId = new ObjectId(roomId);
  const queueObjectId = new ObjectId(queueId);
  const userObjectId = new ObjectId(session.user.id);

  const hasAccess = await hasRoomAccess(roomObjectId, userObjectId);

  if (!hasAccess) {
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
    },
  );

  if (result.matchedCount === 0) {
    return NextResponse.json(
      { message: "Queue item not found or already updated" },
      { status: 404 },
    );
  }

  await new Promise<void>((resolve) => {
    const socket = new PartySocket({
      host: process.env.NEXT_PUBLIC_PARTYKIT_HOST!,
      room: roomId,
    });

    socket.addEventListener("open", () => {
      socket.send(
        JSON.stringify({
          type: "TRACK_STATUS_CHANGED",
          payload: { queueId, status },
          senderConnectionId,
        }),
      );

      socket.close();
      resolve();
    });

    socket.addEventListener("error", () => {
      socket.close();
      resolve();
    });
  });

  return NextResponse.json({
    success: true,
    queueId,
  });
}