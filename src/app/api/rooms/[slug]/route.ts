import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getRoomById, getRoomQueueAndMembers, hasRoomAccess } from "@/lib/server/mongodb/helpers";

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

    const room = await getRoomById(roomId);

    if (!room) {
      return NextResponse.json(
        { message: "Room not found" },
        { status: 404 }
      );
    }

    const isMember = await hasRoomAccess(roomId, userId);

    if (!isMember) {
      return NextResponse.json(
        { message: "Access denied" },
        { status: 403 }
      );
    }

    const { queue, members } = await getRoomQueueAndMembers(roomId);

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
