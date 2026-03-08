"use client";

import { PartyKitContext } from "@/contexts/partykitContext";
import { QueueItem, RoomContext } from "@/contexts/roomContext";
import { useSession } from "next-auth/react";
import { useContext, useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
  }
}

export default function Player() {
  const { room, setRoom } = useContext(RoomContext)!;
  const session = useSession();

  const userId = session?.data?.user?.id;
  const { queue, playbackControllers } = room;

  const isAuthenticated = session.status === "authenticated";
  const isController =
    isAuthenticated &&
    userId != null &&
    playbackControllers.some((c) => c._id === userId);

  const [ytReady, setYtReady] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);

  const partykit = useContext(PartyKitContext);

  const playerRef = useRef<YT.Player | null>(null);
  const queueRef = useRef(queue);
  const isProcessingRef = useRef(false);

  const connectionIdRef = useRef<string | null>(null);

  const currentTrackIdRef = useRef<string | null>(null);

  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);

  useEffect(() => {
    connectionIdRef.current = partykit?.connectionId ?? null;
  }, [partykit?.connectionId]);

  useEffect(() => {
    if (!isController) return;

    if (window.YT && window.YT.Player) {
      setYtReady(true);
      return;
    }

    const existingScript = document.querySelector(
      'script[src="https://www.youtube.com/iframe_api"]',
    );

    if (!existingScript) {
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      script.async = true;
      document.body.appendChild(script);
    }

    window.onYouTubeIframeAPIReady = () => {
      setYtReady(true);
    };
  }, [isController]);

  const markAsPlayedAndRemove = async (track?: QueueItem) => {
    if (!track || isProcessingRef.current) return;

    isProcessingRef.current = true;

    try {
      const res = await fetch("/api/queue", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          queueId: track._id,
          roomId: room._id,
          status: "played",
          senderConnectionId: connectionIdRef.current,
        }),
      });

      const data = await res.json();

      if (!data?.queueId) return;

      setRoom((prev) => ({
        ...prev,
        queue: prev.queue.filter((q) => q._id !== data.queueId),
      }));
    } catch (err) {
      console.error("Queue update failed:", err);
    } finally {
      isProcessingRef.current = false;
    }
  };

  useEffect(() => {
    if (!ytReady || !isController) return;
    if (playerRef.current) return;

    const player = new window.YT.Player("yt-player", {
      width: "100%",
      height: "100%",
      playerVars: {
        autoplay: 1,
        controls: 1,
        modestbranding: 1,
        rel: 1,
        iv_load_policy: 3,
      },
      events: {
        onReady: () => {
          playerRef.current = player;
          setPlayerReady(true);
        },
        onStateChange: async (event) => {
          if (event.data === window.YT.PlayerState.ENDED) {
            const currentTrack = queueRef.current[0];
            await markAsPlayedAndRemove(currentTrack);
          }
        },
        onError: async (event) => {
          if ([100, 101, 150].includes(event.data)) {
            const currentTrack = queueRef.current[0];
            await markAsPlayedAndRemove(currentTrack);
          }
        },
      },
    });

    return () => {
      playerRef.current?.destroy();
      playerRef.current = null;
      setPlayerReady(false);
    };
  }, [ytReady, isController]);

  useEffect(() => {
    if (!playerReady) return;
    if (!playerRef.current) return;
    if (queue.length === 0) return;

    const nextTrackId = queue[0].track.trackId;

    if (currentTrackIdRef.current === nextTrackId) return;

    currentTrackIdRef.current = nextTrackId;

    playerRef.current.loadVideoById(nextTrackId);
  }, [queue, playerReady]);

  if (!isController) return null;

  return (
    <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-lg">
      <div id="yt-player" className="absolute inset-0" />
    </div>
  );
}