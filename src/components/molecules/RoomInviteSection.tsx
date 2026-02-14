"use client";

import { useState } from "react";
import { Button, Typography } from "@/components/atoms";

interface RoomInviteSectionProps {
  inviteUrl?: string;
}

export default function RoomInviteSection({
  inviteUrl,
}: RoomInviteSectionProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      const url =
        inviteUrl ?? (typeof window !== "undefined" ? window.location.href : "");

      if (!url) return;

      await navigator.clipboard.writeText(url);

      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="flex items-center justify-between p-4">
      <Typography variant="bodySmall" className="text-gray-300">
        Invite others to this room
      </Typography>

      <Button
        variant="secondary"
        onClick={handleCopy}
        aria-label="Copy invite link"
      >
        {copied ? "Copied ✓" : "Copy Invite"}
      </Button>
    </div>
  );
}
