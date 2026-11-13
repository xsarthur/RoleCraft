import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../dist');
const experience = readFileSync(path.join(dist, 'learning-experience-v13.js'), 'utf8');
const workbench = readFileSync(path.join(dist, 'learning-workbench.js'), 'utf8');

test('question practice reuses voice readiness and transcribe, and does not grade unconfirmed text', () => {
  assert.match(experience, /\/api\/voice\/readiness/);
  assert.match(experience, /\/api\/voice\/transcribe/);
  assert.match(experience, /data-v13-voice="start"/);
  assert.match(experience, /data-v13-voice="confirm"/);
  assert.match(experience, /我的回答（可默答后直接核对）/);
  assert.match(experience, /未确认的转写不会送去评价/);
  assert.match(experience, /空转写不会送去评价/);
  assert.match(experience, /practiceVoice\.phase==='preview'/);
  assert.match(experience, /\/api\/practice\/evaluate/);
  assert.equal(experience.includes('audioBase64') && experience.includes("fetch('/api/practice/evaluate'"), true);
  const evaluate = experience.slice(experience.indexOf('async function requestPracticeEvaluation'), experience.indexOf('function questionCard'));
  assert.equal(evaluate.includes('audioBase64'), false);
  assert.match(evaluate, /references:/);
  assert.match(evaluate, /reviewedAnswer:reviewedPracticeAnswer/);
  assert.match(experience, /personalEvidenceRequired/);
  assert.match(experience, /答对不会自动把题目标为已掌握/);
  assert.match(experience, /不会编造转写/);
  assert.match(experience, /浏览器或系统可能把语音交给外部服务/);
});

test('问教材 shows synthesis separately from raw excerpts when generation fails', () => {
  assert.match(workbench, /answerMode === 'synthesized'/);
  assert.match(workbench, /这次没能生成回答/);
  assert.match(workbench, /现有教材摘录不足以回答/);
  assert.match(workbench, /showQuote \? '<details>/);
  assert.match(workbench, /这个问题不在本教材范围内/);
  assert.match(workbench, /这里只回答与当前教材相关的学习问题。请换一个学习或项目问题。/);
});
