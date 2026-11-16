/**
 * Shared Responses-API client for 问教材 synthesis and 题库对照评价.
 * Model name, timeout, and max tokens are separate from chapter generation.
 * OPENAI_MODEL and GENERATE_MODEL are intentionally unread.
 * The API key and base URL follow the generation adapter (OPENAI_API_KEY, OPENAI_BASE_URL).
 */

const MODEL_RE = /^[-a-zA-Z0-9_.:]{1,128}$/;

export function loadAskTextbookConfig(env = process.env) {
  const baseUrl = env.OPENAI_BASE_URL ?? 'https://api.openai.com/v1';
  return {
    apiKey: typeof env.OPENAI_API_KEY === 'string' ? env.OPENAI_API_KEY.trim() : '',
    baseUrl: typeof baseUrl === 'string' ? baseUrl.trim().replace(/\/+$/, '') : '',
    model: String(env.ASK_TEXTBOOK_MODEL || 'claude-sonnet-5-5').trim(),
    fallbackModel: String(env.ASK_TEXTBOOK_FALLBACK_MODEL || 'deepseek-v4-flash').trim(),
    timeoutMs: Number(env.ASK_TEXTBOOK_TIMEOUT_MS ?? 40000),
    maxOutputTokens: Number(env.ASK_TEXTBOOK_MAX_OUTPUT_TOKENS ?? 1200),
  };
}

export function getAskTextbookReadiness(env = process.env) {
  const config = loadAskTextbookConfig(env);
  const missing = [];
  if (!config.apiKey) missing.push('OPENAI_API_KEY');
  let validBaseUrl = false;
  try {
    const url = new URL(config.baseUrl);
    validBaseUrl = url.protocol === 'https:' && !url.username && !url.password && !url.search && !url.hash && !!url.hostname;
  } catch { /* missing stays listed below */ }
  if (!validBaseUrl) missing.push('OPENAI_BASE_URL');
  if (!MODEL_RE.test(config.model)) missing.push('ASK_TEXTBOOK_MODEL');
  if (!MODEL_RE.test(config.fallbackModel)) missing.push('ASK_TEXTBOOK_FALLBACK_MODEL');
  if (!Number.isInteger(config.timeoutMs) || config.timeoutMs < 1000 || config.timeoutMs > 120000) missing.push('ASK_TEXTBOOK_TIMEOUT_MS');
  if (!Number.isInteger(config.maxOutputTokens) || config.maxOutputTokens < 128 || config.maxOutputTokens > 4000) missing.push('ASK_TEXTBOOK_MAX_OUTPUT_TOKENS');
  return {
    configured: missing.length === 0,
    missing,
    model: MODEL_RE.test(config.model) ? config.model : null,
    fallbackModel: MODEL_RE.test(config.fallbackModel) ? config.fallbackModel : null,
  };
}

function providerError(code) {
  const error = new Error(code);
  error.code = code;
  return error;
}

function outputText(payload) {
  if (typeof payload?.output_text === 'string' && payload.output_text.trim()) return payload.output_text;
  const items = Array.isArray(payload?.output) ? payload.output.flatMap(item => Array.isArray(item?.content) ? item.content : []) : [];
  if (items.some(item => item?.type === 'refusal')) throw providerError('provider_refusal');
  const texts = items.filter(item => item?.type === 'output_text' && typeof item.text === 'string').map(item => item.text);
  if (texts.length !== 1 || !texts[0].trim()) throw providerError('provider_invalid_response');
  return texts[0];
}

async function requestModelText({ config, model, instructions, userContent, transport, signal }) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), config.timeoutMs);
  const onAbort = () => controller.abort();
  if (signal?.aborted) controller.abort();
  else signal?.addEventListener('abort', onAbort, { once: true });
  try {
    const body = {
      model,
      store: false,
      input: [
        { role: 'system', content: instructions },
        { role: 'user', content: userContent },
      ],
      max_output_tokens: config.maxOutputTokens,
    };
    const response = await (transport || fetch)(`${config.baseUrl}/responses`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${config.apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    if (!response?.ok) {
      try { await response.body?.cancel?.(); } catch { /* ignore */ }
      throw providerError(response?.status === 429 ? 'provider_rate_limit' : response?.status >= 500 ? 'provider_unavailable' : 'provider_invalid_response');
    }
    const payload = await response.json();
    if (payload?.status === 'incomplete') throw providerError('provider_incomplete');
    return outputText(payload);
  } catch (error) {
    if (error?.code && error.code.startsWith('provider_')) throw error;
    if (controller.signal.aborted || error?.name === 'AbortError') throw providerError('timeout');
    throw providerError('network_error');
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', onAbort);
  }
}

export async function completeWithFallback({ instructions, userContent, env = process.env, transport, signal } = {}) {
  const readiness = getAskTextbookReadiness(env);
  if (!readiness.configured) {
    return { ok: false, providerCalled: false, code: 'not_configured', missing: readiness.missing, text: '', model: null, fallbackUsed: false };
  }
  const config = loadAskTextbookConfig(env);
  const models = [config.model];
  if (config.fallbackModel !== config.model) models.push(config.fallbackModel);
  let providerCalled = false;
  for (let index = 0; index < models.length; index++) {
    providerCalled = true;
    try {
      const text = await requestModelText({ config, model: models[index], instructions, userContent, transport, signal });
      return { ok: true, providerCalled: true, code: 'completed', text, model: models[index], fallbackUsed: index > 0 };
    } catch {
      /* try the fallback model; never surface provider bodies */
    }
  }
  return { ok: false, providerCalled, code: 'generation_failed', text: '', model: null, fallbackUsed: false };
}
