import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));
const docs = read('../catalog/rule70/source_documents.json');
const candidates = read('../catalog/rule70/candidate_items.json');
const expectedLevel = new Set(['P1-P3','P4-P6','M1-M3','P1-P6','PRESCHOOL']);

function validate(source, dataset) {
  assert.equal(source.schema_version, '1.0');
  assert.equal(source.category_count, 18);
  assert.equal(source.categories.length, 18);
  assert.equal(source.academic_year_be, 2565);
  assert.match(source.index_url, /^https:\/\/sillapa\.net\/home\/sillapa70-rule\/$/);
  assert.equal(source.separate_regional_source.include_by_default, false);
  assert.equal(dataset.live_voting_allowed, false);
  assert.equal(dataset.never_automatic_import, true);
  assert.equal(dataset.count, dataset.items.length);
  assert.ok(dataset.items.length >= 1);
  const categoryIds = new Set();
  for (const s of source.categories) {
    assert.ok(!categoryIds.has(s.source_category_id), 'duplicated category');
    categoryIds.add(s.source_category_id);
    assert.ok(s.document_url.startsWith('https://www.sillapa.net/rule70/'), 'untrusted source');
    assert.equal(s.eligibility, 'NOT_ELIGIBLE_UNTIL_REVIEW');
  }
  const idSet = new Set();
  const unitSet = new Set();
  for (const item of dataset.items) {
    assert.ok(categoryIds.has(item.category_id), 'unknown category');
    assert.equal(item.eligible_for_live_vote, false, 'candidate cannot be used as live ballot');
    assert.equal(item.review_status, 'PENDING_MANUAL_REVIEW');
    assert.equal(item.match_status, 'UNMAPPED_73_74');
    assert.equal(item.canonical_activity_id, null);
    assert.equal(item.canonical_level_code, null);
    assert.ok(expectedLevel.has(item.level_code), 'unknown level');
    assert.ok(typeof item.name === 'string' && item.name.trim(), 'missing title');
    assert.ok(Number.isInteger(item.source_pdf_page) && item.source_pdf_page > 0, 'missing PDF page');
    assert.equal(item.source_document_url, source.categories.find(s=>s.source_category_id===item.category_id).document_url);
    assert.ok(!idSet.has(item.candidate_id), 'duplicate candidate ID');
    idSet.add(item.candidate_id);
    const key = JSON.stringify([item.category_id,item.name,item.level_code]);
    assert.ok(!unitSet.has(key), 'duplicate activity x level');
    unitSet.add(key);
    assert.match(item.candidate_id, /^s70-[a-z]+-\d{3}-(p1-p3|p4-p6|m1-m3|p1-p6|preschool)$/);
  }
}

validate(docs, candidates);
assert.throws(() => validate(docs, {...candidates, items:[...candidates.items, {...candidates.items[0]}], count:candidates.count+1}), /duplicate candidate ID/);
assert.throws(() => validate(docs, {...candidates,items:[{...candidates.items[0],eligible_for_live_vote:true},...candidates.items.slice(1)]}), /candidate cannot be used as live ballot/);
assert.throws(() => validate(docs, {...candidates,items:[{...candidates.items[0],source_document_url:'https://evil.example.invalid/rule.pdf'},...candidates.items.slice(1)]}), /Expected values to be strictly equal/);
console.log('PASS: '+docs.categories.length+' historical PDFs; '+candidates.items.length+' DRAFT activity-level candidate rows; all blocked from live voting and cross-source redirects.');
