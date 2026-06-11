import { VoteFlow } from "@/components/vote/vote-flow";
import { CompletionReset } from "@/components/vote/completion-reset";
import { VotePageStatusListener } from "@/components/vote/vote-page-status-listener";
import { VoteStateMessage } from "@/components/vote/vote-state-message";
import { SchoolBrand } from "@/components/shared/school-brand";
import { getLocalBranding } from "@/lib/election/local-store";
import {
  getVoteSessionKey
} from "@/lib/election/session";
import { getVotingPortalState } from "@/lib/votes/vote-service";

export default async function VotePage() {
  const sessionKey = (await getVoteSessionKey()) ?? "pending-session";
  const [votingState, branding] = await Promise.all([
    getVotingPortalState(sessionKey),
    getLocalBranding()
  ]);
  const completedRoleIds = votingState.completedRoleIds;

  const nextRole =
    votingState.roles.find((role) => !completedRoleIds.includes(role.id)) ?? null;
  const isComplete = nextRole === null && votingState.roles.length > 0;

  if (votingState.electionStatus === "NOT_STARTED") {
    return (
      <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-8">
        <VotePageStatusListener currentStatus={votingState.electionStatus} />
        <SchoolBrand schoolName={branding.school_name} logoUrl={branding.school_logo_url} />
        <div className="mt-16">
          <VoteStateMessage
            eyebrow="Voter Portal"
            title="Voting is not open yet."
            description="The ballot stays disabled until an administrator starts the election."
          />
        </div>
      </main>
    );
  }

  if (votingState.electionStatus === "CLOSED") {
    const description = votingState.hasReadyBallot
      ? "This ballot is no longer accepting votes. The official results view remains restricted to admin users."
      : "No candidate details are available yet. The ballot will stay closed until an administrator finishes setup and opens voting.";

    return (
      <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-8">
        <VotePageStatusListener currentStatus={votingState.electionStatus} />
        <SchoolBrand schoolName={branding.school_name} logoUrl={branding.school_logo_url} />
        <div className="mt-16">
          <VoteStateMessage
            eyebrow="Voter Portal"
            title={votingState.hasReadyBallot ? "Voting has been closed." : "Ballot setup is still in progress."}
            description={description}
          />
        </div>
      </main>
    );
  }

  if (isComplete) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-8">
        <VotePageStatusListener currentStatus={votingState.electionStatus} />
        <SchoolBrand schoolName={branding.school_name} logoUrl={branding.school_logo_url} />
        <div className="mt-16">
          <CompletionReset />
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-8">
      <VotePageStatusListener currentStatus={votingState.electionStatus} />
      <SchoolBrand schoolName={branding.school_name} logoUrl={branding.school_logo_url} />
      <div className="mt-8">
      {nextRole ? (
        <VoteFlow
          roles={votingState.roles}
          initialRoleId={nextRole.id}
        />
      ) : null}
      </div>
    </main>
  );
}
