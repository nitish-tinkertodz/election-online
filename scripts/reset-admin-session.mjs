import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const retryDelaysMs = [0, 15, 40, 100, 200];

function wait(delayMs) {
  return new Promise((resolve) => setTimeout(resolve, delayMs));
}

async function readStateWithRetry(localStatePath) {
  let lastError;

  for (const delayMs of retryDelaysMs) {
    if (delayMs > 0) {
      await wait(delayMs);
    }

    try {
      const raw = await readFile(localStatePath, "utf8");
      return JSON.parse(raw.replace(/^\uFEFF/, ""));
    } catch (error) {
      lastError = error;
    }
  }

  throw new Error(
    `Unable to read a valid election state after ${retryDelaysMs.length} attempts.`,
    { cause: lastError }
  );
}

async function clearLocalStateLock() {
  const localStatePath = path.join(repoRoot, ".local-dev", "election-state.json");

  try {
    await stat(localStatePath);
  } catch (error) {
    if (error && typeof error === "object" && error.code === "ENOENT") {
      return false;
    }

    throw error;
  }

  const state = await readStateWithRetry(localStatePath);
  if (state.adminSessionLock === null) {
    return false;
  }

  state.adminSessionLock = null;
  await mkdir(path.dirname(localStatePath), { recursive: true });

  const temporaryPath = `${localStatePath}.${process.pid}.${randomUUID()}.tmp`;
  await writeFile(temporaryPath, JSON.stringify(state, null, 2), "utf8");
  await rename(temporaryPath, localStatePath);
  return true;
}

const localCleared = await clearLocalStateLock();

console.log(
  JSON.stringify({
    adminSessionReset: true,
    localStateCleared: localCleared
  })
);
