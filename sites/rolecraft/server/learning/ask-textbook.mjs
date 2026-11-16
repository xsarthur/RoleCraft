/**
 * 问教材: local retrieval gate, then excerpt-only synthesis.
 * Relatedness is decided here from the existing dialog classification and
 * excerpt alignment. The synthesis model is never asked to decide scope.
 */

import { completeWithFallback, getAskTextbookReadiness } from './model-provider.mjs';

export const ASK_TEXTBOOK_FAILURE_MESSAGE = '这次没能根据教材摘录生成回答。请稍后重试。出处仍可打开，但那些原文不是生成的回答。';
export const ASK_TEXTBOOK_INSUFFICIENT_MESSAGE = '现有教材摘录不足以回答这个问题。';
export const ASK_TEXTBOOK_OUT_OF_SCOPE_MESSAGE = '这里只回答与当前教材相关的学习问题。请换一个学习或项目问题。';
export const ASK_TEXTBOOK_OUT_OF_SCOPE_TITLE = '这个问题不在本教材范围内';

const BLOCKING = new Set(['unrelated', 'related_uncovered', 'needs_clarification', 'invalid_input', 'unavailable', 'no_match']);
const STOP_GRAMS = new Set(['什么', '怎么', '如何', '为什么', '怎样', '是否', '哪些', '哪个', '一下', '可以', '这个', '那个', '我们', '你们', '请你', '请问', '学习', '教材', '问题', '一个', '没有', '不是', '以及', '还是', '进行', '关于']);

export function intentAligned(query, excerpt, { contextUsed = false, focusTerm = '' } = {}) {
  const question = String(query || '').normalize('NFKC').toLowerCase();
  const hay = String(excerpt || '').normalize('NFKC').toLowerCase();
  const focus = String(focusTerm || '').normalize('NFKC').toLowerCase();
  if (contextUsed && focus && hay.includes(focus)) return true;
  const latin = [...new Set((question.match(/[a-z][a-z0-9_+-]{1,}/g) || []))];
  const cjk = question.replace(/[^\u4e00-\u9fff]/g, '');
  const grams = [];
  for (let i = 0; i + 2 <= cjk.length; i++) {
    const gram = cjk.slice(i, i + 2);
    if (!STOP_GRAMS.has(gram)) grams.push(gram);
  }
  const latinHits = latin.filter(token => hay.includes(token));
  const gramHits = grams.filter(gram => hay.includes(gram));
  const latinOk = latin.length > 0 && latinHits.length >= 1 && latinHits.length / latin.length >= 0.5;
  const gramOk = grams.length > 0 && gramHits.length >= 1 && gramHits.length / grams.length >= 0.33;
  if (latin.length && grams.length) return latinOk || gramOk;
  if (latin.length) return latinOk;
  if (grams.length) return gramOk;
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
  '如果摘录不足以回答问题，返回 {"sufficient":false}。',
  '如果摘录足够，返回 {"sufficient":true,"answer":"用自己的话连贯说明，每个论断都能在摘录中找到依据"}。',
  '不要把摘录原样堆砌成回答。只输出一个 JSON 对象。',
].join('');

function snippetBlock(retrieval) {
  const citations = retrieval?.dialog?.citations || [];
  return citations.map((citation, index) => {
    const title = citation.sectionTitle || citation.title || citation.unitTitle || '教材';
    return `[${index + 1}] ${title}\n${String(citation.quote || '').trim()}`;
  }).filter(Boolean).join('\n\n');
}

function parseSynthesis(text) {
  const trimmed = String(text || '').trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  let parsed;
  try { parsed = JSON.parse(trimmed); } catch { return null; }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed) || typeof parsed.sufficient !== 'boolean') return null;
  if (parsed.sufficient === false) return { sufficient: false };
  const answer = typeof parsed.answer === 'string' ? parsed.answer.trim() : '';
  if (!answer) return null;
  return { sufficient: true, answer: answer.slice(0, 1800) };
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

export async function composeAskTextbookResponse({ query, retrieval, env = process.env, transport, signal } = {}) {
  const gate = assessSynthesisGate(retrieval, query);
  if (!gate.pass) {
    if (gate.reason === 'unrelated') return untouched(retrieval, 'unrelated', env, ASK_TEXTBOOK_OUT_OF_SCOPE_MESSAGE);
    if (gate.reason === 'needs_clarification' || gate.reason === 'invalid_input' || gate.reason === 'unavailable') return untouched(retrieval, gate.reason, env);
    return uncovered(retrieval, gate.reason, env);
  }
  const readiness = getAskTextbookReadiness(env);
  if (!readiness.configured) return untouched(retrieval, 'not_configured', env);
  const snippets = snippetBlock(retrieval);
  const completion = await completeWithFallback({
    instructions: SYNTHESIS_INSTRUCTIONS,
    userContent: `问题：${String(query || '').trim()}\n\n教材摘录：\n${snippets}`,
    env,
    transport,
    signal,
  });
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
  const parsed = parseSynthesis(completion.text);
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
