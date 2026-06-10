"use client";

import { useState, useTransition } from "react";

import { RoleCard } from "@/components/vote/role-card";

type VoteFlowProps = {
  role: {
    id: string;
    name: string;
    candidates: {
      id: string;
      name: string;
      class_name: string;
      photo_url: string;
    }[];
  };
  completedRoleIds: string[];
};

export function VoteFlow({ role, completedRoleIds }: VoteFlowProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError("");

    const response = await fetch("/api/votes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        role_id: role.id,
        candidate_id: formData.get("candidate_id")
      })
    });

    const payload = (await response.json()) as {
      message?: string;
      is_complete?: boolean;
      completed_role_ids?: string[];
    };

    if (!response.ok) {
      setError(payload.message ?? "Unable to save your vote.");
      return;
    }

    setIsSaved(true);
  }

  return (
    <form
      action={handleSubmit}
      className="space-y-6"
    >
        {isSaved ? (
          <div className="rounded-[1.5rem] border border-forest/15 bg-forest/8 px-4 py-3 text-sm font-semibold text-forest">
            Vote saved. You can close this page now.
          </div>
        ) : null}
        <RoleCard role={role} />
        <div className="flex justify-center">
          <button
            type="submit"
            disabled={isPending || isSaved}
            className="rounded-full bg-ink px-8 py-3 text-sm font-semibold text-cream transition hover:bg-forest disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "Saving..." : "Confirm vote"}
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
