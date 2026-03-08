"use client";

import { Button } from "@/components/atoms";
import { useParams, useRouter } from "next/navigation";

export default function InvitePage() {
  const params = useParams();
  const router = useRouter();

  const slug = params?.slug as string | undefined;

  const joinRoom = async () => {
    if (!slug) return;

    try {
      const response = await fetch(`/api/invite/${slug}`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to join room");
      }

      router.push(`/rooms/${slug}`);
    } catch (error) {
      console.error("Join room failed:", error);
    }
  };

  if (!slug) {
    return <p className="p-4">Invalid invite link.</p>;
  }

  return (
    <div className="p-4">
      <Button onClick={joinRoom}>Join Room</Button>
    </div>
  );
}