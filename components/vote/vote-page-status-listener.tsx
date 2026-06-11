"use client";

import { useEffect } from "react";

import type { ElectionStatus } from "@/lib/election/status";

type VotePageStatusListenerProps = {
  currentStatus: ElectionStatus;
};

export function VotePageStatusListener({
  currentStatus
}: VotePageStatusListenerProps) {
  useEffect(() => {
    const events = new EventSource(
      `/api/election/events?status=${encodeURIComponent(currentStatus)}`
    );

    const handleStatus = (event: MessageEvent<string>) => {
      try {
        const payload = JSON.parse(event.data) as { status?: ElectionStatus };
        if (payload.status && payload.status !== currentStatus) {
          events.close();
          window.location.reload();
        }
      } catch {
        // Ignore malformed events and let EventSource continue listening.
      }
    };

    events.addEventListener("status", handleStatus);

    return () => {
      events.removeEventListener("status", handleStatus);
      events.close();
    };
  }, [currentStatus]);

  return null;
}
