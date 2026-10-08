# VoteSillapaKan4 — Sillapa Kan 4 Vote

ระบบลงมติการจัดการแข่งขันงานศิลปหัตถกรรมนักเรียน **ครั้งที่ 74** ระดับเขตพื้นที่

> **สถานะใน VOTE-1 Branch: โครงเว็บและ API พื้นฐานสำหรับตรวจ CI — ยังไม่เปิดโหวต**
>
> มี React/TypeScript, Vite development server, esbuild production bundle และ PHP health/readiness. ระบบจริงยังไม่มีบัญชี สิทธิ์ ลงคะแนน หรือการติดตั้ง Production และต้องรับรองกติกาก่อนเปิดใช้งาน

## Scope — Option A

สำหรับแต่ละ **กิจกรรม × ระดับชั้น** ให้กลุ่มเครือข่ายที่มีสิทธิ์ลงมติ **เห็นควรจัดการแข่งขันระดับเขต / ไม่เห็นควรจัด / งดออกเสียง** โดยหนึ่งกลุ่มมีหนึ่งเสียงต่อรายการต่อรอบ

- การยังไม่โหวต (MISSING) ไม่เท่ากับงดออกเสียง (ABSTAIN)
- คะแนนกลุ่มต้องได้รับการยืนยันก่อนถูกนับ; แก้ได้ก่อนปิดรอบพร้อมบันทึกเหตุการณ์
- เกณฑ์องค์ประชุมและกติกาตัดสินต้องได้รับการรับรองก่อนเปิดโหวตจริง
- ผลโหวตเป็นข้อเสนอประกอบการประชุม ไม่เท่ากับมติที่รับรองแล้ว
- ฐานข้อมูลและบัญชี VoteSillapaKan4 แยกจากระบบแข่งขันหลักโดยเด็ดขาด

## Design documents

1. [Voting System Design Lock](docs/VOTING_SYSTEM_DESIGN.md) — Scope, UX, roles, data model, security
2. [Voting Policy](docs/VOTING_POLICY.md) — Voting unit, tally/quorum proposal, approval gates
3. [Data Integration Contract](docs/DATA_INTEGRATION_CONTRACT.md) — Verified activity/level/cluster IDs, import provenance and frozen snapshots
4. [Implementation Plan](docs/IMPLEMENTATION_PLAN.md) — Phased PRs VOTE-0 through VOTE-5, dependencies, testing and deployment
5. [Acceptance Test Plan](docs/ACCEPTANCE_TEST_PLAN.md) — Authorization, concurrency, quorum math, backup/restore, GO/NO-GO

## Authoritative competition source

Source reference: https://github.com/infobwd/AcademicCompetitionManager

Before importing data inspect its latest canonical branch, source code and schema. Do not rely on its older main baseline without verification. Use read-only versioned CSV/JSON import of activity, levels and cluster master lists; preserve opaque source IDs. No write access to Production 73, historical scores, teams, results or judges.

## Development lifecycle

Before every coding task check latest GitHub main, open PRs, CI, README and design/policy documents.

**VOTE-0 design PR -> owner review -> VOTE-1 scaffold/CI -> VOTE-2 import/rounds -> VOTE-3 auth/vote -> VOTE-4 tally/certification/export -> VOTE-5 isolated staging/acceptance -> explicit Production GO.**

New development happens in reviewed PRs with synthetic automated tests. การ Merge โค้ดไม่ใช่การอนุมัติเปิดโหวตหรือ Deploy Production.

## Open decisions before a real vote

Approved eligible clusters, exact activity-level selection, quorum threshold and treatment of abstentions, tie rule, opening/closing window, activities mandated by regulations, official certifier and publication permission. See [Policy Approval Checklist](docs/VOTING_POLICY.md).

## เพิ่มแหล่งรายการโหวตจากเกณฑ์ครั้งที่ 70 (ปีการศึกษา 2565)

เพิ่ม [Historical Rule 70 catalog integration](docs/SILLAPA70_CATALOG_INTEGRATION.md) เป็นข้อมูลย้อนหลังสำหรับเสนอรายการกิจกรรมและช่วงชั้น (Option A) พร้อมลิงก์เกณฑ์ต้นทาง:

