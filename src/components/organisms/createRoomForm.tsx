"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button, Input, Typography } from "@/components/atoms";
import { Form } from "@/components/molecules";

export default function CreateRoomForm() {
  const router = useRouter();

  const [roomName, setRoomName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    try {
      const res = await fetch("/api/rooms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: roomName }),
      });

      if (!res.ok) {
        throw new Error("Failed to create room");
      }

      const data = await res.json();

      router.push(`/rooms/${data.roomId}`);
    } catch {
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <Form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-md"
      aria-label="Create room form"
    >
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
      />

      {error && (
        <Typography variant="bodySmall" className="text-red-400">
          {error}
        </Typography>
      )}

        <div className="mt-4 flex justify-end space-x-4">
          <Button variant="secondary" type="button">Close</Button>
          <Button variant="primary" type="submit">Create</Button>
        </div>
    </Form>
  );
}
