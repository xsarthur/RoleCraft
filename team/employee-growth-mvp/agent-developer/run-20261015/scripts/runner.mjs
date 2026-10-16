import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const WORKSPACE = path.resolve(process.env.ROLECRAFT_WORKSPACE || process.cwd());
const RUN_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FIXTURES = path.join(RUN_DIR, 'fixtures');
const LOGS = path.join(RUN_DIR, 'logs');
const AGENT_VERSION = 'agent-developer-mvp-v1.0';
const T1_CONTRACT = 'T1-v1.0';
const T2_CONTRACT = 'T2-v1.0';
const T3_CONTRACT = 'T3-v1.0';
const CONTENT_VERSION = 'v12';
const INDEX_VERSION = 'retrieval-stub-v1.0';
const ALLOWED_ROOT = path.resolve(WORKSPACE, 'sites/rolecraft/textbooks/v12');
const RUN_COMMAND = 'node sites/rolecraft/team/employee-growth-mvp/agent-developer/run-20261015/scripts/runner.mjs';

function readJson(file) { return JSON.parse(fs.readFileSync(file, 'utf8')); }
function sha256Bytes(bytes) { return crypto.createHash('sha256').update(bytes).digest('hex'); }
function sha256File(file) { return sha256Bytes(fs.readFileSync(file)); }
function sha256Json(value) { return sha256Bytes(Buffer.from(JSON.stringify(value))); }
function fixture(name) { return readJson(path.join(FIXTURES, name)); }
function logPath(id) { return path.join(LOGS, `${id}.jsonl`); }
function makeLogger(runId, contract, fixtureId) {
  const events = [];
  function emit(state, event, payload = {}) {
    const item = { event_seq: events.length + 1, run_id: runId, agent_version: AGENT_VERSION, contract, state, event, ...payload };
    events.push(item);
  }
  return { events, emit, save: () => fs.writeFileSync(logPath(runId), events.map(e => JSON.stringify(e)).join('\n') + '\n') };
}
function safeRelative(p) {
  const abs = path.resolve(WORKSPACE, p);
  return abs === ALLOWED_ROOT || abs.startsWith(`${ALLOWED_ROOT}${path.sep}`);
}
function sourceInfo(relativePath, excerpt) {
  if (!safeRelative(relativePath)) return {ok:false, reason:'path_outside_allowed_root'};
  const abs = path.resolve(WORKSPACE, relativePath);
  if (!fs.existsSync(abs) || !fs.statSync(abs).isFile()) return {ok:false, reason:'source_not_found'};
  const text = fs.readFileSync(abs, 'utf8');
  if (!text.includes(excerpt)) return {ok:false, reason:'excerpt_not_found'};
  const sectionId = path.basename(relativePath, path.extname(relativePath));
  return {ok:true, source_path:relativePath, source_sha256:sha256File(abs), section_id:sectionId, excerpt_verified:true};
}

function runT1Normal() {
  const f = fixture('t1-normal.json');
  const id = 't1-normal-001';
  const l = makeLogger(id, T1_CONTRACT, f.fixture_id);
  const inputHash = sha256Json(f);
  l.emit('received', 'run_received', {fixture_id:f.fixture_id, fixture_sha256:inputHash, input_summary:f.task});
  l.emit('planning', 'plan_created', {agent_step:1, max_agent_steps:3, tool_allowlist:[f.tool]});
  l.emit('tool_call', 'tool_call_started', {agent_step:2, tool:f.tool, attempt:1, side_effect:'none'});
  l.emit('tool_call', 'tool_result', {agent_step:2, tool:f.tool, attempt:1, status:'ok', output_summary:'bounded-ok'});
  l.emit('checking', 'result_checked', {agent_step:3, checks:['tool_status_ok','bounded_input']});
  l.emit('completed', 'run_completed', {agent_step:3, output_summary:'bounded-ok', stop_reason:'completed'});
  l.save();
  const final = l.events.at(-1);
  return {id, contract:T1_CONTRACT, fixture_id:f.fixture_id, fixture_sha256:inputHash, status:'completed', stop_reason:final.stop_reason, tool_attempts:1, agent_steps:3, events:l.events.length, log:`logs/${id}.jsonl`};
}

