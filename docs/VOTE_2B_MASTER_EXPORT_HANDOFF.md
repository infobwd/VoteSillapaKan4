# Authorized master activity/level export — VOTE-2B (READ-ONLY)

**Do not execute against Production 73 unless you are explicitly authorized and a read-only export is approved.** Prefer your isolated verified clone or 74 prep staging. This workflow never writes to source DB.

## 1. Check source schema and environment

Confirm current AcademicCompetitionManager `analysis/mysql-migration` schema and the actual DB copy in phpMyAdmin. The historical repo SQL shows `activities(activity_id, category, name)` and `activity_levels(activity_id, level_code)` with VARCHAR IDs; names and level codes must be preserved as source strings. Verify DB name and that this **is not** a shared welfare ledger or live 73 instance.

## 2. Run read-only SELECT (on authorized clone/staging)

```sql
SELECT
  a.activity_id AS activity_id,
  a.name AS name,
  al.level_code AS level_code,
  a.category AS category
FROM activities AS a
INNER JOIN activity_levels AS al ON al.activity_id = a.activity_id
ORDER BY a.category, a.activity_id, al.level_code;
```

In phpMyAdmin: select **the appropriate cloned/approved DB** → SQL → paste only the SELECT → Go → Export returned result as CSV (UTF-8 with headings). **Do not click Import**, do not export entire database or users/teams/teachers/judges, and never place master CSV into Git.

This only exports **four non-personal activity-master columns**. Source may still contain other sensitive metadata in other tables, which must not be exported. Ensure source SQL matches actual live schema before running.

## 3. On VS Code terminal / local clone

```powershell
git fetch origin
git switch data/vote-2b-source-audit-crosswalk
git pull --ff-only origin data/vote-2b-source-audit-crosswalk
node tools/validate_rule70_catalog.mjs
node --test tests/rule70_coverage.test.mjs tests/rule70_crosswalk.test.mjs tests/rule70_csv.test.mjs
node tools/convert_activity_master_csv.mjs "D:\\PRIVATE\\activities-levels.csv" > "D:\\PRIVATE\\activities-levels.json"
node tools/reconcile_rule70.mjs --master "D:\\PRIVATE\\activities-levels.json" --candidates catalog/rule70/candidate_items.json > "D:\\PRIVATE\\crosswalk-suggestions.json"
```

CSV conversion rejects extra columns, duplicate canonical activity×level keys and unsupported level labels. The resulting JSON contains only suggestions, including all mismatches/ambiguities, and **does not approve or import votes**.

### Expected evidence to share (without private exports)

- Number of master activity×level rows
- Counts per reason: `ONE_EXACT_NAME_AND_LEVEL_SUGGESTION`, `SAME_NAME_DIFFERENT_LEVEL`, `AMBIGUOUS_MULTIPLE_CANONICAL_MATCHES`, `NO_EXACT_NAME_MATCH`
- Verified export version/date, anonymized hash and reviewers' resolution counts
- **No participant/student/teacher or full SQL dump** anywhere in this repo

For full row-by-row reconciliation, the designated operator may transfer a private sanitized activities-level file through an approved private channel, not attach it to a public PR. Any approvals must be separately documented with authority and date.
