import assert from 'node:assert/strict';
import test from 'node:test';
import { composeAskTextbookResponse, assessSynthesisGate, intentAligned, ASK_TEXTBOOK_FAILURE_MESSAGE, ASK_TEXTBOOK_INSUFFICIENT_MESSAGE, ASK_TEXTBOOK_OUT_OF_SCOPE_MESSAGE } from './ask-textbook.mjs';
import { getAskTextbookReadiness, loadAskTextbookConfig } from './model-provider.mjs';

const SYNTHESIS_INSTRUCTIONS = [
  '你是职造的教材问答。只能根据用户消息中的教材摘录组织回答。',
  '不得使用摘录以外的知识，不得补造机制、数字、命令、案例或出处。',
  '如果问题里的「这个系统」「该系统」或「系统的架构」是在教材学习语境下提问，就把摘录中描述的体系、控制路径或方案划分当作要说明的架构，依据摘录作答；不要因为摘录没有点名某个产品名称，就判定依据不足。',
  '只有当摘录里确实没有可用来说明该问题的结构、机制或定义时，才返回 {"sufficient":false}。',
  '如果摘录足够，返回 {"sufficient":true,"answer":"用自己的话连贯说明，每个论断都能在摘录中找到依据"}。',
  '不要把摘录原样堆砌成回答。只输出一个 JSON 对象。',
].join('');

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
    choices: [{ message: { role: 'assistant', content: text } }],
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

test('exercise excerpt for agent架构 stays misaligned', () => {
  const quote = '失败报告给出 service.py；读后发现它调用动态注册的处理器，实际处理器随配置变化。';
  const retrieval = answeredRetrieval({ quote, title: '迁移：未知路径', related: 0.7, unrelated: 0.28 });
  const gate = assessSynthesisGate(retrieval, 'agent架构');
  assert.equal(gate.pass, false);
  assert.equal(gate.reason, 'intent_misaligned');
});

test('selection definition excerpt for agent架构 is in scope', () => {
  const quote = '需要解释自由文本，不等于需要动态 Agent；需要多次模型调用，也不等于需要多 Agent。';
  const retrieval = answeredRetrieval({ quote, title: '为一个任务选择最小可用方案：程序、单次模型、流程与动态 Agent', related: 0.74, unrelated: 0.2 });
  const gate = assessSynthesisGate(retrieval, 'agent架构');
  assert.equal(gate.pass, true);
  assert.equal(gate.reason, 'in_scope');
});

test('这个系统的架构是什么样的 aligns when the excerpt contains 系统 and 架构', () => {
  const quote = '运行 Agent 的应用程序是一个软件系统。这与 Anthropic 的架构定义一致。';
  const retrieval = answeredRetrieval({ quote, title: '认识 Agent 工程', related: 0.6128, unrelated: 0.419 });
  assert.equal(intentAligned('这个系统的架构是什么样的', quote), true);
  const gate = assessSynthesisGate(retrieval, '这个系统的架构是什么样的');
  assert.equal(gate.pass, true);
  assert.equal(gate.reason, 'in_scope');
});

test('这个系统的架构是什么样的 aligns on natural 架构 or 系统架构 wording', () => {
  const quotes = [
    '这与 Anthropic 的架构定义一致；本文进一步采用宿主准入与事实记录的工程约束。',
    '模型配置不能把优势全部归于系统架构。控制权划分才是比较对象。',
  ];
  for (const quote of quotes) {
    const retrieval = answeredRetrieval({ quote, title: '认识 Agent 工程', related: 0.6128, unrelated: 0.419 });
    assert.equal(intentAligned('这个系统的架构是什么样的', quote), true, quote);
    const gate = assessSynthesisGate(retrieval, '这个系统的架构是什么样的');
    assert.equal(gate.pass, true, quote);
    assert.equal(gate.reason, 'in_scope');
  }
});

