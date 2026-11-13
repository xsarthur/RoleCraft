import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { createRolecraftServer } from '../index.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const dist = path.join(root, 'dist');
const nodeMajor = Number(process.versions.node.split('.')[0]);

function loadIsolation() {
  const sandbox = {};
  vm.runInNewContext(readFileSync(path.join(dist, 'career-isolation.js'), 'utf8'), sandbox);
  return sandbox.RolecraftCareerIsolation;
}

let server;
let base;

test.before(async () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'rc-smoke-'));
  const app = createRolecraftServer({ dataDir: dir });
  await new Promise(resolve => app.server.listen(0, '127.0.0.1', resolve));
  base = `http://127.0.0.1:${app.server.address().port}`;
  server = app;
});

test.after(async () => {
  if (server) await server.close();
});

async function get(pathname) {
  const response = await fetch(base + pathname, { headers: { host: new URL(base).host } });
  const text = await response.text();
  let body = null;
  try { body = JSON.parse(text); } catch { body = text; }
  return { status: response.status, body, text };
}

test('smoke: health keeps generation fields and reports 问教材 configuration', async () => {
  const { status, body } = await get('/api/health');
  assert.equal(status, 200);
  assert.equal(typeof body.generation?.configured, 'boolean');
  assert.equal(Array.isArray(body.askTextbook?.missing), true);
  assert.equal('apiKey' in (body.askTextbook || {}), false);
  assert.equal(typeof body.contentRetrieval?.available, 'boolean');
});

test('smoke: profession catalog and UI/UX course load without login', async () => {
  const careers = await get('/api/careers');
  assert.equal(careers.status, 200);
  assert.equal(careers.body.careers.some(item => item.careerId === 'agent-developer'), true);
  assert.equal(careers.body.careers.some(item => item.careerId === 'uiux-product-designer'), true);
  const uiux = await get('/api/careers/uiux-product-designer/content/catalog');
  assert.equal(uiux.status, 200);
  assert.match(uiux.body.career?.title || '', /UI\/UX/);
  assert.equal(Array.isArray(uiux.body.catalog?.units) && uiux.body.catalog.units.length > 0, true);
  assert.equal(JSON.stringify(uiux.body).includes('如何界定 LLM Agent'), false);
  const agent = await get('/api/careers/agent-developer/content/catalog');
  assert.equal(agent.status, 200);
  assert.equal(agent.body.catalog?.corpusVersion, 'textbook-v13');
});

test('smoke: question bank and interview copy stay profession-scoped', () => {
  const iso = loadIsolation();
  assert.equal(iso.questionBankMode('uiux-product-designer'), 'unavailable');
  assert.equal(iso.questionBankMode('agent-developer'), 'agent');
  const experience = readFileSync(path.join(dist, 'learning-experience-v13.js'), 'utf8');
  const app = readFileSync(path.join(dist, 'app.js'), 'utf8');
  assert.match(experience, /data-question-bank="unavailable"/);
  assert.match(app, /data-interview-bank="unavailable"/);
  assert.match(experience, /rolecraft-experience-v13/);
});

test('smoke: 课程学习 is the post-switch destination and previous cache is selected for removal', () => {
  const iso = loadIsolation();
  assert.equal(iso.postSwitchHash(), '#learn');
  const removed = iso.selectCacheKeysToClear([
    'rolecraft-experience-v13',
    'rolecraft-local-career-v1',
    'rolecraft-reading-owned-v1:guest:uiux-product-designer'
  ], { careerId: 'uiux-product-designer' });
  assert.deepEqual([...removed].map(String).sort(), ['rolecraft-experience-v13', 'rolecraft-reading-owned-v1:guest:uiux-product-designer']);
});

test('smoke: 题库 evaluation refuses unconfirmed text and personal-evidence verdicts', async () => {
  const unconfirmed = await fetch(base + '/api/practice/evaluate', {
    method: 'POST',
    headers: { host: new URL(base).host, 'content-type': 'application/json' },
    body: JSON.stringify({ question: '如何界定 LLM Agent？', answer: '观察会改变下一步。', confirmed: false, references: [{ title: '认识 Agent 工程', quote: 'Agent 围绕目标选择下一步。' }] })
  });
  const unconfirmedBody = await unconfirmed.json();
  assert.equal(unconfirmed.status, 200);
  assert.equal(unconfirmedBody.providerCalled, false);
  assert.equal(unconfirmedBody.status, 'unconfirmed');
  const personal = await fetch(base + '/api/practice/evaluate', {
    method: 'POST',
    headers: { host: new URL(base).host, 'content-type': 'application/json' },
    body: JSON.stringify({ question: '说一个你的项目。', answer: '我做过这个项目。', confirmed: true, personalEvidenceRequired: true, references: [{ title: '教材', quote: '教材只提供方法。' }] })
  });
  const personalBody = await personal.json();
  assert.equal(personal.status, 200);
  assert.equal(personalBody.providerCalled, false);
  assert.equal(personalBody.status, 'personal_evidence');
  assert.equal(personalBody.evaluation, null);
});

test('smoke: voice readiness is honest when whisper.cpp is not configured', async () => {
  const { status, body } = await get('/api/voice/readiness');
  assert.equal(status, 200);
  assert.equal(typeof body.voice?.available, 'boolean');
  assert.equal(body.voice?.providerCalled, false);
  if (body.voice?.available !== true) {
    assert.equal(body.voice.available, false);
  }
});

test('smoke: 问教材 live model and local ASR audio are environment-gated', { skip: false }, async () => {
  const health = await get('/api/health');
  const voice = await get('/api/voice/readiness');
  const blocked = [];
  if (health.body.askTextbook?.configured !== true) blocked.push('问教材 synthesis model is not configured in this environment');
  if (nodeMajor !== 24) blocked.push(`local semantic retrieval expects Node 24; this process is Node ${process.version}`);
  if (voice.body.voice?.available !== true) blocked.push('whisper.cpp is not installed or ROLECRAFT_LOCAL_ASR_MODEL is unset, so audio transcription cannot run');
  assert.equal(Array.isArray(blocked), true);
  if (blocked.length) console.log('SMOKE_BLOCKED ' + blocked.join(' | '));
});
