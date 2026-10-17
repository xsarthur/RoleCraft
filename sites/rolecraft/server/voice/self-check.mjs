import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { analyzeLocalFixture, analyzeVoiceRequest, probeLocalAsr, validateAudio } from './index.mjs';

const fakeWebm = Buffer.from([0x1a, 0x45, 0xdf, 0xa3, 0x00, 0x00, 0x00, 0x00]);
const fakeWav = Buffer.concat([Buffer.from('RIFF'), Buffer.alloc(4), Buffer.from('WAVE'), Buffer.alloc(4)]);

const readiness = probeLocalAsr({ checkCommand: () => false, env: {} });
assert.equal(readiness.available, false);
assert.equal(readiness.mode, 'unavailable');
assert.equal(readiness.providerCalled, false);

const noModel = probeLocalAsr({ checkCommand: () => true, env: { ROLECRAFT_LOCAL_ASR_COMMAND: 'whisper-cli' } });
assert.equal(noModel.commandAvailable, true);
assert.equal(noModel.modelConfigured, false);
assert.equal(noModel.modelAvailable, false);
assert.equal(noModel.available, false);

const unavailable = analyzeVoiceRequest({ audioBase64: fakeWebm.toString('base64'), mimeType: 'audio/webm', durationMs: 900 });
assert.equal(unavailable.status, 'unavailable');
assert.equal(unavailable.error.code, 'transcription_unavailable');
assert.equal(unavailable.provenance.providerCalled, false);
assert.equal(unavailable.provenance.asrMode, 'unavailable');

const invalid = analyzeVoiceRequest({ audioBase64: Buffer.from('not-audio').toString('base64'), mimeType: 'audio/webm' });
assert.equal(invalid.status, 'failed');
assert.equal(invalid.error.code, 'unsupported_audio_format');

const fixture = analyzeVoiceRequest({
  mode: 'local_fixture',
  transcript: '我先说明结论。这个方案通过固定流程降低失败风险，并用离线测试验证。',
  questionId: 'Q017', questionVersion: 'interview-v12', durationMs: 42000,
  rubric: [
    { id: 'mechanism', label: '机制', keywords: ['固定流程'] },
    { id: 'evidence', label: '验证证据', keywords: ['测试验证', '离线测试'] },
    { id: 'tradeoff', label: '取舍', keywords: ['取舍'] },
  ],
  sourceContext: { contentVersion: 'textbook-v12', indexVersion: 'content-retrieval-0.12-v12', sections: [{ unitId: 'c01', sectionId: 's1', title: '固定流程' }] },
});
assert.equal(fixture.status, 'completed');
assert.equal(fixture.provenance.analysisMode, 'local_rules');
assert.equal(fixture.provenance.providerCalled, false);
assert.equal(fixture.contentGrounding.bindingStatus, 'partial');
assert.ok(fixture.answerAnalysis.gaps.some(item => item.criterionId === 'tradeoff'));
assert.ok(fixture.answerAnalysis.coaching.length);
assert.equal(fixture.transcript.segments.length, 2);
const mismatch = analyzeVoiceRequest({
  mode: 'local_fixture', transcript: '我说明了方案。',
  sourceContext: { contentVersion: 'textbook-v11', indexVersion: 'wrong-index', sections: [{ unitId: 'c01', sectionId: 's1' }] },
});
assert.equal(mismatch.contentGrounding.bindingStatus, 'mismatch');

const tooLarge = validateAudio({ buffer: Buffer.alloc(12), durationMs: 100 }, { maxBytes: 4 });
assert.equal(tooLarge.code, 'audio_too_large');
const wav = validateAudio({ buffer: fakeWav, mimeType: 'audio/wav' });
assert.equal(wav.ok, true);
assert.equal(wav.format, 'wav');

// The optional whisper.cpp adapter may use a temporary WAV, but it must be
// private and always removed. Keep this as a source-level contract check so a
// test never invokes a real local binary or model.
const voiceSource = readFileSync(new URL('./index.mjs', import.meta.url), 'utf8');
assert.match(voiceSource, /writeFileSync\(input, audio\.buffer, \{ mode: 0o600 \}\)/);
assert.match(voiceSource, /chmodSync\(dir, 0o700\)/);
assert.match(voiceSource, /finally \{ try \{ rmSync\(dir, \{ recursive: true, force: true \}\)/);
assert.doesNotMatch(voiceSource, /localStorage|fetch\s*\(/);

console.log(JSON.stringify({ ok: true, checks: 12, asr: readiness, noModel, fixtureStatus: fixture.status, providerCalled: false, tempFileContract: '0700_dir_0600_file_then_finally_remove' }));

