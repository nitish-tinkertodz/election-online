"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import type { ElectionStatus } from "@/lib/election/status";

type VotePageStatusListenerProps = {
  currentStatus: ElectionStatus;
};

export function VotePageStatusListener({
  currentStatus
}: VotePageStatusListenerProps) {
  const router = useRouter();

  useEffect(() => {
    const events = new EventSource(
      `/api/election/events?status=${encodeURIComponent(currentStatus)}`
    );

    const handleStatus = (event: MessageEvent<string>) => {
      const payload = JSON.parse(event.data) as { status?: ElectionStatus };
      if (payload.status && payload.status !== currentStatus) {
        events.close();
        router.refresh();
      }
    };

    events.addEventListener("status", handleStatus);

    return () => {
      events.removeEventListener("status", handleStatus);
      events.close();
    };
  }, [currentStatus, router]);

  return null;
}
