"use client";

import { useEffect, useState } from "react";

type VoteSessionProps = {
  completedRoleIds: string[];
};

export function VoteSession({ completedRoleIds }: VoteSessionProps) {
  const [count, setCount] = useState(completedRoleIds.length);

  useEffect(() => {
    setCount(completedRoleIds.length);
  }, [completedRoleIds]);

  return (
    <div className="rounded-[1.6rem] border border-ink/10 bg-white/75 p-5 shadow-card backdrop-blur">
      <p className="text-xs uppercase tracking-[0.24em] text-ink/48">
        Current session
      </p>
      <p className="mt-3 font-display text-3xl text-ink">{count}</p>
      <p className="mt-2 text-sm leading-6 text-ink/68">
        role{count === 1 ? "" : "s"} completed in this browser session.
      </p>
    </div>
  );
}
