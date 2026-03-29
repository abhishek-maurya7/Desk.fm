import { headers } from "next/headers";

interface MediaInfo {
  id: string;
  provider: "youtube";
  type: "video" | "playlist";
}

export async function getBaseUrl() {
  try {
    const headersList = await headers();
    const host = headersList.get("host");
    
    if (!host) {
      throw new Error("Host is missing in headers");
    }

    const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
    const baseUrl = `${protocol}://${host}`;
    return baseUrl;
  } catch {
    return null;
  }
}

const VALID_SOURCES = [
  "youtube.com",
  "www.youtube.com",
  "music.youtube.com",
  "youtu.be",
];

export function extractMediaInfo(uri: string): MediaInfo | null {
  try {
    const url = new URL(uri.trim());
    if (!VALID_SOURCES.includes(url.hostname)) return null;

    if (url.hostname === "youtu.be" || url.pathname === "/watch") {
      const id = url.hostname === "youtu.be"
        ? url.pathname.slice(1)
        : url.searchParams.get("v");
      if (!id) return null;
      return { id, type: "video", provider: "youtube" };
    }

    if (url.pathname === "/playlist") {
      const id = url.searchParams.get("list");
      if (!id) return null;
      return { id, type: "playlist", provider: "youtube" };
    }

    return null;
  } catch {
    return null;
  }
}

export async function fetchYouTubeVideoInfo(videoId: string) {
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    throw new Error("YouTube API key is missing. Please set the API key in the environment variables.");
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoId}&key=${apiKey}`
    );

    if (!response.ok) {
      throw new Error(`YouTube API request failed with status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      throw new Error("Video not found");
    }

    const thumbnail = data.items[0].snippet.thumbnails?.maxres?.url || data.items[0].snippet.thumbnails?.high?.url || data.items[0].snippet.thumbnails?.medium?.url || data.items[0].snippet.thumbnails?.default?.url;

    return {
      trackId: data.items[0].id,
      title: data.items[0].snippet.title,
      publisher: data.items[0].snippet.channelTitle,
      thumbnail: thumbnail,
      provider: "youtube"
    };

  } catch (error) {
    console.error("Error fetching YouTube metadata:", error);
    throw new Error("Failed to fetch YouTube metadata");
  }
}
