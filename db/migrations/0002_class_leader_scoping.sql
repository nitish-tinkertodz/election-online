CREATE TABLE IF NOT EXISTS classes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  display_order INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Active', 'Inactive')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS divisions (
  id TEXT PRIMARY KEY,
  class_id TEXT NOT NULL,
  name TEXT NOT NULL,
  display_order INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Active', 'Inactive')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
  UNIQUE (class_id, name)
);

CREATE TABLE IF NOT EXISTS students (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  class_id TEXT NOT NULL,
  division_id TEXT,
  status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE RESTRICT,
  FOREIGN KEY (division_id) REFERENCES divisions(id) ON DELETE SET NULL
);

ALTER TABLE elections ADD COLUMN scope_type TEXT NOT NULL DEFAULT 'SCHOOL';
ALTER TABLE elections ADD COLUMN class_id TEXT;
ALTER TABLE elections ADD COLUMN division_id TEXT;
ALTER TABLE roles ADD COLUMN is_class_leader INTEGER NOT NULL DEFAULT 0;
ALTER TABLE candidates ADD COLUMN class_id TEXT;
ALTER TABLE candidates ADD COLUMN division_id TEXT;

CREATE INDEX IF NOT EXISTS elections_scope_idx
ON elections (scope_type, class_id, division_id);
