"use client";

import { useState } from "react";
import { Button, Typography } from "@/components/atoms";
import { Copy } from "lucide-react";

interface RoomInviteSectionProps {
  roomId?: string;
}

export default function RoomInviteSection({ roomId }: RoomInviteSectionProps) {
  const [copied, setCopied] = useState(false);

  if (!roomId) return null;

  const handleCopy = async () => {
    const inviteUrl = `${location.origin}/invite/${roomId}`;

    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to copy invite link:", error);
    }
  };

  return (
    <div className="flex items-center justify-end py-4">
        <Button
          variant="secondary"
          aria-label="Copy invite link"
          onClick={handleCopy}
          startIcon={<Copy className="w-4 h-4" />}
        >
          <Typography variant="bodySmall">
            {copied ? "Invite Copied!" : "Invite Members"}
          </Typography>
        </Button>
    </div>
  );
}
