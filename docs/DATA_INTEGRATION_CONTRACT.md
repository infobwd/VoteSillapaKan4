# DATA INTEGRATION CONTRACT — VoteSillapaKan4 ↔ AcademicCompetitionManager

Status: design proposal 2026-10-08. **Read-only transfer; no live DB connection or migration in this PR.**

## 1. Source of truth / protection boundary

VoteSillapaKan4 is a separate web service with separate auth, sessions, vote storage and backups. AcademicCompetitionManager remains authoritative for competition activity/level/cluster master data.

Source repository: https://github.com/infobwd/AcademicCompetitionManager

**Critical guardrail:** The main branch of AcademicCompetitionManager has been described as legacy. Before each actual export, check the latest canonical integration/stabilization branch and README/docs/SQL source. The currently documented 73 baseline / 74 integration lineage is in analysis/mysql-migration, while stabilize/73-prod is dedicated to 73 fixes. This document does **not** authorize querying/writing Production 73 or treating old main as current source.

Verified conceptual source tables from db/01-schema.sql in analysis/mysql-migration:
- activities: activity_id (VARCHAR 32), category, name, mode, sort_order, etc.
- activity_levels: activity_id + level_code (joint membership/unique key)
- clusters: cluster_id (VARCHAR 32), cluster_name
- schools: school_id, cluster_id (not required for voting identity/rights in MVP)

Activity IDs, cluster IDs and level codes are opaque **strings**. Never CAST to number, trim meaningful leading zeroes, or use Thai names as keys.

## 2. Import mode for V1

Preferred: authorized operator creates versioned CSV/JSON exports of **master data only**; admin uploads to VoteSillapaKan4 staging and previews validation. No credentials, tokens, DB dumps, raw Production export snapshots or sensitive roster data in git.

Minimum expected datasets:
1. Activities: activity_id, category, name, sort_order, source_version
2. Levels: activity_id, level_code, optional level_label
3. Clusters: cluster_id, cluster_name
4. Manifest: source_repository, source_branch, source_commit_sha (or independently documented export identifier), exported_at, schema_version, per-file SHA-256 and row counts

Only content passed validation and approved by admin is committed as **import_batch**. Failed import must leave previously accepted catalog intact (transaction). Keep quarantine error reports with row and reason; sanitize source filenames and prevent spreadsheet formula injection.

## 3. Selection unit and key

Round items: **(round_id, activity_id, level_code)** unique. A single activity with several levels creates multiple item rows. An activity with no valid level mapping must be flagged for explicit human resolution, not silently flattened or combined with another level. The same activity-level item may participate in multiple later rounds but remains independently snapshotted.

Pre-import checks:
- Duplicate activity_id, duplicate cluster_id, duplicate (activity_id, level_code)
- Unknown level-to-activity FK
- Empty identifiers/name/category or invalid encoding
- Unexpected deletions, renamed labels for same IDs, duplicate display labels with distinct IDs (warning rather than silent merge)
- Suspicious number of imported rows compared with manifest/source
- CSV cells starting with formula characters and oversized input
- Missing/ambiguous level codes
- Changes to source catalog relative to previous approved import
- Items that are outside policy (mandatory events, non-area items) require exclusion flag + reason before READY

## 4. Snapshot behavior

Create immutable round snapshot from one approved import_batch and explicitly chosen subset:
- activity_id, level_code, activity_name, category, sort_order, level_label at that time
- eligible cluster_id/name set at that time
- import checksum and policy_version/hash

After OPEN, a later source catalog update must not rename, delete or add round items implicitly. Updated activity/level labels go into a new import for future rounds or a formal pre-OPEN approval. Never change an OPEN round's snapshot.

## 5. Voter roster is independent

The source table clusters supplies recognized group **identities**, NOT actual permission to vote. An admin must approve the eligible cluster snapshot and attach a validated chair/delegate account to each group. A voter cannot self-assign schools or cluster; server derives scope from approved roster.

No student, teacher, team roster, judge, address, phone or national-ID fields imported as part of V1.

## 6. Provenance / reconciliation reports

Preview and import acceptance report must include:
- source ref, export time, importer, SHA-256
- counts: activities, levels, activity-level items, clusters, approved eligible clusters
- accepted/rejected records and labeled reasons
- changed IDs/names between import versions
- round-item snapshot count vs selected activities
- independently reproducible aggregate count/checksum before/after commit

Exports to meeting reports include round_id, policy hash, source import batch ID, snapshot ID/version and tally timestamp. No automatic feedback to AcademicCompetitionManager in V1.

## 7. Source-of-truth drift gate

Before implementation of import ETL:
- Inspect actual latest source schema and representative **synthetic** fixtures.
- Update this contract if source field names or schema change; add compatibility tests.
- Require human approval for unexpected activity/level/cluster count changes.
- If external API is proposed later, separate read-only credentials, scope and approval must be designed first (no direct Production 73 write privileges).

## 8. Data ownership and backups

- Master catalog in VoteSillapaKan4 = **imported snapshot**, not authoritative source for the competition.
- Votes, revisions, policies, decisions, audit = authoritative in VoteSillapaKan4 only.
- Back up and restore separately; secrets and real CSV data excluded from repository.
- To build the future competition setup, export **certified aggregate decision list** for a person to review; never update 74 activities automatically without an explicit integration/change-approval project.

## 9. Additional historical criteria candidate source — Sillapa 70

[Historical Sillapa 70 catalog integration](SILLAPA70_CATALOG_INTEGRATION.md) adds a **second supplementary historical source**, separate from AcademicCompetitionManager canonical activities. The historical PDF-derived `candidate_id` is not an `activity_id`. Import must reconcile each candidate into MATCHED (existing canonical activity × level), NEW_APPROVED (explicitly new canonical identity), or EXCLUDED (not applicable). The VOTE-2 admin preview must display source links and prevent duplicates before creating approved `round_items`.

As of 2026-10-08 only 13/18 PDF categories have partial candidate extraction. No `eligible_for_live_vote` flag may be toggled from file import alone. Special education source structure needs independent scope/age/disability design review. Do not import PDF full texts or alter Production 73.

## 10. Reconciliation safety rules / VOTE-2B

Historical `source_family_id` and `candidate_id` are **not** canonical `activity_id`. Offline `tools/reconcile_rule70.mjs` generates suggested exact-name/exact-level matches against explicitly provided, **privacy-safe** #73/#74 master exports. Every result remains REVIEW_REQUIRED and cannot be used in a voting round without operator approval. For special education items, `activity_id+level_code` must be extended to an approved subtype/age/disability scope before a unique voting item can be defined. See [VOTE-2B source audit](VOTE_2B_SOURCES_AND_CROSSWALK.md).
