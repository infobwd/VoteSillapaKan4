# Historical Sillapa 70 — supplementary independent voting option source

Owner confirmed 2026-10-08: **No canonical matching to #73/#74 is required.** The historical competition #70 rules are only an optional **source of choices** to vote on. This updates and supersedes the earlier VOTE-2A matching requirement, without rewriting already-merged history.

## Files and their meaning

- `catalog/rule70/source_documents.json`: 18 original historical PDF category links; northeast-only regional exception is excluded by default.
- `catalog/rule70/candidate_items.json`: partial 126 draft name×level rows in 13 categories. These are unreviewed source snippets; they are not current-year official activities.
- `catalog/rule70/option_proposals_v2b.json`: 126 distinct **historical source option IDs** generated from candidate rows, prefixed `rule70:`. **No #73/#74 mapping or database export.**
- `catalog/rule70/source_coverage_v2b.json`: 18 source-summary audit; counts include multiple school jurisdictions.
- `catalog/rule70/additional_families_v2b.json`: 37 additional main-family examples requiring level/subtype review; NOT yet individual options.

## Future admin and voter experience

Admin sees source tabs/filters: **ทั้งหมด | กิจกรรมเดิม | เกณฑ์ครั้งที่ 70**. Within the rule70 tab, the admin reviews source PDF and exact page, activity name, category, level/scope and optional subtype before selecting options into a specific round. An unchecked or unresolved proposal is not a ballot question.

Voters see each approved selection distinctly labeled: **“อ้างอิงเกณฑ์ครั้งที่ 70 (ปีการศึกษา 2565)”**. The PDF is linked as a historical reference, not presented as the effective #74 scoring rules. If a historic option and a competition option have a similar name, both remain separately identifiable; the admin chooses which are in the round. No automated matching/merging.

Each source option keeps `option_id` as its local durable identity, snapshotting label, level, category, PDF reference and current review decision once included. Each group votes YES/NO/ABSTAIN independently per approved round-item.

## Safety gates

- DRAFT rows cannot be sent to the voting API or counted in a real round.
- The rule70 dataset is **partial**. 5 categories still require proper detail-level extraction; special education requires age/disability/subtype selection rather than vote on a vague family title.
- Name, levels, source PDF page and eligibility/scope must be reviewed by the admin (historical data may be out of date).
- Quorum, eligible clusters, start/end time and certifier still need policy approval.
- Never write to Production 73, and do not create implicit decisions from historical documents.

## Verification

```bash
node tools/validate_rule70_catalog.mjs
node --test tests/rule70_coverage.test.mjs tests/rule70_options.test.mjs
node tools/prepare_rule70_options.mjs
```

Consult [VOTE-2B source options and coverage](VOTE_2B_SOURCES_AND_CROSSWALK.md) for exact progress and gaps.
