import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

const base=process.argv[2];
assert.ok(base==='/'||base==='/vote-staging/','Unexpected test base');
const html=readFileSync(resolve('dist/index.html'),'utf8');
assert.ok(!html.includes('/src/main.tsx'),'Source TSX script leaked into build');
assert.match(html,/<meta name="robots" content="noindex,nofollow"/);
const css=html.match(/<link rel="stylesheet" href="([^"]+\.css)"/);
const js=html.match(/<script type="module" src="([^"]+\.js)"/);
assert.ok(css&&js,'Missing asset references');
for(const url of [css[1],js[1]]){
  assert.ok(url.startsWith(base+'assets/'),'Asset is not under selected base: '+url);
  const rel=url.slice(base.length);
  assert.ok(existsSync(resolve('dist',rel)),'Missing referenced bundled file: '+rel);
}
const dir=readdirSync('dist/assets');
assert.equal(dir.filter(x=>x.endsWith('.js')).length,1,'Expected one bundled JS file');
assert.equal(dir.filter(x=>x.endsWith('.css')).length,1,'Expected one stylesheet');
const bundle=readFileSync(resolve('dist',js[1].slice(base.length)),'utf8');
assert.ok(bundle.includes('ยังไม่เปิดลงคะแนน'),'Thai closed-voting notice missing from bundle');
assert.ok(!bundle.includes('import.meta.env.BASE_URL'),'Vite dev base variable leaked to output');
console.log('PASS production assets and app-base='+base);
