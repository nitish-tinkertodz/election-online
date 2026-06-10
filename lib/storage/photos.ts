import { photoUploadSchema } from "@/lib/validation";

type R2BucketLike = {
  put: (key: string, value: ArrayBuffer, options?: { httpMetadata?: { contentType?: string } }) => Promise<unknown>;
};

export function buildCandidatePhotoKey(candidateId: string, extension: string) {
  return `candidates/${candidateId}/profile.${extension}`;
}

export function buildLocalPhotoPlaceholder(candidateId: string, extension: string) {
  return `/mock-uploads/${candidateId}.${extension}`;
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
    return {
      photoUrl: buildLocalPhotoPlaceholder(candidateId, extension),
      storageMode: "mock"
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
