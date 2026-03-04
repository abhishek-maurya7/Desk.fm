"use client";

import { useContext, useState } from "react";
import { Button, Input, Typography } from "@/components/atoms";
import { Form } from "@/components/molecules";
import { RoomsContext } from "@/contexts/roomsContext";

export default function CreateRoomForm() {
  const [roomName, setRoomName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const roomsContext = useContext(RoomsContext);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!roomName.trim()) return;

    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: roomName.trim() }),
      });

      if (!res.ok) throw new Error("Failed to create room");

      const data = await res.json();
      roomsContext?.addRoom(data);
      setRoomName("");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form
      onSubmit={handleSubmit}
      className="flex w-full flex-col gap-4"
      aria-label="Create room form"
    >
      <div className="space-y-1">
        <Typography as="h2" variant="bodySmall">
          Create room
        </Typography>
        <Typography variant="bodySmall" className="text-neutral-500">
          Choose a name for your room.
        </Typography>
      </div>

      <Input
        id="room-name"
        name="roomName"
        placeholder="e.g. Late Night Coding"
        value={roomName}
        onChange={(e) => setRoomName(e.target.value)}
        required
        label={
          <Typography as="label" variant="bodySmall">
            Room name
          </Typography>
        }
        className="border-slate-800"
      />

      {error && (
        <Typography variant="bodySmall" className="text-red-500">
          {error}
        </Typography>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <Button
          variant="secondary"
          type="button"
          disabled={isLoading}
        >
          Cancel
        </Button>

        <Button
          variant="primary"
          type="submit"
          disabled={isLoading || !roomName.trim()}
        >
          {isLoading ? "Creating..." : "Create"}
        </Button>
      </div>
    </Form>
  );
}