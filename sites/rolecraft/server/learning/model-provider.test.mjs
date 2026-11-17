import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { completeWithFallback } from './model-provider.mjs';

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

const instructions = '只用摘录作答';
const userContent = '问题：这个系统的架构是什么样的';
const synthesis = '{"sufficient":true,"answer":"摘录把体系分成固定工作流和动态决策。"}';

function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function recordCall(calls, url, options) {
  const body = JSON.parse(options.body);
  calls.push({ url, body, headers: options.headers, signal: options.signal });
  return body;
}

function chatPayload(text) {
  return { choices: [{ message: { role: 'assistant', content: text } }] };
}

test('model provider source does not read generation model names', () => {
  const source = readFileSync(new URL('./model-provider.mjs', import.meta.url), 'utf8');
  const code = source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
  assert.equal(code.includes('OPENAI_MODEL'), false);
  assert.equal(code.includes('GENERATE_MODEL'), false);
});

test('chat completions HTTP 500 retries the same model on responses', async () => {
  const calls = [];
  const scheduled = [];
  const originalSetTimeout = globalThis.setTimeout;
  globalThis.setTimeout = (fn, ms, ...args) => {
    scheduled.push(ms);
    return originalSetTimeout(fn, ms, ...args);
  };
  let result;
  try {
    result = await completeWithFallback({
      instructions,
      userContent,
      env,
      transport(url, options) {
        const body = recordCall(calls, url, options);
        assert.equal(body.model, 'claude-sonnet-5-5');
        assert.equal(options.headers.Authorization, 'Bearer test-key-not-a-secret');
        assert.equal(options.headers['Content-Type'], 'application/json');
        if (url.endsWith('/chat/completions')) {
          return jsonResponse({
            error: { type: 'new_api_error', code: 'convert_request_failed', message: 'not implemented', secret: 'SECRET_PROVIDER_BODY' },
          }, 500);
        }
        assert.equal(url, 'https://www.9898.ai/v1/responses');
        return jsonResponse({ output_text: synthesis });
      },
    });
  } finally {
    globalThis.setTimeout = originalSetTimeout;
  }
  assert.equal(result.ok, true);
  assert.equal(result.text, synthesis);
  assert.equal(result.model, 'claude-sonnet-5-5');
  assert.equal(result.fallbackUsed, false);
  assert.equal(JSON.stringify(result).includes('SECRET_PROVIDER_BODY'), false);
  assert.equal(calls.length, 2);
  assert.equal(calls[0].url, 'https://www.9898.ai/v1/chat/completions');
  assert.equal(calls[0].body.max_tokens, 1200);
  assert.equal(Object.hasOwn(calls[0].body, 'max_output_tokens'), false);
  assert.equal(Object.hasOwn(calls[0].body, 'store'), false);
  assert.deepEqual(calls[0].body.messages, [
    { role: 'system', content: instructions },
    { role: 'user', content: userContent },
  ]);
  assert.equal(calls[1].url, 'https://www.9898.ai/v1/responses');
  assert.equal(calls[1].body.store, false);
  assert.equal(calls[1].body.max_output_tokens, 1200);
  assert.equal(calls[1].signal, calls[0].signal);
  assert.equal(scheduled.filter(ms => ms === 40000).length, 1);
});

test('successful chat completions does not call responses', async () => {
  const calls = [];
  const result = await completeWithFallback({
    instructions,
    userContent,
    env,
    transport(url, options) {
      recordCall(calls, url, options);
      if (url.endsWith('/responses')) throw new Error('responses should not be called when chat completions succeeds');
      assert.equal(url, 'https://www.9898.ai/v1/chat/completions');
      return jsonResponse({
        choices: [{
          message: {
            content: [
              { type: 'text', text: synthesis.slice(0, 12) },
              { type: 'output_text', text: synthesis.slice(12) },
              { type: 'image_url', image_url: { url: 'https://example.invalid/diagram.png' } },
            ],
          },
        }],
      });
    },
  });
  assert.equal(calls.length, 1);
  assert.equal(result.ok, true);
  assert.equal(result.text, synthesis);
  assert.equal(result.model, 'claude-sonnet-5-5');
  assert.equal(result.fallbackUsed, false);
  assert.equal(calls[0].body.model === env.OPENAI_MODEL, false);
  assert.equal(calls[0].body.model === env.GENERATE_MODEL, false);
});

test('a responses-only success still works after chat completions fails', async () => {
  const payloads = [
    { output_text: 'from-output-text', text: 'from-output-text' },
    {
      output: [{ type: 'message', content: [{ type: 'output_text', text: 'from-content-item' }] }],
      text: 'from-content-item',
    },
  ];
  for (const payload of payloads) {
    const calls = [];
    const result = await completeWithFallback({
      instructions,
      userContent,
      env,
      transport(url, options) {
        calls.push(url);
        assert.equal(JSON.parse(options.body).model, 'claude-sonnet-5-5');
        if (url.endsWith('/chat/completions')) return jsonResponse({ error: { message: 'not implemented' } }, 500);
        return jsonResponse(payload);
      },
    });
    assert.deepEqual(calls, [
      'https://www.9898.ai/v1/chat/completions',
      'https://www.9898.ai/v1/responses',
    ]);
    assert.equal(result.ok, true);
    assert.equal(result.text, payload.text);
    assert.equal(result.model, 'claude-sonnet-5-5');
    assert.equal(result.fallbackUsed, false);
  }
});

