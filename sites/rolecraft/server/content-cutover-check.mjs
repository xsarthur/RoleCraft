// Mid-read textbook cutover: identity endpoint, non-modal banner, and 409 refresh copy.
import { mkdtempSync, rmSync, readFileSync } from 'node:fs';
import vm from 'node:vm';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { createRolecraftServer } from './index.mjs';

const project = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dir = mkdtempSync(path.join(os.tmpdir(), 'rolecraft-cutover-'));
const app = createRolecraftServer({ dataDir: dir });
const localHash = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';

function learningBody(extra = {}) {
  return {
    requestId: crypto.randomUUID(),
    query: 'ReAct 是什么',
    careerId: 'agent-developer',
    contentVersion: 'textbook-v13',
    textbookVersionId: 'agent-engineering-v13',
    useCurrentContext: false,
    locale: 'zh-CN',
    workbenchVersion: 'local-workbench-0.11',
    agentVersion: 'agent-system-v0.12',
    ...extra,
  };
}

function browserContext(fetchImpl, clock) {
  const elements = new Map();
  const makeEl = tag => ({
    tag,
    id: '',
    hidden: false,
    innerHTML: '',
    textContent: '',
    className: '',
    role: '',
    classList: { toggle() {}, add() {}, remove() {}, contains() { return false; } },
    setAttribute(name, value) { this[name] = value; },
    getAttribute(name) { return this[name] ?? null; },
    appendChild() {},
    addEventListener() {},
    removeAttribute() {},
    focus() {},
    click() { this.clicked = true; },
    style: { setProperty() {} },
    dataset: {},
    parentNode: null,
  });
  const body = makeEl('body');
  body.insertBefore = node => {
    if (node?.id) elements.set(node.id, node);
    node.parentNode = body;
    return node;
  };
  const footer = makeEl('span');
  footer.id = 'rc-textbook-version';
  footer.textContent = '本机会话教材 textbook-v13 · 本浏览器保存 · rolecraft-1.0';
  elements.set(footer.id, footer);
  const save = makeEl('div');
  save.id = 'save-status';
  save.parentNode = body;
  elements.set(save.id, save);
  const storage = new Map();
  const document = {
    visibilityState: 'hidden',
    listeners: [],
    addEventListener(type, fn) { this.listeners.push({ type, fn }); },
    getElementById(id) { return elements.get(id) || null; },
    querySelector() { return null; },
    querySelectorAll() { return []; },
    createElement: makeEl,
    body,
    documentElement: { style: { setProperty() {} } },
  };
  const location = {
    protocol: 'http:',
    href: 'http://127.0.0.1:9/#learn/agent/00-learning-route',
    hash: '#learn/agent/00-learning-route',
    replaced: '',
    reloaded: false,
    replace(url) { this.replaced = String(url); },
    reload() { this.reloaded = true; },
  };
  const RealDate = Date;
  class ClockDate extends RealDate {
    static now() { return clock.now; }
  }
  const context = {
    console,
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval,
    Date: ClockDate,
    URL,
    URLSearchParams,
    Map,
    Set,
    document,
    location,
    localStorage: {
      getItem: key => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, String(value)),
      key: index => [...storage.keys()][index] ?? null,
      get length() { return storage.size; },
    },
    fetch: fetchImpl,
    fetchLog: [],
    elements,
    storage,
  };
  context.globalThis = context;
  context.window = context;
  context.RolecraftContentV13 = { corpusVersion: 'textbook-v13', corpusHash: localHash };
  return context;
}

