"use client";

import { useState } from "react";
import { Form } from "@/components/molecules";
import { Input } from "@/components/atoms";

export default function AddTrackToQueueForm({ roomId }: { roomId: string }) {
  const [trackUrl, setTrackUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValidUrl = (url: string) =>
    /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/i.test(url);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!trackUrl.trim()) {
      setError("Please enter a valid track URL.");
      return;
    }

    if (!isValidUrl(trackUrl)) {
      setError("Invalid URL. Please provide a valid YouTube link.");
      return;
    }

    setError(null);

    try {
      setLoading(true);

      const res = await fetch("/api/queue", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ roomId, uri: trackUrl }),
      });

      if (!res.ok) {
        throw new Error("Failed to add track to the queue.");
      }

      setTrackUrl("");
    } catch (err) {
      console.error(err);
      setError("An error occurred while adding the track. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="trackUrl" className="text-sm font-medium text-zinc-300">
          Add a YouTube Track
        </label>

        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <div className="flex-1 w-full">
            <Input
              type="text"
              id="trackUrl"
              placeholder="https://youtube.com/..."
              value={trackUrl}
              onChange={(e) => setTrackUrl(e.target.value)}
              aria-invalid={error ? "true" : "false"}
              className="w-full"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium whitespace-nowrap"
          >
            {loading ? "Adding..." : "Add to Queue"}
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
    </Form>
  );
}
