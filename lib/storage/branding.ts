import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";

import { validatePhotoUpload } from "@/lib/storage/photos";

const BRANDING_DIR = path.join(process.cwd(), ".local-dev", "school-branding");

export async function storeSchoolLogo(file: File) {
  validatePhotoUpload(file.type, file.size);

  const extension = file.type.split("/")[1] || "png";
  await mkdir(BRANDING_DIR, { recursive: true });

  const entries = await readdir(BRANDING_DIR);
  await Promise.all(
    entries
      .filter((entry) => entry.startsWith("logo."))
      .map((entry) => rm(path.join(BRANDING_DIR, entry), { force: true }))
  );

  await writeFile(
    path.join(BRANDING_DIR, `logo.${extension}`),
    Buffer.from(await file.arrayBuffer())
  );

  return `/api/branding/logo?v=${Date.now()}`;
}

export async function readSchoolLogo() {
  const entries = await readdir(BRANDING_DIR);
  const fileName = entries.find((entry) => entry.startsWith("logo."));

  if (!fileName) {
    throw new Error("School logo not found.");
  }

  const extension = fileName.split(".").pop()?.toLowerCase() ?? "png";
  const contentType =
    extension === "jpg" || extension === "jpeg"
      ? "image/jpeg"
      : extension === "webp"
        ? "image/webp"
        : "image/png";

  return {
    contentType,
    fileBuffer: await readFile(path.join(BRANDING_DIR, fileName))
  };
}
