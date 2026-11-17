/**
 * Shared model client for 问教材 synthesis and 题库对照评价.
 * Model name, timeout, and max tokens are separate from chapter generation.
 * Each model is posted to /chat/completions first. A provider error other than
 * timeout or provider_rate_limit retries that same model once on /responses,
 * still inside the original timeout. Ask-textbook streaming uses the same order
 * with stream:true on chat completions only. Practice evaluation stays a single
 * non-streaming completion. OPENAI_MODEL and GENERATE_MODEL are intentionally unread.
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

function asProviderError(error, controller) {
  if (controller.signal.aborted || error?.name === 'AbortError' || error?.code === 'timeout') {
    return error?.code === 'timeout' ? error : providerError('timeout');
  }
  if (typeof error?.code === 'string' && error.code.startsWith('provider_')) return error;
  return providerError('network_error');
}

function httpStatusError(status) {
  if (status === 429) return providerError('provider_rate_limit');
  if (status >= 500) return providerError('provider_unavailable');
  return providerError('provider_invalid_response');
}

// OpenAI-style clients concatenate string parts and text/output_text fragments with no separator.
function chatContentParts(content) {
  if (typeof content === 'string') return [content];
  if (!Array.isArray(content)) return [];
  return content.map(part => {
    if (typeof part === 'string') return part;
    if (!part || typeof part !== 'object' || typeof part.text !== 'string') return '';
    if (part.type != null && part.type !== 'text' && part.type !== 'output_text') return '';
    return part.text;
  });
}

function chatCompletionText(payload) {
  const text = chatContentParts(payload?.choices?.[0]?.message?.content).join('');
  if (!text.trim()) throw providerError('provider_invalid_response');
  return text;
}

async function openModel(transport, url, body, config, signal) {
  const response = await (transport || fetch)(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${config.apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal,
  });
  if (!response?.ok) {
    try { await response.body?.cancel?.(); } catch { /* ignore */ }
    throw httpStatusError(response?.status);
  }
  return response;
}

async function postModel(transport, url, body, config, signal) {
  const response = await openModel(transport, url, body, config, signal);
  return response.json();
}

function chatMessages(instructions, userContent) {
  return [
    { role: 'system', content: instructions },
    { role: 'user', content: userContent },
  ];
}

function chatBody(model, instructions, userContent, maxTokens, stream) {
  return {
    model,
    messages: chatMessages(instructions, userContent),
    max_tokens: maxTokens,
    ...(stream ? { stream: true } : {}),
  };
}

function responsesBody(model, instructions, userContent, maxTokens) {
  return {
    model,
    store: false,
    input: [
      { role: 'system', content: instructions },
      { role: 'user', content: userContent },
    ],
    max_output_tokens: maxTokens,
  };
}

async function readServerSentEvents(response, onDelta) {
  if (!response?.body || typeof response.body.getReader !== 'function') throw providerError('provider_invalid_response');
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let text = '';
  const consume = block => {
    const data = block.split('\n').filter(line => line.startsWith('data:')).map(line => line.slice(5).trimStart()).join('\n');
    if (!data || data === '[DONE]') return;
    let payload;
    try { payload = JSON.parse(data); } catch { throw providerError('provider_invalid_response'); }
    if (payload?.error) throw providerError('provider_unavailable');
    const choice = payload?.choices?.[0] || {};
    const content = choice.delta?.content ?? choice.message?.content;
    const piece = typeof content === 'string' ? content : chatContentParts(content).join('');
    if (!piece) return;
    text += piece;
    onDelta?.(piece);
  };
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true }).replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    let splitAt = buffer.indexOf('\n\n');
    while (splitAt >= 0) {
      consume(buffer.slice(0, splitAt));
      buffer = buffer.slice(splitAt + 2);
      splitAt = buffer.indexOf('\n\n');
    }
  }
  buffer += decoder.decode().replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  if (buffer.trim()) consume(buffer);
  if (!text.trim()) throw providerError('provider_invalid_response');
  return text;
}

async function requestModelText({ config, model, instructions, userContent, transport, signal }) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), config.timeoutMs);
  const onAbort = () => controller.abort();
  if (signal?.aborted) controller.abort();
  else signal?.addEventListener('abort', onAbort, { once: true });
  try {
    try {
      const payload = await postModel(transport, `${config.baseUrl}/chat/completions`, chatBody(model, instructions, userContent, config.maxOutputTokens, false), config, controller.signal);
      return chatCompletionText(payload);
    } catch (error) {
      const coded = asProviderError(error, controller);
      if (coded.code === 'timeout' || coded.code === 'provider_rate_limit') throw coded;
    }
    const payload = await postModel(transport, `${config.baseUrl}/responses`, responsesBody(model, instructions, userContent, config.maxOutputTokens), config, controller.signal);
    if (payload?.status === 'incomplete') throw providerError('provider_incomplete');
    return outputText(payload);
  } catch (error) {
    throw asProviderError(error, controller);
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

async function requestStreamingText({ config, model, instructions, userContent, transport, signal, onDelta, onAttempt, isCommitted }) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), config.timeoutMs);
  const onAbort = () => controller.abort();
  if (signal?.aborted) controller.abort();
  else signal?.addEventListener('abort', onAbort, { once: true });
  try {
    try {
      const response = await openModel(transport, `${config.baseUrl}/chat/completions`, chatBody(model, instructions, userContent, config.maxOutputTokens, true), config, controller.signal);
      return await readServerSentEvents(response, onDelta);
    } catch (error) {
      const coded = asProviderError(error, controller);
      if (isCommitted?.()) return '';
      if (coded.code === 'timeout' || coded.code === 'provider_rate_limit') throw coded;
    }
    onAttempt?.();
    const payload = await postModel(transport, `${config.baseUrl}/responses`, responsesBody(model, instructions, userContent, config.maxOutputTokens), config, controller.signal);
    if (payload?.status === 'incomplete') throw providerError('provider_incomplete');
    const text = outputText(payload);
    onDelta?.(text);
    return text;
  } catch (error) {
    if (isCommitted?.()) return '';
    throw asProviderError(error, controller);
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', onAbort);
  }
}

export async function streamWithFallback({ instructions, userContent, env = process.env, transport, signal, onDelta, onAttempt, isCommitted } = {}) {
  const readiness = getAskTextbookReadiness(env);
  if (!readiness.configured) {
    return { ok: false, providerCalled: false, code: 'not_configured', missing: readiness.missing, text: '', model: null, fallbackUsed: false };
  }
  const config = loadAskTextbookConfig(env);
  const models = [config.model];
  if (config.fallbackModel !== config.model) models.push(config.fallbackModel);
  let providerCalled = false;
  for (let index = 0; index < models.length; index += 1) {
    providerCalled = true;
    onAttempt?.();
    try {
      const text = await requestStreamingText({
        config,
        model: models[index],
        instructions,
        userContent,
        transport,
        signal,
        onDelta,
        onAttempt,
        isCommitted,
      });
      return { ok: true, providerCalled: true, code: 'completed', text, model: models[index], fallbackUsed: index > 0 };
    } catch {
      if (isCommitted?.()) return { ok: true, providerCalled: true, code: 'completed', text: '', model: models[index], fallbackUsed: index > 0 };
    }
  }
  return { ok: false, providerCalled, code: 'generation_failed', text: '', model: null, fallbackUsed: false };
}
