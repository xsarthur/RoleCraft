// Re-freeze the existing 114-question learning package against the textbook-v13 corpus.
// Question text stays. Section ids, hashes, and quotes are rebound to current v13 prose.
import {readFileSync,writeFileSync} from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';

const project=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const sha=value=>createHash('sha256').update(value).digest('hex');
const corpus=JSON.parse(readFileSync(path.join(project,'server/retrieval/content-v13-index.json'),'utf8'));
const previous=JSON.parse(readFileSync(path.join(project,'server/retrieval/content-v12-index.json'),'utf8'));
const learningPath=path.join(project,'dist/learning-v13-data.js');
const sandbox={};
vm.createContext(sandbox);
vm.runInContext(readFileSync(learningPath,'utf8'),sandbox,{filename:learningPath});
const data=sandbox.RolecraftLearningV13;
if(!data||data.questions.length!==114||data.knowledgePoints.length!==240||data.units.length!==30)throw Error('Received learning package shape differs');
const units=new Map(corpus.units.map(unit=>[unit.unitId,unit]));
const previousUnits=new Map(previous.units.map(unit=>[unit.unitId,unit]));
const stats={title:0,quote:0,shortened:0,replaced:0,cleared:0,child:0,unmatched:[]};
const normTitle=value=>value.normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]+/gu,'');
const renamed=new Map([
 ['02-task-acceptance\0用同一份记录限制输入和结果','一个统一任务合同'],
 ['02-task-acceptance\0演算四种不同结局','四种结局，用同一张状态卡表达'],
 ['02-task-acceptance\0分开检查产物和过程','三类证据要分开'],
 ['02-task-acceptance\0用反例修任务记录','练习'],
 ['02-task-acceptance\0v12 学习衔接','v13 编辑交接说明'],
 ['03-trust-boundary\0攻击者能够改什么','统一案例：报告里的越权指令'],
 ['03-trust-boundary\0给每种来源一个具体权限解释','每种来源能做什么'],
 ['03-trust-boundary\0检测与阻断发生在不同位置','机制：在两个边界分别检查'],
 ['03-trust-boundary\0v12 学习衔接','v13 编辑交接说明'],
 ['c01-selection\0同一任务 四种控制权','四种方案的控制权'],
 ['c01-selection\0先固定共同任务条件','本章的任务和边界'],
 ['c01-selection\0三种输入暴露不同的必要性','三种输入情形：同一个“缺陷任务”会得到不同结论'],
 ['c01-selection\0多 Agent 的升级点是可分工 而不是人数','多 Agent 的升级点是可分工，不是人数'],
 ['c01-selection\0怎样做一个公平且能定位原因的比较','怎样做公平且能定位原因的比较'],
 ['c01-selection\0用条件做选择的练习','练习：从最小方案开始推理'],
]);
function grams(text){const n=normTitle(String(text||'')).slice(0,800);const set=new Set();for(let i=0;i<n.length-1;i++)set.add(n.slice(i,i+2));return set;}
function similarity(a,b){const left=grams(a),right=grams(b);let hit=0;for(const item of left)if(right.has(item))hit++;return left.size?hit/left.size:0;}
function chooseSection(point,unit){
 const exact=unit.sections.filter(section=>section.title===point.title);
 if(exact.length)return exact[0];
 const fuzzy=unit.sections.filter(section=>normTitle(section.title)===normTitle(point.title));
 if(fuzzy.length)return fuzzy[0];
 const forced=renamed.get(point.unitId+'\0'+point.title);
 if(forced){const section=unit.sections.find(item=>item.title===forced);if(!section)throw Error('Rename target missing: '+forced);return section;}
 if(point.kind==='unit_introduction')return unit.sections.find(section=>section.level===1);
 if(point.kind==='navigation'&&/学习衔接/.test(point.title))return unit.sections.find(section=>/编辑交接|学习衔接/.test(section.title));
 const old=previousUnits.get(point.unitId)?.sections.find(section=>section.sectionId===point.sectionId);
 const ranked=unit.sections.map(section=>({section,score:similarity(old?.searchText||old?.bodyMarkdown||point.title,section.searchText||section.bodyMarkdown)})).sort((a,b)=>b.score-a.score);
 if(ranked[0]&&ranked[0].score>=0.35&&ranked[0].score-(ranked[1]?.score||0)>=0.08)return ranked[0].section;
 return null;
}

