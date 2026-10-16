import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, realpathSync } from 'node:fs';
import path from 'node:path';

const sha256 = value => createHash('sha256').update(value).digest('hex');
const idPattern = /^[a-z0-9][a-z0-9-]{0,127}$/;
const allowedStatus = new Set(['preparing', 'published', 'retired']);

function invalid(message) {
  const error = new Error(message);
  error.code = 'career_import_invalid';
  return error;
}

function text(value, field, max = 4000, required = true) {
  if (value == null && !required) return '';
  if (typeof value !== 'string' || value.length > max || (required && !value.trim())) throw invalid(`${field} 格式无效`);
  return value.trim();
}

function validateUnit(unit) {
  if (!unit || typeof unit !== 'object' || !idPattern.test(unit.unitId || '')) throw invalid('教材单元 ID 无效');
  text(unit.title, 'unit.title', 300);
  text(unit.bodyMarkdown, 'unit.bodyMarkdown', 2_000_000);
  if (unit.sourceSha256 !== sha256(unit.bodyMarkdown)) throw invalid(`单元 ${unit.unitId} 原文 hash 不匹配`);
  if (!Array.isArray(unit.sections) || !unit.sections.length) throw invalid(`单元 ${unit.unitId} 缺少小节`);
  const sectionIds = new Set();
  for (const section of unit.sections) {
    if (!section || typeof section !== 'object' || !idPattern.test(section.sectionId || '')) throw invalid(`单元 ${unit.unitId} 小节 ID 无效`);
    if (sectionIds.has(section.sectionId)) throw invalid(`单元 ${unit.unitId} 小节 ID 重复`);
    sectionIds.add(section.sectionId);
    text(section.title, 'section.title', 300);
    text(section.bodyMarkdown, 'section.bodyMarkdown', 2_000_000);
    if (section.sourceSha256 && section.sourceSha256 !== sha256(section.bodyMarkdown)) throw invalid(`小节 ${section.sectionId} 原文 hash 不匹配`);
  }
  return unit;
}

export function validateImportedCorpus(corpus, meta) {
  if (!corpus || typeof corpus !== 'object' || corpus.corpusVersion !== meta.contentVersion || !Array.isArray(corpus.units) || !corpus.units.length) throw invalid('职业教材必须包含匹配版本的 units');
  const ids = new Set();
  for (const unit of corpus.units) {
    validateUnit(unit);
    if (ids.has(unit.unitId)) throw invalid(`教材单元 ID 重复：${unit.unitId}`);
    ids.add(unit.unitId);
  }
  const expectedCorpusHash = sha256(JSON.stringify(corpus.units.map(unit => [unit.unitId, unit.sourceSha256])));
  if (corpus.corpusHash !== expectedCorpusHash) throw invalid('教材 corpusHash 不匹配');
  if (meta.corpusHash && meta.corpusHash !== corpus.corpusHash) throw invalid('职业 corpusHash 与教材不匹配');
  return corpus;
}

function safeImportPath(importDir, relativePath) {
  if (typeof relativePath !== 'string' || !relativePath || path.isAbsolute(relativePath)) throw invalid('教材文件路径必须为导入目录内的相对路径');
  const resolved = path.resolve(importDir, relativePath);
  let real;
  try { real = realpathSync(resolved); } catch { throw invalid('教材文件不存在'); }
  const root = realpathSync(importDir);
  if (!real.startsWith(root + path.sep)) throw invalid('教材文件路径越过导入目录');
  return real;
}

