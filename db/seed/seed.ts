import { execFileSync } from "node:child_process";

const now = new Date().toISOString();

const seedSql = `
INSERT OR IGNORE INTO elections (id, status, created_at, updated_at)
VALUES ('default-election', 'NOT_STARTED', '${now}', '${now}');

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
