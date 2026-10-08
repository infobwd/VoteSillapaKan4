# IMPLEMENTATION PLAN — VoteSillapaKan4 Option A

Status: design phase; no runtime code/database/deployment in this docs PR.  
Date: 2026-10-08  
Canonical feature: vote YES/NO/ABSTAIN on **area-level** activity × level items, one group-network vote per item.

## 1. Development rules

- Verify latest VoteSillapaKan4 main HEAD, open PRs, relevant Actions, README and design docs **before each coding PR**.
- GitHub is source of truth. Work on new feature branches with small PRs; require review + green gates before merge; **never silently merge**.
- Create synthetic fixtures only. Do not commit credentials, private group voter names, imported real roster files, SQL dumps, unpublished votes or student/teacher personal data.
- This docs PR proposes structure and tests only. No schema migration, no server upload, no Production 73 interaction.
- Preserve earlier stages as immutable reference when closing or certifying rounds; every rollout has backup/restore and rollback.
- After every PR merge, update these docs with actual implementation status/evidence, not just planned promises.

## 2. Proposed PR sequence

### VOTE-0 — Design Lock / rules / roadmap (THIS PR)

Files: README.md, VOTING_SYSTEM_DESIGN.md, VOTING_POLICY.md, DATA_INTEGRATION_CONTRACT.md, IMPLEMENTATION_PLAN.md, ACCEPTANCE_TEST_PLAN.md.

Acceptance:
- Scope A explicit, no accidental B/C feature design.
- Quorum/certification issues visibly marked as pending formal authorization.
- Master import ownership and no Production 73 writes.
- Plans specify test/rollout gates; **docs-only diff**.
- PR reviewed and accepted before implementation branch created.

### VOTE-1 — Project skeleton and CI

Deliver:
- React/TypeScript/Vite frontend scaffold and responsive Thai shell.
- PHP 8/PDO API with health/readiness, config boundary, no hard-coded secrets.
- .env.example and deployment path/base handling (no live settings).
- MySQL/MariaDB test schema bootstrap in disposable local/CI context.
- GitHub Actions: typecheck, build, PHP lint, unit/security tests and dependency checks; locked install files.
- Accessible public landing (no real voting yet).

Exit: CI reproducibly PASS in clean checkout, failure scenarios tested, no real DB or identity access.

### VOTE-2 — Catalog import and admin round preparation

Deliver:
- Versioned CSV/JSON preview/commit, manifest+hash+row validations, transaction.
- Master catalog with activity_id + level_code + category; group list.
- Explicit selection/exclusion of items, eligible roster and group membership in draft.
- Locked round snapshot, READY preflight and policy authorization gate.
- Admin screens and synthetic fixtures.

Exit: synthetic import rejects inconsistent IDs, duplicates, missing levels; no silent changes after OPEN; all authorizations tested.

### VOTE-3 — Authentication, voting and ballot audit

Deliver:
- Centrally managed accounts and chair/delegate membership, validated active delegation.
- Backend session security, CSRF/idempotency/throttling, auth expiration and revocation.
- Mobile-first own ballot list, filters, drafts, confirmation, receipt, revisions.
- Transactional ballot uniqueness, append-only events and server-clock cutoff enforcement.
- Admin-controlled OPEN/CLOSE phase operations.

Exit: real permission matrix and concurrency/race tests green; no double vote; unauthorized/out-of-time requests fail; no interim result leakage.

### VOTE-4 — Tally, certification and reports

Deliver:
- Server-side tally with policy version; quorum, supported/not-supported/tie/no-quorum/no-valid statuses.
- Separate decision/certification workflow and supporting reason/authority.
- Closed dashboard with category/level filters, participation counts, summaries, audit.
- Carefully scoped aggregate CSV plus Excel/PDF if deployment libraries and acceptance warrant.
- Publish workflow releases **only certified, approved aggregate**.

Exit: math independently checked with fixtures, ABSTAIN vs MISSING unambiguous, all exports sanitized and policy-gated.

### VOTE-5 — Security, operations and Owner staging acceptance

Deliver:
- Isolated staging deployment (separate app path, DB, credentials and sessions from Production 73/74), host-specific config/runbook.
- Security review, accessibility/responsiveness, backup/restore drill, recovery, logs and diagnostics.
- Pilot with synthetic groups and parallel submissions, then realistic **authorized** roster only when policy ratified.
- Exact release SHA/build artifact validation, protected backups and rollback.
- Owner acceptance record + explicit independent Production GO.

Exit: ACCEPTANCE_TEST_PLAN.md test matrix PASS with evidence and sign-off. **CI PASS alone is not Production GO.**

## 3. Dependency / approval gates

1. Design scope + repository architecture reviewed -> VOTE-1 may start.
2. Before meaningful schema/open-state deployment, agree deployment host database/version, exact route/base path and secure secret handling.
3. Before READY of any real round: committee-authorized quorum/majority/tie rule, eligible groups, certifier, activity exemptions, time window, public-release rule.
4. Before OPEN: import manifests and roster hashes approved, tests pass, backups verified, auth and permissions test passed.
5. Before publish: CLOSED snapshot verified, official resolution and sign-off recorded.
6. Before Production: dedicated Owner host acceptance and rollback plan; never deploy to /sillapa73/ or overwrite AcademicCompetitionManager assets.

