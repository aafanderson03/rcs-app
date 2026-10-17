PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS companies (
  slug TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1))
);

CREATE TABLE IF NOT EXISTS employee_accounts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_slug TEXT NOT NULL REFERENCES companies(slug),
  username TEXT NOT NULL,
  display_name TEXT NOT NULL,
  employee_type TEXT NOT NULL CHECK (employee_type IN ('employee', 'merchandiser', 'guard', 'subcontractor')),
  password_salt BLOB NOT NULL,
  password_hash BLOB NOT NULL,
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (company_slug, username)
);

CREATE UNIQUE INDEX IF NOT EXISTS employee_accounts_username_global_idx ON employee_accounts (LOWER(username));

CREATE TABLE IF NOT EXISTS auth_sessions (
  token_hash TEXT PRIMARY KEY,
  account_id INTEGER NOT NULL REFERENCES employee_accounts(id) ON DELETE CASCADE,
  expires_at INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS auth_sessions_account_id_idx ON auth_sessions(account_id);
CREATE INDEX IF NOT EXISTS auth_sessions_expires_at_idx ON auth_sessions(expires_at);
