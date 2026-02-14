import { ObjectId } from "mongodb";
import MongoClient from "@/lib/mongodb/client";

export const hasRoomAccess = async (roomId: string, userId: string) => {
  if (!roomId || !userId) {
    throw new Error("roomId and userId are required");
  }

  try {
    const db = MongoClient.db();

    const roomObjectId = new ObjectId(roomId);
    const userObjectId = new ObjectId(userId);

    const result = await db.collection("roomMembers").findOne({
      userId: userObjectId,
      roomId: roomObjectId
    });

    return !!result;
  } catch (err) {
    console.error("Error checking room access:", err);
    return false;
  }
};
