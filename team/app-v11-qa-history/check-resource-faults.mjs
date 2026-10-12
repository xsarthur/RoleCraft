import {mkdtempSync,mkdirSync,copyFileSync,writeFileSync,readFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const root=new URL('../../',import.meta.url),here=new URL('.',import.meta.url);
const corpus=JSON.parse(readFileSync(new URL('server/retrieval/content-v10-index.json',root),'utf8'));
const rows=[];
for(const kind of ['missing-index','source-hash-mismatch','missing-model-resources']){
 const fixture=mkdtempSync(path.join(tmpdir(),'rolecraft-v11-qa-resource-'));
 for(const sub of ['server/retrieval','dist','textbooks/v10'])mkdirSync(path.join(fixture,sub),{recursive:true});
 for(const src of ['server/retrieval/index.mjs','server/retrieval/semantic.mjs','dist/content-retrieval-core.js'])copyFileSync(new URL(src,root),path.join(fixture,src));
 for(const u of corpus.units)copyFileSync(new URL(u.sourcePath,root),path.join(fixture,u.sourcePath));
 if(kind!=='missing-index')writeFileSync(path.join(fixture,'server/retrieval/content-v10-index.json'),JSON.stringify(corpus));
 if(kind==='source-hash-mismatch')writeFileSync(path.join(fixture,corpus.units[0].sourcePath),'# incorrect fixture source\n');
 const module=await import(pathToFileURL(path.join(fixture,'server/retrieval/index.mjs')));
 const readiness=module.getContentReadiness();
 const output=await module.recommendContent({query:'程序中断恢复任务'});
 rows.push({kind,fixture,readiness,output,status:output.status==='unavailable'&&!output.results.length&&output.providerCalled===false?'pass':'fail'});
}
writeFileSync(new URL(`resource-faults-${process.argv[2]||'final'}.json`,here),JSON.stringify({executedAtUtc:new Date().toISOString(),method:'Three independent temporary public-source fixture copies. Actual working index/model/source untouched; no server DB or private files. Missing-model fixture tests resource failure before provider/import, not live external failure.',rows},null,2)+'\n');
console.log(JSON.stringify(rows.map(({kind,status,output})=>({kind,status,outputStatus:output.status}))));
