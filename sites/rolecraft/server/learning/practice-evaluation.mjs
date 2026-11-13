/**
 * 题库对照评价. Distinct from 问教材 retrieval synthesis.
 * Compares a confirmed learner answer with the reference materials supplied
 * for that question. Audio is rejected. Mastery is not updated here.
 */

import { completeWithFallback, getAskTextbookReadiness } from './model-provider.mjs';

export const PRACTICE_EVAL_FAILURE_MESSAGE = '这次没能完成对照评价。请稍后重试。你仍可以用「我答对了」「我答错了」或「跳过」自己核对。';
export const PRACTICE_EVAL_UNCONFIRMED_MESSAGE = '请先确认转写，再对照参考分析。未确认或失败的转写不会送去评价。';
export const PRACTICE_EVAL_EMPTY_MESSAGE = '还没有可核对的回答。请先输入文字，或确认转写后再评价。';
export const PRACTICE_EVAL_PERSONAL_MESSAGE = '这道题需要结合你的真实经历。教材只提供方法，不能代替你的项目事实。';
export const PRACTICE_EVAL_NOT_CONFIGURED_MESSAGE = '对照评价尚未配置。请先用「我答对了」「我答错了」或「跳过」自己核对。';
export const PRACTICE_EVAL_LABEL = '这是对照教材参考分析的模型评价，不是认证，也不是最终成绩。';

const VERDICTS = new Set(['准确', '部分准确', '不准确', '依据不足无法判断']);

const EVAL_INSTRUCTIONS = [
  '你是职造题库的对照评价。只能把学员回答与提供的题干、教材参考分析摘录、以及已审阅的参考解析作比较。',
  '不得使用这些材料以外的知识，不得因为措辞与摘录不同就判错，也不得因为措辞相近就判对。',
  '要说明覆盖了哪些要点、漏了哪些要点、以及哪些说法和材料有实质偏差。',
  '如果材料本身不足以判断，verdict 必须是「依据不足无法判断」。',
  '只输出一个 JSON 对象：{"verdict":"准确|部分准确|不准确|依据不足无法判断","covered":["要点"],"missed":["要点"],"deviations":["实质偏差"],"rationale":"两三句说明"}。',
  '这不是认证，也不是官方分数。',
].join('');

function listOf(value, limit = 6) {
  if (!Array.isArray(value)) return [];
  return value.filter(item => typeof item === 'string' && item.trim()).map(item => item.trim().slice(0, 240)).slice(0, limit);
}

function parseEvaluation(text) {
  const trimmed = String(text || '').trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  let parsed;
  try { parsed = JSON.parse(trimmed); } catch { return null; }
  if (!parsed || typeof parsed !== 'object' || !VERDICTS.has(parsed.verdict)) return null;
  const rationale = typeof parsed.rationale === 'string' ? parsed.rationale.trim().slice(0, 600) : '';
  if (!rationale) return null;
  return {
    verdict: parsed.verdict,
    covered: listOf(parsed.covered),
    missed: listOf(parsed.missed),
    deviations: listOf(parsed.deviations),
    rationale,
  };
}

function referenceBlock(input) {
  const lines = [`题干：${String(input.question || '').trim()}`];
  const references = Array.isArray(input.references) ? input.references : [];
  references.forEach((item, index) => {
    const title = String(item?.title || '教材参考分析').trim();
    const quote = String(item?.quote || '').trim();
    if (quote) lines.push(`参考摘录 ${index + 1}（${title}）：${quote}`);
  });
  const reviewed = String(input.reviewedAnswer || '').trim();
  if (reviewed) lines.push(`已审阅的参考解析（不是固定标准答案）：${reviewed}`);
  lines.push(`学员回答：${String(input.answer || '').trim()}`);
  return lines.join('\n\n');
}

function skipped(status, message) {
  return { status, providerCalled: false, evaluation: null, message, label: PRACTICE_EVAL_LABEL };
}

export function normalizePracticeEvaluationInput(input = {}) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return { error: '需要 JSON 对象' };
  if (Object.hasOwn(input, 'audio') || Object.hasOwn(input, 'audioBase64') || Object.hasOwn(input, 'recording')) return { error: '评价只接受已确认的文字和参考材料' };
  const answer = typeof input.answer === 'string' ? input.answer.trim().slice(0, 12000) : '';
  const question = typeof input.question === 'string' ? input.question.trim().slice(0, 4000) : '';
  const references = Array.isArray(input.references) ? input.references.slice(0, 8).map(item => ({
    title: typeof item?.title === 'string' ? item.title.trim().slice(0, 240) : '',
    quote: typeof item?.quote === 'string' ? item.quote.trim().slice(0, 2000) : '',
  })).filter(item => item.quote) : [];
  return {
    value: {
      questionId: typeof input.questionId === 'string' ? input.questionId.trim().slice(0, 64) : '',
      question,
      answer,
      confirmed: input.confirmed === true,
      personalEvidenceRequired: input.personalEvidenceRequired === true || input.answerKind === 'personal_evidence_required',
      answerKind: typeof input.answerKind === 'string' ? input.answerKind.slice(0, 80) : '',
      references,
      reviewedAnswer: typeof input.reviewedAnswer === 'string' ? input.reviewedAnswer.trim().slice(0, 8000) : '',
    },
  };
}

export async function evaluatePracticeAnswer(input, { env = process.env, transport, signal } = {}) {
  const normalized = normalizePracticeEvaluationInput(input);
  if (normalized.error) return { status: 'invalid_input', providerCalled: false, evaluation: null, message: normalized.error, label: PRACTICE_EVAL_LABEL };
  const value = normalized.value;
  if (!value.confirmed) return skipped('unconfirmed', PRACTICE_EVAL_UNCONFIRMED_MESSAGE);
  if (!value.answer) return skipped('empty', PRACTICE_EVAL_EMPTY_MESSAGE);
  if (value.personalEvidenceRequired) return skipped('personal_evidence', PRACTICE_EVAL_PERSONAL_MESSAGE);
  const readiness = getAskTextbookReadiness(env);
  if (!readiness.configured) return skipped('not_configured', PRACTICE_EVAL_NOT_CONFIGURED_MESSAGE);
  const completion = await completeWithFallback({
    instructions: EVAL_INSTRUCTIONS,
    userContent: referenceBlock(value),
    env,
    transport,
    signal,
  });
  if (!completion.ok) {
    return {
      status: 'failed',
      providerCalled: completion.providerCalled === true,
      evaluation: null,
      message: PRACTICE_EVAL_FAILURE_MESSAGE,
      label: PRACTICE_EVAL_LABEL,
    };
  }
  const parsed = parseEvaluation(completion.text);
  if (!parsed) {
    return {
      status: 'failed',
      providerCalled: true,
      evaluation: null,
      message: PRACTICE_EVAL_FAILURE_MESSAGE,
      label: PRACTICE_EVAL_LABEL,
    };
  }
  return {
    status: 'evaluated',
    providerCalled: true,
    evaluation: { ...parsed, label: PRACTICE_EVAL_LABEL, model: completion.model, fallbackUsed: completion.fallbackUsed === true },
    message: parsed.rationale,
    label: PRACTICE_EVAL_LABEL,
  };
}
