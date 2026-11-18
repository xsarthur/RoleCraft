/* Shared recording-support diagnosis for interview prep and question-bank voice.
   getUserMedia and MediaRecorder are secure-context APIs. On plain HTTP they are
   missing, which is not the same thing as an unsupported browser. */
(function (root) {
  'use strict';

  function isLocalHostname(hostname) {
    const host = String(hostname || '').trim().toLowerCase().replace(/^\[|\]$/g, '');
    return host === 'localhost' || host === '127.0.0.1' || host === '::1';
  }

  function contextIsInsecure(env) {
    if (!env || typeof env !== 'object') return false;
    if (env.isSecureContext === true) return false;
    if (env.isSecureContext === false) return true;
    const protocol = String(env.protocol || '').toLowerCase();
    if (protocol === 'https:') return false;
    if ((protocol === 'http:' || protocol === 'ws:') && isLocalHostname(env.hostname)) return false;
    if (protocol === 'http:' || protocol === 'file:') return true;
    return false;
  }

  function hasGetUserMedia(env) {
    return env.hasGetUserMedia === true || typeof env.getUserMedia === 'function';
  }

  function inspectRecordingEnvironment(env) {
    const snapshot = env && typeof env === 'object' ? env : {};
    if (contextIsInsecure(snapshot)) return { reason: 'insecure_context', canRecord: false };
    const gum = hasGetUserMedia(snapshot);
    const recorder = snapshot.hasMediaRecorder === true;
    if (!gum && !recorder) return { reason: 'unsupported', canRecord: false };
    if (!gum) return { reason: 'missing_get_user_media', canRecord: false };
    if (!recorder) return { reason: 'missing_media_recorder', canRecord: false };
    return { reason: 'ok', canRecord: true };
  }

  function classifyMediaError(error, env) {
    try {
      if (contextIsInsecure(env || {})) return { reason: 'insecure_context', canRecord: false };
      const name = error && typeof error === 'object' ? String(error.name || '') : '';
      const reason = {
        NotAllowedError: 'permission_denied',
        PermissionDeniedError: 'permission_denied',
        AbortError: 'permission_dismissed',
        NotFoundError: 'no_device',
        DevicesNotFoundError: 'no_device',
        OverconstrainedError: 'no_device',
        NotReadableError: 'device_busy',
        TrackStartError: 'device_busy',
        SecurityError: 'security_blocked',
        NotSupportedError: 'unsupported',
      }[name] || 'unknown';
      return { reason, canRecord: false };
    } catch {
      return { reason: 'unknown', canRecord: false };
    }
  }

  function recordingSupportMessage(reason) {
    const typed = '你仍可以直接输入文字回答。';
    const messages = {
      insecure_context: '当前页面是通过普通 HTTP 打开的，不是安全连接（HTTPS）。浏览器因此不会开放麦克风，并不是这台浏览器完全不能录音。请改用 https:// 重新打开本站后再试；本机调试可以用 localhost。' + typed,
      permission_denied: '没有拿到麦克风权限：可能是选择了拒绝，也可能是关掉了权限提示。请再次点击「开始录音」或「语音回答」，并在弹出的提示里选择允许。如果不再弹出提示，请点击地址栏左侧的锁或设置图标，把麦克风改为允许。iPhone 或 iPad 还可以到「设置 → Safari → 麦克风」允许本网站。' + typed,
      permission_dismissed: '麦克风权限请求被中断或已关闭。请再次点击「开始录音」或「语音回答」，看到提示时选择允许。' + typed,
      no_device: '没有检测到可用的麦克风。请连接麦克风，或在系统声音设置里启用输入设备后再试。' + typed,
      missing_media_recorder: '当前浏览器缺少录音接口 MediaRecorder，无法保存语音。请改用 Chrome，或把 Safari 更新到 14.1 / iOS 14.3 及以上。' + typed,
      missing_get_user_media: '当前浏览器缺少麦克风接口 getUserMedia，无法开始录音。请改用 Chrome，或其他更新后的 Safari、Edge、Firefox。' + typed,
      unsupported: '当前浏览器不支持录音。请改用 Chrome，或更新到较新的 Safari、Edge、Firefox。' + typed,
      recorder_unavailable: '浏览器没能创建录音器。请改用 Chrome，或更新 Safari 后再试。' + typed,
      device_busy: '麦克风正被占用，或系统暂时打不开它。请关掉正在使用麦克风的其他程序后再试。' + typed,
      security_blocked: '浏览器的安全策略阻止了麦克风。请在新窗口直接打开本站（不要放在禁止录音的内嵌页面里），并在网站设置中允许麦克风。' + typed,
      unknown: '这次没能开始录音。请改用 Chrome，确认页面是 HTTPS，并允许麦克风后再试。' + typed,
    };
    return messages[reason] || messages.unknown;
  }

  function readRecordingEnvironment(target) {
    const scope = target || root;
    let nav = null;
    let loc = null;
    try { nav = scope && scope.navigator ? scope.navigator : null; } catch { nav = null; }
    try { loc = scope && scope.location ? scope.location : null; } catch { loc = null; }
    const media = nav && nav.mediaDevices ? nav.mediaDevices : null;
    let secure;
    try {
      if (scope && scope.isSecureContext === true) secure = true;
      else if (scope && scope.isSecureContext === false) secure = false;
    } catch { secure = undefined; }
    let hasRecorder = false;
    try { hasRecorder = typeof scope.MediaRecorder === 'function'; } catch { hasRecorder = false; }
    return {
      isSecureContext: secure,
      hasMediaRecorder: hasRecorder,
      hasGetUserMedia: !!(media && typeof media.getUserMedia === 'function'),
      protocol: loc && typeof loc.protocol === 'string' ? loc.protocol : '',
      hostname: loc && typeof loc.hostname === 'string' ? loc.hostname : '',
    };
  }

  root.RolecraftRecordingSupport = {
    inspectRecordingEnvironment,
    classifyMediaError,
    recordingSupportMessage,
    readRecordingEnvironment,
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
