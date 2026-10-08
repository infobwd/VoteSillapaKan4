import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { makeRule70Proposals } from '../tools/prepare_rule70_options.mjs';

const read = (p) => JSON.parse(readFileSync(new URL('../' + p, import.meta.url), 'utf8'));
const source = read('catalog/rule70/source_documents.json');
const candidates = read('catalog/rule70/candidate_items.json');
const proposals = read('catalog/rule70/option_proposals_v2b.json');
const familyStaging = read('catalog/rule70/additional_families_v2b.json');

test('exact generated historical options are checked into source control', () => {
  assert.deepEqual(makeRule70Proposals(source,candidates),proposals);
});
test('each historical item is an independent source-namespaced option',()=>{
  assert.equal(proposals.options.length,126);
  assert.equal(new Set(proposals.options.map(x=>x.option_id)).size,proposals.options.length);
  assert.ok(proposals.options.every(x=>x.option_id.startsWith('rule70:s70-')));
  assert.ok(proposals.options.every(x=>x.origin==='sillapa70'));
  assert.ok(proposals.options.every(x=>!('canonical_activity_id' in x)));
});
test('never auto-open historical choices as live votes',()=>{
  assert.equal(proposals.is_live_voting_enabled,false);
  assert.equal(proposals.is_complete_extraction,false);
  assert.equal(proposals.is_official_74_rules,false);
  assert.ok(proposals.options.every(x=>x.is_live_ballot_item===false&&x.round_selection_status==='NOT_SELECTED'));
  assert.throws(()=>makeRule70Proposals(source,{
    ...candidates,items:[{...candidates.items[0],eligible_for_live_vote:true},...candidates.items.slice(1)]
  }),/Never auto-approve/);
});
test('37 parent families are not flattened into ballot options',()=>{
  assert.equal(familyStaging.rows.length,37);
  assert.ok(familyStaging.rows.every(x=>x.can_enter_round===false));
  assert.ok(familyStaging.rows.every(x=>!proposals.options.some(o=>o.option_id===x.source_family_id)));
});
test('source PDF and scoped level remain attached to each proposal',()=>{
  for(const option of proposals.options){
    const src=source.categories.find(x=>x.source_category_id===option.category_id);
    assert.equal(src.document_url,option.source_pdf_url);
    assert.ok(Number.isInteger(option.source_pdf_page)&&option.source_pdf_page>0);
  }
  assert.throws(()=>makeRule70Proposals(source,{
    ...candidates,items:[{...candidates.items[0],source_document_url:'https://invalid.example/rule.pdf'},...candidates.items.slice(1)]
  }),/Source PDF URL mismatch/);
});
test('unsupported scope stays absent; source options need no 73 or 74 export',()=>{
  assert.deepEqual(proposals.omitted_categories,['pilot','music','inclusion','disability','center']);
  assert.equal(makeRule70Proposals(source,candidates).count,126);
});
