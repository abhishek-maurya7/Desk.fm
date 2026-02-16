import { auth } from "@/auth";
import { extractMediaInfo, getYouTubeMetadata } from "@/lib/server/helpers";
import { hasRoomAccess } from "@/lib/server/mongodb/helpers";
import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";
import MongoClient from "@/lib/server/mongodb/client";

export async function POST(req: NextRequest) {
  try {
    const { roomId, uri } = await req.json();

    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

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
        { status: 400 }
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
        { status: 500 }
      );
    }

    const lastQueueItem = await db.collection("queue").findOne(
      { roomId: roomObjectId },
      { sort: { position: -1 } }
    );

    const nextPosition = lastQueueItem?.position
      ? lastQueueItem.position + 1
      : 1;

    await db.collection("queue").insertOne({
      roomId: roomObjectId,
      trackId: track._id,
      position: nextPosition,
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
      { status: 500 }
    );
  }
}
