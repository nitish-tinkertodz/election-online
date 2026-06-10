import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
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

function findD1SqliteFiles(rootDir) {
  if (!existsSync(rootDir)) {
    return [];
  }

  const matches = [];
  const stack = [rootDir];

  while (stack.length > 0) {
    const current = stack.pop();
    const entries = readdirSync(current);

    for (const entry of entries) {
      const nextPath = path.join(current, entry);
      const stats = statSync(nextPath);

      if (stats.isDirectory()) {
        stack.push(nextPath);
        continue;
      }

      if (entry.endsWith(".sqlite")) {
        matches.push(nextPath);
      }
    }
  }

  return matches;
}

async function clearD1Locks() {
  const sqliteFiles = findD1SqliteFiles(path.join(repoRoot, ".wrangler", "state"));

  if (sqliteFiles.length === 0) {
    return 0;
  }

  const sqliteModule = await import("node:child_process");
  let cleared = 0;

  for (const sqlitePath of sqliteFiles) {
    try {
      sqliteModule.execFileSync(
        "sqlite3",
        [
          sqlitePath,
          "DELETE FROM settings WHERE key = 'admin_session_lock';"
        ],
        { stdio: "ignore" }
      );
      cleared += 1;
    } catch {
      // Skip files when sqlite3 is unavailable or the DB has not been initialized yet.
    }
  }

  return cleared;
}

const localCleared = clearLocalStateLock();
const d1Cleared = await clearD1Locks();

console.log(
  JSON.stringify({
    adminSessionReset: true,
    localStateCleared: localCleared,
    d1FilesTouched: d1Cleared
  })
);
