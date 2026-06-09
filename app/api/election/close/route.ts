import { NextResponse } from "next/server";

import { closeElection } from "@/lib/election/election-service";

export async function POST() {
  try {
    return NextResponse.json(await closeElection());
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unable to close election." },
      { status: 400 }
    );
  }
}
