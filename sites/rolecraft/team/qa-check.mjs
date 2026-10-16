// Independent logic checks: Node VM + minimal DOM stubs, no browser or real storage.
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const source = fs.readFileSync(path.join(here, '../dist/app.js'), 'utf8');
const results = [];
function harness({ raw = null, hash = '', readError = false, writeError = false } = {}) {
  const events = {}, windowEvents = {}, nodes = new Map(), writes = [], blobs = [], historyCalls = [], timers = [];
  const flags = { readError, writeError };
  function node(id) {
    if (!nodes.has(id)) nodes.set(id, {
      id, value: '', textContent: '', innerHTML: '', dataset: {}, checked: false,
      classList: { add() {}, remove() {}, toggle() {} },
      setAttribute() {}, removeAttribute() {}, focus() {}, click() {},
      showModal() { this.open = true; }, close() { this.open = false; },
      addEventListener(type, fn) { this[type] = fn; }, querySelector: node,
    });
    return nodes.get(id);
  }
  const storage = new Map(raw === null ? [] : [['rolecraft-v1', raw]]);
  const context = vm.createContext({
    document: {
      getElementById: node,
      querySelectorAll(selector) { return selector === 'nav button' ? ['home','path','book','projects','sources'].map(v => { const n = node('nav-'+v); n.dataset.view = v; return n; }) : []; },
      addEventListener(type, fn) { events[type] = fn; }, createElement: node,
    },
    window: { scrollY: 0, scrollTo() {}, addEventListener(type, fn) { windowEvents[type] = fn; } },
    location: { hash },
    history: { replaceState(...args) { historyCalls.push(['replaceState', ...args]); }, pushState(...args) { historyCalls.push(['pushState', ...args]); } },
    localStorage: {
      getItem(key) { if (flags.readError) throw new Error('storage read denied'); return storage.get(key) ?? null; },
      setItem(key, value) { if (flags.writeError) throw new Error('quota exceeded'); storage.set(key, value); writes.push(value); },
    },
    Blob: class { constructor(parts, opts) { this.parts = parts; this.type = opts.type; blobs.push(this); } },
    URL: { createObjectURL() { return 'blob:qa-only'; }, revokeObjectURL() {} },
    FormData: class { constructor(form) { this.fields = form.fields; } get(key) { return this.fields[key]; } },
    setTimeout(fn, ms) { timers.push({ fn, ms }); return timers.length; }, clearTimeout() {},
  });
  vm.runInContext(source, context, { filename: 'dist/app.js' });
  const run = code => vm.runInContext(code, context);
  const click = dataset => events.click({ target: { closest: () => ({ dataset }) } });
  return { run, click, events, windowEvents, node, storage, writes, blobs, historyCalls, timers, flags, context };
}
function test(id, label, fn) {
  try { fn(); results.push({ id, label, status: 'PASS' }); }
  catch (error) { results.push({ id, label, status: 'FAIL', error: error.message.split('\n')[0] }); }
}
function record(extra = {}) { return JSON.stringify({ profile: { level: 'beginner', goal: 'career', hours: 8 }, passed: [], checks: {}, notes: {}, lastLesson: 'foundation', ...extra }); }

