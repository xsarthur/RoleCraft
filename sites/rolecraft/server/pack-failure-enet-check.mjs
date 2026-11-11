// Pack script failure must settle on E-NET, including a reload that sets the flag late.
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';

const project = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(project, 'dist');
const html = readFileSync(path.join(dist, 'index.html'), 'utf8');
assert.match(html, /window\.__rcNotePackFailure=function\(\)\{window\.__rcPackFailed=true;if\(typeof window\.__rcRerender==="function"\)window\.__rcRerender\(\);\}/);
assert.match(html, /content-v13-data\.js" onerror="__rcNotePackFailure\(\)"/);
assert.match(html, /window\.__rcBoot=\{takenOver:false\}/);

function boot(options = {}) {
  const storage = new Map(options.storage || []);
  const elements = new Map();
  const makeEl = tag => ({
    tag, id: '', hidden: false, innerHTML: '', textContent: '', className: '', dataset: {},
    classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
    setAttribute() {}, getAttribute() { return null; }, appendChild() {}, addEventListener() {},
    removeAttribute() {}, focus() {}, style: { setProperty() {} }, prepend() {},
    querySelectorAll() { return []; }
  });
  const app = makeEl('div');
  app.id = 'app';
  elements.set('app', app);
  const document = {
    visibilityState: 'hidden',
    addEventListener() {},
    getElementById(id) { return elements.get(id) || null; },
    querySelector() { return null; },
    querySelectorAll() { return []; },
    createElement: makeEl,
    body: makeEl('body'),
    documentElement: { style: { setProperty() {} } }
  };
  const context = {
    console,
    document,
    URLSearchParams,
    location: {
      protocol: 'http:',
      href: 'http://127.0.0.1/' + (options.hash || '#learn'),
      hash: options.hash || '#learn',
      replace() {},
      reload() { context.reloads += 1; }
    },
    reloads: 0,
    localStorage: {
      getItem: key => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, String(value))
    },
    sessionStorage: { getItem() { return null; }, setItem() {} },
    navigator: {},
    setTimeout, clearTimeout, setInterval, clearInterval,
    requestAnimationFrame() { return 1; },
    cancelAnimationFrame() {},
    Date, Map, Set, URL, Blob,
    fetch: options.fetch || (async () => new Promise(() => {})),
    addEventListener() {},
    __rcPackFailed: options.packFailed === true
  };
  context.globalThis = context;
  context.window = context;
  vm.createContext(context);
  vm.runInContext(readFileSync(path.join(dist, 'learning-workbench.js'), 'utf8'), context, { filename: 'learning-workbench.js' });
  vm.runInContext(readFileSync(path.join(dist, 'learning-experience-v13.js'), 'utf8'), context, { filename: 'learning-experience-v13.js' });
  context.storage = storage;
  return context;
}

function assertNet(html, label) {
  assert.match(html, /暂时连不上学习服务/, label);
  assert.match(html, /data-lw-error="network"/, label);
  assert.equal(html.includes('这篇教材暂时找不到'), false, label);
  const primary = html.indexOf('class="primary"');
  const reload = html.indexOf('重新加载');
  const back = html.indexOf('返回课程学习');
  assert.ok(primary !== -1 && reload !== -1 && back !== -1, label);
  assert.ok(primary < back && reload < back, label + ' primary reload');
  assert.match(html.slice(primary, primary + 80), /data-lw-reload/, label);
}

const failed = boot({ packFailed: true });
assertNet(failed.LearningExperienceV13.page('learn'), 'flag already true');
failed.LearningWorkbench.stopContentProbes();

const late = boot({ packFailed: false });
const firstPaint = late.LearningExperienceV13.page('learn');
assert.match(firstPaint, /这篇教材暂时找不到/);
assert.equal(firstPaint.includes('暂时连不上学习服务'), false);
late.__rcPackFailed = true;
late.__rcRerender = () => { late.settled = late.LearningExperienceV13.page('learn'); };
late.__rcNotePackFailure = function () {
  late.__rcPackFailed = true;
  if (typeof late.__rcRerender === 'function') late.__rcRerender();
};
late.__rcNotePackFailure();
assert.equal(late.__rcPackFailed, true);
assertNet(late.settled, 'onerror after first paint');
late.LearningWorkbench.stopContentProbes();

const reloaded = boot({ packFailed: true });
assertNet(reloaded.LearningExperienceV13.page('learn'), 'reload with failed pack');
reloaded.LearningWorkbench.stopContentProbes();

const firstVisit = boot({ hash: '#learn/career/uiux-design-v02' });
await new Promise(resolve => setTimeout(resolve, 30));
const firstHtml = firstVisit.LearningExperienceV13.page('learn');
assert.match(firstHtml, /首次打开需要下载并整理教材，请保持页面打开。/);
assert.equal(firstHtml.includes('通常只需几秒'), false);
assert.equal(firstHtml.includes('练习草稿、提交与反馈'), false);
assert.match(firstHtml, /正在准备教材/);
firstVisit.LearningWorkbench.stopContentProbes();

const marker = 'rolecraft-career-content-ready-v1:uiux-design-v02:textbook-v13';
const returnVisit = boot({ hash: '#learn/career/uiux-design-v02', storage: [[marker, '1']] });
await new Promise(resolve => setTimeout(resolve, 30));
const returnHtml = returnVisit.LearningExperienceV13.page('learn');
assert.match(returnHtml, /正在读取教材，通常只需几秒。/);
assert.equal(returnHtml.includes('首次打开需要下载并整理教材'), false);
assert.equal(returnHtml.includes('练习草稿、提交与反馈'), false);
returnVisit.LearningWorkbench.stopContentProbes();

console.log('pack failure E-NET checks passed');
process.exit(0);
