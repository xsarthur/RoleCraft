// Isolated loopback checks for UIUX catalog integrity, antifabrication, and practice copy.
import { mkdtempSync, readdirSync, rmSync, readFileSync } from 'node:fs';
import vm from 'node:vm';
import { createHash } from 'node:crypto';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { createRolecraftServer } from './index.mjs';

const project = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sha256 = value => createHash('sha256').update(value).digest('hex');
const dir = mkdtempSync(path.join(os.tmpdir(), 'rolecraft-uiux-ac-'));
const app = createRolecraftServer({ dataDir: dir });
const knownCurrent = {
  '05-domain-information-architecture': 'bcf32939fbcf386d8c10be36f7dbf387769368a538ca3ee520d435ac77e36a2a',
  '06-task-flows': '635823faac296f4ff88a4c61b940b211c5fc3c8c73ea15bc012644978ff2b606',
  '07-interaction-state-contracts': '9cc809f28c5f0b4b19c6908c58965bad30b537529efce75be852b2065e256eae',
  '08-wireframe-prototyping': 'ad45b8ece80ddaca052146e1a078bdfcd76f4cec82367d26c8e436de8dd3b40c',
  '12-design-system-governance': '44bca0c7d50f2dab9db7b55b5fc52dc88106a1883b4f47c330e1f06ca65f76b7',
};
const staleManifest = [
  '66253bef4a653d8eb57ba1af450d54ded9d05786e38a443ee4fe0b2c81f57d41',
  '06465a8379b7f67755886be5366d282bb50ab9de5075ab513e995c7127afd562',
  'cd892fa5f51887f408bf33fcabb6e4048d046ff56a39e4d5aa6e799ac0a9f5a3',
  '26cd2c9e837733e5880a1810f6012c06bb2248857a0759b0bfb813ad7855c99a',
  '52e9eacd776d2bbb398eec81e60a4ea7bbc0dc1afc0c55b2d9630611c7f27246',
];
const agentCorpus = 'c56def0f8eaf17207c10bc794a771650b0c9f52207815ce11aa7a7a00f29f757';

await new Promise(resolve => app.server.listen(0, '127.0.0.1', resolve));
const base = `http://127.0.0.1:${app.server.address().port}`;
async function request(endpoint, options = {}) {
  const response = await fetch(base + endpoint, {
    method: options.method || 'GET',
    headers: { ...(options.data ? { 'content-type': 'application/json' } : {}), ...(options.headers || {}) },
    body: options.data ? JSON.stringify(options.data) : undefined,
  });
  const body = await response.json();
  return { status: response.status, body };
}
function learningBody(query, extra = {}) {
  return {
    requestId: crypto.randomUUID(),
    query,
    careerId: 'uiux-product-designer',
    contentVersion: 'uiux-design-v02',
    textbookVersionId: 'uiux-design-v02',
    useCurrentContext: false,
    locale: 'zh-CN',
    workbenchVersion: 'local-workbench-0.11',
    agentVersion: 'agent-system-v0.12',
    ...extra,
  };
}

