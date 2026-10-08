# ACCEPTANCE TEST PLAN — Option A

Status: planned test matrix, **not executed**. 8 October 2026. No implemented API/UI exists yet.

## 1. Test environments

- CI and dev use **synthetic** activities, levels, clusters and accounts only, separate ephemeral MySQL/MariaDB.
- Staging must be isolated from AcademicCompetitionManager Production 73/74: different app root, DB, credentials, backups, auth sessions and browser storage.
- Production tests require Owner authorization and approved group/meeting policy first. Never use actual prior competition teams, students, judge PII as test data.

## 2. Mandatory functional / permission matrix

| ID | Scenario | Expected acceptance |
| --- | --- | --- |
| CAT-01 | import valid activities, levels, clusters + signed manifest | accepted with checksums, row counts and stable string IDs |
| CAT-02 | duplicate IDs, unknown activity level, empty/ambiguous level, invalid UTF-8 | validation error; **no partial commit** |
| CAT-03 | catalog changes while OPEN | active round snapshot identical before/after; no silent mutation |
| CAT-04 | group A chair submits ballot on own cluster | one receipt and one logical ballot |
| CAT-05 | delegate submits when chair submitted already | same shared cluster vote; revision, **not another vote** |
| CAT-06 | group A tampers cluster_id to group B | 403 and no group B data returned/written |
| CAT-07 | central admin tries direct ballot in group scope | rejected unless independently eligible by explicit role and policy; no admin impersonation |
| CAT-08 | visitor, expired session, revoked delegate attempts vote | 401/403; no write |
| CAT-09 | save draft and leave before final submit | draft excluded from tally; marked unanswered/not submitted |
| CAT-10 | YES/NO/ABSTAIN votes across several items | each counted once; MISSING distinct from ABSTAIN |
| CAT-11 | parallel clicks/retries/same idempotency key | one final logical ballot and revision sequence |
| CAT-12 | concurrent edits by chair/delegate | transaction prevents lost update; conflict or explicit last version |
| CAT-13 | submit just before and just after cutoff | only server-accepted within OPEN counted |
| CAT-14 | client sets own clock/timezone incorrectly | no deadline bypass |
| CAT-15 | CLOSED then user edits or admin changes policy | rejected; frozen ballot & tally unchanged |
| CAT-16 | admin attempts to reopen CLOSED silently | rejected; linked revote required |
| CAT-17 | voter tries fetching interim YES/NO tally or other cluster choices | not returned while OPEN |
| CAT-18 | MISSING and ABSTAIN counts displayed and exported | correct different values |
| CAT-19 | tie, no quorum, no valid votes | unresolved explicit states, **never auto-approved** |
| CAT-20 | certified resolution differs from machine result | requires reason + certifier identity, preserved calculation |
| CAT-21 | public pre-publication request | zero private or draft result data |
| CAT-22 | public after authorization | only certified, expressly published aggregate |
| CAT-23 | CSV injection text beginning = + - @ and Thai UTF-8 | escaped/sanitized export readable in spreadsheet |
| CAT-24 | password brute force/CSRF/session replay/logout | guardrails enforce invalid/revoked requests |
| CAT-25 | keyboard and small-screen voting | accessible, no overlap, recoverable errors |
| CAT-26 | backup, isolated restore, checksum reconciliation | restored snapshot/ballots/audit totals match |
| CAT-27 | deployment rollback after synthetic failure | old release restored without losing accepted votes |
| CAT-28 | actual roster or quorum not formally approved | cannot enter READY / real OPEN |

## 3. Calculation fixtures

Assume E=10, proposed quorum ceil(2E/3)=7 (only if ratified):

| Y | N | A | M | Expected |
| ---: | ---: | ---: | ---: | --- |
| 4 | 2 | 1 | 3 | SUPPORTED |
| 2 | 4 | 1 | 3 | NOT_SUPPORTED |
| 3 | 3 | 1 | 3 | TIE |
| 3 | 0 | 0 | 7 | NO_QUORUM |
| 0 | 0 | 7 | 3 | NO_VALID_VOTES |
| 0 | 0 | 0 | 10 | NO_QUORUM |

Also test E=0 invalid round, E=1, many-cluster bounds, and different approved quorum policy versions. Changing a proposed threshold in config must produce a different policy version and **must not** alter an OPEN/CLOSED round.

## 4. Evidence each PR must supply

- PR and exact HEAD SHA, changed paths and CI run URL/status
- unit/integration suite evidence including rejection cases (not just happy path)
- migration/revert/restore design and synthetic database fingerprints
- before/after permission matrix
- screenshots/mobile/tablet/desktop checks where UI changed
- no actual personal data exposed in evidence or logs
- Owner handoff: expected results, env vars without secrets, deployment instructions, recovery/rollback

## 5. Host acceptance / STOP-GO

Preconditions:
1. VOTE-1 through VOTE-5 planned scope completed and CI PASS.
2. Staging backend and frontend built from exact repo SHA; dedicated DB, credentials and protected backups.
3. Authorized eligible-cluster roster, policy/rules, opening and closing time and certifier confirmed by meeting/Owner.
4. Security: no public raw ballots, no shared auth/database with Production 73, tests 01-28 PASS as applicable.
5. Restore drill and rollback demonstrated on disposable clone.

**GO only after explicit Owner approval**. CI PASS or merge alone does not imply acceptance. If any P0 issue (double vote, cross-cluster access, leaked interim tally, unauthorized opening/publishing, inability to restore) occurs, STOP and remediate.

## 6. Docs-only PR verification

For this PR, the only valid checks are: all expected markdown files present, internal links resolve, scope/terminology consistent, no secrets/real data, changed paths limited to README.md and docs/*.md, no runtime behavior claims, no CI claims unless CI actually exists. Actual functional test cases remain **NOT RUN / FUTURE**.

## 7. Historical rules catalog candidate tests (new requirements)

| ID | Scenario | Expected |
| --- | --- | --- |
| CAT-29 | import historical #70 candidate without review | rejected from real round; remains preview/draft |
| CAT-30 | #70 item matches existing #73/#74 canonical activity + level | one ballot card with merged provenance; no duplicate voting |
| CAT-31 | candidate has ambiguous level or สพป./สพม. scope | holds for manual review |
| CAT-32 | special education item uses disability/age splits | no flattening into generic item without approved scope |
| CAT-33 | regional northeast-only source | excluded from Kanchanaburi area by default |
| CAT-34 | report includes archival source title/PDF/page | provenance visible, #70 not mislabeled as #74 rules |
| CAT-35 | new authoritative #74 catalog differs from #70 | immutable round snapshots unchanged; future draft reconciliation required |
