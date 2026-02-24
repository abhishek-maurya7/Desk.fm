import { auth } from "@/auth";
import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";
import MongoClient from "@/lib/server/mongodb/client";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { name } = await req.json();

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { message: "Room name is required" },
        { status: 400 },
      );
    }

    const db = MongoClient.db();

    const userId = new ObjectId(session.user.id);

    const roomResult = await db.collection("rooms").insertOne({
      name: name.trim(),
      playbackControllers: [{
        _id: userId, claimedAt: new Date(),
      }],
      createdBy: userId,
      createdAt: new Date(),
    });

    const roomId = roomResult.insertedId;

    await db.collection("roomMembers").insertOne({
      roomId,
      userId,
      role: "owner",
      joinedAt: new Date(),
    });

    return NextResponse.json({ roomId: roomId.toString() }, { status: 201 });
  } catch (error) {
    console.error("Create room error:", error);

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id || !ObjectId.isValid(session.user.id)) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const db = await MongoClient.db();
    const userId = new ObjectId(session.user.id);

    const result = await db
      .collection("roomMembers")
      .aggregate([
        { $match: { userId } },
        {
          $lookup: {
            from: "rooms",
            localField: "roomId",
            foreignField: "_id",
            as: "room"
          }
        },
        { $unwind: "$room" },
        {
          $project: {
            _id: 0,
            roomId: 1,
            name: "$room.name"
          }
        }
      ])
      .toArray();

    return NextResponse.json(
      { rooms: result },
      { status: 200 }
    );

  } catch (error) {
    console.error("GET /rooms error:", error);

    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}