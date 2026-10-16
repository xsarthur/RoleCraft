import { readFileSync, writeFileSync, mkdirSync, realpathSync, copyFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const here=path.dirname(fileURLToPath(import.meta.url));
const project=path.resolve(here,'../..');
const sha=s=>createHash('sha256').update(s).digest('hex');
const spec=JSON.parse(readFileSync(path.join(project,'team/textbook-v10-opening-spec.json'),'utf8'));
const sourceManifest=JSON.parse(readFileSync(path.join(project,'team/textbook-v10-opening-author-assembly-manifest.json'),'utf8'));
const learning=JSON.parse(readFileSync(path.join(project,'team/textbook-v09-manifest.json'),'utf8'));
const stripMarkdown=text=>text.replace(/```[^\n]*\n[\s\S]*?```/g,'').replace(/!\[[^\]]*\]\([^)]*\)/g,'').replace(/\[([^\]]+)\]\([^)]*\)/g,'$1').replace(/[*`#>]/g,'').trim();
const expected=new Map(sourceManifest.units.map(u=>[u.unitId,u.sourceSha256||u.sha256]));
const units=spec.chapterMap.map(entry=>{
 const sourcePath=entry.v10TargetPath;
 if(!/^textbooks\/v10\/[-a-z0-9]+\.md$/.test(sourcePath))throw Error('Unapproved textbook source');
 const full=realpathSync(path.join(project,sourcePath));
 if(!full.startsWith(realpathSync(path.join(project,'textbooks/v10'))+path.sep))throw Error('Textbook source escaped allowlist');
 const bodyMarkdown=readFileSync(full,'utf8');
 const sourceSha256=sha(bodyMarkdown);
 if(expected.get(entry.unitId)!==sourceSha256)throw Error(`Frozen chapter changed: ${entry.unitId}`);
 const lines=bodyMarkdown.split('\n'); let fenced=false;const headings=[];
 for(let i=0;i<lines.length;i++){
  if(/^\s*```/.test(lines[i])){fenced=!fenced;continue;}
  const match=!fenced&&lines[i].match(/^(#{1,3})\s+(.+)$/);
  if(match)headings.push({start:i,level:match[1].length,title:match[2]});
 }
 const counts=new Map();
 const sections=headings.map((heading,i)=>{
  const occurrence=(counts.get(heading.title)||0)+1;counts.set(heading.title,occurrence);
  const sectionId='s-'+sha(heading.title+'\0'+occurrence).slice(0,12);
  const body=lines.slice(heading.start,(headings[i+1]?.start??lines.length)).join('\n').trim();
  return {sectionId,title:heading.title,level:heading.level,startLine:heading.start+1,bodyMarkdown:body,searchText:stripMarkdown(body),href:`#learn/agent/${entry.unitId}/${sectionId}`};
 });
 return {unitId:entry.unitId,order:entry.order,title:entry.v10ActualHeading,navigationLabel:entry.navigationLabel,sourcePath,sourceSha256,prerequisiteUnitIds:entry.retainedPrerequisiteUnitIds,coreQuestion:learning.units.find(u=>u.unitId===entry.unitId)?.coreQuestion||entry.v10ActualHeading,bodyMarkdown,sections,href:`#learn/agent/${entry.unitId}`};
});
const bookSha256=sha(readFileSync(path.join(project,'textbooks/v10/agent-engineering-textbook.md')));
const assetNames=['agent-runtime-loop.png','agent-engineering-landscape.png','agent-runtime-loop.svg','agent-engineering-landscape.svg','agent-runtime-loop.dot','agent-engineering-landscape.dot'];
mkdirSync(path.join(project,'dist/content-v10-assets'),{recursive:true});
const assets=assetNames.map(name=>{const sourcePath='textbooks/v10/assets/'+name;copyFileSync(path.join(project,sourcePath),path.join(project,'dist/content-v10-assets',name));return {name,sourcePath,sha256:sha(readFileSync(path.join(project,sourcePath))),href:'/api/content/assets/'+name,staticHref:'content-v10-assets/'+name};});
const referenceNames=['TEXTBOOK_WRITING_STANDARD.md','product-creation-standard.md','product-gates.json','textbook-v09-curriculum.md','textbook-v09-manifest.json','textbook-v09-qa.md','textbook-v10-opening-content-review.md','textbook-v10-opening-qa.md','textbook-v10-opening-spec.md'];
mkdirSync(path.join(project,'dist/content-v10-references'),{recursive:true});
const references=referenceNames.map(name=>{const sourcePath='team/'+name;copyFileSync(path.join(project,sourcePath),path.join(project,'dist/content-v10-references',name));return {name,sourcePath,sha256:sha(readFileSync(path.join(project,sourcePath))),href:'/api/content/reference/'+name,staticHref:'content-v10-references/'+name};});
const corpus={schemaVersion:'1',corpusVersion:'textbook-v10',corpusHash:sha(JSON.stringify(units.map(u=>[u.unitId,u.sourceSha256]))),bookSha256,units,assets,references,sourceBinding:{specSha256:sha(readFileSync(path.join(project,'team/textbook-v10-opening-spec.json'))),authorManifestSha256:sha(readFileSync(path.join(project,'team/textbook-v10-opening-author-assembly-manifest.json')))}};
mkdirSync(here,{recursive:true});writeFileSync(path.join(here,'content-v10-index.json'),JSON.stringify(corpus,null,2)+'\n');
writeFileSync(path.join(project,'dist/content-v10-data.js'),'/* Generated from frozen v10 chapter sources; do not edit. */\nglobalThis.RolecraftContentV10='+JSON.stringify(corpus)+';\n');
console.log(JSON.stringify({units:units.length,sections:units.reduce((n,u)=>n+u.sections.length,0),corpusHash:corpus.corpusHash,bookSha256}));
