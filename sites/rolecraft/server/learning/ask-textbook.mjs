/**
 * 问教材: local retrieval gate, then excerpt-only synthesis.
 * Relatedness is decided here from the existing dialog classification and
 * excerpt alignment. The synthesis model is never asked to decide scope.
 */

import { completeWithFallback, streamWithFallback, getAskTextbookReadiness } from './model-provider.mjs';
import { createSynthesisStreamParser, parseSynthesisText } from './synthesis-stream.mjs';

export const ASK_TEXTBOOK_FAILURE_MESSAGE = '这次没能根据教材摘录生成回答。请稍后重试。出处仍可打开，但那些原文不是生成的回答。';
export const ASK_TEXTBOOK_INSUFFICIENT_MESSAGE = '现有教材摘录不足以回答这个问题。';
export const ASK_TEXTBOOK_OUT_OF_SCOPE_MESSAGE = '这里只回答与当前教材相关的学习问题。请换一个学习或项目问题。';
export const ASK_TEXTBOOK_OUT_OF_SCOPE_TITLE = '这个问题不在本教材范围内';

const BLOCKING = new Set(['unrelated', 'related_uncovered', 'needs_clarification', 'invalid_input', 'unavailable', 'no_match']);
// Interrogative and function words are removed before keyword extraction.
// Longer phrases come first so “是什么样” is not left behind as “是什么”.
const CJK_FUNCTION_PHRASES = ['是什么样的', '是什么样', '什么样的', '什么样', '为什么', '是什么', '什么是', '怎么', '如何', '怎样', '是否', '哪些', '哪个', '什么', '这个', '那个', '我们', '你们', '请你', '请问', '可以', '一下', '一个', '没有', '不是', '以及', '还是', '进行', '关于', '学习', '教材', '问题'];
const CJK_SPLIT = /[的了是在和与及或把被对从为而也就都很吗呢吧啊着过得地\u0000]+/u;

function cjkContentTerms(question) {
  let text = String(question || '').replace(/[^\u4e00-\u9fff]/g, '');
  for (const phrase of CJK_FUNCTION_PHRASES) text = text.split(phrase).join('\u0000');
  return [...new Set(text.split(CJK_SPLIT).map(part => part.trim()).filter(part => part.length >= 2))];
}

export function intentAligned(query, excerpt, { contextUsed = false, focusTerm = '' } = {}) {
  const question = String(query || '').normalize('NFKC').toLowerCase();
  const hay = String(excerpt || '').normalize('NFKC').toLowerCase();
  const focus = String(focusTerm || '').normalize('NFKC').toLowerCase();
  if (contextUsed && focus && hay.includes(focus)) return true;
  const latin = [...new Set((question.match(/[a-z][a-z0-9_+-]{1,}/g) || []))];
  const terms = cjkContentTerms(question);
  const latinHits = latin.filter(token => hay.includes(token));
  const termHits = terms.filter(term => hay.includes(term));
  const latinOk = latin.length > 0 && latinHits.length >= 1 && latinHits.length / latin.length >= 0.5;
  // At least half of the content words must occur. One of 「系统」「架构」 is
  // enough, so a sentence that says 架构 is not rejected for missing 个系/是什.
  const termOk = terms.length > 0 && termHits.length >= 1 && termHits.length * 2 >= terms.length;
  if (latin.length && terms.length) return latinOk || termOk;
  if (latin.length) return latinOk;
  if (terms.length) return termOk;
  return false;
}

function excerptText(retrieval) {
  const dialog = retrieval?.dialog || {};
  const parts = [];
  for (const sentence of dialog.sentences || []) if (sentence?.text) parts.push(sentence.text);
  for (const citation of dialog.citations || []) parts.push([citation?.quote, citation?.sectionTitle, citation?.unitTitle, citation?.title].filter(Boolean).join('\n'));
  for (const result of retrieval?.results || []) parts.push([result?.evidenceExcerpt, result?.sectionTitle, result?.unitTitle, result?.title].filter(Boolean).join('\n'));
  return parts.join('\n');
}

function classificationOk(dialog) {
  const segments = Array.isArray(dialog?.scope?.classification?.segments) ? dialog.scope.classification.segments : null;
  if (!segments || !segments.length) return false;
  const related = segments.filter(segment => segment?.decision === 'related');
  if (!related.length) return false;
  const best = Math.max(...related.map(segment => Number(segment.relatedSimilarity) || 0));
  const margin = Math.max(...related.map(segment => (Number(segment.relatedSimilarity) || 0) - (Number(segment.unrelatedSimilarity) || 0)));
  const contextUsed = Boolean(dialog?.scope?.contextUsed);
  if (contextUsed && best >= 0.43 && margin >= 0.02) return true;
  return best >= 0.53 && margin >= 0.025;
}

