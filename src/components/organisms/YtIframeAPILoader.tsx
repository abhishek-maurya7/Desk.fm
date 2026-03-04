"use client";

import Script from "next/script";

export default function YtIframeApiProvider() {
  return (
    <Script
      src="https://www.youtube.com/iframe_api"
      strategy="beforeInteractive"
      onLoad={() => {
        console.log("YouTube Iframe API loaded");
      }}
    />
  );
}