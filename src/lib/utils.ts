import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isValidSource(uri: string): boolean {
  const VALID_SOURCES = [
    "youtube.com",
    "www.youtube.com",
    "music.youtube.com",
    "youtu.be",
  ];

  const VIDEO_ID_LENGTH = 11;
  try {
    const url = new URL(uri.trim());

    if (!VALID_SOURCES.includes(url.hostname)) return false;

    if (url.hostname === "youtu.be" || url.pathname === "/watch") {
      const videoId =
        url.hostname === "youtu.be"
          ? url.pathname.slice(1)
          : url.searchParams.get("v");
      return !!videoId && videoId.length === VIDEO_ID_LENGTH;
    }

    if (url.pathname === "/playlist") {
      return !!url.searchParams.get("list");
    }

    return false;
  } catch {
    return false;
  }
}
