CREATE TABLE IF NOT EXISTS published_projects (
  repo_id INTEGER PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0,1))
);
CREATE TABLE IF NOT EXISTS project_votes (
  repo_id INTEGER NOT NULL REFERENCES published_projects(repo_id) ON DELETE CASCADE,
  voter_hash TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  PRIMARY KEY (repo_id, voter_hash)
);
CREATE INDEX IF NOT EXISTS idx_project_votes_repo ON project_votes(repo_id);
INSERT OR IGNORE INTO published_projects (repo_id, slug, active) VALUES (1419259262,'appkade-open',1);
