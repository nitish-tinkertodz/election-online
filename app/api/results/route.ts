import { NextResponse } from "next/server";

import { buildFinalResultsSnapshot } from "@/lib/results/finalize-election";

export async function GET() {
  try {
    const snapshot = await buildFinalResultsSnapshot();
    return NextResponse.json({
      roles: snapshot.roles,
      mode: "live",
      summary: snapshot.summary
    });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unable to load results." },
      { status: 503 }
    );
  }
}
