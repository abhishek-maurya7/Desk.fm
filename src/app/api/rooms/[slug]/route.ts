import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import MongoClient from "@/lib/server/mongodb/client";
import { ObjectId } from "mongodb";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { slug } = await params;

    if (!ObjectId.isValid(slug)) {
      return NextResponse.json(
        { message: "Invalid room id" },
        { status: 400 }
      );
    }

    const roomId = new ObjectId(slug);
    const userId = new ObjectId(session.user.id);

    const db = await MongoClient.db();

    const room = await db.collection("rooms").findOne({ _id: roomId });

    if (!room) {
      return NextResponse.json(
        { message: "Room not found" },
        { status: 404 }
      );
    }

    const isMember = await db.collection("roomMembers").findOne({
      roomId,
      userId,
    });

    if (!isMember) {
      return NextResponse.json(
        { message: "Access denied" },
        { status: 403 }
      );
    }

    const [queue, members] = await Promise.all([
      db.collection("queue")
        .aggregate([
          { $match: { roomId, status: "queued" } },
          { $sort: { position: 1 } },
          {
            $lookup: {
              from: "tracks",
              localField: "trackId",
              foreignField: "_id",
              as: "track",
            },
          },
          { $unwind: "$track" },
          {
            $project: {
              _id: 1,
              position: 1,
              addedBy: 1,
              addedAt: 1,
              track: {
                _id: "$track._id",
                trackId: "$track.trackId",
                title: "$track.title",
                publisher: "$track.publisher",
                thumbnail: "$track.thumbnail",
                provider: "$track.provider",
              },
            },
          },
        ])
        .toArray(),

      db.collection("roomMembers")
        .find({ roomId })
        .project({ userId: 1, role: 1 })
        .toArray(),
    ]);

    return NextResponse.json({
      ...room,
      queue,
      members,
    });

  } catch {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
