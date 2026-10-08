# VOTE-1 Scaffold / Staging Handoff

Date: 2026-10-08. Status: **Repository implementation candidate only — NOT PRODUCTION GO**.

## What exists in VOTE-1

- Mobile-first Thai *not yet open* landing, no login/forms/voting controls.
- React + TypeScript + Vite frontend, PHP read-only `health` and `ready` routes.
- Separate disposable-only MariaDB bootstrap schema `vote_schema_migrations` (no vote tables).
- CI for frontend static tests, typecheck/build at root and subpath; PHP lint/API contract/isolated MariaDB smoke.
- `.env.example` placeholders; secrets not in Git.
- No connection to AcademicCompetitionManager, Production 73/74, real groups, ballots or identity.

## Local development (only after merging verified PR)

```bash
git fetch origin
git switch main
git pull --ff-only
npm ci
npm run dev
npm test
npm run build
```

Vite serves frontend on a local development port. Without an external local PHP endpoint or a proxy, the readiness indicator may report unavailable; **this does not indicate an active voting outage**, since voting is not implemented. Test PHP separately with `php tests/php_contract_test.php`.

## App base path (future isolated staging)

Build only for a NEW safe location, for example:

```powershell
$env:APP_BASE="/vote-staging/"
npm run build
```

Then copy `dist/` output to that staging directory, and separately deploy `api/` under the same directory so `/vote-staging/api/?action=health` is served by PHP. Do not reuse `/sillapa73/` or `/sillapa74/` or their databases, sessions or storage. Do not deploy during VOTE-1 without a separate approval.

PHP receives `VOTE_DB_HOST, VOTE_DB_PORT, VOTE_DB_NAME, VOTE_DB_USER, VOTE_DB_PASSWORD` from secured hosting environment settings; the example env file is **not automatically loaded**, and must not be copied to a public webroot with secrets.

## HTTP endpoints and expected behavior

- `GET /<app-base>/api/?action=health` -> 200, `votingEnabled:false` (PHP running only).
- `GET /<app-base>/api/?action=ready` -> 503 `ready:false` if separate DB/bootstrap not set; 200 `ready:true` only if DB connection and bootstrap table available. **This is DB readiness, not permission to vote.**
- POST, PUT, etc -> 405. Unknown actions -> 404.
- No CORS or public user/account/ballot endpoints.

## Disallowed in this PR

- No Production 73 DB access/import/migration.
- No real roster, private export, credentials, passwords, tokens, data dumps.
- No real voting, user account issuance, quorum automation, results publication.
- No host upload, database migration, or silent PR merge.

## VOTE-1 acceptance evidence

1. GitHub PR diff limited to scaffold/CI/test/docs; no committed secrets.
2. GitHub Actions CI jobs GREEN (not assumed; check actual run).
3. Reviewer confirms correct `APP_BASE`, no active vote screens.
4. Owner authorizes Merge separately; staging/Production approval remains another gate.

## Caveats / TODO for next PR

- The committed `package-lock.json` is the resolved dependency baseline. CI and local setup use `npm ci`; keep the lockfile in sync with `package.json` for future dependency updates.
- VOTE-2 designs full migration and catalog/round tables; VOTE-3 designs authenticated sessions and authorization before any vote endpoints.
- Validate actual shared-host PHP/PDO MySQL extensions, APP_BASE, webroot and HTTPS in isolated staging.
- If supporting same-host subpaths, browser storage/session namespaces must not overlap with other production apps.
