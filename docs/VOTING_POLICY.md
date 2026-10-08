# VOTING POLICY — Option A

Date: 2026-10-08 · Status: **PROPOSED / OWNER AND MEETING RATIFICATION REQUIRED**  
This is a draft product policy, not an already-approved official committee resolution.

## 1. Ballot question

**“ท่านเห็นควรให้จัดการแข่งขัน [กิจกรรม] [ระดับชั้น] ในระดับเขตพื้นที่ สำหรับงานศิลปหัตถกรรมนักเรียน ครั้งที่ 74 หรือไม่?”**

- YES — เห็นควรจัด
- NO — ไม่เห็นควรจัด
- ABSTAIN — งดออกเสียงโดยตั้งใจและกดยืนยันส่ง
- MISSING — ไม่ได้ส่งคะแนน; ห้ามนับเป็นงดออกเสียงหรือไม่จัด

No Option B (cluster-vs-area) or Option C (host selection) in this project phase.

## 2. Who votes

- Each approved **cluster/network has one vote per round-item** regardless of school size.
- Chair or authorized delegate acts for that same cluster; delegation does not grant extra vote.
- Central admin configures eligible cluster snapshots and account associations; voting eligibility derived **server-side**, not client-selected cluster ID.
- Accounts are provisioned/approved by admin; anonymous registration and public voting are excluded.
- Identity and delegation changes need recorded authority, effective dates, revocation and audit.

## 3. Stages

DRAFT (prepare) -> READY (validated and locked) -> OPEN (vote) -> CLOSED (freeze and aggregate) -> CERTIFIED (meeting decision recorded) -> PUBLISHED (optional disclosure).

If canceled: record CANCELLED + reason, preserve ballots/audit, never label it certified. No silent reopening after CLOSED; revote requires linked new round with explicit reason and authority (formal workflow planned later).

## 4. Draft, submission, revision

- Draft selections are private and **never included in tally**.
- Vote is counted only after final submission acknowledgment.
- Edits/revisions possible only while OPEN and before authoritative server cutoff.
- Last valid submitted ballot is counted, with complete append-only ballot event history.
- The UI displays unanswered questions, an explicit confirmation screen and receipt ID/time/version.
- Ambiguous/invalid item IDs, inactive membership, post-deadline requests and cross-group votes fail safely.
- Duplicate/retried submit must not double count.

## 5. Candidate quorum and result formula — not yet approved

Define per item:
- E = number of eligible clusters in locked roster for the round
- Y = number of submitted YES
- N = number of submitted NO
- A = number of submitted ABSTAIN
- S = Y + N + A (participation)
- V = Y + N (valid affirmative/negative choices)
- M = E - S (missing submissions, not ballots)

**Proposed settings for committee decision**, not hardcoded statutory rules:
- Quorum = S >= ceil(2E/3) **per item**. ABSTAIN participates in quorum but not valid yes/no majority.
- If S < required quorum: NO_QUORUM (unresolved, not “not arrange”).
- Else if V = 0: NO_VALID_VOTES (unresolved).
- Else if Y > N: SUPPORTED (recommend arrange).
- Else if N > Y: NOT_SUPPORTED (recommend not arrange).
- Else Y = N: TIE (unresolved).
- Distinguish an activity legitimately excluded from voting (EXCLUDED_WITH_REASON) from a NO result.

**Sample only** E=10, Y=4, N=2, A=1, M=3 => S=7, V=6: proposal would classify SUPPORTED but **not automatically certified**.
E=10, Y=3, N=3, A=1, M=3 => TIE. E=10, Y=3, N=0, A=0, M=7 => NO_QUORUM.

Numerical quorum, abstention treatment, decision threshold, tied vote handling and eligible roster must be formally authorized by Owner/meeting **before a real vote round can transition to READY**. Implement these as configurable, locked policy fields with version/hash; no silent mid-round rule changes.

## 6. Separation of result and official resolution

Machine result is one of SUPPORTED / NOT_SUPPORTED / TIE / NO_QUORUM / NO_VALID_VOTES; it is not itself the official administrative decision.

Meeting resolution (separate record) = ARRANGE / DO_NOT_ARRANGE / DEFER / EXEMPT (where authorized), including certifier, meeting date/reference, rationale, policy hash and audit. A resolution differing from machine result must show a specific recorded reason and authority. If an item is mandated by applicable event regulations, mark exception/constraint before voting; do not infer from historical results.

## 7. Visibility/privacy

- While OPEN: cluster may view only its own submissions and receipt; admin may see participation completion, **not interim YES/NO/ABSTAIN tallies** in ordinary dashboard.
- At CLOSED: authorized meeting roles can review aggregate and exceptions; raw ballot identities restricted to audit roles and strictly logged.
- At PUBLISHED: disclose only approved aggregate and certified decisions. No student/teacher/judge personal data or group-by-group choices by default.
- Export has an explicit data scope, authorized role and provenance/version; CSV spreadsheet-formula injection protection mandatory.

## 8. Policy approval checklist (BLOCKER to real OPEN)

| Decision | Proposed default | Approval status |
| --- | --- | --- |
| Voting unit | 1 cluster = 1 vote/item | Design locked; verify approved clusters |
| Exact eligible clusters | Snapshot from verified roster | PENDING |
| Included activities/levels | Verified import with exclusions/reasons | PENDING |
| Quorum | ceil(2E/3), abstain counts for participation | PENDING |
| Majority | Y>N or N>Y, abstain excluded | PENDING |
| Tie | unresolved/committee consideration | PENDING |
| No quorum | unresolved; not automatically “no” | PENDING |
| Open/close dates/timezone | Server UTC; Thai display | PENDING |
| Who may certify | appointed committee officer | PENDING |
| Disclosure of vote-by-cluster | private by default | PENDING |
| Legal/rule-based compulsory events | explicit exemptions/constraints | PENDING |
| Late/revote process | linked new round; keep previous | PENDING |

## 9. Signed policy record (template)

- Vote round ID/name, meeting reference:
- Applicable event/academic-year regulations reference:
- Eligible groups and roster approval/version/hash:
- Activity-level item count and approved exclusions:
- Start/end date and time (Asia/Bangkok):
- Quorum and abstention rules:
- Required approval threshold, tie/no quorum handling:
- Certifier identity/authority:
- Disclosure level and retention period:
- Approving officer and approval date:
- Policy version/checksum:

Without an approved record, the system must permit only **preview/synthetic staging tests**, not a real vote round.
