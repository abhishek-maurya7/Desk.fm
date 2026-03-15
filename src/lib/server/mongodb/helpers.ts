import { ObjectId } from "mongodb";
import MongoClient from "@/lib/server/mongodb/client";

const db = MongoClient.db();

const usersCollection = db.collection("users");
const roomsCollection = db.collection("rooms");
const roomMembersCollection = db.collection("roomMembers");
const tracksCollection = db.collection("tracks");
const queueCollection = db.collection("queue");

export const hasRoomAccess = async (roomId: ObjectId, userId: ObjectId) => {
  const result = await roomMembersCollection.findOne({
    userId,
    roomId,
  });

  return !!result;
};

export const userExistsByEmail = async (email: string) => {
  const result = await usersCollection.findOne({ email });

  return !!result;
};

export const createUser = async (user: {
  name: string;
  email: string;
  password: string;
  createdAt: Date;
}) => {
  const result = await usersCollection.insertOne(user);

  return result;
};

export const getRoomById = async (_id: ObjectId) => {
  const room = await roomsCollection.findOne({ _id });

  return room;
};

export const joinRoom = async (roomId: ObjectId, userId: ObjectId) => {
  const result = roomMembersCollection.updateOne(
    { roomId, userId },
    {
      $setOnInsert: {
        roomId,
        userId,
        role: "member",
        joinedAt: new Date(),
      },
    },
    { upsert: true },
  );

  return result;
};

export const getTrackById = async (trackId: string) => {
  const result = tracksCollection.findOne({ trackId });

  return result;
};

export const addNewTrack = async (metadata: {
  trackId: string;
  title: string;
  publisher: string;
  thumbnail: string;
  provider: string;
}) => {
  const result = tracksCollection.insertOne(metadata);

  return result;
};

export const getLastQueueItem = (roomId: ObjectId) => {
  const result = queueCollection.findOne(
    { roomId: roomId },
    { sort: { position: -1 } },
  );

  return result;
};

export const addTrackToQueue = async ({
  roomId,
  trackId,
  position,
  userId,
}: {
  roomId: ObjectId;
  trackId: ObjectId;
  position: number;
  userId: ObjectId;
}) => {
  const now = new Date();

  const result = await queueCollection.insertOne({
    roomId,
    trackId,
    position,
    status: "queued",
    addedBy: userId,
    addedAt: now,
  });

  return {
    insertedId: result.insertedId,
    addedAt: now,
  };
};

export const updateQueueStatue = async (
  queueId: ObjectId,
  roomId: ObjectId,
) => {
  const result = queueCollection.updateOne(
    { _id: queueId, roomId: roomId, status: "queued" },
    {
      $set: {
        status,
        position: null,
        playedAt: new Date(),
      },
    },
  );

  return result;
};

export const getRoomQueueAndMembers = async (roomId: ObjectId) => {
  const [queue, members] = await Promise.all([
    queueCollection
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

    roomMembersCollection
      .find({ roomId })
      .project({ userId: 1, role: 1 })
      .toArray(),
  ]);

  return { queue, members };
};

export const createRoom = (name: string, userId: ObjectId) => {
  const result = roomsCollection.insertOne({
    name: name,
    playbackControllers: [
      {
        _id: userId,
        claimedAt: new Date(),
      },
    ],
    createdBy: userId,
    createdAt: new Date(),
  });

  return result;
};

export const getUserRooms = async (userId: ObjectId) => {
  const result = await roomMembersCollection
    .aggregate([
      { $match: { userId } },
      {
        $lookup: {
          from: "rooms",
          localField: "roomId",
          foreignField: "_id",
          as: "room",
        },
      },
      { $unwind: "$room" },
      {
        $project: {
          _id: 0,
          roomId: 1,
          name: "$room.name",
        },
      },
    ])
    .toArray();

  return result;
};