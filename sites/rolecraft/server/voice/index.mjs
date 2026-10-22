import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { chmodSync, existsSync, mkdtempSync, writeFileSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

/**
 * Local voice analysis boundary.
 *
 * This module deliberately does not download a speech model and does not call a
 * provider. The current checkout contains a text embedding model only; it is
 * not an ASR model. An explicit local fixture (a user-confirmed transcript)
 * can exercise the rest of the feedback flow with deterministic rules. Audio
 * submitted without an installed ASR runtime returns `unavailable`.
 */

export const VOICE_ANALYSIS_VERSION = 'voice-interview-analysis-v1';
export const VOICE_RUBRIC_VERSION = 'interview-rubric-v1';
export const DEFAULT_AUDIO_LIMIT_BYTES = 25 * 1024 * 1024;
export const DEFAULT_DURATION_LIMIT_MS = 3 * 60 * 1000;

const ASR_CANDIDATES = Object.freeze([
  { command: 'whisper-cli', label: 'whisper.cpp CLI' },
  { command: 'whisper', label: 'OpenAI Whisper CLI' },
  { command: 'whisper.cpp', label: 'whisper.cpp' },
]);

const FILLER_PATTERNS = Object.freeze([
  ['嗯', /嗯+/g], ['呃', /呃+/g], ['那个', /那个/g], ['就是', /就是/g],
  ['然后', /然后/g], ['其实', /其实/g], ['like', /\blike\b/gi], ['um', /\bum\b/gi],
]);

const sha256 = value => createHash('sha256').update(value).digest('hex');

function commandAvailable(command) {
  try {
    // `which` receives an argv item, never shell source. This probe is only
    // discovery; the module does not execute an ASR command.
    const result = spawnSync('which', [command], {
      stdio: ['ignore', 'pipe', 'ignore'], encoding: 'utf8', timeout: 1000,
    });
    return result.status === 0 && Boolean(String(result.stdout || '').trim());
  } catch { return false; }
}

/** Probe only local binaries. No package install and no network access occur. */
export function probeLocalAsr({ env = process.env, checkCommand = commandAvailable } = {}) {
  const configured = String(env.ROLECRAFT_LOCAL_ASR_COMMAND || '').trim();
  const candidates = configured
    ? [{ command: configured, label: 'configured local ASR command' }]
    : ASR_CANDIDATES;
  const checked = candidates.map(candidate => ({
    ...candidate,
    found: (() => { try { return Boolean(checkCommand(candidate.command)); } catch { return false; } })(),
  }));
  const selected = checked.find(item => item.found) || null;
  const model = env.ROLECRAFT_LOCAL_ASR_MODEL ? String(env.ROLECRAFT_LOCAL_ASR_MODEL) : '';
  const ffmpegCommand = String(env.ROLECRAFT_FFMPEG_COMMAND || 'ffmpeg');
  const ffmpegAvailable = Boolean(checkCommand(ffmpegCommand));
  let modelAvailable = false;
  try { modelAvailable = Boolean(model && existsSync(model) && statSync(model).isFile()); } catch { modelAvailable = false; }
  return {
    available: Boolean(selected && modelAvailable),
    ffmpegAvailable,
    commandAvailable: Boolean(selected),
    modelConfigured: Boolean(model),
    modelAvailable,
    mode: selected && modelAvailable ? 'local' : 'unavailable',
    ffmpegCommand,
    command: selected?.command || null,
    model: model || null,
    checked,
    providerCalled: false,
    remoteModelsAllowed: false,
    limitations: selected && modelAvailable
      ? ['仅在输入为 WAV 时执行 whisper.cpp；其他格式需先转换。音频仅短暂写入本机隔离临时目录，完成后清理。']
      : [selected ? '已发现本地 ASR 命令，但没有发现 ROLECRAFT_LOCAL_ASR_MODEL 指向的模型文件。' : '当前环境没有发现可离线运行的 ASR 命令；不会把 BGE 文本向量模型当作语音识别模型。'],
  };
}

function runWhisperCpp({ audio, readiness, env = process.env }) {
  if (!readiness?.available || !readiness.model) return null;
  if (audio.format !== 'wav' && !readiness.ffmpegAvailable) return { error: '本机未安装 ffmpeg，无法将浏览器音频转换为 WAV。', command: readiness.command };
  const dir = mkdtempSync(path.join(tmpdir(), 'rolecraft-whisper-'));
  const input = path.join(dir, `audio.${audio.format}`);
  const wav = path.join(dir, 'audio.wav');
  try {
    chmodSync(dir, 0o700);
    writeFileSync(input, audio.buffer, { mode: 0o600 });
    if (audio.format !== 'wav') {
      const converted = spawnSync(readiness.ffmpegCommand || 'ffmpeg', ['-y', '-i', input, '-ar', '16000', '-ac', '1', '-c:a', 'pcm_s16le', wav], { encoding: 'utf8', timeout: 30000, maxBuffer: 512 * 1024 });
      if (converted.error || converted.status !== 0 || !existsSync(wav)) return { error: String(converted.error?.message || converted.stderr || 'ffmpeg 音频转换失败。'), command: readiness.command };
    }
    const args = ['-m', readiness.model, '-f', audio.format === 'wav' ? input : wav, '-l', 'zh', '--no-timestamps', '--print-progress', 'false'];
    const result = spawnSync(readiness.command, args, { encoding: 'utf8', timeout: Number(env.ROLECRAFT_LOCAL_ASR_TIMEOUT_MS) || 120000, maxBuffer: 2 * 1024 * 1024 });
    if (result.error || result.status !== 0) return { error: String(result.error?.message || result.stderr || `whisper.cpp exited ${result.status}`), command: readiness.command };
    const text = String(result.stdout || '').replace(/\u001b\[[0-?]*[ -/]*[@-~]/g, '').trim();
    return text ? { text, command: readiness.command, model: readiness.model } : { error: 'whisper.cpp 返回空转写。', command: readiness.command };
  } finally { try { rmSync(dir, { recursive: true, force: true }); } catch {} }
}

function asBuffer(value) {
  if (Buffer.isBuffer(value)) return value;
  if (value instanceof Uint8Array) return Buffer.from(value);
  if (typeof value === 'string' && value) {
    try { return Buffer.from(value, 'base64'); } catch { return null; }
  }
  return null;
}

function detectAudioFormat(buffer) {
  if (!buffer || buffer.length < 4) return null;
  if (buffer.subarray(0, 4).equals(Buffer.from([0x1a, 0x45, 0xdf, 0xa3]))) return 'webm';
  if (buffer.subarray(0, 4).toString('ascii') === 'OggS') return 'ogg';
  if (buffer.subarray(0, 4).toString('ascii') === 'RIFF' && buffer.subarray(8, 12).toString('ascii') === 'WAVE') return 'wav';
  if (buffer.subarray(4, 8).toString('ascii') === 'ftyp') return 'mp4';
  return null;
}

export function validateAudio(input, {
  maxBytes = DEFAULT_AUDIO_LIMIT_BYTES,
  maxDurationMs = DEFAULT_DURATION_LIMIT_MS,
} = {}) {
  const buffer = asBuffer(input?.buffer ?? input?.audioBase64 ?? input);
  if (!buffer || !buffer.length) return { ok: false, code: 'invalid_input', message: '未提供非空音频。' };
  if (buffer.length > maxBytes) return { ok: false, code: 'audio_too_large', message: `音频不能超过 ${Math.round(maxBytes / 1048576)} MB。` };
  const format = detectAudioFormat(buffer);
  if (!format) return { ok: false, code: 'unsupported_audio_format', message: '无法根据文件头识别 WebM、Ogg、WAV 或 MP4 音频。' };
  const durationMs = Number(input?.durationMs);
  if (Number.isFinite(durationMs) && durationMs > maxDurationMs) {
    return { ok: false, code: 'duration_exceeded', message: `单段录音不能超过 ${Math.round(maxDurationMs / 60000)} 分钟。` };
  }
  return {
    ok: true,
    buffer,
    format,
    mimeType: typeof input?.mimeType === 'string' ? input.mimeType.slice(0, 120) : null,
    sizeBytes: buffer.length,
    sha256: sha256(buffer),
    durationMs: Number.isFinite(durationMs) && durationMs >= 0 ? durationMs : null,
  };
}

function countWords(text) {
  const cjk = (text.match(/[\u3400-\u9fff]/g) || []).length;
  const latin = (text.match(/[A-Za-z0-9]+(?:'[A-Za-z0-9]+)?/g) || []).length;
  return cjk + latin;
}

function transcriptSegments(text) {
  const pieces = String(text).split(/(?<=[。！？!?；;])\s*|\n+/).map(v => v.trim()).filter(Boolean);
  let cursor = 0;
  return pieces.map((piece, i) => {
    const start = cursor; cursor += piece.length;
    return { id: `seg-${i + 1}`, startMs: null, endMs: null, text: piece, confidence: null, _start: start };
  });
}

function criterionList(rubric) {
  if (!Array.isArray(rubric)) return [];
  return rubric.slice(0, 12).filter(item => item && typeof item === 'object').map((item, i) => ({
    id: String(item.id || `criterion-${i + 1}`).slice(0, 80),
    label: String(item.label || item.name || `回答要点 ${i + 1}`).slice(0, 160),
    keywords: Array.isArray(item.keywords) ? item.keywords.map(k => String(k).trim()).filter(Boolean).slice(0, 20) : [],
  }));
}

function grounding(sourceContext) {
  if (!sourceContext || typeof sourceContext !== 'object') {
    return { bindingStatus: 'none', contentVersion: null, indexVersion: null, corpusHash: null, sections: [] };
  }
  // Voice analysis cannot verify a caller-provided source against the corpus.
  // Keep the reference visible for the integration layer, but do not claim it
  // is bound until the retrieval service has independently validated it.
  const requestedContentVersion = sourceContext.contentVersion ? String(sourceContext.contentVersion).slice(0, 128) : null;
  const requestedIndexVersion = sourceContext.indexVersion ? String(sourceContext.indexVersion).slice(0, 160) : null;
  const versionMismatch = (requestedContentVersion && !['textbook-v13','textbook-v12'].includes(requestedContentVersion))
    || (requestedIndexVersion && !requestedIndexVersion.startsWith('content-retrieval-'));
  const sections = Array.isArray(sourceContext.sections) ? sourceContext.sections.slice(0, 6).map((s, i) => ({
    unitId: String(s?.unitId || '').slice(0, 128), sectionId: String(s?.sectionId || '').slice(0, 128),
    title: String(s?.title || '').slice(0, 240), href: String(s?.href || '').slice(0, 500), excerptHash: String(s?.excerptHash || '').slice(0, 128),
  })).filter(s => s.unitId && s.sectionId) : [];
  return {
    bindingStatus: versionMismatch ? 'mismatch' : sections.length ? 'partial' : 'none',
    contentVersion: requestedContentVersion,
    indexVersion: requestedIndexVersion,
    corpusHash: sourceContext.corpusHash ? String(sourceContext.corpusHash).slice(0, 128) : null,
    sections,
  };
}

function unavailableResult({ audio = null, sourceContext = null, questionId = null, questionVersion = null, reason = 'transcription_unavailable' } = {}) {
  return {
    status: 'unavailable',
    error: { code: reason, message: '本机没有可用的离线语音识别运行时；请先校对文字转写或改用文字回答。' },
    transcript: { text: '', language: 'zh-CN', overallConfidence: null, segments: [] },
    delivery: { durationMs: audio?.durationMs ?? null, wordCount: 0, wordsPerMinute: null, pauseCount: null, longestPauseMs: null, fillerWords: [], measurement: 'unavailable' },
    answerAnalysis: null,
    contentGrounding: grounding(sourceContext),
    uncertainty: [{ code: 'transcription_unavailable', reason: '没有可离线运行的 ASR 模型/命令。', impact: '无法从音频推断答案内容；不产生知识评分。' }],
    provenance: { asrMode: 'unavailable', analysisMode: 'unavailable', model: null, providerCalled: false, estimatedCostUsd: null, actualCostUsd: null, audioSha256: audio?.sha256 || null, questionId, questionVersion, voiceAnalysisVersion: VOICE_ANALYSIS_VERSION },
    limitations: ['此结果不代表答案质量、职业能力或录用概率。', '本地模式未上传音频，也未调用供应商。'],
  };
}

export function analyzeLocalFixture({
  transcript,
  questionId = null,
  questionVersion = 'interview-v12',
  language = 'zh-CN',
  rubric = [],
  durationMs = null,
  sourceContext = null,
  audioSha256 = null,
} = {}) {
  const text = typeof transcript === 'string' ? transcript.trim().slice(0, 20000) : '';
  if (!text) return unavailableResult({ questionId, questionVersion, sourceContext, reason: 'transcription_partial' });
  const segments = transcriptSegments(text);
  const criteria = criterionList(rubric);
  const lower = text.toLocaleLowerCase();
  const strengths = [];
  const gaps = [];
  for (const criterion of criteria) {
    const hits = criterion.keywords.filter(keyword => lower.includes(keyword.toLocaleLowerCase()));
    if (hits.length) {
      strengths.push({ text: `提到了“${criterion.label}”相关内容（关键词：${hits.slice(0, 3).join('、')}）。`, evidenceSegmentIds: segments.filter(s => criterion.keywords.some(k => s.text.toLocaleLowerCase().includes(k.toLocaleLowerCase()))).map(s => s.id).slice(0, 3) });
    } else {
      gaps.push({ criterionId: criterion.id, text: `尚未在转写中找到“${criterion.label}”的可核对证据。`, evidenceSegmentIds: [], missingEvidence: [`请补充${criterion.label}的具体事实、取舍或验证方式。`] });
    }
  }
  if (segments.length >= 2) strengths.push({ text: '回答包含多个可分辨的表达片段，便于继续按量规复盘。', evidenceSegmentIds: segments.slice(0, 2).map(s => s.id) });
  const fillers = FILLER_PATTERNS.flatMap(([label, pattern]) => {
    const count = (text.match(pattern) || []).length;
    return count ? [{ word: label, count }] : [];
  });
  const wordCount = countWords(text);
  const safeDuration = Number.isFinite(Number(durationMs)) && Number(durationMs) > 0 ? Number(durationMs) : null;
  const delivery = {
    durationMs: safeDuration,
    wordCount,
    wordsPerMinute: safeDuration ? Math.round(wordCount / (safeDuration / 60000)) : null,
    pauseCount: null,
    longestPauseMs: null,
    fillerWords: fillers,
    measurement: safeDuration ? 'local_measured_with_fixture_transcript' : 'estimated',
  };
  const coaching = [];
  if (gaps.length) coaching.push({ priority: 'high', action: '按题目量规逐项补充缺失证据，下一次回答时先说结论，再给事实和验证方式。' });
  if (fillers.length) coaching.push({ priority: 'medium', action: `重答时减少口头填充词（${fillers.map(f => f.word).join('、')}），在段落之间短暂停顿。` });
  if (!coaching.length) coaching.push({ priority: 'medium', action: '重答时保留现有事实，并补充一个可核验的结果或边界。' });
  const followUps = gaps.slice(0, 2).map(g => `你能用一个真实例子说明${g.missingEvidence[0].replace(/^请补充/, '').replace(/。$/, '')}吗？`);
  const g = grounding(sourceContext);
  const limitations = [
    '这是用户确认的本地转写 fixture + 固定规则反馈，不是 ASR 或生成模型结论。',
    '规则只检查关键词和可观察文本证据，不判断声音、口音、人格或录用概率。',
  ];
  if (g.bindingStatus !== 'none') limitations.push('教材引用尚未由本模块独立核验，需由内容检索服务复核后才能标记 bound。');
  return {
    status: 'completed',
    transcript: { text, language, overallConfidence: null, segments: segments.map(({ _start, ...s }) => s) },
    delivery,
    answerAnalysis: {
      summary: `本次转写包含 ${wordCount} 个可统计字词，规则识别到 ${strengths.length} 项已有证据和 ${gaps.length} 项待补证据。`,
      strengths,
      gaps,
      technicalRisks: gaps.length ? [{ text: '当前转写没有覆盖全部量规条件；这只是证据缺口提示，不是技术错误判定。', basis: 'rubric' }] : [],
      coaching,
      followUpQuestions: followUps,
      retryPrompt: gaps.length ? '请按“结论 → 事实/取舍 → 验证结果 → 边界”补齐缺失证据后重答。' : '请保留现有结构，再补充一个具体结果和一个失败边界。',
    },
    contentGrounding: g,
    uncertainty: [{ code: 'fixture_transcript', reason: '转写来自用户确认的文本 fixture，不含语音识别置信度。', impact: '不能把规则反馈解释为音频内容的完整识别。' }],
    provenance: { asrMode: 'provided_transcript', analysisMode: 'local_rules', model: 'deterministic-rules-v1', providerCalled: false, estimatedCostUsd: null, actualCostUsd: null, audioSha256, questionId, questionVersion, rubricVersion: VOICE_RUBRIC_VERSION, voiceAnalysisVersion: VOICE_ANALYSIS_VERSION },
    limitations,
  };
}

/**
 * Entrypoint used by the future HTTP adapter. `mode: local_fixture` is
 * explicit so an arbitrary client transcript cannot silently masquerade as
 * an ASR result. Audio is never persisted by this module.
 */
export function analyzeVoiceRequest(input = {}, options = {}) {
  const mode = String(input.mode || input.analysisMode || 'local').trim();
  if (mode === 'local_fixture' || input.fixture === true) {
    return analyzeLocalFixture(input);
  }
  const audio = validateAudio(input, options);
  if (!audio.ok) return { status: 'failed', error: { code: audio.code, message: audio.message }, provenance: { asrMode: 'unavailable', analysisMode: 'unavailable', providerCalled: false, voiceAnalysisVersion: VOICE_ANALYSIS_VERSION } };
  const readiness = probeLocalAsr(options);
  if (!readiness.available || !readiness.model) return unavailableResult({ audio, sourceContext: input.sourceContext, questionId: input.questionId, questionVersion: input.questionVersion });
  const decoded = runWhisperCpp({ audio, readiness, env: options.env || process.env });
  if (!decoded?.text) return { ...unavailableResult({ audio, sourceContext: input.sourceContext, questionId: input.questionId, questionVersion: input.questionVersion, reason: 'transcription_failed' }), error: { code: 'transcription_failed', message: decoded?.error || 'whisper.cpp 未返回转写。' }, provenance: { ...unavailableResult({ audio }).provenance, asrMode: 'whisper.cpp', model: readiness.model, command: readiness.command } };
  const fixture = analyzeLocalFixture({ ...input, transcript: decoded.text, audioSha256: audio.sha256, durationMs: audio.durationMs });
  return { ...fixture, provenance: { ...fixture.provenance, asrMode: 'whisper.cpp', analysisMode: 'local_rules', model: readiness.model, command: readiness.command, providerCalled: false }, uncertainty: [{ code: 'local_asr', reason: '由本机 whisper.cpp 离线模型转写；未调用外部供应商。', impact: '中文识别质量取决于本地模型版本、音质和口音。' }], limitations: [...fixture.limitations, '语音转写由本机 whisper.cpp 完成；仅 WAV 输入进入当前适配器。'] };
}

export const _internal = Object.freeze({ detectAudioFormat, countWords, transcriptSegments, FILLER_PATTERNS });