## 4. Key tasks by stream

| Stream | Tasks | Gate |
| --- | --- | --- |
| Data | 4-source import contract; IDs; snapshot; diff/reconcile; version | No silent data loss |
| Identity | account provisioning, delegation, expiry, server-side group scoping | No cross-cluster privilege |
| Vote | draft, submit, receipts, editing, append-only audit | No duplicates; stable last-vote semantics |
| Policy | quorum and majority rules, rule hashes, tie/no-quorum states | Ratified before real vote |
| UI | Thai responsive cards, filters, review missing, safe error handling | Mobile/tablet/desktop usability |
| Reporting | policy-tied aggregates, certify, authorized publishing | No leakage before close |
| Operations | CI, migrations, env, backups, restore, staging, clean rollout | Safe rollback/acceptance |

## 5. Suggested API and database governance

Create SQL migration files as **new versioned additive migrations** plus reversible rollback or restore runbook; no manual direct DB schema edits. DB unique (round_id, item_id, cluster_id) and foreign key constraints. Vote API should be idempotent, transactional and server-authorized. Use UTC timestamps in storage, Thai time in display; ensure closed/open state cannot be bypassed by client manipulation.

Design physical DDL, field validation, structured error codes, pagination and revision semantics in VOTE-2/VOTE-3 with tests. Do not claim this plan's conceptual table names are already implemented.

## 6. Test pipeline

1. Static: doc links, typecheck/build/PHP lint, dependency security baseline.
2. Unit: tally (Y/N/A/M), quorum, tie, invalid input, state machine.
3. DB/integration: unique ballots, imported references, transactions, idempotent retries, concurrency.
4. Auth: role matrix, school/group scope tampering, CSRF, session replay/expiry, rate-limiting.
5. Browser: mobile/desktop, incomplete drafts, edge timing, language, export injection, no leaked results.
6. Staging: real-like load, server clock, separate DB, backup/restore, rollback.
7. Owner sign-off: checklist + exact SHA, separate permission to deploy.

All synthetic tests avoid Production 73 and personal data. Details: ACCEPTANCE_TEST_PLAN.md.

## 7. Work intentionally deferred

Option B stage-selection, Option C venue/host selection, integration that writes decisions back to the competition manager, school-level weighted votes, public or LINE login, OTP/PIN, anonymized votes without group audit, automatic deployment, scheduling/budget/judge modules.

## 8. Handoff for next chat / coding agent

1. Confirm this PR is reviewed/merged; do not assume.
2. Inspect latest repo main/open PR/CI/docs.
3. Treat Design Lock + Policy Ratification Gate as constraints.
4. Begin only VOTE-1 on feature branch, add tests, open PR, request review; no auto-merge/deploy.
5. If business policy remains unsigned, implement synthetic tests and READY guards but do not enable real OPEN.


## 9. Historic rule70 standalone option stream (Owner update 2026-10-08)

**The user does not require matching #70 activities to #73/#74.** Historical #70 criteria are *optional labels to propose for voting*, with source-specific IDs. Do not gate the Rule70 source on private export of canonical master, and do not require match/reconcile tools.

- VOTE-2A: merged PR #3 provided 18 PDF sources and 126 partial draft candidate×level records.
- VOTE-2B: source-overview audit and 37 supplementary family examples; **generate 126 independent `rule70:` option proposals**, preserve PDF links and scope. Full row-by-row extraction and source validation are still pending. No automatic activation.
- VOTE-2C (after VOTE-1 frontend CI PASS): admin lists source sets separately, reviews, excludes or selects options by unique `option_id`, locks immutable round snapshot; do not merge similar names across different sources.
- VOTE-3: voting scoped to `(round_id, option_id, cluster_id)`, same one-group-one-vote rule, policy ratification and audit.
- VOTE-4/VOTE-5: computed results and human certification, separated from any changes to AcademicCompetitionManager. Historical PDFs never substitute for #74 regulations.
- **No requirement for `activity_id` from #73/74, no database master CSV export, no name matching.**


## 11. VOTE-2C1 — Read-only website source catalog preview

Following VOTE-1 merged code, first UI increment provides public, read-only source catalog previews from `option_proposals_v2b.json`. Filter/search by category and grade, 12 per page, PDF provenance and draft status. This does **not** add voting, login, server-side review, round approval or write endpoints. Source items remain marked pending.
- `src/App.tsx` imports the local staged historical dataset and renders preview only with clear archival year and no tally.
- No #73/#74 matching/export; each option retains `rule70:` namespace.
- VOTE-2C2 will implement secured admin verification, item exclusion/inclusion and round snapshot AFTER identity/authorization system is designed and tested.
- No Production/host deployment from PR merge. Manual screenshot/browser checks at 320px/iPad/desktop remain owner staging acceptance tasks.
