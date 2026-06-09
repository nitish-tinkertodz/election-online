import { NextResponse } from "next/server";

import { getElectionStatus } from "@/lib/election/election-service";
import { getElectionAvailabilityMessage } from "@/lib/election/status";

export async function GET() {
  try {
    const status = await getElectionStatus();

    return NextResponse.json({
      status,
      message: getElectionAvailabilityMessage(status)
    });
  } catch {
    return NextResponse.json({
      status: "NOT_STARTED",
      message: "Voting has not started yet."
    });
  }
}
