import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  classifyMediaError,
  inspectRecordingEnvironment,
  readRecordingEnvironment,
  recordingSupportMessage,
} from './recording-support.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const dist = path.resolve(here, '../dist');
const app = readFileSync(path.join(dist, 'app.js'), 'utf8');
const experience = readFileSync(path.join(dist, 'learning-experience-v13.js'), 'utf8');
const index = readFileSync(path.join(dist, 'index.html'), 'utf8');

const typed = '你仍可以直接输入文字回答。';

function secureApis(extra = {}) {
  return {
    isSecureContext: true,
    hasGetUserMedia: true,
    hasMediaRecorder: true,
    protocol: 'https:',
    hostname: 'rolecraft.example',
    ...extra,
  };
}

test('plain HTTP hides the media APIs and is not reported as an unsupported browser', () => {
  const production = readRecordingEnvironment({
    isSecureContext: false,
    MediaRecorder: undefined,
    navigator: {},
    location: { protocol: 'http:', hostname: '111.231.8.78' },
  });
  const diagnosis = inspectRecordingEnvironment(production);
  assert.equal(production.isSecureContext, false);
  assert.equal(production.hasGetUserMedia, false);
  assert.equal(production.hasMediaRecorder, false);
  assert.equal(diagnosis.reason, 'insecure_context');
  assert.equal(diagnosis.canRecord, false);
  const message = recordingSupportMessage(diagnosis.reason);
  assert.match(message, /HTTPS/);
  assert.match(message, /HTTP/);
  assert.match(message, new RegExp(typed));
  assert.equal(message.includes('不支持音频录制'), false);
  assert.equal(message.includes('当前浏览器不支持录音'), false);
});

test('an insecure context wins even when the media constructors are still visible', () => {
  const diagnosis = inspectRecordingEnvironment(secureApis({
    isSecureContext: false,
    protocol: 'http:',
    hostname: '111.231.8.78',
  }));
  assert.equal(diagnosis.reason, 'insecure_context');
  assert.equal(classifyMediaError({ name: 'NotAllowedError' }, { isSecureContext: false }).reason, 'insecure_context');
  assert.equal(classifyMediaError({ name: 'SecurityError' }, { protocol: 'http:', hostname: '203.0.113.8' }).reason, 'insecure_context');
});

test('localhost and HTTPS stay eligible when both recording APIs exist', () => {
  assert.equal(inspectRecordingEnvironment(secureApis()).reason, 'ok');
  assert.equal(inspectRecordingEnvironment({
    isSecureContext: true,
    hasGetUserMedia: true,
    hasMediaRecorder: true,
    protocol: 'http:',
    hostname: 'localhost',
  }).canRecord, true);
  assert.equal(inspectRecordingEnvironment({
    protocol: 'http:',
    hostname: '127.0.0.1',
    hasGetUserMedia: true,
    hasMediaRecorder: true,
  }).reason, 'ok');
});

test('a secure browser missing one or both APIs gets a specific reason', () => {
  assert.equal(inspectRecordingEnvironment(secureApis({ hasMediaRecorder: false })).reason, 'missing_media_recorder');
  assert.equal(inspectRecordingEnvironment(secureApis({ hasGetUserMedia: false })).reason, 'missing_get_user_media');
  assert.equal(inspectRecordingEnvironment(secureApis({ hasGetUserMedia: false, hasMediaRecorder: false })).reason, 'unsupported');
  assert.match(recordingSupportMessage('missing_media_recorder'), /MediaRecorder/);
  assert.match(recordingSupportMessage('missing_media_recorder'), /Chrome/);
  assert.match(recordingSupportMessage('missing_media_recorder'), /14\.3/);
  assert.match(recordingSupportMessage('missing_get_user_media'), /getUserMedia/);
  assert.match(recordingSupportMessage('unsupported'), /Chrome/);
});

test('permission, dismissal, missing device, and busy device stay distinct from unsupported', () => {
  const secure = { isSecureContext: true, protocol: 'https:', hostname: 'rolecraft.example' };
  assert.equal(classifyMediaError({ name: 'NotAllowedError' }, secure).reason, 'permission_denied');
  assert.equal(classifyMediaError({ name: 'PermissionDeniedError' }, secure).reason, 'permission_denied');
  assert.equal(classifyMediaError({ name: 'AbortError' }, secure).reason, 'permission_dismissed');
  assert.equal(classifyMediaError({ name: 'NotFoundError' }, secure).reason, 'no_device');
  assert.equal(classifyMediaError({ name: 'DevicesNotFoundError' }, secure).reason, 'no_device');
  assert.equal(classifyMediaError({ name: 'OverconstrainedError' }, secure).reason, 'no_device');
  assert.equal(classifyMediaError({ name: 'NotReadableError' }, secure).reason, 'device_busy');
  assert.equal(classifyMediaError({ name: 'TrackStartError' }, secure).reason, 'device_busy');
  assert.equal(classifyMediaError({ name: 'SecurityError' }, secure).reason, 'security_blocked');
  assert.equal(classifyMediaError({ name: 'NotSupportedError' }, secure).reason, 'unsupported');
  assert.equal(classifyMediaError({ name: 'SomethingElse' }, secure).reason, 'unknown');
  assert.equal(classifyMediaError(null, secure).reason, 'unknown');

  for (const reason of ['permission_denied', 'permission_dismissed', 'no_device', 'device_busy', 'security_blocked', 'unknown', 'recorder_unavailable']) {
    const message = recordingSupportMessage(reason);
    assert.match(message, new RegExp(typed));
    assert.equal(message.includes('当前浏览器不支持音频录制'), false);
    assert.equal(message.includes('当前浏览器不能录音'), false);
  }
  assert.match(recordingSupportMessage('permission_denied'), /允许/);
  assert.match(recordingSupportMessage('permission_denied'), /拒绝|关掉/);
  assert.match(recordingSupportMessage('no_device'), /麦克风/);
});

test('diagnosis never throws on empty input', () => {
  assert.equal(inspectRecordingEnvironment().reason, 'unsupported');
  assert.equal(inspectRecordingEnvironment(null).reason, 'unsupported');
  assert.equal(classifyMediaError().reason, 'unknown');
  assert.equal(typeof recordingSupportMessage(), 'string');
  const empty = readRecordingEnvironment({});
  assert.equal(empty.isSecureContext, undefined);
  assert.equal(empty.hasMediaRecorder, false);
  assert.equal(empty.hasGetUserMedia, false);
  assert.equal(empty.protocol, '');
  assert.equal(empty.hostname, '');
});

test('interview prep and question practice share the diagnosis instead of the generic unsupported line', () => {
  assert.match(index, /recording-support\.js/);
  assert.match(app, /RolecraftRecordingSupport/);
  assert.match(app, /interviewVoiceDiagnoseEnvironment/);
  assert.match(app, /interviewVoiceDiagnoseError/);
  assert.match(app, /interviewVoiceStatusAllowsTyping/);
  assert.match(app, /id="interview-voice-transcript"/);
  assert.equal(app.includes('当前浏览器不支持音频录制'), false);
  assert.match(experience, /RolecraftRecordingSupport/);
  assert.match(experience, /practiceVoiceFailRecording/);
  assert.match(experience, /data-recording-reason/);
  assert.match(experience, /我的回答（可默答后直接核对）/);
  assert.equal(experience.includes('当前浏览器不能录音'), false);
  assert.equal(experience.includes('无法开始录音。请直接输入回答。'), false);
});
