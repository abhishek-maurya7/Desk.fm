"use client";

import { useState } from "react";
import { Form } from "@/components/molecules";
import { Input } from "@/components/atoms";

export default function AddTrackToQueueForm({
  roomId,
}: {
  roomId: string;
}) {
  const [trackUrl, setTrackUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValidUrl = (url: string) =>
    /^(https:\/\/(www\.)?(youtube|youtu\.be)\.com\/)/.test(url);

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
    <div>
      <Form onSubmit={handleSubmit}>
        <Input
          type="text"
          id="trackUrl"
          placeholder="Paste YouTube link"
          value={trackUrl}
          onChange={(e) => setTrackUrl(e.target.value)}
          aria-invalid={error ? "true" : "false"}
        />
        <button type="submit" disabled={loading}>
          {loading ? (
            <span>Adding...</span>
          ) : (
            "Add to Queue"
          )}
        </button>
      </Form>

      {error && <div className="error-message">{error}</div>}
    </div>
  );
}
