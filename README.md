# VoteSillapaKan4 — Sillapa Kan 4 Vote

ระบบลงมติการจัดการแข่งขันงานศิลปหัตถกรรมนักเรียน **ครั้งที่ 74** ระดับเขตพื้นที่

> **สถานะ 8 ตุลาคม 2569: DESIGN / DOCUMENTATION ONLY**
>
> Repository นี้อยู่ระหว่างออกแบบ ยังไม่มีเว็บสำหรับโหวต Backend ฐานข้อมูล หรือการติดตั้งใช้งานจริง และเอกสารไม่ใช่คำอนุมัติกติกาของคณะกรรมการ

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

New development happens in reviewed PRs with synthetic automated tests. No code changes, migrations, deploys or merges are authorized by this docs-only design PR.

## Open decisions before a real vote

Approved eligible clusters, exact activity-level selection, quorum threshold and treatment of abstentions, tie rule, opening/closing window, activities mandated by regulations, official certifier and publication permission. See [Policy Approval Checklist](docs/VOTING_POLICY.md).
