"use client";

import { RoomContext } from "@/contexts/roomContext";
import { useSession } from "next-auth/react";
import { useContext, useEffect, useState, useRef } from "react";

export default function Player() {
  const { room } = useContext(RoomContext)!;
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

  useEffect(() => {
    if (!isController) return;

    if (window.YT) {
      setYtReady(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    document.body.appendChild(script);

    (window as any).onYouTubeIframeAPIReady = () => {
      setYtReady(true);
    };
  }, [isController]);

  // Initialize / update player
  useEffect(() => {
    if (!queue.length || !ytReady || !isController) return;
    if (currentIndex >= queue.length) return;

    const videoId = queue[currentIndex].track.trackId;

    if (!playerRef.current) {
      playerRef.current = new window.YT.Player("yt-player", {
        width: "100%",
        height: "100%",
        videoId,
        events: {
          onReady: (event: any) => event.target.playVideo(),
          onStateChange: (event: any) => {
            if (event.data === window.YT.PlayerState.ENDED) {
              setCurrentIndex((prev) =>
                prev < queue.length - 1 ? prev + 1 : 0,
              );
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

  return <div id="yt-player" className="absolute inset-0" />;
}