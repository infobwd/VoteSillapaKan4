import { readFileSync } from 'node:fs';
import { validateMaster } from './reconcile_rule70.mjs';

/** RFC4180-compatible small CSV reader: quoted commas, CRLFs and escaped quotes. */
export function parseCsv(csv) {
  if (typeof csv!=='string') throw new Error('CSV must be UTF-8 text');
  if (csv.charCodeAt(0)===0xFEFF)csv=csv.slice(1);
  const rows=[];
  let field='', row=[], quoted=false, afterQuote=false;
  for(let i=0;i<csv.length;i++){
    const ch=csv[i];
    if(quoted){
      if(ch==='"'&&csv[i+1]==='"'){field+='"';i++;continue;}
      if(ch==='"'){quoted=false;afterQuote=true;continue;}
      field+=ch;continue;
    }
    if(afterQuote){
      if(ch===' '||ch==='\t')continue;
      if(ch!==','&&ch!=='\n'&&ch!=='\r')throw new Error('Invalid characters after CSV quote');
      afterQuote=false;
    }
    if(ch==='"'){
      if(field.trim()) throw new Error('Unexpected quote inside unquoted field');
      quoted=true;continue;
    }
    if(ch===','){row.push(field);field='';continue;}
    if(ch==='\r'||ch==='\n'){
      if(ch==='\r'&&csv[i+1]==='\n')i++;
      row.push(field);field='';
      if(row.some(x=>x!==''))rows.push(row);
      row=[];continue;
    }
    field+=ch;
  }
  if(quoted)throw new Error('Unterminated CSV quoted field');
  if(afterQuote){ /* a closed CSV quote may end without a linefeed */ }
  if(field!==''||row.length){row.push(field);if(row.some(x=>x!==''))rows.push(row);}
  return rows;
}
export function convertMasterCsv(csv) {
  const rows=parseCsv(csv);
  if(!rows.length)throw new Error('CSV is empty');
  const headers=rows[0].map(x=>x.trim());
  const approved=['activity_id','name','level_code','category','scope'];
  if(new Set(headers).size!==headers.length)throw new Error('Duplicate CSV headers');
  for(const col of headers)if(!approved.includes(col))throw new Error('Unexpected CSV column: '+col);
  for(const required of ['activity_id','name','level_code'])if(!headers.includes(required))throw new Error('Missing CSV column: '+required);
  if(rows.length>10001)throw new Error('Too many activity-level rows');
  const result=rows.slice(1).map((values,i)=>{
    if(values.length!==headers.length)throw new Error('CSV column count mismatch at row '+(i+2));
    const mapped=Object.fromEntries(headers.map((h,j)=>[h,values[j]]));
    return mapped;
  });
  validateMaster(result);
  return result;
}
if(process.argv[1]?.endsWith('convert_activity_master_csv.mjs')){
 const filepath=process.argv[2];
 if(!filepath)throw new Error('Usage: node tools/convert_activity_master_csv.mjs /private/activities-levels.csv > /private/master.json');
 const content=readFileSync(filepath,'utf8');
 if(content.length>8*1024*1024)throw new Error('CSV too large');
 const rows=convertMasterCsv(content);
 console.log(JSON.stringify(rows,null,2));
}
