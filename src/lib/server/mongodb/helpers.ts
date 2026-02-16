import { ObjectId } from "mongodb";
import MongoClient from "@/lib/server/mongodb/client";

export const hasRoomAccess = async (roomId: ObjectId, userId: ObjectId) => {
  if (!roomId || !userId) {
    throw new Error("roomId and userId are required");
  }

  try {
    const db = MongoClient.db();


    const result = await db.collection("roomMembers").findOne({
      userId: userId,
      roomId: roomId
    });

    return !!result;
  } catch (err) {
    console.error("Error checking room access:", err);
    return false;
  }
};
