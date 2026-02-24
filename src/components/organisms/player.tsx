"use client";

import { RoomContext } from "@/contexts/roomContext";
import { useSession } from "next-auth/react";
import { useContext, useEffect, useState, useRef } from "react";

export default function Player() {
  const { room, setRoom } = useContext(RoomContext)!;
  const session = useSession();

  const userId = session?.data?.user?.id;
  const { queue, playbackControllers } = room;

  const isAuthenticated = session.status === "authenticated";
  const isController =
    isAuthenticated &&
    userId != null &&
    playbackControllers.some((controller) => controller._id === userId);

  const [ytReady, setYtReady] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const playerRef = useRef<any>(null);

  // Load YouTube API for controllers only
  useEffect(() => {
    if (!isController) return;

    if (window.YT) {
      setYtReady(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    script.onload = () => console.log("🚀 ~ YT script loaded successfully");
    script.onerror = () => console.error("❌ ~ Failed to load YT script");
    document.body.appendChild(script);

    (window as any).onYouTubeIframeAPIReady = () => {
      console.log("🚀 ~ onYouTubeIframeAPIReady fired");
      setYtReady(true);
    };
  }, [isController]);

  // Initialize or update player when YT is ready and queue changes
  useEffect(() => {
    if (!queue.length || !ytReady || !isController) return;
    if (currentIndex >= queue.length) return;

    const videoId = queue[currentIndex].track.trackId;

    if (!playerRef.current) {
      playerRef.current = new window.YT.Player("yt-player", {
        height: "315",
        width: "560",
        videoId,
        events: {
          onReady: (event: any) => event.target.playVideo(),
          onStateChange: (event: any) => {
            if (event.data === window.YT.PlayerState.ENDED) {
              console.log("🚀 Video ended, moving to next track");

              // Move to next track in queue
              setCurrentIndex((prev) => {
                if (prev < queue.length - 1) {
                  return prev + 2;
                } else {
                  return 0; // loop to start
                }
              });
            }
          },
        },
        playerVars: {
          autoplay: 1,
          controls: 1,
        },
      });
    } else {
      playerRef.current.loadVideoById(videoId);
    }
  }, [queue, currentIndex, isController, ytReady]);

  if (!queue.length) return null;

  return <div id="yt-player" />;
}