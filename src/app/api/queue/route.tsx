import { auth } from "@/auth";
import { extractMediaInfo, getYouTubeMetadata } from "@/lib/server/helpers";
import { hasRoomAccess } from "@/lib/server/mongodb/helpers";
import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";
import MongoClient from "@/lib/server/mongodb/client";

import PartySocket from "partysocket";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { roomId, uri } = await request.json();

    if (!roomId || !uri) {
      return NextResponse.json(
        { message: "Missing roomId or uri" },
        { status: 400 }
      );
    }

    const roomObjectId = new ObjectId(roomId);
    const currentUserObjectId = new ObjectId(session.user.id);

    const hasAccess = await hasRoomAccess(
      roomObjectId,
      currentUserObjectId
    );

    if (!hasAccess) {
      return NextResponse.json(
        { message: "Access denied" },
        { status: 403 }
      );
    }

    const mediaInfo = extractMediaInfo(uri);

    if (!mediaInfo?.id) {
      return NextResponse.json(
        { message: "Failed to extract track ID" },
        { status: 400 }
      );
    }

    const db = await MongoClient.db();
    const trackId = mediaInfo.id;

    let existingTrack = await db
      .collection("tracks")
      .findOne({ trackId });

    if (!existingTrack) {
      const metadata = await getYouTubeMetadata(trackId);

      if (!metadata) {
        return NextResponse.json(
          { message: "Failed to fetch metadata" },
          { status: 500 }
        );
      }

      const insertTrackResult = await db
        .collection("tracks")
        .insertOne(metadata);

      existingTrack = {
        ...metadata,
        _id: insertTrackResult.insertedId,
      };
    }

    const lastQueueEntry = await db
      .collection("queue")
      .findOne(
        { roomId: roomObjectId },
        { sort: { position: -1 } }
      );

    const nextQueuePosition =
      typeof lastQueueEntry?.position === "number"
        ? lastQueueEntry.position + 1
        : 1;

    const createdAt = new Date();

    const insertQueueResult = await db
      .collection("queue")
      .insertOne({
        roomId: roomObjectId,
        trackId: existingTrack._id,
        position: nextQueuePosition,
        status: "queued",
        addedBy: currentUserObjectId,
        addedAt: createdAt,
      });

    const queueItemPayload = {
      _id: insertQueueResult.insertedId.toString(),
      position: nextQueuePosition,
      addedBy: currentUserObjectId.toString(),
      addedAt: createdAt,
      track: {
        _id: existingTrack._id.toString(),
        trackId: existingTrack.trackId,
        title: existingTrack.title,
        publisher: existingTrack.publisher,
        thumbnail: existingTrack.thumbnail,
        provider: existingTrack.provider,
      },
    };

    const partySocket = new PartySocket({
      host: process.env.NEXT_PUBLIC_PARTYKIT_HOST!,
      room: roomId,
    });

    partySocket.addEventListener("open", () => {
      partySocket.send(
        JSON.stringify({
          type: "TRACK_ADDED",
          payload: queueItemPayload,
        })
      );

      partySocket.close();
    });

    partySocket.addEventListener("error", (socketError) => {
      console.error("PartySocket error:", socketError);
    });

    return NextResponse.json(queueItemPayload);
  } catch {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { queueId, roomId, status } = await req.json();

  const allowedStatus = ["queued", "played"];

  if (!allowedStatus.includes(status)) {
    return NextResponse.json(
      { message: "Invalid status value" },
      { status: 400 },
    );
  }

  const roomObjectId = new ObjectId(roomId);
  const queueObjectId = new ObjectId(queueId);
  const userObjectId = new ObjectId(session.user.id);

  const isAuthorized = await hasRoomAccess(roomObjectId, userObjectId);

  if (!isAuthorized) {
    return NextResponse.json({ message: "Access denied" }, { status: 403 });
  }

  const db = await MongoClient.db();

  const result = await db.collection("queue").updateOne(
    {
      _id: queueObjectId,
      roomId: roomObjectId,
      status: "queued",
    },
    {
      $set: {
        status: status,
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

  return NextResponse.json({ success: true });
}
