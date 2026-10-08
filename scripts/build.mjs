import { build } from 'esbuild';
import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, relative, resolve, sep } from 'node:path';

const base=process.env.APP_BASE||'/';
if (!/^\/(?:[a-zA-Z0-9_-]+\/)*$/.test(base)) {
  throw new Error('APP_BASE must be absolute and end with / (example /vote-staging/)');
}
const outDir=resolve('dist');
rmSync(outDir,{recursive:true,force:true});
mkdirSync(outDir,{recursive:true});
const result=await build({
  absWorkingDir:process.cwd(),
  entryPoints:['src/main.tsx'],
  outdir:'dist/assets',
  bundle:true,
  platform:'browser',
  format:'esm',
  target:['es2022'],
  jsx:'automatic',
  minify:true,
  charset:'utf8',
  sourcemap:false,
  metafile:true,
  entryNames:'main-[hash]',
  assetNames:'asset-[hash]',
  define:{
    'process.env.NODE_ENV': '"production"',
    'import.meta.env.BASE_URL':JSON.stringify(base)
  },
  logLevel:'info',
  legalComments:'none'
});
const assets=Object.entries(result.metafile.outputs);
const js=assets.filter(([name,info])=>info.entryPoint==='src/main.tsx'&&name.endsWith('.js'));
if(js.length!==1)throw new Error('Missing unique app JavaScript bundle');
const cssName=js[0][1].cssBundle;
if(typeof cssName!=='string'||!cssName.endsWith('.css'))throw new Error('Missing stylesheet bundle');
const url=(asset)=>base+relative(outDir,resolve(asset)).split(sep).join('/');
const html=readFileSync('index.html','utf8');
const expected='<script type="module" src="/src/main.tsx"></script>';
if(!html.includes(expected))throw new Error('Unexpected source HTML template');
const page=html.replace(expected,
  '<link rel="stylesheet" href="'+url(cssName)+'" />\n    <script type="module" src="'+url(js[0][0])+'"></script>');
writeFileSync('dist/index.html',page);
console.log('Production static bundle generated for APP_BASE='+base);
