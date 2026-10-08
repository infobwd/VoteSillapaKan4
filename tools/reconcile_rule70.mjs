import { readFileSync } from 'node:fs';
import path from 'node:path';

/** This is a non-authoritative preview. It NEVER approves a candidate. */
export function normalizedName(s) {
  if (typeof s !== 'string') return '';
  return s.normalize('NFC').replace(/[\u200B-\u200D\uFEFF]/g,'').replace(/\s+/g,' ').trim().toLocaleLowerCase('th');
}
export function normalizedLevel(raw) {
  if (typeof raw !== 'string') return '';
  const s=raw.toUpperCase().trim().replace(/\s+/g,'').replace(/–|—/g,'-');
  if (/^(P1-P3|ป\.?(1|๑)-ป\.?(3|๓))$/u.test(s)) return 'P1-P3';
  if (/^(P4-P6|ป\.?(4|๔)-ป\.?(6|๖))$/u.test(s)) return 'P4-P6';
  if (/^(P1-P6|ป\.?(1|๑)-ป\.?(6|๖))$/u.test(s)) return 'P1-P6';
  if (/^(M1-M3|ม\.?(1|๑)-ม\.?(3|๓))$/u.test(s)) return 'M1-M3';
  if (/^(M4-M6|ม\.?(4|๔)-ม\.?(6|๖))$/u.test(s)) return 'M4-M6';
  if (/^(PRESCHOOL|ปฐมวัย|อ\.?(1|๑)-อ\.?(3|๓))$/u.test(s)) return 'PRESCHOOL';
  return '';
}
const allowedSourceKeys = new Set(['activity_id','name','activity_name','level_code','category','scope']);
export function validateMaster(master) {
  if (!Array.isArray(master)) throw new Error('Master must be an array of activity×level records');
  const seen=new Set();
  return master.map((row,i)=>{
    if (!row || typeof row!=='object' || Array.isArray(row)) throw new Error('Invalid master row '+i);
    for (const k of Object.keys(row)) {
      if(!allowedSourceKeys.has(k)) throw new Error('Unexpected/sensitive master column: '+k);
    }
    const activityId=row.activity_id, name=row.name??row.activity_name, level=normalizedLevel(row.level_code);
    if(typeof activityId!=='string'||!activityId.trim()||typeof name!=='string'||!normalizedName(name)||!level) throw new Error('Invalid master ID/name/level at '+i);
    const unique=JSON.stringify([activityId,level]);
    if(seen.has(unique)) throw new Error('Duplicate canonical activity-level key at '+i);
    seen.add(unique);
    return { activity_id:activityId, name, level_code:row.level_code, normalized_level:level,
      category:typeof row.category==='string'?row.category:'',scope:typeof row.scope==='string'?row.scope:'' };
  });
}
export function suggestMatches(items, master) {
  const valid=validateMaster(master);
  if(!Array.isArray(items))throw new Error('Candidates must be an array');
  return items.map(candidate=>{
    const result={candidate_id:candidate.candidate_id,category_id:candidate.category_id,
      candidate_name:candidate.name,candidate_level:candidate.level_code,
      decision:'REVIEW_REQUIRED',suggestions:[],can_enter_round:false};
    if(candidate.eligible_for_live_vote!==false||candidate.review_status!=='PENDING_MANUAL_REVIEW')throw new Error('Unsafe candidate state: '+candidate.candidate_id);
    const label=normalizedName(candidate.name), level=normalizedLevel(candidate.level_code);
    if(!label || !level)return {...result,reason:'INVALID_OR_UNSUPPORTED_LEVEL'};
    const equalName=valid.filter(x=>normalizedName(x.name)===label);
    const exact=equalName.filter(x=>x.normalized_level===level);
    if(exact.length===1)return {...result,reason:'ONE_EXACT_NAME_AND_LEVEL_SUGGESTION',suggestions:exact.map(x=>({activity_id:x.activity_id,level_code:x.level_code,source_category:x.category}))};
    if(exact.length>1)return {...result,reason:'AMBIGUOUS_MULTIPLE_CANONICAL_MATCHES',suggestions:exact.map(x=>({activity_id:x.activity_id,level_code:x.level_code,source_category:x.category}))};
    if(equalName.length)return {...result,reason:'SAME_NAME_DIFFERENT_LEVEL',suggestions:equalName.map(x=>({activity_id:x.activity_id,level_code:x.level_code,source_category:x.category}))};
    return {...result,reason:'NO_EXACT_NAME_MATCH'};
  });
}
function argsOf(argv){const out={};for(let i=0;i<argv.length;i+=2){if(!argv[i]?.startsWith('--')||!argv[i+1])throw new Error('Expected --master FILE and --candidates FILE');out[argv[i].slice(2)]=argv[i+1];}return out;}
if(process.argv[1] && path.resolve(process.argv[1])===path.resolve(new URL(import.meta.url).pathname)){
  const opts=argsOf(process.argv.slice(2));
  if(!opts.master || !opts.candidates) throw new Error('Usage: node tools/reconcile_rule70.mjs --master private-master.json --candidates catalog/rule70/candidate_items.json');
  const master=JSON.parse(readFileSync(opts.master,'utf8'));
  const candidates=JSON.parse(readFileSync(opts.candidates,'utf8')).items;
  const results=suggestMatches(candidates,master);
  const summary=results.reduce((a,x)=>(a[x.reason]=(a[x.reason]||0)+1,a),{});
  console.log(JSON.stringify({state:'SUGGESTIONS_ONLY_NOT_APPROVED',master_row_count:master.length,candidate_count:results.length,summary,results},null,2));
}
