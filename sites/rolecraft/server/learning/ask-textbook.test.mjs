import assert from 'node:assert/strict';
import test from 'node:test';
import { composeAskTextbookResponse, assessSynthesisGate, ASK_TEXTBOOK_FAILURE_MESSAGE, ASK_TEXTBOOK_INSUFFICIENT_MESSAGE, ASK_TEXTBOOK_OUT_OF_SCOPE_MESSAGE } from './ask-textbook.mjs';
import { getAskTextbookReadiness, loadAskTextbookConfig } from './model-provider.mjs';

const env = {
  OPENAI_API_KEY: 'test-key-not-a-secret',
  OPENAI_BASE_URL: 'https://www.9898.ai/v1',
  ASK_TEXTBOOK_MODEL: 'claude-sonnet-5-5',
  ASK_TEXTBOOK_FALLBACK_MODEL: 'deepseek-v4-flash',
  ASK_TEXTBOOK_TIMEOUT_MS: '40000',
  ASK_TEXTBOOK_MAX_OUTPUT_TOKENS: '1200',
  OPENAI_MODEL: 'gpt-should-stay-unused',
  GENERATE_MODEL: 'generate-should-stay-unused',
};

function responseFor(text, status = 200) {
  return new Response(JSON.stringify({
    status: 'completed',
    output: [{ type: 'message', content: [{ type: 'output_text', text }] }],
  }), { status, headers: { 'content-type': 'application/json' } });
}

function answeredRetrieval({ quote, title = '教材原文', related = 0.74, unrelated = 0.2 } = {}) {
  return {
    status: 'recommended',
    providerCalled: false,
    results: [{ unitId: 'n03', sectionId: 's1', sectionTitle: title, evidenceExcerpt: quote, title }],
    limitations: ['回答为教材原文提取，不是生成式模型辅导'],
    dialog: {
      status: 'answered',
      answerMode: 'extractive',
      message: '以下是教材中的简要回答。',
      sentences: [{ text: quote, citationIds: ['c1'] }],
      citations: [{ id: 'c1', quote, sectionTitle: title, unitTitle: '规划与反思', href: '#learn/agent/n03/s1' }],
      scope: {
        relatedSegments: ['问题'],
        filteredSegments: [],
        contextUsed: null,
        classification: { segments: [{ decision: 'related', relatedSimilarity: related, unrelatedSimilarity: unrelated }] },
      },
      context: null,
    },
  };
}

test('ask textbook config ignores chapter-generation model names', () => {
  const config = loadAskTextbookConfig(env);
  assert.equal(config.model, 'claude-sonnet-5-5');
  assert.equal(config.fallbackModel, 'deepseek-v4-flash');
  assert.equal(config.baseUrl, 'https://www.9898.ai/v1');
  assert.equal(getAskTextbookReadiness(env).configured, true);
  assert.equal(getAskTextbookReadiness(env).missing.includes('OPENAI_MODEL'), false);
  assert.equal(getAskTextbookReadiness({ ...env, OPENAI_API_KEY: '' }).configured, false);
});

test('unrelated question skips the LLM', async () => {
  let calls = 0;
  const retrieval = { status: 'no_match', providerCalled: false, results: [], dialog: { status: 'unrelated', answerMode: 'extractive', message: '旧文案', sentences: [], citations: [], scope: { relatedSegments: [], filteredSegments: [], contextUsed: null }, context: null } };
  const result = await composeAskTextbookResponse({
    query: '红烧肉怎么做',
    retrieval,
    env,
    transport() { calls += 1; throw new Error('should not call'); },
  });
  assert.equal(calls, 0);
  assert.equal(result.providerCalled, false);
  assert.equal(result.dialog.status, 'unrelated');
  assert.equal(result.dialog.message, ASK_TEXTBOOK_OUT_OF_SCOPE_MESSAGE);
  assert.equal(result.dialog.answerMode, 'extractive');
});

test('empty retrieval skips the LLM', async () => {
  let calls = 0;
  const retrieval = answeredRetrieval({ quote: 'ReAct 将推理和行动交错进行。' });
  retrieval.results = [];
  retrieval.dialog.sentences = [];
  retrieval.dialog.citations = [];
  const result = await composeAskTextbookResponse({
    query: 'ReAct 是什么',
    retrieval,
    env,
    transport() { calls += 1; throw new Error('should not call'); },
  });
  assert.equal(calls, 0);
  assert.equal(result.providerCalled, false);
  assert.equal(assessSynthesisGate(retrieval, 'ReAct 是什么').reason, 'empty_retrieval');
});