await new Promise(resolve => app.server.listen(0, '127.0.0.1', resolve));
const base = `http://127.0.0.1:${app.server.address().port}`;
try {
  const identity = await fetch(base + '/api/content/identity');
  const identityBody = await identity.json();
  const health = await fetch(base + '/api/health');
  const healthBody = await health.json();
  assert.equal(identity.status, 200);
  assert.equal(identityBody.contentVersion, 'textbook-v13');
  assert.equal(identityBody.textbookVersionId, 'agent-engineering-v13');
  assert.equal(identityBody.corpusVersion, healthBody.contentRetrieval.corpusVersion);
  assert.equal(identityBody.corpusHash, healthBody.contentRetrieval.corpusHash);
  assert.equal(identityBody.textbookVersionId, healthBody.contentRetrieval.textbookVersionId);
  assert.equal(identityBody.available, healthBody.contentRetrieval.available);
  assert.equal(identity.headers.get('cache-control'), 'no-store');

  const stale = await fetch(base + '/api/agent/learning/query', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(learningBody({ contentVersion: 'textbook-v12', textbookVersionId: 'agent-engineering-v12' })),
  });
  const staleBody = await stale.json();
  assert.equal(stale.status, 409);
  assert.equal(staleBody.error.code, 'content_version_mismatch');
  assert.match(staleBody.error.message, /刷新/);

  const staleTextbook = await fetch(base + '/api/agent/learning/query', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(learningBody({ textbookVersionId: 'agent-engineering-v12' })),
  });
  const staleTextbookBody = await staleTextbook.json();
  assert.equal(staleTextbook.status, 409);
  assert.equal(staleTextbookBody.error.code, 'content_version_mismatch');

  const serverSource = readFileSync(path.join(project, 'server/index.mjs'), 'utf8');
  const clientSource = readFileSync(path.join(project, 'dist/learning-workbench.js'), 'utf8');
  assert.match(serverSource, /contentVersion:'textbook-v13'/);
  assert.match(serverSource, /'textbook-v12':\{corpusHash:rollbackContentIndex\.corpusHash/);
  assert.match(clientSource, /const CURRENT = 'textbook-v13'/);
  assert.equal(clientSource.includes("const CURRENT = 'textbook-v12'"), false);
  assert.match(clientSource, /RolecraftContentV13/);
  assert.equal(clientSource.includes('RolecraftContentV12'), false);
  assert.equal(serverSource.includes('openclaw') || serverSource.includes('OpenClaw'), false);

  let identityMode = 'new';
  const clock = { now: Date.now() };
  const context = browserContext(async url => {
    context.fetchLog.push(String(url));
    if (String(url).includes('/api/content/identity')) {
      if (identityMode === 'missing') return { ok: false, status: 404, json: async () => ({}) };
      return { ok: true, status: 200, json: async () => ({ contentVersion: 'textbook-v14', corpusVersion: 'textbook-v14', corpusHash: 'serverhash', textbookVersionId: 'agent-engineering-v14', available: true }) };
    }
    if (String(url).includes('/api/health')) {
      return { ok: true, status: 200, json: async () => ({ contentRetrieval: { contentVersion: 'textbook-v14', corpusVersion: 'textbook-v14', corpusHash: 'from-health', textbookVersionId: 'agent-engineering-v14', available: true } }) };
    }
    return { ok: false, status: 404, json: async () => ({}) };
  }, clock);
  vm.createContext(context);
  vm.runInContext(readFileSync(path.join(project, 'dist/learning-workbench.js'), 'utf8'), context, { filename: 'learning-workbench.js' });
  const workbench = context.LearningWorkbench;
  assert.equal(workbench.localContentIdentity().contentVersion, 'textbook-v13');
  assert.equal(workbench.localContentIdentity().corpusHash, localHash);
  assert.equal(workbench.contentCutoverState().probeMs, 7 * 60 * 1000);
  assert.equal(workbench.contentCutoverState().snoozeMs, 30 * 60 * 1000);

  const same = workbench.compareContentIdentity({ contentVersion: 'textbook-v13', corpusHash: localHash }, { contentVersion: 'textbook-v13', corpusHash: localHash, available: true });
  assert.equal(same.status, 'match');
  const staleClient = workbench.compareContentIdentity({ contentVersion: 'textbook-v12', corpusHash: localHash }, { contentVersion: 'textbook-v13', corpusHash: 'serverhash', available: true });
  assert.equal(staleClient.status, 'mismatch');
  assert.equal(staleClient.versionMismatch, true);
  const versionDrift = workbench.compareContentIdentity({ contentVersion: 'textbook-v13', corpusHash: localHash }, { contentVersion: 'textbook-v14', corpusHash: 'serverhash', available: true });
  assert.equal(versionDrift.status, 'mismatch');
  assert.equal(versionDrift.versionMismatch, true);
  const hashDrift = workbench.compareContentIdentity({ contentVersion: 'textbook-v13', corpusHash: localHash }, { contentVersion: 'textbook-v13', corpusHash: 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb', available: true });
  assert.equal(hashDrift.status, 'mismatch');
  assert.equal(hashDrift.hashMismatch, true);
  assert.equal(hashDrift.versionMismatch, false);

  const shown = workbench.applyServerIdentity({ contentVersion: 'textbook-v14', corpusHash: 'serverhash', available: true });
  const banner = context.elements.get('lw-content-update');
  assert.equal(shown.visible, true);
  assert.equal(shown.comparison.status, 'mismatch');
  assert.equal(banner.hidden, false);
  assert.equal(banner.role, 'region');
  assert.equal(banner.tag, 'div');
  assert.match(banner.innerHTML, /教材已更新（textbook-v13 → textbook-v14）/);
  assert.match(banner.innerHTML, /当前打开的页面可能仍显示旧正文/);
  assert.match(banner.innerHTML, /不会自动重载，提问仍可继续/);
  assert.match(banner.innerHTML, /data-lw-content-refresh>刷新到新版/);
  assert.match(banner.innerHTML, /data-lw-content-export>先导出本机记录/);
  assert.match(banner.innerHTML, /data-lw-content-snooze>30 分钟后再提醒/);
  assert.equal(banner.innerHTML.includes('<dialog'), false);
  assert.equal(banner.innerHTML.includes('showModal'), false);
  assert.equal(banner.innerHTML.includes('aria-modal'), false);
  assert.match(context.elements.get('rc-textbook-version').textContent, /本机会话教材 textbook-v13 · 服务端 textbook-v14/);

  const alertHtml = workbench.contentUpdateMarkup('alert');
  assert.match(alertHtml, /data-lw-content-refresh>立即刷新/);
  assert.equal(alertHtml.includes('data-lw-content-snooze'), false);
  assert.equal(alertHtml.includes('<dialog'), false);
  assert.match(alertHtml, /role="alert"/);

  const hashShown = workbench.applyServerIdentity({ contentVersion: 'textbook-v13', corpusHash: 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb', available: true });
  assert.equal(hashShown.comparison.hashMismatch, true);
  assert.match(banner.innerHTML, /教材已更新（textbook-v13，内容已更换）/);
  workbench.applyServerIdentity({ contentVersion: 'textbook-v14', corpusHash: 'serverhash', available: true });

  assert.equal(workbench.snoozeContentUpdate(), true);
  assert.equal(workbench.contentCutoverState().visible, false);
  assert.equal(workbench.contentCutoverState().comparison.status, 'mismatch');
  assert.equal(workbench.contentCutoverState().snoozed, true);
  assert.equal(banner.hidden, true);
  context.storage.set('rolecraft-content-update-snooze', JSON.stringify({ until: clock.now - 1000, fingerprint: 'expired' }));
  workbench.applyServerIdentity({ contentVersion: 'textbook-v14', corpusHash: 'serverhash', available: true });
  assert.equal(workbench.contentCutoverState().visible, true);
  assert.equal(banner.hidden, false);

  workbench.hardRefreshToNewContent();
  const refreshed = new URL(context.location.replaced);
  assert.equal(refreshed.hash, '#learn/agent/00-learning-route');
  assert.match(refreshed.searchParams.get('rc_content'), /^\d+$/);
  assert.equal(context.location.reloaded, false);

  context.LearningExperienceV13 = { exportAll() { context.exported = true; } };
  workbench.exportLocalLearningRecords();
  assert.equal(context.exported, true);

  identityMode = 'new';
  const probed = await workbench.probeContentIdentity({ force: true, reason: 'enter' });
  assert.equal(probed.comparison.status, 'mismatch');
  assert.equal(probed.comparison.server.contentVersion, 'textbook-v14');
  assert.equal(context.fetchLog.some(url => url.includes('/api/content/identity')), true);

  identityMode = 'missing';
  const fromHealth = await workbench.probeContentIdentity({ force: true, reason: 'visible' });
  assert.equal(fromHealth.comparison.server.corpusHash, 'from-health');
  assert.equal(context.fetchLog.some(url => url.includes('/api/health')), true);

  context.document.visibilityState = 'visible';
  const listener = context.document.listeners.find(item => item.type === 'visibilitychange');
  assert.ok(listener);
  const beforeVisible = context.fetchLog.length;
  listener.fn();
  assert.equal(context.fetchLog.length, beforeVisible);
  clock.now += 21000;
  listener.fn();
  await new Promise(resolve => setTimeout(resolve, 20));
  assert.ok(context.fetchLog.length > beforeVisible);

  const noted = workbench.noteContentVersionMismatch({ code: 'content_version_mismatch', message: '学习内容版本已变化，请刷新职业教材后重试' });
  assert.equal(noted.apiMismatch.code, 'content_version_mismatch');
  await workbench.probeContentIdentity({ force: true, reason: 'api' });
  assert.match(banner.innerHTML, /data-lw-content-refresh>刷新到新版/);
  assert.equal(banner.hidden, false);

  const matched = workbench.applyServerIdentity({ contentVersion: 'textbook-v13', corpusHash: localHash, available: true });
  assert.equal(matched.comparison.status, 'match');
  assert.match(context.elements.get('rc-textbook-version').textContent, /与服务端一致/);
  workbench.stopContentProbes();
  console.log('content cutover checks passed');
} finally {
  await app.close();
  rmSync(dir, { recursive: true, force: true });
}
