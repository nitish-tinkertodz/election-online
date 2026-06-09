const now = new Date().toISOString();

const seedStatements = [
  [
    "INSERT OR IGNORE INTO elections (id, status, created_at, updated_at) VALUES (?, ?, ?, ?);",
    "default-election",
    "NOT_STARTED",
    now,
    now
  ],
  [
    "INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?);",
    "election_status",
    "NOT_STARTED"
  ],
  [
    "INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?);",
    "school_name",
    "School Election Voting System"
  ],
  [
    "INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?);",
    "school_logo_url",
    ""
  ]
] as const;

async function main() {
  console.log("Seed scaffold ready.");
  console.table(seedStatements.map(([sql]) => ({ sql })));
  console.log(
    "Hook these statements into the D1 client once the database execution layer is wired."
  );
}

void main();
