/* Client-only learning workspace. Public textbook data and recommendations are supplied by the retrieval owner. */
(function () {
  'use strict';
  const VERSION = 'rolecraft-1.0';
  const CURRENT = 'textbook-v12';
  const STORE = 'rolecraft-reading-v13', PREVIOUS_STORE = 'rolecraft-learning-v12';
  const SESSION = 'rolecraft-content-dialog-v14';
  const DIALOG_AGENT_VERSION = 'agent-system-v0.12';
  const WORKBENCH_VERSION = 'local-workbench-0.11';
  const P01 = Object.freeze({
    practiceId: 'V1-PILOT-P01-MVP-001',
    unitId: 'p01-mvp',
    textbookVersion: 'textbook-v12',
    sourcePath: 'sites/rolecraft/textbooks/v12/p01-mvp.md',
    sourceSha256: 'deb98fa616e7d670108c86eca3b2a137e1183cf69bc3a5f5799a0b08f19b57d9',
    fixtureId: 'defect-mvp-contract-01',
    reviewScope: 'limited_to_constructed_fixture'
  });
  const P01_ITEMS = Object.freeze([
    ['problem-evidence', '问题与证据', '分开事实、推断和未知，并引用输入来源。'],
    ['task-contract', '任务契约', '写出允许/禁止动作、停止条件和权限范围。'],
    ['acceptance-plan', '验收计划', '列出正常路径、缺证/权限失败路径和可复现条件。'],
    ['adr', '方案决策（ADR）', '说明为何采用单调用/普通程序基线，不扩展为多 Agent 或自动改代码。'],
    ['reproduction-notes', '复现记录', '让非作者可以复现正常路径及一条失败路径。'],
    ['evidence-index', '证据索引', '逐项记录命令、路径、版本、哈希和执行状态。'],
    ['reflection', '复盘与下一步', '记录差距、未知效果、责任人和原例复验动作。']
  ]);
  const P01_STATUS_LABELS = Object.freeze({
    '未开始': '未开始',
    '已提交': '已提交',
    '待独立复验': '待独立复验',
    '发现问题': '复验发现问题',
    '证据不足': '证据不足'
  });
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
  const emptyPractice = () => ({
    practiceId: P01.practiceId, unitId: P01.unitId, textbookVersion: P01.textbookVersion,
    sourcePath: P01.sourcePath, sourceSha256: P01.sourceSha256, fixtureId: P01.fixtureId,
    reviewScope: P01.reviewScope, workflowStatus: '未开始', draftSaved: false, draft: null,
    currentSubmissionId: '', submissions: [], updatedAt: ''
  });
  const empty = () => ({ corpusVersion: CURRENT, startingPoint: null, visits: [], bookmarks: [], notes: {}, project: { title: '', problem: '', evidence: '', result: '', gap: '', next: '' }, practice: emptyPractice(), task: { state: 'not_started', unitId: '', sectionId: '', reason: '', updatedAt: '' } });
  let local = empty(), storageError = '', activeView = '', assistantOpen = false, query = '', response = null, submission = null, pending = false, requestId = 0, controller = null;
  let careerPractice = { draft: '', saved: false, submitted: false, feedback: '练习反馈：尚未提交。提交后只回显本页草稿，不表示通过或等级。' };
  // The public page keeps the original Agent corpus for anonymous reading. Once an
  // account has an active career, the reader must use that career's API catalog and
  // chapters; it must never silently fall back to Agent content.
  const AGENT_CAREER_ID = 'agent-developer';
  const CAREER_LOAD_MARKER = 'rolecraft-career-content-ready-v1';
  const CAREER_LOAD_TIMEOUT = 120000;
  let careerController = null, careerPhaseTimer = null;
  let careerState = { status: 'anonymous', phase: 'idle', active: false, careerId: '', career: null, catalog: null, chapters: new Map(), chapterRequests: new Map(), chapterErrors: new Map(), error: '', requestId: 0, startedAt: 0, firstLoad: false, loadingChapterId: '' };
  let queryHistory = [];
  let contextEnabled = false, startingEnabled = true, composing = false, trigger = null, activeReadingUnitId = '', activeReadingVersion = '';
  let dialogTopic = null, restoredResponse = false, assistantScroll = 0;
  const memoryScroll = new Map();
  function uuid() {
    if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
    const bytes = new Uint8Array(16);
    if (globalThis.crypto?.getRandomValues) globalThis.crypto.getRandomValues(bytes);
    else for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
    bytes[6] = (bytes[6] & 0x0f) | 0x40; bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = [...bytes].map(v => v.toString(16).padStart(2, '0')).join('');
    return hex.slice(0,8) + '-' + hex.slice(8,12) + '-' + hex.slice(12,16) + '-' + hex.slice(16,20) + '-' + hex.slice(20);
  }
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
      if (parsed.practice && typeof parsed.practice === 'object') {
        const p = parsed.practice;
        local.practice = { ...emptyPractice(), ...p, draft: p.draft && typeof p.draft === 'object' ? p.draft : null, submissions: Array.isArray(p.submissions) ? p.submissions.filter(s => s && typeof s.submission_id === 'string').slice(-20) : [] };
        // Source identity is immutable in this client. An old/malformed record is retained as history but cannot be presented as current.
        if (local.practice.practiceId !== P01.practiceId || local.practice.sourceSha256 !== P01.sourceSha256) local.practice = emptyPractice();
      }
      if (parsed.task && typeof parsed.task === 'object') {
        const t = parsed.task;
        local.task = { ...empty().task, ...t, state: ['not_started', 'in_progress', 'interrupted', 'browsed'].includes(t.state) ? t.state : 'not_started' };
      }
    }
  } catch { storageError = '读取本浏览器学习记录失败。新输入仍可留在页面并导出。'; }
  function staticCorpus() {
    const c = globalThis.RolecraftContentV12, count = 30;
    if (!c || c.corpusVersion !== CURRENT || !Array.isArray(c.units) || c.units.length !== count || new Set(c.units.map(u => u.unitId)).size !== count || c.units.some((u, i) => u.order !== i + 1 || !u.bodyMarkdown || !Array.isArray(u.sections))) return null;
    return c;
  }
  function validCareerCatalog(c, expectedVersion) {
    const version = expectedVersion || CURRENT;
    if (!c || typeof c !== 'object' || c.corpusVersion !== version || typeof c.corpusHash !== 'string' || !Array.isArray(c.units) || !c.units.length) return false;
    const ids = new Set();
    return c.units.every(u => u && typeof u.unitId === 'string' && !ids.has(u.unitId) && ids.add(u.unitId) && Number.isInteger(Number(u.order)) && Number(u.order) > 0 && typeof u.title === 'string' && typeof u.navigationLabel === 'string' && typeof u.sourceSha256 === 'string' && Array.isArray(u.sections) && u.sections.every(s => s && typeof s.sectionId === 'string' && typeof s.title === 'string'));
  }
  function dynamicCareer() { return careerState.active && careerState.careerId !== AGENT_CAREER_ID; }
  function careerContentState() {
    return { status: careerState.status, phase: careerState.phase, active: careerState.active, dynamic: dynamicCareer(), careerId: careerState.careerId, career: careerState.career ? { ...careerState.career } : null, error: careerState.error, startedAt: careerState.startedAt, firstLoad: careerState.firstLoad, loadingChapterId: careerState.loadingChapterId, loadedChapterIds: [...careerState.chapters.keys()] };
  }
  function corpus(version) {
    if (careerState.active) {
      if (careerState.status !== 'ready') return null;
      // Agent remains backed by the verified bundled corpus after its API catalog
      // has been checked. Other careers are assembled from their catalog plus any
      // full chapters fetched on demand.
      if (!dynamicCareer()) {
        const requested = version || CURRENT;
        return requested === CURRENT ? staticCorpus() : null;
      }
      const expected = careerState.career?.contentVersion || '';
      if (version && version !== expected) return null;
      if (!validCareerCatalog(careerState.catalog, expected)) return null;
      const units = careerState.catalog.units.map(meta => careerState.chapters.get(meta.unitId)?.unit || meta);
      return { ...careerState.catalog, units };
    }
    const requested = version || CURRENT;
    return requested === CURRENT ? staticCorpus() : null;
  }
  function unit(id, version = CURRENT) { return corpus(version)?.units.find(u => u.unitId === id); }
  function unitVersion(u) {
    const expected = dynamicCareer() && careerState.status === 'ready' ? careerState.career?.contentVersion : '';
    if (!expected) return CURRENT;
    if (u && typeof u.unitId === 'string' && !careerState.catalog?.units?.some(item => item.unitId === u.unitId)) return CURRENT;
    return expected;
  }
  function section(u, id) { return u?.sections.find(s => s.sectionId === id); }
  function currentRecord(v) { return v?.corpusVersion === CURRENT && v.corpusHash === corpus()?.corpusHash && unit(v.unitId)?.sourceSha256 === v.sourceSha256 && (!v.sectionId || section(unit(v.unitId), v.sectionId)); }
  function noteText(u) { const n = local.notes[u?.unitId]; return n?.corpusVersion === CURRENT && n.sourceSha256 === u?.sourceSha256 ? asText(n.text) : ''; }
  function careerRoute() {
    const [path] = location.hash.slice(1).split('?'), p = path.split('/');
    if (p[0] === 'learn' && p[1] === 'career' && /^[a-z0-9][a-z0-9-]{0,127}$/.test(p[2] || '')) return { careerId: p[2], unitId: p[3] || '', sectionId: p[4] || '' };
    return null;
  }
  function loc() {
    const [path, search = ''] = location.hash.slice(1).split('?'), p = path.split('/');
    const resume = new URLSearchParams(search).get('resume') === '1';
    const routed = careerRoute();
    if (routed) return { careerId: routed.careerId, unitId: routed.unitId, sectionId: routed.sectionId, version: careerState.career?.contentVersion || '', resume };
    return { careerId: '', unitId: p[0] === 'learn' && p[1] === 'agent' ? p[2] || '' : '', sectionId: p[0] === 'learn' && p[1] === 'agent' ? p[3] || '' : '', version: CURRENT, resume };
  }
  function href(u, s = '') {
    const careerId = careerState.careerId || careerRoute()?.careerId;
    if ((dynamicCareer() || careerRoute()) && careerId) return '#learn/career/' + careerId + '/' + u.unitId + (s ? '/' + s : '');
    return '#learn/agent/' + u.unitId + (s ? '/' + s : '');
  }
  function save() {
    try { localStorage.setItem(STORE, JSON.stringify(local)); storageError = ''; return true; }
    catch { storageError = '浏览器无法保存。输入还在当前页面；关闭前可导出学习记录。'; return false; }
  }
  function practiceSource() {
    const u = unit(P01.unitId), s = u?.sections?.find(item => item.sectionId === 'p01-mvp') || u?.sections?.find(item => item.level > 1) || u?.sections?.[0];
    return { ...P01, sourceSha256: u?.sourceSha256 || P01.sourceSha256, sourceHref: u ? href(u, s?.sectionId || '') : '#learn/agent/' + P01.unitId };
  }
  function practiceStatus() {
    const value = local.practice?.workflowStatus;
    return P01_STATUS_LABELS[value] ? value : '未开始';
  }
  function practiceDraftValues() {
    const draft = local.practice?.draft && typeof local.practice.draft === 'object' ? local.practice.draft : {};
    const out = {};
    for (const [id] of P01_ITEMS) out[id] = asText(draft[id]);
    out.learnerClaims = asText(draft.learnerClaims);
    out.evidenceRefs = asText(draft.evidenceRefs);
    return out;
  }
  function practiceHasMinimum(values) {
    return P01_ITEMS.every(([id]) => asText(values[id]).trim()) && asText(values.learnerClaims).trim();
  }
  function capturePracticeDraft() {
    if (activeView !== 'projects') return;
    const form = document.getElementById('lw-p01-form');
    if (!form) return;
    const values = {};
    for (const [id] of P01_ITEMS) values[id] = asText(form.elements[id]?.value);
    values.learnerClaims = asText(form.elements.learnerClaims?.value);
    values.evidenceRefs = asText(form.elements.evidenceRefs?.value);
    const previous = local.practice?.draft || {};
    local.practice.draft = { ...previous, ...values, practice_id: P01.practiceId, source_sha256: practiceSource().sourceSha256, updated_at: new Date().toISOString() };
    local.practice.draftSaved = true;
    local.practice.updatedAt = new Date().toISOString();
  }
  function recordPracticeDraft() {
    capturePracticeDraft();
    if (!local.practice.draft) return false;
    // A draft is still unsubmitted; keep the workflow fact as 未开始 while making the save visible.
    local.practice.workflowStatus = local.practice.submissions.length ? local.practice.workflowStatus : '未开始';
    const ok = save();
    notify(ok ? 'P01-MVP 草稿已保存（未提交）。' : storageError);
    return ok;
  }
  function submitPractice() {
    capturePracticeDraft();
    const values = practiceDraftValues();
    if (!practiceHasMinimum(values)) {
      notify('提交前请补齐七项作品、本人自述和至少一条可追溯证据；缺证不能代填。');
      document.getElementById('lw-p01-feedback')?.setAttribute('role', 'alert');
      if (document.getElementById('lw-p01-feedback')) document.getElementById('lw-p01-feedback').textContent = '尚未提交：作品清单或本人自述仍有缺项。';
      return false;
    }
    const source = practiceSource(), now = new Date().toISOString();
    const previous = local.practice.currentSubmissionId || null;
    const artifactVersion = 'learner-revision-' + String(local.practice.submissions.length + 1).padStart(2, '0');
    const submissionRecord = {
      submission_id: uuid(), previous_submission_id: previous, practice_id: P01.practiceId, unit_id: P01.unitId,
      textbook_version: P01.textbookVersion, source_path: P01.sourcePath, source_sha256: source.sourceSha256,
      fixture_id: P01.fixtureId, artifact_version: artifactVersion, created_at: now, updated_at: now,
      workflow_status: '已提交', record_types: ['draft', 'self_report', 'ai_suggestion', 'professional_review', 'human_review'],
      review_scope: P01.reviewScope, source_refs: [source.sourceHref], evidence_refs: values.evidenceRefs.split(/\r?\n/).map(v => v.trim()).filter(Boolean),
      reviewer_refs: [], learner_claims: values.learnerClaims, unresolved_gaps: '', artifacts: P01_ITEMS.map(([id]) => ({ artifact_id: id, artifact_version: artifactVersion, practice_id: P01.practiceId, created_at: now, source_refs: [source.sourceHref], content: values[id] }))
    };
    // Append only. A revision always receives a new submission_id and retains its predecessor.
    local.practice.submissions = [...(Array.isArray(local.practice.submissions) ? local.practice.submissions : []), submissionRecord].slice(-20);
    local.practice.currentSubmissionId = submissionRecord.submission_id;
    local.practice.workflowStatus = '已提交';
    local.practice.updatedAt = now;
    local.practice.draftSaved = true;
    const ok = save();
    if (ok) notify('P01-MVP 已提交为新版本 ' + artifactVersion + '；尚未独立复验。');
    else notify(storageError);
    return ok;
  }
  function updatePracticeStatus(status) {
    if (!P01_STATUS_LABELS[status]) return;
    const current = local.practice.submissions.find(s => s.submission_id === local.practice.currentSubmissionId);
    if (current) { current.workflow_status = status; current.updated_at = new Date().toISOString(); }
    local.practice.workflowStatus = status;
    local.practice.updatedAt = new Date().toISOString();
    const ok = save();
    notify(ok ? '已记录为「' + P01_STATUS_LABELS[status] + '」；这不是独立评审结论。' : storageError);
  }
  function currentTask() {
    const task = local.task || empty().task;
    return { ...task, state: ['not_started', 'in_progress', 'interrupted', 'browsed'].includes(task.state) ? task.state : 'not_started' };
  }
  function setTask(state, unitId = '', sectionId = '', reason = '') {
    if (!['not_started', 'in_progress', 'interrupted', 'browsed'].includes(state)) return;
    local.task = { ...currentTask(), state, unitId: unitId || local.task?.unitId || '', sectionId: sectionId || local.task?.sectionId || '', reason: asText(reason, 400), updatedAt: new Date().toISOString() };
    save();
  }
  // Per-career task states live outside the v12 reading store. That store rejects
  // any corpusVersion other than textbook-v12, so UIUX progress cannot be written
  // there. This key is local-browser only and is the documented fixture for
  // not_started / in_progress / interrupted / browsed. It does not touch SQLite.
  const CAREER_TASK_KEY = 'rolecraft-career-task-v1';
  const TASK_STATES = ['not_started', 'in_progress', 'interrupted', 'browsed'];
  function emptyCareerTasks() { return { schema: 1, careers: {} }; }
  function loadCareerTasks() {
    try {
      const parsed = JSON.parse(localStorage.getItem(CAREER_TASK_KEY) || 'null');
      if (!parsed || parsed.schema !== 1 || !parsed.careers || typeof parsed.careers !== 'object' || Array.isArray(parsed.careers)) return emptyCareerTasks();
      return parsed;
    } catch { return emptyCareerTasks(); }
  }
  function taskCareerId() { return careerState.careerId || careerRoute()?.careerId || AGENT_CAREER_ID; }
  function readCareerTask(careerId = taskCareerId()) {
    const row = loadCareerTasks().careers[careerId] || {};
    return {
      state: TASK_STATES.includes(row.state) ? row.state : 'not_started',
      unitId: typeof row.unitId === 'string' ? row.unitId : '',
      sectionId: typeof row.sectionId === 'string' ? row.sectionId : '',
      reason: typeof row.reason === 'string' ? row.reason : '',
      contentVersion: typeof row.contentVersion === 'string' ? row.contentVersion : '',
      openedUnitIds: Array.isArray(row.openedUnitIds) ? row.openedUnitIds.filter(id => typeof id === 'string').slice(0, 200) : [],
      updatedAt: typeof row.updatedAt === 'string' ? row.updatedAt : ''
    };
  }
  function writeCareerTask(careerId, patch) {
    if (!careerId) return null;
    const book = loadCareerTasks();
    const previous = readCareerTask(careerId);
    const next = {
      state: TASK_STATES.includes(patch.state) ? patch.state : previous.state,
      unitId: patch.unitId != null ? String(patch.unitId) : previous.unitId,
      sectionId: patch.sectionId != null ? String(patch.sectionId) : previous.sectionId,
      reason: patch.reason != null ? asText(patch.reason, 400) : previous.reason,
      contentVersion: patch.contentVersion != null ? String(patch.contentVersion) : previous.contentVersion,
      openedUnitIds: Array.isArray(patch.openedUnitIds) ? patch.openedUnitIds.filter(id => typeof id === 'string').slice(0, 200) : previous.openedUnitIds,
      updatedAt: new Date().toISOString()
    };
    book.careers[careerId] = next;
    try { localStorage.setItem(CAREER_TASK_KEY, JSON.stringify(book)); } catch { /* The in-memory page still shows the last rendered state. */ }
    return next;
  }
  function noteDynamicReading(location) {
    const careerId = taskCareerId();
    const units = corpus()?.units || [];
    if (!location.unitId || !units.some(item => item.unitId === location.unitId)) return;
    const current = readCareerTask(careerId);
    const openedUnitIds = [...new Set([...current.openedUnitIds, location.unitId])];
    const allOpened = units.length > 0 && units.every(item => openedUnitIds.includes(item.unitId));
    const holdInterrupt = current.state === 'interrupted' && !location.resume && current.unitId === location.unitId && (current.sectionId || '') === (location.sectionId || '');
    const state = holdInterrupt ? 'interrupted' : (allOpened ? 'browsed' : 'in_progress');
    const contentVersion = location.version || careerState.career?.contentVersion || '';
    const same = current.state === state && current.unitId === location.unitId && (current.sectionId || '') === (location.sectionId || '') && current.openedUnitIds.length === openedUnitIds.length && current.contentVersion === contentVersion;
    if (same) return;
    writeCareerTask(careerId, { state, unitId: location.unitId, sectionId: location.sectionId || '', openedUnitIds, contentVersion, reason: holdInterrupt ? current.reason : '' });
  }
  function induceCareerTask(state, options = {}) {
    if (!TASK_STATES.includes(state)) return null;
    const careerId = options.careerId || taskCareerId();
    const units = corpus()?.units || [];
    const unitId = state === 'not_started' ? '' : (options.unitId || units[0]?.unitId || '');
    const openedUnitIds = state === 'browsed' ? units.map(item => item.unitId) : (state === 'not_started' || !unitId ? [] : [unitId]);
    return writeCareerTask(careerId, {
      state,
      unitId,
      sectionId: state === 'not_started' ? '' : (options.sectionId || ''),
      reason: state === 'interrupted' ? 'local-dev fixture：已中断，刷新后从保存位置恢复。' : 'local-dev fixture',
      contentVersion: options.contentVersion || careerState.career?.contentVersion || '',
      openedUnitIds
    });
  }
  function entryForCareer(first) {
    const task = readCareerTask();
    const copy = {
      not_started: { label: '尚未开始', title: '开始你的第一步', action: '开始学习', description: '从当前职业课程的第一篇开始，按路线建立阅读记录。' },
      in_progress: { label: '学习进行中', title: '继续学习', action: '继续学习', description: '阅读位置已保存，可从上次章节继续。' },
      interrupted: { label: '已中断', title: '恢复未完成的任务', action: '恢复任务', description: task.reason || '上次位置已保存，恢复后从中断处继续。' },
      browsed: { label: '已浏览', title: '回顾最近学习', action: '回顾学习', description: '当前课程已浏览。浏览只表示打开过，不表示通过或等级。' }
    }[task.state];
    const known = unit(task.unitId);
    const target = known || first;
    const sectionId = known ? task.sectionId : '';
    const place = known ? known.navigationLabel : '';
    return { ...copy, state: task.state, description: place && task.state !== 'not_started' ? place + ' · ' + copy.description : copy.description, href: href(target, sectionId) + (task.state === 'interrupted' ? '?resume=1' : ''), showInterrupt: task.state === 'in_progress' };
  }

  let accountSyncToken = 0, accountSyncPromise = null;
  function accountSession() { return globalThis.RolecraftAuthCareer?.getSession?.() || null; }
  function accountCareerId() { return accountSession()?.activeCareer?.careerId || ''; }
  function accountApi(path, options) { return globalThis.RolecraftAuthCareer?.api?.(path, options); }
  function redrawCareerView() { if (typeof render === 'function') render(); }
  function loadMarker(careerId) {
    try { return localStorage.getItem(CAREER_LOAD_MARKER + ':' + careerId + ':' + CURRENT) === '1'; } catch { return false; }
  }
  function markLoaded(careerId) {
    try { localStorage.setItem(CAREER_LOAD_MARKER + ':' + careerId + ':' + CURRENT, '1'); } catch { /* The visible loading state does not depend on storage. */ }
  }
  function scheduleCareerPhase(requestId) {
    clearTimeout(careerPhaseTimer);
    careerPhaseTimer = setTimeout(() => {
      if (careerState.requestId !== requestId || careerState.status !== 'loading') return;
      careerState = { ...careerState, phase: 'catalog' };
      redrawCareerView();
    }, 900);
  }
  function setCareerState(next) {
    const previous = careerState;
    careerState = { ...careerState, ...next };
    if (previous.status !== careerState.status || previous.careerId !== careerState.careerId || previous.error !== careerState.error) redrawCareerView();
  }
  async function loadPublicCareerCatalog(careerId) {
    const requestId = careerState.requestId + 1;
    careerState = { status: 'loading', phase: 'catalog', active: true, careerId, career: { careerId, title: '', summary: '', contentVersion: '' }, catalog: null, chapters: new Map(), chapterRequests: new Map(), chapterErrors: new Map(), error: '', requestId, startedAt: Date.now(), firstLoad: false, loadingChapterId: '' };
    redrawCareerView();
    try {
      if (location.protocol === 'file:') throw Error('当前页面需要通过本地服务加载职业教材。');
      const http = await fetch('/api/careers/' + encodeURIComponent(careerId) + '/content/catalog', { credentials: 'omit' });
      if (!http.ok) throw Error('职业教材目录没有返回。');
      const result = await http.json();
      if (careerState.requestId !== requestId) return;
      const version = result?.career?.contentVersion || result?.catalog?.corpusVersion || '';
      if (result?.career?.careerId !== careerId || !validCareerCatalog(result.catalog, version) || result.catalog.matchesManifest !== true) throw Error('职业教材来源与清单不一致，已停止显示正文。');
      careerState = { ...careerState, status: 'ready', phase: 'ready', career: result.career, catalog: result.catalog, chapters: new Map(), chapterRequests: new Map(), chapterErrors: new Map(), error: '', startedAt: 0, loadingChapterId: '' };
      redrawCareerView();
    } catch (error) {
      if (careerState.requestId !== requestId) return;
      careerState = { ...careerState, status: 'error', phase: 'error', error: error?.message || '职业教材目录加载失败。', catalog: null, chapters: new Map(), startedAt: 0, loadingChapterId: '' };
      redrawCareerView();
    }
  }
  async function loadCareerContent(session) {
    const career = session?.activeCareer;
    const careerId = career?.careerId || '';
    const changedCareer = careerState.careerId !== careerId;
    if (changedCareer) { query = ''; response = null; submission = null; dialogTopic = null; queryHistory = []; restoredResponse = false; assistantOpen = false; }
    careerController?.abort();
    careerController = null;
    clearTimeout(careerPhaseTimer);
    if (!careerId) {
      const route = careerRoute();
      if (route && !session?.user) { await loadPublicCareerCatalog(route.careerId); return; }
      const authenticated = Boolean(session?.user);
      careerState = { status: authenticated ? 'error' : 'anonymous', phase: 'idle', active: authenticated, careerId: '', career: null, catalog: null, chapters: new Map(), chapterRequests: new Map(), chapterErrors: new Map(), error: authenticated ? '当前账户没有可用职业，无法加载课程内容。' : '', requestId: careerState.requestId + 1, startedAt: 0, firstLoad: false, loadingChapterId: '' };
      redrawCareerView();
      return;
    }
    const requestId = careerState.requestId + 1;
    careerController = typeof AbortController === 'function' ? new AbortController() : null;
    careerState = { status: 'loading', phase: 'connecting', active: true, careerId, career: { ...career }, catalog: null, chapters: new Map(), chapterRequests: new Map(), chapterErrors: new Map(), error: '', requestId, startedAt: Date.now(), firstLoad: !loadMarker(careerId), loadingChapterId: '' };
    redrawCareerView();
    scheduleCareerPhase(requestId);
    const timeout = setTimeout(() => careerController?.abort(), CAREER_LOAD_TIMEOUT);
    try {
      if (location.protocol === 'file:') throw Error('当前页面需要通过本地服务加载当前职业教材。');
      const api = globalThis.RolecraftAuthCareer?.api;
      if (typeof api !== 'function') throw Error('职业账户服务尚未就绪。');
      const result = await api('/api/careers/' + encodeURIComponent(careerId) + '/content', { signal: careerController?.signal });
      if (careerState.requestId !== requestId) return;
      const catalog = result?.catalog;
      const contentVersion = result?.career?.contentVersion || '';
      if (!validCareerCatalog(catalog, contentVersion) || result?.career?.careerId !== careerId) throw Error('当前职业教材目录不完整或版本不受支持。');
      if (contentVersion !== CURRENT && catalog.matchesManifest !== true) throw Error('当前职业教材来源与清单不一致，已停止显示正文。');
      const chapters = new Map();
      for (const u of catalog.units) if (u.bodyMarkdown && Array.isArray(u.sections) && u.sections.some(s => s.bodyMarkdown)) chapters.set(u.unitId, { unit: u });
      careerState = { ...careerState, status: 'ready', phase: 'ready', career: { ...career, ...result.career }, catalog, chapters, chapterRequests: new Map(), chapterErrors: new Map(), error: '', startedAt: 0, loadingChapterId: '' };
      markLoaded(careerId);
      redrawCareerView();
      syncAccountRecords();
    } catch (error) {
      if (careerState.requestId !== requestId) return;
      const message = error?.name === 'AbortError' ? '学习服务响应时间较长，请确认本地服务仍在运行后重试。' : (error?.message || '当前职业教材加载失败。');
      careerState = { ...careerState, status: 'error', phase: 'error', error: message, catalog: null, chapters: new Map(), chapterRequests: new Map(), chapterErrors: new Map(), startedAt: 0, loadingChapterId: '' };
      redrawCareerView();
    } finally {
      clearTimeout(timeout);
      clearTimeout(careerPhaseTimer);
      careerController = null;
    }
  }
  function requestCareerChapter(unitId) {
    if (!dynamicCareer() || !unitId || careerState.chapters.has(unitId) || careerState.chapterRequests.has(unitId)) return;
    const careerId = careerState.careerId, requestId = careerState.requestId;
    // Record the in-flight request before redraw. readerPage asks for the chapter
    // during render, and redrawing first would re-enter this function forever.
    const request = (async () => {
      const chapterController = typeof AbortController === 'function' ? new AbortController() : null;
      const timeout = setTimeout(() => chapterController?.abort(), CAREER_LOAD_TIMEOUT);
      try {
        const endpoint = '/api/careers/' + encodeURIComponent(careerId) + '/content/chapter/' + encodeURIComponent(unitId);
        const api = globalThis.RolecraftAuthCareer?.api;
        const result = typeof api === 'function'
          ? await api(endpoint, { signal: chapterController?.signal })
          : await fetch(endpoint, { credentials: 'omit', signal: chapterController?.signal }).then(async http => { if (!http.ok) throw Error('当前章节没有返回'); return http.json(); });
        const chapter = result?.chapter;
        if (careerState.requestId !== requestId) return;
        const expectedVersion = careerState.career?.contentVersion || CURRENT;
        if (!chapter?.unit || chapter.unit.unitId !== unitId || chapter.corpusVersion !== expectedVersion || chapter.corpusHash !== careerState.catalog?.corpusHash || typeof chapter.unit.bodyMarkdown !== 'string' || !Array.isArray(chapter.unit.sections)) throw Error('当前章节内容不完整，无法显示。');
        careerState.chapters.set(unitId, chapter);
        careerState.chapterErrors.delete(unitId);
        careerState.loadingChapterId = '';
        redrawCareerView();
      } catch (error) {
        if (careerState.requestId !== requestId) return;
        careerState.chapterErrors.set(unitId, error?.name === 'AbortError' ? '本章响应时间较长，请重试。' : (error?.message || '当前章节加载失败。'));
        careerState.loadingChapterId = '';
        redrawCareerView();
      } finally {
        clearTimeout(timeout);
        careerState.chapterRequests.delete(unitId);
      }
    })();
    careerState.chapterRequests.set(unitId, request);
    careerState = { ...careerState, phase: 'chapter', loadingChapterId: unitId };
    redrawCareerView();
  }
  function accountRecordTarget(unitId, sectionId = '') {
    const u = unit(unitId), career = accountSession()?.activeCareer, careerId = career?.careerId || '', textbookVersionId = career?.textbookVersionId || '';
    if (!u || !careerId || !textbookVersionId) return null;
    return { careerId, textbookVersionId, unitId: u.unitId, sectionId: sectionId || '' };
  }
  async function syncAccountRecords() {
    const session = accountSession(); if (!session || !globalThis.RolecraftAuthCareer?.api) return;
    const careerId = session.activeCareer?.careerId, textbookVersionId = session.activeCareer?.textbookVersionId || '';
    if (!careerId || !textbookVersionId) return;
    const token = ++accountSyncToken;
    if (accountSyncPromise) return accountSyncPromise;
    accountSyncPromise = (async () => {
      try {
        const current = local.bookmarks.filter(currentRecord).slice(-80);
        const visits = local.visits.filter(currentRecord).slice(-40);
        const notes = Object.entries(local.notes).map(([unitId, note]) => ({ unitId, note })).filter(({ unitId, note }) => unit(unitId) && note?.corpusVersion === CURRENT && note.sourceSha256 === unit(unitId).sourceSha256 && asText(note.text).trim()).slice(-80);
        await Promise.allSettled([
          ...current.map(b => accountApi('/api/me/favorites', { method: 'POST', body: { ...accountRecordTarget(b.unitId, b.sectionId), sectionId: b.sectionId || '' } })),
          ...visits.map(v => Promise.allSettled([
            accountApi('/api/me/recent', { method: 'POST', body: accountRecordTarget(v.unitId, v.sectionId) }),
            accountApi('/api/me/progress', { method: 'POST', body: { ...accountRecordTarget(v.unitId, v.sectionId), state: 'opened' } })
          ])),
          ...notes.map(({ unitId, note }) => accountApi('/api/me/notes', { method: 'PUT', body: { ...accountRecordTarget(unitId), sectionId: '', noteText: asText(note.text) } }))
        ]);
        const [favoriteResult, recentResult, noteResult] = await Promise.all([
          accountApi('/api/me/favorites?careerId=' + encodeURIComponent(careerId)),
          accountApi('/api/me/recent?careerId=' + encodeURIComponent(careerId)),
          accountApi('/api/me/notes?careerId=' + encodeURIComponent(careerId))
        ]);
        if (token !== accountSyncToken) return;
        for (const f of favoriteResult?.favorites || []) {
          const u = unit(f.unitId); if (!u || f.sourceSha256 !== u.sourceSha256 || f.textbookVersionId !== textbookVersionId) continue;
          if (!local.bookmarks.some(b => currentRecord(b) && b.unitId === f.unitId && (b.sectionId || '') === (f.sectionId || ''))) local.bookmarks.push({ unitId: f.unitId, sectionId: f.sectionId || '', corpusVersion: CURRENT, corpusHash: corpus().corpusHash, sourceSha256: u.sourceSha256 });
        }
        for (const v of recentResult?.recent || []) {
          const u = unit(v.unitId); if (!u || v.sourceSha256 !== u.sourceSha256 || v.textbookVersionId !== textbookVersionId) continue;
          if (!local.visits.some(x => currentRecord(x) && x.unitId === v.unitId && (x.sectionId || '') === (v.sectionId || '') && x.at === v.visitedAt)) local.visits.push({ unitId: v.unitId, sectionId: v.sectionId || '', corpusVersion: CURRENT, corpusHash: corpus().corpusHash, sourceSha256: u.sourceSha256, at: v.visitedAt });
        }
        for (const n of noteResult?.notes || []) {
          const u = unit(n.unitId); if (!u || n.sourceSha256 !== u.sourceSha256 || n.textbookVersionId !== textbookVersionId) continue;
          const localNote = local.notes[n.unitId]; if (!localNote || String(n.updatedAt) > String(localNote.updatedAt || '')) local.notes[n.unitId] = { text: n.noteText, corpusVersion: CURRENT, sourceSha256: u.sourceSha256, updatedAt: n.updatedAt };
        }
        local.bookmarks = local.bookmarks.filter(currentRecord).slice(-200); local.visits = local.visits.filter(currentRecord).slice(-200); save();
      } catch { /* Account sync is additive; local reading remains available when service is offline. */ }
      finally { accountSyncPromise = null; }
    })();
    return accountSyncPromise;
  }
  function syncAccountEvent(kind, unitId, sectionId = '', extra = {}) {
    if (!accountSession()?.activeCareer?.careerId || !unit(unitId)) return;
    const target = accountRecordTarget(unitId, sectionId); if (!target) return;
    const request = kind === 'progress' ? accountApi('/api/me/progress', { method: 'POST', body: { ...target, state: extra.state || 'opened' } }) : accountApi('/api/me/recent', { method: 'POST', body: target });
    request?.catch?.(() => {});
  }
  async function syncAccountFavorite(unitId, sectionId, exists) {
    if (!accountSession()?.activeCareer?.careerId) return;
    const target = accountRecordTarget(unitId, sectionId); if (!target) return;
    try {
      if (!exists) { await accountApi('/api/me/favorites', { method: 'POST', body: target }); return; }
      const listed = await accountApi('/api/me/favorites?careerId=' + encodeURIComponent(target.careerId));
      const current = listed?.favorites?.find(f => f.unitId === target.unitId && (f.sectionId || '') === (target.sectionId || ''));
      if (current?.favoriteId) await accountApi('/api/me/favorites/' + encodeURIComponent(current.favoriteId), { method: 'DELETE' });
    } catch { /* Local removal remains authoritative when the service is offline. */ }
  }
  globalThis.addEventListener?.('rolecraft:authchange', event => {
    accountSyncToken++;
    loadCareerContent(event.detail?.session || null);
    if (event.detail?.session) syncAccountRecords();
  });
  // auth-career-v15 is loaded after this file; give it one turn to publish its
  // session API, then establish the anonymous/public or account-backed state.
  setTimeout(() => {
    if (globalThis.RolecraftAuthCareer) loadCareerContent(accountSession());
    else if (careerRoute()) loadPublicCareerCatalog(careerRoute().careerId);
  }, 0);
  globalThis.addEventListener?.('hashchange', () => {
    const route = careerRoute();
    if (!route || accountSession()?.activeCareer?.careerId) return;
    if (careerState.careerId === route.careerId && (careerState.status === 'ready' || careerState.status === 'loading')) return;
    loadPublicCareerCatalog(route.careerId);
  });
  function notify(message) {
    const node = document.getElementById('lw-status');
    if (node) node.textContent = message;
    else if (typeof toast === 'function') toast(message);
  }
  function asset(name, version) {
    const resolved = version || unitVersion();
    const entry = corpus(resolved)?.assets?.find(item => item.name === name);
    if (!entry) return '';
    return location.protocol === 'file:' ? entry.staticHref : entry.href || entry.staticHref;
  }
  function linkedAssetName(value) {
    const pathOnly = String(value || '').split(/[?#]/)[0];
    if (!pathOnly || /[\\\0]/.test(pathOnly) || pathOnly.startsWith('/') || /^[a-z][a-z0-9+.-]*:/i.test(pathOnly)) return '';
    const parts = pathOnly.split('/');
    if (parts.some(part => part === '')) return '';
    const name = parts[parts.length - 1];
    if (!/^[A-Za-z0-9][A-Za-z0-9_-]*\.(?:png|svg|dot)$/.test(name)) return '';
    const dirs = parts.slice(0, -1).filter(part => part !== '.');
    const direct = dirs.length === 1 && dirs[0] === 'assets';
    const fromChapter = dirs.length === 2 && dirs[0] === '..' && dirs[1] === 'assets';
    return direct || fromChapter ? name : '';
  }
  function slug(value) { return value.toLowerCase().replace(/[^\p{L}\p{N}\s_-]/gu, '').trim().replace(/\s+/g, '-'); }
  function resolveLink(raw, current, image = false) {
    let value;
    try { value = decodeURIComponent(raw); } catch { value = raw; }
    if (/^(https?:)\/\//i.test(value)) return image ? '' : value;
    if (/^(javascript|data|file|vbscript):/i.test(value) || value.startsWith('//')) return '';
    const version = unitVersion(current), c = corpus(version);
    const assetName = linkedAssetName(value);
    if (assetName) return asset(assetName, version);
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
    t = t.replace(/\[!\[([^\]\n]*)\]\(([^)\s]+)\)\]\([^)\s]+\)/g, '![$1]($2)');
    t = t.replace(/(!?)\[([^\]\n]*)\]\(([^\s)]+)(?:\s+"[^"]*")?\)/g, (_, img, label, raw) => {
      const url = resolveLink(raw, u, !!img);
      if (!url) return token('<span class="lw-unavailable-link">' + esc(label) + ' <small>（参考位置暂未提供）</small></span>');
      if (img) return token('<figure class="lw-figure"><button type="button" data-lw-image="' + esc(url) + '" data-lw-alt="' + esc(label) + '" aria-label="放大查看：' + esc(label) + '"><img src="' + esc(url) + '" alt="' + esc(label) + '" loading="lazy"></button><figcaption><button type="button" data-lw-image="' + esc(url) + '" data-lw-alt="' + esc(label) + '">放大查看</button></figcaption></figure>');
      return token('<a href="' + esc(url) + '"' + (/^https?:/.test(url) ? ' target="_blank" rel="noopener noreferrer"' : '') + '>' + esc(label) + '</a>');
    });
    t = esc(t).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>');
    return t.replace(/\u0001(\d+)\u0002/g, (_, i) => values[Number(i)] || '');
  }
  function hiddenLearningContinuity(u) {
    if (unitVersion(u) !== CURRENT) return [];
    const lines = u.bodyMarkdown.replace(/\r\n?/g, '\n').split('\n');
    return u.sections.filter(s => s.level === 2 && s.title === 'v12 学习衔接' && lines[s.startLine - 1] === '## v12 学习衔接').map(s => {
      const endLine = u.sections.find(next => next.startLine > s.startLine && next.level <= s.level)?.startLine || lines.length + 1;
      return {startLine:s.startLine,endLine,sectionIds:u.sections.filter(child => child.startLine >= s.startLine && child.startLine < endLine).map(child => child.sectionId)};
    });
  }
  function markdown(u, hideLearningContinuity = false) {
    const lines = u.bodyMarkdown.replace(/\r\n?/g, '\n').split('\n'), out = [], byLine = new Map(u.sections.map(s => [s.startLine, s]));
    const hiddenRanges = hideLearningContinuity ? hiddenLearningContinuity(u) : [];
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
    // v13 editorial previews may wrap a fenced code block in a native details
    // element. Keep the contract in the renderer: long examples are collapsed,
    // short examples remain visible, and malformed blocks fall back to normal
    // Markdown text instead of being silently discarded.
    const collapsedCodeHTML = (summary, language, source) => {
      const lines = source.length ? source.length : 1;
      const open = lines <= 10 ? ' open' : '';
      const label = language || '代码';
      return '<details class="lw-code lw-code-details"' + open + '><summary>' + inline(summary || ('展开' + label + '代码'), u) + '<span class="lw-code-meta">' + esc(label) + ' · ' + lines + ' 行 · 网页不执行代码</span></summary><pre tabindex="0"><code>' + esc(source.join('\n')) + '</code></pre></details>';
    };
    const detailsCode = start => {
      if (lines[start]?.trim() !== '<details>') return null;
      const summaryMatch = (lines[start + 1] || '').match(/^\s*<summary>([\s\S]*)<\/summary>\s*$/i);
      if (!summaryMatch) return null;
      const fence = (lines[start + 2] || '').match(/^\s*```([^`]*)$/);
      if (!fence) return null;
      const source = [];
      let close = start + 3;
      while (close < lines.length && !/^\s*```\s*$/.test(lines[close])) { source.push(lines[close]); close++; }
      if (close >= lines.length || (lines[close + 1] || '').trim().toLowerCase() !== '</details>') return null;
      return { html: collapsedCodeHTML(summaryMatch[1], fence[1].trim(), source), end: close + 1 };
    };
    const flush = () => { flushPara(); flushList(); flushQuote(); };
    const cells = l => l.trim().replace(/^\|/, '').replace(/\|$/, '').split(/(?<!\\)\|/).map(c => c.trim().replace(/\\\|/g, '|'));
    for (let i = 0; i < lines.length; i++) {
      const hiddenRange = hiddenRanges.find(range => range.startLine === i + 1);
      if (hiddenRange) { flush(); i = hiddenRange.endLine - 2; continue; }
      const line = lines[i];
      if (code !== null) { if (/^\s*```\s*$/.test(line)) { out.push('<div class="lw-code"><span>' + esc(lang || '代码') + ' · 网页不执行代码</span><pre tabindex="0"><code>' + esc(code.join('\n')) + '</code></pre></div>'); code = null; } else code.push(line); continue; }
      const details = detailsCode(i);
      if (details) { flush(); out.push(details.html); i = details.end; continue; }
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
  function loadingPage(scope = 'catalog') {
    const firstLoad = careerState.firstLoad;
    const chapter = scope === 'chapter';
    const phase = chapter ? 'chapter' : (careerState.phase === 'catalog' ? 'catalog' : 'connecting');
    const labels = chapter ? ['已连接学习服务', '正在读取本章正文', '准备进入阅读'] : ['连接学习服务', '读取教材目录', '准备课程入口'];
    const activeIndex = chapter ? 1 : (phase === 'catalog' ? 1 : 0);
    const title = chapter ? '正在打开本章' : '正在准备教材';
    const description = chapter ? '章节内容正在从学习服务读取，页面会自动更新。' : firstLoad ? '首次使用需要下载并整理教材内容，可能需要几十秒。请保持页面打开，不要重复点击。' : '正在读取当前职业教材，通常需要几秒。请保持页面打开。';
    const steps = labels.map((label, index) => '<li class="' + (index < activeIndex ? 'is-done ' : '') + (index === activeIndex ? 'is-active' : '') + '"><span aria-hidden="true">' + (index < activeIndex ? '✓' : String(index + 1)) + '</span>' + label + '</li>').join('');
    return heading('职业学习', title, esc(description)) + '<section class="lw-loading-card" role="status" aria-live="polite" aria-atomic="true"><div class="lw-loading-mark" aria-hidden="true"><span></span></div><div class="lw-loading-copy"><strong>' + esc(labels[activeIndex]) + '…</strong><p>' + esc(firstLoad && !chapter ? '这是首次准备教材，内容较多，等待期间可以先不要操作。' : '连接保持中，完成后会自动显示内容。') + '</p><div class="lw-loading-track" aria-hidden="true"><span></span></div><ol class="lw-loading-steps">' + steps + '</ol></div></section><p class="lw-loading-note">如果超过两分钟仍没有变化，请确认本地学习服务正在运行，再使用失败页上的重试。</p>';
  }
  function errorPage(message, action = 'reload') {
    const retry = action === 'chapter' ? '<button class="outline" data-lw-retry-chapter="' + esc(careerState.loadingChapterId || loc().unitId) + '">重试本章</button>' : '<button class="outline" data-lw-reload>重新加载</button>';
    return heading('教材阅读', '教材资源暂不可用', esc(message)) + retry + '<a class="outline" href="#home">返回工作台</a>';
  }
  function startSelect() {
    return '<div class="lw-start"><label for="lw-starting-point">我的学习起点</label><select id="lw-starting-point"><option value="">尚未选择</option>' + Object.entries(STARTS).map(([id, label]) => '<option value="' + id + '"' + (local.startingPoint === id ? ' selected' : '') + '>' + label + '</option>').join('') + '</select><span>自选起点只记录阅读偏好</span></div>';
  }
  function unitLink(u, klass = '') { return '<a class="' + klass + '" href="' + href(u) + '"><span class="lw-num">' + String(u.order).padStart(2, '0') + '</span><span>' + esc(u.navigationLabel) + '</span></a>'; }
  function catalog() {
    const c = corpus();
    return '<div class="lw-catalog">' + (c?.units || []).map(u => '<details class="lw-unit"><summary><span class="lw-num">' + String(u.order).padStart(2, '0') + '</span><span><strong>' + esc(u.navigationLabel || u.title) + '</strong><small>' + esc(u.title) + '</small></span><span class="lw-chevron">＋</span></summary><div class="lw-unit-detail"><a class="primary" href="' + href(u) + '">阅读本篇 →</a><ul>' + (u.sections || []).filter(s => s.level > 1).map(s => '<li><a href="' + href(u, s.sectionId) + '">' + esc(s.title) + '</a></li>').join('') + '</ul></div></details>').join('') + '</div>';
  }
  function stages() {
    return '<div class="lw-stages">' + STAGES.map((st, i) => '<section class="lw-stage"><div class="lw-stage-number">' + String(i + 1).padStart(2, '0') + '</div><div><h2>' + st.title + '</h2><p>' + st.output + '</p><div class="lw-stage-links">' + st.ids.map(id => unitLink(unit(id))).join('') + '</div></div></section>').join('') + '</div>';
  }
  function learningProgress() {
    const units = corpus()?.units || [], visited = new Set(local.visits.filter(currentRecord).map(v => v.unitId));
    const latest = local.visits.filter(currentRecord).at(-1);
    return { total: units.length, count: units.filter(u => visited.has(u.unitId)).length, latest, first: units[0], completed: Boolean(units.length && units.every(u => visited.has(u.unitId))) };
  }
  function practiceLoopCard() {
    return '<section class="lw-p01-card lw-career-practice" id="lw-career-practice" aria-labelledby="lw-career-practice-title"><div class="lw-p01-head"><div><span class="lw-kicker">静态阅读 · 练习</span><h2 id="lw-career-practice-title">练习草稿、提交与反馈</h2><p>当前入口提供静态教材阅读。自动评分未接入。先保存草稿，再提交练习。练习反馈只回显你写下的内容，不表示通过或等级。</p></div></div><form id="lw-career-practice-form" class="lw-p01-form"><label for="lw-career-draft">练习草稿<small>写在本页，关闭前请自行保留。</small><textarea id="lw-career-draft" name="careerDraft" rows="4" maxlength="4000">' + esc(careerPractice.draft) + '</textarea></label><div class="lw-p01-actions"><button class="outline" type="button" data-lw-career-draft-save>保存草稿</button><button class="primary" type="button" data-lw-career-practice-submit>提交练习</button></div><p id="lw-career-practice-feedback" class="lw-small" role="status" aria-live="polite">' + esc(careerPractice.feedback) + '</p></form></section>';
  }
  function homePage(routeOnly = false) {
    if (!corpus()) {
      if (careerRoute()) return practiceLoopCard() + (careerState.status === 'error' ? errorPage(careerState.error || '当前职业教材没有完整加载。') : loadingPage());
      if (careerState.active && careerState.status === 'loading') return loadingPage();
      return errorPage(careerState.active ? (careerState.error || '当前职业教材没有完整加载；不会用 Agent 教材替代。') : '当前 v12 教材包没有完整加载；不会使用其他版本替代。');
    }
    const progress = learningProgress(), latest = progress.latest, first = progress.first;
    const graphSection = first.sections.find(s => s.title === '一套可交付系统还需要哪些工程工作');
    const showCatalog = dynamicCareer() || location.hash === '#learn' || location.hash === '#learn/agent';
    const careerTitle = careerState.career?.title || 'Agent 开发者', careerSummary = careerState.career?.summary || '读懂一个系统怎样工作，再用实际作品验证你的想法。';
    const countLabel = dynamicCareer() ? String(corpus().units.length) + ' 篇' : '30 篇';
    const careerEntry = (dynamicCareer() || careerRoute()) ? entryForCareer(first) : null;
    const entryState = careerEntry || (progress.completed ? { label: '当前课程已完整浏览', title: '回顾最近学习', description: latest ? esc(unit(latest.unitId).navigationLabel) + ' · 已浏览 ' + progress.count + '/' + progress.total + ' 篇' : '课程记录已完成，可从最近位置复习。', action: '回顾学习' } : latest ? { label: '学习进行中', title: '继续学习', description: esc(unit(latest.unitId).navigationLabel) + ' · 已浏览 ' + progress.count + '/' + progress.total + ' 篇', action: '继续学习' } : { label: '尚未开始', title: '开始你的第一步', description: '从当前职业课程的第一篇开始，按路线建立阅读记录。', action: '开始学习' });
    const entryUnit = latest ? unit(latest.unitId) : first;
    const entryHref = careerEntry ? careerEntry.href : href(entryUnit, latest?.sectionId || '');
    const entryAttrs = careerEntry ? ' data-task-state="' + esc(careerEntry.state) + '" data-task-cta="' + esc(careerEntry.action) + '"' : '';
    const interruptControl = careerEntry?.showInterrupt ? '<button class="outline" type="button" data-lw-interrupt>中断并保存位置</button>' : '';
    const practice = careerRoute() ? practiceLoopCard() : '';
    return '<div class="lw-home">' + practice + heading('职业学习 · ' + esc(careerTitle), esc(careerTitle), esc(careerSummary)) + startSelect() + '<section class="lw-entry"' + (careerEntry ? ' data-task-state="' + esc(careerEntry.state) + '"' : '') + ' aria-labelledby="lw-entry-title"><div class="lw-entry-copy"><span class="lw-entry-status">' + esc(entryState.label) + '</span><h2 id="lw-entry-title">' + esc(entryState.title) + '</h2><p>' + (careerEntry ? esc(entryState.description) : entryState.description) + '</p><small>学习记录只表示浏览位置，不表示通过或等级</small></div><a class="primary"' + entryAttrs + ' href="' + entryHref + '">' + esc(entryState.action) + ' →</a>' + interruptControl + '</section>' + (local.startingPoint === 'beginner' && !dynamicCareer() ? '<div class="lw-route-hint">零基础起步：先读开篇，再做<a href="' + href(unit('01-foundation'), unit('01-foundation').sections.find(s => s.title === '先做入口诊断')?.sectionId) + '">基础诊断</a>，按实际缺项补学。</div>' : local.startingPoint && !dynamicCareer() ? '<div class="lw-route-hint">已有基础：可直接查具体问题。正式先修保留在各篇说明中，不锁住阅读。</div>' : '') + '<div class="lw-tabs" aria-label="教材浏览方式"><a href="#path"' + (!showCatalog ? ' aria-current="page"' : '') + '>学习路线</a><a href="#learn"' + (showCatalog ? ' aria-current="page"' : '') + '>课程目录 <small>' + countLabel + '</small></a></div>' + (showCatalog ? catalog() : stages()) + (!routeOnly && !showCatalog ? '<section class="lw-panorama"><div><span class="lw-kicker">先看全貌</span><h2>Agent 工程不止是一次模型调用</h2><p>从问题、组件到验证与交付，找到章节所处的环节。组件按需求采用，图中分组不替代正式阅读顺序。</p><a href="' + href(first, graphSection?.sectionId) + '">查看工程全景与章节位置 →</a></div><button type="button" data-lw-image="' + esc(asset('agent-engineering-landscape-v12.png')) + '" data-lw-alt="Agent工程全景与30篇章节位置"><img src="' + esc(asset('agent-engineering-landscape-v12.png')) + '" alt="Agent工程全景与30篇章节位置" loading="lazy"><span>放大工程全景</span></button></section>' : '') + '</div>';
  }
  function readerPage() {
    const location = loc(), c = corpus(location.version);
    if (!c) {
      if (careerRoute()) return practiceLoopCard() + (careerState.status === 'error' ? errorPage(careerState.error || '当前职业教材没有完整加载。') : loadingPage());
      if (careerState.active && careerState.status === 'loading') return loadingPage();
      return errorPage('当前 v12 教材没有完整加载；不会替换为其他来源。');
    }
    if (!location.unitId) return homePage(true);
    const u = unit(location.unitId, location.version); if (!u) return errorPage('请求的章节不属于所选教材版本。');
    if (dynamicCareer() && (!u.bodyMarkdown || !Array.isArray(u.sections) || u.sections.some(s => !s.bodyMarkdown))) {
      const chapterError = careerState.chapterErrors.get(location.unitId);
      if (!chapterError) requestCareerChapter(location.unitId);
      return chapterError ? errorPage(chapterError, 'chapter') : loadingPage('chapter');
    }
    const s = section(u, location.sectionId), index = c.units.indexOf(u);
    const hiddenRanges = hiddenLearningContinuity(u), hiddenSection = id => hiddenRanges.some(range => range.sectionIds.includes(id));
    const hiddenNotice = hiddenSection(location.sectionId) ? '<div class="lw-message lw-hidden-section" id="lw-hidden-section" tabindex="-1"><p>此学习衔接区块已从阅读页隐藏</p><a href="' + href(u) + '">打开本篇正文</a> <a href="#learn">返回课程</a></div>' : '';
    const bookmark = local.bookmarks.some(b => currentRecord(b) && b.unitId === u.unitId && b.sectionId === (s?.sectionId || ''));
    const missingLocation = location.sectionId && !s ? '<div class="lw-message" role="alert">这处教材位置在当前版本中不可用。可<a href="' + href(u) + '">打开本章</a>。</div>' : '';
    const prerequisites = Array.isArray(u.prerequisiteUnitIds) ? u.prerequisiteUnitIds.map(id => unit(id, location.version)) : dynamicCareer() ? [] : null;
    if (!prerequisites || prerequisites.some(p => !p)) return errorPage('本篇前置章节来源无法核对，请重新加载教材。');
    const prereqLabel = prerequisites.length ? '需掌握的前置 · ' + prerequisites.length + ' 篇' : '需掌握的前置：无';
    const priorHTML = '<aside class="lw-prerequisites" id="lw-prerequisites" aria-labelledby="lw-prereq-title"><h2 id="lw-prereq-title" tabindex="-1">需掌握的前置</h2>' + (prerequisites.length ? '<ul>' + prerequisites.map(p => '<li><a href="' + esc(href(p)) + '">' + esc(p.navigationLabel) + '</a></li>').join('') + '</ul>' : '<p>无前置章节</p>') + '</aside>';
    const noteArea = '<section class="lw-note-area"><h2>我的阅读笔记</h2><p>只保存在此浏览器，记录本篇疑问与实际尝试。</p><label for="lw-note">本篇笔记</label><textarea id="lw-note" rows="5" maxlength="12000">' + esc(noteText(u)) + '</textarea><button class="primary" data-lw-save-note>保存笔记</button></section>';
    return '<div class="lw-reader-layout lw-detail"><div class="lw-reader-top" id="lw-reader-start" tabindex="-1"><a href="#learn">← 返回课程</a><span>' + esc(u.navigationLabel) + '</span></div>' + missingLocation + hiddenNotice + '<div class="lw-prereq-strip" id="lw-prereq-strip"><span>' + esc(prereqLabel) + '</span>' + (prerequisites.length ? '<button type="button" data-lw-prereq-location aria-label="查看需掌握的前置章节">查看章节</button>' : '') + '</div><div class="lw-reader-columns">' + priorHTML + '<div class="lw-reading"><details class="lw-section-toc"><summary>本篇小节</summary><ul>' + u.sections.filter(s => s.level > 1 && !hiddenSection(s.sectionId)).map(s => '<li class="lw-level-' + s.level + '"><a href="' + href(u, s.sectionId) + '">' + esc(s.title) + '</a></li>').join('') + '</ul></details><article class="lw-prose" aria-label="' + esc(u.title) + '">' + markdown(u, true) + '</article><div class="lw-reader-tools"><button class="outline" data-lw-bookmark>' + (bookmark ? '已收藏此位置 · 取消' : '收藏当前阅读位置') + '</button><button class="outline" type="button" data-lw-interrupt>中断并保存位置</button></div>' + noteArea + '<nav class="lw-pagination" aria-label="相邻篇章">' + (index > 0 ? '<a href="' + href(c.units[index - 1]) + '">← 上一篇<br><strong>' + esc(c.units[index - 1].navigationLabel) + '</strong></a>' : '<a href="#learn">返回课程</a>') + (index < c.units.length - 1 ? '<a href="' + href(c.units[index + 1]) + '">下一篇 →<br><strong>' + esc(c.units[index + 1].navigationLabel) + '</strong></a>' : '<a href="#projects">带着作品复盘 →</a>') + '</nav></div></div></div>';
  }
  function projectsPage() {
    if (!corpus()) return careerState.active && careerState.status === 'loading' ? loadingPage() : errorPage('项目章节指引尚未加载。');
    const labels = { title: '我的项目名称', problem: '要解决的真实问题', evidence: '用户、现有方案与比较证据', result: '已取得的实际结果与作品位置', gap: '未达标准的部分与原因', next: '下一步、责任人与复验方法' };
    const selfReport = Object.values(local.project).some(value => asText(value).trim()) ? '自述已填写' : '自述待填写';
    const runtimeEvidence = asText(local.project.evidence).trim() || asText(local.project.result).trim() ? '运行证据：已提供' : '运行证据：缺失';
    const p = practiceSource(), values = practiceDraftValues(), practice = local.practice || emptyPractice(), status = practiceStatus();
    const currentSubmission = practice.submissions.find(s => s.submission_id === practice.currentSubmissionId) || practice.submissions.at(-1);
    const statusOptions = Object.entries(P01_STATUS_LABELS).map(([value, label]) => '<option value="' + esc(value) + '"' + (status === value ? ' selected' : '') + '>' + esc(label) + '</option>').join('');
    const recordLayers = [
      ['self_report', '本人自述', values.learnerClaims.trim() ? '已填写' : '未开始', values.learnerClaims.trim() ? 'self' : 'pending'],
      ['run_receipt', '运行证据', values.evidenceRefs.trim() ? '已提供' : '未提供', values.evidenceRefs.trim() ? 'present' : 'missing'],
      ['ai_suggestion', 'AI 建议', '未生成（not_run）', 'pending'],
      ['professional_review', '专业评审', currentSubmission ? (status === '发现问题' ? '复验发现问题' : status === '证据不足' ? '证据不足' : '待独立复验') : '未开始', 'pending'],
      ['human_review', '真人评审', '未验证', 'pending']
    ];
    const submissionHistory = practice.submissions.length ? '<details class="lw-p01-history"><summary>历史提交 · ' + practice.submissions.length + ' 个版本（旧提交只读保留）</summary><ol>' + [...practice.submissions].reverse().map(s => '<li><strong>' + esc(s.artifact_version) + '</strong><span>' + esc(P01_STATUS_LABELS[s.workflow_status] || s.workflow_status || '未开始') + '</span><small>submission_id：' + esc(s.submission_id) + ' · previous_submission_id：' + esc(s.previous_submission_id || '无') + ' · ' + esc(s.created_at) + '</small></li>').join('') + '</ol></details>' : '<p class="lw-small">尚未提交作品包；保存草稿不会生成提交版本。</p>';
    const p01Form = '<section class="lw-p01-card" aria-labelledby="lw-p01-title"><div class="lw-p01-head"><div><span class="lw-kicker">V1-PILOT · P01-MVP</span><h2 id="lw-p01-title">最小可交付练习：缺陷契约</h2><p>固定构造输入只用于学习练习，不是真实客户问题、退款规则或用户反馈。先保存版本化草稿，再主动提交作品包。</p></div><a class="outline" href="' + esc(p.sourceHref) + '">回到教材来源 →</a></div><div class="lw-p01-identity" aria-label="P01来源身份"><span>练习：' + esc(P01.practiceId) + '</span><span>教材：' + esc(P01.textbookVersion) + '</span><span>来源：' + esc(P01.sourcePath) + '</span><span>fixture：' + esc(P01.fixtureId) + '</span><span class="lw-hash">sourceSha256：' + esc(p.sourceSha256) + '</span><span>submission_id：' + esc(currentSubmission?.submission_id || '未提交') + '</span><span>previous_submission_id：' + esc(currentSubmission?.previous_submission_id || '无') + '</span></div><div class="lw-p01-status-row"><span class="lw-p01-status status-' + esc(status) + '"><b>作品状态</b> · ' + esc(P01_STATUS_LABELS[status]) + '</span><span class="lw-p01-status-note">' + (practice.draftSaved ? '草稿已保存，提交后才进入独立复验队列。' : '尚无当前版本草稿。') + '</span></div><form id="lw-p01-form" class="lw-p01-form">' + P01_ITEMS.map(([id, label, hint]) => '<label for="lw-p01-' + id + '">' + esc(label) + '<small>' + esc(hint) + '</small><textarea id="lw-p01-' + id + '" name="' + id + '" rows="4" maxlength="12000">' + esc(values[id]) + '</textarea></label>').join('') + '<label for="lw-p01-claims">本人自述（目标、困难、未知）<small>只表示你的陈述，不转换为独立评价。</small><textarea id="lw-p01-claims" name="learnerClaims" rows="4" maxlength="12000">' + esc(values.learnerClaims) + '</textarea></label><label for="lw-p01-evidence">证据引用（每行一条路径、命令或 receipt ID）<small>未执行请写 not_run；不要补写预期输出。</small><textarea id="lw-p01-evidence" name="evidenceRefs" rows="3" maxlength="6000">' + esc(values.evidenceRefs) + '</textarea></label><div class="lw-p01-actions"><button class="outline" type="button" data-lw-p01-save>保存版本化草稿</button><button class="primary" type="button" data-lw-p01-submit>提交新作品版本</button><button class="outline" type="button" data-lw-export>导出记录</button></div><p id="lw-p01-feedback" class="lw-small" role="status" aria-live="polite">提交会生成新的 submission_id；不会覆盖旧提交、旧意见或首失败记录。</p></form><div class="lw-p01-layers" aria-label="五类记录层级">' + recordLayers.map(([id, label, value, klass]) => '<div class="lw-p01-layer ' + klass + '"><span aria-hidden="true">' + (klass === 'present' || klass === 'self' ? '●' : '○') + '</span><strong>' + esc(label) + '</strong><em>' + esc(value) + '</em><small>' + (id === 'ai_suggestion' ? '机器建议，不是审核' : id === 'professional_review' ? '独立课程/实训评阅' : id === 'human_review' ? '1.0暂无真人记录' : '事实记录') + '</small></div>').join('') + '</div><div class="lw-p01-review-control"><label for="lw-p01-status">记录当前工作流状态（本人记录，不是独立评审）</label><select id="lw-p01-status" data-lw-p01-status>' + statusOptions + '</select><button class="outline" type="button" data-lw-p01-status-save>保存状态记录</button></div>' + submissionHistory + '</section>';
    return heading('实作与作品', '项目工坊', '先从一个版本化练习开始，再把证据、反馈和下一步分开保存。') + p01Form + '<div class="lw-project-layout"><section class="lw-project-form"><h2>我的项目档案</h2><p>记录保存在此浏览器，链接不自动访问或运行。</p><div class="lw-evidence-status" aria-label="项目证据状态"><span class="lw-evidence-chip self">' + selfReport + '</span><span class="lw-evidence-chip ' + (runtimeEvidence.endsWith('已提供') ? 'present' : 'missing') + '">' + runtimeEvidence + '</span><span class="lw-evidence-chip pending">独立评价：未开始</span></div>' + Object.entries(labels).map(([id, label]) => '<label for="lw-project-' + id + '">' + label + '</label>' + (id === 'title' ? '<input id="lw-project-' + id + '" data-lw-project="' + id + '" maxlength="12000" value="' + esc(local.project[id]) + '">' : '<textarea id="lw-project-' + id + '" data-lw-project="' + id + '" rows="4" maxlength="12000">' + esc(local.project[id]) + '</textarea>')).join('') + '<button class="primary" data-lw-save-project>保存项目档案</button><button class="outline" data-lw-export>导出记录</button><p class="lw-small">自述资料与运行证据分别记录；独立评价和专业审核不会由本页面自动完成。</p></section><aside class="lw-project-guide"><h2>按教材推进实作</h2>' + STAGES.map(st => '<section><h3>' + st.title + '</h3><p>' + st.output + '</p>' + st.ids.map(id => unitLink(unit(id))).join('') + '</section>').join('') + '<a href="#product-review">进入产品达标复盘 →</a><a href="#projects-history">查看历史项目记录 →</a></aside></div>';
  }
  function recordsPage() {
    if (!corpus()) return careerState.active && careerState.status === 'loading' ? loadingPage() : errorPage(careerState.active ? (careerState.error || '当前职业教材没有完整加载，暂时无法核对学习记录。') : '教材版本未加载，无法核对记录中的阅读位置。');
    const visits = local.visits.filter(currentRecord).slice(-20).reverse(), bookmarks = local.bookmarks.filter(currentRecord);
    const link = v => '<a href="' + href(unit(v.unitId), v.sectionId) + '">' + esc(unit(v.unitId).navigationLabel) + (v.sectionId ? ' · ' + esc(section(unit(v.unitId), v.sectionId)?.title) : '') + '</a>';
    const history = dynamicCareer() ? '<p class="lw-small">当前职业记录按职业隔离；切换回原职业后再查看其他职业的记录。</p>' : '';
    return heading('本浏览器的足迹', '学习记录', dynamicCareer() ? '当前职业的阅读、收藏和笔记按职业保存。' : '当前教材 v12。阅读、收藏和笔记不换算成完成率或能力等级。') + '<div class="lw-record-toolbar"><button class="outline" data-lw-export>导出当前学习记录</button><a href="#reflections">打开学习与员工复盘 →</a></div><section class="lw-record-section"><h2>当前职业收藏的位置</h2>' + (bookmarks.length ? '<ul>' + bookmarks.map(v => '<li>' + link(v) + '</li>').join('') + '</ul>' : '<p>还没有收藏。阅读时可以收藏当前章或小节。</p>') + '</section><section class="lw-record-section"><h2>当前职业最近阅读</h2>' + (visits.length ? '<ul>' + visits.map(v => '<li>' + link(v) + '<time>' + esc(new Date(v.at).toLocaleString('zh-CN')) + '</time></li>').join('') + '</ul>' : '<p>还没有打开过当前职业教材正文。</p>') + '</section><section class="lw-record-section"><h2>当前职业阅读笔记</h2>' + corpus().units.filter(u => noteText(u).trim()).map(u => '<details><summary>' + esc(u.navigationLabel) + '</summary><p class="lw-user-text">' + esc(noteText(u)) + '</p><a href="' + href(u) + '">回到本篇</a></details>').join('') + '</section>' + history + '<p class="lw-small">保存范围：本浏览器。记录不会换算成完成率或能力等级。</p>';
  }
  function canonicalTopic(value) {
    if (!value || value.corpusVersion !== CURRENT) return null;
    const u = unit(value.unitId), s = section(u, value.sectionId);
    if (!u || !s || typeof s.bodyMarkdown !== 'string' || value.sourceSha256 !== u.sourceSha256) return null;
    const prose = s.bodyMarkdown.replace(/```[^\n]*\n[\s\S]*?```/g, '').replace(/!\[[^\]]*\]\([^)]*\)/g, '').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/`([^`]+)`/g, '$1');
    if (value.focusTerm != null && (typeof value.focusTerm !== 'string' || !/^[-A-Za-z0-9]{2,40}$/.test(value.focusTerm) || !prose.toLowerCase().includes(value.focusTerm.toLowerCase()))) return null;
    return { unitId: u.unitId, sectionId: s.sectionId, corpusVersion: CURRENT, sourceSha256: u.sourceSha256, ...(value.focusTerm ? {focusTerm:value.focusTerm} : {}) };
  }
  function currentContext() {
    const l = loc(), related = globalThis.LearningExperienceV13?.queryContext?.(), u = activeView === 'learn' && l.version === CURRENT ? unit(l.unitId) : unit(related?.unitId);
    const currentUnitId = contextEnabled && u ? u.unitId : null;
    const currentSectionId = contextEnabled && u ? section(u, activeView === 'learn' ? l.sectionId : related?.sectionId)?.sectionId || null : null;
    const career = careerState.active ? careerState.career : null;
    const c = { careerId: careerState.active ? careerState.careerId : AGENT_CAREER_ID, contentVersion: career?.contentVersion || CURRENT, textbookVersionId: career?.textbookVersionId || null, startingPoint: startingEnabled ? (globalThis.LearningExperienceV13?.startingPoint?.() ?? local.startingPoint) : null, currentUnitId, currentSectionId, useCurrentContext: Boolean(currentUnitId), corpusVersion: career?.contentVersion || CURRENT };
    const topic = canonicalTopic(dialogTopic); if (topic) c.previousContext = topic;
    return c;
  }
  function modeLabel(r) {
    if (r?.dialog?.answerMode === 'extractive' && /semantic/.test(r?.engineMode || '')) return '教材原文提取 · 离线语义检索';
    if (/semantic|embedding/.test(r?.engineMode || '')) return '离线语义检索 · 查询留在本机';
    if (/concept|rule/.test(r?.engineMode || '')) return '当前使用规则检索';
    return '依据当前教材';
  }
  function isRuleFallback(r) { return /concept|rule|static_rules/i.test(String(r?.engineMode || '')); }
  function resultHTML() {
    if (pending) return '<div class="lw-assistant-state lw-state-loading" role="status" aria-live="polite" aria-atomic="true"><span class="lw-state-mark lw-query-spinner" aria-hidden="true"><span></span></span><div><h3>正在查找教材依据</h3><p>请求 ' + esc(submission?.requestId || '生成中') + ' · 正在向当前教材检索服务查询；完成后会显示原文和出处。等待期间不会重复提交。</p><div class="lw-query-indeterminate" aria-hidden="true"><span></span></div></div></div>';
    if (!response) return '<div class="lw-find-empty"><h3>把学习或项目问题说出来</h3><p>根据 v12 教材简答，并提供对应章节入口。职业知识以外的问题会被过滤。</p><div class="lw-examples"><button data-lw-example="ReAct是什么">ReAct 是什么</button><button data-lw-example="程序改了一版，怎么判断效果真的变好了">怎样比较改动后的效果</button></div></div>';
    const d = response.dialog || {}, status = d.status || response.status;
    const identity = { contentVersion: response?.contentVersion || response?.corpusVersion || '', textbookVersionId: response?.textbookVersionId || '', indexVersion: response?.indexVersion || '', corpusHash: response?.corpusHash || '' };
    const identityValue = value => esc(value || '服务未提供');
    const head = '<div class="lw-result-meta">' + (restoredResponse ? '<p class="lw-small">本会话此前问题' + (status === 'answered' ? ' · 已重新核对当前教材出处' : '') + '</p>' : '') + '<p><strong>已提交问题：</strong>' + esc(submission?.query || query) + '</p><span class="lw-mode">请求 ' + esc(response?.requestId || submission?.requestId || '未知') + ' · ' + esc(modeLabel(response)) + '</span><details class="lw-result-identity"><summary>查看本次版本身份</summary><p>教材版本：' + identityValue(identity.contentVersion) + '<br>教材身份：' + identityValue(identity.textbookVersionId) + '<br>索引版本：' + identityValue(identity.indexVersion) + '<br>语料 SHA256：' + identityValue(identity.corpusHash) + '</p></details></div>';
    if (status === 'unavailable') return head + (isRuleFallback(response) ? '<div class="lw-fallback-notice" role="note"><strong>规则降级</strong><span>当前未调用外部模型；规则检索也未返回可核对结果。</span></div>' : '') + '<div class="lw-assistant-state lw-state-error" role="alert"><span class="lw-state-mark" aria-hidden="true">!</span><div><h3>检索暂时失败</h3><p>' + esc(d.message || response.message || response.error?.message || '教材问答资源没有就绪。你仍可通过目录阅读。') + '</p><div class="lw-state-actions"><button class="outline" data-lw-retry>重试本题</button><a href="#learn">打开课程目录</a></div></div></div>';
    if (status === 'invalid_input') return head + '<div class="lw-message"><h3>请检查输入</h3><p>' + esc(d.message || response.message || '请输入 1—1200 字的问题描述。') + '</p></div>';
    if (status === 'unrelated' || status === 'related_uncovered') return head + (isRuleFallback(response) ? '<div class="lw-fallback-notice" role="note"><strong>规则降级</strong><span>语义检索当前不可用，本次使用本地规则检查；没有匹配时不会编造教材答案。</span></div>' : '') + '<div class="lw-assistant-state lw-state-empty"><span class="lw-state-mark" aria-hidden="true">?</span><div><h3>没有找到匹配的教材内容</h3><p>' + esc(d.message || (status === 'unrelated' ? '这里只回答 Agent 职业学习相关问题。' : '当前教材没有足够依据回答这个问题。')) + '</p><p class="lw-small">可以换一种说法，或从课程目录确认教材覆盖范围。</p><div class="lw-examples"><button data-lw-example="ReAct是什么">换问：ReAct 是什么</button><button data-lw-example="如何验证 Agent 改动后的效果">换问：如何验证改动效果</button></div><a href="#learn">打开课程目录 →</a></div></div>';
    if (status === 'needs_clarification') {
      const c = response.clarification || {}, options = Array.isArray(c.options) ? c.options : [];
      return head + '<div class="lw-message"><h3>请补充你指的含义</h3><p>' + esc(d.message || (typeof c === 'string' ? c : c.question || c.message) || '你想解决哪一类职业问题？') + '</p><div class="lw-clarifications">' + options.slice(0, 3).map((o, i) => '<button class="outline" data-lw-clarify="' + i + '">' + esc(typeof o === 'string' ? o : o.label || o.title || o.query) + '</button>').join('') + '</div></div>';
    }
    if (status !== 'answered') return head + '<p class="lw-message">问答响应无法识别，请重试。</p>';
    const refs = d.citations || [], used = d.scope?.contextUsed, topic = canonicalTopic(used), tu = topic && unit(topic.unitId), ts = topic && section(tu, topic.sectionId);
    const filtered = (d.scope?.filteredSegments || []).filter(x => x.reason !== 'excluded');
    const fallbackNotice = isRuleFallback(response) ? '<div class="lw-fallback-notice" role="note"><strong>规则降级</strong><span>语义检索当前不可用，本次按本地教材词项和规则匹配；结果仍经过版本与原文核对。</span></div>' : '';
    return head + fallbackNotice + (filtered.length ? '<div class="lw-dialog-scope"><p>本次只回答 Agent 学习相关部分。</p><p class="lw-small">已过滤：' + esc(filtered.map(x => x.text).join('；')) + '</p></div>' : '') + (topic ? '<p class="lw-small">' + (used.origin === 'previous_answer' ? '结合上一个已核问答主题：' : '结合当前阅读：') + esc(tu.navigationLabel) + ' / ' + esc(ts.title) + '</p>' : '') + '<div class="lw-dialog-answer"><h3>教材简答</h3>' + d.sentences.map(sentence => '<p>' + esc(sentence.text) + ' ' + sentence.citationIds.map(cid => { const index = refs.findIndex(r => r.id === cid); return '<a class="lw-citation-link" href="#lw-citation-' + (index + 1) + '" data-lw-citation="' + (index + 1) + '" aria-label="来源 ' + (index + 1) + '：' + esc(refs[index].sectionTitle) + '">来源 ' + (index + 1) + '</a>'; }).join(' ') + '</p>').join('') + '</div><h3 class="lw-sources-heading">对应教材</h3>' + refs.map((r, i) => {
      const u = unit(r.unitId), s = section(u, r.sectionId);
      const resultIdentity = { contentVersion: r.version || response?.contentVersion || response?.corpusVersion || '', textbookVersionId: r.textbookVersionId || response?.textbookVersionId || '', indexVersion: r.indexVersion || response?.indexVersion || '', corpusHash: r.corpusHash || response?.corpusHash || '' };
      const displayIdentity = value => esc(value || '服务未提供');
      return '<article class="lw-result-card lw-dialog-source" id="lw-citation-' + (i + 1) + '" tabindex="-1"><span class="lw-result-position">来源 ' + (i + 1) + ' · 第 ' + String(u.order).padStart(2, '0') + ' 篇 · ' + esc(u.navigationLabel) + '</span><h4>' + esc(s.title) + '</h4><a class="primary" data-lw-result href="' + esc(r.href) + '">阅读这一节 →</a><details class="lw-dialog-quote"><summary>展开教材原文 · 来源 ' + (i + 1) + '</summary><blockquote>' + esc(r.quote) + '</blockquote></details><details class="lw-dialog-source-info"><summary>查看出处与版本</summary><p>教材版本：' + displayIdentity(resultIdentity.contentVersion) + '<br>教材身份：' + displayIdentity(resultIdentity.textbookVersionId) + '<br>索引版本：' + displayIdentity(resultIdentity.indexVersion) + '<br>语料 SHA256：' + displayIdentity(resultIdentity.corpusHash) + '</p><p>' + esc(u.title) + '<br>' + esc(u.sourcePath) + ' · ' + esc(s.title) + '</p><p class="lw-hash">原稿 SHA256：' + esc(r.sourceSha256 || u.sourceSha256) + '<br>稳定定位：' + esc(r.href) + '</p></details></article>';
    }).join('') + '<p class="lw-small">简答来自教材原文提取，可进入小节阅读完整条件与例子。</p>';
  }
  function assistantHTML() {
    const c = currentContext(), u = unit(c.currentUnitId), s = section(u, c.currentSectionId), t = canonicalTopic(dialogTopic), tu = t && unit(t.unitId), ts = t && section(tu, t.sectionId), invalid = response?.status === 'invalid_input';
    const feedback = pending ? '正在理解问题并查教材。请稍候，发送控件已暂时禁用。' : invalid ? response.dialog?.message || response.message : response ? assistantOpen ? '本题已完成' : '本题已完成，展开查看' : '';
    if (!assistantOpen) return '<div class="lw-assistant" id="lw-assistant"><button class="lw-assistant-launcher" id="lw-assistant-launcher" type="button" data-lw-toggle aria-expanded="false" aria-controls="lw-find-panel"><span class="lw-launcher-icon" aria-hidden="true">⌕</span><span>问教材</span>' + (pending || response ? '<span class="lw-launcher-status">' + esc(pending ? '检索中' : '有结果') + '</span>' : '') + '</button></div>';
    const careerLabel = careerState.active ? (careerState.career?.title || '当前职业') : 'Agent 开发者';
    const dialogDescription = dynamicCareer() ? '当前职业教材是否支持问答由服务返回；未接入时会明确显示不可用。' : '根据当前教材简答，并提供原文入口。';
    const sendButton = pending ? '<button id="lw-query-submit" class="primary lw-query-submit is-loading" type="submit" disabled aria-disabled="true" aria-busy="true"><span class="lw-query-submit-spinner" aria-hidden="true"></span><span>正在查询…</span></button>' : '<button id="lw-query-submit" class="primary lw-query-submit" type="submit">发送</button>';
    return '<div class="lw-assistant is-open" id="lw-assistant"><aside class="lw-assistant-drawer" id="lw-find-panel" role="dialog" aria-label="Agent 学习问答" aria-modal="true"><div class="lw-assistant-head"><div><h2>Agent 学习问答</h2><p>' + esc(dialogDescription) + '</p></div><button class="outline" data-lw-collapse aria-expanded="true" aria-controls="lw-find-panel">收起</button></div><div class="lw-context"><span>职业：' + esc(careerLabel) + '</span><span>' + (u ? '章节上下文：' + esc(u.navigationLabel) + (s ? ' / ' + esc(s.title) : '') : '全部教材') + '</span>' + (u ? '<button data-lw-clear-context>清除章节上下文</button>' : activeView === 'learn' && loc().version === CURRENT && unit(loc().unitId) ? '<button data-lw-use-context>结合当前阅读</button>' : '') + (tu ? '<span>问答主题：' + esc(tu.navigationLabel) + ' / ' + esc(ts.title) + '</span>' : '<span>尚无问答主题</span>') + '<button data-lw-clear-topic>清除问答主题</button></div><div class="lw-find-results" id="lw-find-results" aria-busy="' + pending + '">' + resultHTML() + (queryHistory.length ? '<details class="lw-query-history"><summary>最近问题 · 本会话</summary>' + queryHistory.map((h,i) => '<button class="outline" data-lw-history="' + i + '">' + esc(h.query) + '</button>').join('') + '</details>' : '') + '</div><form id="lw-find-form"' + (pending ? ' aria-busy="true"' : '') + '><label for="lw-query">问教材</label><textarea id="lw-query" rows="1" placeholder="' + esc(globalThis.LearningExperienceV13?.inputHint?.() || '描述 Agent 开发、学习或项目中的问题') + '" aria-describedby="lw-query-feedback"' + (invalid ? ' aria-invalid="true"' : '') + '>' + esc(query) + '</textarea>' + sendButton + '<button class="lw-open-toggle" type="button" data-lw-toggle aria-expanded="true" aria-controls="lw-find-panel" aria-label="收起学习问答">⌄</button><p id="lw-query-feedback" class="lw-query-feedback" role="status" aria-live="polite" aria-atomic="true">' + esc(feedback) + '</p></form></aside></div>';
  }
  function validateSource(result) {
    const c = corpus(), u = unit(result?.unitId), s = section(u, result?.sectionId);
    if (!u || !s || result.sourceSha256 !== u.sourceSha256 || result.sourcePath !== u.sourcePath || result.version !== c.corpusVersion || result.unitTitle !== u.title || result.sectionTitle !== s.title || typeof result.reason !== 'string' || !result.reason || typeof result.evidenceExcerpt !== 'string' || !result.evidenceExcerpt.trim() || !s.bodyMarkdown.includes(result.evidenceExcerpt) || result.href !== href(u, s.sectionId)) throw Error('来源或原文无法在当前教材核对，暂不显示为可用回答。');
    return s;
  }
  function validateResponse(r, submitted) {
    const c = corpus();
    if (!c) throw Error('当前教材资源没有完整加载。');
    if (!r || typeof r !== 'object') throw Error('问答响应不符合当前教材合同，请重试。');
    if (r.requestId && submitted?.requestId && r.requestId !== submitted.requestId) throw Error('问答响应与本次请求不一致，请重试。');
    if (!r.requestId && submitted?.requestId) r = { ...r, requestId: submitted.requestId };
    if (submitted?.context?.corpusVersion !== CURRENT) throw Error('问答缓存属于其他教材版本，请重新提交。');
    if (submitted.context.previousContext && !canonicalTopic(submitted.context.previousContext)) throw Error('上一问答主题与当前教材不一致，请清除主题后重问。');
    if (!r.dialog && ['unavailable','invalid_input','no_match'].includes(r.status)) {
      const dialogStatus = r.status === 'invalid_input' ? 'invalid_input' : r.status === 'no_match' ? 'related_uncovered' : 'unavailable';
      return { ...r, requestId: r.requestId || submitted?.requestId, dialog: { status: dialogStatus, answerMode: 'extractive', sentences: [], citations: [], scope: { relatedSegments: [], filteredSegments: [], contextUsed: null }, message: r.message || r.error?.message || (dialogStatus === 'unavailable' ? '当前职业教材问答接口暂不可用。' : '当前教材没有足够依据回答这个问题。'), context: null }, results: Array.isArray(r.results) ? r.results : [] };
    }
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
    if (!expression || expression.length > 1200) { ++requestId; controller?.abort(); pending = false; restoredResponse = false; submission = { query: specificQuery ?? query, context, requestId: uuid() }; response = { status: 'invalid_input', requestId: submission.requestId, message: !expression ? '先描述一个你想解决的问题。' : '请把问题控制在 1200 字以内，当前输入已保留。' }; assistantOpen = true; assistantScroll = 0; refreshAssistant(false); document.getElementById('lw-query')?.focus(); return; }
    query = expression;
    const id = ++requestId; controller?.abort(); const activeController = new AbortController(); controller = activeController;
    const requestKey = uuid();
    const submitted = { query: expression, context: JSON.parse(JSON.stringify(context)), requestId: requestKey }; submission = submitted; response = null; pending = true; restoredResponse = false; assistantOpen = true; assistantScroll = 0; refreshAssistant(false); document.getElementById('lw-query')?.focus({ preventScroll: true });
    try {
      if (!corpus()) throw Error('教材资源没有完整加载。');
      if (location.protocol === 'file:') throw Error('当前是静态阅读入口，语义问答暂不可用；请使用本地服务或课程目录。');
      const timeout = setTimeout(() => activeController.abort(), 120000);
      let result;
      try {
        const agentBody = { requestId: requestKey, query: expression, careerId: submitted.context.careerId || AGENT_CAREER_ID, contentVersion: submitted.context.contentVersion || CURRENT, textbookVersionId: submitted.context.textbookVersionId || null, useCurrentContext: submitted.context.useCurrentContext === true, locale: 'zh-CN', workbenchVersion: WORKBENCH_VERSION, agentVersion: DIALOG_AGENT_VERSION, ...(submitted.context.useCurrentContext && submitted.context.currentUnitId ? { currentUnitId: submitted.context.currentUnitId, currentSectionId: submitted.context.currentSectionId || null } : {}) };
        let http = await fetch('/api/agent/learning/query', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Rolecraft-Agent-Version': DIALOG_AGENT_VERSION, 'X-Rolecraft-Agent-Request-Id': requestKey }, body: JSON.stringify(agentBody), signal: activeController.signal, credentials: 'omit' });
        if (!http.ok && !dynamicCareer() && (http.status === 404 || http.status === 405)) {
          const legacyContext = { query: expression, corpusVersion: submitted.context.corpusVersion || CURRENT, ...(submitted.context.startingPoint ? { startingPoint: submitted.context.startingPoint } : {}), ...(submitted.context.useCurrentContext && submitted.context.currentUnitId && submitted.context.currentSectionId ? { currentUnitId: submitted.context.currentUnitId, currentSectionId: submitted.context.currentSectionId } : {}), ...(submitted.context.previousContext ? { previousContext: submitted.context.previousContext } : {}) };
          http = await fetch('/api/content/dialog', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Rolecraft-Agent-Version': DIALOG_AGENT_VERSION, 'X-Rolecraft-Agent-Request-Id': requestKey }, body: JSON.stringify(legacyContext), signal: activeController.signal, credentials: 'omit' });
        }
        if (!http.ok) {
          const payload = await http.json().catch(() => null);
          const error = Error(payload?.error?.message || (http.status === 404 ? (dynamicCareer() ? '当前职业的教材问答接口尚未接入，请先通过课程目录阅读章节。' : '当前预览只有静态阅读资源，请启动本地问答服务。') : '本地问答服务暂不可用。'));
          error.status = http.status; error.code = payload?.error?.code; throw error;
        }
        result = await http.json();
        if (!result.requestId) result = { ...result, requestId: requestKey };
      } finally { clearTimeout(timeout); }
      if (id !== requestId) return;
      response = validateResponse(result, submitted);
      if (response.dialog.status === 'answered') dialogTopic = canonicalTopic(response.dialog.context);
    } catch (error) {
      if (id !== requestId) return;
      response = { status: 'unavailable', requestId: submitted.requestId, engineMode: location.protocol === 'file:' ? 'static_rules' : '', providerCalled: false, message: error.name === 'AbortError' ? '本题未在限定时间内完成，可重试；不会用旧答代替。' : error.message };
    } finally {
      if (id === requestId) { pending = false; queryHistory = [{query: submitted.query, context: submitted.context, response, at: new Date().toISOString()}, ...queryHistory].slice(0,5); refreshAssistant(); }
    }
  }
  function sessionValue() { return { query, response: pending ? null : response, submission, assistantOpen, contextEnabled, startingEnabled, queryHistory, dialogTopic, restoredResponse }; }
  function clarificationRetryResponse() {
    return {status:'unavailable',engineMode:'',providerCalled:false,results:[],clarification:null,dialog:{status:'unavailable',answerMode:'extractive',sentences:[],citations:[],scope:{relatedSegments:[],filteredSegments:[],contextUsed:null},message:'此前澄清需要向当前服务重新确认。请点击“重试本题”获取当前选项。',context:null}};
  }
  function refreshAssistant(preserveScroll = true) {
    const previousResults = document.getElementById('lw-find-results'); if (preserveScroll && previousResults && assistantOpen) assistantScroll = previousResults.scrollTop;
    try { sessionStorage.setItem(SESSION, JSON.stringify(sessionValue())); } catch { /* Reading and in-memory questions remain available. */ }
    const host = document.getElementById('lw-assistant-host');
    const focused = document.activeElement?.id === 'lw-query', submitFocused = document.activeElement?.id === 'lw-query-submit', input = focused ? document.getElementById('lw-query') : null, range = input ? [input.selectionStart, input.selectionEnd] : null;
    if (host) host.innerHTML = assistantHTML();
    const nextResults = document.getElementById('lw-find-results'); if (nextResults) nextResults.scrollTop = assistantScroll;
    if (focused) { const next = document.getElementById('lw-query'); next?.focus({ preventScroll: true }); if (range && next?.setSelectionRange) next.setSelectionRange(range[0], range[1]); }
    else if (submitFocused) { const next = document.getElementById(pending ? 'lw-query' : 'lw-query-submit'); next?.focus({ preventScroll: true }); }
    syncBackgroundInert();
  }
  function drawerFocusables() {
    const panel = document.getElementById('lw-find-panel');
    if (!panel) return [];
    return [...panel.querySelectorAll('a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), summary, [tabindex]:not([tabindex="-1"])')].filter(el => !el.hasAttribute('disabled') && el.getAttribute('aria-hidden') !== 'true' && el.getClientRects().length > 0);
  }
  function syncBackgroundInert() {
    const sidebar = document.getElementById('primary-sidebar');
    const app = document.getElementById('app');
    const topbar = document.querySelector('.topbar');
    if (app) app.inert = assistantOpen;
    if (topbar) topbar.inert = assistantOpen;
    if (sidebar) sidebar.inert = assistantOpen || globalThis.innerWidth <= 760;
  }
  function collapse() { const results = document.getElementById('lw-find-results'); if (results) assistantScroll = results.scrollTop; assistantOpen = false; refreshAssistant(); document.getElementById('lw-assistant-launcher')?.focus({ preventScroll: true }); }
  function captureNotes() {
    const note = document.getElementById('lw-note');
    const u = unit(activeReadingUnitId);
    if (note && activeReadingVersion === CURRENT && u) local.notes[activeReadingUnitId] = { text: note.value.slice(0, 12000), corpusVersion: CURRENT, sourceSha256: u.sourceSha256, updatedAt: new Date().toISOString() };
    document.querySelectorAll('[data-lw-project]').forEach(n => { if (Object.hasOwn(local.project, n.dataset.lwProject)) local.project[n.dataset.lwProject] = n.value.slice(0, 12000); });
    capturePracticeDraft();
  }
  function download(text, name, type = 'text/markdown;charset=utf-8') { const blob = new Blob([text], { type }), url = URL.createObjectURL(blob), a = document.createElement('a'); a.href = url; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); }
  function exportRecords() {
    captureNotes();
    const data = { schemaVersion: '1', clientVersion: VERSION, exportedAt: new Date().toISOString(), scope: '本浏览器当前记录与本人自述，不是独立能力评价', current: { corpusVersion: CURRENT, corpusHash: corpus()?.corpusHash || null, storageKey: STORE, records: local } };
    download(JSON.stringify(data, null, 2), '职造-学习记录-rolecraft-1.0-v12.json', 'application/json;charset=utf-8'); notify('已导出当前 v12 学习记录；自述未独立评价。');
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
    const banner = document.getElementById('save-status'); if (isWorkbench && banner) banner.textContent = storageError || (dynamicCareer() ? '当前教材 ' + (careerState.career?.contentVersion || '') + '；阅读记录保存在此浏览器。自动评分未接入。' : '当前教材 v12；新记录独立保存于本浏览器，未同步账户。');
    if (dynamicCareer() && careerState.career?.title) {
      const brand = document.querySelector('.brand strong span');
      if (brand) brand.textContent = careerState.career.title + '学习';
      const side = document.querySelector('.side-note strong');
      if (side) side.textContent = careerState.career.title;
    }
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
    if (dynamicCareer() && l.unitId) noteDynamicReading(l);
    if (u && (!dynamicCareer() || u.bodyMarkdown) && (!l.sectionId || section(u, l.sectionId))) {
      const last = local.visits.at(-1);
      if (l.version === CURRENT && (!last || last.unitId !== u.unitId || last.sectionId !== l.sectionId || !currentRecord(last))) { local.visits.push({ unitId: u.unitId, sectionId: l.sectionId, corpusVersion: CURRENT, corpusHash: corpus().corpusHash, sourceSha256: u.sourceSha256, at: new Date().toISOString() }); local.visits = local.visits.slice(-200); save(); syncAccountEvent('recent', u.unitId, l.sectionId); syncAccountEvent('progress', u.unitId, l.sectionId); }
      if (l.version === CURRENT && !(currentTask().state === 'interrupted' && !l.resume && currentTask().unitId === u.unitId && (currentTask().sectionId || '') === (l.sectionId || ''))) {
        const visited = new Set(local.visits.filter(currentRecord).map(v => v.unitId));
        const browsed = Boolean(corpus()?.units?.length && corpus().units.every(item => visited.has(item.unitId)));
        setTask(browsed ? 'browsed' : 'in_progress', u.unitId, l.sectionId, '');
      }
      focusFrame = requestAnimationFrame(() => {
        readerGeometry();
        const hidden = hiddenLearningContinuity(u).some(range => range.sectionIds.includes(l.sectionId));
        const target = document.getElementById(hidden ? 'lw-hidden-section' : l.sectionId || 'lw-reader-start');
        if (target) { target.focus({ preventScroll: true }); target.scrollIntoView({ block: 'start' }); }
      });
    }
  }
  function beforeRender() { captureNotes(); }
  function shouldDelegateView(view) { return careerState.active && (dynamicCareer() || careerState.status !== 'ready') && ['home', 'path', 'learn', 'records', 'projects', 'settings'].includes(view); }
  function page(view) {
    if (careerState.active && (dynamicCareer() || careerState.status !== 'ready') && !['home', 'path', 'learn', 'records'].includes(view)) return errorPage('当前职业教材已加载；该区域暂未接入当前职业内容。');
    return ({ home: () => homePage(), path: () => homePage(true), learn: readerPage, records: recordsPage, projects: projectsPage }[view] || (() => errorPage('页面暂不可用。')))();
  }
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
    if (el.hasAttribute('data-lw-clear-topic')) { ++requestId; controller?.abort(); pending = false; dialogTopic = null; response = null; submission = null; restoredResponse = false; assistantScroll = 0; refreshAssistant(false); return; }
    if (el.hasAttribute('data-lw-history')) {
      const h = queryHistory[Number(el.dataset.lwHistory)];
      if (h) {
        if (h.response?.dialog?.status === 'needs_clarification' || h.response?.status === 'needs_clarification') { find(h.query, h.context); return; }
        ++requestId; controller?.abort(); pending = false; query = h.query; submission = {query: h.query, context: h.context};
        try { response = validateResponse(h.response,submission); if (response.dialog.status === 'answered') dialogTopic = canonicalTopic(response.dialog.context); } catch(error) { response = {status:'unavailable',message:error.message}; }
        restoredResponse = true; assistantOpen = true; assistantScroll = 0; refreshAssistant(false);
      }
      return;
    }
    if (el.hasAttribute('data-lw-retry')) { find(submission?.query, submission?.context || currentContext()); return; }
    if (el.hasAttribute('data-lw-retry-chapter')) {
      const unitId = el.dataset.lwRetryChapter || loc().unitId;
      careerState.chapterErrors.delete(unitId);
      careerState.loadingChapterId = '';
      requestCareerChapter(unitId);
      return;
    }
    if (el.hasAttribute('data-lw-clarify')) { const c = response?.clarification, o = c?.options?.[Number(el.dataset.lwClarify)]; if (o) { const complete = typeof o === 'string' ? (submission?.query || query) + '；我指的是：' + o : o.query || (submission?.query || query) + '；我指的是：' + (o.label || o.title); find(complete, submission?.context || currentContext()); } return; }
    if (el.hasAttribute('data-lw-reload')) { location.reload(); return; }
    if (el.hasAttribute('data-lw-interrupt')) {
      const l = loc();
      const reason = '学习者主动中断，位置已保存；恢复后从该位置继续。';
      if (dynamicCareer()) {
        const patch = { state: 'interrupted', reason, contentVersion: l.version || careerState.career?.contentVersion || '' };
        if (l.unitId) { patch.unitId = l.unitId; patch.sectionId = l.sectionId || ''; }
        writeCareerTask(taskCareerId(), patch);
      }
      else setTask('interrupted', l.unitId, l.sectionId, reason);
      notify('已保存当前位置并标记为“已中断”；可从首页恢复任务。');
      if (typeof render === 'function') render();
      return;
    }
    if (el.hasAttribute('data-lw-career-draft-save') || el.hasAttribute('data-lw-career-practice-submit')) {
      const value = asText(document.getElementById('lw-career-draft')?.value, 4000);
      careerPractice.draft = value;
      if (el.hasAttribute('data-lw-career-draft-save')) {
        careerPractice.saved = Boolean(value.trim());
        careerPractice.feedback = value.trim() ? '练习反馈：草稿已保存在此页面。尚未提交，也不表示通过或等级。' : '练习反馈：草稿是空的，尚未保存有效内容。';
      } else if (!value.trim()) {
        careerPractice.feedback = '练习反馈：提交前需要先写下练习草稿。未写入通过或等级。';
      } else {
        careerPractice.saved = true;
        careerPractice.submitted = true;
        careerPractice.feedback = '练习反馈：已提交本次练习草稿。这只是本页回显，自动评分未接入，不表示通过或等级。';
      }
      if (typeof render === 'function') render();
      return;
    }
    if (el.hasAttribute('data-lw-save-note')) { captureNotes(); const saved = save(); if (saved) syncAccountRecords(); notify(saved ? (accountSession() ? '阅读笔记已保存并同步账户。' : '阅读笔记已保存在此浏览器。') : storageError); return; }
    if (el.hasAttribute('data-lw-p01-save')) { recordPracticeDraft(); return; }
    if (el.hasAttribute('data-lw-p01-submit')) { if (submitPractice() && typeof render === 'function') render(); return; }
    if (el.hasAttribute('data-lw-p01-status-save')) { updatePracticeStatus(document.getElementById('lw-p01-status')?.value || '未开始'); if (typeof render === 'function') render(); return; }
    if (el.hasAttribute('data-lw-save-project')) { captureNotes(); notify(save() ? '项目档案已保存在此浏览器，尚未独立评价。' : storageError); return; }
    if (el.hasAttribute('data-lw-export')) { exportRecords(); return; }
    if (el.hasAttribute('data-lw-download')) { const u = unit(el.dataset.lwDownload, el.dataset.lwVersion || CURRENT); if (u) download(u.bodyMarkdown, 'Agent教材-' + unitVersion(u) + '-' + u.unitId + '.md'); return; }
    if (el.hasAttribute('data-lw-bookmark')) { const l = loc(), u = unit(l.unitId), s = section(u, l.sectionId); if (!u || l.version !== CURRENT || l.sectionId && !s) return; const id = s?.sectionId || '', exists = local.bookmarks.some(b => currentRecord(b) && b.unitId === u.unitId && b.sectionId === id); local.bookmarks = local.bookmarks.filter(b => !(currentRecord(b) && b.unitId === u.unitId && b.sectionId === id)); if (!exists) local.bookmarks.push({ unitId: u.unitId, sectionId: id, corpusVersion: CURRENT, corpusHash: corpus().corpusHash, sourceSha256: u.sourceSha256 }); save(); syncAccountFavorite(u.unitId, id, exists); syncAccountRecords(); el.textContent = exists ? '收藏当前阅读位置' : '已收藏此位置 · 取消'; notify(exists ? '已取消收藏。' : '已收藏当前阅读位置。'); return; }
    if (el.hasAttribute('data-lw-copy')) { if (navigator.clipboard?.writeText) navigator.clipboard.writeText(location.href).then(() => notify('已复制当前定位链接。')).catch(() => notify('无法自动复制，可从地址栏复制当前链接。')); else notify('请从地址栏复制当前定位链接。'); }
  });
  document.addEventListener('change', e => {
    if (e.target.id === 'lw-starting-point') { local.startingPoint = Object.hasOwn(STARTS, e.target.value) ? e.target.value : null; startingEnabled = true; save(); if (typeof render === 'function') render(); }
  });
  document.addEventListener('input', e => {
    if (e.target.id === 'lw-query') { query = e.target.value; e.target.removeAttribute('aria-invalid'); try { sessionStorage.setItem(SESSION, JSON.stringify(sessionValue())); } catch {} }
    if (e.target.id === 'lw-note' || e.target.hasAttribute('data-lw-project') || e.target.closest?.('#lw-p01-form')) { captureNotes(); save(); }
  });
  document.addEventListener('compositionstart', e => { if (e.target.id === 'lw-query') composing = true; });
  document.addEventListener('compositionend', e => { if (e.target.id === 'lw-query') composing = false; });
  document.addEventListener('keydown', e => {
    if (e.target.id === 'lw-query' && e.key === 'Enter' && !e.shiftKey && !e.isComposing && !composing) { e.preventDefault(); if (pending) return; query = e.target.value; find(); }
    const imageOpen = document.getElementById('lw-image-dialog')?.open;
    if (e.key === 'Escape' && assistantOpen && !imageOpen) { e.preventDefault(); collapse(); return; }
    if (e.key === 'Tab' && assistantOpen && !imageOpen) {
      const items = drawerFocusables();
      if (!items.length) return;
      const first = items[0], last = items[items.length - 1], active = document.activeElement;
      const inside = items.includes(active);
      if (e.shiftKey) { if (!inside || active === first) { e.preventDefault(); last.focus(); } }
      else if (!inside || active === last) { e.preventDefault(); first.focus(); }
    }
  });
  document.addEventListener('submit', e => { if (e.target.id === 'lw-find-form') { e.preventDefault(); if (pending) return; query = document.getElementById('lw-query').value; find(); } });
  try {
    const received = JSON.parse(sessionStorage.getItem(SESSION) || 'null');
    if (received && typeof received === 'object') {
      query = asText(received.query, 20000);
      queryHistory = Array.isArray(received.queryHistory) ? received.queryHistory.filter(h=>h && typeof h.query==='string' && h.context?.corpusVersion===CURRENT && h.response).slice(0,5).map(h => { try { return {...h,response:validateResponse(h.response,{query:h.query,context:h.context})}; } catch(error) { return {...h,response:{status:'unavailable',message:error.message}}; } }) : [];
      assistantOpen = received.assistantOpen === true;
      contextEnabled = received.contextEnabled === true; startingEnabled = received.startingEnabled !== false;
      submission = received.submission && typeof received.submission.query === 'string' && received.submission.context && typeof received.submission.context === 'object' ? received.submission : null;
      if (received.response && submission) {
        try { response = validateResponse(received.response, submission); if (response.dialog.status === 'needs_clarification') response = clarificationRetryResponse(); restoredResponse = true; }
        catch (error) { response = { status: 'unavailable', message: error.message, providerCalled: false }; }
      }
      const topic = canonicalTopic(received.dialogTopic);
      if (topic && queryHistory.some(h => h.response?.dialog?.status === 'answered' && JSON.stringify(canonicalTopic(h.response.dialog.context)) === JSON.stringify(topic))) dialogTopic = topic;
    }
  } catch { /* A damaged query cache is not used as a recommendation. */ }
  globalThis.LearningWorkbench = { version: VERSION, agentVersion: DIALOG_AGENT_VERSION, workbenchVersion: WORKBENCH_VERSION, page, mount, beforeRender, markdown, validateResponse, currentContext, refreshAssistant, careerContentState, shouldDelegateView, currentTask, setTask, induceCareerTask, careerTask: careerId => readCareerTask(careerId), careerTaskKey: CAREER_TASK_KEY, practice: () => local.practice, readingRecords: () => local, recordIsCurrent: currentRecord, recordsExportData: () => { captureNotes(); return { current: local }; } };
  globalThis.addEventListener?.('resize', readerGeometry);
  document.addEventListener('click', e => { if (assistantOpen && !e.target.closest('#lw-assistant-host,button,a,input,textarea,select,summary,dialog')) collapse(); });
})();
