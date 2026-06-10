import { NextResponse } from "next/server";

import { isAdminAuthenticated } from "@/lib/auth/admin";
import { getElectionStatus } from "@/lib/election/election-service";
import {
  buildLiveResultsSnapshot,
  getOfficialResultsSnapshot
} from "@/lib/results/live-results";

export async function GET() {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const electionStatus = await getElectionStatus();

    if (electionStatus === "OPEN") {
      const snapshot = await buildLiveResultsSnapshot();

      return NextResponse.json(
        {
          mode: "live",
          electionStatus: snapshot.election_status,
          generatedAt: snapshot.generated_at,
          closedAt: snapshot.closed_at,
          summary: snapshot.summary,
          roles: snapshot.roles
        }
      );
    }

    if (electionStatus !== "CLOSED") {
      return NextResponse.json(
        {
          mode: "pending",
          electionStatus,
          message: "Results will be available once the election is opened."
        },
        { status: 409 }
      );
    }

    const snapshot = await getOfficialResultsSnapshot();

    if (!snapshot) {
      return NextResponse.json(
        { message: "Official results are not available yet." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      mode: "official",
      electionStatus,
      generatedAt: snapshot.generated_at,
      closedAt: snapshot.closed_at,
      summary: snapshot.summary,
      roles: snapshot.roles
    });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unable to load results." },
      { status: 503 }
    );
  }
}
