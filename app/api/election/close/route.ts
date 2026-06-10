import { NextResponse } from "next/server";

import { requireAdminApiAccess } from "@/lib/auth/admin";
import { closeElection } from "@/lib/election/election-service";

export async function POST() {
  try {
    const unauthorized = await requireAdminApiAccess();
    if (unauthorized) {
      return unauthorized;
    }

    return NextResponse.json(await closeElection());
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unable to close election." },
      { status: 400 }
    );
  }
}
