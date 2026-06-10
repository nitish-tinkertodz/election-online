"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { RoleCard } from "@/components/vote/role-card";

type VoteFlowProps = {
  role: {
    id: string;
    name: string;
    is_class_leader?: boolean | number;
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

    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <form
      action={handleSubmit}
      className="space-y-6"
    >
        {Boolean(role.is_class_leader) ? (
          <div className="rounded-[1.5rem] border border-forest/15 bg-forest/8 px-4 py-3 text-sm font-semibold text-forest">
            This is a class leader ballot. Please vote only if this role matches your class.
          </div>
        ) : null}
        <RoleCard role={role} />
        <div className="flex justify-center">
          <button
            type="submit"
            disabled={isPending}
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
