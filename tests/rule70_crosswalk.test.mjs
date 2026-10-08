import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import { normalizedLevel, validateMaster, suggestMatches } from '../tools/reconcile_rule70.mjs';

const input=JSON.parse(readFileSync(new URL('../catalog/rule70/candidate_items.json',import.meta.url),'utf8'));
const candidate=input.items.find(x=>x.category_id==='thai'&&x.name==='คัดลายมือสื่อภาษาไทย'&&x.level_code==='P1-P3');
const synth=[{activity_id:'TEST-act000',name:'คัดลายมือสื่อภาษาไทย',level_code:'ป.1-ป.3',category:'ภาษาไทย'}];

test('recognizes Thai level without changing canonical source level string',()=>{
 assert.equal(normalizedLevel('ป.1-ป.3'),'P1-P3');
 assert.equal(normalizedLevel('ป.4-ป.6'),'P4-P6');
 assert.equal(normalizedLevel('ม.1-ม.3'),'M1-M3');
 assert.equal(normalizedLevel('M4-M6'),'M4-M6');
 assert.equal(normalizedLevel('ปฐมวัย'),'PRESCHOOL');
 assert.equal(normalizedLevel('???'),'');
});
test('suggestion never grants authority or live vote',()=>{
 const r=suggestMatches([candidate],synth)[0];
 assert.equal(r.reason,'ONE_EXACT_NAME_AND_LEVEL_SUGGESTION');
 assert.equal(r.suggestions[0].activity_id,'TEST-act000');
 assert.equal(r.suggestions[0].level_code,'ป.1-ป.3');
 assert.equal(r.can_enter_round,false);
 assert.equal(r.decision,'REVIEW_REQUIRED');
});
test('unknown and different-level candidates remain blocked',()=>{
 const unknown={...candidate,name:'ไม่มีในฐานจริง'};
 assert.equal(suggestMatches([unknown],synth)[0].reason,'NO_EXACT_NAME_MATCH');
 assert.equal(suggestMatches([{...candidate,level_code:'P4-P6'}],synth)[0].reason,'SAME_NAME_DIFFERENT_LEVEL');
});
test('same name and level across distinct IDs is ambiguous, not auto-picked',()=>{
 const both=[...synth,{activity_id:'TEST-act001',name:synth[0].name,level_code:synth[0].level_code}];
 const r=suggestMatches([candidate],both)[0];
 assert.equal(r.reason,'AMBIGUOUS_MULTIPLE_CANONICAL_MATCHES');
 assert.equal(r.suggestions.length,2);
});
test('sensitive/extra master columns and duplicate canonical keys rejected',()=>{
 assert.throws(()=>validateMaster([{...synth[0],student_name:'X'}]),/Unexpected\/sensitive/);
 assert.throws(()=>validateMaster([...synth,...synth]),/Duplicate canonical/);
});
test('draft cannot become eligible via unreviewed candidate mutation',()=>{
 assert.throws(()=>suggestMatches([{...candidate,eligible_for_live_vote:true}],synth),/Unsafe candidate state/);
 assert.throws(()=>suggestMatches([{...candidate,review_status:'APPROVED'}],synth),/Unsafe candidate state/);
});
