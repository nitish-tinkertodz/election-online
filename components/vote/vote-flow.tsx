"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { RoleCard } from "@/components/vote/role-card";

type VoteFlowProps = {
  role: {
    id: string;
    name: string;
    description: string;
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
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [message, setMessage] = useState(
    completedRoleIds.length > 0
      ? `${completedRoleIds.length} role votes already saved in this browser session.`
      : "Choose one candidate and confirm the vote for this role."
  );

  async function handleSubmit(formData: FormData) {
    setError("");
    setMessage("Saving vote...");

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
      setMessage("Please try again.");
      return;
    }

    setMessage(
      payload.is_complete
        ? "Thanks. Your voting session is complete."
        : "Vote saved. Loading the next role..."
    );

    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
      <form
        action={handleSubmit}
        className="space-y-6"
      >
        <RoleCard role={role} />
        <div className="flex flex-wrap items-center gap-4 rounded-[1.5rem] border border-ink/10 bg-white/70 px-5 py-4 shadow-card backdrop-blur">
          <p className="flex-1 text-sm leading-6 text-ink/68">{message}</p>
          <button
            type="submit"
            disabled={isPending}
            className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-cream transition hover:bg-forest disabled:cursor-not-allowed disabled:opacity-60"
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
      <aside className="space-y-4">
        <div className="rounded-[1.6rem] border border-ink/10 bg-white/75 p-5 shadow-card backdrop-blur">
          <p className="text-xs uppercase tracking-[0.24em] text-ink/48">
            Voting rule
          </p>
          <p className="mt-3 text-sm leading-6 text-ink/68">
            Only one candidate can be confirmed for this role in the current browser session.
          </p>
        </div>
        <div className="rounded-[1.6rem] border border-ink/10 bg-white/75 p-5 shadow-card backdrop-blur">
          <p className="text-xs uppercase tracking-[0.24em] text-ink/48">
            Progress
          </p>
          <p className="mt-3 text-sm leading-6 text-ink/68">
            Completed roles are remembered across refreshes and tabs until the browser is closed.
          </p>
        </div>
      </aside>
    </div>
  );
}
