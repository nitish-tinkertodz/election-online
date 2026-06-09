CREATE TABLE IF NOT EXISTS elections (
  id TEXT PRIMARY KEY,
  status TEXT NOT NULL CHECK (status IN ('NOT_STARTED', 'OPEN', 'CLOSED')),
  started_at TEXT,
  closed_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS roles (
  id TEXT PRIMARY KEY,
  election_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  display_order INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Active', 'Inactive')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (election_id) REFERENCES elections(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS roles_election_display_order_idx
ON roles (election_id, display_order);

CREATE TABLE IF NOT EXISTS candidates (
  id TEXT PRIMARY KEY,
  role_id TEXT NOT NULL,
  name TEXT NOT NULL,
  class_name TEXT NOT NULL,
  photo_url TEXT,
  status TEXT NOT NULL CHECK (status IN ('Active', 'Inactive')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS vote_sessions (
  id TEXT PRIMARY KEY,
  session_key TEXT NOT NULL UNIQUE,
  election_id TEXT NOT NULL,
  completed_role_ids_json TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  closed_at TEXT,
  FOREIGN KEY (election_id) REFERENCES elections(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS votes (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  candidate_id TEXT NOT NULL,
  role_id TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  FOREIGN KEY (session_id) REFERENCES vote_sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE RESTRICT,
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT
);

CREATE UNIQUE INDEX IF NOT EXISTS votes_session_role_idx
ON votes (session_id, role_id);

CREATE TABLE IF NOT EXISTS election_results (
  id TEXT PRIMARY KEY,
  election_id TEXT NOT NULL,
  generated_at TEXT NOT NULL,
  total_votes_cast INTEGER NOT NULL DEFAULT 0,
  result_json TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('DRAFT', 'FINAL', 'ARCHIVED')),
  FOREIGN KEY (election_id) REFERENCES elections(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  action TEXT NOT NULL,
  actor_type TEXT NOT NULL,
  actor_id TEXT,
  payload_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL
);
