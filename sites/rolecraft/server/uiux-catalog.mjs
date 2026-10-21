import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const CONTENT_VERSION = 'uiux-design-v02';
const TEXTBOOK_VERSION_ID = 'uiux-design-v02';
const INDEX_VERSION = 'content-retrieval-uiux-design-v02';
const CAREER_ID = 'uiux-product-designer';
const V02_ROOT = ['textbooks', 'uiux-design-v02'];
const V03_ROOT = ['textbooks', 'uiux-design-v03'];
const VA_FILES = [
  ['va01-visual-perception', 'VA01-visual-perception.md'],
  ['va02-composition-rhythm', 'VA02-composition-rhythm.md'],
  ['va03-visual-language-system', 'VA03-visual-language-system.md'],
  ['va04-polish-motion-delivery', 'VA04-polish-motion-delivery.md'],
];

const sha256 = value => createHash('sha256').update(value).digest('hex');

function readBytes(projectDir, relativePath) {
  const root = path.resolve(projectDir);
  const filename = path.resolve(root, relativePath);
  if (!filename.startsWith(root + path.sep)) throw Error('UIUX source escaped project directory');
  return readFileSync(filename);
}

function titlesFrom(markdown, fallback) {
  const h1 = (markdown.match(/^#\s+(.+)$/m) || [, fallback])[1].trim();
  const visual = /^(VA\d+)\s+(.+)$/.exec(h1);
  if (visual) {
    const short = visual[2].split(/[：:]/)[0].trim();
    return { title: visual[2], navigationLabel: `${visual[1]} · ${short}` };
  }
  const numbered = /^\d+\s+(.+)$/.exec(h1);
  const title = numbered ? numbered[1] : h1;
  return { title, navigationLabel: title };
}

function splitSections(markdown) {
  const lines = markdown.split('\n');
  const sections = [];
  let preamble = [];
  let current = null;
  const push = () => { if (current) sections.push(current); };
  for (const line of lines) {
    const heading = /^(#{2,3})\s+(.+)$/.exec(line);
    if (!heading) {
      if (current) current.lines.push(line);
      else preamble.push(line);
      continue;
    }
    push();
    current = { title: heading[2].trim(), level: heading[1].length, lines: [line] };
  }
  push();
  if (!sections.length) sections.push({ title: '正文', level: 2, lines: lines });
  else if (preamble.some(line => line.trim())) sections[0].lines = [...preamble, ...sections[0].lines];
  return sections.map((section, index) => ({
    sectionId: `s-${String(index + 1).padStart(2, '0')}`,
    title: section.title,
    level: section.level,
    bodyMarkdown: section.lines.join('\n'),
  }));
}

function unitFromFile(projectDir, relativePath, unitId, order) {
  const bytes = readBytes(projectDir, relativePath);
  const current = sha256(bytes);
  const bodyMarkdown = bytes.toString('utf8');
  const titles = titlesFrom(bodyMarkdown, unitId);
  return {
    unitId,
    order,
    ...titles,
    sourcePath: relativePath.split(path.sep).join('/'),
    sourceSha256: current,
    bodyMarkdown,
    sections: splitSections(bodyMarkdown),
    prerequisiteUnitIds: [],
  };
}

function manifestChapters(projectDir) {
  const manifestPath = path.join(...V02_ROOT, 'assembly-manifest.json');
  const manifest = JSON.parse(readBytes(projectDir, manifestPath).toString('utf8'));
  if (!Array.isArray(manifest.chapters) || manifest.chapters.length !== 24) throw Error('UIUX assembly manifest must list 24 chapters');
  return { manifest, manifestPath, chapters: manifest.chapters };
}

function chapterUnit(projectDir, chapter, order) {
  const relativePath = path.join(...V02_ROOT, chapter.source);
  const unit = unitFromFile(projectDir, relativePath, path.basename(chapter.source, '.md'), order);
  const declared = typeof chapter.source_sha256 === 'string' ? chapter.source_sha256 : '';
  return { unit, declared, relativePath: unit.sourcePath };
}

export function loadUiuxCareer(projectDir) {
  const built = assemble(projectDir);
  const bookPath = path.join(...V02_ROOT, 'uiux-design-textbook.md');
  const bookSha256 = sha256(readBytes(projectDir, bookPath));
  return {
    meta: {
      careerId: CAREER_ID,
      slug: CAREER_ID,
      title: 'UI/UX 产品设计师',
      summary: '围绕问题证据、任务流、状态契约、设计系统、AI体验和跨团队交付的 UI/UX 产品设计学习空间。',
      status: 'published',
      contentVersion: CONTENT_VERSION,
      indexVersion: INDEX_VERSION,
      textbookId: 'uiux-design',
      textbookVersionId: TEXTBOOK_VERSION_ID,
      corpusHash: built.corpusHash,
      bookSha256,
      keywords: ['uiux', 'ux', '界面', '交互', '信息架构', '设计系统', '产品设计师'],
      semanticExamples: ['学习界面状态、任务流和设计系统如何交接', '把模糊的产品要求写成可核对的交互决定'],
    },
    corpus: built.corpus,
  };
}

function assemble(projectDir) {
  const { chapters } = manifestChapters(projectDir);
  const visualUnits = VA_FILES.map(([unitId, filename], index) => unitFromFile(projectDir, path.join(...V03_ROOT, filename), unitId, index + 1));
  const integrity = [];
  const chapterUnits = chapters.map((chapter, index) => {
    const loaded = chapterUnit(projectDir, chapter, visualUnits.length + index + 1);
    const matches = loaded.declared === loaded.unit.sourceSha256;
    integrity.push({
      unitId: loaded.unit.unitId,
      source: chapter.source,
      manifest: loaded.declared,
      current: loaded.unit.sourceSha256,
      matches,
      availability: matches ? 'available' : 'stale',
    });
    return { ...loaded.unit, availability: matches ? 'available' : 'stale' };
  });
  const units = [...visualUnits.map(unit => ({ ...unit, availability: 'available' })), ...chapterUnits];
  const mismatches = integrity.filter(item => !item.matches);
  const corpusHash = sha256(JSON.stringify(units.map(unit => [unit.unitId, unit.sourceSha256])));
  const sourceBinding = {
    matchesManifest: mismatches.length === 0,
    assemblyManifest: path.join(...V02_ROOT, 'assembly-manifest.json').split(path.sep).join('/'),
    contentVersion: CONTENT_VERSION,
    chapterSourceIntegrity: integrity,
    chapterSourceHashMismatches: mismatches,
  };
  return {
    corpusHash,
    corpus: {
      corpusVersion: CONTENT_VERSION,
      textbookVersionId: TEXTBOOK_VERSION_ID,
      indexVersion: INDEX_VERSION,
      corpusHash,
      matchesManifest: sourceBinding.matchesManifest,
      sourceBinding,
      units,
    },
  };
}

export function presentUiuxCatalog(projectDir) {
  const { corpus } = assemble(projectDir);
  return {
    corpusVersion: corpus.corpusVersion,
    textbookVersionId: corpus.textbookVersionId,
    indexVersion: corpus.indexVersion,
    corpusHash: corpus.corpusHash,
    matchesManifest: corpus.matchesManifest,
    sourceBinding: corpus.sourceBinding,
    units: corpus.units.map(unit => ({
      unitId: unit.unitId,
      order: unit.order,
      title: unit.title,
      navigationLabel: unit.navigationLabel,
      sourcePath: unit.sourcePath,
      sourceSha256: unit.availability === 'available' ? unit.sourceSha256 : null,
      availability: unit.availability,
      prerequisiteUnitIds: unit.prerequisiteUnitIds,
      sections: unit.availability === 'available'
        ? unit.sections.map(({ sectionId, title, level }) => ({ sectionId, title, level }))
        : [],
    })),
  };
}

export function uiuxChapter(projectDir, unitId) {
  const { corpus } = assemble(projectDir);
  const unit = corpus.units.find(item => item.unitId === unitId);
  if (!unit) return null;
  if (unit.availability !== 'available') return { stale: true, unitId: unit.unitId, availability: 'stale' };
  return { corpusVersion: corpus.corpusVersion, corpusHash: corpus.corpusHash, unit };
}

function cjkRuns(text) {
  return text.normalize('NFKC').match(/[\u3400-\u9fff]{2,}/g) || [];
}

function latinWords(text) {
  const normalized = text.normalize('NFKC');
  return [...normalized.matchAll(/[A-Za-z][A-Za-z0-9-]{2,}/g)]
    .filter(match => !/[A-Za-z0-9_]/.test(normalized[match.index - 1] || '') && !/[A-Za-z0-9_]/.test(normalized[match.index + match[0].length] || ''))
    .map(match => match[0].toLowerCase());
}

function hasWholeWord(text, word) {
  const pattern = new RegExp(`(?<![A-Za-z0-9_])${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![A-Za-z0-9_])`, 'i');
  return pattern.test(text);
}

function phraseWindows(run) {
  const windows = [];
  if (run.length < 4) return windows;
  for (let size = 4; size <= Math.min(run.length, 12); size += 1) {
    for (let index = 0; index <= run.length - size; index += 1) windows.push(run.slice(index, index + size));
  }
  return windows;
}

function excerptAround(body, needle) {
  const at = body.indexOf(needle);
  if (at < 0) return '';
  const start = Math.max(0, at - 24);
  const end = Math.min(body.length, at + needle.length + 80);
  return body.slice(start, end);
}

export function queryUiuxLearning(projectDir, query) {
  const { corpus } = assemble(projectDir);
  const available = corpus.units.filter(unit => unit.availability === 'available' && unit.bodyMarkdown);
  const runs = cjkRuns(query);
  const words = [...new Set(latinWords(query))].filter(word => word.length >= 4);
  const windows = [...new Set(runs.flatMap(phraseWindows))];
  const hits = [];
  for (const unit of available) {
    for (const section of unit.sections) {
      const haystack = `${section.title}\n${section.bodyMarkdown}`;
      const phrases = windows.filter(window => haystack.includes(window));
      const terms = words.filter(word => hasWholeWord(haystack, word));
      const strong = phrases.length > 0 || terms.length >= 2;
      if (!strong) continue;
      const needle = phrases.sort((a, b) => b.length - a.length)[0] || terms[0];
      const evidenceExcerpt = excerptAround(section.bodyMarkdown || haystack, needle) || excerptAround(haystack, needle);
      if (!evidenceExcerpt || !haystack.includes(evidenceExcerpt)) continue;
      hits.push({
        unit,
        section,
        evidenceExcerpt,
        matchedSourceTerms: [...new Set([...phrases.filter(item => item.length >= 4).slice(0, 3), ...terms])].slice(0, 4),
      });
    }
  }
  hits.sort((a, b) => b.matchedSourceTerms.join('').length - a.matchedSourceTerms.join('').length);
  const picked = [];
  for (const hit of hits) {
    if (picked.some(item => item.unit.unitId === hit.unit.unitId && item.section.sectionId === hit.section.sectionId)) continue;
    picked.push(hit);
    if (picked.length === 3) break;
  }
  if (!picked.length) {
    return {
      status: 'no_match',
      providerCalled: false,
      engineMode: 'local_lexical_retrieval',
      results: [],
      limitations: ['问题与当前 UI/UX 教材没有足够的连续原文重叠。单个短词或子串不会当成推荐。未调用外部模型。'],
    };
  }
  return {
    status: 'recommended',
    providerCalled: false,
    engineMode: 'local_lexical_retrieval',
    limitations: ['结果摘自当前 UI/UX 教材原文。未调用外部模型，也不表示练习通过或职业结论。'],
    results: picked.map(hit => ({
      unitId: hit.unit.unitId,
      sectionId: hit.section.sectionId,
      order: hit.unit.order,
      unitTitle: hit.unit.title,
      sectionTitle: hit.section.title,
      title: hit.section.title,
      reason: '查询里的连续原文短语能在这一节核对。',
      evidenceExcerpt: hit.evidenceExcerpt,
      sourcePath: hit.unit.sourcePath,
      sourceSha256: hit.unit.sourceSha256,
      version: CONTENT_VERSION,
      href: `#learn/career/${CAREER_ID}/${hit.unit.unitId}/${hit.section.sectionId}`,
      matchingBasis: 'source_term',
      matchedSourceTerms: hit.matchedSourceTerms,
    })),
  };
}

export const UIUX_CAREER_ID = CAREER_ID;
export const UIUX_CONTENT_VERSION = CONTENT_VERSION;
