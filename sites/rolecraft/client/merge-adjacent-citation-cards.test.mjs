import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { mergeAdjacentCitationCards } from './merge-adjacent-citation-cards.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const opening = {
  unitId: 'c01-selection',
  sectionId: 's-opening',
  sectionIndex: 0,
  title: '为一个任务选择最小可用方案',
  sectionTitle: '为一个任务选择最小可用方案',
  href: '#learn/agent/c01-selection/s-opening',
  quote: '需要解释自由文本，不等于需要动态 Agent。',
  sourcePath: 'textbooks/v13/c01-selection.md',
  quoteStart: 54,
  quoteEnd: 100,
};
const figure = {
  unitId: 'c01-selection',
  sectionId: 's-figure',
  sectionIndex: 1,
  title: '先看一张图：谁决定下一步？',
  href: '#learn/agent/c01-selection/s-figure',
  quote: '四种方案从普通程序到动态 Agent，表达的是控制权逐步交给运行时。',
  sourcePath: 'textbooks/v13/c01-selection.md',
  quoteStart: 374,
  quoteEnd: 443,
};
const route = {
  unitId: '00-learning-route',
  sectionId: 's-route',
  sectionIndex: 0,
  title: '认识 Agent 工程',
  href: '#learn/agent/00-learning-route/s-route',
  quote: '这与 Anthropic 的架构定义一致。',
  sourcePath: 'textbooks/v13/00-learning-route.md',
  quoteStart: 715,
  quoteEnd: 760,
};

test('same-unit adjacent sections merge to the earlier href and keep both quotes', () => {
  const citations = [figure, opening];
  const snapshot = JSON.parse(JSON.stringify(citations));
  const cards = mergeAdjacentCitationCards(citations);
  assert.deepEqual(citations, snapshot);
  assert.equal(cards.length, 1);
  assert.equal(cards[0].href, opening.href);
  assert.equal(cards[0].title, opening.title);
  assert.equal(cards[0].unitId, 'c01-selection');
  assert.equal(cards[0].sectionId, opening.sectionId);
  assert.equal(cards[0].quote.includes(opening.quote), true);
  assert.equal(cards[0].quote.includes(figure.quote), true);
  assert.equal(cards[0].quote.indexOf(opening.quote) < cards[0].quote.indexOf(figure.quote), true);
});

test('a later citation in another unit stays its own card', () => {
  const cards = mergeAdjacentCitationCards([opening, figure, route]);
  assert.equal(cards.length, 2);
  assert.equal(cards[0].href, opening.href);
  assert.equal(cards[0].quote.includes(opening.quote), true);
  assert.equal(cards[0].quote.includes(figure.quote), true);
  assert.equal(cards[1].unitId, '00-learning-route');
  assert.equal(cards[1].title, '认识 Agent 工程');
  assert.equal(cards[1].href, route.href);
  assert.equal(cards[1].quote, route.quote);
});

test('non-adjacent different units do not merge', () => {
  const other = {
    unitId: 'n03-planning-reflection',
    sectionId: 's-react',
    sectionIndex: 4,
    title: '三种策略',
    href: '#learn/agent/n03-planning-reflection/s-react',
    quote: 'ReAct 将推理和行动交错进行。',
    sourcePath: 'textbooks/v13/n03-planning-reflection.md',
    quoteStart: 80,
    quoteEnd: 110,
  };
  const far = {
    unitId: 'c01-selection',
    sectionId: 's-migration',
    sectionIndex: 8,
    title: '迁移：未知路径',
    href: '#learn/agent/c01-selection/s-migration',
    quote: '失败报告给出 service.py。',
    sourcePath: 'textbooks/v13/c01-selection.md',
    quoteStart: 40,
    quoteEnd: 70,
  };
  assert.equal(mergeAdjacentCitationCards([opening, other]).length, 2);
  assert.equal(mergeAdjacentCitationCards([route, other]).length, 2);
  assert.equal(mergeAdjacentCitationCards([opening, far]).length, 2);
  assert.deepEqual(mergeAdjacentCitationCards([opening, route, other]).map(card => card.unitId), [
    'c01-selection',
    '00-learning-route',
    'n03-planning-reflection',
  ]);
});

test('close quote offsets in the same file merge when section order is unknown', () => {
  const first = { ...opening, sectionIndex: null, quoteStart: 54, quoteEnd: 100 };
  const second = { ...figure, sectionIndex: null, quoteStart: 152, quoteEnd: 221 };
  const cards = mergeAdjacentCitationCards([second, first]);
  assert.equal(cards.length, 1);
  assert.equal(cards[0].href, first.href);
  const distant = { ...figure, sectionIndex: null, quoteStart: 900, quoteEnd: 980 };
  assert.equal(mergeAdjacentCitationCards([first, distant]).length, 2);
});

test('consecutive same-unit citations with no position still merge', () => {
  const first = { unitId: 'c01-selection', sectionId: 's1', title: '开篇', href: '#a', quote: '先冻结任务再选择最小方案。' };
  const second = { unitId: 'c01-selection', sectionId: 's2', title: '下一节', href: '#b', quote: '下一步由谁决定要看新的观察。' };
  const cards = mergeAdjacentCitationCards([first, second]);
  assert.equal(cards.length, 1);
  assert.equal(cards[0].href, '#a');
  assert.equal(cards[0].quote.includes(first.quote), true);
  assert.equal(cards[0].quote.includes(second.quote), true);
});

test('workbench source cards use the same helper without changing the citation payload', () => {
  const helper = readFileSync(path.join(here, 'merge-adjacent-citation-cards.mjs'), 'utf8');
  const workbench = readFileSync(path.join(here, '../dist/learning-workbench.js'), 'utf8');
  const ask = readFileSync(path.join(here, '../server/learning/ask-textbook.mjs'), 'utf8');
  const slice = source => source.slice(source.indexOf('function mergeAdjacentCitationCards'), source.indexOf('/* end mergeAdjacentCitationCards */')).replace(/\s+/g, '');
  assert.equal(slice(workbench), slice(helper.replace('export function', 'function')));
  assert.equal(workbench.includes('return mergeAdjacentCitationCards(prepared).slice(0, 3);'), true);
  assert.equal(workbench.includes('const cards = askCandidates(citations);'), true);
  assert.equal(workbench.includes('const cards = askCandidates(dialog.citations);'), true);
  assert.equal(ask.includes('mergeAdjacentCitationCards'), false);
  assert.equal(ask.includes('function snippetBlock(retrieval)'), true);
  assert.match(ask, /citations\.map\(\(citation, index\) =>/);
});