function sectionSpan(unit,section){
 const lines=unit.bodyMarkdown.split('\n');
 const next=unit.sections.find(item=>item.startLine>section.startLine);
 return {startLine:section.startLine,endLine:next?next.startLine-1:lines.length};
}
function rangeFor(unit,section,quote){
 const lines=unit.bodyMarkdown.split('\n');
 const span=sectionSpan(unit,section);
 const slice=lines.slice(span.startLine-1,span.endLine).join('\n');
 const at=slice.indexOf(quote);
 if(at<0||!section.bodyMarkdown.includes(quote))return null;
 const startLine=span.startLine+slice.slice(0,at).split('\n').length-1;
 const endLine=span.startLine+slice.slice(0,at+quote.length).split('\n').length-1;
 if(!lines.slice(startLine-1,endLine).join('\n').includes(quote))return null;
 return {startLine,endLine};
}
function fragments(quote){
 const pieces=String(quote||'').split(/(?<=[。！？])|\n+/).map(item=>item.trim()).filter(item=>item.length>=12);
 return [...new Set([quote,...pieces])].filter(Boolean).sort((a,b)=>b.length-a.length);
}
function directChildren(unit,section){
 const span=sectionSpan(unit,section);
 return unit.sections.filter(item=>item.startLine>section.startLine&&item.startLine<=span.endLine&&item.level===section.level+1).map(item=>item.sectionId);
}

const claimed=new Set();
for(const point of data.knowledgePoints){
 const unit=units.get(point.unitId);
 if(!unit){stats.unmatched.push(point.id);continue;}
 let section=chooseSection(point,unit);
 if(section&&claimed.has(point.unitId+'\0'+section.sectionId)){
  const alternate=unit.sections.find(item=>item.title===section.title&&!claimed.has(point.unitId+'\0'+item.sectionId));
  if(alternate)section=alternate;
 }
 if(!section){stats.unmatched.push(point.id+':'+point.title);continue;}
 claimed.add(point.unitId+'\0'+section.sectionId);
 const span=sectionSpan(unit,section);
 point.sectionId=section.sectionId;
 point.title=section.title;
 point.level=section.level;
 point.startLine=span.startLine;
 point.endLine=span.endLine;
 point.sourcePath=unit.sourcePath;
 point.sourceSha256=unit.sourceSha256;
 point.href=section.href;
 point.childSectionIds=directChildren(unit,section);
 stats.title++;
}
if(stats.unmatched.length)throw Error('Knowledge points did not match v13 headings: '+stats.unmatched.slice(0,12).join(' | '));
const points=new Map(data.knowledgePoints.map(point=>[point.id,point]));

