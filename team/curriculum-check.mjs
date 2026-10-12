// QA only: validate curriculum map structure, never modify curriculum or application.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
const bytes = fs.readFileSync(path.join(here, 'curriculum-data.json'));
const data = JSON.parse(bytes.toString('utf8'));
const checks = [];
const originalChapterIds = ['foundation','models','agent','tools','retrieval','state','eval','delivery'];
const string = value => typeof value === 'string' && value.trim().length > 0;
const strings = (value, min = 1) => Array.isArray(value) && value.length >= min && value.every(string);
const unique = values => new Set(values).size === values.length;
const idSet = key => new Set(data[key].map(x => x.id));
const moduleIds = idSet('modules'), sourceIds = idSet('sources'), competencyIds = idSet('competencies'), levelIds = idSet('levels');
function test(id, label, action) { try { action(); checks.push({ id, label, status:'PASS' }); } catch(error) { checks.push({ id, label, status:'FAIL', error:error.message.split('\n')[0] }); } }
function every(items, fn) { for(const item of items) fn(item); }
const topo = [];

test('C01','Metadata and draft/full-textbook boundary',()=>{ assert.ok(string(data.schemaVersion) && string(data.version)); assert.match(data.updatedAt,/^\d{4}-\d{2}-\d{2}$/); assert.match(data.status,/草案/); assert.equal(data.expertReview,'未完成'); assert.match(data.fullTextbookStatus,/不包含完整教材/); });
test('C02','Exactly 7 competencies, 4 levels and 12 modules',()=>{ assert.equal(data.competencies.length,7); assert.equal(data.levels.length,4); assert.equal(data.modules.length,12); });
test('C03','Nonempty unique IDs within every ID namespace',()=>{ const groups=[data.sources,data.competencies,data.levels,data.modules,data.chapterStructure.sections,data.qualityRules,data.rubric.dimensions,data.projects,data.reflection.fields]; for(const group of groups){ assert.ok(group.every(x=>string(x.id))); assert.ok(unique(group.map(x=>x.id))); } assert.ok(unique(data.rubric.scoreScale.map(x=>x.score))); });
test('C04','Four expected levels have outcome/depth/gate',()=>{ assert.deepEqual([...levelIds],['foundation','core','engineering','professional']); every(data.levels,l=>{ for(const key of ['title','outcome','depth','gate']) assert.ok(string(l[key]),l.id+': '+key); }); });
test('C05','Module goals are 2–4 nonempty entries',()=>{ every(data.modules,m=>{ assert.ok(strings(m.objectives,2),m.id); assert.ok(m.objectives.length<=4,m.id); }); });
test('C06','Each module has depth, evidence and validation',()=>{ every(data.modules,m=>{ assert.ok(string(m.title)&&string(m.depth),m.id); assert.ok(strings(m.evidence)&&strings(m.validation),m.id); assert.ok(levelIds.has(m.level),m.id); assert.equal(m.depth,data.levels.find(l=>l.id===m.level).depth,m.id); }); });
test('C07','Prerequisite arrays contain valid unique IDs',()=>{ every(data.modules,m=>{ assert.ok(strings(m.prerequisites,0),m.id); assert.ok(unique(m.prerequisites),m.id); every(m.prerequisites,id=>assert.ok(moduleIds.has(id),m.id+' -> '+id)); }); });
test('C08','Prerequisite graph has no cycles',()=>{ const visiting=new Set(), visited=new Set(), modules=new Map(data.modules.map(m=>[m.id,m])); function visit(id){ assert.ok(!visiting.has(id),'cycle at '+id); if(visited.has(id))return; visiting.add(id); every(modules.get(id).prerequisites,visit); visiting.delete(id); visited.add(id); topo.push(id); } every(data.modules,m=>visit(m.id)); assert.equal(visited.size,12); });
test('C09','Module-to-competency mappings are valid and unique',()=>{ every(data.modules,m=>{ assert.ok(strings(m.competencyIds),m.id); assert.ok(unique(m.competencyIds),m.id); every(m.competencyIds,id=>assert.ok(competencyIds.has(id),m.id+' -> '+id)); }); });
test('C10','All 7 competency domains map to evidence and validation',()=>{ every(data.competencies,c=>{ const mapped=data.modules.filter(m=>m.competencyIds.includes(c.id)); assert.ok(mapped.length>0,c.id); assert.ok(mapped.some(m=>strings(m.evidence)&&strings(m.validation)),c.id); assert.ok(string(c.title)&&string(c.description),c.id); }); });
test('C11','Existing chapter IDs reference original 8-chapter baseline',()=>{ every(data.modules,m=>{ assert.ok(strings(m.existingChapterIds,0),m.id); assert.ok(unique(m.existingChapterIds),m.id); every(m.existingChapterIds,id=>assert.ok(originalChapterIds.includes(id),m.id+' -> '+id)); }); const linked=data.modules.flatMap(m=>m.existingChapterIds); assert.ok(unique(linked)); assert.deepEqual([...linked].sort(),[...originalChapterIds].sort()); });
test('C12','Nine required chapter template sections present',()=>{ assert.equal(data.chapterStructure.sections.length,9); assert.deepEqual(data.chapterStructure.sections.map(x=>x.id),['scope','outcomes','concepts','case','example','practice','validation','sources','reflection']); every(data.chapterStructure.sections,s=>{ assert.ok(string(s.title)&&string(s.required),s.id); }); });
test('C13','Every module links to the declared chapter template',()=>{ assert.ok(string(data.chapterStructure.id)); every(data.modules,m=>assert.equal(m.chapterTemplateId,data.chapterStructure.id,m.id)); });
test('C14','Four sources: 1 public job and 3 technical references',()=>{ assert.equal(data.sources.length,4); assert.equal(data.sources.filter(s=>s.type==='public_job_description').length,1); assert.equal(data.sources.filter(s=>s.type==='technical_reference').length,3); every(data.sources,s=>{ assert.ok(string(s.typeLabel)&&string(s.title)&&string(s.organization)&&string(s.limits),s.id); }); });
test('C15','Source URLs/dates/sections/supports have structural fields',()=>{ every(data.sources,s=>{ assert.equal(new URL(s.url).protocol,'https:',s.id); assert.match(s.accessedAt,/^\d{4}-\d{2}-\d{2}$/); assert.ok(s.publishedAt===null || /^\d{4}-\d{2}-\d{2}$/.test(s.publishedAt),s.id); assert.ok(strings(s.sections)&&strings(s.supports),s.id); }); });
test('C16','Benchmark, competency and module source references exist',()=>{ const records=[data.benchmark,...data.competencies,...data.modules]; every(records,r=>{ assert.ok(strings(r.sourceIds),r.id||'benchmark'); assert.ok(unique(r.sourceIds),r.id); every(r.sourceIds,id=>assert.ok(sourceIds.has(id),id)); }); });
test('C17','Module draft states and expert-review boundary are explicit',()=>{ every(data.modules,m=>{ assert.match(m.status,/草案/); assert.equal(m.expertReview,'未完成',m.id); assert.match(m.sourceScope,/待评审草案/); }); assert.match(data.rubric.status,/草案.*未.*专家/); assert.match(data.rubric.thresholdOrigin,/非企业招聘评分/); assert.ok(strings(data.benchmark.limits)); assert.match(data.benchmark.limits.join(' '),/不代表.*企业.*录用/); });
test('C18','Project mappings reference valid competencies and rubric dimensions',()=>{ const dimensions=new Set(data.rubric.dimensions.map(x=>x.id)); assert.equal(data.projects.length,2); every(data.projects,p=>{ assert.ok(strings(p.competencyIds)&&strings(p.rubricDimensionIds)&&strings(p.deliverables)&&strings(p.criticalChecks),p.id); every(p.competencyIds,id=>assert.ok(competencyIds.has(id))); every(p.rubricDimensionIds,id=>assert.ok(dimensions.has(id))); assert.match(p.status,/草案/); }); });
test('C19','Reflection fields and evidence limitations explicit',()=>{ assert.equal(data.reflection.fields.length,8); every(data.reflection.fields,f=>assert.ok(string(f.label),f.id)); assert.match(data.reflection.minimum,/失败或限制/); assert.match(data.reflection.minimum,/改进及二次验证/); assert.match(data.reflection.limits,/不能替代可复现证据/); });
test('C20','Quality rules and review vocabulary preserve unreviewed states',()=>{ assert.deepEqual(data.qualityRules.map(r=>r.id),['clarity','breadth','precision','review']); every(data.qualityRules,r=>assert.ok(string(r.title)&&string(r.measure))); assert.ok(strings(data.statusVocabulary)&&strings(data.reviewStatusVocabulary)); assert.ok(data.statusVocabulary.includes('证据不足')); assert.ok(data.reviewStatusVocabulary.includes('专家审核未完成')); assert.match(data.rubric.gate,/未授予通过状态/); });

for(const c of checks) console.log(`${c.status} ${c.id} ${c.label}${c.error?': '+c.error:''}`);
const fail=checks.filter(x=>x.status==='FAIL').length;
console.log(`TOTAL ${checks.length}; PASS ${checks.length-fail}; FAIL ${fail}`);
console.log('SHA256 '+crypto.createHash('sha256').update(bytes).digest('hex'));
console.log('COUNTS '+JSON.stringify({competencies:data.competencies.length,levels:data.levels.length,modules:data.modules.length,sections:data.chapterStructure.sections.length,sources:data.sources.length}));
console.log('LEVELS '+JSON.stringify(Object.fromEntries(data.levels.map(l=>[l.id,data.modules.filter(m=>m.level===l.id).length]))));
console.log('TOPOLOGICAL_ORDER '+topo.join(' -> '));
console.log('NO_EXISTING_CHAPTER '+data.modules.filter(m=>!m.existingChapterIds.length).map(m=>m.id).join(', '));
console.log('Scope: data structure only; no application/browser, network, source fact check, expert review or learning-effect validation.');
process.exitCode=fail?1:0;
