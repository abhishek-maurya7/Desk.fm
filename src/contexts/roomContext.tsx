"use client";

import { createContext, ReactNode, useState } from "react";

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

  return (
    <RoomContext.Provider value={{ room, setRoom }}>
      {children}
    </RoomContext.Provider>
  );
}