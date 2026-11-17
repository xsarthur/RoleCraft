import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import '../../dist/content-retrieval-core.js';
import { arrangeArchitectureAnswer } from './dialog.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const core = globalThis.RolecraftContentRetrieval;
const corpus = JSON.parse(readFileSync(path.join(here, 'content-v13-index.json'), 'utf8'));
const definitionTitle = /最小可用方案|谁决定下一步|四种方案的控制权/;
const blockedTitle = /迁移：未知路径|动态 Agent 的限制/;

function recommend(query) {
  return core.recommend(corpus, { query, startingPoint: 'developer' });
}

function titles(result) {
  return result.results.map(item => `${item.unitId}:${item.sectionTitle}`);
}

test('candidate pool keeps the selection intro and the control-map heading', () => {
  const intro = recommend('最小可用方案');
  assert.equal(intro.status, 'recommended');
  assert.ok(intro.results.some(item => item.unitId === 'c01-selection' && item.sectionTitle.startsWith('为一个任务选择最小可用方案')), titles(intro).join(' | '));
  const section = corpus.units.find(unit => unit.unitId === 'c01-selection').sections.find(item => /谁决定下一步/.test(item.title));
  const boosted = core.recommend(corpus, { query: '方案选择', startingPoint: 'developer' }, { semanticScores: new Map([[`c01-selection/${section.sectionId}`, 0.99]]) });
  assert.equal(boosted.results[0].sectionId, section.sectionId, titles(boosted).join(' | '));
  assert.match(boosted.results[0].sectionTitle, /谁决定下一步/);
});

for (const query of ['agent架构', 'agent 架构', 'agent的架构']) {
  test(`${query} leads with selection definitions and also returns the opening`, () => {
    const result = recommend(query);
    assert.equal(result.status, 'recommended');
    assert.equal(result.results[0].unitId, 'c01-selection');
    assert.match(result.results[0].sectionTitle, definitionTitle);
    assert.equal(result.results.slice(0, 3).some(item => blockedTitle.test(item.sectionTitle)), false);
    assert.ok(result.results.some(item => item.unitId === 'c01-selection' && item.sectionTitle.startsWith('为一个任务选择最小可用方案')));
    assert.ok(result.results.some(item => /谁决定下一步/.test(item.sectionTitle)));
    assert.ok(result.results.some(item => /四种方案的控制权/.test(item.sectionTitle)));
    const opening = result.results.find(item => item.unitId === '00-learning-route' && item.sectionTitle === '认识 Agent 工程');
    assert.ok(opening, titles(result).join(' | '));
    assert.ok(result.results.indexOf(opening) > 0);
    assert.ok(result.results.findIndex(item => item.unitId === 'c01-selection' && definitionTitle.test(item.sectionTitle)) < result.results.indexOf(opening));
    const shape = core.architectureQuery(query);
    assert.equal(shape.bare, true);
    assert.equal(shape.overview, false);
    assert.deepEqual(result.interpretedIntents.slice(0, 2).map(item => item.id), ['selection', 'orientation']);
  });

  test(`${query} dialog citations pin the definition before the opening`, () => {
    const recommendation = recommend(query);
    const arranged = arrangeArchitectureAnswer(corpus, recommendation, { results: [], sentences: [], citations: [] }, query);
    assert.equal(arranged.results[0].unitId, 'c01-selection');
    assert.match(arranged.results[0].sectionTitle, definitionTitle);
    assert.equal(arranged.citations.some(item => blockedTitle.test(item.sectionTitle)), false);
    assert.ok(arranged.citations.some(item => item.unitId === '00-learning-route' && item.sectionTitle === '认识 Agent 工程'));
    assert.ok(arranged.results.findIndex(item => item.unitId === '00-learning-route') > 0);
    for (const citation of arranged.citations) {
      const unit = corpus.units.find(item => item.unitId === citation.unitId);
      const section = unit.sections.find(item => item.sectionId === citation.sectionId);
      assert.equal(section.bodyMarkdown.slice(citation.quoteStart, citation.quoteEnd), citation.quote);
      assert.equal(arranged.sentences.some(sentence => sentence.citationIds.includes(citation.id) && sentence.text === citation.quote), true);
    }
  });
}

for (const query of ['什么是 agent 架构', 'agent架构是什么']) {
  test(`${query} still opens on 认识 Agent 工程`, () => {
    const result = recommend(query);
    assert.equal(result.status, 'recommended');
    assert.equal(result.results[0].unitId, '00-learning-route');
    assert.equal(result.results[0].sectionTitle, '认识 Agent 工程');
    assert.equal(core.architectureQuery(query).overview, true);
    const arranged = arrangeArchitectureAnswer(corpus, result, { results: [], sentences: [], citations: [] }, query);
    assert.equal(arranged.citations[0].unitId, '00-learning-route');
    assert.equal(arranged.citations[0].sectionTitle, '认识 Agent 工程');
    const unit = corpus.units.find(item => item.unitId === arranged.citations[0].unitId);
    const section = unit.sections.find(item => item.sectionId === arranged.citations[0].sectionId);
    assert.equal(section.bodyMarkdown.slice(arranged.citations[0].quoteStart, arranged.citations[0].quoteEnd), arranged.citations[0].quote);
  });
}

