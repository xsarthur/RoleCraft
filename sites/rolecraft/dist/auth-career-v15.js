/* Account and imported-career switcher for the v15 MVP. */
(function () {
  'use strict';

  const state = {
    me: null,
    sessionRevision: 0,
    csrf: '',
    careers: [],
    query: '',
    mode: 'login',
    busy: false,
    searchError: '',
    searchErrorCode: '',
    searchSeq: 0,
    searchTimer: null,
    searchController: null,
    selectedCareer: null,
    selectionRequestId: 0,
    switchRequestId: 0,
    lastCareerResult: null,
    careerStatus: 'idle',
    careerOperation: 'catalog',
    careerClarification: null,
    sessionPromise: null,
    initializing: true,
    switchingCareerId: '',
    subscribers: new Set(),
    lastFocus: null,
    originalProfileHTML: null,
    originalCareerTitle: null,
    toastTimer: null,
    // Fail closed until /api/health says otherwise. Only a strict true counts.
    authChannels: { smsEnabled: false, wechatEnabled: false, qqEnabled: false },
    // Explicit local career only. The anonymous Agent textbook is not stored here.
    localCareer: null,
    conflict: null,
    switchInFlight: false,
    conflictBusy: false,
    conflictChoice: '',
    holdFocusRestore: false
  };

  const CAREER_QUERY_LIMIT = 1200;
  const CAREER_AGENT_VERSION = 'agent-system-v0.12';
  const WORKBENCH_VERSION = 'local-workbench-0.11';
  // Browser career pointer. Not the rolecraftSession cookie and not sessionStorage.
  // schema 1: { careerId, writtenAt, title, summary?, contentVersion?, indexVersion?, textbookVersionId?, corpusHash? }
  const LOCAL_CAREER_KEY = 'rolecraft-local-career-v1';
  // Same-session postponement of an unresolved login conflict. Not a career pointer.
  const CONFLICT_DISMISS_KEY = 'rolecraft-career-conflict-dismissed-v1';

  function uuid() {
    if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
    const bytes = new Uint8Array(16);
    if (globalThis.crypto?.getRandomValues) globalThis.crypto.getRandomValues(bytes);
    else for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
    bytes[6] = (bytes[6] & 0x0f) | 0x40; bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = [...bytes].map(v => v.toString(16).padStart(2, '0')).join('');
    return hex.slice(0,8) + '-' + hex.slice(8,12) + '-' + hex.slice(12,16) + '-' + hex.slice(16,20) + '-' + hex.slice(20);
  }

  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
  const isStatic = () => location.protocol === 'file:';
  const isAbort = error => error?.name === 'AbortError';
  function cloneSession() {
    const user = state.me?.user ? { ...state.me.user } : null;
    const career = currentCareer();
    if (!user && !career) return null;
    return { user, activeCareer: career ? { ...career } : null };
  }

  function isContentVersionMismatch(error) {
    return error?.code === 'content_version_mismatch' || error?.code === 'career_version_mismatch';
  }

  function friendlyError(error) {
    if (error?.kind === 'fixture' || error?.fixture === true || error?.code === 'qa_fixture') return '当前连到验收夹具';
    if (isAbort(error)) return '请求已取消。';
    if (error?.status >= 500 || error?.code === 'network_error') return '服务暂时不可用，请稍后再试。';
    if (error?.status === 401) return '登录已失效，请重新登录。';
    if (error?.status === 403) return '当前操作未获授权，请重新登录后再试。';
    const name = error?.name || '';
    const message = typeof error?.message === 'string' ? error.message : '';
    if (name === 'ReferenceError' || name === 'TypeError' || name === 'SyntaxError' || /is not defined/.test(message)) return '请求未完成，请稍后再试。';
    return message || '请求未完成，请稍后再试。';
  }

  function validCareerCandidate(career) {
    return Boolean(career && typeof career === 'object' &&
      typeof career.careerId === 'string' && /^[a-z0-9][a-z0-9-]{0,127}$/.test(career.careerId) &&
      typeof career.title === 'string' && career.title.trim() &&
      typeof career.summary === 'string' && typeof career.reason === 'string' && career.reason.trim() &&
      typeof career.contentVersion === 'string' && career.contentVersion.trim() &&
      typeof career.indexVersion === 'string' && career.indexVersion.trim() &&
      typeof career.textbookVersionId === 'string' && career.textbookVersionId.trim() &&
      typeof career.corpusHash === 'string' && /^[a-f0-9]{64}$/i.test(career.corpusHash) &&
      career.available === true && career.status === 'published');
  }

  function careerMatchLabel(result) {
    if (!result) return '职业目录';
    if (result.semanticAvailable && typeof result.matchingMode === 'string' && result.matchingMode.includes('local_bge')) return '本机语义匹配 · 查询留在本机';
    if (result.matchingMode === 'catalog_keyword') return '关键词降级 · 未调用外部模型';
    return '职业目录匹配';
  }

  function resetCareerSelection() { state.selectedCareer = null; state.selectionRequestId = 0; }

  function careerIdOf(career) {
    const id = career?.careerId || career?.id || '';
    return typeof id === 'string' && /^[a-z0-9][a-z0-9-]{0,127}$/.test(id) ? id : '';
  }

  function readLocalCareer() {
    try {
      const raw = localStorage.getItem(LOCAL_CAREER_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      const careerId = careerIdOf(parsed);
      if (!parsed || parsed.schema !== 1 || !careerId || typeof parsed.title !== 'string' || !parsed.title.trim()) return null;
      if (typeof parsed.writtenAt !== 'string' || !parsed.writtenAt.trim()) return null;
      return {
        schema: 1,
        careerId,
        title: parsed.title.trim(),
        writtenAt: parsed.writtenAt,
        summary: typeof parsed.summary === 'string' ? parsed.summary : '',
        contentVersion: typeof parsed.contentVersion === 'string' ? parsed.contentVersion : '',
        indexVersion: typeof parsed.indexVersion === 'string' ? parsed.indexVersion : '',
        textbookVersionId: typeof parsed.textbookVersionId === 'string' ? parsed.textbookVersionId : '',
        corpusHash: typeof parsed.corpusHash === 'string' ? parsed.corpusHash : '',
        status: typeof parsed.status === 'string' ? parsed.status : '',
        available: parsed.available !== false
      };
    } catch { return null; }
  }

  function writeLocalCareer(career) {
    const careerId = careerIdOf(career);
    const title = typeof career?.title === 'string' ? career.title.trim() : '';
    if (!careerId || !title) throw Error('本机职业没有可保存的名称。');
    const record = {
      schema: 1,
      careerId,
      title,
      writtenAt: new Date().toISOString(),
      summary: typeof career.summary === 'string' ? career.summary : '',
      contentVersion: typeof career.contentVersion === 'string' ? career.contentVersion : '',
      indexVersion: typeof career.indexVersion === 'string' ? career.indexVersion : '',
      textbookVersionId: typeof career.textbookVersionId === 'string' ? career.textbookVersionId : '',
      corpusHash: typeof career.corpusHash === 'string' ? career.corpusHash : '',
      status: typeof career.status === 'string' ? career.status : '',
      available: career.available !== false
    };
    localStorage.setItem(LOCAL_CAREER_KEY, JSON.stringify(record));
    state.localCareer = record;
    return record;
  }

  function currentCareer() {
    if (state.conflict && state.localCareer) return state.localCareer;
    if (state.me?.user && careerIdOf(state.me.activeCareer)) return state.me.activeCareer;
    return state.localCareer || null;
  }

  function userIdOf(user) { return user?.id || user?.userId || ''; }

  function readConflictDismissal() {
    try {
      const parsed = JSON.parse(localStorage.getItem(CONFLICT_DISMISS_KEY) || 'null');
      if (!parsed || parsed.schema !== 1) return null;
      if (!userIdOf({ id: parsed.userId }) || !careerIdOf({ careerId: parsed.localCareerId }) || !careerIdOf({ careerId: parsed.accountCareerId })) return null;
      return parsed;
    } catch { return null; }
  }

  function conflictDismissed() {
    const row = readConflictDismissal();
    const userId = userIdOf(state.me?.user);
    if (!row || !state.conflict || !userId) return false;
    return row.userId === userId && row.localCareerId === state.conflict.local.careerId && row.accountCareerId === state.conflict.account.careerId;
  }

  function clearConflictDismissal() {
    try { localStorage.removeItem(CONFLICT_DISMISS_KEY); } catch { /* The in-memory conflict still decides the next prompt. */ }
  }

  function dismissConflict() {
    if (!state.me?.user || !state.conflict) return;
    const row = { schema: 1, userId: userIdOf(state.me.user), localCareerId: state.conflict.local.careerId, accountCareerId: state.conflict.account.careerId };
    try { localStorage.setItem(CONFLICT_DISMISS_KEY, JSON.stringify(row)); } catch { /* The hint still shows while this session keeps the conflict. */ }
    render();
  }

  function loggedInHelper() { return '切换后将使用该职业方向，并同步到当前账户。'; }
  function loggedOutHelper() { return '切换后将在本浏览器使用该职业方向。登录后可同步到账户。'; }

  function paintCareerHelper() {
    const node = document.getElementById('rc-career-helper');
    if (!node) return;
    node.textContent = state.me?.user ? loggedInHelper() : loggedOutHelper();
  }

  // System-default Agent 开发者 is NOT silently treated as a user-chosen account career.
  // /api/auth/me does not say whether user_preferences.active_career_id was explicit.
  // Predicate that would allow a silent local→account write: a preference row exists
  // for this user and its active_career_id is empty. That signal is not in the response,
  // so a differing system default always opens the chooser.
  async function writeAccountCareer(careerId) {
    if (!state.me?.user) throw Error('当前没有登录会话，不能写入账户职业。');
    return api('/api/profile/career', { method: 'PUT', headers: { 'X-Rolecraft-Selection-Source': 'user_explicit' }, body: { careerId } });
  }

  async function confirmAccountCareer(candidate) {
    const careerId = careerIdOf(candidate);
    if (!careerId) throw Error('请选择一个已发布职业。');
    const recommendationRequestId = state.lastCareerResult?.requestId || '';
    const canConfirm = validCareerCandidate(candidate) && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(recommendationRequestId);
    if (!canConfirm) {
      const payload = await writeAccountCareer(careerId);
      const returned = payload?.career && typeof payload.career === 'object' ? payload.career : {};
      const returnedTitle = typeof returned.title === 'string' ? returned.title.trim() : '';
      return { ...candidate, ...returned, careerId, title: returnedTitle || candidate.title || '' };
    }
    const expected = {
      status: candidate.status || 'published',
      contentVersion: candidate.contentVersion,
      indexVersion: candidate.indexVersion || candidate.careerContent?.indexVersion || '',
      textbookVersionId: candidate.textbookVersionId || candidate.careerContent?.textbookVersionId || '',
      corpusHash: candidate.corpusHash || candidate.careerContent?.corpusHash || ''
    };
    const confirmRequestId = uuid();
    const headers = { 'X-Rolecraft-Agent-Version': CAREER_AGENT_VERSION, 'X-Rolecraft-Agent-Request-Id': confirmRequestId, 'X-Rolecraft-Selection-Source': 'agent_confirmed' };
    let result;
    try {
      result = await api('/api/agent/career/confirm', { method: 'POST', headers, body: { requestId: confirmRequestId, recommendationRequestId, careerId, expected, confirmation: 'user_explicit', idempotencyKey: uuid(), workbenchVersion: WORKBENCH_VERSION, agentVersion: CAREER_AGENT_VERSION } });
    } catch (error) {
      if (!routeUnavailable(error)) throw error;
      result = await api('/api/profile/career', { method: 'PUT', headers, body: { careerId } });
    }
    const returned = normalizeCareerCandidate(result?.career);
    const merged = returned ? { ...candidate, ...returned, summary: returned.summary || candidate.summary, reason: returned.reason || candidate.reason, matchReason: returned.matchReason || candidate.matchReason, indexVersion: returned.indexVersion || candidate.indexVersion, available: returned.available || candidate.available, careerContent: { ...candidate.careerContent, ...returned.careerContent, available: returned.available || candidate.available } } : null;
    if (!returned || returned.careerId !== careerId || returned.contentVersion !== candidate.contentVersion || (expected.textbookVersionId && returned.textbookVersionId && returned.textbookVersionId !== expected.textbookVersionId) || (expected.corpusHash && returned.corpusHash && returned.corpusHash !== expected.corpusHash) || !validCareerCandidate(merged)) throw Error('服务返回的职业版本与推荐不一致，请重试。');
    return merged;
  }

  async function mergeAccountAndLocal() {
    if (!state.me?.user) { state.conflict = null; return 'anonymous'; }
    const account = careerIdOf(state.me.activeCareer) ? state.me.activeCareer : null;
    const local = state.localCareer;
    const accountId = account ? careerIdOf(account) : '';
    const localId = local?.careerId || '';
    if (!localId) {
      state.conflict = null;
      if (accountId) {
        try { writeLocalCareer(account); }
        catch { notify('本机未能保存职业方向，退出登录后需要重新选择。'); }
      }
      return 'account_kept';
    }
    if (!accountId) {
      await writeAccountCareer(localId);
      const me = await api('/api/auth/me');
      const written = me?.activeCareer;
      if (!written || careerIdOf(written) !== localId) throw Error('本机职业尚未写入账户，请重试。');
      state.csrf = me?.csrfToken || state.csrf || '';
      state.me = { user: state.me.user ? { ...state.me.user } : null, activeCareer: { ...written } };
      try { writeLocalCareer(written.title ? written : local); } catch { /* The id was already the local career. */ }
      state.conflict = null;
      clearConflictDismissal();
      return 'local_written';
    }
    if (localId === accountId) {
      state.conflict = null;
      try { writeLocalCareer(account); } catch { /* Same id remains in this browser. */ }
      clearConflictDismissal();
      return 'same';
    }
    state.conflict = {
      local: { careerId: local.careerId, title: local.title },
      account: { careerId: accountId, title: account.title || accountId }
    };
    return 'conflict';
  }

  function applySignedInSession(next, reason, options = {}) {
    state.sessionRevision++;
    state.me = {
      user: next.user ? { ...next.user } : null,
      activeCareer: next.activeCareer ? { ...next.activeCareer } : null
    };
    return mergeAccountAndLocal().catch(error => {
      notify(friendlyError(error));
      return 'merge_failed';
    }).then(outcome => {
      render();
      emit(reason);
      const careerDialogOpen = Boolean(document.getElementById('rc-career-dialog')?.open);
      if (outcome === 'conflict' && !conflictDismissed() && options.promptConflict !== false && !state.loginOpen && !careerDialogOpen) openConflictDialog();
      return cloneSession();
    });
  }

  function normalizeCareerCandidate(candidate) {
    if (!candidate || typeof candidate !== 'object') return null;
    const content = candidate.careerContent || candidate.career_content || {};
    for (const key of ['contentVersion', 'indexVersion', 'textbookVersionId', 'corpusHash', 'available']) {
      if (candidate[key] !== undefined && content[key] !== undefined && candidate[key] !== content[key]) return null;
    }
    const contentVersion = candidate.contentVersion || content.contentVersion || candidate.version || '';
    const indexVersion = candidate.indexVersion || content.indexVersion || '';
    const reason = candidate.matchReason || candidate.reason || '';
    const available = candidate.available === true || content.available === true;
    return {
      ...candidate,
      careerId: candidate.careerId || candidate.id || '',
      slug: candidate.slug || candidate.careerId || candidate.id || '',
      title: candidate.title || '',
      summary: candidate.summary || '',
      reason,
      matchReason: reason,
      matchedSignals: Array.isArray(candidate.matchedSignals) ? candidate.matchedSignals : [],
      hasMatchedSignals: Array.isArray(candidate.matchedSignals),
      gaps: Array.isArray(candidate.gaps) ? candidate.gaps : [],
      hasGaps: Array.isArray(candidate.gaps),
      actions: Array.isArray(candidate.actions) ? candidate.actions : [],
      matchSource: candidate.matchSource || candidate.provenance?.matchSource || '',
      provenance: candidate.provenance && typeof candidate.provenance === 'object' ? { ...candidate.provenance } : null,
      contentVersion,
      indexVersion,
      textbookVersionId: candidate.textbookVersionId || content.textbookVersionId || '',
      corpusHash: candidate.corpusHash || content.corpusHash || '',
      available,
      status: candidate.status || '',
      careerContent: { ...content, contentVersion, indexVersion, textbookVersionId: candidate.textbookVersionId || content.textbookVersionId || '', corpusHash: candidate.corpusHash || content.corpusHash || '', available }
    };
  }

  function normalizeCareerResult(result, requestId, query, operation) {
    if (!result || typeof result !== 'object' || Array.isArray(result)) throw Error('职业服务返回了无法识别的数据，请重试。');
    if (result.agentVersion !== undefined && result.agentVersion !== CAREER_AGENT_VERSION || result.workbenchVersion !== undefined && result.workbenchVersion !== WORKBENCH_VERSION || isContentVersionMismatch(result.error)) {
      throw Object.assign(new Error('职业服务版本与当前页面不一致，请刷新后重试。'), { code: 'career_version_mismatch' });
    }
    const raw = Array.isArray(result.candidates) ? result.candidates : Array.isArray(result.careers) ? result.careers : null;
    const allowed = ['recommended','needs_clarification','no_match','unavailable','invalid_input'];
    if (result.status !== undefined && !allowed.includes(result.status)) throw Error('职业服务返回了无法识别的状态，请重试。');
    let status = result.status || (raw ? (raw.length ? 'recommended' : 'no_match') : '');
    if (!raw && !['unavailable','invalid_input','needs_clarification'].includes(status)) throw Error('职业服务未返回合法的候选列表，请重试。');
    const valid = (raw || []).map(normalizeCareerCandidate).filter(validCareerCandidate);
    if (raw?.length && !valid.length) throw Error('返回的职业未通过教材身份或可用性校验，请重试。');
    if (status === 'no_match' && valid.length) throw Error('职业服务的状态与候选列表不一致，请重试。');
    if (status === 'needs_clarification' && (!result.clarification || !Array.isArray(result.clarification.options) || !result.clarification.options.length || result.clarification.options.some(option => typeof option === 'string' ? !option.trim() : !option || typeof option !== 'object' || ![option.query, option.label, option.title].some(value => typeof value === 'string' && value.trim())))) throw Error('职业服务未返回可用的澄清选项，请重试。');
    if (operation === 'catalog' && raw && !raw.length && ['recommended','no_match'].includes(status)) status = 'catalog_empty';
    else if (status === 'recommended' && !valid.length) throw Error('职业推荐没有返回可校验的候选，请重试。');
    const candidates = operation === 'catalog' ? valid : valid.slice(0, 3);
    return {
      requestId: result?.requestId || requestId,
      query,
      status,
      candidates,
      clarification: result?.clarification || null,
      semanticAvailable: result?.semanticAvailable === true,
      matchingMode: typeof result?.matchingMode === 'string' ? result.matchingMode : (result?.engineMode || ''),
      engineMode: result?.engineMode || '',
      providerCalled: result?.providerCalled === true,
      limitations: Array.isArray(result?.limitations) ? result.limitations : [],
      message: typeof result.message === 'string' ? result.message : (typeof result.error?.message === 'string' ? result.error.message : ''),
      label: operation === 'catalog' ? '职业目录' : careerMatchLabel(result),
      receivedAt: new Date().toISOString()
    };
  }

  function routeUnavailable(error) {
    if (error?.kind === 'fixture' || error?.fixture === true || error?.code === 'qa_fixture') return false;
    return error?.status === 404 || error?.status === 405 || error?.code === 'not_found';
  }

  function notify(message) {
    const node = document.getElementById('toast') || document.getElementById('save-status') || document.getElementById('lw-status');
    if (!node) return;
    node.textContent = message || '';
    if (node.id === 'toast') {
      node.classList.add('show');
      clearTimeout(state.toastTimer);
      state.toastTimer = setTimeout(() => node.classList.remove('show'), 3200);
    }
  }

  function emit(reason = 'update') {
    const detail = { session: cloneSession(), reason };
    window.dispatchEvent(new CustomEvent('rolecraft:authchange', { detail }));
    for (const callback of [...state.subscribers]) {
      try { callback(detail.session, detail); } catch { /* subscriber errors must not break the UI */ }
    }
  }

  function setSession(session, reason) {
    state.sessionRevision++;
    state.me = session ? {
      user: session.user ? { ...session.user } : null,
      activeCareer: session.activeCareer ? { ...session.activeCareer } : null
    } : null;
    if (!state.me?.user) state.conflict = null;
    render();
    emit(reason);
    return cloneSession();
  }

  async function api(path, options = {}) {
    if (isStatic()) throw Object.assign(new Error('当前页面需要通过本地服务访问账户功能。'), { code: 'static_page', kind: 'network' });
    const authRevision = state.sessionRevision;
    const config = { ...options };
    const headers = { ...(options.headers || {}) };
    if (config.body && typeof config.body === 'object' && !(config.body instanceof Blob) && !(config.body instanceof ArrayBuffer) && !(config.body instanceof URLSearchParams)) {
      config.body = JSON.stringify(config.body);
      headers['Content-Type'] = headers['Content-Type'] || 'application/json';
    } else if (config.body && typeof config.body === 'string' && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }
    if (config.method && config.method !== 'GET' && state.csrf) headers['X-CSRF-Token'] = state.csrf;
    config.headers = headers;
    config.credentials = 'same-origin';
    let response;
    try { response = await fetch(path, config); }
    catch (error) {
      if (isAbort(error)) throw error;
      throw Object.assign(new Error('服务暂时不可用，请检查本地服务。'), { code: 'network_error', kind: 'network', cause: error });
    }
    let payload = null;
    try { payload = await response.json(); } catch { /* an empty response is handled below */ }
    if (globalThis.LearningWorkbench?.isFixtureResponse?.(payload, response.headers)) {
      globalThis.LearningWorkbench.noteFixtureSession?.(true);
      throw Object.assign(new Error('当前连到验收夹具'), { status: response.status, code: 'qa_fixture', kind: 'fixture', fixture: true, payload });
    }
    if (!response.ok) {
      const message = payload?.error?.message || (response.status >= 500 ? '服务暂时不可用，请稍后再试。' : '请求未完成，请稍后再试。');
      const kind = response.status >= 500 ? 'network' : response.status === 404 ? 'missing' : response.status === 405 ? 'route' : '';
      const error = Object.assign(new Error(message), { status: response.status, code: payload?.error?.code, payload, kind });
      if (response.status === 401 && state.me?.user && state.sessionRevision === authRevision) {
        state.csrf = '';
        setSession(null, 'expired');
        notify('登录已失效，草稿仅保存在本机。请登录原账户后重试。');
      }
      if (isContentVersionMismatch(error)) globalThis.LearningWorkbench?.noteContentVersionMismatch?.({ code: error.code, message });
      throw error;
    }
    return payload;
  }

  async function refresh(options = {}) {
    if (state.sessionPromise) return state.sessionPromise;
    state.sessionPromise = (async () => {
      try {
        const revision = state.sessionRevision;
        const result = await api('/api/auth/me', { signal: options.signal });
        if (state.sessionRevision !== revision) return cloneSession();
        state.csrf = result?.csrfToken || state.csrf || '';
        const next = { user: result?.user || null, activeCareer: result?.activeCareer || null };
        if (!next.user) return setSession(null, options.reason || 'anonymous');
        return applySignedInSession(next, options.reason || 'refresh', options);
      } catch (error) {
        if (error?.status === 401) {
          state.csrf = '';
          return setSession(null, options.reason || 'anonymous');
        }
        if (!options.silent) notify(friendlyError(error));
        throw error;
      } finally {
        state.sessionPromise = null;
      }
    })();
    return state.sessionPromise;
  }

  function getSession() { return cloneSession(); }

  function subscribe(callback) {
    if (typeof callback !== 'function') return () => {};
    state.subscribers.add(callback);
    try { callback(cloneSession(), { reason: 'subscribe' }); } catch { /* keep subscription usable */ }
    return () => state.subscribers.delete(callback);
  }

  function host() { return document.getElementById('rc-account-career'); }

  function renderProfile() {
    const profile = document.querySelector('.local-profile');
    if (!profile) return;
    if (state.originalProfileHTML == null) state.originalProfileHTML = profile.innerHTML;
    if (state.me?.user) {
      const email = state.me.user.email || '账户';
      profile.innerHTML = '<span class="avatar" aria-hidden="true">' + esc(email.slice(0, 1).toUpperCase()) + '</span><span>' + esc(email) + '<small>已登录</small></span>';
    } else {
      profile.innerHTML = state.originalProfileHTML;
    }
  }

  function renderSideNote() {
    const side = document.querySelector('.side-note strong');
    if (!side) return;
    if (state.originalCareerTitle == null) state.originalCareerTitle = side.textContent;
    side.textContent = currentCareer()?.title || state.originalCareerTitle || '当前学习方向';
  }

  function render() {
    const node = host();
    if (node) {
      const title = currentCareer()?.title || '';
      const careerButton = '<button class="rc-career-trigger" type="button" data-rc-open-careers aria-haspopup="dialog"><span class="rc-dot" aria-hidden="true"></span><span>' + esc(title || '选择职业') + '</span><span aria-hidden="true">⌄</span></button>';
      const accountButton = state.me?.user
        ? '<button class="rc-account-trigger" type="button" data-rc-account aria-haspopup="menu" aria-expanded="false">' + esc(state.me.user.email || '账户') + '</button>'
        : '<button class="rc-login-trigger" type="button" data-rc-open-login>登录 / 注册</button>';
      const note = state.me?.user && state.conflict
        ? '<p class="rc-career-sync-note" role="status">本机与账户的职业方向尚未同步，<button type="button" data-rc-open-conflict>可在此选择</button>。</p>'
        : '';
      node.innerHTML = careerButton + accountButton + note;
    }
    paintCareerHelper();
    renderSideNote();
    const trigger = document.querySelector('[data-rc-account]');
    if (trigger) trigger.setAttribute('aria-expanded', String(Boolean(document.getElementById('rc-account-menu'))));
  }

  function rememberFocus() { state.lastFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null; }
  function restoreFocus() {
    const target = state.lastFocus;
    state.lastFocus = null;
    if (target?.isConnected && typeof target.focus === 'function') setTimeout(() => target.focus(), 0);
  }
  function closeDialog(dialog) { if (dialog?.open) dialog.close(); }

  const CHANNEL_COPY = {
    sms: '短信登录暂未开通，请使用「其他登录方式」。',
    wechat: '微信登录即将支持，请使用「其他登录方式」。',
    qq: 'QQ 登录即将支持，请使用「其他登录方式」。'
  };

  function channelEnabled(name) {
    return state.authChannels[name] === true;
  }

  function announceAlert(node, message) {
    if (!node) return;
    node.textContent = '';
    node.textContent = message;
  }

  function setPendingControl(node, pending, token) {
    if (!node) return;
    node.setAttribute('aria-disabled', pending ? 'true' : 'false');
    if (pending) node.setAttribute('data-rc-auth-pending', token);
    else node.removeAttribute('data-rc-auth-pending');
  }

  async function loadAuthChannels() {
    if (isStatic()) {
      state.authChannels = { smsEnabled: false, wechatEnabled: false, qqEnabled: false };
      return state.authChannels;
    }
    try {
      const health = await api('/api/health');
      const channels = health && typeof health.authChannels === 'object' && health.authChannels ? health.authChannels : {};
      state.authChannels = {
        smsEnabled: channels.smsEnabled === true,
        wechatEnabled: channels.wechatEnabled === true,
        qqEnabled: channels.qqEnabled === true
      };
    } catch {
      state.authChannels = { smsEnabled: false, wechatEnabled: false, qqEnabled: false };
    }
    return state.authChannels;
  }

  function paintChannelAffordances(dialog) {
    const smsOn = channelEnabled('smsEnabled');
    const wechatOn = channelEnabled('wechatEnabled');
    const qqOn = channelEnabled('qqEnabled');
    const send = dialog.querySelector('[data-rc-sms-send]');
    const submit = dialog.querySelector('[data-rc-sms-submit]');
    const wechat = dialog.querySelector('[data-rc-auth-wechat]');
    const qq = dialog.querySelector('[data-rc-auth-qq]');
    const smsStatus = dialog.querySelector('#rc-sms-status');
    setPendingControl(send, !smsOn, '暂未开通');
    setPendingControl(submit, !smsOn, '暂未开通');
    setPendingControl(wechat, !wechatOn, '即将支持');
    setPendingControl(qq, !qqOn, '即将支持');
    if (wechat) wechat.textContent = wechatOn ? '微信登录' : '微信 · 即将支持';
    if (qq) qq.textContent = qqOn ? 'QQ 登录' : 'QQ · 即将支持';
    if (smsStatus && !smsOn && !smsStatus.textContent) smsStatus.textContent = CHANNEL_COPY.sms;
    if (smsStatus && smsOn && smsStatus.textContent === CHANNEL_COPY.sms) smsStatus.textContent = '';
    const phoneBlock = dialog.querySelector('[data-rc-auth-phone]');
    if (phoneBlock) phoneBlock.hidden = false;
  }

  async function requestPendingChannel(dialog, action) {
    const smsStatus = dialog.querySelector('#rc-sms-status');
    const oauthStatus = dialog.querySelector('#rc-auth-channel-status');
    if (action === 'sms-send' || action === 'sms-verify') {
      if (!channelEnabled('smsEnabled')) {
        announceAlert(smsStatus, CHANNEL_COPY.sms);
        return;
      }
      const phone = dialog.querySelector('#rc-phone')?.value.trim() || '';
      if (!/^1[3-9]\d{9}$/.test(phone)) {
        announceAlert(smsStatus, '请输入正确的手机号');
        return;
      }
      const code = dialog.querySelector('#rc-sms-code')?.value.trim() || '';
      if (action === 'sms-verify' && !/^\d{6}$/.test(code)) {
        announceAlert(smsStatus, '请输入验证码');
        return;
      }
      try {
        await api(action === 'sms-send' ? '/api/auth/sms/send' : '/api/auth/sms/verify', {
          method: 'POST',
          body: action === 'sms-send' ? { phone } : { phone, code }
        });
        // An unexpected 2xx is not a session. Do not store a csrf token or cookie.
        announceAlert(smsStatus, CHANNEL_COPY.sms);
      } catch (err) {
        announceAlert(smsStatus, err?.code === 'sms_not_configured' ? CHANNEL_COPY.sms : friendlyError(err));
      }
      return;
    }
    const kind = action === 'wechat' ? 'wechat' : 'qq';
    if (!channelEnabled(kind + 'Enabled')) {
      announceAlert(oauthStatus, CHANNEL_COPY[kind]);
      return;
    }
    try {
      const result = await api('/api/auth/' + kind + '/start', { method: 'POST', body: {} });
      const url = result && typeof result.url === 'string' ? result.url : '';
      if (result?.enabled === true && /^https:\/\//.test(url)) {
        location.assign(url);
        return;
      }
      announceAlert(oauthStatus, CHANNEL_COPY[kind]);
    } catch (err) {
      const code = kind === 'wechat' ? 'wechat_not_configured' : 'qq_not_configured';
      announceAlert(oauthStatus, err?.code === code ? CHANNEL_COPY[kind] : friendlyError(err));
    }
  }

  function loginDialog() {
    let dialog = document.getElementById('rc-login-dialog');
    if (!dialog) {
      dialog = document.createElement('dialog');
      dialog.id = 'rc-login-dialog';
      dialog.setAttribute('aria-labelledby', 'rc-login-title');
      dialog.innerHTML = [
        '<div class="rc-dialog-form" id="rc-login-panel">',
        '<div class="rc-dialog-head"><div><span class="rc-eyebrow">学习账户</span><h2 id="rc-login-title"></h2></div><button type="button" class="rc-close" data-rc-close aria-label="关闭">×</button></div>',
        '<p class="rc-dialog-copy">登录后可保存职业和学习记录。</p>',
        '<div data-rc-auth-phone>',
        '<label for="rc-phone">手机号</label>',
        '<input id="rc-phone" name="phone" type="tel" inputmode="numeric" autocomplete="tel" maxlength="11" placeholder="请输入手机号">',
        '<label for="rc-sms-code">验证码</label>',
        '<div class="rc-sms-row">',
        '<input id="rc-sms-code" name="code" type="text" inputmode="numeric" autocomplete="one-time-code" maxlength="6" placeholder="6 位验证码" aria-describedby="rc-sms-status">',
        '<button type="button" class="rc-sms-send" data-rc-sms-send aria-describedby="rc-sms-status">获取验证码</button>',
        '</div>',
        '<p class="rc-auth-pending" id="rc-sms-status" role="alert" data-rc-auth-pending="暂未开通">短信登录暂未开通，请使用「其他登录方式」。</p>',
        '<button type="button" class="primary full" id="rc-login-submit" data-rc-sms-submit aria-describedby="rc-sms-status"></button>',
        '</div>',
        '<div class="rc-auth-peers" role="group" aria-label="微信与 QQ 登录">',
        '<button type="button" data-rc-auth-wechat data-rc-auth-pending="即将支持" aria-disabled="true">微信 · 即将支持</button>',
        '<button type="button" data-rc-auth-qq data-rc-auth-pending="即将支持" aria-disabled="true">QQ · 即将支持</button>',
        '</div>',
        '<p class="rc-auth-pending rc-auth-channel-status" id="rc-auth-channel-status" role="alert"></p>',
        '<details class="rc-auth-other" data-rc-auth-other>',
        '<summary>其他登录方式（邮箱+密码，可完成）</summary>',
        '<form id="rc-login-form">',
        '<label for="rc-email">邮箱</label>',
        '<input id="rc-email" name="email" type="email" autocomplete="email" required placeholder="你的邮箱">',
        '<label for="rc-password">密码</label>',
        '<input id="rc-password" name="password" type="password" autocomplete="current-password" minlength="12" maxlength="128" required placeholder="至少 12 个字符">',
        '<p class="rc-form-hint">使用邮箱和密码。</p>',
        '<p class="rc-form-error" id="rc-login-error" role="alert"></p>',
        '<button class="primary full" type="submit" id="rc-email-submit"></button>',
        '</form>',
        '</details>',
        '<button class="rc-switch-mode" type="button" data-rc-switch></button>',
        '</div>'
      ].join('');
      document.body.appendChild(dialog);
      const form = dialog.querySelector('#rc-login-form');
      dialog.addEventListener('click', event => {
        if (event.target === dialog || event.target.closest('[data-rc-close]')) { closeDialog(dialog); return; }
        if (event.target.closest('[data-rc-sms-send]')) { requestPendingChannel(dialog, 'sms-send'); return; }
        if (event.target.closest('[data-rc-sms-submit]')) { requestPendingChannel(dialog, 'sms-verify'); return; }
        if (event.target.closest('[data-rc-auth-wechat]')) { requestPendingChannel(dialog, 'wechat'); return; }
        if (event.target.closest('[data-rc-auth-qq]')) { requestPendingChannel(dialog, 'qq'); return; }
      });
      dialog.addEventListener('keydown', event => {
        if (event.key !== 'Enter' || event.target.closest('#rc-login-form')) return;
        if (!event.target.closest('[data-rc-auth-phone]')) return;
        event.preventDefault();
        requestPendingChannel(dialog, 'sms-verify');
      });
      dialog.addEventListener('cancel', () => { state.loginOpen = false; });
      dialog.addEventListener('close', () => {
        state.loginOpen = false;
        if (state.holdFocusRestore) { state.holdFocusRestore = false; return; }
        restoreFocus();
      });
      form.addEventListener('submit', async event => {
        event.preventDefault();
        const error = dialog.querySelector('#rc-login-error');
        const button = dialog.querySelector('#rc-email-submit');
        error.textContent = '';
        button.disabled = true;
        button.textContent = '处理中…';
        try {
          const data = { email: form.elements.email.value.trim(), password: form.elements.password.value };
          const result = await api('/api/auth/' + state.mode, { method: 'POST', body: data });
          state.csrf = result?.csrfToken || '';
          // Login only establishes a session. Merge local and account careers after /me.
          await refresh({ silent: true, reason: 'login', promptConflict: false });
          if (!state.me?.user) await refresh({ silent: true, reason: 'login', promptConflict: false });
          const openingConflict = Boolean(state.conflict && !conflictDismissed());
          if (openingConflict) state.holdFocusRestore = true;
          closeDialog(dialog);
          notify(state.mode === 'login' ? '已登录。' : '账户已创建。');
          if (openingConflict) openConflictDialog();
        } catch (err) {
          error.textContent = friendlyError(err);
        } finally {
          button.disabled = false;
          updateLoginDialog(dialog);
        }
      });
    }
    updateLoginDialog(dialog);
    paintChannelAffordances(dialog);
    if (!dialog.open) {
      rememberFocus();
      state.loginOpen = true;
      dialog.showModal();
      setTimeout(() => dialog.querySelector('#rc-phone')?.focus(), 0);
    }
    loadAuthChannels().then(() => { if (dialog.isConnected) paintChannelAffordances(dialog); });
    return dialog;
  }

  function updateLoginDialog(dialog) {
    const isLogin = state.mode === 'login';
    dialog.querySelector('#rc-login-title').textContent = isLogin ? '登录学习账户' : '创建学习账户';
    const password = dialog.querySelector('#rc-password');
    if (password) password.autocomplete = isLogin ? 'current-password' : 'new-password';
    const label = isLogin ? '登录' : '创建账户';
    const phoneSubmit = dialog.querySelector('#rc-login-submit');
    const emailSubmit = dialog.querySelector('#rc-email-submit');
    if (phoneSubmit) phoneSubmit.textContent = label;
    if (emailSubmit && !emailSubmit.disabled) emailSubmit.textContent = label;
    dialog.querySelector('[data-rc-switch]').textContent = isLogin ? '还没有账户？创建账户' : '已有账户？直接登录';
    const emailError = dialog.querySelector('#rc-login-error');
    if (emailSubmit && !emailSubmit.disabled && emailError) emailError.textContent = '';
  }

  async function switchToCareer(career, sourceButton) {
    const careerId = careerIdOf(career);
    const title = typeof career?.title === 'string' ? career.title.trim() : '';
    if (!careerId || !title || state.switchInFlight) return;
    if (currentCareer()?.careerId === careerId) return;
    const switchRequestId = ++state.switchRequestId;
    state.switchInFlight = true;
    state.switchingCareerId = careerId;
    if (sourceButton) { sourceButton.disabled = true; sourceButton.textContent = '切换中…'; }
    if (document.getElementById('rc-career-dialog')?.open) renderCareers();
    let failed = null;
    try {
      let stored = career;
      let persisted = true;
      if (state.me?.user) {
        stored = await confirmAccountCareer(career);
        if (switchRequestId !== state.switchRequestId) return;
      }
      const nextCareer = { ...stored, careerId, title: (typeof stored?.title === 'string' && stored.title.trim()) || title };
      if (state.me?.user) {
        state.me = { user: state.me.user ? { ...state.me.user } : null, activeCareer: nextCareer };
        state.conflict = null;
        clearConflictDismissal();
      }
      try { writeLocalCareer(nextCareer); }
      catch {
        persisted = false;
        state.localCareer = { ...nextCareer, schema: 1, writtenAt: new Date().toISOString(), summary: nextCareer.summary || '', contentVersion: nextCareer.contentVersion || '', indexVersion: nextCareer.indexVersion || '', textbookVersionId: nextCareer.textbookVersionId || '', corpusHash: nextCareer.corpusHash || '' };
      }
      if (switchRequestId !== state.switchRequestId) return;
      resetCareerSelection();
      const dialog = document.getElementById('rc-career-dialog');
      if (dialog?.open) closeDialog(dialog);
      render();
      emit('career_switch');
      notify(persisted ? '已切换到 ' + (nextCareer.title || title) + '。' : '已切换到 ' + (nextCareer.title || title) + '。本机浏览器未能保存，刷新后需要重新选择。');
    } catch (err) {
      failed = err;
      if (switchRequestId !== state.switchRequestId) return;
      if (isContentVersionMismatch(err)) {
        state.searchError = friendlyError(err);
        state.searchErrorCode = err.code || '';
        state.careerStatus = 'unavailable';
      }
    } finally {
      if (switchRequestId === state.switchRequestId) {
        state.switchInFlight = false;
        state.switchingCareerId = '';
        if (failed) {
          if (sourceButton?.isConnected) { sourceButton.disabled = false; sourceButton.textContent = '切换到该职业'; }
          if (document.getElementById('rc-career-dialog')?.open) renderCareers();
          notify(friendlyError(failed));
        }
      }
    }
  }

  function paintConflictDialog(dialog) {
    const body = dialog.querySelector('#rc-conflict-body');
    if (!body || !state.conflict) return;
    body.textContent = '本机正在使用「' + state.conflict.local.title + '」，账户当前为「' + state.conflict.account.title + '」。';
    const error = dialog.querySelector('#rc-conflict-error');
    if (error && !state.conflictBusy) error.textContent = '';
  }

  function paintConflictBusy(dialog) {
    dialog = dialog || document.getElementById('rc-career-conflict-dialog');
    if (!dialog) return;
    const primary = dialog.querySelector('[data-rc-conflict-local]');
    if (primary && !primary.dataset.rcLabelHtml) primary.dataset.rcLabelHtml = primary.innerHTML;
    for (const button of dialog.querySelectorAll('button')) button.disabled = Boolean(state.conflictBusy);
    if (primary) primary.innerHTML = state.conflictBusy ? '同步中…' : primary.dataset.rcLabelHtml;
  }

  function restoreConflictFocus() {
    const target = state.lastFocus;
    state.lastFocus = null;
    const buried = target?.closest?.('dialog') && !target.closest('dialog').open;
    if (!buried && target?.isConnected && typeof target.focus === 'function') { target.focus(); return; }
    document.querySelector('[data-rc-open-careers]')?.focus();
  }

  function openConflictDialog() {
    if (!state.conflict || !state.me?.user) return;
    let dialog = document.getElementById('rc-career-conflict-dialog');
    if (!dialog) {
      dialog = document.createElement('dialog');
      dialog.id = 'rc-career-conflict-dialog';
      dialog.setAttribute('aria-labelledby', 'rc-conflict-title');
      dialog.setAttribute('aria-describedby', 'rc-conflict-body');
      dialog.innerHTML = '<div class="rc-dialog-form rc-conflict-form"><div class="rc-dialog-head"><div><span class="rc-eyebrow">职业方向</span><h2 id="rc-conflict-title">选择要使用的职业方向</h2></div><button type="button" class="rc-close" data-rc-conflict-dismiss aria-label="关闭">×</button></div><p id="rc-conflict-body"></p><div class="rc-conflict-options"><button type="button" class="primary" data-rc-conflict-local><span class="rc-conflict-kicker">建议</span>使用本机职业并同步到账户</button><button type="button" class="outline" data-rc-conflict-account>使用账户职业</button></div><p class="rc-form-error" id="rc-conflict-error" role="alert"></p><button type="button" class="rc-conflict-later" data-rc-conflict-dismiss>稍后选择</button></div>';
      document.body.appendChild(dialog);
      dialog.addEventListener('click', event => {
        if (state.conflictBusy) return;
        if (event.target === dialog || event.target.closest('[data-rc-conflict-dismiss]')) { dialog.close(); return; }
        if (event.target.closest('[data-rc-conflict-local]')) { chooseLocalCareer(); return; }
        if (event.target.closest('[data-rc-conflict-account]')) { chooseAccountCareer(); return; }
      });
      dialog.addEventListener('cancel', event => { if (state.conflictBusy) event.preventDefault(); });
      dialog.addEventListener('close', () => {
        const choice = state.conflictChoice;
        state.conflictChoice = '';
        if (choice !== 'local' && choice !== 'account' && choice !== 'closed') dismissConflict();
        restoreConflictFocus();
      });
    }
    paintConflictDialog(dialog);
    paintConflictBusy(dialog);
    if (!dialog.open) {
      rememberFocus();
      dialog.showModal();
      setTimeout(() => dialog.querySelector('[data-rc-conflict-local]')?.focus(), 0);
    }
    return dialog;
  }

  async function chooseLocalCareer() {
    if (state.conflictBusy || !state.conflict || !state.localCareer) return;
    const localId = state.localCareer.careerId;
    const localBefore = { ...state.localCareer };
    state.conflictBusy = true;
    paintConflictBusy();
    const dialog = document.getElementById('rc-career-conflict-dialog');
    try {
      await writeAccountCareer(localId);
      const me = await api('/api/auth/me');
      const written = me?.activeCareer;
      if (!written || careerIdOf(written) !== localId) throw Error('账户职业尚未改为本机职业，请重试。');
      state.csrf = me?.csrfToken || state.csrf || '';
      state.me = { user: state.me?.user ? { ...state.me.user } : null, activeCareer: { ...written } };
      try { writeLocalCareer(written.title ? written : localBefore); }
      catch { state.localCareer = localBefore; notify('账户已改为本机职业，但本机记录未能更新。'); }
      state.conflict = null;
      clearConflictDismissal();
      state.conflictChoice = 'local';
      if (dialog?.open) dialog.close();
      render();
      emit('career_switch');
      notify('已使用本机职业，并同步到当前账户。');
    } catch (err) {
      if (!state.me?.user) {
        state.conflictChoice = 'closed';
        if (dialog?.open) dialog.close();
      } else {
        const error = dialog?.querySelector('#rc-conflict-error');
        if (error) error.textContent = friendlyError(err);
      }
      notify(friendlyError(err));
    } finally {
      state.conflictBusy = false;
      paintConflictBusy();
    }
  }

  function chooseAccountCareer() {
    if (state.conflictBusy || !state.conflict || !careerIdOf(state.me?.activeCareer)) return;
    const account = state.me.activeCareer;
    const previous = state.localCareer ? { ...state.localCareer } : null;
    try {
      writeLocalCareer(account);
    } catch {
      state.localCareer = previous;
      const error = document.getElementById('rc-conflict-error');
      if (error) error.textContent = '本机未能保存账户职业，当前职业未改变。';
      notify('本机未能保存账户职业，当前职业未改变。');
      return;
    }
    state.conflict = null;
    clearConflictDismissal();
    state.conflictChoice = 'account';
    const dialog = document.getElementById('rc-career-conflict-dialog');
    if (dialog?.open) dialog.close();
    render();
    emit('career_switch');
    notify('已切换到 ' + (account.title || '账户职业') + '。');
  }

  function careerDialog() {
    let dialog = document.getElementById('rc-career-dialog');
    if (!dialog) {
      dialog = document.createElement('dialog');
      dialog.id = 'rc-career-dialog';
      dialog.setAttribute('aria-labelledby', 'rc-career-title');
      dialog.innerHTML = '<div class="rc-dialog-form rc-career-form"><div class="rc-dialog-head"><div><span class="rc-eyebrow">职业探索</span><h2 id="rc-career-title">选择你的职业方向</h2></div><button type="button" class="rc-close" data-rc-close aria-label="关闭">×</button></div><div class="rc-career-body"><p class="rc-dialog-copy">用自然语言描述你想做的工作、已有基础或目标。Agent 只会推荐当前已发布的职业。点「切换到该职业」即切换当前学习方向。</p><p class="rc-career-helper" id="rc-career-helper"></p><form class="rc-search-row" id="rc-career-search"><label class="sr-only" for="rc-career-query">描述职业目标</label><input id="rc-career-query" type="search" maxlength="1200" placeholder="例如：我想做能调用工具的智能体应用" autocomplete="off"><button class="primary" type="submit" data-rc-search>推荐职业</button></form><div class="rc-agent-boundary">推荐依据当前职业目录和关键词/本机语义匹配；不会生成新的职业或承诺就业结果。</div><div id="rc-career-results" class="rc-career-results" aria-live="polite"></div></div></div>';
      document.body.appendChild(dialog);
      dialog.addEventListener('click', async event => {
        if (event.target === dialog || event.target.closest('[data-rc-close]')) { closeDialog(dialog); return; }
        const browse = event.target.closest('[data-rc-browse-content]');
        if (browse) {
          event.preventDefault();
          const candidate = state.careers.find(c => c.careerId === browse.dataset.rcBrowseContent);
          if (!validCareerCandidate(candidate)) return;
          const target = '#learn/career/' + candidate.careerId;
          closeDialog(dialog);
          if (location.hash === target) globalThis.LearningWorkbench?.followCareerRoute?.('hash');
          else location.hash = target;
          return;
        }
        const clarify = event.target.closest('[data-rc-clarify]');
        if (event.target.closest('[data-rc-show-directory]')) { state.query = ''; dialog.querySelector('#rc-career-query').value = ''; clearTimeout(state.searchTimer); searchCareers(); return; }
        if (clarify) {
          const option = state.careerClarification?.options?.[Number(clarify.dataset.rcClarify)];
          const next = typeof option === 'string' ? option : option?.query || option?.label || option?.title || '';
          if (next) { state.query = next; const input = dialog.querySelector('#rc-career-query'); if (input) input.value = next; searchCareers(); }
          return;
        }
        const switchButton = event.target.closest('[data-rc-switch-career]');
        if (!switchButton || switchButton.disabled || state.switchInFlight) return;
        const candidate = state.careers.find(c => c.careerId === switchButton.dataset.rcSwitchCareer);
        switchToCareer(candidate, switchButton);
      });
      dialog.querySelector('#rc-career-search').addEventListener('submit', event => { event.preventDefault(); state.query = dialog.querySelector('#rc-career-query').value; clearTimeout(state.searchTimer); state.searchTimer = null; searchCareers(); });
      dialog.querySelector('#rc-career-query').addEventListener('input', event => {
        state.query = event.target.value;
        ++state.searchSeq;
        state.searchController?.abort();
        state.searchController = null;
        state.careers = [];
        state.searchError = '';
        state.searchErrorCode = '';
        state.careerStatus = 'retrieving';
        state.careerOperation = state.query.trim() ? 'recommend' : 'catalog';
        state.careerClarification = null;
        state.lastCareerResult = null;
        state.busy = true;
        resetCareerSelection();
        renderCareers();
        clearTimeout(state.searchTimer);
        state.searchTimer = setTimeout(() => { if (dialog.open) searchCareers(); }, 220);
      });
      dialog.addEventListener('close', () => { state.careerOpen = false; ++state.searchSeq; clearTimeout(state.searchTimer); state.searchTimer = null; if (state.searchController) state.searchController.abort(); state.searchController = null; state.busy = false; state.careerStatus = 'idle'; state.careerClarification = null; resetCareerSelection(); restoreFocus(); });
    }
    const input = dialog.querySelector('#rc-career-query');
    input.value = state.query;
    if (!dialog.open) {
      rememberFocus();
      state.careerOpen = true;
      dialog.showModal();
      setTimeout(() => input.focus({ preventScroll: true }), 0);
      searchCareers();
    } else {
      renderCareers();
    }
    paintCareerHelper();
    return dialog;
  }

  function renderCareers() {
    const area = document.getElementById('rc-career-results');
    if (!area) return;
    if (state.busy || state.careerStatus === 'idle') { area.innerHTML = '<div class="rc-agent-state rc-agent-loading" role="status"><span class="rc-agent-mark" aria-hidden="true">…</span><div><strong>' + (state.careerOperation === 'catalog' ? '正在加载职业目录' : 'Agent 正在理解你的目标') + '</strong><p>' + (state.careerOperation === 'catalog' ? '正在读取当前已发布职业。' : '正在检索已发布职业；旧结果不会覆盖本次请求。') + '</p></div></div>'; return; }
    if (state.searchError && isContentVersionMismatch({ code: state.searchErrorCode })) { area.innerHTML = globalThis.LearningWorkbench?.contentUpdateMarkup?.('alert') || '<div class="rc-agent-state rc-agent-update" role="alert"><span class="rc-agent-mark" aria-hidden="true">新</span><div><strong>教材已更新</strong><p>' + esc(state.searchError) + '</p><p>当前打开的页面可能仍显示旧正文，直到刷新。不会自动重载，提问仍可继续。</p><div class="lw-content-update-actions"><button type="button" class="primary" data-lw-content-refresh>刷新到新版</button><button type="button" class="outline" data-lw-content-export>先导出本机记录</button></div></div></div>'; return; }
    if (state.searchError || state.careerStatus === 'unavailable') { area.innerHTML = '<div class="rc-agent-state rc-agent-error" role="alert"><span class="rc-agent-mark" aria-hidden="true">!</span><div><strong>' + (state.careerOperation === 'catalog' ? '职业目录暂时不可用' : '职业推荐暂时不可用') + '</strong><p>' + esc(state.searchError || state.lastCareerResult?.message || '服务未能返回可用结果，请重试。') + '</p><button type="button" class="outline" data-rc-retry-search>重试</button></div></div>'; return; }
    if (state.careerStatus === 'invalid_input') { area.innerHTML = '<div class="rc-agent-state rc-agent-error" role="alert"><span class="rc-agent-mark" aria-hidden="true">!</span><div><strong>请检查职业描述</strong><p>请输入 1—1200 字的职业目标或已有能力。</p></div></div>'; return; }
    if (state.careerStatus === 'needs_clarification' && state.careerClarification) {
      const clarification = state.careerClarification;
      const options = Array.isArray(clarification.options) ? clarification.options.slice(0, 3) : [];
      area.innerHTML = '<section class="rc-agent-state rc-agent-clarify" aria-live="polite"><span class="rc-agent-mark" aria-hidden="true">?</span><div><strong>请补充职业方向</strong><p>' + esc(clarification.question || clarification.message || '你想选择哪一类职业方向？') + '</p><div class="rc-clarifications">' + options.map((option, index) => '<button type="button" class="outline" data-rc-clarify="' + index + '">' + esc(typeof option === 'string' ? option : option.label || option.title || option.query) + '</button>').join('') + '</div></div></section>';
      return;
    }
    if (!state.careers.length) { const emptyCatalog = state.careerStatus === 'catalog_empty'; area.innerHTML = '<div class="rc-agent-state rc-agent-empty"><span class="rc-agent-mark" aria-hidden="true">?</span><div><strong>' + (emptyCatalog ? '暂无可选职业' : '没有匹配的已发布职业') + '</strong><p>' + (emptyCatalog ? '当前职业目录还没有可供选择的公开内容。' : '换一种目标描述，或补充你想做的具体工作。') + '</p><button type="button" class="outline" ' + (emptyCatalog ? 'data-rc-retry-search>重试目录' : 'data-rc-show-directory>查看全部职业') + '</button></div></div>'; return; }
    const meta = state.lastCareerResult || {};
    const cards = state.careers.map((career, index) => {
      if (!validCareerCandidate(career)) return '';
      const active = career.careerId === currentCareer()?.careerId;
      const pending = state.switchInFlight && state.switchingCareerId === career.careerId;
      const signals = career.hasMatchedSignals && career.matchedSignals.length ? '<div><strong>匹配信号</strong><ul>' + career.matchedSignals.map(signal => '<li>' + esc(signal) + '</li>').join('') + '</ul></div>' : '';
      const gaps = career.hasGaps && career.gaps.length ? '<div><strong>待补能力</strong><ul>' + career.gaps.map(gap => '<li>' + esc(gap) + '</li>').join('') + '</ul></div>' : '';
      const signalPanel = signals || gaps ? '<div class="rc-career-signals">' + signals + gaps + '</div>' : '';
      const actions = career.actions || [];
      const browseHref = '#learn/career/' + career.careerId;
      const readOnlyActions = '<div class="rc-career-actions"><a class="outline" href="' + esc(browseHref) + '" data-rc-browse-content="' + esc(career.careerId) + '">' + (active ? '继续学习' : '浏览教材') + '</a>' + (actions.includes('compare') ? '<span class="rc-career-action">可比较</span>' : '') + '</div>';
      const label = active ? '当前职业' : pending ? '切换中…' : '切换到该职业';
      return '<article class="rc-career-card ' + (active ? 'is-active' : '') + '"><div><div class="rc-career-title"><strong>' + esc(career.title) + '</strong>' + (index === 0 && state.query ? '<span class="rc-match">首选</span>' : '') + (active ? '<span class="rc-current">当前</span>' : '') + '</div><p>' + esc(career.summary || '') + '</p><small>' + esc(career.reason || '') + '</small><p class="rc-career-match-basis"><span>匹配依据</span> ' + esc(meta.label || careerMatchLabel(meta)) + '</p><details class="rc-career-provenance"><summary>版本与出处</summary><div class="rc-career-evidence"><span>教材版本</span> ' + esc(career.contentVersion || '服务未提供') + '<br><span>索引版本</span> ' + esc(career.indexVersion || '服务未提供') + '<br><span>教材身份</span> ' + esc(career.textbookVersionId || '服务未提供') + '<br><span>语料 SHA256</span> ' + esc(career.corpusHash || '服务未提供') + '<br><span>职业服务版本</span> ' + esc(CAREER_AGENT_VERSION) + '<br><span>本次请求</span> ' + esc(meta.requestId || state.searchSeq) + '</div></details>' + signalPanel + readOnlyActions + '</div><button type="button" class="' + (active ? 'outline' : 'primary') + '" data-rc-switch-career="' + esc(career.careerId) + '"' + (active || state.switchInFlight ? ' disabled' : '') + '>' + label + '</button></article>';
    }).join('');
    area.innerHTML = '<div class="rc-agent-result-meta"><span>' + esc(meta.label || careerMatchLabel(meta)) + '</span><span>共 ' + state.careers.length + ' 个候选</span></div>' + cards;
  }

  async function searchCareers() {
    const expression = state.query.trim();
    const operation = expression ? 'recommend' : 'catalog';
    const sequence = ++state.searchSeq;
    const requestKey = uuid();
    if (state.searchController) state.searchController.abort();
    state.searchController = typeof AbortController === 'function' ? new AbortController() : null;
    const controller = state.searchController;
    state.busy = true;
    state.searchError = '';
    state.searchErrorCode = '';
    state.careerStatus = 'retrieving';
    state.careerOperation = operation;
    state.careerClarification = null;
    resetCareerSelection();
    renderCareers();
    try {
      if (expression.length > CAREER_QUERY_LIMIT) throw Object.assign(new Error('职业描述不能超过 1200 字。'), { code: 'input_invalid' });
      let result;
      if (operation === 'catalog') {
        result = await api('/api/careers', { signal: controller?.signal });
      } else {
        try {
          result = await api('/api/agent/career/recommend', { method: 'POST', signal: controller?.signal, headers: { 'X-Rolecraft-Agent-Request-Id': requestKey, 'X-Rolecraft-Agent-Version': CAREER_AGENT_VERSION }, body: { requestId: requestKey, query: expression, activeCareerId: currentCareer()?.careerId || null, locale: 'zh-CN', workbenchVersion: WORKBENCH_VERSION, agentVersion: CAREER_AGENT_VERSION } });
        } catch (error) {
          if (!routeUnavailable(error) || sequence !== state.searchSeq) throw error;
          result = await api('/api/careers?q=' + encodeURIComponent(expression), { signal: controller?.signal, headers: { 'X-Rolecraft-Agent-Request-Id': requestKey, 'X-Rolecraft-Agent-Version': CAREER_AGENT_VERSION } });
        }
      }
      if (sequence !== state.searchSeq) return;
      if (result?.query != null && result.query !== expression) throw Error('职业推荐响应与本次输入不一致，请重试。');
      if (result?.requestId && result.requestId !== requestKey) throw Error('职业推荐响应与本次请求不一致，请重试。');
      const normalized = normalizeCareerResult(result, requestKey, expression, operation);
      normalized.requestId = requestKey;
      state.careers = normalized.candidates;
      state.careerStatus = normalized.status;
      state.careerClarification = normalized.clarification;
      state.lastCareerResult = normalized;
    } catch (error) {
      if (isAbort(error) || sequence !== state.searchSeq) return;
      state.careers = [];
      state.careerStatus = error?.code === 'input_invalid' ? 'invalid_input' : 'unavailable';
      state.searchErrorCode = error?.code || '';
      state.searchError = error?.code === 'input_invalid' ? '' : friendlyError(error);
      state.careerClarification = null;
      state.lastCareerResult = { requestId: requestKey, query: state.query.trim(), status: state.careerStatus, label: '职业目录匹配' };
    } finally {
      if (sequence === state.searchSeq) { state.busy = false; renderCareers(); }
    }
  }

  function accountMenu() {
    const existing = document.getElementById('rc-account-menu');
    if (existing) { existing.remove(); render(); return; }
    const trigger = document.querySelector('[data-rc-account]');
    const menu = document.createElement('div');
    menu.id = 'rc-account-menu';
    menu.className = 'rc-account-menu';
    menu.setAttribute('role', 'menu');
    menu.innerHTML = '<strong>' + esc(state.me?.user?.email || '') + '</strong><button type="button" role="menuitem" data-rc-open-careers>切换职业</button><button type="button" role="menuitem" data-rc-logout>退出登录</button>';
    document.body.appendChild(menu);
    const rect = trigger?.getBoundingClientRect();
    if (rect) { menu.style.top = Math.round(rect.bottom + 8) + 'px'; menu.style.right = Math.max(12, Math.round(innerWidth - rect.right)) + 'px'; }
    document.querySelector('[data-rc-account]')?.setAttribute('aria-expanded', 'true');
    setTimeout(() => menu.querySelector('button')?.focus(), 0);
  }

  async function logout() {
    try {
      await api('/api/auth/logout', { method: 'POST', body: {} });
      state.csrf = '';
      if (!state.conflict && careerIdOf(state.me?.activeCareer)) {
        try { writeLocalCareer(state.me.activeCareer); } catch { /* Keep the previous local career if the browser cannot store. */ }
      }
      clearConflictDismissal();
      state.conflict = null;
      setSession(null, 'logout');
      notify('已退出当前账户。');
      return true;
    } catch (error) {
      notify(friendlyError(error));
      return false;
    }
  }

  function init() {
    state.localCareer = readLocalCareer();
    const topbar = document.querySelector('.topbar');
    if (!topbar || document.getElementById('rc-account-career')) return;
    const profile = document.querySelector('.local-profile');
    if (profile) state.originalProfileHTML = profile.innerHTML;
    const side = document.querySelector('.side-note strong');
    if (side) state.originalCareerTitle = side.textContent;
    const area = document.createElement('div');
    area.id = 'rc-account-career';
    area.className = 'rc-account-career';
    topbar.appendChild(area);
    document.addEventListener('click', event => {
      const menu = document.getElementById('rc-account-menu');
      if (event.target.closest('[data-rc-open-conflict]')) { menu?.remove(); openConflictDialog(); return; }
      if (event.target.closest('[data-rc-switch-reading]')) {
        const career = globalThis.LearningWorkbench?.readingCareer?.();
        if (career) switchToCareer(career, event.target.closest('[data-rc-switch-reading]'));
        return;
      }
      if (event.target.closest('[data-rc-open-login]')) { state.mode = 'login'; loginDialog(); return; }
      if (event.target.closest('[data-rc-account]')) { accountMenu(); return; }
      if (event.target.closest('[data-rc-open-careers]')) { menu?.remove(); careerDialog(); return; }
      if (event.target.closest('[data-rc-retry-search]')) { searchCareers(); return; }
      if (event.target.closest('[data-rc-switch]')) { state.mode = state.mode === 'login' ? 'register' : 'login'; const dialog = loginDialog(); dialog.querySelector('#rc-phone')?.focus(); return; }
      if (event.target.closest('[data-rc-logout]')) { menu?.remove(); logout(); return; }
      if (menu && !event.target.closest('#rc-account-menu')) { menu.remove(); render(); }
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') { const menu = document.getElementById('rc-account-menu'); if (menu) { menu.remove(); render(); } }
    });
    render();
    refresh({ silent: true }).catch(error => { if (error?.code !== 'static_page') notify(friendlyError(error)); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();

  globalThis.addEventListener?.('pageshow', event => {
    if (!event.persisted) return;
    state.csrf = '';
    setSession(null, 'revalidate');
    refresh({ silent: true }).catch(() => {});
  });

  globalThis.RolecraftAuthCareer = {
    agentVersion: CAREER_AGENT_VERSION,
    localCareerKey: LOCAL_CAREER_KEY,
    getSession,
    currentCareer,
    hasCareerConflict: () => Boolean(state.conflict),
    api,
    refresh,
    subscribe,
    openCareers: careerDialog,
    openLogin: () => { state.mode = 'login'; return loginDialog(); },
    logout,
    state
  };
})();
