import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const src=readFileSync(new URL('../src/App.tsx',import.meta.url),'utf8');
const options=JSON.parse(readFileSync(new URL('../catalog/rule70/option_proposals_v2b.json',import.meta.url),'utf8'));
test('Viewer uses independent historical option IDs and filters by source and grade',()=>{
 assert.match(src,/historicalOptions\.options/);
 assert.match(src,/option\.option_id/);
 assert.match(src,/option\.category_id/);
 assert.match(src,/option\.level_code/);
 assert.match(src,/type="search"/);
 assert.match(src,/target="_blank" rel="noopener noreferrer"/);
 assert.equal(options.options.length,126);
 assert.ok(options.options.every(x=>x.option_id.startsWith('rule70:')));
});
test('Preview explicitly never displays a selectable vote or submit endpoint',()=>{
 assert.match(src,/ยังไม่เปิดลงคะแนน/);
 assert.match(src,/รอตรวจสอบ/);
 assert.match(src,/ปีการศึกษา 2565/);
 assert.doesNotMatch(src,/\bsubmitBallot\b|\bcastVote\b|\bvoteSubmit\b/);
 assert.ok(options.options.every(x=>x.is_live_ballot_item===false));
});
test('Only public PDF provenance is linked from review rows',()=>{
 assert.match(src,/href=\{item\.source_pdf_url\}/);
 assert.ok(options.options.every(x=>x.source_pdf_url.startsWith('https://www.sillapa.net/rule70/')));
});
