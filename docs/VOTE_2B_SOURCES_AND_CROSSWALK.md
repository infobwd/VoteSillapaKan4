# VOTE-2B — Historical rule 70 source audit & crosswalk handoff

Date: 8 October 2026. **Status: PRELIMINARY EVIDENCE + SAFE MATCH SUGGESTIONS ONLY; NO LIVE VOTES.**

## What has actually been done

- PR #3 (VOTE-2A) merged to `main` at `ff9a8e2`. It contains 18 source PDF links and **126 hand-staged item×level candidates from 13 categories**.
- This VOTE-2B PR reads the original PDF overview tables and registers a **coverage worksheet for all 18 categories**: `catalog/rule70/source_coverage_v2b.json`. It carefully distinguishes an official PDF *family/item count across สพป.+สพม.* from the smaller set of vote units suitable to SPP Kanchanaburi 4.
- `catalog/rule70/additional_families_v2b.json` adds **37 review-only family exemplars** from 5 formerly empty categories (pilot, music, 3 special-education categories); these are **NOT** ballot rows and may contain PARENT activities requiring further splitting.
- Adds strict offline reconciliation tool `tools/reconcile_rule70.mjs` and unit tests. It accepts a privately supplied **canonical master** containing only `activity_id`, `name`, `level_code`, optional `category` / `scope`, and emits **suggestions**. It will not match on Thai name alone if the level differs, chooses none if ambiguous, never approves items.
- CI confirms 18 source mappings, that items are blocked from live voting, and demo crosswalk decisions on synthetic master data.

## Audit takeaways from original PDFs

| Category | Original summary: main activities | PDF reported total entries | Caveat |
| --- | ---: | ---: | --- |
| ภาษาไทย | 7 | 29 | multiple school jurisdictions |
| คณิตศาสตร์ | 8 | 34 | several similarly named project types |
| วิทยาศาสตร์ | 5 | 20 | สพป.+สพม. combined |
| นักบินน้อย | 6 | — | six different aircraft types and stage-levels |
| สังคมฯ | 9 | 31 | sub-events including two chanting languages |
| สุขศึกษา | 2 | 14 | aerobics, muay thai, sport and quiz subtypes |
| ทัศนศิลป์ | 7 | 28 | levels for ม.1-3 may differ by สพป./สพม. |
| ดนตรี | 10 | 99 | 10 main activity families split to many instruments, bands and genders |
| นาฏศิลป์ | 6 | 20 | not all six available in SPP |
| ภาษาต่างประเทศ | pending | pending | multiple languages, some upper-secondary only |
| พัฒนาผู้เรียน | 4 | 27 | sub-events and school-division constraints |
| คอมพิวเตอร์ | 13 | 26 | Web Applications and Motion Infographic are distinct |
| หุ่นยนต์ | 4 | 16 | one combined 4-level × 4-family count |
| การงานอาชีพ | pending | pending | flower, craft and cooking subtypes |
| ปฐมวัย | 2 | 2 | distinct preschool-only scope |
| การศึกษาพิเศษ (เรียนรวม) | 15 | 84 | disability types and school divisions; do NOT flatten |
| การศึกษาพิเศษ (เฉพาะความพิการ) | 42 | 152 | disability×level subtasks |
| ศูนย์การศึกษาพิเศษ | 10 | 107 | AGE (3–6, 7–12, 13–18) × disability combinations |

These numbers are taken from summary pages in original **#70/2565** PDFs and are **not** a count of #74 eligible or already-verified voter ballot items. For source PDFs see `source_coverage_v2b.json` and `source_documents.json`.

## Important discovered gaps / corrections

