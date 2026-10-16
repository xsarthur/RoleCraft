/* Account and imported-career switcher for the v15 MVP. */
(function () {
  'use strict';

  const state = {
    me: null,
    csrf: '',
    careers: [],
    query: '',
    mode: 'login',
    busy: false,
    searchError: '',
    searchSeq: 0,
    searchTimer: null,
    searchController: null,
    selectedCareer: null,
    selectionRequestId: 0,
    switchRequestId: 0,
    lastCareerResult: null,
    careerStatus: 'idle',
    careerClarification: null,
    sessionPromise: null,
    initializing: true,
    switchingCareerId: '',
    subscribers: new Set(),
    lastFocus: null,
    originalProfileHTML: null,
    originalCareerTitle: null,
    toastTimer: null
  };

  const CAREER_QUERY_LIMIT = 1200;
  const CAREER_AGENT_VERSION = 'agent-system-v0.12';
  const WORKBENCH_VERSION = 'local-workbench-0.11';

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
  const cloneSession = () => state.me ? {
    user: state.me.user ? { ...state.me.user } : null,
    activeCareer: state.me.activeCareer ? { ...state.me.activeCareer } : null
  } : null;

  function friendlyError(error) {
    if (isAbort(error)) return '请求已取消。';
    if (error?.status >= 500 || error?.code === 'network_error') return '服务暂时不可用，请稍后再试。';
    if (error?.status === 401) return '登录已失效，请重新登录。';
    if (error?.status === 403) return '当前操作未获授权，请重新登录后再试。';
    return error?.message || '请求未完成，请稍后再试。';
  }

  function validCareerCandidate(career) {
    return Boolean(career && typeof career === 'object' &&
      typeof career.careerId === 'string' && /^[a-z0-9][a-z0-9-]{0,127}$/.test(career.careerId) &&
      typeof career.title === 'string' && career.title.trim() &&
      typeof career.summary === 'string' && typeof career.reason === 'string' && career.reason.trim() &&
      typeof career.contentVersion === 'string' && career.contentVersion.trim() &&
      typeof career.indexVersion === 'string' && career.indexVersion.trim() &&
      career.available === true && career.status === 'published');
  }

  function careerMatchLabel(result) {
    if (!result) return '职业目录';
    if (result.semanticAvailable && typeof result.matchingMode === 'string' && result.matchingMode.includes('local_bge')) return '本机语义匹配 · 查询留在本机';
    if (result.matchingMode === 'catalog_keyword') return '关键词降级 · 未调用外部模型';
    return '职业目录匹配';
  }

  function resetCareerSelection() { state.selectedCareer = null; state.selectionRequestId = 0; }

  function normalizeCareerCandidate(candidate) {
    if (!candidate || typeof candidate !== 'object') return null;
    const content = candidate.careerContent || candidate.career_content || {};
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
      status: candidate.status || (available ? 'published' : ''),
      careerContent: { ...content, contentVersion, indexVersion, textbookVersionId: candidate.textbookVersionId || content.textbookVersionId || '', corpusHash: candidate.corpusHash || content.corpusHash || '', available }
    };
  }

  function normalizeCareerResult(result, requestId, query) {
    const candidates = (Array.isArray(result?.candidates) ? result.candidates : Array.isArray(result?.careers) ? result.careers : [])
      .map(normalizeCareerCandidate).filter(validCareerCandidate).slice(0, 3);
    const status = ['recommended','needs_clarification','no_match','unavailable','invalid_input'].includes(result?.status)
      ? result.status : (candidates.length ? 'recommended' : 'no_match');
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
      label: careerMatchLabel(result),
      receivedAt: new Date().toISOString()
    };
  }

  function routeUnavailable(error) { return error?.status === 404 || error?.status === 405 || error?.code === 'not_found'; }

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
    state.me = session ? {
      user: session.user ? { ...session.user } : null,
      activeCareer: session.activeCareer ? { ...session.activeCareer } : null
    } : null;
    render();
    emit(reason);
    return cloneSession();
  }

  async function api(path, options = {}) {
    if (isStatic()) throw Object.assign(new Error('当前页面需要通过本地服务访问账户功能。'), { code: 'static_page' });
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
      throw Object.assign(new Error('服务暂时不可用，请检查本地服务。'), { code: 'network_error', cause: error });
    }
    let payload = null;
    try { payload = await response.json(); } catch { /* an empty response is handled below */ }
    if (!response.ok) {
      const message = payload?.error?.message || (response.status >= 500 ? '服务暂时不可用，请稍后再试。' : '请求未完成，请稍后再试。');
      throw Object.assign(new Error(message), { status: response.status, code: payload?.error?.code, payload });
    }
    return payload;
  }

  async function refresh(options = {}) {
    if (state.sessionPromise) return state.sessionPromise;
    state.sessionPromise = (async () => {
      try {
        const result = await api('/api/auth/me', { signal: options.signal });
        state.csrf = result?.csrfToken || state.csrf || '';
        return setSession({ user: result?.user || null, activeCareer: result?.activeCareer || null }, 'refresh');
      } catch (error) {
        if (error?.status === 401) {
          state.csrf = '';
          return setSession(null, 'anonymous');
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
    side.textContent = state.me?.activeCareer?.title || state.originalCareerTitle || '当前学习方向';
  }

  function render() {
    const node = host();
    if (node) {
      const career = state.me?.activeCareer;
      node.innerHTML = state.me
        ? '<button class="rc-career-trigger" type="button" data-rc-open-careers aria-haspopup="dialog"><span class="rc-dot" aria-hidden="true"></span><span>' + esc(career?.title || '选择职业') + '</span><span aria-hidden="true">⌄</span></button><button class="rc-account-trigger" type="button" data-rc-account aria-haspopup="menu" aria-expanded="false">' + esc(state.me.user?.email || '账户') + '</button>'
        : '<button class="rc-career-trigger" type="button" data-rc-open-careers aria-haspopup="dialog"><span class="rc-dot" aria-hidden="true"></span><span>选择职业</span><span aria-hidden="true">⌄</span></button><button class="rc-login-trigger" type="button" data-rc-open-login>登录 / 注册</button>';
    }
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

  function loginDialog() {
    let dialog = document.getElementById('rc-login-dialog');
    if (!dialog) {
      dialog = document.createElement('dialog');
      dialog.id = 'rc-login-dialog';
      dialog.setAttribute('aria-labelledby', 'rc-login-title');
      dialog.innerHTML = '<form class="rc-dialog-form" id="rc-login-form"><div class="rc-dialog-head"><div><span class="rc-eyebrow">学习账户</span><h2 id="rc-login-title"></h2></div><button type="button" class="rc-close" data-rc-close aria-label="关闭">×</button></div><p class="rc-dialog-copy">登录后可保存职业和学习记录。</p><label for="rc-email">邮箱</label><input id="rc-email" name="email" type="email" autocomplete="email" required placeholder="you@example.com"><label for="rc-password">密码</label><input id="rc-password" name="password" type="password" autocomplete="current-password" minlength="12" maxlength="128" required placeholder="至少 12 个字符"><p class="rc-form-hint">使用邮箱和密码。</p><p class="rc-form-error" id="rc-login-error" role="alert"></p><button class="primary full" type="submit" id="rc-login-submit"></button><button class="rc-switch-mode" type="button" data-rc-switch></button></form>';
      document.body.appendChild(dialog);
      const form = dialog.querySelector('#rc-login-form');
      dialog.addEventListener('click', event => { if (event.target === dialog || event.target.closest('[data-rc-close]')) closeDialog(dialog); });
      dialog.addEventListener('cancel', () => { state.loginOpen = false; });
      dialog.addEventListener('close', () => { state.loginOpen = false; restoreFocus(); });
      form.addEventListener('submit', async event => {
        event.preventDefault();
        const error = dialog.querySelector('#rc-login-error');
        const button = dialog.querySelector('#rc-login-submit');
        error.textContent = '';
        button.disabled = true;
        button.textContent = '处理中…';
        try {
          const data = { email: form.elements.email.value.trim(), password: form.elements.password.value };
          const result = await api('/api/auth/' + state.mode, { method: 'POST', body: data });
          state.csrf = result?.csrfToken || '';
          // Login responses only establish a session. Refresh /me to obtain the canonical active career.
          await refresh({ silent: true });
          closeDialog(dialog);
          notify(state.mode === 'login' ? '已登录。' : '账户已创建。');
        } catch (err) {
          error.textContent = friendlyError(err);
        } finally {
          button.disabled = false;
          updateLoginDialog(dialog);
        }
      });
    }
    updateLoginDialog(dialog);
    rememberFocus();
    if (!dialog.open) {
      state.loginOpen = true;
      dialog.showModal();
      setTimeout(() => dialog.querySelector('#rc-email')?.focus(), 0);
    }
    return dialog;
  }

  function updateLoginDialog(dialog) {
    const isLogin = state.mode === 'login';
    dialog.querySelector('#rc-login-title').textContent = isLogin ? '登录学习账户' : '创建学习账户';
    dialog.querySelector('#rc-password').autocomplete = isLogin ? 'current-password' : 'new-password';
    dialog.querySelector('#rc-login-submit').textContent = isLogin ? '登录' : '创建账户';
    dialog.querySelector('[data-rc-switch]').textContent = isLogin ? '还没有账户？创建账户' : '已有账户？直接登录';
    if (!dialog.querySelector('#rc-login-submit').disabled) dialog.querySelector('#rc-login-error').textContent = '';
  }

  function careerDialog() {
    let dialog = document.getElementById('rc-career-dialog');
    if (!dialog) {
      dialog = document.createElement('dialog');
      dialog.id = 'rc-career-dialog';
      dialog.setAttribute('aria-labelledby', 'rc-career-title');
      dialog.innerHTML = '<div class="rc-dialog-form rc-career-form"><div class="rc-dialog-head"><div><span class="rc-eyebrow">职业探索 Agent · ' + CAREER_AGENT_VERSION + '</span><h2 id="rc-career-title">选择你的职业方向</h2></div><button type="button" class="rc-close" data-rc-close aria-label="关闭">×</button></div><p class="rc-dialog-copy">用自然语言描述你想做的工作、已有基础或目标。Agent 只会推荐当前已发布的职业；确认后才切换当前学习方向。</p><form class="rc-search-row" id="rc-career-search"><label class="sr-only" for="rc-career-query">描述职业目标</label><input id="rc-career-query" type="search" maxlength="1200" placeholder="例如：我想做能调用工具的智能体应用" autocomplete="off"><button class="primary" type="submit" data-rc-search>推荐职业</button></form><div class="rc-agent-boundary">推荐依据当前职业目录和关键词/本机语义匹配；不会生成新的职业或承诺就业结果。</div><div id="rc-career-results" class="rc-career-results" aria-live="polite"></div></div>';
      document.body.appendChild(dialog);
      dialog.addEventListener('click', async event => {
        if (event.target === dialog || event.target.closest('[data-rc-close]')) { closeDialog(dialog); return; }
        const choose = event.target.closest('[data-rc-select-career]');
        const clarify = event.target.closest('[data-rc-clarify]');
        const confirm = event.target.closest('[data-rc-confirm-career]');
        const cancel = event.target.closest('[data-rc-cancel-career]');
        if (cancel) { resetCareerSelection(); renderCareers(); return; }
        if (clarify) {
          const option = state.careerClarification?.options?.[Number(clarify.dataset.rcClarify)];
          const next = typeof option === 'string' ? option : option?.query || option?.label || option?.title || '';
          if (next) { state.query = next; const input = dialog.querySelector('#rc-career-query'); if (input) input.value = next; searchCareers(); }
          return;
        }
        if (choose) {
          const careerId = choose.dataset.rcSelectCareer;
          const candidate = state.careers.find(c => c.careerId === careerId);
          if (!candidate || !validCareerCandidate(candidate)) return;
          state.selectedCareer = { ...candidate };
          state.selectionRequestId = state.searchSeq;
          renderCareers();
          return;
        }
        if (!confirm) return;
        if (!state.me) { closeDialog(dialog); loginDialog(); return; }
        const selected = state.selectedCareer;
        if (!selected || state.selectionRequestId !== state.searchSeq || !state.careers.some(c => c.careerId === selected.careerId && c.contentVersion === selected.contentVersion && c.indexVersion === selected.indexVersion)) {
          resetCareerSelection();
          state.searchError = '';
          notify('推荐结果已更新，请重新选择职业。');
          renderCareers();
          return;
        }
        const careerId = selected.careerId, switchRequestId = ++state.switchRequestId;
        const expected = {
          status: selected.status || 'published',
          contentVersion: selected.contentVersion,
          indexVersion: selected.indexVersion || selected.careerContent?.indexVersion || '',
          textbookVersionId: selected.textbookVersionId || selected.careerContent?.textbookVersionId || '',
          corpusHash: selected.corpusHash || selected.careerContent?.corpusHash || ''
        };
        const recommendationRequestId = state.lastCareerResult?.requestId || '';
        const confirmRequestId = uuid();
        confirm.disabled = true;
        confirm.textContent = '确认中…';
        try {
          let result;
          try {
            result = await api('/api/agent/career/confirm', { method: 'POST', headers: { 'X-Rolecraft-Agent-Version': CAREER_AGENT_VERSION, 'X-Rolecraft-Agent-Request-Id': confirmRequestId, 'X-Rolecraft-Selection-Source': 'agent_confirmed' }, body: { requestId: confirmRequestId, recommendationRequestId, careerId, expected, confirmation: 'user_explicit', idempotencyKey: uuid(), workbenchVersion: WORKBENCH_VERSION, agentVersion: CAREER_AGENT_VERSION } });
          } catch (error) {
            if (!routeUnavailable(error)) throw error;
            // Older local servers only expose the explicit profile write. Keep the
            // confirmation boundary and send no unrecognized version fields there.
            result = await api('/api/profile/career', { method: 'PUT', headers: { 'X-Rolecraft-Agent-Version': CAREER_AGENT_VERSION, 'X-Rolecraft-Agent-Request-Id': confirmRequestId, 'X-Rolecraft-Selection-Source': 'agent_confirmed' }, body: { careerId } });
          }
          if (switchRequestId !== state.switchRequestId) return;
          const returned = normalizeCareerCandidate(result?.career);
          const merged = returned ? { ...selected, ...returned, summary: returned.summary || selected.summary, reason: returned.reason || selected.reason, matchReason: returned.matchReason || selected.matchReason, indexVersion: returned.indexVersion || selected.indexVersion, available: returned.available || selected.available, careerContent: { ...selected.careerContent, ...returned.careerContent, available: returned.available || selected.available } } : null;
          if (!returned || returned.careerId !== careerId || returned.contentVersion !== selected.contentVersion || (expected.textbookVersionId && returned.textbookVersionId && returned.textbookVersionId !== expected.textbookVersionId) || (expected.corpusHash && returned.corpusHash && returned.corpusHash !== expected.corpusHash) || !validCareerCandidate(merged)) throw Error('服务返回的职业版本与推荐不一致，请重试。');
          try { await refresh({ silent: true }); } catch {
            // The server confirmed the switch; keep the returned career while surfacing refresh failure.
            setSession({ user: state.me?.user, activeCareer: result?.career || null }, 'career_switch');
            notify('职业已切换，账户状态刷新失败，请稍后重试。');
          }
          resetCareerSelection();
          closeDialog(dialog);
          if (state.me?.activeCareer?.title) notify('已切换到 ' + state.me.activeCareer.title + '。');
        } catch (err) {
          confirm.disabled = false;
          confirm.textContent = '确认并切换职业';
          notify(friendlyError(err));
        }
      });
      dialog.querySelector('#rc-career-search').addEventListener('submit', event => { event.preventDefault(); state.query = dialog.querySelector('#rc-career-query').value; clearTimeout(state.searchTimer); state.searchTimer = null; searchCareers(); });
      dialog.querySelector('#rc-career-query').addEventListener('input', event => {
        state.query = event.target.value;
        ++state.searchSeq;
        state.searchController?.abort();
        state.searchController = null;
        state.careers = [];
        state.searchError = '';
        state.careerStatus = 'idle';
        state.careerClarification = null;
        state.lastCareerResult = null;
        state.busy = true;
        resetCareerSelection();
        renderCareers();
        clearTimeout(state.searchTimer);
        state.searchTimer = setTimeout(() => searchCareers(), 220);
      });
      dialog.addEventListener('close', () => { state.careerOpen = false; ++state.searchSeq; if (state.searchController) state.searchController.abort(); state.searchController = null; state.busy = false; state.careerStatus = 'idle'; state.careerClarification = null; resetCareerSelection(); restoreFocus(); });
    }
    const input = dialog.querySelector('#rc-career-query');
    input.value = state.query;
    renderCareers();
    rememberFocus();
    if (!dialog.open) {
      state.careerOpen = true;
      dialog.showModal();
      setTimeout(() => input.focus(), 0);
    }
    if (!state.careers.length && !state.busy && state.query.trim()) searchCareers();
    return dialog;
  }

  function renderCareers() {
    const area = document.getElementById('rc-career-results');
    if (!area) return;
    if (state.busy) { area.innerHTML = '<div class="rc-agent-state rc-agent-loading" role="status"><span class="rc-agent-mark" aria-hidden="true">…</span><div><strong>Agent 正在理解你的目标</strong><p>正在检索已发布职业；旧结果不会覆盖本次请求。</p></div></div>'; return; }
    if (state.searchError) { area.innerHTML = '<div class="rc-agent-state rc-agent-error" role="alert"><span class="rc-agent-mark" aria-hidden="true">!</span><div><strong>职业推荐暂时不可用</strong><p>' + esc(state.searchError) + '</p><button type="button" class="outline" data-rc-retry-search>重试</button></div></div>'; return; }
    if (state.careerStatus === 'invalid_input') { area.innerHTML = '<div class="rc-agent-state rc-agent-error" role="alert"><span class="rc-agent-mark" aria-hidden="true">!</span><div><strong>请检查职业描述</strong><p>请输入 1—1200 字的职业目标或已有能力。</p></div></div>'; return; }
    if (state.careerStatus === 'needs_clarification' && state.careerClarification) {
      const clarification = state.careerClarification;
      const options = Array.isArray(clarification.options) ? clarification.options.slice(0, 3) : [];
      area.innerHTML = '<section class="rc-agent-state rc-agent-clarify" aria-live="polite"><span class="rc-agent-mark" aria-hidden="true">?</span><div><strong>请补充职业方向</strong><p>' + esc(clarification.question || clarification.message || '你想选择哪一类职业方向？') + '</p><div class="rc-clarifications">' + options.map((option, index) => '<button type="button" class="outline" data-rc-clarify="' + index + '">' + esc(typeof option === 'string' ? option : option.label || option.title || option.query) + '</button>').join('') + '</div></div></section>';
      return;
    }
    if (!state.careers.length) { area.innerHTML = '<div class="rc-agent-state rc-agent-empty"><span class="rc-agent-mark" aria-hidden="true">?</span><div><strong>' + (state.query.trim() ? '没有匹配的已发布职业' : '暂无可选职业') + '</strong><p>' + (state.query.trim() ? '换一种目标描述，或补充你想做的具体工作。' : '当前职业目录还没有可供选择的公开内容。') + '</p></div></div>'; return; }
    const meta = state.lastCareerResult || {};
    const cards = state.careers.map((career, index) => {
      if (!validCareerCandidate(career)) return '';
      const active = career.careerId === state.me?.activeCareer?.careerId;
      const selected = state.selectedCareer?.careerId === career.careerId && state.selectedCareer?.contentVersion === career.contentVersion;
      const signals = career.hasMatchedSignals && career.matchedSignals.length ? career.matchedSignals.map(signal => '<li>' + esc(signal) + '</li>').join('') : '<li>服务未提供</li>';
      const gaps = career.hasGaps && career.gaps.length ? career.gaps.map(gap => '<li>' + esc(gap) + '</li>').join('') : '<li>服务未提供</li>';
      const actions = career.actions || [];
      const readOnlyActions = '<div class="rc-career-actions"><span>只读入口</span>' + (actions.includes('browse_content') ? '<a class="outline" href="#learn" data-rc-browse-content="' + esc(career.careerId) + '">浏览教材</a>' : '') + (actions.includes('compare') ? '<span class="rc-career-action">可比较</span>' : '') + (actions.length ? '' : '<span class="rc-career-action">服务未提供</span>') + '</div>';
      return '<article class="rc-career-card ' + (active ? 'is-active' : '') + (selected ? ' is-selected' : '') + '"><div><div class="rc-career-title"><strong>' + esc(career.title) + '</strong>' + (index === 0 && state.query ? '<span class="rc-match">首选</span>' : '') + (active ? '<span class="rc-current">当前</span>' : '') + '</div><p>' + esc(career.summary || '') + '</p><small>' + esc(career.reason || '') + '</small><div class="rc-career-evidence"><span>教材版本</span> ' + esc(career.contentVersion || '服务未提供') + ' · <span>索引</span> ' + esc(career.indexVersion || '服务未提供') + '<br><span>教材身份</span> ' + esc(career.textbookVersionId || '服务未提供') + ' · <span>语料 SHA256</span> ' + esc(career.corpusHash || '服务未提供') + '<br><span>依据</span> ' + esc(meta.label || careerMatchLabel(meta)) + '</div><div class="rc-career-signals"><div><strong>匹配信号</strong><ul>' + signals + '</ul></div><div><strong>待补能力</strong><ul>' + gaps + '</ul></div></div>' + readOnlyActions + '</div><button type="button" class="outline" data-rc-select-career="' + esc(career.careerId) + '" ' + (active ? 'disabled' : '') + '>' + (active ? '当前职业' : selected ? '已选' : '查看并确认') + '</button></article>';
    }).join('');
    const selected = state.selectedCareer && state.careers.find(c => c.careerId === state.selectedCareer.careerId && c.contentVersion === state.selectedCareer.contentVersion);
    const confirmation = selected ? '<section class="rc-career-confirm" aria-live="polite"><strong>确认你的职业选择</strong><p><b>' + esc(selected.title) + '</b> · ' + esc(selected.summary || '') + '</p><p class="rc-confirm-note">确认后才会写入当前账户的职业方向，并按该职业教材加载学习工作台。</p><div class="rc-confirm-actions"><button type="button" class="primary" data-rc-confirm-career>确认并切换职业</button><button type="button" class="outline" data-rc-cancel-career>换一个</button></div></section>' : '';
    area.innerHTML = '<div class="rc-agent-result-meta"><span>请求 #' + esc(meta.requestId || state.searchSeq) + '</span><span>' + esc(meta.label || careerMatchLabel(meta)) + '</span><span>共 ' + state.careers.length + ' 个候选</span></div>' + cards + confirmation;
  }

  async function searchCareers() {
    const sequence = ++state.searchSeq;
    const requestKey = uuid();
    if (state.searchController) state.searchController.abort();
    state.searchController = typeof AbortController === 'function' ? new AbortController() : null;
    state.busy = true;
    state.searchError = '';
    state.careerStatus = 'retrieving';
    state.careerClarification = null;
    resetCareerSelection();
    renderCareers();
    try {
      const expression = state.query.trim();
      if (!expression || expression.length > CAREER_QUERY_LIMIT) throw Object.assign(new Error(!expression ? '请输入职业目标或已有能力。' : '职业描述不能超过 1200 字。'), { code: 'input_invalid' });
      let result;
      try {
        result = await api('/api/agent/career/recommend', { method: 'POST', signal: state.searchController?.signal, headers: { 'X-Rolecraft-Agent-Request-Id': requestKey, 'X-Rolecraft-Agent-Version': CAREER_AGENT_VERSION }, body: { requestId: requestKey, query: expression, activeCareerId: state.me?.activeCareer?.careerId || null, locale: 'zh-CN', workbenchVersion: WORKBENCH_VERSION, agentVersion: CAREER_AGENT_VERSION } });
      } catch (error) {
        if (!routeUnavailable(error)) throw error;
        const legacy = await api('/api/careers?q=' + encodeURIComponent(expression), { signal: state.searchController?.signal, headers: { 'X-Rolecraft-Agent-Request-Id': requestKey, 'X-Rolecraft-Agent-Version': CAREER_AGENT_VERSION } });
        result = { ...legacy, requestId: legacy?.requestId || requestKey, status: Array.isArray(legacy?.careers) && legacy.careers.length ? 'recommended' : 'no_match' };
      }
      if (sequence !== state.searchSeq) return;
      if (result?.query != null && result.query !== expression) throw Error('职业推荐响应与本次输入不一致，请重试。');
      if (result?.requestId && result.requestId !== requestKey) throw Error('职业推荐响应与本次请求不一致，请重试。');
      const normalized = normalizeCareerResult(result, requestKey, expression);
      normalized.requestId = requestKey;
      state.careers = normalized.candidates;
      state.careerStatus = normalized.status;
      state.careerClarification = normalized.clarification;
      state.lastCareerResult = normalized;
    } catch (error) {
      if (isAbort(error) || sequence !== state.searchSeq) return;
      state.careers = [];
      state.careerStatus = error?.code === 'input_invalid' ? 'invalid_input' : 'unavailable';
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
      setSession(null, 'logout');
      notify('已退出当前账户。');
      return true;
    } catch (error) {
      notify(friendlyError(error));
      return false;
    }
  }

  function init() {
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
      if (event.target.closest('[data-rc-open-login]')) { state.mode = 'login'; loginDialog(); return; }
      if (event.target.closest('[data-rc-account]')) { accountMenu(); return; }
      if (event.target.closest('[data-rc-open-careers]')) { menu?.remove(); careerDialog(); return; }
      if (event.target.closest('[data-rc-retry-search]')) { searchCareers(); return; }
      if (event.target.closest('[data-rc-switch]')) { state.mode = state.mode === 'login' ? 'register' : 'login'; const dialog = loginDialog(); dialog.querySelector('#rc-email')?.focus(); return; }
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

  globalThis.RolecraftAuthCareer = {
    agentVersion: CAREER_AGENT_VERSION,
    getSession,
    api,
    refresh,
    subscribe,
    openCareers: careerDialog,
    openLogin: () => { state.mode = 'login'; return loginDialog(); },
    logout,
    state
  };
})();
