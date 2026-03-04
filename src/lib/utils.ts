import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isValidSource(uri: string): boolean {
  try {
    const url = new URL(uri.trim());

    const allowedHosts = ["www.youtube.com", "youtube.com", "youtu.be"];
    if (!allowedHosts.includes(url.hostname)) {
      return false;
    }

    let videoId: string | null = null;

    if (url.hostname === "youtu.be") {
      videoId = url.pathname.slice(1);
    } else if (url.hostname.includes("youtube.com")) {
      videoId = url.searchParams.get("v");
    }

    if (!videoId || videoId.length !== 11) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}