for (const status of ['no_match', 'related_uncovered', 'needs_clarification', 'invalid_input', 'unavailable']) {
  test(`synthesis is not invoked for ${status}`, async () => {
    let calls = 0;
    const dialogStatus = status === 'no_match' ? 'related_uncovered' : status;
    const retrieval = {
      status: status === 'related_uncovered' ? 'no_match' : status,
      providerCalled: false,
      results: status === 'needs_clarification' ? [{ evidenceExcerpt: '不应使用' }] : [],
      dialog: { status: dialogStatus, answerMode: 'extractive', message: '请补充', sentences: [], citations: [], scope: { relatedSegments: [], filteredSegments: [], contextUsed: null }, context: null },
    };
    const result = await composeAskTextbookResponse({
      query: 'Agent 是什么',
      retrieval,
      env,
      transport() { calls += 1; throw new Error('should not call'); },
    });
    assert.equal(calls, 0);
    assert.equal(result.providerCalled, false);
    assert.notEqual(result.dialog.answerMode, 'synthesized');
  });
}

test('weak architecture hit is not treated as in-scope', async () => {
  let calls = 0;
  const quote = '迁移：未知路径时，宿主程序不能把模型猜测当成已发生的事实。';
  const retrieval = answeredRetrieval({ quote, title: '迁移：未知路径', related: 0.7, unrelated: 0.28 });
  const gate = assessSynthesisGate(retrieval, '系统架构是什么');
  assert.equal(gate.pass, false);
  assert.equal(gate.reason, 'intent_misaligned');
  const result = await composeAskTextbookResponse({
    query: '系统架构是什么',
    retrieval,
    env,
    transport() { calls += 1; throw new Error('should not call'); },
  });
  assert.equal(calls, 0);
  assert.equal(result.providerCalled, false);
  assert.equal(result.dialog.status, 'related_uncovered');
  assert.equal(result.results.length, 0);
  assert.equal(JSON.stringify(result).includes(quote), false);
});

test('successful synthesis uses only the retrieved excerpt', async () => {
  const quote = 'ReAct 将推理和行动交错进行，新的观察会改变下一步工具选择。';
  const retrieval = answeredRetrieval({ quote, title: '三种策略' });
  const calls = [];
  const result = await composeAskTextbookResponse({
    query: 'ReAct 推理和行动如何交错',
    retrieval,
    env,
    transport(url, options) {
      calls.push({ url, body: JSON.parse(options.body) });
      return responseFor(JSON.stringify({ sufficient: true, answer: '教材摘录说明，ReAct 会交错推理和行动，并按新的观察选择下一步工具。' }));
    },
  });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, 'https://www.9898.ai/v1/responses');
  assert.equal(calls[0].body.model, 'claude-sonnet-5-5');
  assert.equal(calls[0].body.model === env.OPENAI_MODEL, false);
  assert.match(calls[0].body.input[0].content, /不得使用摘录以外的知识/);
  assert.match(calls[0].body.input[1].content, new RegExp(quote.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.equal(result.providerCalled, true);
  assert.equal(result.dialog.answerMode, 'synthesized');
  assert.equal(result.dialog.synthesis.status, 'answered');
  assert.match(result.dialog.synthesis.answer, /交错推理和行动/);
  assert.notEqual(result.dialog.synthesis.answer, quote);
  assert.equal(result.dialog.citations[0].quote, quote);
});

test('insufficient excerpts do not become a fabricated answer', async () => {
  const quote = 'ReAct 将推理和行动交错进行，新的观察会改变下一步工具选择。';
  const result = await composeAskTextbookResponse({
    query: 'ReAct 推理和行动如何交错',
    retrieval: answeredRetrieval({ quote }),
    env,
    transport() { return responseFor(JSON.stringify({ sufficient: false, answer: '我用外部知识补充：ReAct 由 Yao 在 2022 年提出。' })); },
  });
  assert.equal(result.providerCalled, true);
  assert.equal(result.dialog.synthesis.status, 'insufficient');
  assert.equal(result.dialog.synthesis.answer, null);
  assert.equal(result.dialog.synthesis.message, ASK_TEXTBOOK_INSUFFICIENT_MESSAGE);
  assert.equal(JSON.stringify(result.dialog.synthesis).includes('Yao'), false);
});

test('double LLM failure returns a generation-failure message instead of raw snippets', async () => {
  const quote = 'ReAct 将推理和行动交错进行，新的观察会改变下一步工具选择。';
  const calls = [];
  const result = await composeAskTextbookResponse({
    query: 'ReAct 推理和行动如何交错',
    retrieval: answeredRetrieval({ quote }),
    env,
    transport(_url, options) {
      calls.push(JSON.parse(options.body).model);
      return responseFor('upstream failed', 503);
    },
  });
  assert.deepEqual(calls, ['claude-sonnet-5-5', 'deepseek-v4-flash']);
  assert.equal(result.providerCalled, true);
  assert.equal(result.dialog.synthesis.status, 'failed');
  assert.equal(result.dialog.synthesis.answer, null);
  assert.equal(result.dialog.synthesis.message, ASK_TEXTBOOK_FAILURE_MESSAGE);
  assert.notEqual(result.dialog.synthesis.message, quote);
  assert.equal(result.dialog.citations[0].quote, quote);
});