test('这个系统的架构是什么样的 stays misaligned without those content words', () => {
  const quote = '失败报告给出 service.py；读后发现它调用动态注册的处理器，实际处理器随配置变化。';
  const retrieval = answeredRetrieval({ quote, title: '迁移：未知路径', related: 0.6128, unrelated: 0.419 });
  assert.equal(intentAligned('这个系统的架构是什么样的', quote), false);
  const gate = assessSynthesisGate(retrieval, '这个系统的架构是什么样的');
  assert.equal(gate.pass, false);
  assert.equal(gate.reason, 'intent_misaligned');
});

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
  assert.equal(calls[0].url, 'https://www.9898.ai/v1/chat/completions');
  assert.equal(calls[0].body.model, 'claude-sonnet-5-5');
  assert.equal(calls[0].body.model === env.OPENAI_MODEL, false);
  assert.equal(calls[0].body.model === env.GENERATE_MODEL, false);
  assert.equal(Object.hasOwn(calls[0].body, 'store'), false);
  assert.equal(Object.hasOwn(calls[0].body, 'max_output_tokens'), false);
  assert.equal(calls[0].body.messages[0].content, SYNTHESIS_INSTRUCTIONS);
  assert.match(calls[0].body.messages[0].content, /不得使用摘录以外的知识/);
  assert.match(calls[0].body.messages[1].content, new RegExp(quote.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
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

test('synthesis user message sends the full retrieved excerpts from the architecture probe', async () => {
  const openingQuote = '需要解释自由文本，不等于需要动态 Agent；需要多次模型调用，也不等于需要多 Agent。';
  const openingExcerpt = '> **本章先给结论**\n>\n> 需要解释自由文本，不等于需要动态 Agent；需要多次模型调用，也不等于需要多 Agent。只有当**下一步必须依赖新的观察，而且预先列出的路径无法合理覆盖这些变化**时，动态决策才有独立价值。\n>\n> 先冻结任务、输入、权限和验收，再选择能完成同一目标的最小方案。方案越动态，探索能力越强，路径、权限、预算、恢复和验证成本也越高。';
  const imageExcerpt = '![候选视觉稿：c01 先冻结条件，再看谁控制下一步](assets/c01-selection-control-map-v03.svg)';
  const captionQuote = '四种方案从普通程序到动态 Agent，表达的是控制权逐步交给运行时；底部共同证据框表示所有方案都应在同一任务、权限、材料和验收条件下比较。';
  const definitionQuote = '这与 Anthropic 的架构定义一致；本文进一步采用宿主准入与事实记录的工程约束。';
  const definitionExcerpt = '“Agent”在不同产品中有不同用法。本书采用控制路径的区分：固定工作流由代码预列步骤与合法分支，动态 Agent 让模型根据新观察提议业务路径。这与 Anthropic 的架构定义一致；本文进一步采用宿主准入与事实记录的工程约束。这里仅以该文支持概念区分与最小足够方案原则。[Building effective agents](https://www.anthropic.com/engineering/building-effective-agents)';
  const items = [
    { title: '为一个任务选择最小可用方案：程序、单次模型、流程与动态 Agent', quote: openingQuote, evidenceExcerpt: openingExcerpt },
    { title: '先看一张图：谁决定下一步？', quote: captionQuote, evidenceExcerpt: imageExcerpt },
    { title: '认识 Agent 工程', quote: definitionQuote, evidenceExcerpt: definitionExcerpt },
  ];
  const retrieval = {
    status: 'recommended',
    providerCalled: false,
    results: items.map((item, index) => ({ unitId: 'c01', sectionId: `s${index + 1}`, sectionTitle: item.title, evidenceExcerpt: item.evidenceExcerpt, title: item.title })),
    limitations: ['回答为教材原文提取，不是生成式模型辅导'],
    dialog: {
      status: 'answered',
      answerMode: 'extractive',
      message: '以下是教材中的简要回答。',
      sentences: items.map((item, index) => ({ text: item.quote, citationIds: [`c${index + 1}`] })),
      citations: items.map((item, index) => ({ id: `c${index + 1}`, quote: item.quote, evidenceExcerpt: item.evidenceExcerpt, sectionTitle: item.title, unitTitle: '方案选择', href: `#learn/agent/c01/s${index + 1}` })),
      scope: {
        relatedSegments: ['问题'],
        filteredSegments: [],
        contextUsed: null,
        classification: { segments: [{ decision: 'related', relatedSimilarity: 0.74, unrelatedSimilarity: 0.2 }] },
      },
      context: null,
    },
  };
  const calls = [];
  const result = await composeAskTextbookResponse({
    query: '这个系统的架构是什么样的',
    retrieval,
    env,
    transport(url, options) {
      calls.push({ url, body: JSON.parse(options.body) });
      return responseFor(JSON.stringify({ sufficient: true, answer: '教材摘录把控制权划分写成固定工作流与动态 Agent 的区别，并要求先冻结任务再选最小方案。' }));
    },
  });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, 'https://www.9898.ai/v1/chat/completions');
  assert.equal(calls[0].body.messages[0].content, SYNTHESIS_INSTRUCTIONS);
  assert.match(calls[0].body.messages[0].content, /「这个系统」/);
  assert.match(calls[0].body.messages[0].content, /「系统的架构」/);
  assert.match(calls[0].body.messages[0].content, /不要因为摘录没有点名某个产品名称，就判定依据不足/);
  const content = calls[0].body.messages[1].content;
  assert.equal(content.startsWith('问题：这个系统的架构是什么样的\n\n教材摘录：\n'), true);
  const first = content.indexOf('[1] 为一个任务选择最小可用方案：程序、单次模型、流程与动态 Agent\n');
  const second = content.indexOf('[2] 先看一张图：谁决定下一步？\n');
  const third = content.indexOf('[3] 认识 Agent 工程\n');
  assert.equal(first >= 0 && first < second && second < third, true);
  assert.equal(content.includes(openingExcerpt), true);
  assert.equal(content.includes('动态决策才有独立价值'), true);
  assert.equal(content.includes('先冻结任务、输入、权限和验收'), true);
  assert.equal(content.split(openingQuote).length - 1, 1);
  assert.equal(content.includes(captionQuote), true);
  assert.equal(content.includes('c01-selection-control-map-v03.svg'), false);
  assert.equal(content.includes(definitionExcerpt), true);
  assert.equal(content.includes('本书采用控制路径的区分'), true);
  assert.equal(content.split(definitionQuote).length - 1, 1);
  assert.equal(result.dialog.answerMode, 'synthesized');
  assert.deepEqual(result.dialog.citations.map(item => item.quote), items.map(item => item.quote));
  assert.deepEqual(result.dialog.sentences.map(item => item.text), items.map(item => item.quote));
});

test('empty evidence falls back to the quote, and unique caption prose is kept', async () => {
  const excerpt = 'ReAct 将推理和行动交错进行，新的观察会改变下一步工具选择。停止条件写在同一窗口里。';
  const caption = '四种方案从普通程序到动态 Agent，表达的是控制权逐步交给运行时。';
  const quoteOnly = 'ReAct 将推理和行动交错进行，新的观察会改变下一步工具选择。';
  const retrieval = answeredRetrieval({ quote: excerpt, title: '三种策略' });
  retrieval.dialog.citations = [
    { id: 'c1', quote: caption, evidenceExcerpt: excerpt, sectionTitle: '三种策略', unitTitle: '规划与反思', href: '#learn/agent/n03/s1' },
    { id: 'c2', quote: quoteOnly, evidenceExcerpt: '   ', sectionTitle: '认识 Agent 工程', unitTitle: '认识 Agent 工程', href: '#learn/agent/n00/s1' },
    { id: 'c3', quote: quoteOnly, evidenceExcerpt: '![仅有图片](assets/diagram.svg)', sectionTitle: '图示', unitTitle: '认识 Agent 工程', href: '#learn/agent/n00/s2' },
  ];
  retrieval.dialog.sentences = [
    { text: caption, citationIds: ['c1'] },
    { text: quoteOnly, citationIds: ['c2'] },
    { text: quoteOnly, citationIds: ['c3'] },
  ];
  retrieval.results = retrieval.dialog.citations.map((citation, index) => ({
    unitId: 'n03',
    sectionId: `s${index + 1}`,
    sectionTitle: citation.sectionTitle,
    evidenceExcerpt: citation.evidenceExcerpt,
    title: citation.sectionTitle,
  }));
  const calls = [];
  const result = await composeAskTextbookResponse({
    query: 'ReAct 推理和行动如何交错',
    retrieval,
    env,
    transport(_url, options) {
      calls.push(JSON.parse(options.body).messages[1].content);
      return responseFor(JSON.stringify({ sufficient: true, answer: '教材摘录说明 ReAct 会按新的观察交错选择下一步。' }));
    },
  });
  assert.equal(calls.length, 1);
  const content = calls[0];
  assert.equal(content.includes(excerpt), true);
  assert.equal(content.includes(caption), true);
  assert.equal(content.indexOf(excerpt) < content.indexOf(caption), true);
  const emptyBlock = content.slice(content.indexOf('[2] 认识 Agent 工程\n'));
  assert.equal(emptyBlock.startsWith(`[2] 认识 Agent 工程\n${quoteOnly}`), true);
  assert.equal(content.includes('[3] 图示\n' + quoteOnly), true);
  assert.equal(content.includes('diagram.svg'), false);
  assert.equal(result.dialog.citations[0].quote, caption);
  assert.equal(result.dialog.citations[1].quote, quoteOnly);
});

test('fenced synthesis JSON is still parsed', async () => {
  const quote = 'ReAct 将推理和行动交错进行，新的观察会改变下一步工具选择。';
  const result = await composeAskTextbookResponse({
    query: 'ReAct 推理和行动如何交错',
    retrieval: answeredRetrieval({ quote }),
    env,
    transport() {
      return responseFor('```json\n{"sufficient":true,"answer":"教材摘录说明，ReAct 会交错推理和行动。"}\n```');
    },
  });
  assert.equal(result.dialog.synthesis.status, 'answered');
  assert.match(result.dialog.synthesis.answer, /交错推理和行动/);
});

test('double LLM failure returns a generation-failure message instead of raw snippets', async () => {
  const quote = 'ReAct 将推理和行动交错进行，新的观察会改变下一步工具选择。';
  const calls = [];
  const result = await composeAskTextbookResponse({
    query: 'ReAct 推理和行动如何交错',
    retrieval: answeredRetrieval({ quote }),
    env,
    transport(url, options) {
      calls.push({ model: JSON.parse(options.body).model, path: new URL(url).pathname });
      return responseFor('upstream failed', 503);
    },
  });
  assert.deepEqual(calls, [
    { model: 'claude-sonnet-5-5', path: '/v1/chat/completions' },
    { model: 'claude-sonnet-5-5', path: '/v1/responses' },
    { model: 'deepseek-v4-flash', path: '/v1/chat/completions' },
    { model: 'deepseek-v4-flash', path: '/v1/responses' },
  ]);
  assert.equal(result.providerCalled, true);
  assert.equal(result.dialog.synthesis.status, 'failed');
  assert.equal(result.dialog.synthesis.answer, null);
  assert.equal(result.dialog.synthesis.message, ASK_TEXTBOOK_FAILURE_MESSAGE);
  assert.notEqual(result.dialog.synthesis.message, quote);
  assert.equal(result.dialog.citations[0].quote, quote);
});