export function assessSynthesisGate(retrieval, query) {
  const dialog = retrieval?.dialog || null;
  const dialogStatus = dialog?.status || '';
  const topStatus = retrieval?.status || '';
  if (BLOCKING.has(dialogStatus)) return { pass: false, reason: dialogStatus };
  if (BLOCKING.has(topStatus)) return { pass: false, reason: topStatus };
  const results = Array.isArray(retrieval?.results) ? retrieval.results : [];
  const sentences = Array.isArray(dialog?.sentences) ? dialog.sentences : [];
  const citations = Array.isArray(dialog?.citations) ? dialog.citations : [];
  if (!results.length || !sentences.length || !citations.length) return { pass: false, reason: 'empty_retrieval' };
  const answered = dialogStatus === 'answered' && (topStatus === 'recommended' || topStatus === 'answered');
  if (!answered) return { pass: false, reason: 'not_answered' };
  if (!classificationOk(dialog)) return { pass: false, reason: 'weak_relevance' };
  const aligned = intentAligned(query, excerptText(retrieval), {
    contextUsed: Boolean(dialog?.scope?.contextUsed),
    focusTerm: dialog?.scope?.contextUsed?.focusTerm || dialog?.context?.focusTerm || '',
  });
  if (!aligned) return { pass: false, reason: 'intent_misaligned' };
  return { pass: true, reason: 'in_scope' };
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function scopeNote(retrieval, providerCalled) {
  const limits = Array.isArray(retrieval?.limitations) ? retrieval.limitations : [];
  const kept = limits.filter(item => typeof item === 'string' && !/未调用外部模型|不是生成式模型辅导/.test(item));
  const note = providerCalled
    ? '回答只依据本次检索到的教材摘录组织，不使用摘录以外的知识，也不写入学习记录。'
    : '结果来自当前已核验教材原文；这次没有调用外部模型，不自动写入学习记录。';
  return [...kept, note];
}

function uncovered(retrieval, reason, env) {
  const next = clone(retrieval || {});
  next.status = 'no_match';
  next.results = [];
  next.providerCalled = false;
  next.dialog = {
    ...(next.dialog || {}),
    status: 'related_uncovered',
    answerMode: 'extractive',
    sentences: [],
    citations: [],
    context: null,
    message: '问题属于职业知识，但当前教材中尚未找到足够依据。',
    scope: next.dialog?.scope || { relatedSegments: [], filteredSegments: [], contextUsed: null },
  };
  next.limitations = scopeNote(next, false);
  next.askTextbook = { configured: getAskTextbookReadiness(env).configured, invoked: false, reason };
  return next;
}

function untouched(retrieval, reason, env, message) {
  const next = clone(retrieval || {});
  next.providerCalled = false;
  if (next.dialog && message) next.dialog.message = message;
  if (next.dialog && !next.dialog.answerMode) next.dialog.answerMode = 'extractive';
  next.limitations = scopeNote(next, false);
  next.askTextbook = { configured: getAskTextbookReadiness(env).configured, invoked: false, reason };
  return next;
}

const SYNTHESIS_INSTRUCTIONS = [
  '你是职造的教材问答。只能根据用户消息中的教材摘录组织回答。',
  '不得使用摘录以外的知识，不得补造机制、数字、命令、案例或出处。',
  '如果问题里的「这个系统」「该系统」或「系统的架构」是在教材学习语境下提问，就把摘录中描述的体系、控制路径或方案划分当作要说明的架构，依据摘录作答；不要因为摘录没有点名某个产品名称，就判定依据不足。',
  '先单独输出一行 sufficient: true 或 sufficient: false。',
  '只有当摘录里确实没有可用来说明该问题的结构、机制或定义时，才输出 sufficient: false，并且不要输出回答正文。',
  '如果摘录足够，第一行必须是 sufficient: true，换行后再用自己的话连贯说明，每个论断都能在摘录中找到依据。',
  '不要把摘录原样堆砌成回答。不要输出 JSON，不要加标题或代码围栏。',
].join('');

function proseWithoutImages(text) {
  return String(text || '').replace(/!\[[^\]]*\]\([^)]*\)/g, '').replace(/\s+/g, '');
}

// The retrieved window is already bounded. Synthesis has no input-size limit
// (output is capped by ASK_TEXTBOOK_MAX_OUTPUT_TOKENS), so this does not trim it.
function usableExcerpt(text) {
  if (typeof text !== 'string') return '';
  const raw = text.trim();
  if (!raw || !proseWithoutImages(raw)) return '';
  return raw;
}