- [18 PDF category sources](catalog/rule70/source_documents.json), แยกเอกสารท้องถิ่นภาคอีสานออกจาก scope ของเขต 4
- [126 candidate activity × level rows (DRAFT/PARTIAL)](catalog/rule70/candidate_items.json) ครอบคลุมบางรายการใน 13/18 หมวด **ไม่ใช่รายการทั้งหมด**
- ตรวจด้วย `node tools/validate_rule70_catalog.mjs`; ไม่มีโหวตจริง ไม่มีการเขียนฐานข้อมูล

**รายการครั้งที่ 70 เป็นตัวเลือกอิสระ ไม่ต้องเทียบรหัสกิจกรรมครั้งที่ 73/74** แต่ต้องตรวจชื่อ/ช่วงชั้น/ขอบเขตและรับรองรายการก่อนเปิดโหวตจริง


## VOTE-2B — Historic Rule70 independent option proposals (Owner 2026-10-08)

- **126 unapproved standalone choices** from #70 source: [option_proposals_v2b.json](catalog/rule70/option_proposals_v2b.json) with distinct `option_id=rule70:s70-...`, historical PDF link, category and level.
- **No #73/#74 ID mapping and no production/master data export are required.** `node tools/prepare_rule70_options.mjs` regenerates the review-only catalog; CI checks provenance and all options stay disabled until admin review.
- [18-source coverage](catalog/rule70/source_coverage_v2b.json), [37 extra parent families](catalog/rule70/additional_families_v2b.json), [VOTE-2B review and limitations](docs/VOTE_2B_SOURCES_AND_CROSSWALK.md).
- A list entry becomes a voting question only after admin validates the source/level/scope and explicitly includes it in a round. Historical rules must not be represented as official #74 scoring criteria.
- VOTE-1 PR #2 ใช้ esbuild ทำไฟล์ Production แทนเส้นทาง Vite ที่ค้างกับ ReactDOM; ยังคง Vite Development Server และต้องยืนยัน CI ของ PR #2 ก่อน Merge. ไม่มีการ Deploy.


## VOTE-1 Implementation Candidate — PR #2

- React/TypeScript mobile-first landing **“ยังไม่เปิดลงคะแนน”** พร้อมสถานะ PHP Read-Only health.
- PHP 8.3 API **GET** `api/?action=health` (`votingEnabled:false`) และ `api/?action=ready` ตรวจ DB แยก; ไม่มี endpoint ส่งคะแนน/สมัครสมาชิก.
- `npm ci`, `npm test`, `npm run build`, `APP_BASE=/vote-staging/ npm run build`; Build Production ใช้ `esbuild@0.25.12` ที่ตรึงเวอร์ชัน เนื่องจาก Vite/Rollup ติดค้างเมื่อประมวลผล `react-dom/client`. Vite ยังใช้เป็น Dev Server และ Preview.
- [CI investigation](docs/VOTE_1_CI_INVESTIGATION.md) และ [isolated staging handoff](docs/VOTE_1_STAGING_HANDOFF.md) มีรายละเอียดและขอบเขต.
- ทั้งระบบฐานข้อมูล/บัญชีผู้ใช้ การเลือกตัวเลือกจากเกณฑ์ครั้งที่ 70 และระบบโหวตจริงเป็นงาน VOTE-2/VOTE-3 แยก PR. Data source ครั้งที่ 70 ยังคงเป็นตัวเลือกอิสระ ไม่ต้องจับคู่กับครั้งที่ 73/74.
- **ไม่มีการ Deploy / ไม่ใช่ Production GO**; โปรดดู CI ล่าสุดของ PR #2 ก่อนอนุมัติ Merge.


## VOTE-2C1 (read-only archival option viewer, no votes)

The home page includes an accessible, filterable read-only preview of **126 preliminary source options** from Sillapa 70/2565, including category/grade/source-PDF link, 12 items per page and clear `รอตรวจสอบ` status. It is NOT a live ballot or approval interface; 5 categories await subtype-level extraction and no current #74 rules are inferred. VOTE-2C2 admin review and VOTE-3 login/voting are future phases.

CI tests the viewer with `npm test`, root/subpath production asset builds, PHP read-only API and isolated DB. No server deployment is included.