function sectionExcerpt(section){
 const paragraphs=section.bodyMarkdown.split(/\n\s*\n/).map(item=>item.trim()).filter(item=>item&&!/^(?:#|!|\||```)/.test(item)&&item.length>=18);
 const best=paragraphs[0]||section.bodyMarkdown.trim();
 const sentence=(best.match(/^[^。！？\n]{18,240}[。！？]/)||[])[0];
 if(sentence&&section.bodyMarkdown.includes(sentence))return sentence;
 if(best.length<=260&&section.bodyMarkdown.includes(best))return best;
 const cut=best.slice(0,180);
 return section.bodyMarkdown.includes(cut)?cut:'';
}
function bindQuote(record){
 const unit=units.get(record.unitId);
 const point=points.get(record.knowledgePointId);
 if(!unit||!point)throw Error('Evidence lost its unit or knowledge point: '+record.id);
 const home=unit.sections.find(section=>section.sectionId===point.sectionId);
 const children=new Set(point.childSectionIds);
 const allowed=[home,...unit.sections.filter(section=>children.has(section.sectionId))].filter(Boolean);
 const original=record.quote||'';
 let chosen=null,quote=original,shortened=false;
 if(quote){
  for(const candidate of fragments(quote)){
   chosen=allowed.find(section=>section.bodyMarkdown.includes(candidate));
   if(chosen){if(candidate!==original)shortened=true;quote=candidate;break;}
  }
 }
 if(!chosen){
  chosen=home;
  const excerpt=sectionExcerpt(home);
  if(original&&excerpt){quote=excerpt;stats.replaced++;}
  else {quote='';if(original)stats.cleared++;}
 }else if(shortened)stats.shortened++;
 else stats.quote++;
 const located=quote?rangeFor(unit,chosen,quote):null;
 if(quote&&!located){quote='';stats.cleared++;}
 const span=located||sectionSpan(unit,chosen);
 record.sectionId=chosen.sectionId;
 record.sectionTitle=chosen.title;
 record.href=chosen.href;
 record.sourcePath=unit.sourcePath;
 record.sourceSha256=unit.sourceSha256;
 record.quote=quote;
 record.startLine=span.startLine;
 record.endLine=span.endLine;
 if(chosen.sectionId!==point.sectionId)stats.child++;
 if(record.reviewSourceRange){
  record.reviewSourceRange={...record.reviewSourceRange,startLine:span.startLine,endLine:span.endLine,section:'#'.repeat(chosen.level)+' '+chosen.title};
 }
}

for(const question of data.questions){
 for(const record of [...(question.knowledgeRefs||[]),...(question.evidence||[])])bindQuote(record);
}
for(const [index,record] of data.units.entries()){
 const unit=corpus.units[index];
 if(record.unitId!==unit.unitId)throw Error('Learning unit order differs: '+record.unitId);
 record.order=unit.order;
 record.title=unit.title;
 record.navigationLabel=unit.navigationLabel;
 record.coreQuestion=unit.coreQuestion;
 record.sourcePath=unit.sourcePath;
 record.sourceSha256=unit.sourceSha256;
 record.prerequisiteUnitIds=unit.prerequisiteUnitIds;
 record.prerequisites=unit.prerequisiteUnitIds;
 record.href=unit.href;
}
const sourceFiles=[
 ['team/textbook-v12-qa-matrix.json','frozen_teaching_input'],
 ['team/textbook-v13-workbench-curriculum.json','formal_reading_contract'],
 ['server/retrieval/content-v13-index.json','same_corpus_derived_input'],
 ['dist/content-v13-data.js','same_corpus_derived_input'],
 ['textbooks/v13/agent-engineering-textbook.md','frozen_teaching_input'],
 ['textbooks/v13/README.md','frozen_teaching_input'],
 ['textbooks/v13/assembly-manifest.json','frozen_teaching_input'],
 ...corpus.units.map(unit=>[unit.sourcePath,'frozen_teaching_input']),
];
data.sourceBindings=sourceFiles.map(([sourcePath,kind])=>{
 const raw=readFileSync(path.join(project,sourcePath));
 return {path:'sites/rolecraft/'+sourcePath,sourcePath,sha256:sha(raw),bytes:raw.length,kind};
});
data.schemaVersion='1';
data.version='app-v13-textbook-v13-learning-data-1';
data.corpusVersion='textbook-v13';
data.corpusHash=corpus.corpusHash;
data.bookSha256=corpus.bookSha256;
data.metadata={...data.metadata,version:data.version,corpusVersion:data.corpusVersion,corpusHash:data.corpusHash,bookSha256:data.bookSha256,generatedAt:new Date().toISOString(),status:'rebound_to_textbook_v13_pending_independent_qa',sourceBindings:data.sourceBindings,counts:{...data.metadata.counts,units:data.units.length,indexedSections:corpus.units.reduce((count,unit)=>count+unit.sections.length,0),knowledgePoints:data.knowledgePoints.length,questions:data.questions.length,sourceBindings:data.sourceBindings.length}};
writeFileSync(learningPath,'/* Rebound to textbook-v13 without changing frozen question wording. */\nglobalThis.RolecraftLearningV13='+JSON.stringify(data,null,2)+';\n');
console.log(JSON.stringify({...stats,unmatched:stats.unmatched.length,corpusHash:data.corpusHash,bookSha256:data.bookSha256,questions:data.questions.length,knowledgePoints:data.knowledgePoints.length}));