function validateMeta(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw invalid('职业导入文件必须为 JSON 对象');
  const careerId = text(raw.careerId, 'careerId', 128);
  const slug = text(raw.slug || careerId, 'slug', 128);
  if (!idPattern.test(careerId) || !idPattern.test(slug)) throw invalid('careerId/slug 只能使用小写字母、数字和短横线');
  const status = text(raw.status || 'preparing', 'status', 32);
  if (!allowedStatus.has(status)) throw invalid('职业状态无效');
  const contentVersion = text(raw.contentVersion, 'contentVersion', 128);
  const indexVersion = text(raw.indexVersion || `content-retrieval-${contentVersion}`, 'indexVersion', 200);
  const textbookId = text(raw.textbookId || careerId, 'textbookId', 128);
  const textbookVersionId = text(raw.textbookVersionId || `${textbookId}-${contentVersion}`, 'textbookVersionId', 200);
  const corpusHash = raw.corpusHash == null ? '' : text(raw.corpusHash, 'corpusHash', 128);
  const bookSha256 = raw.bookSha256 == null ? '' : text(raw.bookSha256, 'bookSha256', 128);
  const keywords = Array.isArray(raw.keywords) ? raw.keywords.map((item) => text(item, 'keywords', 80)).slice(0, 80) : [];
  const semanticExamples = Array.isArray(raw.semanticExamples) ? raw.semanticExamples.map((item) => text(item, 'semanticExamples', 600)).slice(0, 20) : [];
  if (raw.keywords != null && !Array.isArray(raw.keywords)) throw invalid('keywords 必须为数组');
  if (raw.semanticExamples != null && !Array.isArray(raw.semanticExamples)) throw invalid('semanticExamples 必须为数组');
  return {
    careerId, slug, title: text(raw.title, 'title', 300), summary: text(raw.summary || '', 'summary', 2000, false), status,
    contentVersion, indexVersion, textbookId, textbookVersionId, corpusHash, bookSha256, keywords, semanticExamples,
  };
}

/**
 * Read data-layer career imports. Client code never writes these files. Each JSON
 * file contains metadata and a corpusPath relative to this directory; custom
 * corpus files are hash-checked before they become available to the API.
 */
export function loadCareerImports(importDir) {
  if (!existsSync(importDir)) return [];
  const root = realpathSync(importDir);
  const entries = [];
  const files=readdirSync(root).filter(file => file.endsWith('.json')).sort();
  if(files.length>1000) throw invalid('职业导入目录不能超过1000个 JSON 文件');
  for (const name of files) {
    const filename = safeImportPath(root, name);
    let raw;
    try { raw = JSON.parse(readFileSync(filename, 'utf8')); } catch (error) { throw invalid(`职业导入文件 ${name} 不是有效 JSON`); }
    // A directory may also contain corpusPath targets. Those have a corpusVersion
    // and units; any other object is expected to be a catalog record.
    if (raw?.careerId == null) {
      if(raw?.corpusVersion && Array.isArray(raw.units)) continue;
      throw invalid(`职业导入文件 ${name} 缺少 careerId`);
    }
    const meta = validateMeta(raw);
    let corpus = null;
    if (raw.corpusPath != null) {
      const corpusFile = safeImportPath(root, raw.corpusPath);
      try { corpus = validateImportedCorpus(JSON.parse(readFileSync(corpusFile, 'utf8')), meta); } catch (error) {
        if (error?.code === 'career_import_invalid') throw error;
        throw invalid(`职业 ${meta.careerId} 教材无法读取`);
      }
    } else if (meta.contentVersion !== 'textbook-v12') {
      throw invalid(`职业 ${meta.careerId} 缺少当前 textbook-v12 的 corpusPath`);
    }
    entries.push({ ...meta, corpus, importFile: name });
    if(entries.length>500) throw invalid('职业导入记录不能超过500项');
  }
  const ids = new Set();
  const slugs = new Set();
  for (const item of entries) {
    if (ids.has(item.careerId)) throw invalid(`职业 ID 重复：${item.careerId}`);
    if (slugs.has(item.slug)) throw invalid(`职业 slug 重复：${item.slug}`);
    ids.add(item.careerId);
    slugs.add(item.slug);
  }
  return entries;
}

export { sha256 };
