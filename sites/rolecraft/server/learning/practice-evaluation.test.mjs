import assert from 'node:assert/strict';
import test from 'node:test';
import { evaluatePracticeAnswer, PRACTICE_EVAL_FAILURE_MESSAGE, PRACTICE_EVAL_PERSONAL_MESSAGE, PRACTICE_EVAL_EMPTY_MESSAGE, PRACTICE_EVAL_UNCONFIRMED_MESSAGE } from './practice-evaluation.mjs';

const env = {
  OPENAI_API_KEY: 'test-key-not-a-secret',
  OPENAI_BASE_URL: 'https://www.9898.ai/v1',
  ASK_TEXTBOOK_MODEL: 'claude-sonnet-5-5',
  ASK_TEXTBOOK_FALLBACK_MODEL: 'deepseek-v4-flash',
  ASK_TEXTBOOK_TIMEOUT_MS: '40000',
  ASK_TEXTBOOK_MAX_OUTPUT_TOKENS: '800',
};

const reference = {
  question: '如何界定 LLM Agent？',
  references: [{ title: '认识 Agent 工程', quote: 'Agent 围绕目标，依据新观察选择下一步，并通过工具与环境交互。' }],
  reviewedAnswer: '界定要看控制权是否随观察改变下一步，而不是只看对话界面。',
};

function responseFor(text, status = 200) {
  return new Response(JSON.stringify({
    status: 'completed',
    output_text: text,
  }), { status, headers: { 'content-type': 'application/json' } });
}

test('evaluation is not called before confirm or for an empty transcript', async () => {
  let calls = 0;
  const transport = () => { calls += 1; throw new Error('should not call'); };
  const unconfirmed = await evaluatePracticeAnswer({ ...reference, answer: '我认为 Agent 会自己改下一步。', confirmed: false }, { env, transport });
  const empty = await evaluatePracticeAnswer({ ...reference, answer: '   ', confirmed: true }, { env, transport });
  assert.equal(calls, 0);
  assert.equal(unconfirmed.providerCalled, false);
  assert.equal(unconfirmed.status, 'unconfirmed');
  assert.equal(unconfirmed.message, PRACTICE_EVAL_UNCONFIRMED_MESSAGE);
  assert.equal(empty.status, 'empty');
  assert.equal(empty.message, PRACTICE_EVAL_EMPTY_MESSAGE);
  assert.equal(empty.evaluation, null);
});

test('evaluation payload includes the user answer and reference materials', async () => {
  const calls = [];
  const result = await evaluatePracticeAnswer({
    ...reference,
    questionId: 'Q1',
    answer: 'Agent 会根据新的观察决定下一步，而不是把步骤全部写死。',
    confirmed: true,
    personalEvidenceRequired: false,
    answerKind: 'textbook_evidence',
  }, {
    env,
    transport(_url, options) {
      calls.push(JSON.parse(options.body));
      return responseFor(JSON.stringify({
        verdict: '部分准确',
        covered: ['下一步会随观察改变'],
        missed: ['工具与环境交互'],
        deviations: [],
        rationale: '回答抓住了观察驱动下一步，但没有说明工具交互。这不是按措辞重合打分。',
      }));
    },
  });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].model, 'claude-sonnet-5-5');
  assert.match(calls[0].input[0].content, /不得因为措辞/);
  assert.match(calls[0].input[1].content, /Agent 会根据新的观察决定下一步/);
  assert.match(calls[0].input[1].content, /并通过工具与环境交互/);
  assert.match(calls[0].input[1].content, /已审阅的参考解析/);
  assert.equal(result.providerCalled, true);
  assert.equal(result.evaluation.verdict, '部分准确');
  assert.match(result.label, /不是认证/);
});

test('audio is not accepted on the evaluation path', async () => {
  let calls = 0;
  const result = await evaluatePracticeAnswer({ ...reference, answer: '一段回答', confirmed: true, audioBase64: 'AAAA' }, { env, transport() { calls += 1; } });
  assert.equal(calls, 0);
  assert.equal(result.providerCalled, false);
  assert.equal(result.status, 'invalid_input');
});

test('double model failure surfaces an evaluation-failure message', async () => {
  const calls = [];
  const result = await evaluatePracticeAnswer({
    ...reference,
    answer: 'Agent 会根据观察选择下一步。',
    confirmed: true,
  }, {
    env,
    transport(_url, options) {
      calls.push(JSON.parse(options.body).model);
      return responseFor('nope', 500);
    },
  });
  assert.deepEqual(calls, ['claude-sonnet-5-5', 'deepseek-v4-flash']);
  assert.equal(result.providerCalled, true);
  assert.equal(result.status, 'failed');
  assert.equal(result.evaluation, null);
  assert.equal(result.message, PRACTICE_EVAL_FAILURE_MESSAGE);
  assert.equal(JSON.stringify(result).includes('准确'), false);
});

test('personal-evidence questions are not binary-auto-graded', async () => {
  let calls = 0;
  const byFlag = await evaluatePracticeAnswer({
    ...reference,
    answer: '我在自己的项目里做过重试。',
    confirmed: true,
    personalEvidenceRequired: true,
  }, { env, transport() { calls += 1; throw new Error('should not call'); } });
  const byKind = await evaluatePracticeAnswer({
    ...reference,
    answer: '我在自己的项目里做过重试。',
    confirmed: true,
    answerKind: 'personal_evidence_required',
  }, { env, transport() { calls += 1; throw new Error('should not call'); } });
  assert.equal(calls, 0);
  for (const result of [byFlag, byKind]) {
    assert.equal(result.providerCalled, false);
    assert.equal(result.status, 'personal_evidence');
    assert.equal(result.evaluation, null);
    assert.equal(result.message, PRACTICE_EVAL_PERSONAL_MESSAGE);
    assert.equal(JSON.stringify(result).includes('准确'), false);
    assert.equal(JSON.stringify(result).includes('不准确'), false);
  }
});
