// Isolated checks for REG-AUTH-USERS-INSERT, AC-01 task CTAs, and AC-07 drawer focus.
// Uses a temporary SQLite directory. Does not open or modify .runtime/rolecraft.sqlite.
import { mkdtempSync, rmSync } from 'node:fs';
import { spawn } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { createRolecraftServer } from './index.mjs';

const PASSWORD = 'TestPass123!';
const SHORT_PASSWORD = 'TestPass12!';

function seedUsers(dir, withAccountType) {
  const db = new DatabaseSync(path.join(dir, 'rolecraft.sqlite'));
  if (withAccountType) {
    db.exec(`CREATE TABLE users(
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      salt TEXT NOT NULL,
      created_at TEXT NOT NULL,
      account_type TEXT NOT NULL DEFAULT 'member'
    )`);
    db.prepare('INSERT INTO users(id,email,password_hash,salt,created_at,account_type) VALUES(?,?,?,?,?,?)')
      .run('kept-user', 'kept@example.com', 'aa', 'bb', '2020-01-01T00:00:00.000Z', 'member');
  } else {
    db.exec(`CREATE TABLE users(
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      salt TEXT NOT NULL,
      created_at TEXT NOT NULL
    )`);
    db.prepare('INSERT INTO users(id,email,password_hash,salt,created_at) VALUES(?,?,?,?,?)')
      .run('kept-user', 'kept@example.com', 'aa', 'bb', '2020-01-01T00:00:00.000Z');
  }
  db.close();
}

function readUsers(dir) {
  const db = new DatabaseSync(path.join(dir, 'rolecraft.sqlite'));
  const rows = db.prepare('SELECT id, email, account_type FROM users ORDER BY email').all();
  db.close();
  return rows;
}

async function withServer(dir, fn) {
  const app = createRolecraftServer({ dataDir: dir });
  await new Promise(resolve => app.server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${app.server.address().port}`;
  try { await fn(base); }
  finally { await app.close(); }
}

async function register(base, email, password = PASSWORD) {
  const response = await fetch(base + '/api/auth/register', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const body = await response.json();
  return { status: response.status, body };
}

async function checkRegister() {
  const fresh = mkdtempSync(path.join(os.tmpdir(), 'rolecraft-reg-fresh-'));
  const five = mkdtempSync(path.join(os.tmpdir(), 'rolecraft-reg-five-'));
  const six = mkdtempSync(path.join(os.tmpdir(), 'rolecraft-reg-six-'));
  try {
    seedUsers(five, false);
    seedUsers(six, true);
    await withServer(fresh, async base => {
      const created = await register(base, 'fresh@example.com');
      assert.equal(created.status, 201, JSON.stringify(created.body));
      assert.equal(created.body.user.email, 'fresh@example.com');
      const short = await register(base, 'short@example.com', SHORT_PASSWORD);
      assert.equal(short.status, 400, JSON.stringify(short.body));
      assert.equal(short.body.error.code, 'input_invalid');
    });
    assert.deepEqual(readUsers(fresh).map(row => [row.email, row.account_type]), [['fresh@example.com', 'member']]);

    await withServer(five, async base => {
      const created = await register(base, 'added@example.com');
      assert.equal(created.status, 201, JSON.stringify(created.body));
    });
    const fiveRows = readUsers(five);
    assert.equal(fiveRows.length, 2);
    const kept = fiveRows.find(row => row.id === 'kept-user');
    assert.equal(kept.email, 'kept@example.com');
    assert.equal(kept.account_type, 'member');
    assert.equal(fiveRows.find(row => row.email === 'added@example.com').account_type, 'member');

    await withServer(six, async base => {
      const created = await register(base, 'existing-column@example.com');
      assert.equal(created.status, 201, JSON.stringify(created.body));
      const short = await register(base, 'short-six@example.com', SHORT_PASSWORD);
      assert.equal(short.status, 400);
      assert.notEqual(short.body.error.code, 'server_error');
    });
    const sixRows = readUsers(six);
    assert.equal(sixRows.length, 2);
    assert.ok(sixRows.every(row => row.account_type === 'member'));
    assert.ok(sixRows.some(row => row.id === 'kept-user' && row.email === 'kept@example.com'));
    assert.ok(sixRows.some(row => row.email === 'existing-column@example.com'));
    console.log('REG-AUTH-USERS-INSERT: fresh schema, 5-column upgrade, and existing account_type all register without deleting kept rows.');
  } finally {
    rmSync(fresh, { recursive: true, force: true });
    rmSync(five, { recursive: true, force: true });
    rmSync(six, { recursive: true, force: true });
  }
}

function startChrome(port, userDataDir) {
  const chrome = spawn('/usr/local/bin/google-chrome', [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--disable-dev-shm-usage',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${userDataDir}`,
    'about:blank',
  ], { stdio: 'ignore' });
  return chrome;
}

