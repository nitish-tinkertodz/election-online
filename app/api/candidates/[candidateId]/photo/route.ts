import { NextResponse } from "next/server";

import { getBindings } from "@/lib/db/platform";
import { storeCandidatePhoto } from "@/lib/storage/photos";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ candidateId: string }> }
) {
  const { candidateId } = await params;
  const formData = await request.formData();
  const photo = formData.get("photo");

  if (!(photo instanceof File)) {
    return NextResponse.json({ message: "Photo file is required." }, { status: 400 });
  }

  try {
    const key = await storeCandidatePhoto(
      (getBindings() as typeof globalThis & {
        CANDIDATE_PHOTOS?: { put: (...args: unknown[]) => Promise<unknown> };
      }).CANDIDATE_PHOTOS,
      candidateId,
      photo
    );

    return NextResponse.json({ photo_url: key });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Photo upload failed." },
      { status: 400 }
    );
  }
}

export async function DELETE() {
  return NextResponse.json(
    { message: "Photo removal is not implemented yet." },
    { status: 501 }
  );
}
