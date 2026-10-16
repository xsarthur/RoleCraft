// Build a separate, exact-text answer package. This never edits editorial sources,
// legacy quote evidence, client code, review records, or user data.
import {readFileSync, writeFileSync, existsSync, realpathSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';

const here = path.dirname(fileURLToPath(import.meta.url));
const project = path.resolve(here, '../..');
const repository = path.resolve(project, '../..');
const answerRoot = 'sites/rolecraft/textbooks/interview-answers-v1';
const sha256 = value => createHash('sha256').update(value).digest('hex');
const json = value => JSON.stringify(value, null, 2) + '\n';
const args = process.argv.slice(2);
const final = args.includes('--final');
const inputBindings = new Map();
const cache = new Map();
function read(relative) {
  const absolute = realpathSync(path.resolve(repository, relative));
  if (!absolute.startsWith(repository + path.sep)) throw Error('Input escaped repository: ' + relative);
  const canonical = path.relative(repository, absolute).split(path.sep).join('/');
  if (!cache.has(canonical)) {
    const raw = readFileSync(absolute);
    cache.set(canonical, raw);
    inputBindings.set(canonical, {path: canonical, sha256: sha256(raw), bytes: raw.length});
  }
  return cache.get(canonical);
}
const readJson = relative => JSON.parse(read(relative).toString('utf8'));
read('sites/rolecraft/server/retrieval/build-interview-answers-v1.mjs');
const productPath = 'sites/rolecraft/team/agent-interview-answer-revision-product.json';
const product = readJson(productPath);
read('sites/rolecraft/team/agent-interview-answer-revision-curriculum.json');
const version = product.answerSetVersion;
if (version !== 'interview-answers-v1' || product.items.length !== 124) throw Error('Unexpected product contract');
const corpusPath = 'sites/rolecraft/server/retrieval/content-v12-index.json';
const corpus = readJson(corpusPath);
const authorPaths = ['a', 'b', 'c'].map(group => `${answerRoot}/author-${group}.json`);
const authorItems = new Map();
for (const authorPath of authorPaths) {
  const author = readJson(authorPath);
  if (author.answerSetVersion !== version) throw Error('Author version differs: ' + authorPath);
  if (JSON.stringify(author.assignedIds.slice().sort()) !== JSON.stringify(author.items.map(item => item.id).sort())) throw Error('Author assigned IDs differ');
  for (const item of author.items) {
    if (authorItems.has(item.id)) throw Error('Duplicate author ID: ' + item.id);
    authorItems.set(item.id, {...item, author: author.author, authorManifestPath: authorPath});
  }
}
if (authorItems.size !== 124) throw Error('Author denominator differs');

// Only independent content decisions enter this package. UI integration QA must
// bind the finished package from outside, avoiding a package/report hash cycle.
const reports = {review: [], qa: []};
function addReport(kind, reportPath) {
  const report = readJson(reportPath);
  const rows = Array.isArray(report.items) ? report.items : report.id ? [report] : null;
  if (!rows) throw Error('Independent report lacks item identities: ' + reportPath);
  reports[kind].push({path: reportPath, sha256: sha256(read(reportPath)), report, rows});
}
for (const group of ['a', 'b']) addReport('review', `sites/rolecraft/team/agent-interview-answer-revision-content-${group}.json`);
addReport('qa', 'sites/rolecraft/team/agent-interview-answer-revision-qa/content-round1.json');
const conventionalRetests = [
  ['review', 'sites/rolecraft/team/agent-interview-answer-revision-content-b/retest-q99.json'],
  ['qa', 'sites/rolecraft/team/agent-interview-answer-revision-qa/retest-q99.json'],
];
for (const [kind, reportPath] of conventionalRetests) if (existsSync(path.join(repository, reportPath))) addReport(kind, reportPath);
for (let index = 0; index < args.length; index++) {
  if (['--review', '--qa'].includes(args[index])) {
    const kind = args[index].slice(2), reportPath = args[++index];
    if (!reportPath) throw Error('Missing extra independent report');
    if (!reports[kind].some(report => report.path === reportPath)) addReport(kind, reportPath);
  } else if (args[index] !== '--final' && args[index] !== '--candidate') throw Error('Unknown argument: ' + args[index]);
}
const statuses = new Set(['met_within_reviewed_scope', 'not_met', 'insufficient', 'pending']);
function bindDecisions(kind, item) {
  const references = [];
  for (const report of reports[kind]) {
    report.rows.forEach((row, index) => {
      if (row.id !== item.id) return;
      const status = row.qaContentStatus ?? row.decision ?? row.status;
      if (!statuses.has(status)) throw Error('Unsupported independent item decision: ' + item.id + ' ' + status);
      const matches = row.answerSha256 === item.answerSha256 && row.answerVersion === item.answerVersion;
      references.push({
        path: report.path, reportSha256: report.sha256,
        jsonPointer: Array.isArray(report.report.items) ? `/items/${index}` : '',
        id: row.id, answerVersion: row.answerVersion, answerSha256: row.answerSha256,
        reportedStatus: status, matchesCurrentAnswer: matches,
        scope: row.scope ?? report.report.scope ?? report.report.method ?? null,
        limitations: row.limits ?? row.limitations ?? row.executionLimits ?? report.report.limitations ?? report.report.limits ?? null,
      });
    });
  }
  const effective = references.filter(reference => reference.matchesCurrentAnswer).at(-1);
  return {status: effective?.reportedStatus ?? 'pending', references, effectiveReference: effective ?? null};
}
function normalizeTitle(text) {return text.replace(/[\s\p{P}\p{S}]/gu, '').toLowerCase();}
function makeSourceReference(source) {
  const raw = read(source.path);
  if (sha256(raw) !== source.sha256) throw Error('Source hash differs: ' + source.path);
  const lines = raw.toString('utf8').split('\n');
  if (!Number.isInteger(source.startLine) || !Number.isInteger(source.endLine) || source.startLine < 1 || source.endLine < source.startLine || source.endLine > lines.length) throw Error('Source line range differs: ' + source.path);
  const sourcePath = source.path.replace(/^sites\/rolecraft\//, '');
  const unit = corpus.units.find(unit => unit.sourcePath === sourcePath);
  if (!unit || unit.sourceSha256 !== source.sha256) throw Error('Reading corpus source differs: ' + source.path);
  const exact = unit.sections.find(section => normalizeTitle(section.title) === normalizeTitle(source.section));
  // A source subsection may be below the corpus H1-H3 indexing depth; in that
  // case locate the containing indexed section by its verified starting line.
  const containing = unit.sections.filter(section => section.startLine <= source.startLine).at(-1);
  const section = exact ?? containing;
  return {sourcePath: source.path, corpusSourcePath: sourcePath, sha256: source.sha256, section: source.section,
    startLine: source.startLine, endLine: source.endLine,
    readingHref: section?.href ?? unit.href, readingTargetKind: exact ? 'matching_heading' : section ? 'containing_section' : 'unit',
    unitId: unit.unitId, sectionId: section?.sectionId ?? null};
}
// Preserve each citation and its label: a document path does not identify a
// section. Offsets refer to the exact source string (UTF-16, as used by JS).
function markdownLinks(body) {
  const links = [];
  let offset = 0, fence = null;
  for (const lineWithEnding of body.match(/[^\n]*\n|[^\n]+$/g) ?? []) {
    const line = lineWithEnding.replace(/\r?\n$/, '');
    if (fence) {
      if (new RegExp('^\\s*' + fence[0] + '{' + fence.length + ',}\\s*$').test(line)) fence = null;
      offset += lineWithEnding.length; continue;
    }
    const opening = line.match(/^\s*(`{3,}|~{3,})(.*)$/);
    if (opening) {fence = opening[1]; offset += lineWithEnding.length; continue;}
    const masked = line.replace(/`[^`\n]+`/g, code => ' '.repeat(code.length));
    for (const match of masked.matchAll(/(!?)\[([^\]\n]*)\]\(([^\s)]+)(?:\s+"[^"]*")?\)/g)) {
      const sourceOffset = offset + match.index;
      links.push({label: match[2], originalHref: match[3], occurrence: links.length + 1,
        sourceOffset, sourceEndOffset: sourceOffset + match[0].length,
        sourceLine: body.slice(0, sourceOffset).split('\n').length});
    }
    offset += lineWithEnding.length;
  }
  return links;
}
function citationReference(link, candidates, itemId) {
  const label = normalizeTitle(link.label);
  const fullHeading = text => normalizeTitle(text.replace(/^\d+(?:\.\d+)*\s+/, ''));
  let method = 'full_heading';
  let matches = candidates.filter(source => label.includes(normalizeTitle(source.section)) || label.includes(fullHeading(source.section)));
  if (!matches.length) {
    const sectionNumber = link.label.match(/(?:第)?(\d+(?:\.\d+)*)\s*节/);
    if (sectionNumber) {
      matches = candidates.filter(source => source.section.match(/^(\d+(?:\.\d+)*)\s+/)?.[1] === sectionNumber[1]);
      method = 'explicit_section_number';
    }
  }
  if (!matches.length) {
    // A parenthetical named subtopic may be cited without the full heading.
    // Require its complete token, not edit distance or a partial-word guess.
    matches = candidates.filter(source => [...source.section.matchAll(/[（(]([^）)]+)[）)]/g)]
      .flatMap(match => match[1].split(/[、，,;；/]|与|和/))
      .map(normalizeTitle).some(topic => topic.length >= 4 && label.endsWith(topic)));
    method = 'parenthetical_named_subtopic';
  }
  const targets = new Set(matches.map(source => source.readingHref));
  if (targets.size !== 1) throw Error(`Citation cannot resolve uniquely: ${itemId} occurrence ${link.occurrence} [${link.label}] (${link.originalHref}); ${targets.size} targets`);
  return {matches, method};
}
const items = product.items.map(identity => {
  const authored = authorItems.get(identity.id);
  if (!authored) throw Error('Missing answer: ' + identity.id);
  for (const key of ['collection', 'sourceId', 'question', 'answerPath', 'personalEvidenceRequired']) {
    if (authored[key] !== identity[key]) throw Error(`Identity differs: ${identity.id}.${key}`);
  }
  const answerPath = `${answerRoot}/${authored.answerPath}`;
  const raw = read(answerPath), bodyMarkdown = raw.toString('utf8');
  if (sha256(raw) !== authored.answerSha256) throw Error('Answer hash differs: ' + identity.id);
  if (!new RegExp(`^# ${identity.id}(?:\\s|｜|$)`).test(bodyMarkdown) || !bodyMarkdown.includes(identity.question)) throw Error('Full question identity differs: ' + identity.id);
  const followups = authored.followups ?? [];
  if (JSON.stringify(followups) !== JSON.stringify(identity.followups ?? [])) throw Error('Followups differ: ' + identity.id);
  for (const followup of followups) if (!bodyMarkdown.includes(followup)) throw Error('Followup missing from text: ' + identity.id);
  const sourceReferences = authored.sourceBindings.map(makeSourceReference);
  const externalSources = authored.externalSources ?? [];
  let localOccurrence = 0;
  const sourceLinks = markdownLinks(bodyMarkdown).map(link => {
    const {originalHref} = link;
    if (/^https:\/\//.test(originalHref)) {
      const parsed = new URL(originalHref);
      if (parsed.username || parsed.password || !externalSources.some(source => source.url === originalHref)) throw Error('External link lacks explicit source binding: ' + identity.id + ' ' + originalHref);
      return {...link, kind: 'external', href: originalHref};
    }
    const resolved = path.posix.normalize(path.posix.join(path.posix.dirname(answerPath), originalHref));
    const candidates = sourceReferences.filter(source => source.sourcePath === resolved);
    if (!candidates.length) throw Error('Local link lacks source binding: ' + identity.id + ' ' + originalHref);
    const {matches, method} = citationReference(link, candidates, identity.id);
    const matching = matches[0];
    return {...link, localOccurrence: ++localOccurrence, kind: 'local_textbook', href: matching.readingHref,
      sourcePath: matching.sourcePath, sourceReferenceIndexes: matches.map(source => sourceReferences.indexOf(source)),
      section: matching.section, sectionId: matching.sectionId, resolutionMethod: method};
  });
  const item = {...authored, answerPath, followups, bodyMarkdown, sourceReferences, sourceLinks, externalSources};
  // Author self-check state remains documentary metadata; it cannot approve.
  const review = bindDecisions('review', item), qa = bindDecisions('qa', item);
  const joined = [review.status, qa.status];
  const contentStatus = joined.includes('not_met') ? 'not_met' : joined.includes('insufficient') ? 'insufficient' : joined.every(status => status === 'met_within_reviewed_scope') ? 'met_within_reviewed_scope' : 'pending';
  return {...item, reviewStatus: review.status, qaStatus: qa.status, contentStatus,
    reviewReferences: review.references, qaReferences: qa.references,
    effectiveReviewReference: review.effectiveReference, effectiveQaReference: qa.effectiveReference,
    displayStatus: 'pending_independent_integration_qa'};
});
const collectionSpecs = [['fixed100', '固定题组', 100], ['market14', '市场补充题组', 14], ['prototype10', '原型题组', 10]];
const countStates = values => Object.fromEntries([...statuses].map(status => [status, values.filter(item => item.contentStatus === status).length]));
const collections = collectionSpecs.map(([id, label, expected]) => {
  const rows = items.filter(item => item.collection === id);
  if (rows.length !== expected) throw Error('Collection denominator differs: ' + id);
  return {id, label, count: expected, ids: rows.map(item => item.id), counts: countStates(rows)};
});
const counts = countStates(items);
const contentStatus = counts.met_within_reviewed_scope === 124 ? 'met_within_reviewed_scope' : counts.not_met ? 'not_met' : counts.insufficient ? 'insufficient' : 'pending';
if (final && contentStatus !== 'met_within_reviewed_scope') throw Error('Final build blocked: all 124 exact versions need content review and content QA');
const answerSetSha256 = sha256(JSON.stringify(items.map(item => [item.id, item.answerVersion, item.answerSha256])));
const packageData = {
  schemaVersion: 1, linkSchemaVersion: 2, answerSetVersion: version, buildMode: final ? 'final' : 'candidate', answerSetSha256,
  contentStatus, counts, collections, prototypeMap: Object.fromEntries(items.filter(item => item.collection === 'prototype10').map(item => [item.sourceId, item.id])),
  scope: '独立内容审校与内容QA只对绑定的当前答案字节有效；展示验收另由集成QA记录。真人、专家、职业胜任与完整产品结论不由此导出。',
  completeProductStatus: 'not_met', displayStatus: 'pending_independent_integration_qa',
  sourceBinding: {productPath, productSha256: sha256(read(productPath)), corpusPath, corpusSha256: sha256(read(corpusPath))},
  items,
};
// Script embedding remains inert data, even if future editorial text contains
// HTML/script-looking strings. Consumers must still render Markdown safely.
const encoded = JSON.stringify(packageData).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
const scriptText = `/* Generated exact-text answer package. Do not edit. */\nglobalThis.RolecraftInterviewAnswersV1=${encoded};\nObject.defineProperty(globalThis.RolecraftInterviewAnswersV1,'byId',{value:Object.fromEntries(globalThis.RolecraftInterviewAnswersV1.items.map(item=>[item.id,item])),enumerable:true});\n`;
const stateLabel = {met_within_reviewed_scope: '正文限定范围通过', not_met: '正文未通过', insufficient: '正文证据不足', pending: '当前正文待复验'};
const readme = `# Agent 面试完整参考解析 v1\n\n共124题：固定100题、市场补充14题、原型10题，三个集合分别保留。当前构建：${packageData.buildMode}；${stateLabel[contentStatus]}。\n\n[阅读全部答案](agent-interview-answers.md) · [版本与逐题证据清单](manifest.json)\n\n正文由三位教材研发员编写，元信息及当前独立结论由构建脚本按版本和SHA256绑定。通过仅指正文审校与内容验证范围；应用展示结论由独立集成验收报告单列。真实经历题提供答题框架及明确标注示例，不代替学习者经历。完整培养与行业先进目标仍为not_met。\n\n${collections.map(collection => `## ${collection.label}（${collection.count}题）\n\n| 题号 | 完整题面 | 当前正文状态 |\n| --- | --- | --- |\n${items.filter(item => item.collection === collection.id).map(item => `| [${item.id}](answers/${item.id}.md) | ${item.question.replace(/\|/g, '\\|')} | ${stateLabel[item.contentStatus]} |`).join('\n')}`).join('\n\n')}\n\n## 版本说明\n\n答案集身份摘要：\`${answerSetSha256}\`。逐题源文件保持原样；合订本仅增加目录、题号锚点、版本/状态标注，并将相对来源链接从逐题目录重新定位到合订本目录。派生数据中的bodyMarkdown保留源文件完整UTF-8文本，无摘要或定长截断。历史失败记录保留在独立报告，manifest同时保留旧、新报告指针及是否匹配当前字节。\n`;
const combinedHeader = `# Agent 面试完整参考解析 v1\n\n本书忠实汇集124份独立答案。当前正文状态：${stateLabel[contentStatus]}；应用展示及真实使用效果另行验证。各题源文件、版本和独立证据见[清单](manifest.json)，按题查阅见[目录](README.md)。\n\n${collections.map(collection => `## ${collection.label}（${collection.count}题）\n\n${items.filter(item => item.collection === collection.id).map(item => `[${item.id}](#${item.id})`).join(' · ')}`).join('\n\n')}\n\n---\n\n`;
function relocateForBook(body) {
  return body.replace(/(\]\()([^\s)]+)(\))/g, (all, before, target, after) => {
    if (/^(?:https?:|#)/.test(target)) return all;
    const resolved = path.posix.normalize(path.posix.join(answerRoot, 'answers', target));
    return before + path.posix.relative(answerRoot, resolved) + after;
  });
}
const combined = combinedHeader + items.map(item => `<a id="${item.id}"></a>\n\n版本：${item.answerVersion}；状态：${stateLabel[item.contentStatus]}；[逐题源文件](answers/${item.id}.md)。\n\n${relocateForBook(item.bodyMarkdown)}\n\n---\n\n`).join('');
const manifest = {...packageData, items: items.map(({bodyMarkdown, ...item}) => item), inputBindings: [...inputBindings.values()]};
const outputs = new Map([
  [`${answerRoot}/README.md`, readme],
  [`${answerRoot}/agent-interview-answers.md`, combined],
  [`${answerRoot}/manifest.json`, json(manifest)],
  ['sites/rolecraft/dist/interview-answers-v1-data.js', scriptText],
]);
// Verify the read set has not changed during construction before publishing the
// four local derived files. Mutated inputs require a new build/review binding.
for (const [inputPath, binding] of inputBindings) if (sha256(readFileSync(path.join(repository, inputPath))) !== binding.sha256) throw Error('Input changed during build: ' + inputPath);
for (const [outputPath, text] of outputs) writeFileSync(path.join(repository, outputPath), text);
const buildRecord = {
  schemaVersion: 1, version: 'agent-interview-answer-revision-data-2', owner: '内容检索工程师',
  answerSetVersion: version, buildMode: packageData.buildMode, answerSetSha256, counts, collections,
  contentStatus, completeProductStatus: 'not_met', displayStatus: packageData.displayStatus,
  inputBindings: [...inputBindings.values()],
  outputBindings: [...outputs].map(([outputPath, text]) => ({path: outputPath, sha256: sha256(text), bytes: Buffer.byteLength(text)})),
  selfCheck: {exactMarkdownCount: items.length, identityAndFollowupCount: items.length, localSourceBindingCount: items.reduce((n, item) => n + item.sourceBindings.length, 0),
    linkOccurrenceCount: items.reduce((n, item) => n + item.sourceLinks.length, 0), localLinkOccurrenceCount: items.reduce((n, item) => n + item.sourceLinks.filter(link => link.kind === 'local_textbook').length, 0),
    currentDualApprovedCount: counts.met_within_reviewed_scope, allSourceHashAndLineChecks: true, allCurrentAnswerHashesMatchAuthors: true,
    oldEvidenceFilesWritten: 0, editorialFilesWritten: 0, clientFilesWritten: 0, modelCalls: 0, externalBusinessCalls: 0,
    note: '本岗构建自查，不是内容审校、独立QA、浏览器验证或实际教材代码运行。'},
};
writeFileSync(path.join(project, 'team/agent-interview-answer-revision-data.json'), json(buildRecord));
console.log(JSON.stringify({buildMode: packageData.buildMode, answerSetSha256, counts, outputs: buildRecord.outputBindings}));
