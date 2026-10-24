// Derive the formal Agent workbench package from textbooks/v13.
// v12 sources and derived artifacts are not modified.
import {readFileSync,writeFileSync,mkdirSync,realpathSync,copyFileSync,existsSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
const here=path.dirname(fileURLToPath(import.meta.url)),project=path.resolve(here,'../..');
const sha=s=>createHash('sha256').update(s).digest('hex');
const manifestPath='textbooks/v13/assembly-manifest.json';
const curriculumPath='team/textbook-v13-workbench-curriculum.json';
const baseCurriculumPath='team/textbook-v12-curriculum.json';
const assembly=JSON.parse(readFileSync(path.join(project,manifestPath),'utf8'));
const baseCurriculum=JSON.parse(readFileSync(path.join(project,baseCurriculumPath),'utf8'));
if(assembly.version!=='textbook-v13'||assembly.status!=='formal_agent_textbook'||assembly.order.length!==30)throw Error('v13 assembly is not the formal 30-unit corpus');
if(JSON.stringify(assembly.order)!==JSON.stringify(baseCurriculum.readingOrder))throw Error('v13 reading order differs from the v12 prerequisite contract');
const curriculum={
 schemaVersion:'1.0',
 version:'textbook-v13-workbench-curriculum',
 status:'formal_agent_reading_contract',
 role:'workbench reading order and prerequisites for textbook-v13',
 note:'Unit ids, order, and prerequisites are carried from team/textbook-v12-curriculum.json with paths rewritten to textbooks/v13. This file is the workbench binding, not a new pedagogical review and not a replacement of the frozen v12 curriculum.',
 baseCurriculum:baseCurriculumPath,
 readingOrder:baseCurriculum.readingOrder,
 units:baseCurriculum.units.map(unit=>({
  id:unit.id,
  path:String(unit.path||'').replaceAll('textbooks/v12/','textbooks/v13/'),
  prerequisites:unit.prerequisites||[],
 })),
 chapters:(baseCurriculum.chapters||[]).map(chapter=>({id:chapter.id,core:chapter.core||''})),
};
writeFileSync(path.join(project,curriculumPath),JSON.stringify(curriculum,null,2)+'\n');
const loadedCurriculum=JSON.parse(readFileSync(path.join(project,curriculumPath),'utf8'));
if(JSON.stringify(loadedCurriculum.readingOrder)!==JSON.stringify(assembly.order))throw Error('Written v13 reading contract differs');
const textbookRoot=realpathSync(path.join(project,'textbooks/v13'));
const readSource=sourcePath=>{const real=realpathSync(path.join(project,sourcePath));if(real!==textbookRoot&&!real.startsWith(textbookRoot+path.sep))throw Error('Source escaped v13 root: '+sourcePath);return readFileSync(real);};
const chapterHash=new Map(assembly.chapters.map(chapter=>[path.posix.basename(chapter.path),chapter.sha256]));
const assetHash=new Map(assembly.assets.map(asset=>[path.posix.basename(asset.path),asset.sha256]));
const readme=readSource('textbooks/v13/README.md').toString('utf8');
const labels=new Map([...readme.matchAll(/^\d+\.\s+\[([^\]]+)\]\(([-a-z0-9]+)\.md\)/gm)].map(match=>[match[2],match[1]]));
const stripMarkdown=text=>text.replace(/```[^\n]*\n[\s\S]*?```/g,'').replace(/!\[[^\]]*\]\([^)]*\)/g,'').replace(/\[([^\]]+)\]\([^)]*\)/g,'$1').replace(/[*`#>]/g,'').trim();
const units=assembly.order.map((unitId,index)=>{
 if(!/^[-a-z0-9]+$/.test(unitId))throw Error('Unapproved unit identity');
 const sourcePath=`textbooks/v13/${unitId}.md`,bodyMarkdown=readSource(sourcePath).toString('utf8'),sourceSha256=sha(bodyMarkdown);
 if(chapterHash.get(unitId+'.md')!==sourceSha256)throw Error('Frozen v13 source differs: '+unitId);
 const specification=loadedCurriculum.units.find(unit=>unit.id===unitId);
 if(!specification||specification.path!==sourcePath||specification.prerequisites.some(id=>!assembly.order.includes(id)))throw Error('Curriculum unit differs: '+unitId);
 const lines=bodyMarkdown.split('\n'),headings=[];let fenced=false;
 for(let line=0;line<lines.length;line++){if(/^\s*```/.test(lines[line])){fenced=!fenced;continue;}const match=!fenced&&lines[line].match(/^(#{1,3})\s+(.+)$/);if(match)headings.push({start:line,level:match[1].length,title:match[2]});}
 const title=headings.find(heading=>heading.level===1)?.title;if(!title)throw Error('Chapter heading missing: '+unitId);
 const counts=new Map(),sections=headings.map((heading,headingIndex)=>{const occurrence=(counts.get(heading.title)||0)+1;counts.set(heading.title,occurrence);const sectionId='s-'+sha(heading.title+'\0'+occurrence).slice(0,12),body=lines.slice(heading.start,headings[headingIndex+1]?.start??lines.length).join('\n').trim();return {sectionId,title:heading.title,level:heading.level,startLine:heading.start+1,bodyMarkdown:body,searchText:stripMarkdown(body),href:`#learn/agent/${unitId}/${sectionId}`};});
 return {unitId,order:index+1,title,navigationLabel:labels.get(unitId)||title,sourcePath,sourceSha256,prerequisiteUnitIds:specification.prerequisites,coreQuestion:loadedCurriculum.chapters.find(chapter=>chapter.id===unitId)?.core||title,bodyMarkdown,sections,href:`#learn/agent/${unitId}`};
});
const bundlePath='textbooks/v13/agent-engineering-textbook.md',bookSha256=sha(readSource(bundlePath));
const referencedAssets=new Set();
for(const unit of units){for(const match of unit.bodyMarkdown.matchAll(/(?:^|[(\s`])assets\/([-a-z0-9]+\.(?:png|svg|dot))(?=$|[)\s`])/gm))referencedAssets.add(match[1]);}
// Narrow siblings are published from the assembly manifest even when the chapter
// markdown keeps a single desk image. The workbench switches them at <=640px.
for(const asset of assembly.assets){const name=path.posix.basename(asset.path);if(/-narrow-v02\.svg$/.test(name))referencedAssets.add(name);}
if(!referencedAssets.size)throw Error('v13 corpus has no publishable figures');
const svgViewBox=raw=>{const match=raw.toString('utf8').match(/viewBox\s*=\s*["']\s*[-\d.]+\s+[-\d.]+\s+([-\d.]+)\s+([-\d.]+)\s*["']/);if(!match)return null;const viewBoxWidth=Number(match[1]),viewBoxHeight=Number(match[2]);return Number.isFinite(viewBoxWidth)&&Number.isFinite(viewBoxHeight)&&viewBoxWidth>0&&viewBoxHeight>0?{viewBoxWidth,viewBoxHeight}:null;};
mkdirSync(path.join(project,'dist/content-v13-assets'),{recursive:true});
const assets=[...referencedAssets].sort().map(name=>{
 const sourcePath='textbooks/v13/assets/'+name,raw=readSource(sourcePath),digest=sha(raw);
 if(assetHash.has(name)&&assetHash.get(name)!==digest)throw Error('v13 asset hash differs: '+name);
 copyFileSync(path.join(project,sourcePath),path.join(project,'dist/content-v13-assets',name));
 const box=name.endsWith('.svg')?svgViewBox(raw):null;
 return {name,sourcePath,sha256:digest,...(box||{}),href:'/api/content/assets/'+name+'?version=textbook-v13',staticHref:'content-v13-assets/'+name};
});
const exampleNames=['n01-runtime-boundaries.py','n02-memory-routing.py','n03-plan-execution.py','n04-tool-catalog.py','n05-index-lifecycle.py','n06-graph-contracts.py','n06-graph.py','n07-delegation.py','n08-sandbox-policy.py','n09-memory-diagnostic.py','n09-runtime-recovery.py','n10-evaluation-matrix.py'];
const resources=[
 'team/product-creation-standard.md','team/product-gates.json','team/textbook-v12-curriculum.md','team/textbook-v12-curriculum.json',curriculumPath,
 'textbooks/v13/README.md',bundlePath,'textbooks/v13/examples/README.md',
 ...exampleNames.map(name=>'textbooks/v13/examples/'+name),
];
for(const sourcePath of resources){if(!existsSync(path.join(project,sourcePath)))throw Error('Public reference missing: '+sourcePath);}
mkdirSync(path.join(project,'dist/content-v13-references'),{recursive:true});
const references=resources.map(sourcePath=>{
 const filename=path.posix.basename(sourcePath);
 const name=sourcePath==='textbooks/v13/README.md'?'textbook-README.md':sourcePath==='textbooks/v13/examples/README.md'?'examples-README.md':filename;
 const staticName=name.endsWith('.py')?name+'.txt':name;
 const raw=readFileSync(path.join(project,sourcePath));
 copyFileSync(path.join(project,sourcePath),path.join(project,'dist/content-v13-references',staticName));
 return {name,sourcePath,sha256:sha(raw),kind:name.endsWith('.py')?'example_source':'public_reference',href:'/api/content/reference/'+name+'?version=textbook-v13',staticHref:'content-v13-references/'+staticName};
});
const corpus={
 schemaVersion:'1',
 corpusVersion:'textbook-v13',
 corpusHash:sha(JSON.stringify(units.map(unit=>[unit.unitId,unit.sourceSha256]))),
 bookSha256,
 units,
 assets,
 references,
 compatibility:{rollbackCorpus:'textbook-v12',active:true},
 sourceBinding:{
  assemblyManifestPath:manifestPath,
  assemblyManifestSha256:sha(readFileSync(path.join(project,manifestPath))),
  curriculumPath,
  curriculumSha256:sha(readFileSync(path.join(project,curriculumPath))),
  baseCurriculumPath,
  formalRole:'agent_production_corpus',
  rollbackCorpus:'textbook-v12',
 },
};
writeFileSync(path.join(here,'content-v13-index.json'),JSON.stringify(corpus,null,2)+'\n');
writeFileSync(path.join(project,'dist/content-v13-data.js'),'/* Generated from textbooks/v13; do not edit. */\nglobalThis.RolecraftContentV13='+JSON.stringify(corpus)+';\n');
const route=units.find(unit=>unit.unitId==='00-learning-route');
const routeAssets=['agent-runtime-loop.png','agent-runtime-loop.svg','agent-engineering-landscape-v12.png','agent-engineering-landscape-v12.svg'];
if(!routeAssets.every(name=>route.bodyMarkdown.includes('assets/'+name)&&assets.some(asset=>asset.name===name)))throw Error('Learning-route figures were not published');
console.log(JSON.stringify({units:units.length,sections:units.reduce((count,unit)=>count+unit.sections.length,0),assets:assets.length,references:references.length,corpusHash:corpus.corpusHash,bookSha256,routeAssets}));
