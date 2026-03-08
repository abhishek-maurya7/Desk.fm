"use client";

import { useContext, useState } from "react";
import { Form } from "@/components/molecules";
import { Input } from "@/components/atoms";
import { isValidSource } from "@/lib/utils";
import { QueueItem, RoomContext } from "@/contexts/roomContext";
import { PartyKitContext } from "@/contexts/partykitContext";

export default function AddTrackToQueueForm({ roomId }: { roomId: string }) {
  const [trackUrl, setTrackUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const { setRoom } = useContext(RoomContext)!;
  const partykit = useContext(PartyKitContext);

  const handleAddToQueue = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!trackUrl.trim()) {
      setFormError("Please enter a valid track URL.");
      return;
    }

    if (!isValidSource(trackUrl)) {
      setFormError("Invalid URL. Please provide a valid YouTube link.");
      return;
    }

    setFormError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId,
          uri: trackUrl.trim(),
          senderConnectionId: partykit.connectionId,
        }),
      });

      if (!response.ok) throw new Error("Failed to add track to the queue");

      const data = await response.json();

      const newItem: QueueItem = {
        ...data,
        addedAt: new Date(data.addedAt),
        status: "queued",
      };

      setRoom((prev) => {
        const exists = prev.queue.some((q) => q._id === newItem._id);
        if (exists) return prev;
        return {
          ...prev,
          queue: [...prev.queue, newItem].sort(
            (a, b) => a.position - b.position,
          ),
        };
      });

      setTrackUrl("");
    } catch (error) {
      console.error(error);
      setFormError(
        "An error occurred while adding the track. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form onSubmit={handleAddToQueue} className="space-y-4">
      <div className="flex justify-end items-end gap-4">
        <Input
          type="text"
          id="trackUrl"
          placeholder="YouTube link ..."
          value={trackUrl}
          onChange={(e) => setTrackUrl(e.target.value)}
          aria-invalid={formError ? "true" : "false"}
          className="w-full md:w-1/3"
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium whitespace-nowrap transition-colors"
        >
          {isSubmitting ? "Adding..." : "Add to Queue"}
        </button>
      </div>

      {formError && (
        <p className="text-sm text-red-500 font-medium">{formError}</p>
      )}
    </Form>
  );
}
