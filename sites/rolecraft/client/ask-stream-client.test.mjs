import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { consumeLearningQueryStream, paintAskStreamDelta } from './ask-stream-client.mjs';
import { mergeAdjacentCitationCards } from './merge-adjacent-citation-cards.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));

function eventStream(chunks, onPull) {
  const encoder = new TextEncoder();
  let index = 0;
  return new Response(new ReadableStream({
    pull(controller) {
      onPull?.(index);
      if (index >= chunks.length) {
        controller.close();
        return;
      }
      controller.enqueue(encoder.encode(chunks[index]));
      index += 1;
    },
  }), { status: 200, headers: { 'content-type': 'text/event-stream' } });
}

function answerEvent(delta) {
  return `event: answer\ndata: ${JSON.stringify({ delta })}\n\n`;
}

function fakeDocument() {
  const nodes = new Map();
  const results = {
    id: 'lw-find-results',
    html: '',
    querySelector() { return null; },
    set innerHTML(value) {
      this.html = value;
      if (value.includes('id="lw-ask-stream-text"')) {
        nodes.set('lw-ask-stream-text', { id: 'lw-ask-stream-text', textContent: '' });
      }
    },
    get innerHTML() { return this.html; },
  };
  nodes.set('lw-find-results', results);
  return {
    results,
    getElementById(id) { return nodes.get(id) || null; },
    querySelector(selector) { return selector === '.lw-ask-live' ? this.live : null; },
    live: { textContent: '' },
  };
}

test('workbench stream paints answer text before citations and then keeps merged source cards', async () => {
  const doc = fakeDocument();
  const citations = [
    { unitId: 'c01-selection', sectionId: 's-opening', sectionIndex: 0, title: '为一个任务选择最小可用方案', href: '#learn/agent/c01-selection/s-opening', quote: '先冻结任务再选择最小方案。', sourcePath: 'textbooks/v13/c01-selection.md' },
    { unitId: 'c01-selection', sectionId: 's-figure', sectionIndex: 1, title: '先看一张图：谁决定下一步？', href: '#learn/agent/c01-selection/s-figure', quote: '下一步由谁决定要看新的观察。', sourcePath: 'textbooks/v13/c01-selection.md' },
    { unitId: '00-learning-route', sectionId: 's-route', sectionIndex: 0, title: '认识 Agent 工程', href: '#learn/agent/00-learning-route/s-route', quote: '这与 Anthropic 的架构定义一致。', sourcePath: 'textbooks/v13/00-learning-route.md' },
  ];
  const done = {
    status: 'recommended',
    dialog: {
      status: 'answered',
      answerMode: 'synthesized',
      synthesis: { status: 'answered', answer: '教材摘录说明控制权划分。', fallbackUsed: false },
      citations,
    },
  };
  const deltas = [];
  const response = eventStream([
    answerEvent('教材'),
    answerEvent('摘录'),
    `event: done\ndata: ${JSON.stringify(done)}\n\n`,
  ], index => {
    if (index === 1) {
      assert.equal(doc.results.innerHTML.includes('lw-ask-card'), false);
      assert.equal(doc.getElementById('lw-ask-stream-text').textContent, '教材');
    }
  });
  const payload = await consumeLearningQueryStream(response, delta => {
    deltas.push(delta);
    paintAskStreamDelta(doc, delta);
    assert.equal(doc.results.innerHTML.includes('lw-ask-card'), false);
    assert.equal(doc.results.innerHTML.includes('查看出处原文'), false);
  });
  assert.deepEqual(deltas, ['教材', '摘录']);
  assert.equal(doc.getElementById('lw-ask-stream-text').textContent, '教材摘录');
  assert.equal(doc.live.textContent, '正在根据教材摘录组织回答');
  const cards = mergeAdjacentCitationCards(payload.dialog.citations);
  assert.equal(cards.length, 2);
  assert.equal(cards[0].href, citations[0].href);
  assert.equal(cards[0].quote.includes(citations[0].quote), true);
  assert.equal(cards[0].quote.includes(citations[1].quote), true);
  assert.equal(cards[1].title, '认识 Agent 工程');
  const finalHtml = `<p>${payload.dialog.synthesis.answer}</p>` + cards.map(card => `<a class="lw-ask-card" href="${card.href}">${card.title}</a>`).join('');
  assert.equal(finalHtml.includes('教材摘录说明控制权划分。'), true);
  assert.equal(finalHtml.indexOf('教材摘录说明控制权划分。') < finalHtml.indexOf('lw-ask-card'), true);
  assert.equal(payload.dialog.citations.length, 3);
});

test('an insufficient final event does not paint answer text', async () => {
  const doc = fakeDocument();
  let paints = 0;
  const payload = await consumeLearningQueryStream(eventStream([
    'event: done\ndata: {"dialog":{"synthesis":{"status":"insufficient","answer":null},"citations":[{"quote":"出处仍在"}]}}\n\n',
  ]), () => { paints += 1; paintAskStreamDelta(doc, '不应出现'); });
  assert.equal(paints, 0);
  assert.equal(doc.results.innerHTML, '');
  assert.equal(payload.dialog.synthesis.status, 'insufficient');
  assert.equal(payload.dialog.citations[0].quote, '出处仍在');
});

test('workbench applies stream deltas before the final citation render', () => {
  const workbench = readFileSync(path.join(here, '../dist/learning-workbench.js'), 'utf8');
  const client = readFileSync(path.join(here, 'ask-stream-client.mjs'), 'utf8');
  const slice = source => source.slice(source.indexOf('async function consumeLearningQueryStream'), source.indexOf('/* end ask-stream-client */')).replace(/\s+/g, '');
  assert.equal(slice(workbench), slice(client.replace(/^export /gm, '')));
  const find = workbench.slice(workbench.indexOf('async function find'), workbench.indexOf('function sessionValue'));
  const streamAt = find.indexOf('consumeLearningQueryStream');
  const paintAt = find.indexOf('paintAskStreamDelta');
  const refreshAt = find.lastIndexOf('refreshAssistant()');
  assert.equal(streamAt > 0 && paintAt > streamAt && refreshAt > paintAt, true);
  assert.equal(find.includes("Accept: 'text/event-stream'"), true);
  assert.equal(workbench.includes('const cards = askCandidates(citations);'), true);
  assert.equal(workbench.includes('const cards = askCandidates(dialog.citations);'), true);
  const server = readFileSync(path.join(here, '../server/index.mjs'), 'utf8');
  assert.equal(server.includes('text/event-stream'), true);
  assert.equal(server.includes('onAnswerDelta'), true);
  const html = readFileSync(path.join(here, '../dist/index.html'), 'utf8');
  assert.equal(html.includes('learning-workbench.js?v=ask-stream-1'), true);
});
