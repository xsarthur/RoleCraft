const fs = require('fs');
const path = require('path');
const vm = require('vm');
const crypto = require('crypto');
const base = path.resolve('sites/rolecraft');
const out = path.join(base, 'team/agent-interview-answer-revision-qa/integration-data/r2');
const snap = path.join(out, 'received');
const results = [], inputs = [], perItem = [], failures = [];
const sha = b => crypto.createHash('sha256').update(b).digest('hex');
function read(p) { const b = fs.readFileSync(p); inputs.push({path:path.relative(process.cwd(),p),bytes:b.length,sha256:sha(b)}); return b.toString('utf8'); }
const s = f => read(path.join(snap,f));
const orig = f => read(path.join(base,f));
function check(id, actual, evidence) { const result = {id,status:actual?'pass':'fail',evidence}; results.push(result); if(!actual)failures.push(result); return actual; }
function same(a,b){ return JSON.stringify(a)===JSON.stringify(b); }
const context = vm.createContext({URL,URLSearchParams,console,structuredClone});
for(const f of ['content-v12-data.js','learning-v13-data.js','interview-answers-v1-data.js','interview-answer-renderer.js'])vm.runInContext(s('dist/'+f),context,{filename:f});
const pack = context.RolecraftInterviewAnswersV1, render = context.RolecraftInterviewAnswerRenderer;
const corpus = context.RolecraftContentV12, learning = context.RolecraftLearningV13;
const manifest = JSON.parse(s('textbooks/interview-answers-v1/manifest.json'));
const product = JSON.parse(s('team/agent-interview-answer-revision-product.json'));
const approval = JSON.parse(s('team/agent-interview-answer-revision-qa/content-approval.json'));
const expectedIds = [...Array.from({length:100},(_,i)=>'Q'+(i+1)),...Array.from({length:14},(_,i)=>'M'+(101+i)),...Array.from({length:10},(_,i)=>'P'+String(i+1).padStart(2,'0'))];
check('ID-124',same(pack.items.map(x=>x.id),expectedIds)&&new Set(pack.items.map(x=>x.id)).size===124,{counts:pack.collections.map(c=>({id:c.id,count:c.ids.length})),order:'Q1-Q100,M101-M114,P01-P10'});
check('MANIFEST-PACK',same(pack.items.map(({bodyMarkdown,...metadata})=>metadata),manifest.items)&&pack.answerSetSha256===manifest.answerSetSha256,{sha256:pack.answerSetSha256,bodyLocation:'data package only; all other item fields compared'});
const approvalMap=new Map(approval.items.map(x=>[x.id,x]));
let localCount=0,externalCount=0,sourceCount=0,tableCount=0,codeCount=0,totalBytes=0;
const renderedDir=path.join(out,'rendered');fs.mkdirSync(renderedDir,{recursive:true});
const book=s('textbooks/interview-answers-v1/agent-interview-answers.md'),readme=s('textbooks/interview-answers-v1/README.md');
const sourceCache=new Map();
function source(p){if(!sourceCache.has(p))sourceCache.set(p,read(path.resolve(p)));return sourceCache.get(p);}
for(const item of pack.items){
 const body=read(path.resolve(item.answerPath)), rule=product.items.find(x=>x.id===item.id), approved=approvalMap.get(item.id);
 const itemResult={id:item.id,bodyBytes:Buffer.byteLength(body),answerVersion:item.answerVersion,answerSha256:sha(body)};
 itemResult.identity=body===item.bodyMarkdown&&sha(body)===item.answerSha256&&item.question===rule.question&&item.collection===rule.collection&&same(item.followups||[],rule.followups||[])&&pack.byId[item.id]===item;
 itemResult.approval=approved&&approved.answerVersion===item.answerVersion&&approved.answerSha256===item.answerSha256&&approved.status==='met_within_reviewed_scope'&&item.contentStatus==='met_within_reviewed_scope';
 const refs=[...item.reviewReferences,...item.qaReferences];
 itemResult.reportBindings=refs.every(ref=>{const str=source(ref.path);let target=JSON.parse(str);for(const p of ref.jsonPointer.split('/').slice(1))target=target[p.replace(/~1/g,'/').replace(/~0/g,'~')];return sha(str)===ref.reportSha256&&target.id===item.id&&target.answerVersion===ref.answerVersion&&target.answerSha256===ref.answerSha256;});
 itemResult.sources=item.sourceBindings.every(ref=>{sourceCount++;const text=source(ref.path),lines=text.split('\n');return sha(text)===ref.sha256&&ref.startLine>0&&ref.endLine>=ref.startLine&&ref.endLine<=lines.length;});
 itemResult.sourceTargets=item.sourceReferences.every(ref=>{const unit=corpus.units.find(u=>u.unitId===ref.unitId),sec=unit?.sections.find(x=>x.sectionId===ref.sectionId);return !!sec&&sec.href===ref.readingHref&&unit.sourceSha256===ref.sha256&&ref.sourcePath===path.join('sites/rolecraft',unit.sourcePath)&&Number.isInteger(sec.startLine);});
 const html=render.answerHTML(item.id,{question:item.question});fs.writeFileSync(path.join(renderedDir,item.id+'.html'),html);
 const markdownHTML=render.markdown(body,item),articles=html.match(/<article class="ia-prose"[^>]*>([\s\S]*)<\/article><details class="ia-binding">/);
 itemResult.fullOutput=!!articles&&articles[1]===markdownHTML&&html.includes('data-answer-sha256="'+item.answerSha256+'"');
 const links=[...body.matchAll(/\[([^\]]*)\]\(([^\s)]+)\)/g)].map(m=>({label:m[1],raw:m[2]}));
 itemResult.links=links.every(({label,raw})=>{const mapped=item.sourceLinks.find(l=>l.originalHref===raw&&l.label===label);if(!mapped)return false;const href=render.textbookLink(raw,item,{}, {label});if(mapped.kind==='local_textbook'){localCount++;return href===mapped.href&&corpus.units.some(u=>u.sections.some(sec=>sec.href===href));}externalCount++;return mapped.kind==='external'&&href===new URL(mapped.href).href&&item.externalSources.some(x=>(x.url||x.href)===mapped.href);});
 const sourceTables=[...body.matchAll(/^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/gm)].length;
 const sourceFences=[...body.matchAll(/^```[^\n]*\n([\s\S]*?)^```\s*$/gm)];
 const actualTables=[...markdownHTML.matchAll(/<table>/g)].length, actualCodes=[...markdownHTML.matchAll(/<div class="ia-code">/g)].length;
 const escaped=value=>value.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 itemResult.tablesAndCode=sourceTables===actualTables&&sourceFences.length===actualCodes&&sourceFences.every(m=>markdownHTML.includes('<code>'+escaped(m[1].replace(/\n$/,''))+'</code>'));
 tableCount+=actualTables;codeCount+=actualCodes;totalBytes+=Buffer.byteLength(body);
 // The collection may relocate relative links but must otherwise include each source body verbatim.
 const relocated=body.replace(/\]\(\.\.\/\.\.\/v12\//g,'](../v12/');
 itemResult.book=book.includes('<a id="'+item.id+'"></a>')&&book.includes(relocated)&&readme.includes('(answers/'+item.id+'.md)');
 perItem.push(itemResult);
}
for(const field of ['identity','approval','reportBindings','sources','sourceTargets','fullOutput','links','tablesAndCode','book'])check('ALL-'+field,perItem.every(x=>x[field]),{checked:124,failedIds:perItem.filter(x=>!x[field]).map(x=>x.id)});
const localMappings=pack.items.reduce((n,x)=>n+x.sourceLinks.filter(l=>l.kind==='local_textbook').length,0),externalMappings=pack.items.reduce((n,x)=>n+x.sourceLinks.filter(l=>l.kind==='external').length,0);
check('CURRENT-COUNTS',tableCount===22&&codeCount===13&&localMappings===372&&externalMappings===28,{tableCount,codeCount,localMappings,externalMappings,localOccurrences:localCount,externalOccurrences:externalCount,sourceCount,totalBytes});
const oldLearningContext=vm.createContext({});vm.runInContext(orig('team/agent-interview-answer-revision-qa/received/learning-v13-data.js'),oldLearningContext);
check('OLD-327-EVIDENCE',same(oldLearningContext.RolecraftLearningV13,learning)&&learning.questions.reduce((n,q)=>n+q.evidence.length,0)===327,{questions:learning.questions.length,evidence:learning.questions.reduce((n,q)=>n+q.evidence.length,0)});
const oldPrototype=orig('team/agent-interview-answer-revision-frontend/received/interview-prep-v1-prototype.html');
const currentPrototype=s('dist/interview-prep-v1-prototype.html');
function questions(html){const match=html.match(/const questions=(\[[\s\S]*?\n\]);/);return vm.runInNewContext('('+match[1]+')');}
const oldQs=questions(oldPrototype),newQs=questions(currentPrototype);
check('PROTOTYPE-IDENTITY',same(oldQs,newQs)&&newQs.every((q,i)=>pack.prototypeMap[q.id]===('P'+String(i+1).padStart(2,'0'))&&pack.byId[pack.prototypeMap[q.id]].question===q.title&&same(pack.byId[pack.prototypeMap[q.id]].followups,q.follow)),{questions:newQs.length,followups:newQs.reduce((n,x)=>n+x.follow.length,0)});
const prototypeAnswerFn=currentPrototype.match(/function referenceAnswer\(q\)\{([\s\S]*?)\n\}/)[0];vm.runInContext(prototypeAnswerFn,context);
check('PROTOTYPE-FULL-ANSWER',newQs.every(q=>context.referenceAnswer(q).includes('<article class="ia-prose"')&&context.referenceAnswer(q).includes('index.html#learn/agent/')),{ids:newQs.map(q=>pack.prototypeMap[q.id])});
const normalizeHeading=x=>String(x).replace(/[#\s`*·：:、，,。.!！?？（）()—–\-]/g,'').toLowerCase();
const sectionAudit=[];
for(const x of pack.items)for(const ref of x.sourceReferences){const u=corpus.units.find(u=>u.unitId===ref.unitId),i=u.sections.findIndex(s=>s.sectionId===ref.sectionId),section=u.sections[i];sectionAudit.push({id:x.id,mode:ref.readingTargetKind,requested:ref.section,target:section.title,pass:ref.readingTargetKind==='matching_heading'?normalizeHeading(ref.section)===normalizeHeading(section.title):ref.readingTargetKind==='containing_section'&&section.startLine<=ref.startLine&&(!u.sections[i+1]||ref.startLine<u.sections[i+1].startLine)});}
check('SECTION-SEMANTICS',sectionAudit.every(x=>x.pass),{total:sectionAudit.length,matchingHeading:sectionAudit.filter(x=>x.mode==='matching_heading').length,fallback:sectionAudit.filter(x=>x.mode==='containing_section'),failed:sectionAudit.filter(x=>!x.pass)});
// Isolated VM only. No browser, server, database, actual localStorage, network, or application filesystem writes.
const storageLog=[];context.localStorage={getItem:k=>(storageLog.push({operation:'getItem',key:k}),null),setItem:(k,v)=>storageLog.push({operation:'setItem',key:k})};context.location={hash:'#questions/Q1'};context.document={addEventListener(){}};
let client=s('dist/learning-experience-v13.js');
client=client.replace('globalThis.LearningExperienceV13={','globalThis.__qaEvidenceHTML=evidenceHTML;globalThis.LearningExperienceV13={');
vm.runInContext(client,context);
check('LEARNING-DATA-VALID',context.LearningExperienceV13.data()===learning,{questions:learning.questions.length});
let evidencePreserved=0;const evidenceItems=[];
for(const q of learning.questions){const html=context.__qaEvidenceHTML(q),articleEnd=html.indexOf('<div class="v13-reference-analysis">');let ok=articleEnd>0&&html.includes('data-answer-id="'+q.id+'"');for(const e of q.evidence){const escaped=e.quote.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));const one=html.slice(articleEnd).includes('<blockquote>'+escaped+'</blockquote>');if(one)evidencePreserved++;ok=ok&&one;}evidenceItems.push({id:q.id,pass:ok});}
check('INTERNAL-114-AND-327',evidenceItems.every(x=>x.pass)&&evidencePreserved===327,{answers:evidenceItems.length,evidencePreserved,failed:evidenceItems.filter(x=>!x.pass)});
const deferred=[];for(const view of ['questions','review','check'])for(const suffix of ['','/Q1','/M101','/done']){context.location.hash='#'+view+suffix;const html=context.LearningExperienceV13.page(view);deferred.push({hash:context.location.hash,pass:html.includes('该模块将在后续开放')&&!html.includes('ia-prose')&&!html.includes('data-v13-start-check')});}
check('DEFERRED-PUBLIC-ROUTES',deferred.every(x=>x.pass),{cases:deferred});
check('NO-STORAGE-WRITES',!storageLog.some(x=>x.operation==='setItem'),{syntheticStorageCalls:storageLog});
const index=s('dist/index.html');const positions=['learning-v13-data.js','interview-answers-v1-data.js','interview-answer-renderer.js','learning-experience-v13.js'].map(f=>index.indexOf('src="'+f+'"'));
check('LOAD-ORDER',positions.every((n,i)=>n>=0&&(i===0||n>positions[i-1]))&&index.includes('href="interview-answer-reader.css"'),{positions});
const oldIndex=orig('team/agent-interview-answer-revision-frontend/received/index.html');
const oldClient=orig('team/agent-interview-answer-revision-frontend/received/learning-experience-v13.js');
const originalClient=s('dist/learning-experience-v13.js');
const insertion='const full=globalThis.RolecraftInterviewAnswerRenderer?.answerHTML(qid(q),{question:q.prompt||q.questionText||q.question})||\'\';return full+';
const restoredClient=originalClient.replace(insertion,'return ');
const restoredIndex=index.replace('<link rel="stylesheet" href="interview-answer-reader.css">','').replace('<script src="interview-answers-v1-data.js"></script>','').replace('<script src="interview-answer-renderer.js"></script>','');
check('SCOPED-CLIENT-EDITS',restoredClient===oldClient&&restoredIndex===oldIndex,{clientChange:'Only prepend separately approved answer in evidenceHTML',indexChange:'Only add answer data/renderer and answer-specific stylesheet'});
// Adversarial candidates never replace the saved package.
const trusted=pack.byId.P02, clone=()=>JSON.parse(JSON.stringify(trusted));
const attackRows=[];let candidate=clone();candidate.bodyMarkdown='<img src=x onerror=alert(1)>\n<script>globalThis.PWNED=true</script>\n\n```html\n<svg onload=alert(1)>\n```\n\n'+['javascript:alert(1)','data:text/html;base64,WA==','file:///tmp/a','//evil.invalid/x','https://u:p@evil.invalid/x','https:\\evil.invalid\\x','https://evil.invalid/x'].map((u,i)=>'[a'+i+']('+u+')').join('\n');candidate.sourceLinks=[];
pack.byId.P02=candidate;let attackHtml=render.answerHTML('P02',{question:candidate.question});attackRows.push({case:'unbound-protocols-html-code',pass:!/<(?:script|img|svg)\b/i.test(attackHtml)&&!attackHtml.includes('href=')&&!context.PWNED});
for(const uri of ['javascript:alert(1)','data:text/html,foo','file:///tmp/a','//evil.invalid/x','https://u:p@evil.invalid/x','https:\\evil.invalid\\x','https://evil.invalid/\nx']){candidate=clone();candidate.sourceLinks=[{originalHref:'probe',kind:'external',href:uri}];attackRows.push({case:'bound-external:'+uri,pass:render.textbookLink('probe',candidate,{})===''});}
for(const uri of ['#learn/agent/../../secret','#learn/other/test','#learn/agent/u/s?run=x','#learn/agent/u/s#x','javascript:alert(1)']){candidate=clone();candidate.sourceLinks=[{originalHref:'probe',kind:'local_textbook',href:uri}];attackRows.push({case:'bound-local:'+uri,pass:render.textbookLink('probe',candidate,{})===''});}
for(const status of ['pending','not_met','insufficient','unexpected']){candidate=clone();candidate.contentStatus=status;candidate.bodyMarkdown='UNAPPROVED_BODY_MARKER';pack.byId.P02=candidate;const html=render.answerHTML('P02',{question:candidate.question});attackRows.push({case:'unapproved:'+status,pass:!html.includes('UNAPPROVED_BODY_MARKER')&&!html.includes('<article')});}
candidate=clone();pack.byId.P02=candidate;attackRows.push({case:'wrong-question',pass:!render.answerHTML('P02',{question:'different'}).includes('<article')});candidate.answerSha256='invalid';attackRows.push({case:'invalid-sha-format',pass:!render.answerHTML('P02',{question:candidate.question}).includes('<article')});pack.byId.P02=trusted;
check('ADVERSARIAL-RENDERING',attackRows.every(x=>x.pass),{cases:attackRows});
const binding=JSON.parse(read(path.join(out,'received-binding.json')));const stable=binding.files.map(x=>({path:x.path,received:x.sha256,current:sha(fs.readFileSync(x.path))}));
check('RECEIVED-FILES-STABLE',stable.every(x=>x.received===x.current),{count:stable.length,changed:stable.filter(x=>x.received!==x.current)});
const report={version:'integration-data-qa-2',checkedAt:new Date().toISOString(),runtime:process.version,scope:'Independent data/source and isolated VM integration only; no real browser or actual user storage',status:failures.length?'not_met':'met_within_tested_scope',results,perItem,inputs:[...new Map(inputs.map(x=>[x.path,x])).values()],limits:['Browser interaction, layout, refresh and navigation are assigned to parent QA.','Renderer SHA format checks are presentation guards, not cryptographic verification of arbitrary modified runtime data.','No real APIs, model calls, personal interview evidence, or production system evaluated.','Public questions/review/check remain deferred; 114 evidenceHTML calls executed only through in-memory QA exposure.'],failures};
fs.writeFileSync(path.join(out,'result.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({status:report.status,tests:results.length,failed:failures,counts:{items:perItem.length,tableCount,codeCount,localCount,externalCount,sourceCount,totalBytes}},null,2));