test('chat completions timeout does not call responses for that model', async () => {
  const calls = [];
  const result = await completeWithFallback({
    instructions,
    userContent,
    env: { ...env, ASK_TEXTBOOK_TIMEOUT_MS: '1000' },
    transport(url, options) {
      const body = JSON.parse(options.body);
      calls.push({ model: body.model, path: new URL(url).pathname });
      if (url.endsWith('/responses')) throw new Error('responses should not run after chat completions timed out');
      if (body.model === 'claude-sonnet-5-5') {
        return new Promise((resolve, reject) => {
          const fail = () => {
            const error = new Error('The operation was aborted');
            error.name = 'AbortError';
            reject(error);
          };
          if (options.signal?.aborted) fail();
          else options.signal?.addEventListener('abort', fail, { once: true });
        });
      }
      return jsonResponse(chatPayload('fallback text'));
    },
  });
  assert.equal(calls.some(call => call.path === '/responses'), false);
  assert.deepEqual(calls, [
    { model: 'claude-sonnet-5-5', path: '/v1/chat/completions' },
    { model: 'deepseek-v4-flash', path: '/v1/chat/completions' },
  ]);
  assert.equal(result.ok, true);
  assert.equal(result.text, 'fallback text');
  assert.equal(result.model, 'deepseek-v4-flash');
  assert.equal(result.fallbackUsed, true);
});

test('chat completions rate limit does not call responses for that model', async () => {
  const calls = [];
  const result = await completeWithFallback({
    instructions,
    userContent,
    env,
    transport(url, options) {
      const body = JSON.parse(options.body);
      calls.push({ model: body.model, path: new URL(url).pathname });
      if (body.model === 'claude-sonnet-5-5') return jsonResponse({ error: { message: 'slow down' } }, 429);
      if (url.endsWith('/responses')) throw new Error('fallback responses should not be called');
      return jsonResponse(chatPayload('fallback text'));
    },
  });
  assert.deepEqual(calls, [
    { model: 'claude-sonnet-5-5', path: '/v1/chat/completions' },
    { model: 'deepseek-v4-flash', path: '/v1/chat/completions' },
  ]);
  assert.equal(result.ok, true);
  assert.equal(result.model, 'deepseek-v4-flash');
  assert.equal(result.fallbackUsed, true);
});

test('failed chat completions can still succeed on responses for the fallback model', async () => {
  const calls = [];
  const result = await completeWithFallback({
    instructions,
    userContent,
    env,
    transport(url, options) {
      const body = JSON.parse(options.body);
      calls.push({ model: body.model, path: new URL(url).pathname, body });
      if (body.model === 'claude-sonnet-5-5') {
        return jsonResponse({ error: { message: 'not implemented', secret: 'SECRET_PROVIDER_BODY' } }, url.endsWith('/chat/completions') ? 500 : 502);
      }
      if (url.endsWith('/chat/completions')) return jsonResponse({ error: { message: 'chat down' } }, 502);
      return jsonResponse({ output_text: 'from-fallback' });
    },
  });
  assert.deepEqual(calls.map(call => ({ model: call.model, path: call.path })), [
    { model: 'claude-sonnet-5-5', path: '/v1/chat/completions' },
    { model: 'claude-sonnet-5-5', path: '/v1/responses' },
    { model: 'deepseek-v4-flash', path: '/v1/chat/completions' },
    { model: 'deepseek-v4-flash', path: '/v1/responses' },
  ]);
  assert.equal(calls[0].body.max_tokens, 1200);
  assert.equal(Object.hasOwn(calls[0].body, 'store'), false);
  assert.equal(Object.hasOwn(calls[0].body, 'max_output_tokens'), false);
  assert.equal(result.ok, true);
  assert.equal(result.text, 'from-fallback');
  assert.equal(result.model, 'deepseek-v4-flash');
  assert.equal(result.fallbackUsed, true);
  assert.equal(JSON.stringify(result).includes('SECRET_PROVIDER_BODY'), false);
});

test('unusable chat content is not returned and the fallback model is used', async () => {
  const result = await completeWithFallback({
    instructions,
    userContent,
    env,
    transport(url, options) {
      const body = JSON.parse(options.body);
      if (body.model === 'claude-sonnet-5-5' && url.endsWith('/chat/completions')) return jsonResponse({ choices: [{ message: { content: [{ type: 'text', text: '   ' }] } }] });
      if (body.model === 'claude-sonnet-5-5') return jsonResponse({ error: 'nope' }, 500);
      if (url.endsWith('/chat/completions')) return jsonResponse(chatPayload('fallback text'));
      throw new Error('fallback responses should not be called');
    },
  });
  assert.equal(result.ok, true);
  assert.equal(result.text, 'fallback text');
  assert.equal(result.model, 'deepseek-v4-flash');
  assert.equal(result.fallbackUsed, true);
});
