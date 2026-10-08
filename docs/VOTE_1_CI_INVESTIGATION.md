# VOTE-1 CI Investigation — Frontend build blocked

Date: 2026-10-08 · Repository: infobwd/VoteSillapaKan4 · PR #2  
**State: BLOCKED; do not merge or deploy.**

## What we know from GitHub Actions

- Build run [#37744975445](https://github.com/infobwd/VoteSillapaKan4/actions/runs/37744975445): `npm ci` PASS, 4 Node scaffold tests PASS, `tsc --noEmit` PASS; `vite v7.1.7 building for production... transforming...` stuck for 120 sec and exit 124. PHP/API/MariaDB job PASS.
- Diagnostics run [#37745365695](https://github.com/infobwd/VoteSillapaKan4/actions/runs/37745365695): a direct `esbuild` TSX transform PASS; Vite config loads; frontend still stalls at `transforming...` with 45-sec limit.
- Isolated source-graph run [#37745805668](https://github.com/infobwd/VoteSillapaKan4/actions/runs/37745805668): minimal plain HTML/JS build PASS (~119ms); same app with DOM-only entry PASS (~79ms); React entry **without CSS import** hangs until timeout.
- Toolchain comparison run [#37745627347](https://github.com/infobwd/VoteSillapaKan4/actions/runs/37745627347): Vite 6.3.6 with same installed graph also hangs.
- Rollup comparison run [#37745954598](https://github.com/infobwd/VoteSillapaKan4/actions/runs/37745954598): temporary Rollup 4.42.0 with Vite 7 still hangs. **Neither comparison proves specific package version is root cause.**
- MariaDB isolated service and PHP checks pass across these runs; database and CI auth are not the source of this frontend failure.

## Key conclusion

A Vite build of the minimal source works, while the full React import graph hangs. Exact root cause **not yet isolated**. Do not downgrade dependencies permanently, change the committed lock, or replace the product architecture based solely on a speculative toolchain issue. The temporary comparison jobs have been removed after gathering evidence.

## Recommended next diagnostic PR on this existing branch

1. Reproduce with a tiny React entry that imports only `react` then only `react-dom/client`, with short timeout per case. Distinguish JSX runtime, React core, ReactDOM, scheduler or CommonJS transform.
2. Capture per-module Vite/Rollup transform tracing or isolate ReactDOM CommonJS interop; compare a clean standalone Vite React template at exact installed versions.
3. Check rollup/esbuild native packages, their versions and runtime platform, and scan for process hanging/waiting before changing dependencies.
4. Apply a minimal proven fix (config/entry/dependency), update lockfile via clean reproducible command.
5. Require **both** root `npm run build` and `APP_BASE=/vote-staging/ npm run build` successful CI, plus PHP/MariaDB jobs, before PR #2 can merge.
6. After merge, isolated staging and Owner acceptance remain separate. No Production GO.

## Acceptance classification

| Gate | State |
| --- | --- |
| Lockfile checked in / npm ci | PASS |
| Node scaffold tests (4) | PASS |
| TS typecheck | PASS |
| PHP syntax/API/MariaDB | PASS |
| Root Vite production build | **FAIL — timeout in transforming** |
| Subpath build | NOT RUN due to prior failure |
| VOTE-1 acceptance / merge | **BLOCKED** |

No real votes, users, master data import or source Production DB touched.


## Resolution proposal & confirmed diagnostic evidence (2026-10-08)

New [workflow diagnostic run](https://github.com/infobwd/VoteSillapaKan4/actions/runs/37751720680) isolated the hang to `react-dom/client`: minimal Vite `react` import **PASS** (~0.2s), `react/jsx-runtime` **PASS** (~0.13s), `react-dom/client` **TIMEOUT 14s**, `react+react-dom/client` **TIMEOUT 14s**. Direct **esbuild full React app bundle PASS (39ms)**, with both JavaScript and stylesheet assets generated.

With root cause constrained to the Vite/Rollup processing path for ReactDOM imports **but no exact internal plugin bug proven**, the VOTE-1 scaffold switches only **Production static bundling** to the pinned, already transitive `esbuild@0.25.12`. **Vite remains the development server** for `npm run dev` and preview. The release script `scripts/build.mjs` bundles `src/main.tsx` with React and CSS, inlines `import.meta.env.BASE_URL`, writes source-template HTML with root/subpath references and removes stale output. `tests/check_build_output.mjs` requires the emitted links/assets and Thai closed-voting banner for both bases. Tests must pass through full GitHub CI; no claims until verified.

Original failed-run history above is retained. **Do not merge on diagnostic success alone**, require successful full VOTE-1 CI. Future VOTE-2/3 may revisit Vite build once upstream package/plugin root cause isolated, but must not weaken release reproducibility or React dependency isolation.