function snippetBlock(retrieval) {
  const citations = retrieval?.dialog?.citations || [];
  return citations.map((citation, index) => {
    const title = citation.sectionTitle || citation.title || citation.unitTitle || '教材';
    const excerpt = usableExcerpt(citation.evidenceExcerpt);
    const quote = String(citation.quote || '').trim();
    const quoteProse = proseWithoutImages(quote);
    const extra = excerpt && quoteProse && !proseWithoutImages(excerpt).includes(quoteProse) ? quote : '';
    const body = excerpt ? (extra ? `${excerpt}\n${extra}` : excerpt) : quote;
    return `[${index + 1}] ${title}\n${body}`;
  }).filter(Boolean).join('\n\n');
}

function parseSynthesis(text) {
  return parseSynthesisText(text);
}

function withSynthesis(retrieval, synthesis, providerCalled) {
  const next = clone(retrieval);
  next.providerCalled = providerCalled === true;
  next.dialog = next.dialog || {};
  next.dialog.answerMode = 'synthesized';
  next.dialog.status = 'answered';
  next.status = 'recommended';
  next.dialog.synthesis = synthesis;
  next.limitations = scopeNote(next, providerCalled === true);
  next.askTextbook = { configured: true, invoked: providerCalled === true, reason: synthesis.status };
  return next;
}

async function completeSynthesis({ query, retrieval, env, transport, signal, onAnswerDelta }) {
  const snippets = snippetBlock(retrieval);
  const userContent = `问题：${String(query || '').trim()}\n\n教材摘录：\n${snippets}`;
  if (!onAnswerDelta) {
    const completion = await completeWithFallback({ instructions: SYNTHESIS_INSTRUCTIONS, userContent, env, transport, signal });
    return { ...completion, parsed: completion.ok ? parseSynthesis(completion.text) : null };
  }
  const parser = createSynthesisStreamParser();
  let committed = false;
  const completion = await streamWithFallback({
    instructions: SYNTHESIS_INSTRUCTIONS,
    userContent,
    env,
    transport,
    signal,
    onAttempt() { if (!committed) parser.reset(); },
    isCommitted: () => committed,
    onDelta(chunk) {
      const delta = parser.push(chunk);
      if (!delta) return;
      committed = true;
      onAnswerDelta(delta);
    },
  });
  const parsed = parser.finish();
  if (committed && parsed?.sufficient && parsed.answer) return { ...completion, ok: true, parsed };
  return { ...completion, parsed: completion.ok ? parsed : null, committed };
}

export async function composeAskTextbookResponse({ query, retrieval, env = process.env, transport, signal, onAnswerDelta } = {}) {
  const gate = assessSynthesisGate(retrieval, query);
  if (!gate.pass) {
    if (gate.reason === 'unrelated') return untouched(retrieval, 'unrelated', env, ASK_TEXTBOOK_OUT_OF_SCOPE_MESSAGE);
    if (gate.reason === 'needs_clarification' || gate.reason === 'invalid_input' || gate.reason === 'unavailable') return untouched(retrieval, gate.reason, env);
    return uncovered(retrieval, gate.reason, env);
  }
  const readiness = getAskTextbookReadiness(env);
  if (!readiness.configured) return untouched(retrieval, 'not_configured', env);
  const completion = await completeSynthesis({ query, retrieval, env, transport, signal, onAnswerDelta });
  if (!completion.providerCalled) return untouched(retrieval, 'not_configured', env);
  if (!completion.ok) {
    return withSynthesis(retrieval, {
      status: 'failed',
      providerCalled: true,
      answer: null,
      message: ASK_TEXTBOOK_FAILURE_MESSAGE,
      model: null,
      fallbackUsed: false,
    }, true);
  }
  const parsed = completion.parsed;
  if (!parsed) {
    return withSynthesis(retrieval, {
      status: 'failed',
      providerCalled: true,
      answer: null,
      message: ASK_TEXTBOOK_FAILURE_MESSAGE,
      model: completion.model,
      fallbackUsed: completion.fallbackUsed === true,
    }, true);
  }
  if (!parsed.sufficient) {
    return withSynthesis(retrieval, {
      status: 'insufficient',
      providerCalled: true,
      answer: null,
      message: ASK_TEXTBOOK_INSUFFICIENT_MESSAGE,
      model: completion.model,
      fallbackUsed: completion.fallbackUsed === true,
    }, true);
  }
  return withSynthesis(retrieval, {
    status: 'answered',
    providerCalled: true,
    answer: parsed.answer,
    message: '',
    model: completion.model,
    fallbackUsed: completion.fallbackUsed === true,
  }, true);
}
