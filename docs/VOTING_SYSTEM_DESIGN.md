# VOTING SYSTEM DESIGN LOCK — Option A

Version: Design Proposal v0.1 · 8 October 2026  
Repository: infobwd/VoteSillapaKan4  
Status: **Documentation only / awaiting review. No working vote system.**

## 1. Purpose and fixed scope

สร้างเว็บลงมติในการประชุมเตรียมจัดงานศิลปหัตถกรรมนักเรียน **ครั้งที่ 74** ว่ากิจกรรมใด **เห็นควรจัดการแข่งขันระดับเขตพื้นที่** พร้อมผลรวมแยกหมวดและระดับชั้น เพื่อประกอบมติที่ประชุม

**DESIGN LOCK**
- หนึ่งคำถาม = หนึ่ง **กิจกรรม × ระดับชั้น × รอบโหวต**; ตอบ YES (จัด), NO (ไม่จัด), ABSTAIN (งดออกเสียง) เท่านั้น
- **MISSING** (ไม่ลงคะแนน/ยังไม่ส่งผล) แยกจาก ABSTAIN ชัดเจน
- หนึ่ง **กลุ่มเครือข่าย = หนึ่งเสียงต่อคำถาม** ไม่ใช่หนึ่งโรงเรียนหรือหนึ่งคน
- ประธานกลุ่มหรือผู้แทนที่ได้รับมอบหมายใช้สิทธิ์เดียวกัน; ห้ามเพิ่มเสียงหรือลงคะแนนซ้ำ
- บันทึกร่างไม่ถูกนับคะแนน; เมื่อยืนยันส่งจึงนับ และแก้ไขระหว่าง OPEN ได้พร้อมเก็บประวัติการแก้
- ผลโหวตเป็น **ข้อมูลประกอบการตัดสินใจ** ไม่ใช่มติจัด/ยกเลิกกิจกรรมอัตโนมัติ
- ผลคำนวณคะแนน / มติรับรองโดยคณะกรรมการ / การเผยแพร่ผล เป็นคนละขั้น
- Database เว็บโหวต **แยกต่างหาก** และไม่เขียนกลับฐาน AcademicCompetitionManager หรือ Production 73
- นำเข้ารายการกิจกรรม กลุ่ม และระดับชั้นด้วยการตรวจสอบ/นำเข้าแบบ read-only และเก็บ snapshot ก่อนเริ่มรอบ
- เผยแพร่เฉพาะผลที่ผ่านการอนุมัติ; ไม่เปิดเผยเสียงรายกลุ่มในระหว่าง OPEN

**ยังไม่ล็อกเป็นกติกาที่ใช้จริง:** จำนวน/รายชื่อกลุ่มที่มีสิทธิ์, ค่า quorum, กติกาเสียงเท่ากัน, วันเวลา, กิจกรรมยกเว้น, ผู้มีอำนาจรับรอง — ต้องลงนามหรือรับรองก่อนเปิดรอบจริง (VOTING_POLICY.md)

## 2. Personas / permission boundaries

| Role | Allowed |
| --- | --- |
| Central admin | ดูแลบัญชี, นำเข้ารายการ, กำหนดรอบ/สิทธิ์, เปิด/ปิดรอบ, audit/export ตามสถานะ |
| Cluster chair / delegated representative | ดูเฉพาะรอบที่มีสิทธิ์ ลงคะแนน/ดู/แก้คะแนนของกลุ่มตนเองภายในเวลา OPEN |
| Meeting certifier | ดูผลปิดรอบ บันทึกมติรับรองและเหตุผล ตรวจสอบฉบับรายงาน |
| Public visitor | ดูเฉพาะผลรวมที่ PUBLISHED แล้ว ไม่มีสิทธิ์เห็น ballot/บัญชี |

Backend ต้องอนุญาตจาก session+roster snapshot เท่านั้น **ห้ามเชื่อ cluster_id หรือ role ที่ browser ส่งมา**. ผู้ดูแลไม่อาจ vote แทนกลุ่มผ่านหน้า admin; กรณีมอบหมาย/เปลี่ยนตัวผู้แทนต้องมี audit และเวลาเริ่ม/ยกเลิกสิทธิ์

## 3. User journeys

**Admin:** import preview -> validate master IDs/level codes/duplicates -> commit import -> create round -> select items + eligible clusters -> lock policy -> open -> monitor completion only -> close -> review results -> record certification -> publish/export if approved

**Voter:** login -> identity bound to one eligible cluster -> search/filter by category and level -> choose YES/NO/ABSTAIN -> save draft -> review unanswered -> confirm submission -> receipt with timestamp/revision -> revise if still OPEN

**Chair:** on CLOSED, see aggregate + quorum/tie/missing per item -> review exceptions -> record meeting decision / reasons / supporting reference -> certify; publishing is separate authorization

## 4. Screen design

1. Public landing: ชื่อการประชุม รอบการลงมติ ช่วงเวลา วิธีเข้าสู่ระบบ; ไม่มีผลที่ยังไม่อนุมัติ
2. Admin import: ไฟล์ต้นทาง, commit/ref/time/checksum, counts, preview row errors/warnings, duplicate activity+level and clusters, import history
3. Admin round setup: inclusion/exclusion reason, snapshot/roster, draft rules, preview, OPEN/CLOSE confirmation
4. Mobile-first voting: รายการกิจกรรม, หมวด, ระดับชั้น, ชื่อ/rule, 3-choice radio; ค้นหา/กรอง; progress, unanswered review, confirmed submitted count
5. Submission receipt: รอบ, กลุ่ม, จำนวนที่ส่ง, timestamp, receipt ID, revision; ไม่เผยของผู้อื่น
6. Closed dashboard: E, S, YES, NO, ABSTAIN, MISSING per item; filters category/level; summary provisional vs certified labels
7. Certified minutes/export: ผลคะแนน, quorum policy/version, มติสุดท้าย, ผู้รับรอง, เหตุผล/เอกสารอ้างอิง, format CSV/XLSX/PDF when implemented

