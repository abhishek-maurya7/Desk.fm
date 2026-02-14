import { auth } from "@/auth";
import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";
import MongoClient from "@/lib/mongodb/client";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { name } = await req.json();

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { message: "Room name is required" },
        { status: 400 }
      );
    }

    const db = MongoClient.db();

    const userId = new ObjectId(session.user.id);

    const roomResult = await db.collection("rooms").insertOne({
      name: name.trim(),
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

    return NextResponse.json(
      { roomId: roomId.toString() },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create room error:", error);

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