test('全貌 and 运行闭环 keep the opening chapter first', () => {
  const overview = recommend('agent架构的全貌');
  assert.equal(overview.results[0].unitId, '00-learning-route');
  assert.equal(overview.results[0].sectionTitle, '认识 Agent 工程');
  const loop = recommend('agent架构运行闭环');
  assert.equal(loop.results[0].unitId, '00-learning-route');
  assert.match(loop.results[0].sectionTitle, /反馈闭环|运行闭环/);
});

for (const query of ['这个系统的架构是什么样的', '系统的架构']) {
  test(`${query} is bare architecture and pins selection before the opening`, () => {
    const shape = core.architectureQuery(query);
    assert.equal(shape.generic, false);
    assert.equal(shape.architecture, true);
    assert.equal(shape.overview, false);
    assert.equal(shape.multi, false);
    assert.equal(shape.bare, true);
    const result = recommend(query);
    assert.equal(result.status, 'recommended');
    assert.equal(result.results[0].unitId, 'c01-selection');
    assert.match(result.results[0].sectionTitle, definitionTitle);
    assert.equal(result.results.some(item => blockedTitle.test(item.sectionTitle)), false);
    assert.ok(result.results.some(item => item.unitId === 'c01-selection' && item.sectionTitle.startsWith('为一个任务选择最小可用方案')));
    assert.ok(result.results.some(item => /谁决定下一步/.test(item.sectionTitle)));
    const opening = result.results.find(item => item.unitId === '00-learning-route' && item.sectionTitle === '认识 Agent 工程');
    assert.ok(opening, titles(result).join(' | '));
    assert.ok(result.results.indexOf(opening) > 0);
    assert.ok(result.results.findIndex(item => item.unitId === 'c01-selection' && definitionTitle.test(item.sectionTitle)) < result.results.indexOf(opening));
    assert.deepEqual(result.interpretedIntents.slice(0, 2).map(item => item.id), ['selection', 'orientation']);
    const arranged = arrangeArchitectureAnswer(corpus, result, { results: [], sentences: [], citations: [] }, query);
    assert.equal(arranged.results[0].unitId, 'c01-selection');
    assert.match(arranged.results[0].sectionTitle, definitionTitle);
    assert.equal(arranged.citations.some(item => blockedTitle.test(item.sectionTitle)), false);
    assert.ok(arranged.citations.some(item => item.unitId === '00-learning-route' && item.sectionTitle === '认识 Agent 工程'));
    assert.ok(arranged.results.findIndex(item => item.unitId === '00-learning-route') > 0);
  });
}

test('是什么样 does not take the overview path', () => {
  const system = core.architectureQuery('这个系统的架构是什么样的');
  assert.equal(system.overview, false);
  assert.equal(system.bare, true);
  const agent = core.architectureQuery('agent架构是什么样的');
  assert.equal(agent.overview, false);
  assert.equal(agent.bare, true);
  assert.equal(core.architectureQuery('什么是 agent 架构').overview, true);
  assert.equal(core.architectureQuery('agent架构是什么').overview, true);
  assert.equal(core.architectureQuery('agent架构运行闭环').overview, true);
  const pinned = recommend('agent架构是什么样的');
  assert.equal(pinned.results[0].unitId, 'c01-selection');
  assert.match(pinned.results[0].sectionTitle, definitionTitle);
});

for (const query of ['架构', '系统架构', '信息架构', '系统 架构']) {
  test(`${query} stays no_match`, () => {
    const result = recommend(query);
    assert.equal(result.status, 'no_match');
    assert.equal(result.results.length, 0);
    assert.equal(core.architectureQuery(query).generic, true);
    assert.equal(core.architectureQuery(query).architecture, false);
    assert.equal(core.architectureQuery(query).bare, false);
    const arranged = arrangeArchitectureAnswer(corpus, result, { results: result.results, sentences: [], citations: [] }, query);
    assert.equal(arranged.citations.length, 0);
  });
}

for (const query of ['多agent架构', '多 agent 架构']) {
  test(`${query} stays on the multi-agent upgrade section`, () => {
    const result = recommend(query);
    assert.equal(result.status, 'recommended');
    assert.equal(result.results[0].unitId, 'c01-selection');
    assert.match(result.results[0].sectionTitle, /多 Agent 的升级点/);
    assert.equal(result.results.some(item => item.unitId === '00-learning-route'), false);
    assert.equal(core.architectureQuery(query).multi, true);
    assert.equal(core.architectureQuery(query).bare, false);
    const arranged = arrangeArchitectureAnswer(corpus, result, { results: [], sentences: [], citations: [] }, query);
    assert.equal(arranged.citations[0].unitId, 'c01-selection');
    assert.match(arranged.citations[0].sectionTitle, /多 Agent 的升级点/);
    assert.equal(arranged.citations.some(item => item.unitId === '00-learning-route'), false);
    const unit = corpus.units.find(item => item.unitId === arranged.citations[0].unitId);
    const section = unit.sections.find(item => item.sectionId === arranged.citations[0].sectionId);
    assert.equal(section.bodyMarkdown.slice(arranged.citations[0].quoteStart, arranged.citations[0].quoteEnd), arranged.citations[0].quote);
  });
}
