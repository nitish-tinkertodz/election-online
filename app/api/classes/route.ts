import { NextResponse } from "next/server";

import { requireAdminApiAccess } from "@/lib/auth/admin";
import { listClasses } from "@/lib/classes/class-repository";

export async function GET() {
  try {
    const unauthorized = await requireAdminApiAccess();
    if (unauthorized) {
      return unauthorized;
    }

    return NextResponse.json({ items: await listClasses() });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unable to list classes." },
      { status: 503 }
    );
  }
}

