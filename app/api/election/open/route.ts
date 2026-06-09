import { NextResponse } from "next/server";

import { openElection } from "@/lib/election/election-service";

export async function POST() {
  try {
    return NextResponse.json(await openElection());
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unable to open election." },
      { status: 400 }
    );
  }
}
