-- VoteSillapaKan4 VOTE-1: disposable TEST/STAGING DB bootstrap only.
-- This file MUST NOT run against AcademicCompetitionManager or any Production 73 DB.
-- Real ballots, voters, and event catalog schema are deliberately deferred to VOTE-2/VOTE-3.
CREATE TABLE IF NOT EXISTS vote_schema_migrations (
  migration_key VARCHAR(128) NOT NULL,
  applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (migration_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
