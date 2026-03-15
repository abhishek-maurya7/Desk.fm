import { auth } from "@/auth";
import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";
import { createRoom, getUserRooms, joinRoom } from "@/lib/server/mongodb/helpers";

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

    const userId = new ObjectId(session.user.id);

    const roomResult = await createRoom(name, userId);

    const roomId = roomResult.insertedId;

    await joinRoom(roomId, userId);

    return NextResponse.json({ roomId: roomId, name: name }, { status: 201 });
  } catch {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id || !ObjectId.isValid(session.user.id)) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = new ObjectId(session.user.id);

    const result = await getUserRooms(userId);

    return NextResponse.json(
      { rooms: result },
      { status: 200 }
    );

  } catch {
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}