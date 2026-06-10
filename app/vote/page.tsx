import { VoteFlow } from "@/components/vote/vote-flow";
import { CompletionReset } from "@/components/vote/completion-reset";
import { VoteSession } from "@/components/vote/vote-session";
import { VoteStateMessage } from "@/components/vote/vote-state-message";
import {
  getCompletedRolesFromCookie,
  getVoteSessionKey
} from "@/lib/election/session";
import { getVotingPortalState } from "@/lib/votes/vote-service";

export default async function VotePage() {
  const sessionKey = (await getVoteSessionKey()) ?? "pending-session";
  const votingState = await getVotingPortalState(sessionKey);
  const completedRoleIds = await getCompletedRolesFromCookie();

  const nextRole =
    votingState.roles.find((role) => !completedRoleIds.includes(role.id)) ?? null;
  const isComplete = nextRole === null && votingState.roles.length > 0;

  if (votingState.electionStatus === "NOT_STARTED") {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-5xl items-center justify-center px-6 py-16">
        <VoteStateMessage
          eyebrow="Voter Portal"
          title="Voting is not open yet."
          description="The ballot stays disabled until an administrator starts the election."
        />
      </main>
    );
  }

  if (votingState.electionStatus === "CLOSED") {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-5xl items-center justify-center px-6 py-16">
        <VoteStateMessage
          eyebrow="Voter Portal"
          title="Voting has been closed."
          description="This ballot is no longer accepting votes. The official results view remains restricted to admin users."
        />
      </main>
    );
  }

  if (isComplete) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-5xl items-center justify-center px-6 py-16">
        <CompletionReset />
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-16">
      <div className="grid gap-6 lg:grid-cols-[1fr_260px]">
        <div className="space-y-6">
          {nextRole ? (
            <VoteFlow
              role={nextRole}
              completedRoleIds={completedRoleIds}
            />
          ) : null}
        </div>
        <aside className="space-y-4">
          <VoteSession completedRoleIds={completedRoleIds} />
          <div className="rounded-[1.6rem] border border-ink/10 bg-white/75 p-5 shadow-card backdrop-blur">
            <p className="text-xs uppercase tracking-[0.24em] text-ink/48">
              Session scope
            </p>
            <p className="mt-3 text-sm leading-6 text-ink/68">
              This version prevents duplicate role voting only within the same browser session.
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}