function openSocket(url) {
  const ws = new WebSocket(url);
  let id = 0;
  const pending = new Map();
  const events = [];
  const contexts = [];
  let mainFrameId = '';
  const ready = new Promise((resolve, reject) => { ws.addEventListener('open', resolve); ws.addEventListener('error', reject); });
  ws.addEventListener('message', event => {
    const message = JSON.parse(event.data);
    if (message.method === 'Runtime.executionContextCreated' && message.params?.context) contexts.push(message.params.context);
    if (message.method === 'Runtime.executionContextDestroyed') {
      const index = contexts.findIndex(context => context.id === message.params.executionContextId);
      if (index >= 0) contexts.splice(index, 1);
    }
    if (message.method === 'Runtime.executionContextsCleared') contexts.length = 0;
    if (message.method) events.push(message.method);
    if (message.id && pending.has(message.id)) pending.get(message.id)(message);
  });
  const send = (method, params = {}, timeout = 20000) => new Promise((resolve, reject) => {
    const msgId = ++id;
    const timer = setTimeout(() => { pending.delete(msgId); reject(new Error(method + ' timed out')); }, timeout);
    pending.set(msgId, message => {
      clearTimeout(timer);
      if (message.error) reject(new Error(message.error.message || JSON.stringify(message.error)));
      else resolve(message.result);
    });
    ws.send(JSON.stringify({ id: msgId, method, params }));
  });
  function context() {
    const match = [...contexts].reverse().find(item => item.auxData?.isDefault && (!mainFrameId || item.auxData.frameId === mainFrameId));
    return match?.id || 0;
  }
  return { ws, send, ready, events, context, setMainFrame(frameId) { mainFrameId = frameId; } };
}

async function connectCdp(port) {
  let last = '';
  for (let i = 0; i < 40; i++) {
    try {
      const version = await fetch(`http://127.0.0.1:${port}/json/version`).then(response => response.json());
      const browser = openSocket(version.webSocketDebuggerUrl);
      await browser.ready;
      const created = await browser.send('Target.createTarget', { url: 'about:blank' });
      const targets = await fetch(`http://127.0.0.1:${port}/json/list`).then(response => response.json());
      const page = targets.find(target => target.id === created.targetId && target.webSocketDebuggerUrl);
      if (!page) throw new Error('page target missing');
      const pageSocket = openSocket(page.webSocketDebuggerUrl);
      await pageSocket.ready;
      browser.ws.close();
      return pageSocket;
    } catch (error) { last = error.message; await new Promise(resolve => setTimeout(resolve, 250)); }
  }
  throw new Error('Chrome DevTools did not open: ' + last);
}

async function evaluate(send, expression, contextId = 0) {
  const message = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true, ...(contextId ? { contextId } : {}) });
  if (!message) throw new Error('empty evaluation result');
  const details = message.exceptionDetails;
  if (details) throw new Error((details.exception?.description || details.text || 'evaluate failed') + '\n' + (details.stackTrace?.callFrames || []).slice(0, 4).map(frame => frame.functionName + ' ' + frame.lineNumber).join('\n'));
  return message.result?.value;
}

