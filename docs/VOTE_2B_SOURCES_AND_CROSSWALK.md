# VOTE-2B — Source 70 independent options & coverage review

Updated: 2026-10-08. **Historical source only / no database writes / no live voting.**

## Owner instruction (supersedes earlier crosswalk proposal)

**เกณฑ์ครั้งที่ 70 เป็นเพียง “ตัวเลือก” สำหรับเสนอให้ผู้แทนกลุ่มเครือข่ายลงมติ** ไม่จำเป็นต้องจับคู่กับกิจกรรมครั้งที่ 73/74 และไม่ต้องใช้ export ฐานข้อมูลการแข่งขันเดิม.

- `catalog/rule70/option_proposals_v2b.json`: 126 independently keyed **historical option proposals**; each has `option_id=rule70:<candidate_id>` and PDF provenance. They carry **no canonical activity_id**.
- `tools/prepare_rule70_options.mjs`: deterministic generator from source documents and 126 candidate×level rows; only *draft options*, no DB, no approval, no 73 master.
- `catalog/rule70/source_coverage_v2b.json`: 18 source category overviews with original PDF main-family counts; historical counts are not a verified number of area-level voting units.
- `catalog/rule70/additional_families_v2b.json`: 37 review-only **family examples** across 5 categories originally empty (pilot, music, special-education 3 types). Parent families are **NOT** selectable voting questions until split/reviewed where necessary.
- `tests/rule70_options.test.mjs` and coverage tests ensure provenance, count and non-activation.

Previous CSV export/crosswalk tools, scripts and operator instructions are **removed from this PR**, because they contradict the Owner's simpler requirement. The current `main` still contains historical VOTE-2A draft text anticipating matching; this PR updates its live roadmap.

## Historical original PDF category overview

| หมวดเกณฑ์ | กิจกรรมหลักที่รายงาน | รายการย่อยรวมตาม PDF |
| --- | ---: | ---: |
| ภาษาไทย | 7 | 29 |
| คณิตศาสตร์ | 8 | 34 |
| วิทยาศาสตร์ | 5 | 20 |
| นักบินน้อย | 6 | — |
| สังคมศึกษา | 9 | 31 |
| สุขศึกษา | 2 | 14 |
| ทัศนศิลป์ | 7 | 28 |
| ดนตรี | 10 | 99 |
| นาฏศิลป์ | 6 | 20 |
| ภาษาต่างประเทศ | รอตรวจ | รอตรวจ |
| พัฒนาผู้เรียน | 4 | 27 |
| คอมพิวเตอร์ | 13 | 26 |
| หุ่นยนต์ | 4 | 16 |
| การงานอาชีพ | รอตรวจ | รอตรวจ |
| ปฐมวัย | 2 | 2 |
| การศึกษาพิเศษ เรียนรวม | 15 | 84 |
| โรงเรียนเฉพาะความพิการ | 42 | 152 |
| ศูนย์การศึกษาพิเศษ | 10 | 107 |

Original #70 source index: https://sillapa.net/home/sillapa70-rule/. These counts may combine สพป./สพม.; they **cannot** be treated as a current #74 ballot count or eligibility decision. Every candidate must still have correct level/scope checked against the PDF.

## Contract — sources are independent

Two catalog origins may be presented in one round, but remain **distinct choices**:

1. **Historic rule70 proposal:** `origin=sillapa70`, `option_id=rule70:s70-...`, activity name, category, level and `source_pdf_url/source_pdf_page`. These do not depend on AcademicCompetitionManager IDs.
2. **Current competition catalog (optional and separately imported):** `origin=competition74` (or documented other competition source), with `option_id=competition74:<source_activity_id>:<source_level_code>`. Exact escaping and unique namespaced encoding must be decided and tested by implementation; do not concatenate arbitrary unescaped ID strings in production.

An administrative reviewer explicitly selects which individual options enter a round; some may look alike across sources. **No automatic joining, name-based reconciliation, or replacement**. The admin UI can warn on similar labels but must never auto-merge or hide either source. UI should show a clear source-year badge, source PDF link and level/subtype. One round item = one **approved `option_id`**. Ballot uniqueness = `(round_id, option_id, cluster_id)`, and each eligible cluster gets one vote per selected option. Existing YES/NO/ABSTAIN policy and certification gates remain intact.

**Do not interpret the 70 rule text as the official 74 competition rules.** These are historical candidate labels for a local selection vote.

## What is finished vs pending

| Part | State |
| --- | --- |
| PR #3 VOTE-2A: 18 PDF links and 126 draft candidate×levels | MERGED `ff9a8e2` |
| Original PDF summary audit / counts all 18 categories | CATALOG DATA PRESENT, manual validation still necessary |
| 37 family examples for the 5 previously empty source categories | REVIEW ONLY, not flattened into votes |
| 126 source-specific independent option proposals | GENERATED, all `DRAFT_REVIEW_REQUIRED` |
| Offline generator and integrity CI | IMPLEMENTED, check actual GitHub run |
| Full row-by-row extraction of all 18 PDFs | **NOT COMPLETE** |
| Source spelling, levels, subtype/gender, applicable สพป. scope review | **NOT COMPLETE** |
| Admin approve/exclude and freeze into round snapshot | Future VOTE-2C, after VOTE-1 Build passes |
| Voter authentication and submission | Future VOTE-3 |
| Production deployment | NOT AUTHORIZED |

## Preview commands

```bash
node tools/validate_rule70_catalog.mjs
node tools/prepare_rule70_options.mjs > rule70-options-review.json
node --test tests/rule70_coverage.test.mjs tests/rule70_options.test.mjs
```

The generated review file is **not a ballot import**. It may be used by VOTE-2C as the first *source-specific* options catalog after an admin verifies names/levels and explicitly selects items into a voting round.

## Remaining tasks before VOTE-2B closure

1. Audit all original PDFs and complete every eligible (activity × level × relevant subtype) candidate, with source page links and school-jurisdiction constraints; separate special education disability/age variants correctly.
2. Check/repair all 126 staged titles and levels against PDFs; flag obviously non-SPP sources. Do not claim they are already verified.
3. Make a reviewed source-specific catalog and provide an admin review/selection UI in VOTE-2C. Exclusion is not a NO ballot.
4. Block READY/OPEN unless the authorized item snapshot, eligible cluster roster and actual quorum/majority policy are signed off.
5. Do not connect to or modify AcademicCompetitionManager or Production 73. **No master export is needed.**

The VOTE-1 PR #2 remains OPEN and its frontend React/Vite build failure remains a separate blocker to running the application. This catalog PR can pass CI without changing that fact.