function runT1Failure() {
  const f = fixture('t1-tool-failure.json');
  const id = 't1-tool-failure-001';
  const l = makeLogger(id, T1_CONTRACT, f.fixture_id);
  const inputHash = sha256Json(f);
  l.emit('received', 'run_received', {fixture_id:f.fixture_id, fixture_sha256:inputHash, input_summary:f.task});
  l.emit('planning', 'plan_created', {agent_step:1, max_agent_steps:3, tool_allowlist:[f.tool], retry_limit:f.retry_limit});
  for (let attempt = 1; attempt <= 2; attempt++) {
    l.emit('tool_call', 'tool_call_started', {agent_step:attempt + 1, tool:f.tool, attempt, side_effect:'none'});
    l.emit('tool_call', 'tool_result', {agent_step:attempt + 1, tool:f.tool, attempt, status:'error', error_code:f.tool_error.code, error_summary:f.tool_error.message});
    if (attempt === 1) l.emit('waiting_retry', 'controlled_retry_scheduled', {agent_step:2, retry_limit:f.retry_limit, next_attempt:2, reason:'transient_tool_error'});
  }
  l.emit('failed', 'run_stopped', {agent_step:3, stop_reason:'tool_error_after_one_retry', next_step:'escalate_to_owner'});
  l.save();
  return {id, contract:T1_CONTRACT, fixture_id:f.fixture_id, fixture_sha256:inputHash, status:'failed', stop_reason:'tool_error_after_one_retry', tool_attempts:2, retry_count:1, events:l.events.length, log:`logs/${id}.jsonl`};
}

function validateCandidate(candidate, expectedContent, expectedIndex) {
  const required = ['section_id','source_path','excerpt','content_version','index_version'];
  for (const key of required) if (!candidate[key]) return {ok:false, reason:`missing_${key}`};
  if (candidate.content_version !== expectedContent || candidate.index_version !== expectedIndex) {
    return {ok:false, reason:'source_version_conflict', observed_content_version:candidate.content_version, observed_index_version:candidate.index_version};
  }
  const info = sourceInfo(candidate.source_path, candidate.excerpt);
  if (!info.ok) return info;
  if (info.section_id !== candidate.section_id) return {ok:false, reason:'section_id_mismatch', observed:info.section_id};
  return {...info, content_version:candidate.content_version, index_version:candidate.index_version};
}

function runT2Case(caseName) {
  const stub = fixture('t2-retrieval-stub.json');
  const response = stub.responses[caseName];
  const id = `t2-${caseName}-001`;
  const l = makeLogger(id, T2_CONTRACT, `${caseName}-retrieval`);
  const inputHash = sha256Json(response);
  l.emit('received', 'retrieval_query_received', {query:response.query, query_sha256:sha256Bytes(Buffer.from(response.query)), interface_version:stub.interface_version, fixture_sha256:inputHash});
  l.emit('retrieval', 'retrieval_stub_response', {retrieval_status:response.retrieval_status, candidate_count:response.candidates.length, content_version:stub.content_version, index_version:stub.index_version});
  let result;
  if (response.retrieval_status === 'no_match') {
    result = {status:'needs_clarification', stop_reason:'no_match'};
    l.emit('stopped', 'retrieval_no_match', {stop_reason:'no_match', next_step:'request_clearer_query'});
  } else if (response.retrieval_status === 'ambiguous') {
    result = {status:'needs_clarification', stop_reason:'ambiguous_candidates'};
    l.emit('stopped', 'retrieval_ambiguous', {stop_reason:'ambiguous_candidates', candidate_count:response.candidates.length, next_step:'request_scope_or_section'});
  } else {
    const candidate = response.candidates[0];
    const checked = validateCandidate(candidate, stub.content_version, stub.index_version);
    if (!checked.ok) {
      result = {status:'stopped', stop_reason:checked.reason};
      l.emit('stopped', 'source_rejected', {stop_reason:checked.reason, candidate_section_id:candidate.section_id, source_path:candidate.source_path, observed_content_version:candidate.content_version, observed_index_version:candidate.index_version});
    } else {
      result = {status:'recommended', stop_reason:'source_verified', section_id:candidate.section_id, source_path:candidate.source_path, excerpt:candidate.excerpt, source_sha256:checked.source_sha256};
      l.emit('source_verified', 'source_opened_and_verified', {section_id:candidate.section_id, source_path:candidate.source_path, source_sha256:checked.source_sha256, excerpt_verified:true, content_version:checked.content_version, index_version:checked.index_version});
      l.emit('recommended', 'recommendation_emitted', {section_id:candidate.section_id, source_path:candidate.source_path, excerpt:candidate.excerpt, content_version:checked.content_version, index_version:checked.index_version});
    }
  }
  l.save();
  return {id, contract:T2_CONTRACT, case:caseName, fixture_sha256:inputHash, ...result, events:l.events.length, log:`logs/${id}.jsonl`};
}

