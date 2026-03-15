import { auth } from "@/auth";
import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";
import { getRoomById, joinRoom } from "@/lib/server/mongodb/helpers";

type Params = { slug: string };

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<Params> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await params;
    if (!slug || !ObjectId.isValid(slug)) {
      return NextResponse.json(
        { error: "Invalid invite code." },
        { status: 400 },
      );
    }

    const room = await getRoomById(new ObjectId(slug));
    if (!room) {
      return NextResponse.json(
        { error: "This invite link is invalid or expired." },
        { status: 404 },
      );
    }

    return NextResponse.json({ name: room.name }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<Params> },
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await params;

    if (!slug || !ObjectId.isValid(slug)) {
      return NextResponse.json(
        { error: "Invalid invite code." },
        { status: 400 },
      );
    }

    const userId = new ObjectId(session.user.id);
    const roomId = new ObjectId(slug);

    const room = await getRoomById(roomId);
    if (!room) {
      return NextResponse.json({ error: "Room not found." }, { status: 404 });
    }

    const { upsertedId } = await joinRoom(roomId, userId);

    return NextResponse.json(
      {
        name: room.name,
        message: upsertedId
          ? "Successfully joined the room."
          : "Already a member of the room.",
      },
      { status: 200 },
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}