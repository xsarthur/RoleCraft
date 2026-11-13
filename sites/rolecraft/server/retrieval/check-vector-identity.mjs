// Cheap published-corpus gate. Compares textbook identity with vectors-*.json.
// Does not import the ONNX runtime or @huggingface/transformers and does not rebuild vectors.
// `node check-vector-identity.mjs --prove-mismatch` checks the aligned tree, then a
// temporary corpusHash mismatch, and restores vectors-v13.json before exiting.
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { getContentReadiness } from './index.mjs';
import { assessVectorIdentity, passageVectorMismatches } from './semantic.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const scriptPath = fileURLToPath(import.meta.url);
const sha256 = value => createHash('sha256').update(value).digest('hex');
const DEFAULT_VERSIONS = ['textbook-v13', 'textbook-v12'];

function runGate(versions) {
  let ok = true;
  for (const version of versions) {
    const readiness = getContentReadiness(version);
    const passed = readiness.available === true && readiness.localSemanticPrepared === true;
    const line = JSON.stringify({
      ok: passed,
      version,
      available: readiness.available === true,
      localSemanticPrepared: readiness.localSemanticPrepared === true,
      corpusHash: readiness.corpusHash || null,
      semanticIdentity: readiness.semanticIdentity || null,
    });
    if (passed) console.log(line);
    else {
      console.error(line);
      ok = false;
    }
  }
  return ok;
}

function spawnGate(versions) {
  return spawnSync(process.execPath, [scriptPath, ...versions], { encoding: 'utf8' });
}

function comparatorProof() {
  const chunks = [{ key: 'u/s', text: 'probe' }];
  const corpus = { corpusVersion: 'textbook-v13', corpusHash: 'aa'.repeat(32) };
  const modelHash = 'bb'.repeat(32);
  const chunkHash = 'cc'.repeat(32);
  const matched = {
    corpusVersion: corpus.corpusVersion,
    corpusHash: corpus.corpusHash,
    modelHash,
    chunkHash,
    items: [{ key: 'u/s', vector: Array(512).fill(0.25) }],
  };
  assert.deepEqual(passageVectorMismatches(matched, corpus, chunks, chunkHash, modelHash), []);
  assert.ok(passageVectorMismatches({ ...matched, modelHash: 'dd'.repeat(32) }, corpus, chunks, chunkHash, modelHash).includes('modelHash'));
  assert.ok(passageVectorMismatches({ ...matched, chunkHash: 'ee'.repeat(32) }, corpus, chunks, chunkHash, modelHash).includes('chunkHash'));
  assert.ok(passageVectorMismatches({ ...matched, corpusHash: 'ff'.repeat(32) }, corpus, chunks, chunkHash, modelHash).includes('corpusHash'));
  assert.ok(passageVectorMismatches({ ...matched, items: [{ key: 'other', vector: Array(512).fill(0.25) }] }, corpus, chunks, chunkHash, modelHash).includes('items'));
}

function chunkProof() {
  const corpus = JSON.parse(readFileSync(path.join(here, 'content-v13-index.json'), 'utf8'));
  // Keep this title filter aligned with passages() in semantic.mjs.
  const skipped = /下一步|来源与版本|审校|本轮|历史验证|原版验证|原文验证|代码运行说明/;
  const section = corpus.units.flatMap(unit => unit.sections).find(item => (item.searchText || '').length >= 35 && !skipped.test(item.title || ''));
  assert.ok(section, 'textbook-v13 has no chunkable section');
  section.searchText += '\n向量身份门禁探针';
  const identity = assessVectorIdentity(corpus);
  assert.equal(identity.prepared, false);
  assert.ok(identity.mismatches.includes('chunkHash'));
}

async function healthSemanticPrepared() {
  const { createRolecraftServer } = await import('../index.mjs');
  const dir = mkdtempSync(path.join(os.tmpdir(), 'rolecraft-vector-gate-'));
  const app = createRolecraftServer({ dataDir: dir });
  try {
    await new Promise(resolve => app.server.listen(0, '127.0.0.1', resolve));
    const { port } = app.server.address();
    const response = await fetch(`http://127.0.0.1:${port}/api/health`);
    const body = await response.json();
    assert.equal(response.status, 200);
    return body.contentRetrieval;
  } finally {
    await app.close();
    rmSync(dir, { recursive: true, force: true });
  }
}

async function proveMismatch() {
  const vectorPath = path.join(here, 'vectors-v13.json');
  const original = readFileSync(vectorPath);
  const digest = sha256(original);
  const aligned = spawnGate(DEFAULT_VERSIONS);
  assert.equal(aligned.status, 0, aligned.stderr || aligned.stdout);
  comparatorProof();
  chunkProof();
  try {
    const mutated = JSON.parse(original.toString('utf8'));
    mutated.corpusHash = '0'.repeat(64);
    writeFileSync(vectorPath, JSON.stringify(mutated));
    const blocked = spawnGate(['textbook-v13']);
    assert.equal(blocked.status, 1, blocked.stdout || blocked.stderr);
    assert.match(`${blocked.stdout}\n${blocked.stderr}`, /corpusHash/);
    const readiness = getContentReadiness('textbook-v13');
    assert.equal(readiness.available, true);
    assert.equal(readiness.localSemanticPrepared, false);
    assert.equal(readiness.semanticIdentity.prepared, false);
    assert.ok(readiness.semanticIdentity.mismatches.includes('corpusHash'));
    const health = await healthSemanticPrepared();
    assert.equal(health.available, true);
    assert.equal(health.localSemanticPrepared, false);
    assert.ok(health.semanticIdentity.mismatches.includes('corpusHash'));
    console.log(JSON.stringify({
      prove: 'corpusHash mismatch failed closed',
      gateStatus: blocked.status,
      available: readiness.available,
      localSemanticPrepared: readiness.localSemanticPrepared,
      healthLocalSemanticPrepared: health.localSemanticPrepared,
      mismatches: readiness.semanticIdentity.mismatches,
    }));
  } finally {
    writeFileSync(vectorPath, original);
  }
  assert.equal(sha256(readFileSync(vectorPath)), digest, 'vectors-v13.json was not restored');
  const restored = spawnGate(['textbook-v13']);
  assert.equal(restored.status, 0, restored.stderr || restored.stdout);
  const ready = getContentReadiness('textbook-v13');
  assert.equal(ready.available, true);
  assert.equal(ready.localSemanticPrepared, true);
  const restoredHealth = await healthSemanticPrepared();
  assert.equal(restoredHealth.localSemanticPrepared, true);
  console.log(JSON.stringify({ prove: 'restored corpus still passes', corpusHash: ready.corpusHash, localSemanticPrepared: true, healthLocalSemanticPrepared: restoredHealth.localSemanticPrepared, vectorSha256: digest }));
}

const prove = process.argv.includes('--prove-mismatch');
const requested = process.argv.slice(2).filter(argument => argument !== '--prove-mismatch');
if (prove) {
  try {
    await proveMismatch();
  } catch (error) {
    console.error(error?.stack || String(error));
    process.exitCode = 1;
  }
} else {
  const versions = requested.length ? requested : DEFAULT_VERSIONS;
  process.exitCode = runGate(versions) ? 0 : 1;
}
