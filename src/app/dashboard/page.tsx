"use client";

import { Typography } from "@/components/atoms";
import CreateRoomForm from "@/components/organisms/createRoomForm";
import { RoomsContext, Room } from "@/contexts/roomsContext";
import Link from "next/link";
import { useContext, useEffect, useState } from "react";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const roomsContext = useContext(RoomsContext);

  if (!roomsContext) {
    throw new Error("Dashboard must be used within RoomsContextProvider");
  }

  const { rooms, setAllRooms } = roomsContext;

  useEffect(() => {
    const getRoomsData = async () => {
      try {
        const response = await fetch("/api/rooms");
        if (!response.ok) return;

        const result = await response.json();

        if (Array.isArray(result.rooms)) {
          setAllRooms(result.rooms);
        }
      } finally {
        setLoading(false);
      }
    };

    getRoomsData();
  }, [setAllRooms]);

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-5xl px-6 py-10 space-y-10">
        {/* Create Room Form */}
        <section className="rounded-xl border border-slate-800 text-white bg-slate-900/60 p-6">
          <CreateRoomForm />
        </section>

        {/* Rooms List */}
        <section className="space-y-4">
          <Typography as="h2" variant="bodyLarge" className="text-white">
            Your Rooms
          </Typography>

          {loading && (
            <div className="h-16 flex items-center justify-center rounded-lg border border-slate-800 bg-slate-900/40">
              <Typography>Loading...</Typography>
            </div>
          )}

          {!loading && rooms.length === 0 && (
            <div className="h-16 flex items-center justify-center rounded-lg border border-slate-800 bg-slate-900/40">
              <Typography className="text-slate-400">No rooms found</Typography>
            </div>
          )}

          {!loading && rooms.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {rooms.map((room: Room) => {
                const {roomId: _id, name} = room;
                return <Link key={_id} href={`/rooms/${_id}`}>
                  <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-4 transition-all duration-200 hover:border-slate-600 hover:bg-slate-800">
                    <span className="font-medium text-slate-200">
                      {name}
                    </span>
                  </div>
                </Link>;
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}