"use client";

import { useState } from "react";

import { CompletionReset } from "@/components/vote/completion-reset";
import { RoleCard } from "@/components/vote/role-card";

type VoteFlowProps = {
  roles: {
    id: string;
    name: string;
    candidates: {
      id: string;
      name: string;
      class_name: string;
      photo_url: string;
    }[];
  }[];
  initialRoleId: string;
};

export function VoteFlow({
  roles,
  initialRoleId
}: VoteFlowProps) {
  const [currentRoleId, setCurrentRoleId] = useState(initialRoleId);
  const [selectedCandidateId, setSelectedCandidateId] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState("");
  const role = roles.find((item) => item.id === currentRoleId) ?? null;
  const selectedCandidate =
    role?.candidates.find((candidate) => candidate.id === selectedCandidateId) ??
    null;

  async function handleSubmit() {
    if (!role || !selectedCandidateId || isSaving) {
      return;
    }

    setError("");
    setIsSaving(true);

    try {
      const response = await fetch("/api/votes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          role_id: role.id,
          candidate_id: selectedCandidateId
        })
      });

      const payload = (await response.json()) as {
        message?: string;
        is_complete?: boolean;
        next_role_id?: string | null;
      };

      if (!response.ok) {
        setError(payload.message ?? "Unable to save your vote.");
        return;
      }

      if (payload.is_complete || !payload.next_role_id) {
        setIsComplete(true);
        return;
      }

      setCurrentRoleId(payload.next_role_id);
      setSelectedCandidateId("");
    } catch {
      setError("Unable to reach the voting server. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  if (isComplete) {
    return <CompletionReset />;
  }

  if (!role) {
    return (
      <div className="rounded-[1.25rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        The next ballot role is unavailable. Please reload the page.
      </div>
    );
  }

  return (
    <form
      action={handleSubmit}
      className="space-y-6"
    >
        <RoleCard
          role={role}
          selectedCandidateId={selectedCandidateId}
          onSelectCandidate={setSelectedCandidateId}
        />
        <div className="mx-auto flex w-full max-w-4xl flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-end sm:gap-8">
          {selectedCandidate ? (
            <p
              className="min-w-0 break-words text-center text-lg font-extrabold uppercase leading-snug tracking-wide text-forest sm:flex-1 sm:text-right sm:text-xl"
              aria-live="polite"
            >
              {selectedCandidate.name}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={isSaving || !selectedCandidateId}
            className="shrink-0 self-center rounded-full bg-ink px-8 py-3 text-sm font-semibold text-cream transition hover:bg-forest disabled:cursor-not-allowed disabled:opacity-60 sm:self-auto"
          >
            {isSaving
              ? "Saving..."
              : selectedCandidateId
                ? "Confirm vote"
                : "Select a candidate"}
          </button>
        </div>
        {error ? (
          <div className="rounded-[1.25rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}
    </form>
  );
}