try {
  const catalog = await request('/api/careers/uiux-product-designer/content/catalog');
  assert.equal(catalog.status, 200);
  assert.equal(catalog.body.releaseVersion, 'rolecraft-1.0');
  assert.equal(catalog.body.catalog.matchesManifest, true);
  assert.equal(catalog.body.catalog.sourceBinding.matchesManifest, true);
  assert.deepEqual(catalog.body.catalog.sourceBinding.chapterSourceHashMismatches, []);
  assert.equal(catalog.body.catalog.corpusVersion, 'uiux-design-v02');
  assert.equal(catalog.body.career.contentVersion, 'uiux-design-v02');
  assert.notEqual(catalog.body.catalog.corpusHash, agentCorpus);
  assert.equal(catalog.body.career.corpusHash, catalog.body.catalog.corpusHash);
  assert.equal(catalog.body.catalog.units.length, 28);
  const integrity = catalog.body.catalog.sourceBinding.chapterSourceIntegrity;
  assert.equal(integrity.length, 24);
  assert.equal(integrity[4].unitId, '05-domain-information-architecture');
  for (const item of integrity) {
    assert.equal(item.manifest, item.current, item.unitId);
    assert.equal(item.matches, true, item.unitId);
    assert.equal(item.availability, 'available', item.unitId);
    const file = readFileSync(path.join(project, 'textbooks/uiux-design-v02', item.source));
    assert.equal(item.current, sha256(file), item.unitId);
  }
  for (const [unitId, hash] of Object.entries(knownCurrent)) {
    const item = integrity.find(entry => entry.unitId === unitId);
    assert.equal(item.manifest, hash);
    assert.equal(item.current, hash);
  }
  const serialized = JSON.stringify(catalog.body);
  for (const hash of staleManifest) assert.equal(serialized.includes(hash), false);
  assert.equal(serialized.includes(agentCorpus), false);
  const drifted = catalog.body.catalog.units.filter(unit => unit.availability !== 'available');
  assert.equal(drifted.length, 0);

  const chapter = await request('/api/careers/uiux-product-designer/content/chapter/07-interaction-state-contracts');
  assert.equal(chapter.status, 200);
  assert.equal(chapter.body.chapter.unit.sourceSha256, knownCurrent['07-interaction-state-contracts']);
  assert.equal(chapter.body.chapter.unit.bodyMarkdown.includes('状态契约'), true);

  const probes = [
    ['XYZQWERTY12345foobar', 'no_match'],
    ['蒙特卡洛星系导航协议', 'no_match'],
    ['Kubernetes etcd raft quorum tuning', 'no_match'],
  ];
  for (const [query, expected] of probes) {
    const result = await request('/api/agent/learning/query', { method: 'POST', data: learningBody(query) });
    assert.equal(result.status, 200, query);
    assert.equal(result.body.status, expected, query);
    assert.equal(result.body.providerCalled, false, query);
    assert.equal(result.body.releaseVersion, 'rolecraft-1.0');
    assert.deepEqual(result.body.results, [], query);
  }
  const covered = await request('/api/agent/learning/query', { method: 'POST', data: learningBody('用状态契约消除界面里的假成功') });
  assert.equal(covered.status, 200);
  assert.equal(covered.body.status, 'recommended');
  assert.equal(covered.body.providerCalled, false);
  assert.equal(covered.body.engineMode, 'local_lexical_retrieval');
  assert.equal(covered.body.results.length > 0, true);
  assert.equal(covered.body.results.every(item => item.evidenceExcerpt.includes('状态契约') && item.sourceSha256 === knownCurrent['07-interaction-state-contracts']), true);
  assert.equal(JSON.stringify(covered.body).includes('OPENAI'), false);

  const mismatch = await request('/api/agent/learning/query', { method: 'POST', data: learningBody('状态契约', { contentVersion: 'textbook-v12' }) });
  assert.equal(mismatch.status, 409);
  assert.equal(mismatch.body.error.code, 'content_version_mismatch');

  const agent = await request('/api/careers/agent-developer/content/catalog');
  assert.equal(agent.status, 200);
  assert.equal(agent.body.catalog.corpusVersion, 'textbook-v12');
  assert.equal(agent.body.catalog.corpusHash, agentCorpus);
  assert.equal(JSON.stringify(agent.body).includes('uiux-design-v02'), false);

  const assets = catalog.body.catalog.assets;
  assert.equal(Array.isArray(assets), true);
  const requiredAssets = ['01-workbench-before-after.svg', 'v02-batch-a-01-role-evidence.svg', 'VA01-focus-scan.svg', 'VA02-composition-study.svg'];
  for (const name of requiredAssets) {
    const entry = assets.find(asset => asset.name === name);
    assert.ok(entry, name);
    assert.match(entry.sha256, /^[a-f0-9]{64}$/, name);
    assert.match(entry.sourcePath, /^textbooks\/uiux-design-v0[23]\/assets\/[^/]+$/, name);
    assert.equal(entry.href, `/api/content/assets/${name}?version=uiux-design-v02`, name);
    assert.equal(entry.staticHref, `content-uiux-assets/${name}`, name);
    assert.equal(entry.sourcePath.endsWith('/' + name), true, name);
  }
  assert.equal(new Set(assets.map(asset => asset.name)).size, assets.length);
  assert.equal(assets.length >= requiredAssets.length, true);
  const chapterAssets = chapter.body.chapter.assets;
  assert.equal(chapterAssets.some(asset => asset.name === '03-refund-state-board.svg'), true);

  async function readAsset(url) {
    const response = await fetch(base + url);
    const buffer = Buffer.from(await response.arrayBuffer());
    return { status: response.status, type: response.headers.get('content-type'), buffer, text: buffer.toString('utf8') };
  }
  const figure = await readAsset('/api/content/assets/01-workbench-before-after.svg?version=uiux-design-v02');
  assert.equal(figure.status, 200);
  assert.equal(figure.type, 'image/svg+xml');
  assert.equal(figure.text.startsWith('<svg'), true);
  assert.equal(sha256(figure.buffer), assets.find(asset => asset.name === '01-workbench-before-after.svg').sha256);
  assert.equal(figure.text.includes('OPENAI_API_KEY'), false);
  const visual = await readAsset('/api/content/assets/VA01-focus-scan.svg?version=uiux-design-v02');
  assert.equal(visual.status, 200);
  assert.equal(visual.type, 'image/svg+xml');
  const uppercase = await readAsset('/api/content/assets/VA01-proportion-scale.svg?version=uiux-design-v02');
  assert.equal(uppercase.status, 200);
  assert.equal(uppercase.type, 'image/svg+xml');
  assert.equal(uppercase.text.includes('<svg'), true);
  const agentLoop = await readAsset('/api/content/assets/agent-runtime-loop.png?version=textbook-v12');
  assert.equal(agentLoop.status, 200);
  assert.equal(agentLoop.type, 'image/png');
  const agentLandscape = await readAsset('/api/content/assets/agent-engineering-landscape-v12.png?version=textbook-v12');
  assert.equal(agentLandscape.status, 200);
  assert.equal(agentLandscape.type, 'image/png');
  const copied = await readAsset('/content-uiux-assets/01-workbench-before-after.svg');
  assert.equal(copied.status, 200);
  assert.match(copied.type, /^image\/svg\+xml/);
  assert.equal(sha256(copied.buffer), sha256(figure.buffer));
  const agentFigure = await readAsset('/api/content/assets/agent-runtime-loop.svg?version=textbook-v12');
  assert.equal(agentFigure.status, 200);
  assert.equal(agentFigure.type, 'image/svg+xml');
  assert.equal(agentFigure.text.includes('<svg'), true);
  const agentOnUiux = await readAsset('/api/content/assets/agent-runtime-loop.svg?version=uiux-design-v02');
  assert.equal(agentOnUiux.status, 404);
  const uiuxOnAgent = await readAsset('/api/content/assets/01-workbench-before-after.svg?version=textbook-v12');
  assert.equal(uiuxOnAgent.status, 404);
  const missingFigure = await readAsset('/api/content/assets/not-a-published-figure.svg?version=uiux-design-v02');
  assert.equal(missingFigure.status, 404);
  const lockedCatalog = await request('/api/content/catalog?version=uiux-design-v02');
  assert.equal(lockedCatalog.status, 400);
  assert.equal(lockedCatalog.body.error.code, 'content_version_invalid');
  for (const blocked of ['/api/content/assets/..%2F..%2Fpackage.json?version=uiux-design-v02', '/api/content/assets/%2e%2e%2fpackage.json?version=uiux-design-v02', '/api/content/assets/01-workbench-before-after.svg/../../package.json?version=uiux-design-v02']) {
    const escaped = await readAsset(blocked);
    assert.ok([400, 403, 404].includes(escaped.status), blocked + ' -> ' + escaped.status);
    assert.equal(escaped.text.includes('"dependencies"'), false, blocked);
    assert.equal(escaped.text.includes('OPENAI_API_KEY'), false, blocked);
  }

  const imageRefs = { direct: new Set(), parent: new Set() };
  const chapterDir = path.join(project, 'textbooks/uiux-design-v02/chapters');
  const vaDir = path.join(project, 'textbooks/uiux-design-v03');
  for (const file of [...readdirSync(chapterDir).filter(name => name.endsWith('.md')).map(name => path.join(chapterDir, name)), ...readdirSync(vaDir).filter(name => name.endsWith('.md')).map(name => path.join(vaDir, name))]) {
    const text = readFileSync(file, 'utf8');
    for (const match of text.matchAll(/!\[[^\]]*\]\(([^)\s]+)\)/g)) {
      if (/^assets\/[^/]+$/.test(match[1])) imageRefs.direct.add(match[1].slice('assets/'.length));
      else if (/^\.\.\/assets\/[^/]+$/.test(match[1])) imageRefs.parent.add(match[1].slice('../assets/'.length));
    }
  }
  assert.equal(imageRefs.direct.size > 0, true);
  assert.equal(imageRefs.parent.size > 0, true);
  for (const name of [...imageRefs.direct, ...imageRefs.parent]) assert.equal(assets.some(asset => asset.name === name), true, name);

  const storage = new Map();
  const clientContext = {
    console,
    setTimeout,
    clearTimeout,
    URL,
    URLSearchParams,
    Map,
    Set,
    crypto,
    fetch: (url, options) => fetch(String(url).startsWith('/') ? base + url : url, options),
    document: {
      addEventListener() {},
      getElementById() { return null; },
      querySelector() { return null; },
      createElement() { return { hidden: false, setAttribute() {}, appendChild() {}, classList: { toggle() {} }, addEventListener() {} }; },
      body: { appendChild() {}, classList: { toggle() {} } },
      documentElement: { style: { setProperty() {} } },
    },
    localStorage: { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, String(value)) },
    location: { hash: '#learn/career/uiux-product-designer/08-wireframe-prototyping', protocol: 'http:', href: base + '/' },
  };
  clientContext.globalThis = clientContext;
  clientContext.window = clientContext;
  vm.createContext(clientContext);
  vm.runInContext(readFileSync(path.join(project, 'dist/learning-workbench.js'), 'utf8'), clientContext, { filename: 'learning-workbench.js' });
  let reader = '';
  for (let attempt = 0; attempt < 40 && !reader.includes('01-workbench-before-after.svg'); attempt += 1) {
    reader = clientContext.LearningWorkbench.page('learn');
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  assert.match(reader, /<figure class="lw-figure"><button[^>]*><img src="\/api\/content\/assets\/01-workbench-before-after\.svg\?version=uiux-design-v02"/);
  assert.equal(reader.includes('从功能堆叠到围绕当前工单组织的结构 <small>（参考位置暂未提供）'), false);
  const probeUnit = {
    unitId: '08-wireframe-prototyping',
    sourcePath: 'textbooks/uiux-design-v02/chapters/08-wireframe-prototyping.md',
    sections: [],
    prerequisiteUnitIds: [],
    bodyMarkdown: [
      '![parent](../assets/01-workbench-before-after.svg)',
      '![direct](assets/VA01-proportion-scale.svg)',
      '![escape](../../assets/01-workbench-before-after.svg)',
      '![dotdot](../assets/../01-workbench-before-after.svg)',
    ].join('\n\n'),
  };
  const probe = clientContext.LearningWorkbench.markdown(probeUnit, false);
  assert.equal((probe.match(/<figure class="lw-figure">/g) || []).length, 2);
  assert.match(probe, /<img src="\/api\/content\/assets\/01-workbench-before-after\.svg\?version=uiux-design-v02" alt="parent"/);
  assert.match(probe, /<img src="\/api\/content\/assets\/VA01-proportion-scale\.svg\?version=uiux-design-v02" alt="direct"/);
  assert.match(probe, /class="lw-unavailable-link">escape /);
  assert.match(probe, /class="lw-unavailable-link">dotdot /);

  const agentStorage = new Map();
  const agentContext = {
    console, setTimeout, clearTimeout, URL, URLSearchParams, Map, Set, crypto,
    fetch: (url, options) => fetch(String(url).startsWith('/') ? base + url : url, options),
    document: clientContext.document,
    localStorage: { getItem: key => agentStorage.get(key) ?? null, setItem: (key, value) => agentStorage.set(key, String(value)) },
    location: { hash: '#learn/agent/00-learning-route', protocol: 'http:', href: base + '/' },
  };
  agentContext.globalThis = agentContext;
  agentContext.window = agentContext;
  vm.createContext(agentContext);
  vm.runInContext(readFileSync(path.join(project, 'dist/content-v12-data.js'), 'utf8'), agentContext, { filename: 'content-v12-data.js' });
  vm.runInContext(readFileSync(path.join(project, 'dist/learning-workbench.js'), 'utf8'), agentContext, { filename: 'learning-workbench.js' });
  const agentReader = agentContext.LearningWorkbench.page('learn');
  assert.match(agentReader, /<figure class="lw-figure"><button[^>]*><img src="\/api\/content\/assets\/agent-runtime-loop\.png\?version=textbook-v12"/);
  assert.match(agentReader, /<img src="\/api\/content\/assets\/agent-engineering-landscape-v12\.png\?version=textbook-v12"/);
  assert.equal(agentReader.includes('uiux-design-v02'), false);

  const client = readFileSync(path.join(project, 'dist/learning-workbench.js'), 'utf8');
  for (const marker of ['保存草稿', '提交练习', '练习反馈', 'data-lw-career-practice-submit', '当前入口提供静态教材阅读']) assert.equal(client.includes(marker), true, marker);
  for (const banned of ['不等于能力认证', '职业认证', '诊断需实际完成']) assert.equal(client.includes(banned), false, banned);
  const served = await fetch(base + '/learning-workbench.js');
  assert.equal(served.status, 200);
  const servedText = await served.text();
  assert.equal(servedText.includes('提交练习'), true);
  assert.equal(servedText.includes('不等于能力认证'), false);
  console.log('UIUX functional checks passed: AC-06 catalog integrity, AC-08 antifabrication, AC-05 practice copy.');
} finally {
  await app.close();
  rmSync(dir, { recursive: true, force: true });
}
