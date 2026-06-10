export type RankingCandidateInput = {
  candidate_id: string;
  candidate_name: string;
  class_name: string;
  photo_url?: string;
  vote_count: number;
};

export function rankCandidates<T extends RankingCandidateInput>(candidates: T[]) {
  const sorted = [...candidates].sort((left, right) => {
    if (right.vote_count !== left.vote_count) {
      return right.vote_count - left.vote_count;
    }

    return left.candidate_name.localeCompare(right.candidate_name);
  });

  let previousVoteCount: number | null = null;
  let previousRank = 0;

  const rankedCandidates = sorted.map((candidate, index) => {
    const rank =
      previousVoteCount === candidate.vote_count ? previousRank : index + 1;

    previousVoteCount = candidate.vote_count;
    previousRank = rank;

    return {
      ...candidate,
      rank
    };
  });

  const topVoteCount = rankedCandidates[0]?.vote_count ?? 0;
  const leaders = rankedCandidates.filter(
    (candidate) => candidate.vote_count === topVoteCount
  );
  const isTie = topVoteCount > 0 && leaders.length > 1;
  const winnerCandidateId =
    !isTie && topVoteCount > 0 ? leaders[0]?.candidate_id ?? null : null;

  return {
    rankedCandidates: rankedCandidates.map((candidate) => ({
      ...candidate,
      is_winner: winnerCandidateId === candidate.candidate_id
    })),
    topVoteCount,
    isTie,
    winnerCandidateId
  };
}
