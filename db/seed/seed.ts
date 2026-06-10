import { execFileSync } from "node:child_process";

const now = new Date().toISOString();

const seedSql = `
INSERT OR IGNORE INTO elections (id, status, created_at, updated_at)
VALUES ('default-election', 'NOT_STARTED', '${now}', '${now}');

INSERT OR IGNORE INTO classes (id, name, display_order, status, created_at, updated_at)
VALUES ('class-1', 'Class 1', 1, 'Active', '${now}', '${now}');

INSERT OR IGNORE INTO divisions (id, class_id, name, display_order, status, created_at, updated_at)
VALUES ('division-a', 'class-1', 'Division A', 1, 'Active', '${now}', '${now}');

INSERT OR IGNORE INTO students (id, name, class_id, division_id, status, created_at, updated_at)
VALUES ('student-1', 'Sample Student', 'class-1', 'division-a', 'Active', '${now}', '${now}');

INSERT OR IGNORE INTO settings (key, value)
VALUES ('election_status', 'NOT_STARTED');

INSERT OR IGNORE INTO settings (key, value)
VALUES ('school_name', 'School Election Voting System');

INSERT OR IGNORE INTO settings (key, value)
VALUES ('school_logo_url', '');
`;

async function main() {
  execFileSync(
    "npx",
    [
      "wrangler",
      "d1",
      "execute",
      "election_online_db",
      "--local",
      "--command",
      seedSql
    ],
    {
      stdio: "inherit"
    }
  );
}

void main();
// Existing seed file remains project-specific; class leader seeding is added here.
