import test from 'node:test';
import assert from 'node:assert/strict';
import { convertMasterCsv } from '../tools/convert_activity_master_csv.mjs';

test('Converts only minimal sanitized competition activities with IDs preserved',()=>{
 const input='activity_id,name,level_code,category\r\n"0004","คัดลายมือสื่อภาษาไทย","ป.1-ป.3","ภาษาไทย"\r\n';
 const rows=convertMasterCsv(input);
 assert.equal(rows.length,1);
 assert.equal(rows[0].activity_id,'0004');
 assert.equal(rows[0].level_code,'ป.1-ป.3');
});
test('RFC4180 quoted text and embedded commas parse',()=>{
 const rows=convertMasterCsv('activity_id,name,level_code\n"act,5","เพลงไทย, ดนตรี","P4-P6"\n');
 assert.equal(rows[0].activity_id,'act,5');
 assert.equal(rows[0].name,'เพลงไทย, ดนตรี');
});
test('Rejects PII, missing headers, duplicate IDs, malformed CSV',()=>{
 assert.throws(()=>convertMasterCsv('activity_id,name,level_code,student_name\na,b,P1-P3,X\n'),/Unexpected CSV column/);
 assert.throws(()=>convertMasterCsv('activity_id,name\na,b\n'),/Missing CSV column/);
 assert.throws(()=>convertMasterCsv('activity_id,name,level_code\na,b,P1-P3\na,b,P1-P3\n'),/Duplicate canonical/);
 assert.throws(()=>convertMasterCsv('activity_id,name,level_code\n"a,b,P1-P3\n'),/Unterminated CSV quoted field/);
});