test('T01', 'Default state and first view', () => { const h = harness(); assert.equal(h.run('view'), 'home'); assert.equal(h.run('progress()'), 0); assert.match(h.node('app').innerHTML, /体验原型|职业学习路线/); });
test('T02', 'Three route orders and reference hours', () => { const h = harness(); const expected = { beginner: [8,128,'foundation'], developer: [7,104,'models'], practitioner: [5,80,'eval'] }; for (const [level,[count,hours,first]] of Object.entries(expected)) { h.run(`state.profile.level='${level}'`); assert.equal(h.run('route().length'), count); assert.equal(h.run('plannedHours()'), hours); assert.equal(h.run('route()[0].id'), first); } });
test('T03', 'Three goals change guidance', () => { const h = harness(); for (const [goal,phrase] of Object.entries({ career:'作品集材料', product:'自己的业务问题', advanced:'成本和回归测试' })) { h.run(`state.profile.goal='${goal}'`); assert.ok(h.run('pathPage()').includes(phrase)); } });
test('T04', 'All five views and all eight lessons render', () => { const h = harness(); for (const v of ['home','path','book','projects','sources']) { h.run(`navigate('${v}')`); assert.match(h.node('app').innerHTML, /<h1>/); } for (const id of JSON.parse(h.run('JSON.stringify(modules.map(m=>m.id))'))) { h.click({ lesson:id }); assert.match(h.node('app').innerHTML, /教材示例/); assert.equal(h.run('selected'),id); } });
test('T05', 'Unanswered/wrong quiz does not award pass', () => { const h=harness(); h.click({lesson:'foundation'}); h.click({action:'quiz'}); assert.equal(h.run('state.passed.length'),0); h.click({choice:'0'}); h.click({action:'quiz'}); assert.equal(h.run('quizResult'),false); assert.equal(h.run('state.passed.length'),0); });
test('T06', 'Correct answer records pass once for all lessons', () => { const h=harness(); for (const id of JSON.parse(h.run('JSON.stringify(modules.map(m=>m.id))'))) { h.click({lesson:id}); h.click({choice:String(h.run('modules.find(m=>m.id===selected).lesson.answer'))}); h.click({action:'quiz'}); h.click({action:'quiz'}); } assert.equal(h.run('state.passed.length'),8); assert.equal(h.run('progress()'),100); assert.match(h.node('app').innerHTML,/已记录本章测验通过/); });
test('T07', 'Quiz selection resets on lesson navigation', () => { const h=harness(); h.click({lesson:'foundation'}); h.click({choice:'1'}); h.click({action:'quiz'}); h.click({lesson:'models'}); assert.equal(h.run('quizChoice'),null); assert.equal(h.run('quizResult'),null); });
test('T08', 'Pass, self checks, note and selected chapter restore', () => { const h=harness(); h.click({lesson:'tools'}); h.click({choice:'1'}); h.click({action:'quiz'}); h.events.input({target:{dataset:{note:'p1'},value:'https://example.test/repo'}}); h.events.change({target:{dataset:{project:'p1',check:'2'},checked:true}}); const restored=harness({raw:h.storage.get('rolecraft-v1'),hash:'#book'}); assert.equal(restored.run('selected'),'tools'); assert.ok(restored.run("state.passed.includes('tools')")); assert.ok(restored.run('state.checks.p1.includes(2)')); assert.equal(restored.run('state.notes.p1'),'https://example.test/repo'); });
test('T09', 'Checkbox events deduplicate and remove', () => { const h=harness(); const target={dataset:{project:'p2',check:'1'},checked:true}; h.events.change({target}); h.events.change({target}); assert.equal(h.run('state.checks.p2.length'),1); target.checked=false; h.events.change({target}); assert.equal(h.run('state.checks.p2.length'),0); });
test('T10', 'Notes HTML escape and 12000 character limit', () => { const h=harness(); const payload='</textarea><img src=x onerror=alert(1)>\"\'&'; h.events.input({target:{dataset:{note:'p1'},value:payload}}); const html=h.run('projectsPage()'); assert.ok(!html.includes(payload)); assert.ok(html.includes('&lt;/textarea&gt;')); assert.ok(html.includes('&quot;')); h.events.input({target:{dataset:{note:'p1'},value:'x'.repeat(13000)}}); assert.equal(h.run('state.notes.p1.length'),12000); });
test('T11', 'Profile submission preserves existing records', () => { const h=harness({raw:record({passed:['foundation'],checks:{p1:[0]},notes:{p1:'keep'}})}); h.node('profile-form').submit({preventDefault(){},target:{fields:{level:'developer',goal:'product',hours:'10'}}}); assert.equal(h.run('view'),'path'); assert.equal(h.run('selected'),'models'); assert.equal(h.run('state.profile.hours'),10); assert.equal(h.run('state.notes.p1'),'keep'); assert.ok(h.run("state.passed.includes('foundation')")); });
test('T12', 'Storage read failure and malformed JSON fall back', () => { for (const options of [{readError:true},{raw:'{invalid'}]) { const h=harness(options); assert.equal(h.run('state.profile.level'),'beginner'); assert.equal(h.run('state.passed.length'),0); } });
test('T13', 'Stored profile hours clamp and unknown pass ID filters', () => { const h=harness({raw:record({profile:{level:'developer',goal:'product',hours:100},passed:['tools','unknown'],lastLesson:'unknown'})}); assert.equal(h.run('state.profile.hours'),20); assert.equal(h.run('state.passed.length'),1); assert.equal(h.run('selected'),'foundation'); });
test('T14', 'Storage write failure warns and keeps current memory', () => { const h=harness({writeError:true}); h.events.input({target:{dataset:{note:'p1'},value:'unsaved'}}); assert.equal(h.run('state.notes.p1'),'unsaved'); assert.equal(h.writes.length,0); assert.equal(h.run('storageAvailable'),false); assert.match(h.node('toast').textContent,/无法保存/); });
test('T15', 'Export contains disclaimer, references and current note', () => { const h=harness(); h.run("state.notes.p1='qa note'; exportPlan()"); const body=h.blobs[0].parts.join(''); assert.equal(h.blobs[0].type,'text/markdown;charset=utf-8'); assert.match(body,/非实时 AI 生成/); assert.match(body,/qa note/); assert.match(body,/https:\/\/www.anthropic.com/); assert.match(body,/\n## 项目：/); });
test('T16', 'Navigation uses separate history entries (design requirement)', () => { const h=harness(); h.run("navigate('path'); navigate('book')"); assert.equal(h.historyCalls.filter(x=>x[0]==='pushState').length,2); });
test('T17', 'Corrupted stored self checks do not break export', () => { const h=harness({raw:record({checks:{p1:{bad:true}}})}); h.run('projectsPage(); exportPlan()'); assert.equal(h.blobs.length,1); });
test('T18', 'Stored duplicate passes normalize', () => { const h=harness({raw:record({passed:['foundation','foundation']})}); assert.equal(h.run('state.passed.length'),1); });
test('T19', 'Stored out-of-range/duplicate checks stay within project length', () => { const h=harness({raw:record({checks:{p1:[0,0,1,2,3,4,99]}})}); const html=h.run('projectsPage()'); assert.ok(!html.includes('140%')); assert.ok(!html.includes('7 / 5')); });
test('T20', 'Successful save after transient failure resets availability', () => { const h=harness({writeError:true}); h.run('save()'); h.flags.writeError=false; h.run('save()'); assert.equal(h.writes.length,1); assert.equal(h.run('storageAvailable'),true); });
test('T21', 'Hashchange cannot carry quiz feedback into another selected chapter', () => { const h=harness(); h.click({lesson:'foundation'}); h.click({choice:'1'}); h.click({action:'quiz'}); h.run("location.hash='#path'"); h.windowEvents.hashchange(); h.node('profile-form').submit({preventDefault(){},target:{fields:{level:'developer',goal:'career',hours:'8'}}}); h.run("location.hash='#book'"); h.windowEvents.hashchange(); assert.equal(h.run('selected'),'models'); assert.equal(h.run('quizResult'),null); });
test('T22', 'No concept quiz or self checks assert career certification', () => { const h=harness(); assert.match(h.run('home()'),/测验只验证概念理解/); assert.match(h.run('projectsPage()'),/不会授予职业资格/); assert.match(h.run('sourcesPage()'),/尚未接入自动检索、教材生成或专家审核/); });

for (const r of results) console.log(`${r.status} ${r.id} ${r.label}${r.error ? ': '+r.error : ''}`);
const failed=results.filter(r=>r.status==='FAIL');
console.log(`TOTAL ${results.length}; PASS ${results.length-failed.length}; FAIL ${failed.length}`);
console.log('Scope: VM logic only; no browser rendering, real storage, network, dependencies, or application changes.');
process.exitCode = failed.length ? 1 : 0;