UX: Thai language, responsive 320px+, usable tablet/desktop, adequate contrast and keyboard focus, large touch targets, loading/error states, pagination or virtualization for long catalog, status never communicated by color alone. Draft save failures must be visible, not falsely indicated as saved.

## 5. Lifecycle and invariants

Round: DRAFT -> READY -> OPEN -> CLOSED -> CERTIFIED -> PUBLISHED (publication optional). Can CANCEL before/while OPEN with audit and preserved evidence, not rewritten as CLOSED. A request received after server-side closing time fails even if client's local time is wrong.

- Snapshot list, roster and tally-rule version immutable once OPEN.
- Unique ballot: (round_id, round_item_id, cluster_id). Use DB uniqueness + transaction + idempotency key.
- A ballot can hold YES/NO/ABSTAIN only. No value means MISSING.
- Draft is not a submitted ballot. Subsequent edits create append-only ballot revision event and update current logical ballot atomically.
- One item = canonical source activity_id + level_code; IDs are opaque UTF-8 strings (do not cast to integers or normalize away leading zeros).
- CLOSE captures calculated tally, immutable version/hash and closer identity/time.
- No silent reopen. If formal re-vote is required, create a linked successor round with explicit authority/reason (implementation may be later PR).
- CERTIFIED stores resolution separately from computed vote and permits reasoned exceptions; publishing never leaks raw PII.
- No automatic writes to competition team registration, activities, scores, results, judge data or Production 73.

## 6. Conceptual schema — planning, not DDL

- import_batches (source reference/commit or export identity, SHA-256, timestamps, row counts, validation report)
- activity_catalog / activity_levels / cluster_catalog (source IDs, display snapshots, import version)
- accounts, auth_sessions, cluster_memberships, delegations (scope, role, validity, revocation)
- voting_rounds (status, opens_at, closes_at, rule_version, rule_hash, roster_snapshot_hash)
- round_items (round_id, item_id, source_activity_id, level_code, name/category snapshot, inclusion reason)
- eligible_clusters (round_id, source_cluster_id, group name snapshot, approved voter mapping)
- ballot_drafts (private, excluded from tally)
- ballots (round_id, item_id, cluster_id, choice, revision, submitted_at, actor_id)
- ballot_events (append-only, old/new, actor, UTC timestamp, request ID, reason)
- tally_snapshots, decisions, certifications, publications
- audit_events / export_records

Foreign keys, unique constraints, transactions, indexes and role-scoped reads are mandatory. Avoid storing students, teachers, contestant rosters or personal contact data.

## 7. Technical recommendation (subject to hosting check)

React + TypeScript + Vite frontend, PHP 8/PDO backend, MySQL/MariaDB separate database on the existing compatible hosting stack. Login by centrally provisioned accounts: prefer secure HttpOnly/Secure/SameSite session cookie with CSRF protection once verified on host. Password hashing, password-reset/admin handoff, account revocation, session rotation and login throttling required. LINE/OTP is **not** included in first implementation.

Proposed API resources (contracts to define/test in implementation):
- admin imports preview/commit; round create/list/items/eligibility/open/close
- voter my-rounds/my-ballots/drafts/submit/receipt
- chair round aggregate/certify/export
- public published certified aggregate only

All HTTP write operations require server-side role, scope, open-state, deadline, and freshness checks; safe retry with request ID and deterministic errors.

## 8. Risk register

| Risk | Mitigation / gate |
| --- | --- |
| Duplicate/concurrent submissions | unique DB key + transaction + idempotency; concurrent automated tests |
| Wrong cluster can vote | server-derived tenancy and membership; cross-cluster 403 tests |
| Influence from interim vote results | hide choices/tallies until CLOSED; show participation counts only |
| Wrong roster, master changes | import preview+hash; immutable round snapshot |
| CSRF/replay/session theft | secure auth, CSRF, expiry, logout revocation, throttling |
| Backdating / late submissions | server UTC timestamp + clock comparison; Thai local UI |
| Premature publishing | separate certify/publish steps and audit |
| CSV export formula injection | escape spreadsheet formula-leading cells; UTF-8 BOM if needed |
| Data loss | encrypted/access-controlled backups, isolated restore drill, audit verification |
| Inappropriate policy defaults | owner/committee acceptance before READY/OPEN |

## 9. V1 exclusions

No selecting cluster-vs-area route (Option B), host/site votes (Option C), budgets, judges, team registrations, scoring, awards, public self-registration, direct write-back to source repo/DB, or production migration. No automatic deployment.

## 10. Review/approval gate

Approve design scope and threat boundaries first. Separately ratify VOTING_POLICY.md policy fields and acceptance roster before implementing real OPEN. See DATA_INTEGRATION_CONTRACT.md and IMPLEMENTATION_PLAN.md. This document is a proposal, not authorization to merge/deploy or run production DB changes.
