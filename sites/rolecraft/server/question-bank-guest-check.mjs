// Guest-path regression for the frozen Agent question package.
// Loads the same browser scripts the local page uses. No network, database, or model.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const dist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../dist');
const storage = new Map();
const sandbox = {
  URLSearchParams,
  console,
  location: { hash: '#questions', href: 'http://127.0.0.1/index.html#questions' },
  localStorage: {
    getItem: key => storage.has(key) ? storage.get(key) : null,
    setItem: (key, value) => storage.set(key, String(value)),
  },
  document: {
    addEventListener() {},
    getElementById: () => null,
    body: { classList: { add() {} }, dataset: {} },
    documentElement: { style: { setProperty() {} } },
    querySelector: () => null,
    querySelectorAll: () => [],
  },
};
vm.createContext(sandbox);
for (const file of ['content-v13-data.js', 'learning-v13-data.js', 'learning-experience-v13.js']) {
  vm.runInContext(readFileSync(path.join(dist, file), 'utf8'), sandbox, { filename: file });
}

const api = sandbox.LearningExperienceV13;
const originalPackage = sandbox.RolecraftLearningV13;
assert.ok(api?.data(), 'frozen question package binds on the guest path');
assert.equal(api.data().questions.length, 114);
assert.equal(api.dataFailure(), null);

const bank = api.page('questions');
assert.match(bank, /当前 114 题/);
assert.match(bank, /Q1 ·/);
assert.doesNotMatch(bank, /资料暂不可用|题库包没有加载|版本或数量不一致/);

const check = api.page('check');
assert.equal(api.eligibleSource(), 'frozen');
assert.ok(api.eligibleQuestions().length >= 100, 'guest self-check uses the frozen set');
assert.match(check, /冻结题库/);
assert.match(check, /data-v13-start-check/);
assert.doesNotMatch(check, /目前可用 0 题|先打开一个知识点学习/);
assert.ok(!api.eligibleQuestions().some(q => ['Q10', 'Q99'].includes(q.questionId || q.id)), 'personal-evidence questions stay out of self-check');

const visitedPoint = originalPackage.knowledgePoints.find(point => point.kind !== 'navigation' && point.questionIds?.length);
sandbox.LearningWorkbench = {
  readingRecords: () => ({ visits: [{ unitId: visitedPoint.unitId, sectionId: visitedPoint.sectionId, at: '2026-10-22T00:00:00.000Z' }] }),
  recordIsCurrent: () => true,
};
assert.equal(api.eligibleSource(), 'visited');
const visitedIds = new Set(visitedPoint.questionIds);
assert.ok(api.eligibleQuestions().every(q => visitedIds.has(q.questionId || q.id)));
assert.match(api.page('check'), /已访问知识点/);
delete sandbox.LearningWorkbench;

sandbox.RolecraftLearningV13 = null;
assert.match(api.page('questions'), /题库包没有加载/);
assert.equal(api.dataFailure()?.code, 'missing_package');
assert.doesNotMatch(api.page('check'), /data-v13-start-check/);

sandbox.RolecraftLearningV13 = originalPackage;
assert.equal(api.data()?.questions.length, 114);
assert.equal(api.dataFailure(), null);
sandbox.RolecraftLearningV13 = { ...originalPackage, corpusHash: '0'.repeat(64) };
assert.match(api.page('questions'), /版本或数量不一致/);
assert.equal(api.dataFailure()?.code, 'identity_mismatch');
assert.doesNotMatch(api.page('check'), /data-v13-start-check|目前可用 0 题/);

console.log('Question bank guest check passed: 114 bound questions, frozen self-check, missing and mismatch are distinct.');