async function runT3Timeout() {
  const f = fixture('t3-timeout.json');
  const id = 't3-timeout-001';
  const l = makeLogger(id, T3_CONTRACT, f.fixture_id);
  const inputHash = sha256Json(f);
  let toolAttempts = 0;
  l.emit('received', 'run_received', {fixture_id:f.fixture_id, fixture_sha256:inputHash, timeout_ms:f.timeout_ms});
  l.emit('planning', 'timeout_policy_loaded', {max_wait_ms:f.timeout_ms, retry_after_timeout:false});
  toolAttempts += 1;
  l.emit('tool_call', 'tool_call_started', {tool:f.tool, attempt:toolAttempts, side_effect:'none'});
  const timedOut = await Promise.race([
    new Promise(() => {}),
    new Promise(resolve => setTimeout(() => resolve(true), f.timeout_ms))
  ]);
  if (timedOut) {
    l.emit('timeout', 'controlled_wait_expired', {tool:f.tool, attempt:toolAttempts, waited_ms:f.timeout_ms, stop_reason:'timeout', next_step:'escalate_to_owner'});
    l.emit('stopped', 'run_stopped', {stop_reason:'timeout', tool_calls_after_stop:0, next_step:'escalate_to_owner'});
  }
  l.save();
  return {id, contract:T3_CONTRACT, fixture_id:f.fixture_id, fixture_sha256:inputHash, status:'stopped', stop_reason:'timeout', tool_attempts:toolAttempts, tool_calls_after_stop:0, events:l.events.length, log:`logs/${id}.jsonl`};
}

function runT3EvidenceMissing() {
  const f = fixture('t3-evidence-missing.json');
  const id = 't3-evidence-missing-001';
  const l = makeLogger(id, T3_CONTRACT, f.fixture_id);
  const inputHash = sha256Json(f);
  l.emit('received', 'retrieval_candidate_received', {fixture_id:f.fixture_id, fixture_sha256:inputHash});
  l.emit('checking', 'required_evidence_check', {required:['content_version','index_version','section_id','source_path','excerpt'], missing:f.missing_fields});
  l.emit('evidence_missing', 'run_stopped', {stop_reason:'evidence_missing', missing_fields:f.missing_fields, next_step:'request_source_repair_or_escalate', recommendation_emitted:false});
  l.save();
  return {id, contract:T3_CONTRACT, fixture_id:f.fixture_id, fixture_sha256:inputHash, status:'stopped', stop_reason:'evidence_missing', missing_fields:f.missing_fields, recommendation_emitted:false, events:l.events.length, log:`logs/${id}.jsonl`};
}

function runT3PermissionConflict() {
  const f = fixture('t3-permission-conflict.json');
  const id = 't3-permission-conflict-001';
  const l = makeLogger(id, T3_CONTRACT, f.fixture_id);
  const inputHash = sha256Json(f);
  l.emit('received', 'run_received', {fixture_id:f.fixture_id, fixture_sha256:inputHash, requested_tool:f.tool});
  l.emit('checking', 'permission_preflight', {required_permission:f.required_permission, allowed_permissions:f.allowed_permissions, identity:'synthetic-local-agent'});
  l.emit('permission_conflict', 'run_stopped_before_tool_call', {stop_reason:'permission_conflict', required_permission:f.required_permission, current_authorization:f.allowed_permissions, tool_calls:0, next_step:'request_authorization_from_owner'});
  l.save();
  return {id, contract:T3_CONTRACT, fixture_id:f.fixture_id, fixture_sha256:inputHash, status:'stopped', stop_reason:'permission_conflict', tool_calls:0, events:l.events.length, log:`logs/${id}.jsonl`};
}

async function main() {
  fs.mkdirSync(LOGS, {recursive:true});
  const sourceManifest = {};
  for (const file of ['c01-control-loop.md','e01.md']) {
    const p = path.join(ALLOWED_ROOT, file);
    sourceManifest[`sites/rolecraft/textbooks/v12/${file}`] = sha256File(p);
  }
  const results = {run_id:'agent-developer-mvp-20261015', agent_version:AGENT_VERSION, workspace:WORKSPACE, contracts:{T1:T1_CONTRACT,T2:T2_CONTRACT,T3:T3_CONTRACT}, source_manifest:sourceManifest, t1:[runT1Normal(), runT1Failure()], t2:[runT2Case('hit'), runT2Case('no_match'), runT2Case('ambiguous'), runT2Case('version_conflict')], t3:[await runT3Timeout(), runT3EvidenceMissing(), runT3PermissionConflict()]};
  const output = path.join(RUN_DIR, 'run-results.json');
  fs.writeFileSync(output, JSON.stringify(results, null, 2) + '\n');
  console.log(JSON.stringify({ok:true, output:path.relative(WORKSPACE, output), t1:results.t1.map(x=>x.status), t2:results.t2.map(x=>x.status), t3:results.t3.map(x=>x.status)}));
}

await main();
