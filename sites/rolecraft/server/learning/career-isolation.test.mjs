import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const dist = path.join(root, 'dist');

function loadIsolation() {
  const sandbox = {};
  vm.runInNewContext(readFileSync(path.join(dist, 'career-isolation.js'), 'utf8'), sandbox);
  return sandbox.RolecraftCareerIsolation;
}

const iso = loadIsolation();
const previousAgent = {
  careerId: 'agent-developer',
  contentVersion: 'textbook-v13',
  textbookVersionId: 'agent-engineering-v13',
  corpusHash: 'a'.repeat(64)
};
const previousUiux = {
  careerId: 'uiux-product-designer',
  contentVersion: 'uiux-design-v02',
  textbookVersionId: 'uiux-design-v02',
  corpusHash: 'b'.repeat(64)
};

test('question bank follows the active profession and does not borrow the Agent pack', () => {
  assert.equal(iso.questionBankMode(''), 'agent');
  assert.equal(iso.questionBankMode('agent-developer'), 'agent');
  assert.equal(iso.questionBankMode('uiux-product-designer'), 'unavailable');
  assert.equal(iso.postSwitchHash(), '#learn');
});

test('switching profession clears the previous profession cache and keeps global settings', () => {
  const keys = [
    'rolecraft-local-career-v1',
    'rolecraft-v1',
    'rolecraft-career-conflict-dismissed-v1',
    'rolecraft-experience-v13',
    'rolecraft-reading-owned-v1:guest:' + encodeURIComponent('agent-developer|agent-engineering-v13|textbook-v13|' + previousAgent.corpusHash),
    'rolecraft-content-dialog-v14:owned:guest:' + encodeURIComponent('agent-developer|textbook-v13'),
    'rolecraft-career-task-v1:owned:guest:agent-developer',
    'rolecraft-career-content-ready-v1:agent-developer:textbook-v13',
    'rolecraft-reading-owned-v1:guest:' + encodeURIComponent('uiux-product-designer|uiux-design-v02'),
    'rolecraft-interview-v03'
  ];
  const cleared = iso.selectCacheKeysToClear(keys, previousAgent);
  assert.equal(cleared.includes('rolecraft-experience-v13'), true);
  assert.equal(cleared.includes('rolecraft-career-content-ready-v1:agent-developer:textbook-v13'), true);
  assert.equal(cleared.some(key => key.includes('agent-developer')), true);
  assert.equal(cleared.includes('rolecraft-local-career-v1'), false);
  assert.equal(cleared.includes('rolecraft-v1'), false);
  assert.equal(cleared.includes('rolecraft-career-conflict-dismissed-v1'), false);
  assert.equal(cleared.some(key => key.includes('uiux-product-designer')), false);
  assert.equal(cleared.includes('rolecraft-interview-v03'), false);
  const fromUiux = iso.selectCacheKeysToClear(keys, previousUiux);
  assert.equal(fromUiux.some(key => key.includes('uiux-product-designer')), true);
  assert.equal(fromUiux.some(key => key.includes('rolecraft-career-task-v1:owned:guest:agent-developer')), false);
});

test('client wiring isolates 题库, clears cache, and opens 课程学习 without a login wall', () => {
  const experience = readFileSync(path.join(dist, 'learning-experience-v13.js'), 'utf8');
  const auth = readFileSync(path.join(dist, 'auth-career-v15.js'), 'utf8');
  const app = readFileSync(path.join(dist, 'app.js'), 'utf8');
  const html = readFileSync(path.join(dist, 'index.html'), 'utf8');
  assert.match(experience, /questionBankMode\(\)==='unavailable'/);
  assert.match(experience, /data-question-bank="unavailable"/);
  assert.match(experience, /这里不会显示其他职业的题目/);
  assert.match(experience, /if\(view==='questions'\)return questionPage\(\)/);
  assert.match(auth, /function finishCareerSwitch/);
  assert.match(auth, /clearPreviousCareerCache\(previous\)/);
  assert.match(auth, /location\.reload\(\)/);
  const switchFn = auth.slice(auth.indexOf('async function switchToCareer'), auth.indexOf('function storageKeys') > -1 ? auth.indexOf('async function chooseLocalCareer') : auth.length);
  assert.match(switchFn, /if \(state\.me\?\.user\) \{\s*stored = await confirmAccountCareer\(career\);/);
  assert.equal(switchFn.includes('请先登录'), false);
  assert.match(switchFn, /finishCareerSwitch\(previousCareer\)/);
  assert.match(app, /data-interview-bank="unavailable"/);
  assert.match(html, /career-isolation\.js/);
  const isolationAt = html.indexOf('career-isolation.js');
  const authAt = html.indexOf('auth-career-v15.js');
  const experienceAt = html.indexOf('learning-experience-v13.js');
  assert.equal(isolationAt > 0 && isolationAt < authAt && isolationAt < experienceAt, true);
});
