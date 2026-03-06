import { auth } from "@/auth";
import { extractMediaInfo, getYouTubeMetadata } from "@/lib/server/helpers";
import { hasRoomAccess } from "@/lib/server/mongodb/helpers";
import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";
import MongoClient from "@/lib/server/mongodb/client";

import PartySocket from "partysocket";

export async function POST(request: NextRequest) {
  console.log("[POST /queue] Handler invoked");
  try {
    console.log("[POST /queue] Authenticating session...");
    const session = await auth();
    console.log("[POST /queue] Session result:", {
      userId: session?.user?.id ?? null,
    });

    if (!session?.user?.id) {
      console.warn("[POST /queue] Unauthorized — no session user ID");
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { roomId, uri } = body;
    console.log("[POST /queue] Parsed request body:", { roomId, uri });

    if (!roomId || !uri) {
      console.warn("[POST /queue] Missing roomId or uri:", { roomId, uri });
      return NextResponse.json(
        { message: "Missing roomId or uri" },
        { status: 400 },
      );
    }

    const roomObjectId = new ObjectId(roomId);
    const currentUserObjectId = new ObjectId(session.user.id);
    console.log("[POST /queue] Parsed ObjectIds:", {
      roomObjectId: roomObjectId.toString(),
      currentUserObjectId: currentUserObjectId.toString(),
    });

    console.log("[POST /queue] Checking room access...");
    const hasAccess = await hasRoomAccess(roomObjectId, currentUserObjectId);
    console.log("[POST /queue] Room access result:", hasAccess);

    if (!hasAccess) {
      console.warn("[POST /queue] Access denied for user:", session.user.id);
      return NextResponse.json({ message: "Access denied" }, { status: 403 });
    }

    console.log("[POST /queue] Extracting media info from URI:", uri);
    const mediaInfo = extractMediaInfo(uri);
    console.log("[POST /queue] Extracted media info:", mediaInfo);

    if (!mediaInfo?.id) {
      console.warn("[POST /queue] Failed to extract track ID from URI:", uri);
      return NextResponse.json(
        { message: "Failed to extract track ID" },
        { status: 400 },
      );
    }

    console.log("[POST /queue] Connecting to DB...");
    const db = await MongoClient.db();
    const trackId = mediaInfo.id;
    console.log("[POST /queue] Looking up existing track by trackId:", trackId);

    let existingTrack = await db.collection("tracks").findOne({ trackId });
    console.log(
      "[POST /queue] Existing track lookup result:",
      existingTrack ? { _id: existingTrack._id.toString() } : "not found",
    );

    if (!existingTrack) {
      console.log(
        "[POST /queue] Track not found — fetching YouTube metadata for trackId:",
        trackId,
      );
      const metadata = await getYouTubeMetadata(trackId);
      console.log("[POST /queue] YouTube metadata result:", metadata);

      if (!metadata) {
        console.error(
          "[POST /queue] Failed to fetch YouTube metadata for trackId:",
          trackId,
        );
        return NextResponse.json(
          { message: "Failed to fetch metadata" },
          { status: 500 },
        );
      }

      console.log("[POST /queue] Inserting new track into DB...");
      const insertTrackResult = await db
        .collection("tracks")
        .insertOne(metadata);
      console.log(
        "[POST /queue] Track inserted with ID:",
        insertTrackResult.insertedId.toString(),
      );

      existingTrack = {
        ...metadata,
        _id: insertTrackResult.insertedId,
      };
    }

    console.log("[POST /queue] Fetching last queue entry for room:", roomId);
    const lastQueueEntry = await db
      .collection("queue")
      .findOne({ roomId: roomObjectId }, { sort: { position: -1 } });
    console.log(
      "[POST /queue] Last queue entry:",
      lastQueueEntry
        ? {
            _id: lastQueueEntry._id.toString(),
            position: lastQueueEntry.position,
          }
        : "none",
    );

    const nextQueuePosition =
      typeof lastQueueEntry?.position === "number"
        ? lastQueueEntry.position + 1
        : 1;
    console.log(
      "[POST /queue] Computed next queue position:",
      nextQueuePosition,
    );

    const createdAt = new Date();

    console.log("[POST /queue] Inserting queue item into DB...");
    const insertQueueResult = await db.collection("queue").insertOne({
      roomId: roomObjectId,
      trackId: existingTrack._id,
      position: nextQueuePosition,
      status: "queued",
      addedBy: currentUserObjectId,
      addedAt: createdAt,
    });
    console.log(
      "[POST /queue] Queue item inserted with ID:",
      insertQueueResult.insertedId.toString(),
    );

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
    console.log(
      "[POST /queue] Assembled queue item payload:",
      queueItemPayload,
    );

    console.log(
      "[POST /queue] Initializing PartySocket — host:",
      process.env.NEXT_PUBLIC_PARTYKIT_HOST,
      "room:",
      roomId,
    );
    // Replace the PartySocket block with this:
    await new Promise<void>((resolve, reject) => {
      const partySocket = new PartySocket({
        host: process.env.NEXT_PUBLIC_PARTYKIT_HOST!,
        room: roomId,
      });

      const timeout = setTimeout(() => {
        console.warn("[POST /queue] PartySocket timed out — closing");
        partySocket.close();
        resolve(); // still resolve so we don't block the response forever
      }, 5000);

      partySocket.addEventListener("open", () => {
        console.log(
          "[POST /queue] PartySocket opened — sending TRACK_ADDED event",
        );
        partySocket.send(
          JSON.stringify({
            type: "TRACK_ADDED",
            payload: queueItemPayload,
          }),
        );
        console.log("[POST /queue] TRACK_ADDED sent — closing socket");
        clearTimeout(timeout);
        partySocket.close();
        resolve();
      });

      partySocket.addEventListener("error", (socketError) => {
        console.error("[POST /queue] PartySocket error:", socketError);
        clearTimeout(timeout);
        partySocket.close();
        resolve(); // resolve instead of reject so queue insert isn't rolled back
      });
    });

    console.log("[POST /queue] Returning 200 response");
    return NextResponse.json(queueItemPayload);
  } catch (err) {
    console.error("[POST /queue] Unhandled exception:", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: NextRequest) {
  console.log("[PATCH /queue] Handler invoked");

  const session = await auth();
  console.log("[PATCH /queue] Session result:", {
    userId: session?.user?.id ?? null,
  });

  if (!session?.user?.id) {
    console.warn("[PATCH /queue] Unauthorized — no session user ID");
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { queueId, roomId, status } = body;
  console.log("[PATCH /queue] Parsed request body:", {
    queueId,
    roomId,
    status,
  });

  const allowedStatus = ["queued", "played"];

  if (!allowedStatus.includes(status)) {
    console.warn("[PATCH /queue] Invalid status value:", status);
    return NextResponse.json(
      { message: "Invalid status value" },
      { status: 400 },
    );
  }

  const roomObjectId = new ObjectId(roomId);
  const queueObjectId = new ObjectId(queueId);
  const userObjectId = new ObjectId(session.user.id);
  console.log("[PATCH /queue] Parsed ObjectIds:", {
    roomObjectId: roomObjectId.toString(),
    queueObjectId: queueObjectId.toString(),
    userObjectId: userObjectId.toString(),
  });

  console.log("[PATCH /queue] Checking room access...");
  const isAuthorized = await hasRoomAccess(roomObjectId, userObjectId);
  console.log("[PATCH /queue] Room access result:", isAuthorized);

  if (!isAuthorized) {
    console.warn("[PATCH /queue] Access denied for user:", session.user.id);
    return NextResponse.json({ message: "Access denied" }, { status: 403 });
  }

  console.log("[PATCH /queue] Connecting to DB...");
  const db = await MongoClient.db();

  console.log("[PATCH /queue] Updating queue item:", {
    queueId,
    roomId,
    newStatus: status,
  });
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
  console.log("[PATCH /queue] Update result:", {
    matchedCount: result.matchedCount,
    modifiedCount: result.modifiedCount,
  });

  if (result.matchedCount === 0) {
    console.warn("[PATCH /queue] No matching queue item found for:", {
      queueId,
      roomId,
    });
    return NextResponse.json(
      { message: "Queue item not found or already updated" },
      { status: 404 },
    );
  }

  console.log("[PATCH /queue] Returning success response");
  return NextResponse.json({ success: true });
}
