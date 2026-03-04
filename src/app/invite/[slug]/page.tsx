"use client";

import { Button } from "@/components/atoms";
import { useParams, useRouter } from "next/navigation";

export default function InvitePage() {
  const { slug } = useParams();
  const router = useRouter();

  const joinRoom = () => {
    if (!slug) return;

    fetch(`/api/invite/${slug}`, { method: "POST" })
      .then(() => router.push(`/rooms/${slug}`))
      .catch(console.error);
  };

  if (!slug) return <p>Invalid invite link.</p>;

  return (
    <div className="p-4">
      <Button onClick={joinRoom}>Join Room</Button>
    </div>
  );
}
