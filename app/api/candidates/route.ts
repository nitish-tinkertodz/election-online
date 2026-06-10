import { NextResponse } from "next/server";

import { requireAdminApiAccess } from "@/lib/auth/admin";
import {
  createCandidate,
  listCandidates,
  updateCandidate
} from "@/lib/candidates/candidate-repository";

export async function GET() {
  try {
    const unauthorized = await requireAdminApiAccess();
    if (unauthorized) {
      return unauthorized;
    }

    return NextResponse.json({ items: await listCandidates() });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unable to list candidates." },
      { status: 503 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const unauthorized = await requireAdminApiAccess();
    if (unauthorized) {
      return unauthorized;
    }

    const payload = await request.json();
    const candidate = await createCandidate(payload);
    return NextResponse.json({ item: candidate }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unable to create candidate." },
      { status: 400 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const unauthorized = await requireAdminApiAccess();
    if (unauthorized) {
      return unauthorized;
    }

    const payload = await request.json();
    const { id, ...input } = payload as { id?: string } & Parameters<typeof createCandidate>[0];

    if (!id) {
      return NextResponse.json(
        { message: "Candidate id is required for updates." },
        { status: 400 }
      );
    }

    const candidate = await updateCandidate(id, input);
    return NextResponse.json({ item: candidate });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unable to update candidate." },
      { status: 400 }
    );
  }
}
