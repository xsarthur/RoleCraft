// Derive a public reading/search package from the frozen v12 sources, without editing them.
import {readFileSync,writeFileSync,mkdirSync,realpathSync,copyFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
const here=path.dirname(fileURLToPath(import.meta.url)),project=path.resolve(here,'../..');
const sha=s=>createHash('sha256').update(s).digest('hex');
const manifestPath='textbooks/v12/assembly-manifest.json',curriculumPath='team/textbook-v12-curriculum.json';
const assembly=JSON.parse(readFileSync(path.join(project,manifestPath),'utf8')),curriculum=JSON.parse(readFileSync(path.join(project,curriculumPath),'utf8'));
if(assembly.version!=='textbook-v12'||assembly.order.length!==30||JSON.stringify(assembly.order)!==JSON.stringify(curriculum.readingOrder))throw Error('Frozen v12 reading order differs');
// The assembly manifest is the historical freeze. One approved source repair is
// explicitly allowed to differ from its recorded hash; keep both identities in
// the generated binding so consumers can distinguish the exception from drift.
const currentSourceOverrides=Object.freeze({
 'textbooks/v12/c01-selection.md':Object.freeze({
  previousAssemblySha256:'123f00a89c54dc0e0b18f7752ec5dcb443bf5490c8388068d38b1e7b421b7cd4',
  currentSourceSha256:'4ee70a19c07d14a550ff9f1fbcfb46ec26a3e236aef30b5d3f2b1ce3f190d982',
  reason:'Approved current v12 source repaired from stale derived index; assembly manifest retained as historical freeze.'
 })
});
const textbookRoot=realpathSync(path.join(project,'textbooks/v12'));
const readSource=sourcePath=>{const real=realpathSync(path.join(project,sourcePath));if(!real.startsWith(textbookRoot+path.sep))throw Error('Source escaped v12 root');return readFileSync(real);};
const readme=readSource('textbooks/v12/README.md').toString('utf8');
const labels=new Map([...readme.split('## 正式先修')[1].matchAll(/^\| \[([^\]]+)\]\(([-a-z0-9]+)\.md\)/gm)].map(m=>[m[2],m[1]]));
const stripMarkdown=text=>text.replace(/```[^\n]*\n[\s\S]*?```/g,'').replace(/!\[[^\]]*\]\([^)]*\)/g,'').replace(/\[([^\]]+)\]\([^)]*\)/g,'$1').replace(/[*`#>]/g,'').trim();
const units=assembly.order.map((unitId,i)=>{
 if(!/^[-a-z0-9]+$/.test(unitId))throw Error('Unapproved unit identity');
 const sourcePath=`textbooks/v12/${unitId}.md`,bodyMarkdown=readSource(sourcePath).toString('utf8'),sourceSha256=sha(bodyMarkdown);
 const assemblySha256=assembly.hashes[unitId+'.md'],override=currentSourceOverrides[sourcePath];
 if(override){
  // The dedicated repair entrypoint may transiently put the approved current
  // hash in the manifest while rebuilding. In either case, the frozen hash is
  // still recorded and checked through the override metadata.
  if(override.previousAssemblySha256!=='123f00a89c54dc0e0b18f7752ec5dcb443bf5490c8388068d38b1e7b421b7cd4'||![override.previousAssemblySha256,override.currentSourceSha256].includes(assemblySha256)||sourceSha256!==override.currentSourceSha256)throw Error('Approved source override differs: '+unitId);
 } else if(sourceSha256!==assemblySha256)throw Error('Frozen source differs: '+unitId);
 const specification=curriculum.units.find(u=>u.id===unitId);if(!specification||specification.path!==sourcePath||specification.prerequisites.some(id=>!assembly.order.includes(id)))throw Error('Curriculum unit differs');
 const lines=bodyMarkdown.split('\n'),headings=[];let fenced=false;
 for(let line=0;line<lines.length;line++){if(/^\s*```/.test(lines[line])){fenced=!fenced;continue;}const m=!fenced&&lines[line].match(/^(#{1,3})\s+(.+)$/);if(m)headings.push({start:line,level:m[1].length,title:m[2]});}
 const title=headings.find(h=>h.level===1)?.title;if(!title)throw Error('Chapter heading missing');
 const counts=new Map(),sections=headings.map((h,j)=>{const occurrence=(counts.get(h.title)||0)+1;counts.set(h.title,occurrence);const sectionId='s-'+sha(h.title+'\0'+occurrence).slice(0,12),body=lines.slice(h.start,headings[j+1]?.start??lines.length).join('\n').trim();return {sectionId,title:h.title,level:h.level,startLine:h.start+1,bodyMarkdown:body,searchText:stripMarkdown(body),href:`#learn/agent/${unitId}/${sectionId}`};});
 return {unitId,order:i+1,title,navigationLabel:labels.get(unitId)||title,sourcePath,sourceSha256,prerequisiteUnitIds:specification.prerequisites,coreQuestion:curriculum.chapters.find(c=>c.id===unitId)?.core||title,bodyMarkdown,sections,href:`#learn/agent/${unitId}`};
});
const bundle='textbooks/v12/agent-engineering-textbook.md',bookSha256=sha(readSource(bundle));if(bookSha256!==assembly.hashes['agent-engineering-textbook.md'])throw Error('Frozen bundle differs');
const assetNames=['agent-runtime-loop.png','agent-runtime-loop.svg','agent-runtime-loop.dot','agent-engineering-landscape-v12.png','agent-engineering-landscape-v12.svg'];
mkdirSync(path.join(project,'dist/content-v12-assets'),{recursive:true});
const assets=assetNames.map(name=>{const sourcePath='textbooks/v12/assets/'+name,raw=readSource(sourcePath);copyFileSync(path.join(project,sourcePath),path.join(project,'dist/content-v12-assets',name));return {name,sourcePath,sha256:sha(raw),href:'/api/content/assets/'+name+'?version=textbook-v12',staticHref:'content-v12-assets/'+name};});
// Explicit individual public resources only. No directory-prefix publication.
const resources=[
 'team/product-creation-standard.md','team/product-gates.json','team/textbook-v12-curriculum.md','team/textbook-v12-curriculum.json',
 'textbooks/v12/README.md','textbooks/v12/agent-engineering-textbook.md','textbooks/v12/examples/README.md',
 ...['n01-runtime-boundaries.py','n02-memory-routing.py','n03-plan-execution.py','n04-tool-catalog.py','n05-index-lifecycle.py','n06-graph-contracts.py','n06-graph.py','n07-delegation.py','n08-sandbox-policy.py','n09-memory-diagnostic.py','n09-runtime-recovery.py','n10-evaluation-matrix.py'].map(name=>'textbooks/v12/examples/'+name)
];
mkdirSync(path.join(project,'dist/content-v12-references'),{recursive:true});
const references=resources.map(sourcePath=>{const filename=path.posix.basename(sourcePath),name=sourcePath==='textbooks/v12/README.md'?'textbook-README.md':sourcePath==='textbooks/v12/examples/README.md'?'examples-README.md':filename,staticName=name.endsWith('.py')?name+'.txt':name,raw=readFileSync(path.join(project,sourcePath));copyFileSync(path.join(project,sourcePath),path.join(project,'dist/content-v12-references',staticName));return {name,sourcePath,sha256:sha(raw),kind:name.endsWith('.py')?'example_source':'public_reference',href:'/api/content/reference/'+name+'?version=textbook-v12',staticHref:'content-v12-references/'+staticName};});
const corpus={schemaVersion:'1',corpusVersion:'textbook-v12',corpusHash:sha(JSON.stringify(units.map(u=>[u.unitId,u.sourceSha256]))),bookSha256,units,assets,references,compatibility:null,sourceBinding:{assemblyManifestSha256:sha(readFileSync(path.join(project,manifestPath))),curriculumSha256:sha(readFileSync(path.join(project,curriculumPath))),currentSourceOverrides}};
writeFileSync(path.join(here,'content-v12-index.json'),JSON.stringify(corpus,null,2)+'\n');
writeFileSync(path.join(project,'dist/content-v12-data.js'),'/* Generated from frozen v12 sources; do not edit. */\nglobalThis.RolecraftContentV12='+JSON.stringify(corpus)+';\n');
console.log(JSON.stringify({units:units.length,sections:units.reduce((n,u)=>n+u.sections.length,0),assets:assets.length,references:references.length,corpusHash:corpus.corpusHash,bookSha256}));
