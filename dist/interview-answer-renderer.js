/* Read-only presentation of separately reviewed interview answers. No storage or network calls. */
(function () {
'use strict';
const VERSION = 'interview-answer-renderer-1.0.1';
const APPROVED = 'met_within_reviewed_scope';
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function lookup(id, expectedQuestion) {
  const pack = globalThis.RolecraftInterviewAnswersV1;
  if (!pack || pack.answerSetVersion !== 'interview-answers-v1') return null;
  const answer = pack.byId?.[id] || pack.items?.find(item => item.id === id);
  if (!answer || answer.id !== id || typeof answer.bodyMarkdown !== 'string' ||
      !/^[a-f0-9]{64}$/.test(answer.answerSha256 || '') || !answer.answerVersion ||
      (expectedQuestion && answer.question !== expectedQuestion)) return null;
  return answer;
}

function safeExternal(raw) {
  if (!/^https?:\/\//i.test(raw) || /[\u0000-\u0020\u007f\\]/.test(raw)) return '';
  try { const url = new URL(raw); return ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password ? url.href : ''; }
  catch { return ''; }
}

function textbookLink(raw, answer, options, reference = {}) {
  if (!raw || /[\u0000-\u0020\u007f\\]/.test(raw)) return '';
  let matches = (Array.isArray(answer?.sourceLinks) ? answer.sourceLinks : []).filter(item => item?.originalHref === raw);
  if (reference.label !== undefined) matches = matches.filter(item => item.label === reference.label);
  if (reference.occurrence !== undefined) matches = matches.filter(item => item.occurrence === reference.occurrence);
  // A URL alone cannot identify a section when the same file is cited more than once.
  if (!matches.length || new Set(matches.map(item => item.kind + '\n' + item.href)).size !== 1) return '';
  const link = matches[0];
  if (link.kind === 'external') return safeExternal(link.href);
  if (link.kind !== 'local_textbook' || !/^#learn\/agent\/[a-zA-Z0-9_-]+(?:\/[a-zA-Z0-9_-]+)?$/.test(link.href || '')) return '';
  return (options?.textbookBase || '') + link.href;
}

function inline(value, answer, options) {
  const parts = [], hold = html => '\u0001' + (parts.push(html) - 1) + '\u0002';
  let text = String(value).replace(/[\u0001\u0002]/g, '');
  text = text.replace(/`([^`\n]+)`/g, (_, code) => hold('<code>' + esc(code) + '</code>'));
  text = text.replace(/(!?)\[([^\]\n]*)\]\(([^\s)]+)(?:\s+"[^"]*")?\)/g, (_, image, label, raw) => {
    const href = textbookLink(raw, answer, options, {label});
    const name = label.replace(/\u0001(\d+)\u0002/g, (_, index) => parts[Number(index)]?.replace(/<[^>]*>/g, '') || '');
    if (!href) return hold('<span class="ia-unavailable-link">' + esc(name) + '（参考位置暂不可用）</span>');
    return hold('<a href="' + esc(href) + '"' + (/^https?:/.test(href) ? ' target="_blank" rel="noopener noreferrer"' : '') + '>' + esc(name || (image ? '图片来源' : href)) + '</a>');
  });
  text = esc(text).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>');
  return text.replace(/\u0001(\d+)\u0002/g, (_, index) => parts[Number(index)] || '');
}

function cells(line) {
  const result = []; let cell = '', inCode = false, escaped = false;
  const value = line.trim().replace(/^\|/, '').replace(/\|$/, '');
  for (const char of value) {
    if (escaped) { cell += char; escaped = false; continue; }
    if (char === '\\') { escaped = true; continue; }
    if (char === '`') inCode = !inCode;
    if (char === '|' && !inCode) { result.push(cell.trim()); cell = ''; } else cell += char;
  }
  if (escaped) cell += '\\';
  result.push(cell.trim()); return result;
}

function markdown(body, answer, options = {}) {
  const lines = String(body || '').replace(/\r\n?/g, '\n').split('\n'), out = [];
  let paragraph = [], code = null, language = '', fence = '', lists = [], stack = [], quote = [];
  const format = value => inline(value, answer, options);
  const flushParagraph = () => { if (paragraph.length) out.push('<p>' + paragraph.map(format).join('\n') + '</p>'); paragraph = []; };
  const listHTML = node => '<' + node.type + (node.type === 'ol' && node.start !== 1 ? ' start="' + node.start + '"' : '') + '>' + node.items.map(item => '<li>' + format(item.text) + item.children.map(listHTML).join('') + '</li>').join('') + '</' + node.type + '>';
  const flushLists = () => { if (lists.length) out.push(lists.map(listHTML).join('')); lists = []; stack = []; };
  const flushQuote = () => { if (quote.length) out.push('<blockquote>' + quote.map(format).join('<br>') + '</blockquote>'); quote = []; };
  const flush = () => { flushParagraph(); flushLists(); flushQuote(); };
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (code !== null) {
      if (new RegExp('^\\s*' + fence[0] + '{' + fence.length + ',}\\s*$').test(line)) {
        out.push('<div class="ia-code"><span>' + esc(language || '代码') + ' · 仅供阅读</span><pre tabindex="0"><code>' + esc(code.join('\n')) + '</code></pre></div>'); code = null;
      } else code.push(line);
      continue;
    }
    const opening = line.match(/^\s*(`{3,}|~{3,})(.*)$/);
    if (opening) { flush(); code = []; fence = opening[1]; language = opening[2].trim(); continue; }
    if (!line.trim()) { flush(); continue; }
    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      flush(); const level = Math.min(6, heading[1].length + (options.headingOffset ?? 2));
      out.push('<h' + level + '>' + format(heading[2]) + '</h' + level + '>'); continue;
    }
    if (line.includes('|') && /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(lines[i + 1] || '')) {
      flush(); const head = cells(line), rows = []; i += 2;
      while (i < lines.length && lines[i].trim() && lines[i].includes('|')) { rows.push(cells(lines[i])); i++; } i--;
      out.push('<div class="ia-table" tabindex="0" role="region" aria-label="参考解析表格，可横向滚动"><table><thead><tr>' + head.map(cell => '<th scope="col">' + format(cell) + '</th>').join('') + '</tr></thead><tbody>' + rows.map(row => '<tr>' + row.map(cell => '<td>' + format(cell) + '</td>').join('') + '</tr>').join('') + '</tbody></table></div>'); continue;
    }
    if (/^>\s?/.test(line)) { flushParagraph(); flushLists(); quote.push(line.replace(/^>\s?/, '')); continue; }
    flushQuote();
    const item = line.match(/^(\s*)(?:([-*+])\s+|(\d+)[.)]\s+)(.+)$/);
    if (item) {
      flushParagraph(); const indent = item[1].replace(/\t/g, '    ').length, type = item[2] ? 'ul' : 'ol';
      while (stack.length && stack.at(-1).indent > indent) stack.pop();
      let node = stack.at(-1);
      if (!node || node.indent !== indent || node.type !== type) {
        if (node?.indent === indent) stack.pop();
        const parent = stack.at(-1), siblings = parent?.items.length ? parent.items.at(-1).children : lists;
        node = {indent, type, start: Number(item[3]) || 1, items: []}; siblings.push(node); stack.push(node);
      }
      node.items.push({text: item[4], children: []}); continue;
    }
    if (/^\s*(---+|\*\*\*+)\s*$/.test(line)) { flush(); out.push('<hr>'); continue; }
    flushLists(); paragraph.push(line);
  }
  flush();
  if (code !== null) out.push('<pre tabindex="0"><code>' + esc(code.join('\n')) + '</code></pre>');
  return out.join('');
}

function answerHTML(id, options = {}) {
  const answer = lookup(id, options.question);
  if (!answer) return '<div class="ia-answer ia-unavailable" role="status">当前完整参考解析暂不可用；请稍后重新打开。</div>';
  const approved = answer.contentStatus === APPROVED;
  const status = approved ? '内容与测试已限定范围复核' : ({pending:'待当前版本复核',not_met:'当前版本未通过',insufficient:'当前版本证据不足'}[answer.contentStatus] || '当前版本尚未确认');
  const metadata = '<div class="ia-answer-meta"><span>' + esc(answer.id) + ' · ' + esc(answer.answerVersion) + '</span><strong>' + esc(status) + '</strong></div>';
  const identity = ' data-answer-id="' + esc(answer.id) + '" data-answer-version="' + esc(answer.answerVersion) + '" data-answer-sha256="' + esc(answer.answerSha256) + '" data-content-status="' + esc(answer.contentStatus) + '"';
  if (!approved) return '<section class="ia-answer"' + identity + '>' + metadata + '<p>完整解析仍在复核，本处暂不展示为已通过答案。</p></section>';
  return '<section class="ia-answer"' + identity + '>' + metadata + '<article class="ia-prose" aria-label="' + esc(answer.id + ' 完整参考解析') + '">' + markdown(answer.bodyMarkdown, answer, options) + '</article><details class="ia-binding"><summary>答案版本与审核范围</summary><p>全文按当前答案版本展示。文稿与有限测试不等于真人专家认可、个人经历证据或职业能力认证。</p><p>SHA256：<code>' + esc(answer.answerSha256) + '</code></p></details></section>';
}

globalThis.RolecraftInterviewAnswerRenderer = Object.freeze({version:VERSION, lookup, markdown, answerHTML, textbookLink});
})();
