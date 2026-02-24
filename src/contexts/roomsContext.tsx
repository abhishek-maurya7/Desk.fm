"use client";

import { createContext, useState, ReactNode, useCallback } from "react";

export type Room = {
  roomId: string;
  name: string;
};

export type RoomsContextType = {
  rooms: Room[];
  addRoom: (room: Room) => void;
  setAllRooms: (rooms: Room[]) => void;
};

export const RoomsContext = createContext<RoomsContextType | null>(null);

export default function RoomsContextProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [rooms, setRooms] = useState<Room[]>([]);

  const addRoom = useCallback((room: Room) => {
    setRooms((prev) => [room, ...prev]);
  }, []);

  const setAllRooms = useCallback((rooms: Room[]) => {
    setRooms(rooms);
  }, []);

  return (
    <RoomsContext.Provider value={{ rooms, addRoom, setAllRooms }}>
      {children}
    </RoomsContext.Provider>
  );
}
