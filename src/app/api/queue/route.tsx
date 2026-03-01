import { auth } from "@/auth";
import { extractMediaInfo, getYouTubeMetadata } from "@/lib/server/helpers";
import { hasRoomAccess } from "@/lib/server/mongodb/helpers";
import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";
import MongoClient from "@/lib/server/mongodb/client";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { roomId, uri } = await req.json();

    const roomObjectId = new ObjectId(roomId);
    const userObjectId = new ObjectId(session.user.id);

    const isAuthorized = await hasRoomAccess(roomObjectId, userObjectId);

    if (!isAuthorized) {
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

    const videoId = mediaInfo.id;

    let track = await db.collection("tracks").findOne({ trackId: videoId });

    if (!track) {
      const metadata = await getYouTubeMetadata(videoId);

      const result = await db.collection("tracks").insertOne(metadata);

      track = { ...metadata, _id: result.insertedId };
    }

    if (!track) {
      return NextResponse.json(
        { message: "Failed to resolve track" },
        { status: 500 },
      );
    }

    const lastQueueItem = await db
      .collection("queue")
      .findOne({ roomId: roomObjectId }, { sort: { position: -1 } });

    const nextPosition =
      typeof lastQueueItem?.position === "number"
        ? lastQueueItem.position + 1
        : 1;

    await db.collection("queue").insertOne({
      roomId: roomObjectId,
      trackId: track._id,
      position: nextPosition,
      status: "queued",
      addedBy: userObjectId,
      addedAt: new Date(),
    });

    return NextResponse.json({
      trackId: track._id.toString(),
      ...track,
    });
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
  
  console.log("🚀 ~ PATCH ~ result:", result);

  if (result.matchedCount === 0) {
    return NextResponse.json(
      { message: "Queue item not found or already updated" },
      { status: 404 },
    );
  }

  return NextResponse.json({ success: true });
}
