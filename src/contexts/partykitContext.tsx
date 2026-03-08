"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import PartySocket from "partysocket";
import { QueueItem, RoomContext } from "./roomContext";

export interface PartyKitContextValue {
  connectionId: string | null;
}

export const PartyKitContext = createContext<PartyKitContextValue>({
  connectionId: null,
});

interface Props {
  children: ReactNode;
}

export default function PartyKitContextProvider({ children }: Props) {
  const roomContext = useContext(RoomContext);

  if (!roomContext) {
    throw new Error(
      "PartyKitContextProvider must be used inside RoomContextProvider",
    );
  }

  const { room, setRoom } = roomContext;

  const [connectionId, setConnectionId] = useState<string | null>(null);

  const roomId = room._id;

  useEffect(() => {
    if (!roomId) return;

    const socket = new PartySocket({
      host: process.env.NEXT_PUBLIC_PARTYKIT_HOST!,
      room: roomId,
    });

    socket.addEventListener("message", (event) => {
      try {
        const data = JSON.parse(event.data);
        const { type, payload } = data;

        if (!type) return;

        switch (type) {
          case "CONNECTED": {
            setConnectionId(payload?.connectionId ?? null);
            break;
          }

          case "TRACK_ADDED": {
            const newItem: QueueItem = {
              ...payload,
              addedAt: new Date(payload.addedAt),
            };

            setRoom((prev) => {
              const exists = prev.queue.some((q) => q._id === newItem._id);
              if (exists) return prev;

              const updatedQueue = [...prev.queue, newItem].sort(
                (a, b) => a.position - b.position,
              );

              return {
                ...prev,
                queue: updatedQueue,
              };
            });

            break;
          }

          case "TRACK_STATUS_CHANGED": {
            const { queueId, status } = payload;

            setRoom((prev) => {
              const updatedQueue = prev.queue
                .map((item) =>
                  item._id === queueId ? { ...item, status } : item,
                )
                .filter((item) => item.status !== "played");

              return {
                ...prev,
                queue: updatedQueue,
              };
            });

            break;
          }

          default: {
            console.warn("Unknown PartyKit event:", type);
          }
        }
      } catch {
        console.warn("Failed to parse socket message");
      }
    });

    socket.addEventListener("error", (error) => {
      console.error("Socket error:", error);
    });

    socket.addEventListener("close", (event) => {
      console.log("Socket closed:", event);
    });

    return () => {
      socket.close();
    };
  }, [roomId, setRoom]);

  return (
    <PartyKitContext.Provider value={{ connectionId }}>
      {children}
    </PartyKitContext.Provider>
  );
}
