import { NextResponse } from "next/server";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import { requireAdminApiAccess } from "@/lib/auth/admin";
import { updateCandidatePhotoUrl } from "@/lib/candidates/candidate-repository";
import { readLocalCandidatePhoto, storeCandidatePhoto } from "@/lib/storage/photos";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ candidateId: string }> }
) {
  const { candidateId } = await params;

  try {
    const localPhoto = await readLocalCandidatePhoto(candidateId);
    return new NextResponse(localPhoto.fileBuffer, {
      headers: {
        "Content-Type": localPhoto.contentType,
        "Cache-Control": "no-store"
      }
    });
  } catch {
    try {
      const publicFallbackPath = path.join(
        process.cwd(),
        "public",
        "local-uploads",
        "candidates",
        candidateId
      );
      const entries = await readdir(publicFallbackPath);
      const fileName = entries.find((entry) => entry.startsWith("profile."));

      if (!fileName) {
        throw new Error("Photo not found.");
      }

      const extension = fileName.split(".").pop()?.toLowerCase() ?? "jpg";
      const contentType =
        extension === "png"
          ? "image/png"
          : extension === "webp"
            ? "image/webp"
            : "image/jpeg";
      const fileBuffer = await readFile(path.join(publicFallbackPath, fileName));

      return new NextResponse(fileBuffer, {
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "no-store"
        }
      });
    } catch {
      return NextResponse.json({ message: "Photo not found." }, { status: 404 });
    }
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ candidateId: string }> }
) {
  const unauthorized = await requireAdminApiAccess();
  if (unauthorized) {
    return unauthorized;
  }

  const { candidateId } = await params;
  const formData = await request.formData();
  const photo = formData.get("photo");

  if (!(photo instanceof File)) {
    return NextResponse.json({ message: "Photo file is required." }, { status: 400 });
  }

  try {
    const result = await storeCandidatePhoto(candidateId, photo);
    await updateCandidatePhotoUrl(candidateId, result.photoUrl);

    return NextResponse.json({
      photo_url: result.photoUrl,
      storage_mode: result.storageMode
    });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Photo upload failed." },
      { status: 400 }
    );
  }
}

export async function DELETE() {
  const unauthorized = await requireAdminApiAccess();
  if (unauthorized) {
    return unauthorized;
  }

  return NextResponse.json(
    { message: "Photo removal is not implemented yet." },
    { status: 501 }
  );
}
