/**
 * Incremental reader for 问教材 synthesis.
 * Answer text is released only after a sufficiency signal. `sufficient: false`
 * and {"sufficient":false} never release answer characters, so the UI cannot
 * flash a partial answer and then replace it.
 */

function stripOpeningFence(text) {
  return String(text || '').replace(/^\uFEFF?/, '').replace(/^\s*```(?:json)?[^\n]*\n/i, '');
}

function decodeJsonStringPrefix(source) {
  let out = '';
  for (let i = 0; i < source.length; i += 1) {
    const ch = source[i];
    if (ch === '"') return out;
    if (ch !== '\\') {
      out += ch;
      continue;
    }
    if (i + 1 >= source.length) return out;
    const next = source[i + 1];
    if (next === 'u') {
      if (i + 6 > source.length) return out;
      const hex = source.slice(i + 2, i + 6);
      if (!/^[0-9a-fA-F]{4}$/.test(hex)) return out;
      out += String.fromCharCode(Number.parseInt(hex, 16));
      i += 5;
      continue;
    }
    const map = { n: '\n', r: '\r', t: '\t', b: '\b', f: '\f', '"': '"', '\\': '\\', '/': '/' };
    out += Object.hasOwn(map, next) ? map[next] : next;
    i += 1;
  }
  return out;
}

function inspectJson(head) {
  const sufficient = head.match(/"sufficient"\s*:\s*(true|false)/);
  if (!sufficient) return { state: 'pending', text: '' };
  if (sufficient[1] === 'false') return { state: 'insufficient', text: '' };
  const answerKey = head.match(/"answer"\s*:\s*"/);
  if (!answerKey) return { state: 'answer', text: '' };
  const start = answerKey.index + answerKey[0].length;
  return { state: 'answer', text: decodeJsonStringPrefix(head.slice(start)) };
}

export function inspectSynthesis(raw) {
  const head = stripOpeningFence(raw).replace(/\r\n/g, '\n');
  const trimmed = head.trimStart();
  if (trimmed.startsWith('{')) return inspectJson(trimmed);
  if (trimmed.startsWith('```')) return { state: 'pending', text: '' };
  const match = trimmed.match(/^sufficient:\s*(true|false)\b/i);
  if (match) {
    if (match[1].toLowerCase() === 'false') return { state: 'insufficient', text: '' };
    const rest = trimmed.slice(match[0].length);
    const newline = rest.indexOf('\n');
    if (newline < 0) return { state: 'pending', text: '' };
    return { state: 'answer', text: rest.slice(newline + 1) };
  }
  return { state: 'pending', text: '' };
}

export function createSynthesisStreamParser() {
  let raw = '';
  let emitted = '';
  return {
    reset() {
      raw = '';
      emitted = '';
    },
    raw() {
      return raw;
    },
    released() {
      return emitted.length > 0;
    },
    push(chunk) {
      raw += String(chunk ?? '');
      const seen = inspectSynthesis(raw);
      if (seen.state !== 'answer') return '';
      const delta = seen.text.slice(emitted.length);
      emitted = seen.text;
      return delta;
    },
    finish() {
      const seen = inspectSynthesis(raw);
      if (seen.state === 'insufficient') return { sufficient: false };
      if (seen.state !== 'answer') return null;
      const answer = seen.text.trim().slice(0, 1800);
      if (!answer) return null;
      return { sufficient: true, answer };
    },
  };
}

export function parseSynthesisText(text) {
  const parser = createSynthesisStreamParser();
  parser.push(text);
  return parser.finish();
}
