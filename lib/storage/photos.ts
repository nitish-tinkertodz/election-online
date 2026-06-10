import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { photoUploadSchema } from "@/lib/validation";

type R2BucketLike = {
  put: (key: string, value: ArrayBuffer, options?: { httpMetadata?: { contentType?: string } }) => Promise<unknown>;
};

export function buildCandidatePhotoKey(candidateId: string, extension: string) {
  return `candidates/${candidateId}/profile.${extension}`;
}

export function buildLocalPhotoPlaceholder(candidateId: string, extension: string) {
  void extension;
  return `/api/candidates/${candidateId}/photo`;
}

function getLocalCandidatePhotoDir(candidateId: string) {
  return path.join(process.cwd(), ".local-dev", "candidate-photos", candidateId);
}

export async function readLocalCandidatePhoto(candidateId: string) {
  const directory = getLocalCandidatePhotoDir(candidateId);
  const entries = await readdir(directory);
  const fileName = entries.find((entry) => entry.startsWith("profile."));

  if (!fileName) {
    throw new Error("Photo not found.");
  }

  const absolutePath = path.join(directory, fileName);
  const fileBuffer = await readFile(absolutePath);
  const extension = fileName.split(".").pop()?.toLowerCase() ?? "jpg";
  const contentType =
    extension === "png"
      ? "image/png"
      : extension === "webp"
        ? "image/webp"
        : "image/jpeg";

  return {
    fileBuffer,
    contentType
  };
}

export function validatePhotoUpload(contentType: string, sizeInBytes: number) {
  const parsed = photoUploadSchema.parse({ contentType, sizeInBytes });
  const allowed = ["image/jpeg", "image/png", "image/webp"];

  if (!allowed.includes(parsed.contentType)) {
    throw new Error("Unsupported image type.");
  }

  return parsed;
}

export async function storeCandidatePhoto(
  bucket: R2BucketLike | undefined,
  candidateId: string,
  file: File
) {
  validatePhotoUpload(file.type, file.size);

  const extension = file.type.split("/")[1] || "jpg";
  const key = buildCandidatePhotoKey(candidateId, extension);

  if (!bucket) {
    const absoluteDir = getLocalCandidatePhotoDir(candidateId);
    const absolutePath = path.join(absoluteDir, `profile.${extension}`);
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    await mkdir(absoluteDir, { recursive: true });
    await writeFile(absolutePath, fileBuffer);

    return {
      photoUrl: buildLocalPhotoPlaceholder(candidateId, extension),
      storageMode: "local"
    } as const;
  }

  const fileBuffer = await file.arrayBuffer();

  await bucket.put(key, fileBuffer, {
    httpMetadata: {
      contentType: file.type
    }
  });

  return {
    photoUrl: key,
    storageMode: "r2"
  } as const;
}