async function waitFor(run, expression, timeout = 25000) {
  const started = Date.now();
  let last;
  while (Date.now() - started < timeout) {
    try { last = await run(expression); }
    catch (error) { last = error.message; }
    if (last === true) return last;
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  throw new Error('Timed out waiting for ' + expression + ' last=' + JSON.stringify(last));
}

async function checkBrowser(base) {
  const port = 9334;
  const profile = mkdtempSync(path.join(os.tmpdir(), 'rolecraft-cdp-'));
  const chrome = startChrome(port, profile);
  try {
    const page = await connectCdp(port);
    const { ws, send: call } = page;
    await call('Page.enable');
    await call('Runtime.enable');
    page.setMainFrame((await call('Page.getFrameTree')).frameTree.frame.id);
    const run = expression => evaluate(call, expression, page.context());
    await call('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
    await call('Page.navigate', { url: base + '/#learn/career/uiux-product-designer' });

    async function readEntry() {
      return run(`(() => {
        const state = globalThis.LearningWorkbench?.careerContentState?.();
        const link = document.querySelector('a.primary[data-task-state]');
        if (!link || state?.status !== 'ready') return null;
        return { state: link.getAttribute('data-task-state'), cta: link.getAttribute('data-task-cta'), text: link.textContent.trim(), href: link.getAttribute('href'), status: state.status };
      })()`);
    }
    async function settledEntry() {
      let previous = '';
      let stable = 0;
      const started = Date.now();
      while (Date.now() - started < 12000) {
        const current = await readEntry().catch(error => ({ error: error.message }));
        const key = JSON.stringify(current);
        if (current && !current.error && key === previous) stable += 1;
        else stable = 0;
        previous = key;
        if (stable >= 2) return current;
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      throw new Error('task CTA did not settle: ' + previous);
    }
    async function reloadEntry() {
      const previousContext = page.context();
      await call('Page.reload', { ignoreCache: true });
      const started = Date.now();
      while (page.context() === previousContext && Date.now() - started < 5000) await new Promise(resolve => setTimeout(resolve, 50));
      return settledEntry();
    }
    const initial = await settledEntry();
    assert.equal(initial.state, 'not_started');
    const firstUnit = String(initial.href).split('/').filter(Boolean).at(-1) || '';
    await run( `LearningWorkbench.induceCareerTask('not_started', { careerId: 'uiux-product-designer' })`);
    const notStarted = await reloadEntry();
    await run(`location.hash = ${JSON.stringify('#learn/career/uiux-product-designer/' + firstUnit)}`);
    await waitFor(run, `globalThis.LearningWorkbench?.careerTask?.('uiux-product-designer')?.state === 'in_progress'`);
    await run(`location.hash = '#learn/career/uiux-product-designer'`);
    const inProgress = await reloadEntry();
    assert.equal(inProgress.state, 'in_progress', 'opening a chapter should persist in_progress after refresh');
    const interruptedNow = await run( `(() => {
      document.querySelector('[data-lw-interrupt]')?.click();
      const link = document.querySelector('a.primary[data-task-state]');
      return link ? link.getAttribute('data-task-state') : '';
    })()`);
    assert.equal(interruptedNow, 'interrupted');
    const interrupted = await reloadEntry();
    await run( `LearningWorkbench.induceCareerTask('browsed', { careerId: 'uiux-product-designer', unitId: ${JSON.stringify(firstUnit)} })`);
    const browsed = await reloadEntry();
    const observed = [notStarted, inProgress, interrupted, browsed];
    const labels = new Set(observed.map(item => item.cta));
    const states = new Set(observed.map(item => item.state));
    assert.equal(notStarted.state, 'not_started');
    assert.equal(notStarted.cta, '开始学习');
    assert.equal(inProgress.state, 'in_progress');
    assert.equal(inProgress.cta, '继续学习');
    assert.equal(interrupted.state, 'interrupted');
    assert.equal(interrupted.cta, '恢复任务');
    assert.equal(browsed.state, 'browsed');
    assert.equal(browsed.cta, '回顾学习');
    assert.ok(states.size >= 3, JSON.stringify(observed));
    assert.ok(labels.size >= 3, JSON.stringify(observed));
    for (const item of observed) assert.equal(item.text, item.cta + ' →');
    console.log('AC-01: four task states restored after refresh with distinct primary CTAs:', observed.map(item => item.state + '=' + item.cta).join(', '));

    const focus = await run( `(() => {
      document.querySelector('#lw-assistant-launcher').click();
      const panel = document.getElementById('lw-find-panel');
      const items = [...panel.querySelectorAll('a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), summary, [tabindex]:not([tabindex="-1"])')].filter(el => el.getClientRects().length > 0);
      const first = items[0], last = items[items.length - 1];
      const mark = el => el?.id || el?.getAttribute('data-lw-collapse') || el?.textContent?.trim().slice(0, 24) || '';
      first.focus();
      const shift = new KeyboardEvent('keydown', { key: 'Tab', code: 'Tab', shiftKey: true, bubbles: true, cancelable: true });
      document.dispatchEvent(shift);
      const afterShift = mark(document.activeElement);
      last.focus();
      const tab = new KeyboardEvent('keydown', { key: 'Tab', code: 'Tab', bubbles: true, cancelable: true });
      document.dispatchEvent(tab);
      const afterTab = mark(document.activeElement);
      const escape = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true });
      document.dispatchEvent(escape);
      return {
        count: items.length,
        modal: panel.getAttribute('aria-modal'),
        shiftPrevented: shift.defaultPrevented,
        tabPrevented: tab.defaultPrevented,
        afterShift,
        afterTab,
        first: mark(first),
        last: mark(last),
        closed: !document.getElementById('lw-find-panel'),
        restored: document.activeElement?.id || ''
      };
    })()`);
    assert.ok(focus.count >= 2, JSON.stringify(focus));
    assert.equal(focus.modal, 'true');
    assert.equal(focus.shiftPrevented, true);
    assert.equal(focus.tabPrevented, true);
    assert.equal(focus.afterShift, focus.last);
    assert.equal(focus.afterTab, focus.first);
    assert.equal(focus.closed, true);
    assert.equal(focus.restored, 'lw-assistant-launcher');
    console.log('AC-07 keyboard: Tab wraps inside the drawer, Shift+Tab wraps backward, Escape restores the launcher.');

    const overflow = {};
    for (const width of [1280, 768, 390]) {
      await call('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: width < 500 });
      await new Promise(resolve => setTimeout(resolve, 100));
      overflow[width] = await run( `(() => {
        const root = document.documentElement;
        const offenders = [...document.body.querySelectorAll('*')].filter(el => el.scrollWidth > el.clientWidth + 2 && el.clientWidth > 0 && el.scrollWidth > root.clientWidth).slice(0, 6).map(el => (el.id || el.className || el.tagName).toString().slice(0, 80));
        return { clientWidth: root.clientWidth, scrollWidth: root.scrollWidth, overflow: root.scrollWidth > root.clientWidth + 1, offenders };
      })()`);
    }
    console.log('AC-07 viewport:', JSON.stringify(overflow));
    for (const width of [1280, 768, 390]) assert.equal(overflow[width].overflow, false, 'overflow at ' + width + ' ' + JSON.stringify(overflow[width]));
    console.log('AC-07 residual: screen-reader output and grayscale were not automated. Keyboard wrap/Escape and viewport overflow were checked in headless Chrome.');
    ws.close();
  } finally {
    chrome.kill('SIGKILL');
    await new Promise(resolve => setTimeout(resolve, 300));
    try { rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 }); }
    catch (error) { console.error('profile cleanup skipped:', error.message); }
  }
}

const uiDir = mkdtempSync(path.join(os.tmpdir(), 'rolecraft-task-ui-'));
try {
  await checkRegister();
  await withServer(uiDir, checkBrowser);
  console.log('Residual functional checks passed: register schema compatibility, task-state CTAs, drawer focus.');
} finally {
  rmSync(uiDir, { recursive: true, force: true });
}
