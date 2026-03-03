"use client";

import { createContext, ReactNode, useState } from "react";
import { useEffect } from "react";
import PartySocket from "partysocket";

export interface ControllerUser {
  _id: string;
  claimedAt: Date;
}

export interface RoomMember {
  _id: string;
  userId: string;
  role: string;
}

export interface QueueItem {
  _id: string;
  position: number;
  addedBy: string;
  addedAt: Date;
  track: {
    _id: string;
    trackId: string;
    title: string;
    publisher: string;
    thumbnail: string;
    provider: string;
  };
}

export interface RoomState {
  _id: string;
  name: string;
  members: RoomMember[];
  queue: QueueItem[];
  playbackControllers: ControllerUser[];
}

export interface RoomContextType {
  room: RoomState;
  setRoom: React.Dispatch<React.SetStateAction<RoomState>>;
}

export const RoomContext = createContext<RoomContextType | null>(null);

interface Props {
  children: ReactNode;
  initialData?: Partial<RoomState>;
}

export default function RoomContextProvider({
  children,
  initialData = {},
}: Props) {
  const initialRoom: RoomState = {
    _id: initialData._id ?? "",
    name: initialData.name ?? "",
    members: initialData.members ?? [],
    queue: (initialData.queue ?? []).map((q) => ({
      ...q,
      addedAt: new Date(q.addedAt),
    })),
    playbackControllers: (initialData.playbackControllers ?? []).map((c) => ({
      ...c,
      claimedAt: new Date(c.claimedAt),
    })),
  };

  const [room, setRoom] = useState<RoomState>(initialRoom);
  useEffect(() => {
    if (!room._id) return;

    const socket = new PartySocket({
      host: process.env.NEXT_PUBLIC_PARTYKIT_HOST!,
      room: room._id,
    });

    socket.addEventListener("message", (event) => {
      try {
        const data = JSON.parse(event.data);

        const { type, payload } = data;

        if (!data?.type) return;

        switch (type) {
          case "CONNECTED": {
            console.log("Connection ID:", payload?.connectionId);
            break;
          }

          case "TRACK_ADDED": {
            console.log("🎵 TRACK_ADDED event received");
            console.log("Payload:", payload);

            const newItem: QueueItem = {
              ...payload,
              addedAt: new Date(payload.addedAt),
            };

            setRoom((prev) => {
              const alreadyExists = prev.queue.some(
                (item) => item._id === newItem._id,
              );

              if (alreadyExists) {
                console.log("⚠️ Track already exists in queue, skipping");
                return prev;
              }

              const updatedQueue = [...prev.queue, newItem].sort(
                (a, b) => a.position - b.position,
              );

              console.log("✅ Queue updated. New length:", updatedQueue.length);

              return {
                ...prev,
                queue: updatedQueue,
              };
            });

            break;
          }

          default: {
            console.warn("⚠️ Unknown event type:", type);
            console.log("Full payload:", payload);
          }
        }
      } catch (err) {
        console.warn("⚠️ Failed to parse message as JSON");
      }
    });

    socket.addEventListener("error", (error) => {
      console.error("🔴 SOCKET ERROR:", error);
    });

    socket.addEventListener("close", (event) => {
      console.log("🔌 SOCKET CLOSED");
      console.log("Code:", event.code);
      console.log("Reason:", event.reason);
      console.log("Was clean:", event.wasClean);
    });

    return () => {
      socket.close();
    };
  }, [room._id]);
  return (
    <RoomContext.Provider value={{ room, setRoom }}>
      {children}
    </RoomContext.Provider>
  );
}