1. **Original PR #3 is intentionally partial**. 126 records were manually staged and cannot be called “full extraction” or “approved”. Exact labels, source pages and checked school jurisdiction must still be audited.
2. Pilot: six family types in PDF page 4; flying 3D and free rubber-powered variants belong to a particular level; **radio-controlled target model is upper-secondary สพม. in source**, not a vote-ready SPP item. Family `kind=SPM_ONLY_EXCLUDED` is a draft warning, not an approved exclusion.
3. Music: original summary explicitly says **10 main families, 99 all-scope entries**. Displaying 10 parent votes would incorrectly combine diverse instruments, genders and age groups. Preserve individual subtypes before building actual ballot rows.
4. Special education: official summary counts **15/84** (inclusive), **42/152** (specialist schools) and **10/107** (special centers). Reconciliation requires disability, age, educational jurisdiction and often team/individual subtype dimensions. Current generic key `activity_id+level_code` alone is insufficient to distinguish them. No auto mapping.
5. **Canonical master data is missing**. The AcademicCompetitionManager `db/README.md` says real `db/seed/raw/*.csv` and `db/seed/02-seed.sql` are intentionally .gitignored because of participant PII. `db/01-schema.sql` confirms opaque VARCHAR activity IDs and many-to-one `activity_levels`. We cannot claim any **real** 73/74 ID match without an authorized, sanitized activities-and-levels export.
6. Even exact normalized name+level is only a **review suggestion**: matching a historical title does not prove current rules or allowable school scope.

## Authoritative source & privacy

Competition source: https://github.com/infobwd/AcademicCompetitionManager, canonical prep branch `analysis/mysql-migration` (re-check latest ref when exporting). Only sanitized **activities and activity_levels** should be exported, never contestant/team/teacher/judge tables, contact details, passwords or SQL dump. The vote project must stay physically separate and **NEVER update Production 73**.

## How to run matching with a sanitized export

Prepare private file **outside Git** (example, made-up data shown below, do not use these IDs in production):

```json
[
  {"activity_id":"TEST-act004","name":"คัดลายมือสื่อภาษาไทย","level_code":"ป.1-ป.3","category":"ภาษาไทย"}
]
```

Then, in a local checkout:

```bash
node tools/validate_rule70_catalog.mjs
node --test tests/rule70_coverage.test.mjs tests/rule70_crosswalk.test.mjs
node tools/reconcile_rule70.mjs --master /secure/private/activities-levels.json --candidates catalog/rule70/candidate_items.json > /secure/private/reconciliation-draft.json
```

The output contains a **candidate-to-canonical suggested match table**, not approved canonical mapping. It rejects student/teacher/PII-like extra fields and duplicate master keys. Keep the master and output in private storage; they are not committed to GitHub.

### Decisions requiring an operator

- `ONE_EXACT_NAME_AND_LEVEL_SUGGESTION`: compare PDF/scope, **not auto-approve**.
- `AMBIGUOUS_MULTIPLE_CANONICAL_MATCHES`: manual choice or mark unresolved.
- `SAME_NAME_DIFFERENT_LEVEL`: do not merge levels automatically.
- `NO_EXACT_NAME_MATCH`: decide new approved activity, renamed activity or exclude after inspecting source.
- Families with missing level/disability/age scope **do not go through this candidate matcher** until an approved scoped catalog exists.

## What remains before VOTE-2B can close

- [ ] Complete exact row-by-row extraction for **all 18 source PDFs** (including all special subtypes) with source pages, column-level jurisdiction and applicable age/disability dimensions.
- [ ] Review/amend 126 preliminary candidate rows against actual PDFs (names, levels, team/gender distinctions).
- [ ] Obtain privacy-safe authoritative master export for #73/#74 and freeze source commit/hash/count.
- [ ] Run reconciler; operators review every ambiguous/new/matched ID, sign off approve/exclude lists.
- [ ] Agree SPP scope and whether special categories should be included at all.
- [ ] Produce exact deduplicated `(round, canonical ID, level, subtype/scope)` proposal and approve item snapshot for VOTE-2C.

**No real-ready item or complete crosswalk is claimed by this PR.** PR #2 remains blocked at Vite React Build; no dependency is introduced from this data branch into PR #2.

## Next workflow

VOTE-2B continues with verified source-completeness passes and sanitized master. VOTE-2C implements admin import preview after VOTE-1 Build issue resolved. VOTE-3 stays closed until roles/policy are ratified.
