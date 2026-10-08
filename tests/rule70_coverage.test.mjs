import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const get=(p)=>JSON.parse(readFileSync(new URL('../'+p,import.meta.url),'utf8'));
const src=get('catalog/rule70/source_documents.json');
const coverage=get('catalog/rule70/source_coverage_v2b.json');
const families=get('catalog/rule70/additional_families_v2b.json');
const orig=get('catalog/rule70/candidate_items.json');

test('18 official source documents each have one VOTE-2B coverage state',()=>{
 assert.equal(src.categories.length,18);
 assert.equal(coverage.categories.length,18);
 assert.equal(new Set(coverage.categories.map(x=>x.category_id)).size,18);
 for(const x of coverage.categories){
  const source=src.categories.find(s=>s.source_category_id===x.category_id);
  assert.ok(source);
  assert.equal(x.source_document_url,source.document_url);
  assert.equal(x.reviewed_for_live_vote,false);
  assert.equal(x.completion,'NOT_COMPLETE');
  assert.equal(x.current_draft_candidate_rows,orig.items.filter(i=>i.category_id===x.category_id).length);
 }
});
test('previously uncovered 5 categories have staged family evidence, not votes',()=>{
 const missing=['pilot','music','inclusion','disability','center'];
 for(const id of missing)assert.ok(families.rows.some(x=>x.category_id===id),'missing family for '+id);
 const unique=new Set();
 for(const row of families.rows){
  assert.equal(row.can_enter_round,false);
  assert.equal(row.candidate_for_vote,false);
  assert.equal(row.review_status,'PENDING_SCOPE_AND_SOURCE_REVIEW');
  assert.equal(row.canonical_activity_id,null);
  assert.ok(!unique.has(row.source_family_id));
  unique.add(row.source_family_id);
 }
});
test('No old candidate or staged family is live',()=>{
 assert.ok(orig.items.every(x=>x.eligible_for_live_vote===false));
 assert.equal(families.live_vote_enabled,false);
});
