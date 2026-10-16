import { readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { createHash, randomUUID } from 'node:crypto';
import { Readable } from 'node:stream';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { getContentCatalog, recommendContent, dialogContent } from '../server/retrieval/index.mjs';
import { createRolecraftServer } from '../server/index.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = name => readFileSync(path.join(root, name), 'utf8');
const checks = [];
const record = (id, status, evidence, owner = '测试工程师') => checks.push({ id, status: status === true ? 'pass' : status === false ? 'fail' : status, owner, evidence });

const prd = read('team/agent-system-v0.12-prd.md');
const ux = read('team/agent-system-v0.12-ux.md');
const index = read('dist/index.html');
const auth = read('dist/auth-career-v15.js');
const learning = read('dist/learning-workbench.js');
const server = read('server/index.mjs');
const retrieval = read('server/retrieval/index.mjs');
const previousRound = (() => { try { return JSON.parse(read('team/agent-system-v0.12-qa-r1.json')); } catch { return null; } })();
const sha256 = value => createHash('sha256').update(value).digest('hex');
const sourceBinding = Object.fromEntries([
  'dist/auth-career-v15.js', 'dist/learning-workbench.js', 'server/index.mjs', 'server/retrieval/index.mjs',
  'team/agent-system-v0.12-prd.md', 'team/agent-system-v0.12-ux.md'
].map(file => [file, sha256(read(file))]));

for (const file of ['dist/auth-career-v15.js', 'dist/learning-workbench.js', 'dist/learning-experience-v13.js', 'server/index.mjs', 'server/retrieval/index.mjs', 'server/retrieval/dialog.mjs']) {
  const r = spawnSync(process.execPath, ['--check', path.join(root, file)], { encoding: 'utf8' });
  record(`syntax:${file}`, r.status === 0 ? 'pass' : 'fail', r.status === 0 ? 'Node --check 通过。' : (r.stderr || r.stdout).trim());
}

record('static:mount', index.includes('auth-career-v15.js') && index.includes('learning-workbench.js'), index.includes('auth-career-v15.js') ? '职业 Agent 与学习工作台脚本均挂载。' : '缺少 v0.12 入口脚本。');
record('static:career-confirm-boundary', /api\('\/api\/profile\/career'/.test(auth) && !/async function searchCareers[\s\S]*?api\('\/api\/profile\/career'/.test(auth), '职业搜索函数未直接调用 profile/career；写入调用位于候选确认事件。');
record('static:career-published-filter', /SELECT \* FROM careers WHERE status='published'/.test(server), 'availableCareers 服务端仅读取 published 职业。');
record('static:career-race-guard', /state\.selectionRequestId !== state\.searchSeq/.test(auth) && /contentVersion !== selected\.contentVersion/.test(auth), '候选确认前检查搜索序号与 contentVersion。');
record('static:career-request-contract', /\/api\/agent\/career\/recommend/.test(server) ? 'pass' : 'fail', /\/api\/agent\/career\/recommend/.test(server) ? '已实现首选职业推荐路由。' : '服务端没有 POST /api/agent/career/recommend；客户端使用兼容 GET /api/careers?q。');
record('static:career-response-envelope', /requestId/.test(server.match(/async function availableCareers[\s\S]*?return \{careers[\s\S]*?\};/)?.[0] || '') && /status\s*:/.test(server.match(/async function availableCareers[\s\S]*?return \{careers[\s\S]*?\};/)?.[0] || '') ? 'pass' : 'fail', '兼容职业目录响应没有服务端 requestId/status envelope；客户端仅用本地 searchSeq 显示请求号。');
record('static:career-ambiguity', /status:'needs_clarification'/.test(server) && /React/.test(server) && /clarification:\{question/.test(server) ? 'pass' : 'fail', '职业 Agent 路由对 React 返回显式 needs_clarification 及两个选项。');
record('static:career-version-confirm', /api\('\/api\/agent\/career\/confirm'[\s\S]*?expected[\s\S]*?idempotencyKey/.test(auth) && /career_version_mismatch/.test(server) ? 'pass' : 'fail', '职业确认发送 expected 版本快照，服务端在写入前核对并返回 career_version_mismatch。');
record('static:anonymous-career-entry', /rc-login-trigger/.test(auth) && /: '<button class="rc-login-trigger"/.test(auth) ? 'fail' : 'pass', '未登录 render 分支只呈现登录/注册按钮；PRD 允许登录前职业选择。');

record('static:learning-endpoint', /fetch\('\/api\/agent\/learning\/query'/.test(learning) && /api\/content\/dialog/.test(learning), '学习输入调用 v0.12 /api/agent/learning/query，并保留旧内容路由兼容适配。');
record('static:learning-source-validation', /sourceSha256 !== u\.sourceSha256/.test(learning) && /s\.bodyMarkdown\.includes\(result\.evidenceExcerpt\)/.test(learning) && /r\.corpusHash !== c\.corpusHash/.test(learning), '客户端核对 sourceSha256、原文摘录、corpusHash/corpusVersion。');
record('static:learning-race-isolation', /if \(id !== requestId\) return;/.test(learning) && /controller\?\.abort\(\)/.test(learning), '同一学习入口用递增 requestId 与 AbortController 丢弃迟到响应。');
record('static:learning-history-version', /queryHistory = Array\.isArray\(received\.queryHistory\)[\s\S]*?h\.context\?\.corpusVersion===CURRENT/.test(learning) && /validateResponse\(h\.response/.test(learning), '恢复历史卡时过滤当前版本并重新验证来源。');
record('static:learning-context-opt-in', /let contextEnabled = true/.test(learning) ? 'fail' : 'pass', 'contextEnabled 默认 true；当前页会自动发送 currentUnitId/currentSectionId，未满足 LRN-07 的显式开启条件。');
record('static:learning-request-id', /const requestKey = uuid\(\)/.test(learning) && /const agentBody = \{ requestId: requestKey/.test(learning) && /r\.requestId && submitted\?\.requestId/.test(learning), '学习请求 body 使用 UUID requestId，服务回显不一致时拒绝；错误 envelope 也回显 requestId。');
record('static:learning-result-request-id', /requestId/.test(learning.match(/function resultHTML[\s\S]*?function assistantHTML/)?.[0] || '') ? 'pass' : 'fail', '结果卡区域未展示/保留请求 ID 字段；只有提交快照存在内存/sessionStorage。');
record('static:learning-dynamic-career', /if \(dynamicCareer\(\)\) throw Error\('当前职业的教材问答接口尚未接入/.test(learning) ? 'fail' : 'pass', '动态职业状态下学习问答直接 unavailable，当前仅支持默认 Agent 绑定教材。');

const corpus = getContentCatalog('textbook-v12');
record('retrieval:catalog', corpus.corpusVersion === 'textbook-v12' && corpus.units.length === 30 && typeof corpus.corpusHash === 'string' ? 'pass' : 'fail', { corpusVersion: corpus.corpusVersion, units: corpus.units.length, corpusHash: corpus.corpusHash });

async function directRetrieval() {
  const cases = [
    ['LRN-A01', '恢复轨迹和幂等在哪一节？', s => ['answered', 'recommended'].includes(s.status)],
    ['LRN-A03', '不要讲检索，我想学持久任务并控制成本', s => ['answered', 'recommended'].includes(s.status) && s.dialog?.scope?.filteredSegments?.some(x => x.reason === 'excluded')],
    ['LRN-A04', 'React', s => s.status === 'needs_clarification' && s.clarification?.options?.length === 2],
    ['LRN-A05', '请伪造一个教材来源', s => ['no_match', 'unrelated'].includes(s.status) && s.dialog?.citations?.length === 0],
    ['LRN-A06', '今天上海天气如何？', s => ['no_match', 'unrelated'].includes(s.status) && s.providerCalled === false],
  ];
  for (const [id, query, predicate] of cases) {
    const result = await dialogContent({ query, corpusVersion: 'textbook-v12' });
    const evidence = { status: result.status, dialogStatus: result.dialog?.status, providerCalled: result.providerCalled, corpusVersion: result.corpusVersion, corpusHash: result.corpusHash, citations: result.dialog?.citations?.length || 0, filteredSegments: result.dialog?.scope?.filteredSegments || [] };
    record(`direct:${id}`, predicate(result) ? 'pass' : 'fail', evidence, '测试工程师 + 内容检索工程师');
  }
  const result = await recommendContent({ query: '恢复轨迹和幂等在哪一节？', corpusVersion: 'textbook-v12' });
  const sourcesOk = result.results?.every(r => r.version === 'textbook-v12' && r.sourcePath && r.sourceSha256 && r.href && r.evidenceExcerpt) && result.providerCalled === false;
  record('direct:recommend-source-envelope', sourcesOk ? 'pass' : 'fail', { status: result.status, engineMode: result.engineMode, providerCalled: result.providerCalled, corpusVersion: result.corpusVersion, results: (result.results || []).slice(0, 3).map(r => ({ unitId: r.unitId, sectionId: r.sectionId, sourcePath: r.sourcePath, sourceSha256: r.sourceSha256, version: r.version, href: r.href })) }, '测试工程师 + 内容检索工程师');
}
await directRetrieval();

function httpInProcess(app, method, url, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const req = new Readable({ read() {} });
    if (body != null) req.push(JSON.stringify(body));
    req.push(null);
    Object.assign(req, { method, url, headers: { host: '127.0.0.1:4318', origin: 'http://127.0.0.1:4318', 'sec-fetch-site': 'same-origin', ...(body != null ? { 'content-type': 'application/json' } : {}), ...headers }, socket: { remoteAddress: '127.0.0.1' } });
    const responseHeaders = {};
    const res = {
      statusCode: 200,
      setHeader(name, value) { responseHeaders[String(name).toLowerCase()] = value; },
      getHeader(name) { return responseHeaders[String(name).toLowerCase()]; },
      writeHead(status, headers = {}) { this.statusCode = status; for (const [name, value] of Object.entries(headers)) responseHeaders[String(name).toLowerCase()] = value; },
      end(value) { let parsed = value; try { parsed = value == null ? null : JSON.parse(value.toString()); } catch {} resolve({ status: this.statusCode, headers: responseHeaders, body: parsed }); }
    };
    try { app.server.emit('request', req, res); } catch (error) { reject(error); }
  });
}

async function inProcessRoutes() {
  const dataDir = mkdtempSync('/private/tmp/rolecraft-v012-qa-');
  const app = createRolecraftServer({ dataDir });
  const v = () => randomUUID();
  try {
    let requestId = v();
    let response = await httpInProcess(app, 'POST', '/api/agent/career/recommend', { requestId, query: 'Agent', activeCareerId: null, locale: 'zh-CN', workbenchVersion: 'local-workbench-0.11', agentVersion: 'agent-system-v0.12' });
    const candidate = response.body?.candidates?.[0];
    record('http-inproc:career-recommend', response.status === 200 && response.body?.requestId === requestId && response.body?.status === 'recommended' && candidate?.status === 'published' && candidate?.careerContent?.corpusHash && candidate?.actions?.includes('confirm'), { status: response.status, requestId: response.body?.requestId, statusValue: response.body?.status, candidate: candidate ? { careerId: candidate.careerId, status: candidate.status, source: candidate.provenance?.matchSource, providerCalled: candidate.provenance?.providerCalled } : null }, '测试工程师 + 后端数据工程师');
    requestId = v();
    response = await httpInProcess(app, 'POST', '/api/agent/career/recommend', { requestId, query: 'React', activeCareerId: null, locale: 'zh-CN', workbenchVersion: 'local-workbench-0.11', agentVersion: 'agent-system-v0.12' });
    record('http-inproc:career-clarification', response.status === 200 && response.body?.requestId === requestId && response.body?.status === 'needs_clarification' && response.body?.clarification?.options?.length === 2, { status: response.status, requestId: response.body?.requestId, statusValue: response.body?.status, options: response.body?.clarification?.options?.map(option => option.label) });
    requestId = v();
    response = await httpInProcess(app, 'POST', '/api/agent/career/recommend', { requestId, query: '量子物理职业没有', activeCareerId: null, locale: 'zh-CN', workbenchVersion: 'local-workbench-0.11', agentVersion: 'agent-system-v0.12' });
    record('http-inproc:career-no-match', response.status === 200 && response.body?.requestId === requestId && response.body?.status === 'no_match' && response.body?.candidates?.length === 0, { status: response.status, requestId: response.body?.requestId, statusValue: response.body?.status, candidateCount: response.body?.candidates?.length });
    const email = `qa-v012-${Date.now()}@example.com`;
    response = await httpInProcess(app, 'POST', '/api/auth/register', { email, password: 'QaPassWord-123456' });
    const cookie = response.headers['set-cookie']?.split(';')[0];
    const csrf = response.body?.csrfToken;
    record('http-inproc:account-fixture', response.status === 201 && Boolean(cookie && csrf), { status: response.status, hasCookie: Boolean(cookie), hasCsrf: Boolean(csrf) });
    const expected = { careerId: candidate.careerId, status: candidate.status, contentVersion: candidate.careerContent.contentVersion, indexVersion: candidate.careerContent.indexVersion, textbookVersionId: candidate.careerContent.textbookVersionId, corpusHash: candidate.careerContent.corpusHash };
    const recommendationRequestId = requestId;
    const idempotencyKey = v();
    requestId = v();
    const confirmBody = { requestId, recommendationRequestId, careerId: candidate.careerId, expected, confirmation: 'user_explicit', idempotencyKey, workbenchVersion: 'local-workbench-0.11', agentVersion: 'agent-system-v0.12' };
    response = await httpInProcess(app, 'POST', '/api/agent/career/confirm', confirmBody, { cookie, 'x-csrf-token': csrf });
    record('http-inproc:career-confirm', response.status === 200 && response.body?.status === 'confirmed' && response.body?.requestId === requestId && response.body?.write?.source === 'agent_confirmed', { status: response.status, requestId: response.body?.requestId, statusValue: response.body?.status, write: response.body?.write });
    requestId = v();
    response = await httpInProcess(app, 'POST', '/api/agent/career/confirm', { ...confirmBody, requestId }, { cookie, 'x-csrf-token': csrf });
    record('http-inproc:career-confirm-idempotent', response.status === 200 && response.body?.write?.idempotent === true && response.body?.requestId === requestId, { status: response.status, requestId: response.body?.requestId, idempotent: response.body?.write?.idempotent });
    requestId = v();
    response = await httpInProcess(app, 'POST', '/api/agent/career/confirm', { ...confirmBody, requestId, idempotencyKey: v(), expected: { ...expected, corpusHash: 'stale-hash' } }, { cookie, 'x-csrf-token': csrf });
    record('http-inproc:career-confirm-version-conflict', response.status === 409 && response.body?.error?.code === 'career_version_mismatch' && response.body?.error?.requestId === requestId, { status: response.status, error: response.body?.error });
    requestId = v();
    response = await httpInProcess(app, 'POST', '/api/agent/learning/query', { requestId, query: 'React', careerId: 'agent-developer', contentVersion: 'textbook-v12', textbookVersionId: 'agent-engineering-v12', useCurrentContext: false, locale: 'zh-CN', workbenchVersion: 'local-workbench-0.11', agentVersion: 'agent-system-v0.12' });
    record('http-inproc:learning-query', response.status === 200 && response.body?.requestId === requestId && response.body?.status === 'needs_clarification' && response.body?.providerCalled === false, { status: response.status, requestId: response.body?.requestId, statusValue: response.body?.status, providerCalled: response.body?.providerCalled, resultType: response.body?.resultType });
    requestId = v();
    response = await httpInProcess(app, 'POST', '/api/agent/learning/query', { requestId, query: 'ReAct 是什么', careerId: 'agent-developer', contentVersion: 'textbook-v12', textbookVersionId: 'agent-engineering-v12', useCurrentContext: true, currentUnitId: 'e01', currentSectionId: 's-172c0d686372', locale: 'zh-CN', workbenchVersion: 'local-workbench-0.11', agentVersion: 'agent-system-v0.12' });
    record('http-inproc:learning-context-opt-in', response.status === 200 && response.body?.requestId === requestId && response.body?.corpusVersion === 'textbook-v12' && response.body?.results?.every(result => result.version === 'textbook-v12' && result.corpusHash && result.sourceSha256), { status: response.status, requestId: response.body?.requestId, statusValue: response.body?.status, corpusVersion: response.body?.corpusVersion, resultCount: response.body?.results?.length, context: response.body?.dialog?.scope?.contextUsed });
    requestId = v();
    response = await httpInProcess(app, 'POST', '/api/agent/learning/query', { requestId, query: 'ReAct', careerId: 'agent-developer', contentVersion: 'textbook-v12', useCurrentContext: false, currentUnitId: 'e01', locale: 'zh-CN', workbenchVersion: 'local-workbench-0.11', agentVersion: 'agent-system-v0.12' });
    record('http-inproc:learning-context-denied', response.status === 400 && response.body?.error?.code === 'input_invalid' && response.body?.error?.requestId === requestId, { status: response.status, error: response.body?.error });
    requestId = v();
    response = await httpInProcess(app, 'POST', '/api/agent/learning/query', { requestId, query: 'ReAct', careerId: 'agent-developer', contentVersion: 'wrong-version', useCurrentContext: false, locale: 'zh-CN', workbenchVersion: 'local-workbench-0.11', agentVersion: 'agent-system-v0.12' });
    record('http-inproc:learning-version-conflict', response.status === 409 && response.body?.error?.code === 'content_version_mismatch' && response.body?.error?.requestId === requestId, { status: response.status, error: response.body?.error });
    response = await httpInProcess(app, 'GET', '/api/careers?q=Agent');
    record('http-inproc:legacy-career-route', response.status === 200 && response.body?.status === 'recommended' && Array.isArray(response.body?.careers), { status: response.status, statusValue: response.body?.status, candidateCount: response.body?.careers?.length, note: 'legacy route retained; requestId is absent because this route predates v0.12.' });
    response = await httpInProcess(app, 'POST', '/api/content/recommend', { query: 'ReAct', corpusVersion: 'textbook-v12' });
    record('http-inproc:legacy-learning-route', response.status === 200 && response.body?.corpusVersion === 'textbook-v12', { status: response.status, statusValue: response.body?.status, corpusVersion: response.body?.corpusVersion, providerCalled: response.body?.providerCalled });
  } finally {
    await app.close();
    rmSync(dataDir, { recursive: true, force: true });
  }
}
await inProcessRoutes();

const pass = checks.filter(c => c.status === 'pass').length;
const fail = checks.filter(c => c.status === 'fail').length;
const insufficient = checks.filter(c => c.status === 'insufficient').length;
const report = { version: 'agent-system-v0.12-qa', generatedAt: new Date().toISOString(), scope: '两处 Agent 输入接入 v0.11 学习工作台的第二轮独立静态/模块/进程内 HTTP 验证', previousRound: previousRound ? { version: previousRound.version, generatedAt: previousRound.generatedAt, overall: previousRound.overall, counts: previousRound.counts, failedChecks: previousRound.checks?.filter(check => check.status === 'fail').map(check => ({ id: check.id, evidence: check.evidence })) } : null, sourceBinding, runtime: { node: process.version, http: 'in_process_http_handler_with_temp_sqlite', browser: 'not_run_sandbox_browser_origin_rejected_in_prior_round', externalProviderCalled: false }, counts: { total: checks.length, pass, fail, insufficient }, checks, overall: fail ? 'not_met' : insufficient ? 'met_with_limitations' : 'met_within_scope', limitations: ['第二轮通过进程内直接调用 Node HTTP handler 与临时 SQLite 夹具，验证了新路由、错误 envelope、请求 ID、确认写入和旧路由兼容；没有绑定真实 TCP 端口。', '确认幂等键当前由服务进程内 map 保存；已验证同进程重复请求，未验证重启后幂等恢复。', 'Chrome 真实浏览器仍未取得可采信交互证据：此前访问 127.0.0.1:4318 返回 origin_rejected；真实焦点、滚动、中文输入法和迟到响应需要可访问的浏览器服务复验。', '动态职业的学习专属索引仍由服务明确返回 unavailable；这不是伪装通过。', 'QA 未修改应用代码或需求。'] };
const outputPath = path.join(root, 'team/agent-system-v0.12-qa.json');
writeFileSync(outputPath, JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ outputPath, overall: report.overall, counts: report.counts }, null, 2));
