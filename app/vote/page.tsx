import { VoteFlow } from "@/components/vote/vote-flow";
import { VotePageAutoRefresh } from "@/components/vote/vote-page-auto-refresh";
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

  if (votingState.electionStatus === "NOT_STARTED") {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-5xl items-center justify-center px-6 py-16">
        <VotePageAutoRefresh />
        <VoteStateMessage
          eyebrow="Voter Portal"
          title="Voting is not open yet."
          description="The ballot stays disabled until an administrator starts the election."
        />
      </main>
    );
  }

  if (votingState.electionStatus === "CLOSED") {
    const description = votingState.hasReadyBallot
      ? "This ballot is no longer accepting votes. The official results view remains restricted to admin users."
      : "No candidate details are available yet. The ballot will stay closed until an administrator finishes setup and opens voting.";

    return (
      <main className="mx-auto flex min-h-screen w-full max-w-5xl items-center justify-center px-6 py-16">
        <VotePageAutoRefresh />
        <VoteStateMessage
          eyebrow="Voter Portal"
          title={votingState.hasReadyBallot ? "Voting has been closed." : "Ballot setup is still in progress."}
          description={description}
        />
      </main>
    );
  }

  const nextEligibleRole =
    votingState.roles.find((role) => !completedRoleIds.includes(role.id)) ?? null;

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-16">
      <VotePageAutoRefresh />
      {nextEligibleRole ? (
        <VoteFlow role={nextEligibleRole} completedRoleIds={completedRoleIds} />
      ) : (
        <VoteStateMessage
          eyebrow="Voter Portal"
          title="No ballot is available."
          description="Please ask the administrator to open a ballot with candidate details."
        />
      )}
    </main>
  );
}
