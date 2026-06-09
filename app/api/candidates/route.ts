import { NextResponse } from "next/server";

import { createCandidate, listCandidates } from "@/lib/candidates/candidate-repository";

export async function GET() {
  try {
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
