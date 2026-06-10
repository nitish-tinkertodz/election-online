"use client";

import { useEffect } from "react";

const REFRESH_INTERVAL_MS = 3000;

export function VotePageAutoRefresh() {
  useEffect(() => {
    const intervalId = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        window.location.reload();
      }
    }, REFRESH_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  return null;
}
