import { auth } from "@/auth";

import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";
import MongoClient from "@/lib/server/mongodb/client";


export async function GET(
  req: NextRequest,
  context: { params: { slug: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await context.params;

    if (!slug || !ObjectId.isValid(slug)) {
      return NextResponse.json(
        { error: "Invalid invite code." },
        { status: 400 }
      );
    }

    const db = MongoClient.db();

    const room = await db
      .collection("rooms")
      .findOne({ _id: new ObjectId(slug) });

    if (!room) {
      return NextResponse.json(
        { error: "This invite link is invalid or expired." },
        { status: 404 }
      );
    }

    return NextResponse.json({ name: room.name }, { status: 200 });
  } catch (err) {
    console.error("Invite GET error:", err);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  context: { params: { slug: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = new ObjectId(session.user.id);
    const { slug } = await context.params;

    if (!slug || !ObjectId.isValid(slug)) {
      return NextResponse.json(
        { error: "Invalid invite code." },
        { status: 400 }
      );
    }

    const roomId = new ObjectId(slug);
    const db = MongoClient.db();

    const room = await db.collection("rooms").findOne({ _id: roomId });

    if (!room) {
      return NextResponse.json(
        { error: "Room not found." },
        { status: 404 }
      );
    }

    const result = await db.collection("roomMembers").updateOne(
      { roomId, userId },
      {
        $setOnInsert: {
          roomId,
          userId,
          role: "member",
          joinedAt: new Date(),
        },
      },
      { upsert: true }
    );

    if (result.matchedCount > 0) {
      return NextResponse.json(
        { message: "You are already a member of this room.", name: room.name },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        message: "Successfully joined the room.",
        name: room.name,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Invite POST error:", err);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
