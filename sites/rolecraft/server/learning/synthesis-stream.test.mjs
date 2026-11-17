import assert from 'node:assert/strict';
import test from 'node:test';
import { createSynthesisStreamParser, parseSynthesisText } from './synthesis-stream.mjs';

test('line protocol releases answer text only after sufficient true', () => {
  const parser = createSynthesisStreamParser();
  assert.equal(parser.push('sufficient: tr'), '');
  assert.equal(parser.released(), false);
  assert.equal(parser.push('ue\n教'), '教');
  assert.equal(parser.push('材摘录'), '材摘录');
  assert.deepEqual(parser.finish(), { sufficient: true, answer: '教材摘录' });
});

test('insufficient line and JSON do not release a later answer', () => {
  const line = createSynthesisStreamParser();
  assert.equal(line.push('sufficient: false\n不要显示'), '');
  assert.equal(line.released(), false);
  assert.deepEqual(line.finish(), { sufficient: false });

  const json = createSynthesisStreamParser();
  assert.equal(json.push('{"answer":"坏'), '');
  assert.equal(json.push('","sufficient":false}'), '');
  assert.equal(json.released(), false);
  assert.deepEqual(json.finish(), { sufficient: false });
});

test('JSON answer field streams after sufficient true, including a split escape', () => {
  const parser = createSynthesisStreamParser();
  assert.equal(parser.push('{"sufficient":true,"answer":"教'), '教');
  assert.equal(parser.push('\\n摘'), '\n摘');
  assert.equal(parser.push('录"}'), '录');
  assert.deepEqual(parser.finish(), { sufficient: true, answer: '教\n摘录' });
});

test('fenced JSON still parses as a complete synthesis envelope', () => {
  const parsed = parseSynthesisText('```json\n{"sufficient":true,"answer":"教材摘录说明，ReAct 会交错推理和行动。"}\n```');
  assert.deepEqual(parsed, { sufficient: true, answer: '教材摘录说明，ReAct 会交错推理和行动。' });
  assert.deepEqual(parseSynthesisText('{"sufficient":false,"answer":"外部知识"}'), { sufficient: false });
});
