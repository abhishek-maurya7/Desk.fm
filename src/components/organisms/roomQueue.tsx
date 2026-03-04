"use client";

import { useContext } from "react";
import { RoomContext } from "@/contexts/roomContext";
import { QueueItem } from "../molecules";

export default function RoomQueue() {
  const context = useContext(RoomContext);
  const room = context?.room;

  if (!room?.queue?.length) return null;

  return (
    <>
      {room.queue.map((queueItem, index) => (
        <QueueItem key={queueItem._id} item={queueItem} index={index} />
      ))}
    </>
  );
}
