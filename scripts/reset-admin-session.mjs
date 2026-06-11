import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

function clearLocalStateLock() {
  const localStatePath = path.join(repoRoot, ".local-dev", "election-state.json");

  if (!existsSync(localStatePath)) {
    return false;
  }

  const state = JSON.parse(readFileSync(localStatePath, "utf8"));
  state.adminSessionLock = null;
  writeFileSync(localStatePath, JSON.stringify(state, null, 2));
  return true;
}

const localCleared = clearLocalStateLock();

console.log(
  JSON.stringify({
    adminSessionReset: true,
    localStateCleared: localCleared
  })
);
