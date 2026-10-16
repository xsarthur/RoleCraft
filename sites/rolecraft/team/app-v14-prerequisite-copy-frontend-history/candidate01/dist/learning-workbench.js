/* Client-only learning workspace. Public textbook data and recommendations are supplied by the retrieval owner. */
(function () {
  'use strict';
  const VERSION = 'local-workbench-0.14-dialog-detail';
  const CURRENT = 'textbook-v12', HISTORICAL = 'textbook-v10';
  const STORE = 'rolecraft-reading-v13', PREVIOUS_STORE = 'rolecraft-learning-v12', OLD_STORE = 'rolecraft-learning-v11';
  const SESSION = 'rolecraft-content-dialog-v14', OLD_SESSION = 'rolecraft-content-query-v11';
  const STARTS = { beginner: '零基础', developer: '已有编程基础', practitioner: '已有 Agent 项目经验' };
  const STAGES = [
    { title: '起点与问题', output: '基础诊断、问题档案、允许结果和风险边界', ids: ['00-learning-route', '01-foundation', 'n01-python-model-foundations', 'p01-discovery', '02-task-acceptance', '03-trust-boundary'] },
    { title: '程序与模型边界', output: '可判错的读取适配器、经结构和业务校验的候选、上下文与记忆', ids: ['f01', 'f02', 'n02-context-memory-prompt'] },
    { title: '选型与组件', output: '最小方案决定、证据包、写工具合同、工具接入和持久账本', ids: ['c01-selection', 'c01-control-primer', 'c02', 'c03', 'n04-tools-mcp', 'e01'] },
    { title: '固定与动态流程', output: '完整固定流程、动态控制循环与规划，再按需要组织检索、图和协作', ids: ['c01-fixed-workflow', 'c01-control-loop', 'n03-planning-reflection', 'n05-retrieval-ingestion', 'n06-graph-orchestration', 'n07-multiagent-a2a'] },
    { title: '评价与产品决定', output: '同条件版本比较、跨场景验证、MVP 契约、安全与沙箱、运行交付和任务账目', ids: ['e02', 'n10-evaluation-projects', 'p01-mvp', 'e03', 'n08-sandbox-security', 'e04', 'e05', 'n09-runtime-delivery'] },
    { title: '交付与迭代', output: '可复现作品、独立判定、原问题复验和未知任务', ids: ['p02'] }
  ];
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const asText = (value, n = 12000) => typeof value === 'string' ? value.slice(0, n) : '';
  const empty = () => ({ corpusVersion: CURRENT, startingPoint: null, visits: [], bookmarks: [], notes: {}, project: { title: '', problem: '', evidence: '', result: '', gap: '', next: '' } });
  let local = empty(), storageError = '', activeView = '', assistantOpen = false, query = '', response = null, submission = null, pending = false, requestId = 0, controller = null;
  let historicalRaw = null, historical = null, oldQueryPresent = false, queryHistory = [];
  let contextEnabled = true, startingEnabled = true, composing = false, trigger = null, activeReadingUnitId = '', activeReadingVersion = '';
  let dialogTopic = null, historicalResponse = false, assistantScroll = 0;
  const memoryScroll = new Map();
  try {
    const raw = localStorage.getItem(STORE) || localStorage.getItem(PREVIOUS_STORE);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.corpusVersion !== CURRENT) throw Error('Record version mismatch');
      local.startingPoint = Object.hasOwn(STARTS, parsed.startingPoint) ? parsed.startingPoint : null;
      local.visits = Array.isArray(parsed.visits) ? parsed.visits.filter(v => v && typeof v.unitId === 'string' && typeof v.at === 'string').slice(-200) : [];
      local.bookmarks = Array.isArray(parsed.bookmarks) ? parsed.bookmarks.filter(v => v && typeof v.unitId === 'string' && typeof v.sectionId === 'string').slice(0, 200) : [];
      local.notes = parsed.notes && typeof parsed.notes === 'object' && !Array.isArray(parsed.notes) ? parsed.notes : {};
      if (parsed.project && typeof parsed.project === 'object') for (const k of Object.keys(local.project)) local.project[k] = asText(parsed.project[k]);
    }
  } catch { storageError = '读取本浏览器学习记录失败。新输入仍可留在页面并导出。'; }
  try { historicalRaw = localStorage.getItem(OLD_STORE); historical = historicalRaw ? JSON.parse(historicalRaw) : null; } catch { /* Original historical bytes remain available for export. */ }
  try { oldQueryPresent = sessionStorage.getItem(OLD_SESSION) !== null || sessionStorage.getItem('rolecraft-content-query-v12') !== null; } catch { /* Old query cache is never imported. */ }
  function corpus(version = CURRENT) {
    const c = version === CURRENT ? globalThis.RolecraftContentV12 : version === HISTORICAL ? globalThis.RolecraftContentV10 : null, count = version === CURRENT ? 30 : 20;
    if (!c || c.corpusVersion !== version || !Array.isArray(c.units) || c.units.length !== count || new Set(c.units.map(u => u.unitId)).size !== count || c.units.some((u, i) => u.order !== i + 1 || !u.bodyMarkdown || !Array.isArray(u.sections))) return null;
    return c;
  }
  function unit(id, version = CURRENT) { return corpus(version)?.units.find(u => u.unitId === id); }
  function unitVersion(u) { return u?.sourcePath?.startsWith('textbooks/v10/') ? HISTORICAL : CURRENT; }
  function section(u, id) { return u?.sections.find(s => s.sectionId === id); }
  function currentRecord(v) { return v?.corpusVersion === CURRENT && v.corpusHash === corpus()?.corpusHash && unit(v.unitId)?.sourceSha256 === v.sourceSha256 && (!v.sectionId || section(unit(v.unitId), v.sectionId)); }
  function noteText(u) { const n = local.notes[u?.unitId]; return n?.corpusVersion === CURRENT && n.sourceSha256 === u?.sourceSha256 ? asText(n.text) : ''; }
  function loc() {
    const [path, search = ''] = location.hash.slice(1).split('?'), p = path.split('/'), requestedVersion = new URLSearchParams(search).get('version');
    return { unitId: p[0] === 'learn' && p[1] === 'agent' ? p[2] || '' : '', sectionId: p[0] === 'learn' && p[1] === 'agent' ? p[3] || '' : '', version: requestedVersion || CURRENT };
  }
  function href(u, s = '') { return '#learn/agent/' + u.unitId + (s ? '/' + s : '') + (unitVersion(u) === HISTORICAL ? '?version=' + HISTORICAL : ''); }
  function save() {
    try { localStorage.setItem(STORE, JSON.stringify(local)); storageError = ''; return true; }
    catch { storageError = '浏览器无法保存。输入还在当前页面；关闭前可导出学习记录。'; return false; }
  }
  function notify(message) {
    const node = document.getElementById('lw-status');
    if (node) node.textContent = message;
    else if (typeof toast === 'function') toast(message);
  }
  function asset(name, version = CURRENT) {
    const a = corpus(version)?.assets?.find(a => a.name === name);
    if (!a) return '';
    return location.protocol === 'file:' ? a.staticHref : a.href || a.staticHref;
  }
  function slug(value) { return value.toLowerCase().replace(/[^\p{L}\p{N}\s_-]/gu, '').trim().replace(/\s+/g, '-'); }
  function resolveLink(raw, current, image = false) {
    let value;
    try { value = decodeURIComponent(raw); } catch { value = raw; }
    if (/^(https?:)\/\//i.test(value)) return image ? '' : value;
    if (/^(javascript|data|file|vbscript):/i.test(value) || value.startsWith('//')) return '';
    const version = unitVersion(current), c = corpus(version);
    if (value.startsWith('assets/')) return asset(value.split('/').pop(), version);
    if (image) return '';
    if (value.startsWith('#')) {
      const target = current.sections.find(s => slug(s.title) === value.slice(1) || s.title === value.slice(1) || s.sectionId === value.slice(1));
      return target ? href(current, target.sectionId) : '';
    }
    const parts = value.split('#'), name = parts[0].split('/').pop();
    const resolvedPath = new URL(value, 'https://local.invalid/' + current.sourcePath).pathname.slice(1);
    const publicReference = c?.references?.find(r => r.sourcePath === resolvedPath || r.sourcePath === value);
    if (publicReference) return location.protocol === 'file:' ? publicReference.staticHref : publicReference.href || publicReference.staticHref;
    if (value === 'README.md' || value === 'agent-engineering-textbook.md') return '#learn';
    const u = c?.units.find(u => u.sourcePath === resolvedPath.split('#')[0]);
    if (u) {
      const s = parts[1] ? u.sections.find(s => slug(s.title) === parts[1] || s.title === parts[1]) : null;
      return !parts[1] || s ? href(u, s?.sectionId) : '';
    }
    const reference = c?.references?.find(r => r.name === name && !value.includes('/'));
    return reference ? (location.protocol === 'file:' ? reference.staticHref : reference.href || reference.staticHref) : '';
  }
  function inline(text, u) {
    const values = [], token = html => '\u0001' + (values.push(html) - 1) + '\u0002';
    // Text is always escaped; only code, emphasis and whitelisted public links gain markup.
    let t = String(text).replace(/`([^`\n]+)`/g, (_, content) => token('<code>' + esc(content) + '</code>'));
    t = t.replace(/(!?)\[([^\]\n]*)\]\(([^\s)]+)(?:\s+"[^"]*")?\)/g, (_, img, label, raw) => {
      const url = resolveLink(raw, u, !!img);
      if (!url) return token('<span class="lw-unavailable-link">' + esc(label) + ' <small>（参考位置暂未提供）</small></span>');
      if (img) return token('<figure class="lw-figure"><button type="button" data-lw-image="' + esc(url) + '" data-lw-alt="' + esc(label) + '" aria-label="放大查看：' + esc(label) + '"><img src="' + esc(url) + '" alt="' + esc(label) + '" loading="lazy"></button><figcaption><button type="button" data-lw-image="' + esc(url) + '" data-lw-alt="' + esc(label) + '">放大查看</button></figcaption></figure>');
      return token('<a href="' + esc(url) + '"' + (/^https?:/.test(url) ? ' target="_blank" rel="noopener noreferrer"' : '') + '>' + esc(label) + '</a>');
    });
    t = esc(t).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>');
    return t.replace(/\u0001(\d+)\u0002/g, (_, i) => values[Number(i)] || '');
  }
  function markdown(u) {
    const lines = u.bodyMarkdown.replace(/\r\n?/g, '\n').split('\n'), out = [], byLine = new Map(u.sections.map(s => [s.startLine, s]));
    let para = [], code = null, lang = '', list = [], listStack = [], quote = [];
    const flushPara = () => { if (para.length) { out.push('<p>' + para.map(l => inline(l, u)).join('\n') + '</p>'); para = []; } };
    const listHTML = node => '<' + node.type + (node.type === 'ol' && node.start !== 1 ? ' start="' + node.start + '"' : '') + '>' + node.items.map(item => '<li>' + inline(item.text, u) + item.children.map(listHTML).join('') + '</li>').join('') + '</' + node.type + '>';
    const flushList = () => { if (list.length) out.push(list.map(listHTML).join('')); list = []; listStack = []; };
    const appendListItem = (indent, type, text, start) => {
      while (listStack.length && listStack.at(-1).indent > indent) listStack.pop();
      let node = listStack.at(-1);
      if (!node || node.indent !== indent || node.type !== type) {
        if (node?.indent === indent) listStack.pop();
        const parent = listStack.at(-1), siblings = parent && parent.items.length ? parent.items.at(-1).children : list;
        node = { indent, type, start, items: [] }; siblings.push(node); listStack.push(node);
      }
      node.items.push({ text, children: [] });
    };
    const flushQuote = () => { if (quote.length) { out.push('<blockquote>' + quote.map(l => inline(l, u)).join('<br>') + '</blockquote>'); quote = []; } };
    const flush = () => { flushPara(); flushList(); flushQuote(); };
    const cells = l => l.trim().replace(/^\|/, '').replace(/\|$/, '').split(/(?<!\\)\|/).map(c => c.trim().replace(/\\\|/g, '|'));
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (code !== null) { if (/^\s*```\s*$/.test(line)) { out.push('<div class="lw-code"><span>' + esc(lang || '代码') + ' · 网页不执行代码</span><pre tabindex="0"><code>' + esc(code.join('\n')) + '</code></pre></div>'); code = null; } else code.push(line); continue; }
      const fence = line.match(/^\s*```([^`]*)$/);
      if (fence) { flush(); code = []; lang = fence[1].trim(); continue; }
      if (!line.trim()) { flush(); continue; }
      const h = line.match(/^(#{1,6})\s+(.+)$/);
      if (h) { flush(); const s = byLine.get(i + 1), id = s?.sectionId || ''; out.push('<h' + h[1].length + ' id="' + esc(id) + '" tabindex="-1">' + inline(h[2], u) + '</h' + h[1].length + '>'); continue; }
      if (line.includes('|') && /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(lines[i + 1] || '')) {
        flush(); const head = cells(line), rows = []; i += 2;
        while (i < lines.length && lines[i].trim() && lines[i].includes('|')) { rows.push(cells(lines[i])); i++; } i--;
        out.push('<div class="lw-table" tabindex="0" role="region" aria-label="教材表格，可横向滚动"><table><thead><tr>' + head.map(c => '<th scope="col">' + inline(c, u) + '</th>').join('') + '</tr></thead><tbody>' + rows.map(r => '<tr>' + head.map((_, j) => '<td>' + inline(r[j] || '', u) + '</td>').join('') + '</tr>').join('') + '</tbody></table></div>'); continue;
      }
      if (/^>\s?/.test(line)) { flushPara(); flushList(); quote.push(line.replace(/^>\s?/, '')); continue; }
      flushQuote();
      const item = line.match(/^(\s*)(?:([-*+])\s+|(\d+)[.)]\s+)(.+)$/);
      if (item) { flushPara(); appendListItem(item[1].replace(/\t/g, '    ').length, item[2] ? 'ul' : 'ol', item[4], Number(item[3]) || 1); continue; }
      if (/^\s*(---+|\*\*\*+)\s*$/.test(line)) { flush(); out.push('<hr>'); continue; }
      flushList(); para.push(line);
    }
    flush(); if (code !== null) out.push('<pre tabindex="0"><code>' + esc(code.join('\n')) + '</code></pre>');
    return out.join('');
  }
  const heading = (label, name, desc) => '<div class="lw-page-head"><span class="lw-kicker">' + label + '</span><h1 tabindex="-1">' + name + '</h1><p>' + desc + '</p></div>';
  function errorPage(message) { return heading('教材阅读', '教材资源暂不可用', esc(message)) + '<button class="outline" data-lw-reload>重新加载</button><a class="outline" href="#home">返回工作台</a>'; }
  function startSelect() {
    return '<div class="lw-start"><label for="lw-starting-point">我的学习起点</label><select id="lw-starting-point"><option value="">尚未选择</option>' + Object.entries(STARTS).map(([id, label]) => '<option value="' + id + '"' + (local.startingPoint === id ? ' selected' : '') + '>' + label + '</option>').join('') + '</select><span>自选起点，诊断需实际完成</span></div>';
  }
  function unitLink(u, klass = '') { return '<a class="' + klass + '" href="' + href(u) + '"><span class="lw-num">' + String(u.order).padStart(2, '0') + '</span><span>' + esc(u.navigationLabel) + '</span></a>'; }
  function catalog() {
    return '<div class="lw-catalog">' + corpus().units.map(u => '<details class="lw-unit"><summary><span class="lw-num">' + String(u.order).padStart(2, '0') + '</span><span><strong>' + esc(u.navigationLabel) + '</strong><small>' + esc(u.title) + '</small></span><span class="lw-chevron">＋</span></summary><div class="lw-unit-detail"><a class="primary" href="' + href(u) + '">阅读本篇 →</a><ul>' + u.sections.filter(s => s.level > 1).map(s => '<li><a href="' + href(u, s.sectionId) + '">' + esc(s.title) + '</a></li>').join('') + '</ul></div></details>').join('') + '</div>';
  }
  function stages() {
    return '<div class="lw-stages">' + STAGES.map((st, i) => '<section class="lw-stage"><div class="lw-stage-number">' + String(i + 1).padStart(2, '0') + '</div><div><h2>' + st.title + '</h2><p>' + st.output + '</p><div class="lw-stage-links">' + st.ids.map(id => unitLink(unit(id))).join('') + '</div></div></section>').join('') + '</div>';
  }
  function homePage(routeOnly = false) {
    if (!corpus()) return errorPage('当前 v12 教材包没有完整加载；不会用历史教材替代。');
    const latest = local.visits.filter(currentRecord).at(-1), first = corpus().units[0];
    const graphSection = first.sections.find(s => s.title === '一套可交付系统还需要哪些工程工作');
    const showCatalog = location.hash === '#learn' || location.hash === '#learn/agent';
    return '<div class="lw-home">' + heading('职业学习 · Agent 工程', 'Agent 开发者', '读懂一个系统怎样工作，再用实际作品验证你的想法。') + startSelect() + '<div class="lw-entry"><div><h2>' + (latest ? '继续上次阅读' : '从认识 Agent 工程开始') + '</h2><p>' + (latest ? esc(unit(latest.unitId).navigationLabel) + ' · 只记录阅读位置' : '先了解它解决什么问题，再找到自己的学习路径。') + '</p></div><a class="primary" href="' + (latest ? href(unit(latest.unitId), latest.sectionId || '') : href(first)) + '">' + (latest ? '继续阅读' : '开始阅读') + ' →</a></div>' + (local.startingPoint === 'beginner' ? '<div class="lw-route-hint">零基础起步：先读开篇，再做<a href="' + href(unit('01-foundation'), unit('01-foundation').sections.find(s => s.title === '先做入口诊断')?.sectionId) + '">基础诊断</a>，按实际缺项补学。</div>' : local.startingPoint ? '<div class="lw-route-hint">已有基础：可直接查具体问题。正式先修保留在各篇说明中，不锁住阅读。</div>' : '') + '<div class="lw-tabs" aria-label="教材浏览方式"><a href="#path"' + (!showCatalog ? ' aria-current="page"' : '') + '>学习路线</a><a href="#learn"' + (showCatalog ? ' aria-current="page"' : '') + '>课程目录 <small>30 篇</small></a></div>' + (showCatalog ? catalog() : stages()) + (!routeOnly && !showCatalog ? '<section class="lw-panorama"><div><span class="lw-kicker">先看全貌</span><h2>Agent 工程不止是一次模型调用</h2><p>从问题、组件到验证与交付，找到章节所处的环节。组件按需求采用，图中分组不替代正式阅读顺序。</p><a href="' + href(first, graphSection?.sectionId) + '">查看工程全景与章节位置 →</a></div><button type="button" data-lw-image="' + esc(asset('agent-engineering-landscape-v12.png')) + '" data-lw-alt="Agent工程全景与30篇章节位置"><img src="' + esc(asset('agent-engineering-landscape-v12.png')) + '" alt="Agent工程全景与30篇章节位置" loading="lazy"><span>放大工程全景</span></button></section>' : '') + '</div>';
  }
  function readerPage() {
    const location = loc(), c = corpus(location.version);
    if (!c) return errorPage('请求的教材版本没有完整加载。当前版本为 v12，历史版为 v10；不会替换为其他来源。');
    if (!location.unitId) return homePage(true);
    const u = unit(location.unitId, location.version); if (!u) return errorPage('请求的章节不属于所选教材版本。');
    const historicalReading = location.version === HISTORICAL, s = section(u, location.sectionId), index = c.units.indexOf(u);
    const bookmark = !historicalReading && local.bookmarks.some(b => currentRecord(b) && b.unitId === u.unitId && b.sectionId === (s?.sectionId || ''));
    const oldUnit = unit(location.unitId, HISTORICAL), oldSection = section(oldUnit, location.sectionId), currentUnit = unit(location.unitId);
    const missingLocation = location.sectionId && !s ? '<div class="lw-message" role="alert">这处教材位置在所选版本中不可用；不会换成另一小节。可<a href="' + href(u) + '">打开本章</a>' + (!historicalReading && oldSection ? '，或<a href="' + href(oldUnit, oldSection.sectionId) + '">查看 v10 的原位置：' + esc(oldSection.title) + '</a>' : '') + '。</div>' : '';
    const prerequisites = Array.isArray(u.prerequisiteUnitIds) ? u.prerequisiteUnitIds.map(id => unit(id, location.version)) : null;
    if (!prerequisites || prerequisites.some(p => !p)) return errorPage('本篇前置章节来源无法核对，请重新加载教材。');
    const prereqLabel = prerequisites.length ? '需掌握的前置 · ' + prerequisites.length + ' 篇' : '需掌握的前置：无';
    const priorHTML = '<aside class="lw-prerequisites" id="lw-prerequisites" aria-labelledby="lw-prereq-title"><h2 id="lw-prereq-title" tabindex="-1">需掌握的前置</h2>' + (prerequisites.length ? '<ul>' + prerequisites.map(p => '<li><a href="' + esc(href(p)) + '">' + esc(p.navigationLabel) + '</a></li>').join('') + '</ul>' : '<p>无前置章节</p>') + '</aside>';
    const noteArea = historicalReading ? '<section class="lw-note-area"><h2>历史阅读 · 教材 v10</h2><p>旧笔记和足迹保持原来源，当前只读，不写入 v12 学习记录。</p>' + (asText(historical?.notes?.[u.unitId]).trim() ? '<p class="lw-user-text">' + esc(asText(historical.notes[u.unitId])) + '</p>' : '<p>此篇没有保留的 v10 笔记。</p>') + '<a class="outline" href="#records">查看与导出历史记录</a>' + (currentUnit ? '<a class="primary" href="' + href(currentUnit) + '">阅读 v12 当前篇 →</a>' : '') + '</section>' : '<section class="lw-note-area"><h2>我的阅读笔记</h2><p>只保存在此浏览器，记录本篇疑问与实际尝试。</p><label for="lw-note">本篇笔记</label><textarea id="lw-note" rows="5" maxlength="12000">' + esc(noteText(u)) + '</textarea><button class="primary" data-lw-save-note>保存笔记</button></section>';
    return '<div class="lw-reader-layout lw-detail"><div class="lw-reader-top" id="lw-reader-start" tabindex="-1"><a href="#learn">← 返回课程</a><span>' + esc(u.navigationLabel) + '</span></div>' + (historicalReading ? '<div class="lw-history-notice"><strong>历史教材 v10</strong><p>此页保留旧来源与位置，当前只读。</p>' + (currentUnit ? '<a href="' + href(currentUnit) + '">查看 v12 对应篇 →</a>' : '') + '</div>' : '') + missingLocation + '<div class="lw-prereq-strip" id="lw-prereq-strip"><span>' + esc(prereqLabel) + '</span>' + (prerequisites.length ? '<button type="button" data-lw-prereq-location aria-label="查看需掌握的前置章节">查看章节</button>' : '') + '</div><div class="lw-reader-columns">' + priorHTML + '<div class="lw-reading"><details class="lw-section-toc"><summary>本篇小节</summary><ul>' + u.sections.filter(s => s.level > 1).map(s => '<li class="lw-level-' + s.level + '"><a href="' + href(u, s.sectionId) + '">' + esc(s.title) + '</a></li>').join('') + '</ul></details><article class="lw-prose" aria-label="' + esc(u.title) + '">' + markdown(u) + '</article><div class="lw-reader-tools">' + (!historicalReading ? '<button class="outline" data-lw-bookmark>' + (bookmark ? '已收藏此位置 · 取消' : '收藏当前阅读位置') + '</button>' : '') + '<button class="outline" data-lw-copy>复制定位链接</button><button class="outline" data-lw-download="' + esc(u.unitId) + '" data-lw-version="' + esc(location.version) + '">下载本篇 Markdown</button></div>' + noteArea + '<nav class="lw-pagination" aria-label="相邻篇章">' + (index > 0 ? '<a href="' + href(c.units[index - 1]) + '">← 上一篇<br><strong>' + esc(c.units[index - 1].navigationLabel) + '</strong></a>' : '<a href="#learn">返回课程</a>') + (index < c.units.length - 1 ? '<a href="' + href(c.units[index + 1]) + '">下一篇 →<br><strong>' + esc(c.units[index + 1].navigationLabel) + '</strong></a>' : '<a href="#projects">带着作品复盘 →</a>') + '</nav></div></div></div>';
  }
  function projectsPage() {
    if (!corpus()) return errorPage('项目章节指引尚未加载。');
    const labels = { title: '我的项目名称', problem: '要解决的真实问题', evidence: '用户、现有方案与比较证据', result: '已取得的实际结果与作品位置', gap: '未达标准的部分与原因', next: '下一步、责任人与复验方法' };
    return heading('实作与作品', '项目工坊', '把所学落到同一个真实问题。这里保存你的自述材料，不自动判定作品通过。') + '<div class="lw-project-layout"><section class="lw-project-form"><h2>我的项目档案</h2><p>记录保存在此浏览器，链接仅保存文字，不自动访问或运行。</p>' + Object.entries(labels).map(([id, label]) => '<label for="lw-project-' + id + '">' + label + '</label>' + (id === 'title' ? '<input id="lw-project-' + id + '" data-lw-project="' + id + '" maxlength="12000" value="' + esc(local.project[id]) + '">' : '<textarea id="lw-project-' + id + '" data-lw-project="' + id + '" rows="4" maxlength="12000">' + esc(local.project[id]) + '</textarea>')).join('') + '<button class="primary" data-lw-save-project>保存项目档案</button><button class="outline" data-lw-export>导出记录</button><p class="lw-small">自述资料 · 未独立评价 · 行业先进性未验证</p></section><aside class="lw-project-guide"><h2>按教材推进实作</h2>' + STAGES.map(st => '<section><h3>' + st.title + '</h3><p>' + st.output + '</p>' + st.ids.map(id => unitLink(unit(id))).join('') + '</section>').join('') + '<a href="#product-review">进入产品达标复盘 →</a><a href="#projects-history">查看历史项目记录 →</a></aside></div>';
  }
  function historicalRecordsHTML() {
    if (!historicalRaw) return '<section class="lw-record-section"><h2>历史 v10 学习记录</h2><p>此浏览器没有保留的 v11 工作台记录。更早的档案、测验与项目可在更多工具查看。</p></section>';
    const recordLink = v => {
      const u = unit(v?.unitId, HISTORICAL), sec = section(u, v?.sectionId);
      return u ? '<a href="' + href(u, sec?.sectionId || '') + '">' + esc(u.navigationLabel) + (sec ? ' · ' + esc(sec.title) : v?.sectionId ? ' · 原位置已失效，可看历史章首' : '') + '</a>' : esc(v?.unitId || '位置未知');
    };
    const visits = Array.isArray(historical?.visits) ? historical.visits : [], bookmarks = Array.isArray(historical?.bookmarks) ? historical.bookmarks : [];
    const notes = historical?.notes && typeof historical.notes === 'object' && !Array.isArray(historical.notes) ? historical.notes : {};
    const project = historical?.project && typeof historical.project === 'object' && !Array.isArray(historical.project) ? historical.project : {};
    return '<section class="lw-record-section"><h2>历史 v10 学习记录 · 只读保留</h2><p>来源：原 v11 工作台。旧字段没有单独版本时，按原存储来源注明为 v10；不会转写成 v12 笔记、足迹或能力证据。导出包含原始记录。</p>' + (!historical ? '<p role="alert">历史记录无法解析，原始数据仍可导出。</p>' : '') + '<details><summary>旧收藏 · ' + bookmarks.length + ' 条</summary><ul>' + bookmarks.map(v => '<li>' + recordLink(v) + '</li>').join('') + '</ul></details><details><summary>旧阅读足迹 · ' + visits.length + ' 条</summary><ul>' + visits.slice(-20).reverse().map(v => '<li>' + recordLink(v) + ' · ' + esc(v?.at) + '</li>').join('') + '</ul></details><h3>旧阅读笔记</h3>' + Object.entries(notes).filter(([, text]) => asText(text).trim()).map(([id, text]) => '<details><summary>' + esc(unit(id, HISTORICAL)?.navigationLabel || id) + ' · v10</summary><p class="lw-user-text">' + esc(asText(text)) + '</p>' + (unit(id, HISTORICAL) ? '<a href="' + href(unit(id, HISTORICAL)) + '">查看历史正文 →</a>' : '') + '</details>').join('') + '<details><summary>旧项目自述 · 未独立评价</summary>' + Object.entries(project).map(([key, text]) => '<p><strong>' + esc(key) + '：</strong><span class="lw-user-text">' + esc(asText(text)) + '</span></p>').join('') + '</details></section>';
  }
  function recordsPage() {
    if (!corpus()) return errorPage('教材版本未加载，无法核对记录中的阅读位置。');
    const visits = local.visits.filter(currentRecord).slice(-20).reverse(), bookmarks = local.bookmarks.filter(currentRecord);
    const link = v => '<a href="' + href(unit(v.unitId), v.sectionId) + '">' + esc(unit(v.unitId).navigationLabel) + (v.sectionId ? ' · ' + esc(section(unit(v.unitId), v.sectionId)?.title) : '') + '</a>';
    return heading('本浏览器的足迹', '学习记录', '当前教材 v12。阅读、收藏和笔记不换算成完成率或能力等级；历史记录保留原版身份。') + '<div class="lw-record-toolbar"><button class="outline" data-lw-export>导出当前与历史学习记录</button><a href="#reflections">打开学习与员工复盘 →</a></div><section class="lw-record-section"><h2>v12 收藏的位置</h2>' + (bookmarks.length ? '<ul>' + bookmarks.map(v => '<li>' + link(v) + '</li>').join('') + '</ul>' : '<p>还没有新版收藏。阅读时可以收藏当前章或小节。</p>') + '</section><section class="lw-record-section"><h2>v12 最近阅读</h2>' + (visits.length ? '<ul>' + visits.map(v => '<li>' + link(v) + '<time>' + esc(new Date(v.at).toLocaleString('zh-CN')) + '</time></li>').join('') + '</ul>' : '<p>还没有打开过新版教材正文。</p>') + '</section><section class="lw-record-section"><h2>v12 阅读笔记</h2>' + corpus().units.filter(u => noteText(u).trim()).map(u => '<details><summary>' + esc(u.navigationLabel) + '</summary><p class="lw-user-text">' + esc(noteText(u)) + '</p><a href="' + href(u) + '">回到本篇</a></details>').join('') + '</section>' + historicalRecordsHTML() + '<p class="lw-small">保存范围：本浏览器、各自来源。未同步账户。更早的档案、测验、项目与复盘仍在更多工具中保留。</p>';
  }
  function canonicalTopic(value) {
    if (!value || value.corpusVersion !== CURRENT) return null;
    const u = unit(value.unitId), s = section(u, value.sectionId);
    if (!u || !s || value.sourceSha256 !== u.sourceSha256) return null;
    const prose = s.bodyMarkdown.replace(/```[^\n]*\n[\s\S]*?```/g, '').replace(/!\[[^\]]*\]\([^)]*\)/g, '').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/`([^`]+)`/g, '$1');
    if (value.focusTerm != null && (typeof value.focusTerm !== 'string' || !/^[-A-Za-z0-9]{2,40}$/.test(value.focusTerm) || !prose.toLowerCase().includes(value.focusTerm.toLowerCase()))) return null;
    return { unitId: u.unitId, sectionId: s.sectionId, corpusVersion: CURRENT, sourceSha256: u.sourceSha256, ...(value.focusTerm ? {focusTerm:value.focusTerm} : {}) };
  }
  function currentContext() {
    const l = loc(), related = globalThis.LearningExperienceV13?.queryContext?.(), u = activeView === 'learn' && l.version === CURRENT ? unit(l.unitId) : unit(related?.unitId);
    const c = { startingPoint: startingEnabled ? (globalThis.LearningExperienceV13?.startingPoint?.() ?? local.startingPoint) : null, currentUnitId: contextEnabled && u ? u.unitId : null, currentSectionId: contextEnabled && u ? section(u, activeView === 'learn' ? l.sectionId : related?.sectionId)?.sectionId || null : null, corpusVersion: CURRENT };
    const topic = canonicalTopic(dialogTopic); if (topic) c.previousContext = topic;
    return c;
  }
  function modeLabel(r) {
    if (r?.dialog?.answerMode === 'extractive' && /semantic/.test(r?.engineMode || '')) return '教材原文提取 · 离线语义检索';
    if (/semantic|embedding/.test(r?.engineMode || '')) return '离线语义检索 · 查询留在本机';
    if (/concept|rule/.test(r?.engineMode || '')) return '当前使用规则检索';
    return '依据当前教材';
  }
  function resultHTML() {
    if (pending) return '<p class="lw-find-message">正在理解问题并查教材，可收起继续学习…</p>';
    if (!response) return '<div class="lw-find-empty"><h3>把学习或项目问题说出来</h3><p>根据 v12 教材简答，并提供对应章节入口。职业知识以外的问题会被过滤。</p><div class="lw-examples"><button data-lw-example="ReAct是什么">ReAct 是什么</button><button data-lw-example="程序改了一版，怎么判断效果真的变好了">怎样比较改动后的效果</button></div></div>';
    const d = response.dialog || {}, status = d.status || response.status;
    const head = '<div class="lw-result-meta">' + (historicalResponse ? '<p class="lw-small">本会话此前问题' + (status === 'answered' ? ' · 已重新核对当前教材出处' : '') + '</p>' : '') + '<p><strong>已提交问题：</strong>' + esc(submission?.query || query) + '</p><span class="lw-mode">' + esc(modeLabel(response)) + '</span></div>';
    if (status === 'unavailable') return head + '<div class="lw-message"><h3>暂时无法完成这次问答</h3><p>' + esc(d.message || response.message || response.error?.message || '教材问答资源没有就绪。你仍可通过目录阅读。') + '</p><button class="outline" data-lw-retry>重试本题</button><a href="#learn">打开课程目录</a></div>';
    if (status === 'invalid_input') return head + '<div class="lw-message"><h3>请检查输入</h3><p>' + esc(d.message || response.message || '请输入 1—1200 字的问题描述。') + '</p></div>';
    if (status === 'unrelated') return head + '<div class="lw-message"><h3>这次问题已过滤</h3><p>' + esc(d.message || '这里只回答 Agent 职业学习相关问题。请换一个学习或项目问题。') + '</p></div>';
    if (status === 'related_uncovered') return head + '<div class="lw-message"><h3>当前教材未找到足够依据回答这个职业问题</h3><p>' + esc(d.message || '可以补充问题背景，或从目录查看教材覆盖范围。') + '</p><a href="#learn">打开课程目录 →</a></div>';
    if (status === 'needs_clarification') {
      const c = response.clarification || {}, options = Array.isArray(c.options) ? c.options : [];
      return head + '<div class="lw-message"><h3>请补充你指的含义</h3><p>' + esc(d.message || (typeof c === 'string' ? c : c.question || c.message) || '你想解决哪一类职业问题？') + '</p><div class="lw-clarifications">' + options.slice(0, 3).map((o, i) => '<button class="outline" data-lw-clarify="' + i + '">' + esc(typeof o === 'string' ? o : o.label || o.title || o.query) + '</button>').join('') + '</div></div>';
    }
    if (status !== 'answered') return head + '<p class="lw-message">问答响应无法识别，请重试。</p>';
    const refs = d.citations || [], used = d.scope?.contextUsed, topic = canonicalTopic(used), tu = topic && unit(topic.unitId), ts = topic && section(tu, topic.sectionId);
    const filtered = (d.scope?.filteredSegments || []).filter(x => x.reason !== 'excluded');
    return head + (filtered.length ? '<div class="lw-dialog-scope"><p>本次只回答 Agent 学习相关部分。</p><p class="lw-small">已过滤：' + esc(filtered.map(x => x.text).join('；')) + '</p></div>' : '') + (topic ? '<p class="lw-small">' + (used.origin === 'previous_answer' ? '结合上一个已核问答主题：' : '结合当前阅读：') + esc(tu.navigationLabel) + ' / ' + esc(ts.title) + '</p>' : '') + '<div class="lw-dialog-answer"><h3>教材简答</h3>' + d.sentences.map(sentence => '<p>' + esc(sentence.text) + ' ' + sentence.citationIds.map(cid => { const index = refs.findIndex(r => r.id === cid); return '<a class="lw-citation-link" href="#lw-citation-' + (index + 1) + '" data-lw-citation="' + (index + 1) + '" aria-label="来源 ' + (index + 1) + '：' + esc(refs[index].sectionTitle) + '">来源 ' + (index + 1) + '</a>'; }).join(' ') + '</p>').join('') + '</div><h3 class="lw-sources-heading">对应教材</h3>' + refs.map((r, i) => {
      const u = unit(r.unitId), s = section(u, r.sectionId);
      return '<article class="lw-result-card lw-dialog-source" id="lw-citation-' + (i + 1) + '" tabindex="-1"><span class="lw-result-position">来源 ' + (i + 1) + ' · 第 ' + String(u.order).padStart(2, '0') + ' 篇 · ' + esc(u.navigationLabel) + '</span><h4>' + esc(s.title) + '</h4><a class="primary" data-lw-result href="' + esc(r.href) + '">阅读这一节 →</a><details class="lw-dialog-quote"><summary>展开教材原文 · 来源 ' + (i + 1) + '</summary><blockquote>' + esc(r.quote) + '</blockquote></details><details class="lw-dialog-source-info"><summary>查看出处</summary><p>Agent 工程教材 v12<br>' + esc(u.title) + '<br>' + esc(u.sourcePath) + ' · ' + esc(s.title) + '</p><p class="lw-hash">原稿 SHA256：' + esc(u.sourceSha256) + '</p></details></article>';
    }).join('') + '<p class="lw-small">简答来自教材原文提取，可进入小节阅读完整条件与例子。</p>';
  }
  function assistantHTML() {
    const c = currentContext(), u = unit(c.currentUnitId), s = section(u, c.currentSectionId), t = canonicalTopic(dialogTopic), tu = t && unit(t.unitId), ts = t && section(tu, t.sectionId), invalid = response?.status === 'invalid_input';
    const feedback = pending ? '正在理解问题并查教材，可收起继续学习' : invalid ? response.dialog?.message || response.message : response ? assistantOpen ? '本题已完成' : '本题已完成，展开查看' : '';
    return '<div class="lw-assistant ' + (assistantOpen ? 'is-open' : '') + '" id="lw-assistant"><section id="lw-find-panel" aria-label="Agent 学习问答"' + (!assistantOpen ? ' hidden' : '') + '><div class="lw-assistant-head"><div><h2>Agent 学习问答</h2><p>根据 v12 教材简答，并提供原文入口</p></div><button class="outline" data-lw-collapse aria-expanded="' + assistantOpen + '" aria-controls="lw-find-panel">收起</button></div><div class="lw-context"><span>' + (u ? '章节上下文：' + esc(u.navigationLabel) + (s ? ' / ' + esc(s.title) : '') : '全部 30 篇') + '</span>' + (u ? '<button data-lw-clear-context>清除章节上下文</button>' : activeView === 'learn' && loc().version === CURRENT && unit(loc().unitId) ? '<button data-lw-use-context>结合当前阅读</button>' : '') + (tu ? '<span>问答主题：' + esc(tu.navigationLabel) + ' / ' + esc(ts.title) + '</span>' : '<span>尚无问答主题</span>') + '<button data-lw-clear-topic>清除问答主题</button></div><div class="lw-find-results" id="lw-find-results" aria-busy="' + pending + '">' + resultHTML() + (queryHistory.length ? '<details class="lw-query-history"><summary>最近问题 · 本会话</summary>' + queryHistory.map((h,i) => '<button class="outline" data-lw-history="' + i + '">' + esc(h.query) + '</button>').join('') + '</details>' : '') + '</div></section><form id="lw-find-form"><label for="lw-query">问教材</label><textarea id="lw-query" rows="1" placeholder="' + esc(globalThis.LearningExperienceV13?.inputHint?.() || '描述 Agent 开发、学习或项目中的问题') + '" aria-describedby="lw-query-feedback"' + (invalid ? ' aria-invalid="true"' : '') + '>' + esc(query) + '</textarea><button class="primary" type="submit">发送</button><button class="lw-open-toggle" type="button" data-lw-toggle aria-expanded="' + assistantOpen + '" aria-controls="lw-find-panel" aria-label="' + (assistantOpen ? '收起学习问答' : '展开学习问答') + '">' + (assistantOpen ? '⌄' : '⌃') + '</button><p id="lw-query-feedback" class="lw-query-feedback" role="status" aria-live="polite">' + esc(feedback) + '</p></form></div>';
  }
  function validateSource(result) {
    const c = corpus(), u = unit(result?.unitId), s = section(u, result?.sectionId);
    if (!u || !s || result.sourceSha256 !== u.sourceSha256 || result.sourcePath !== u.sourcePath || result.version !== c.corpusVersion || result.unitTitle !== u.title || result.sectionTitle !== s.title || typeof result.reason !== 'string' || !result.reason || typeof result.evidenceExcerpt !== 'string' || !result.evidenceExcerpt.trim() || !s.bodyMarkdown.includes(result.evidenceExcerpt) || result.href !== href(u, s.sectionId)) throw Error('来源或原文无法在当前教材核对，暂不显示为可用回答。');
    return s;
  }
  function validateResponse(r, submitted) {
    const c = corpus();
    if (!c) throw Error('当前教材资源没有完整加载。');
    if (submitted?.context?.corpusVersion !== CURRENT) throw Error('问答缓存属于其他教材版本，请重新提交。');
    if (submitted.context.previousContext && !canonicalTopic(submitted.context.previousContext)) throw Error('上一问答主题与当前教材不一致，请清除主题后重问。');
    const d = r?.dialog, statuses = {answered:'recommended',related_uncovered:'no_match',unrelated:'no_match',needs_clarification:'needs_clarification',unavailable:'unavailable',invalid_input:'invalid_input'};
    if (!d || !Object.hasOwn(statuses, d.status) || r.status !== statuses[d.status] || d.answerMode !== 'extractive' || !Array.isArray(d.sentences) || !Array.isArray(d.citations) || !Array.isArray(r.results) || !d.scope || !Array.isArray(d.scope.relatedSegments) || !Array.isArray(d.scope.filteredSegments) || typeof d.message !== 'string') throw Error('问答响应不符合当前教材合同，请重试。');
    if (!['unavailable','invalid_input'].includes(d.status) && (r.corpusVersion !== c.corpusVersion || r.corpusHash !== c.corpusHash)) throw Error('问答与阅读资源的版本不一致，请重新加载。');
    if (d.scope.relatedSegments.some(v => typeof v !== 'string') || d.scope.filteredSegments.some(v => !v || typeof v.text !== 'string' || typeof v.reason !== 'string')) throw Error('问答范围信息无法核对。');
    if (d.scope.contextUsed && (!canonicalTopic(d.scope.contextUsed) || !['previous_answer','current_section'].includes(d.scope.contextUsed.origin))) throw Error('问答使用的主题来源无法核对。');
    if (d.status !== 'answered') { if (d.sentences.length || d.citations.length || r.results.length || d.context) throw Error('未完成的问答包含未经支持的回答或出处，已拒绝显示。'); return r; }
    if (d.sentences.length < 1 || d.sentences.length > 3 || d.citations.length < 1 || d.citations.length > 3 || r.results.length !== d.citations.length || !canonicalTopic(d.context)) throw Error('简答或出处数量不符合教材合同。');
    for (const result of r.results) validateSource(result);
    const seen = new Set();
    for (const ref of d.citations) {
      const s = validateSource(ref);
      if (typeof ref.id !== 'string' || !ref.id || seen.has(ref.id) || ref.corpusVersion !== c.corpusVersion || ref.corpusHash !== c.corpusHash || typeof ref.quote !== 'string' || !ref.quote.trim() || !Number.isInteger(ref.quoteStart) || !Number.isInteger(ref.quoteEnd) || ref.quoteStart < 0 || ref.quoteEnd <= ref.quoteStart || s.bodyMarkdown.slice(ref.quoteStart,ref.quoteEnd) !== ref.quote || !r.results.some(x => ['unitId','sectionId','sourcePath','sourceSha256','version','href','evidenceExcerpt'].every(k => x[k] === ref[k]))) throw Error('简答引用无法在当前教材原文核对，已拒绝显示。');
      seen.add(ref.id);
    }
    for (const sentence of d.sentences) if (!sentence || typeof sentence.text !== 'string' || !sentence.text.trim() || !Array.isArray(sentence.citationIds) || !sentence.citationIds.length || sentence.citationIds.some(cid => !seen.has(cid)) || !sentence.citationIds.some(cid => d.citations.find(ref => ref.id === cid).quote.includes(sentence.text))) throw Error('简答句没有可验证的原文支持，已拒绝显示。');
    if (!d.citations.some(ref => ref.unitId === d.context.unitId && ref.sectionId === d.context.sectionId && ref.sourceSha256 === d.context.sourceSha256)) throw Error('下一问答主题不属于这次已验证的出处。');
    return r;
  }
  async function find(specificQuery, specificContext) {
    const expression = (specificQuery ?? query).trim(), context = specificContext || currentContext();
    if (pending && expression === submission?.query && JSON.stringify(context) === JSON.stringify(submission.context)) return;
    if (!expression || expression.length > 1200) { ++requestId; controller?.abort(); pending = false; historicalResponse = false; submission = { query: specificQuery ?? query, context }; response = { status: 'invalid_input', message: !expression ? '先描述一个你想解决的问题。' : '请把问题控制在 1200 字以内，当前输入已保留。' }; assistantOpen = true; assistantScroll = 0; refreshAssistant(false); document.getElementById('lw-query')?.focus(); return; }
    query = expression;
    const id = ++requestId; controller?.abort(); const activeController = new AbortController(); controller = activeController;
    const submitted = { query: expression, context: JSON.parse(JSON.stringify(context)) }; submission = submitted; response = null; pending = true; historicalResponse = false; assistantOpen = true; assistantScroll = 0; refreshAssistant(false); document.getElementById('lw-query')?.focus({ preventScroll: true });
    try {
      if (!corpus()) throw Error('教材资源没有完整加载。');
      if (location.protocol === 'file:') throw Error('当前是静态阅读入口，语义问答暂不可用；请使用本地服务或课程目录。');
      const timeout = setTimeout(() => activeController.abort(), 120000);
      let result;
      try {
        const http = await fetch('/api/content/dialog', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query: expression, ...submitted.context }), signal: activeController.signal, credentials: 'omit' });
        if (!http.ok) throw Error(http.status === 404 ? '当前预览只有静态阅读资源，请启动本地问答服务。' : '本地问答服务暂不可用。');
        result = await http.json();
      } finally { clearTimeout(timeout); }
      if (id !== requestId) return;
      response = validateResponse(result, submitted);
      if (response.dialog.status === 'answered') dialogTopic = canonicalTopic(response.dialog.context);
    } catch (error) {
      if (id !== requestId) return;
      response = { status: 'unavailable', engineMode: location.protocol === 'file:' ? 'static_rules' : '', providerCalled: false, message: error.name === 'AbortError' ? '本题未在限定时间内完成，可重试；不会用旧答代替。' : error.message };
    } finally {
      if (id === requestId) { pending = false; queryHistory = [{query: submitted.query, context: submitted.context, response, at: new Date().toISOString()}, ...queryHistory].slice(0,5); refreshAssistant(); }
    }
  }
  function sessionValue() { return { query, response: pending ? null : response, submission, assistantOpen, contextEnabled, startingEnabled, queryHistory, dialogTopic, historicalResponse }; }
  function clarificationRetryResponse() {
    return {status:'unavailable',engineMode:'',providerCalled:false,results:[],clarification:null,dialog:{status:'unavailable',answerMode:'extractive',sentences:[],citations:[],scope:{relatedSegments:[],filteredSegments:[],contextUsed:null},message:'此前澄清需要向当前服务重新确认。请点击“重试本题”获取当前选项。',context:null}};
  }
  function refreshAssistant(preserveScroll = true) {
    const previousResults = document.getElementById('lw-find-results'); if (preserveScroll && previousResults && assistantOpen) assistantScroll = previousResults.scrollTop;
    try { sessionStorage.setItem(SESSION, JSON.stringify(sessionValue())); } catch { /* Reading and in-memory questions remain available. */ }
    const host = document.getElementById('lw-assistant-host');
    const focused = document.activeElement?.id === 'lw-query', input = focused ? document.getElementById('lw-query') : null, range = input ? [input.selectionStart, input.selectionEnd] : null;
    if (host) host.innerHTML = assistantHTML();
    const nextResults = document.getElementById('lw-find-results'); if (nextResults) nextResults.scrollTop = assistantScroll;
    if (focused) { const next = document.getElementById('lw-query'); next?.focus({ preventScroll: true }); if (range && next?.setSelectionRange) next.setSelectionRange(range[0], range[1]); }
  }
  function collapse() { const results = document.getElementById('lw-find-results'); if (results) assistantScroll = results.scrollTop; assistantOpen = false; refreshAssistant(); document.getElementById('lw-query')?.focus({ preventScroll: true }); }
  function captureNotes() {
    const note = document.getElementById('lw-note');
    const u = unit(activeReadingUnitId);
    if (note && activeReadingVersion === CURRENT && u) local.notes[activeReadingUnitId] = { text: note.value.slice(0, 12000), corpusVersion: CURRENT, sourceSha256: u.sourceSha256, updatedAt: new Date().toISOString() };
    document.querySelectorAll('[data-lw-project]').forEach(n => { if (Object.hasOwn(local.project, n.dataset.lwProject)) local.project[n.dataset.lwProject] = n.value.slice(0, 12000); });
  }
  function download(text, name, type = 'text/markdown;charset=utf-8') { const blob = new Blob([text], { type }), url = URL.createObjectURL(blob), a = document.createElement('a'); a.href = url; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); }
  function exportRecords() {
    captureNotes();
    const data = { schemaVersion: '1', clientVersion: VERSION, exportedAt: new Date().toISOString(), scope: '本浏览器记录与本人自述，不是独立能力评价', current: { corpusVersion: CURRENT, corpusHash: corpus()?.corpusHash || null, storageKey: STORE, records: local }, historical: { corpusVersion: HISTORICAL, storageKey: OLD_STORE, records: historical, originalStorageValue: historicalRaw }, earlierRecords: 'rolecraft-v1 档案、测验与项目原值未改，可由更多工具原有导出入口取得' };
    download(JSON.stringify(data, null, 2), '职造-学习记录-v12与历史v10.json', 'application/json;charset=utf-8'); notify('已导出 v12 记录与保留的 v10 原始记录；自述未独立评价。');
  }
  let focusFrame = 0, readerObserver = null;
  function readerGeometry() {
    const detail = document.querySelector('.lw-detail');
    if (!detail) return;
    const bar = document.querySelector('.topbar'), strip = document.getElementById('lw-prereq-strip'), prior = document.getElementById('lw-prerequisites');
    const top = bar?.getBoundingClientRect?.().height || (globalThis.innerWidth <= 760 ? 70 : 60);
    const twoColumns = globalThis.innerWidth >= 1280 && (detail.getBoundingClientRect?.().width || 0) >= 932;
    detail.classList.toggle('lw-prereq-two-columns', twoColumns);
    const stripHeight = !twoColumns ? strip?.getBoundingClientRect?.().height || 44 : 0;
    document.documentElement.style.setProperty('--lw-reader-top', top + 'px');
    document.documentElement.style.setProperty('--lw-reader-scroll-offset', (top + stripHeight + 12) + 'px');
    const bottom = document.getElementById('lw-find-form')?.getBoundingClientRect?.().height || 100;
    prior?.classList.toggle('lw-prereq-sticky', twoColumns && (prior.getBoundingClientRect?.().height || 0) <= globalThis.innerHeight - top - bottom - 32);
  }
  function mount(view) {
    activeView = view;
    const isWorkbench = ['home', 'path', 'learn', 'records', 'projects'].includes(view);
    document.body.classList.toggle('lw-active', isWorkbench);
    const banner = document.getElementById('save-status'); if (isWorkbench && banner) banner.textContent = storageError || '当前教材 v12；新记录独立保存于本浏览器，未同步账户。v10 记录可在学习记录查看与导出。';
    let host = document.getElementById('lw-assistant-host');
    if (!host) { host = document.createElement('div'); host.id = 'lw-assistant-host'; document.body.appendChild(host); }
    host.hidden = view === 'generation' || view === 'settings'; refreshAssistant();
    let status = document.getElementById('lw-status'); if (!status) { status = document.createElement('div'); status.id = 'lw-status'; status.className = 'lw-status'; status.setAttribute('role', 'status'); status.setAttribute('aria-live', 'polite'); document.body.appendChild(status); }
    if (!document.getElementById('lw-image-dialog')) {
      const d = document.createElement('dialog'); d.id = 'lw-image-dialog'; d.setAttribute('aria-label', '放大教学图'); d.innerHTML = '<div class="lw-image-top"><strong>教学图原图</strong><div><button class="outline" data-lw-image-size>切换原尺寸</button><button class="outline" data-lw-close-image>关闭</button></div></div><div class="lw-image-scroll"><img alt=""></div><p>默认查看全貌；切换原尺寸后可横向与纵向滚动查看细节。按 Esc 关闭。</p>'; document.body.appendChild(d);
      d.addEventListener('close', () => trigger?.isConnected && trigger.focus({ preventScroll: true }));
    }
    cancelAnimationFrame(focusFrame);
    readerObserver?.disconnect(); readerObserver = null;
    readerGeometry();
    if (typeof globalThis.ResizeObserver === 'function') {
      const detail = document.querySelector('.lw-detail');
      if (detail) { readerObserver = new ResizeObserver(readerGeometry); readerObserver.observe(detail); for (const node of [document.querySelector('.topbar'),document.getElementById('lw-prereq-strip'),document.getElementById('lw-prerequisites')]) if (node) readerObserver.observe(node); }
    }
    const l = loc(), u = view === 'learn' ? unit(l.unitId, l.version) : null;
    activeReadingUnitId = u?.unitId || '';
    activeReadingVersion = u ? l.version : '';
    if (u && (!l.sectionId || section(u, l.sectionId))) {
      const last = local.visits.at(-1);
      if (l.version === CURRENT && (!last || last.unitId !== u.unitId || last.sectionId !== l.sectionId || !currentRecord(last))) { local.visits.push({ unitId: u.unitId, sectionId: l.sectionId, corpusVersion: CURRENT, corpusHash: corpus().corpusHash, sourceSha256: u.sourceSha256, at: new Date().toISOString() }); local.visits = local.visits.slice(-200); save(); }
      focusFrame = requestAnimationFrame(() => {
        readerGeometry();
        const target = document.getElementById(l.sectionId || 'lw-reader-start');
        if (target) { target.focus({ preventScroll: true }); target.scrollIntoView({ block: 'start' }); }
      });
    }
  }
  function beforeRender() { captureNotes(); }
  function page(view) { return ({ home: () => homePage(), path: () => homePage(true), learn: readerPage, records: recordsPage, projects: projectsPage }[view] || (() => errorPage('页面暂不可用。')))(); }
  document.addEventListener('click', e => {
    const el = e.target.closest('button,a'); if (!el) return;
    if (el.hasAttribute('data-lw-citation')) { e.preventDefault(); const card = document.getElementById('lw-citation-' + el.dataset.lwCitation); card?.focus({preventScroll:true}); card?.scrollIntoView({block:'nearest'}); return; }
    if (el.hasAttribute('data-lw-prereq-location')) { const title = document.getElementById('lw-prereq-title'); title?.focus({preventScroll:true}); title?.scrollIntoView({block:'start'}); return; }
    if (el.hasAttribute('data-lw-result')) { const results = document.getElementById('lw-find-results'); if (results) assistantScroll = results.scrollTop; assistantOpen = false; refreshAssistant(); return; }
    if (el.hasAttribute('data-lw-image')) { trigger = el; const d = document.getElementById('lw-image-dialog'), image = d.querySelector('img'); image.src = el.dataset.lwImage; image.alt = el.dataset.lwAlt || 'Agent 教学图'; d.classList.remove('is-original'); d.querySelector('[data-lw-image-size]').textContent = '切换原尺寸'; d.showModal(); d.querySelector('[data-lw-close-image]').focus(); return; }
    if (el.hasAttribute('data-lw-image-size')) { const d = document.getElementById('lw-image-dialog'); d.classList.toggle('is-original'); el.textContent = d.classList.contains('is-original') ? '适配全貌' : '切换原尺寸'; return; }
    if (el.hasAttribute('data-lw-close-image')) { document.getElementById('lw-image-dialog').close(); return; }
    if (el.hasAttribute('data-lw-toggle')) { trigger = el; assistantOpen = !assistantOpen; refreshAssistant(); if (assistantOpen) document.getElementById('lw-query')?.focus(); return; }
    if (el.hasAttribute('data-lw-collapse')) { collapse(); return; }
    if (el.hasAttribute('data-lw-example')) { query = el.dataset.lwExample; refreshAssistant(); document.getElementById('lw-query')?.focus(); return; }
    if (el.hasAttribute('data-lw-clear-start')) { startingEnabled = false; refreshAssistant(); return; }
    if (el.hasAttribute('data-lw-use-start')) { startingEnabled = true; refreshAssistant(); return; }
    if (el.hasAttribute('data-lw-clear-context')) { contextEnabled = false; refreshAssistant(); return; }
    if (el.hasAttribute('data-lw-use-context')) { contextEnabled = true; refreshAssistant(); return; }
    if (el.hasAttribute('data-lw-clear-topic')) { ++requestId; controller?.abort(); pending = false; dialogTopic = null; response = null; submission = null; historicalResponse = false; assistantScroll = 0; refreshAssistant(false); return; }
    if (el.hasAttribute('data-lw-history')) {
      const h = queryHistory[Number(el.dataset.lwHistory)];
      if (h) {
        if (h.response?.dialog?.status === 'needs_clarification' || h.response?.status === 'needs_clarification') { find(h.query, h.context); return; }
        ++requestId; controller?.abort(); pending = false; query = h.query; submission = {query: h.query, context: h.context};
        try { response = validateResponse(h.response,submission); if (response.dialog.status === 'answered') dialogTopic = canonicalTopic(response.dialog.context); } catch(error) { response = {status:'unavailable',message:error.message}; }
        historicalResponse = true; assistantOpen = true; assistantScroll = 0; refreshAssistant(false);
      }
      return;
    }
    if (el.hasAttribute('data-lw-retry')) { find(submission?.query, submission?.context || currentContext()); return; }
    if (el.hasAttribute('data-lw-clarify')) { const c = response?.clarification, o = c?.options?.[Number(el.dataset.lwClarify)]; if (o) { const complete = typeof o === 'string' ? (submission?.query || query) + '；我指的是：' + o : o.query || (submission?.query || query) + '；我指的是：' + (o.label || o.title); find(complete, submission?.context || currentContext()); } return; }
    if (el.hasAttribute('data-lw-reload')) { location.reload(); return; }
    if (el.hasAttribute('data-lw-save-note')) { captureNotes(); notify(save() ? '阅读笔记已保存在此浏览器。' : storageError); return; }
    if (el.hasAttribute('data-lw-save-project')) { captureNotes(); notify(save() ? '项目档案已保存在此浏览器，尚未独立评价。' : storageError); return; }
    if (el.hasAttribute('data-lw-export')) { exportRecords(); return; }
    if (el.hasAttribute('data-lw-download')) { const u = unit(el.dataset.lwDownload, el.dataset.lwVersion || CURRENT); if (u) download(u.bodyMarkdown, 'Agent教材-' + unitVersion(u) + '-' + u.unitId + '.md'); return; }
    if (el.hasAttribute('data-lw-bookmark')) { const l = loc(), u = unit(l.unitId), s = section(u, l.sectionId); if (!u || l.version !== CURRENT || l.sectionId && !s) return; const id = s?.sectionId || '', exists = local.bookmarks.some(b => currentRecord(b) && b.unitId === u.unitId && b.sectionId === id); local.bookmarks = local.bookmarks.filter(b => !(currentRecord(b) && b.unitId === u.unitId && b.sectionId === id)); if (!exists) local.bookmarks.push({ unitId: u.unitId, sectionId: id, corpusVersion: CURRENT, corpusHash: corpus().corpusHash, sourceSha256: u.sourceSha256 }); save(); el.textContent = exists ? '收藏当前阅读位置' : '已收藏此位置 · 取消'; notify(exists ? '已取消收藏。' : '已收藏当前阅读位置。'); return; }
    if (el.hasAttribute('data-lw-copy')) { if (navigator.clipboard?.writeText) navigator.clipboard.writeText(location.href).then(() => notify('已复制当前定位链接。')).catch(() => notify('无法自动复制，可从地址栏复制当前链接。')); else notify('请从地址栏复制当前定位链接。'); }
  });
  document.addEventListener('change', e => {
    if (e.target.id === 'lw-starting-point') { local.startingPoint = Object.hasOwn(STARTS, e.target.value) ? e.target.value : null; startingEnabled = true; save(); if (typeof render === 'function') render(); }
  });
  document.addEventListener('input', e => {
    if (e.target.id === 'lw-query') { query = e.target.value; e.target.removeAttribute('aria-invalid'); try { sessionStorage.setItem(SESSION, JSON.stringify(sessionValue())); } catch {} }
    if (e.target.id === 'lw-note' || e.target.hasAttribute('data-lw-project')) { captureNotes(); save(); }
  });
  document.addEventListener('compositionstart', e => { if (e.target.id === 'lw-query') composing = true; });
  document.addEventListener('compositionend', e => { if (e.target.id === 'lw-query') composing = false; });
  document.addEventListener('keydown', e => {
    if (e.target.id === 'lw-query' && e.key === 'Enter' && !e.shiftKey && !e.isComposing && !composing) { e.preventDefault(); query = e.target.value; find(); }
    if (e.key === 'Escape' && assistantOpen && !document.getElementById('lw-image-dialog')?.open) { e.preventDefault(); collapse(); }
  });
  document.addEventListener('submit', e => { if (e.target.id === 'lw-find-form') { e.preventDefault(); query = document.getElementById('lw-query').value; find(); } });
  try {
    const received = JSON.parse(sessionStorage.getItem(SESSION) || 'null');
    if (received && typeof received === 'object') {
      query = asText(received.query, 20000);
      queryHistory = Array.isArray(received.queryHistory) ? received.queryHistory.filter(h=>h && typeof h.query==='string' && h.context?.corpusVersion===CURRENT && h.response).slice(0,5).map(h => { try { return {...h,response:validateResponse(h.response,{query:h.query,context:h.context})}; } catch(error) { return {...h,response:{status:'unavailable',message:error.message}}; } }) : [];
      assistantOpen = received.assistantOpen === true;
      contextEnabled = received.contextEnabled !== false; startingEnabled = received.startingEnabled !== false;
      submission = received.submission && typeof received.submission.query === 'string' && received.submission.context && typeof received.submission.context === 'object' ? received.submission : null;
      if (received.response && submission) {
        try { response = validateResponse(received.response, submission); if (response.dialog.status === 'needs_clarification') response = clarificationRetryResponse(); historicalResponse = true; }
        catch (error) { response = { status: 'unavailable', message: error.message, providerCalled: false }; }
      }
      const topic = canonicalTopic(received.dialogTopic);
      if (topic && queryHistory.some(h => h.response?.dialog?.status === 'answered' && JSON.stringify(canonicalTopic(h.response.dialog.context)) === JSON.stringify(topic))) dialogTopic = topic;
    }
  } catch { /* A damaged query cache is not used as a recommendation. */ }
  globalThis.LearningWorkbench = { version: VERSION, page, mount, beforeRender, markdown, validateResponse, currentContext, refreshAssistant, readingRecords: () => local, recordIsCurrent: currentRecord, recordsExportData: () => { captureNotes(); return { current: local, historical: { records: historical, originalStorageValue: historicalRaw } }; } };
  globalThis.addEventListener?.('resize', readerGeometry);
  document.addEventListener('click', e => { if (assistantOpen && !e.target.closest('#lw-assistant-host,button,a,input,textarea,select,summary,dialog')) collapse(); });
})();
