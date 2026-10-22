// Cutover smoke for the formal textbook-v13 Agent corpus. Not an independent QA sign-off.
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { createRolecraftServer } from '../index.mjs';

const project = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const sha = value => createHash('sha256').update(value).digest('hex');
const index = JSON.parse(readFileSync(path.join(project, 'server/retrieval/content-v13-index.json'), 'utf8'));
const dir = mkdtempSync(path.join(os.tmpdir(), 'rolecraft-v13-cutover-'));
const app = createRolecraftServer({ dataDir: dir });
await new Promise(resolve => app.server.listen(0, '127.0.0.1', resolve));
const base = `http://127.0.0.1:${app.server.address().port}`;
async function get(route) {
  const response = await fetch(base + route);
  const type = response.headers.get('content-type') || '';
  const body = type.includes('json') ? await response.json() : Buffer.from(await response.arrayBuffer());
  return { status: response.status, body, type };
}
try {
  const health = await get('/api/health');
  assert.equal(health.status, 200);
  assert.equal(health.body.contentRetrieval.contentVersion, 'textbook-v13');
  assert.equal(health.body.contentRetrieval.textbookVersionId, 'agent-engineering-v13');
  assert.equal(health.body.contentRetrieval.indexVersion, 'content-retrieval-0.13-v13');
  assert.equal(health.body.contentRetrieval.corpusHash, index.corpusHash);
  assert.equal(health.body.contentRetrieval.bookSha256, index.bookSha256);
  assert.equal(health.body.contentRetrieval.units, 30);

  const catalog = await get('/api/content/catalog');
  assert.equal(catalog.status, 200);
  assert.equal(catalog.body.corpusVersion, 'textbook-v13');
  assert.equal(catalog.body.corpusHash, index.corpusHash);
  assert.equal(catalog.body.bookSha256, index.bookSha256);
  assert.equal(catalog.body.units.length, 30);

  const wrong = await get('/api/content/catalog?version=textbook-v11');
  assert.equal(wrong.status, 400);
  assert.equal(wrong.body.error.code, 'content_version_invalid');

  const rollback = await get('/api/content/catalog?version=textbook-v12');
  assert.equal(rollback.status, 200);
  assert.equal(rollback.body.corpusVersion, 'textbook-v12');
  assert.equal(rollback.body.units.length, 30);

  const chapter = await get('/api/content/chapter/00-learning-route');
  assert.equal(chapter.status, 200);
  assert.equal(chapter.body.unit.sourceSha256, index.units[0].sourceSha256);
  assert.equal(chapter.body.corpusVersion, 'textbook-v13');

  for (const name of ['agent-runtime-loop.png', 'agent-runtime-loop.svg', 'agent-engineering-landscape-v12.png', 'agent-engineering-landscape-v12.svg']) {
    const asset = index.assets.find(item => item.name === name);
    const response = await get(asset.href);
    assert.equal(response.status, 200, name);
    assert.equal(sha(response.body), asset.sha256, name);
  }

  const agent = await get('/api/careers/agent-developer/content/catalog');
  assert.equal(agent.status, 200);
  assert.equal(agent.body.career.contentVersion, 'textbook-v13');
  assert.equal(agent.body.catalog.corpusVersion, 'textbook-v13');
  assert.equal(agent.body.catalog.bookSha256, index.bookSha256);

  const uiux = await get('/api/careers/uiux-product-designer/content/catalog');
  assert.equal(uiux.status, 200);
  assert.equal(uiux.body.career.contentVersion, 'uiux-design-v02');
  assert.equal(uiux.body.catalog.corpusVersion, 'uiux-design-v02');
  assert.equal(JSON.stringify(uiux.body.catalog).includes('textbook-v13'), false);

  const page = await get('/index.html');
  const html = responseText(page.body);
  assert.equal(page.status, 200);
  assert.equal(html.includes('content-v13-data.js'), true);
  assert.equal(html.includes('v13-default-activation.js'), false);
  assert.equal(html.includes('教材 v13'), true);
  assert.equal(html.includes('content-v12-data.js'), false);

  const workbench = responseText((await get('/learning-workbench.js')).body);
  assert.equal(workbench.includes("const CURRENT = 'textbook-v13'"), true);
  assert.equal(workbench.includes("const CURRENT = 'textbook-v12'"), false);
  assert.equal(workbench.includes('RolecraftContentV13'), true);

  const sandbox = { URLSearchParams, console, location: { hash: '#home', href: base + '/#home', protocol: 'http:' }, localStorage: { getItem: () => null, setItem() {} }, document: { addEventListener() {}, getElementById: () => null, body: { classList: { add() {} }, dataset: {} }, documentElement: { style: { setProperty() {} } }, querySelector: () => null, querySelectorAll: () => [] } };
  vm.createContext(sandbox);
  for (const file of ['content-v13-data.js', 'learning-v13-data.js', 'learning-experience-v13.js']) {
    vm.runInContext(readFileSync(path.join(project, 'dist', file), 'utf8'), sandbox, { filename: file });
  }
  assert.equal(sandbox.RolecraftContentV13.corpusVersion, 'textbook-v13');
  assert.equal(sandbox.RolecraftLearningV13.corpusHash, sandbox.RolecraftContentV13.corpusHash);
  assert.equal(sandbox.LearningExperienceV13.data().questions.length, 114);
  assert.equal(sandbox.LearningExperienceV13.dataFailure(), null);

  let recommend = null;
  if (health.body.contentRetrieval.localSemanticPrepared && health.body.contentRetrieval.runtimeSupported) {
    const response = await fetch(base + '/api/content/recommend', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ query: 'react' }) });
    recommend = await response.json();
    assert.equal(response.status, 200);
    assert.equal(recommend.corpusVersion, 'textbook-v13');
    assert.notEqual(recommend.status, 'unavailable');
  }

  console.log(JSON.stringify({
    smoke: 'passed',
    contentVersion: health.body.contentRetrieval.contentVersion,
    corpusHash: index.corpusHash,
    bookSha256: index.bookSha256,
    units: 30,
    localSemanticPrepared: health.body.contentRetrieval.localSemanticPrepared,
    runtimeSupported: health.body.contentRetrieval.runtimeSupported,
    node: process.version,
    recommend: recommend ? { status: recommend.status, top: recommend.results?.[0]?.unitId || null } : 'skipped_until_vectors_and_node_24',
  }));
} finally {
  await app.close();
  rmSync(dir, { recursive: true, force: true });
}

function responseText(body) { return Buffer.isBuffer(body) ? body.toString('utf8') : String(body); }
