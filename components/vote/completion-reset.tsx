"use client";

import { useEffect, useState } from "react";

import { VoteStateMessage } from "@/components/vote/vote-state-message";

const RESET_DELAY_SECONDS = 5;

export function CompletionReset() {
  const [secondsRemaining, setSecondsRemaining] = useState(RESET_DELAY_SECONDS);
  const [isResetting, setIsResetting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setSecondsRemaining((current) => {
        if (current <= 1) {
          window.clearInterval(intervalId);
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    const timeoutId = window.setTimeout(async () => {
      setIsResetting(true);

      try {
        const response = await fetch("/api/votes/session", {
          method: "DELETE"
        });

        if (!response.ok) {
          throw new Error("Unable to prepare the ballot for the next voter.");
        }

        setIsResetting(false);
        setSecondsRemaining(RESET_DELAY_SECONDS);
      } catch (caughtError) {
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Unable to prepare the ballot for the next voter."
        );
        setIsResetting(false);
      }
    }, RESET_DELAY_SECONDS * 1000);

    return () => {
      window.clearInterval(intervalId);
      window.clearTimeout(timeoutId);
    };
  }, []);

  return (
    <div className="space-y-4">
      <VoteStateMessage
        eyebrow="Voting complete"
        title="Thank you for voting."
        description={
          isResetting
            ? "Preparing the ballot for the next voter now."
            : `This voter session is complete. The ballot will reopen in ${secondsRemaining} second${secondsRemaining === 1 ? "" : "s"}.`
        }
      />
      {error ? (
        <div className="rounded-[1.25rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}
    </div>
  );
}
