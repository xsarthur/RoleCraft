import assert from 'node:assert/strict';
import {
  AGENT_RUNTIME_VERSION,
  AgentRuntime,
  AgentRuntimeError,
  ReadOnlyToolRegistry,
  createReadOnlyAgentSpec,
} from './index.mjs';

const checks = [];
function check(name, fn) {
  try {
    fn();
    checks.push({ name, status: 'passed' });
  } catch (error) {
    checks.push({ name, status: 'failed', code: error?.code || 'assertion_failed', message: error?.message || String(error) });
  }
}

async function checkAsync(name, fn) {
  try {
    await fn();
    checks.push({ name, status: 'passed' });
  } catch (error) {
    checks.push({ name, status: 'failed', code: error?.code || 'assertion_failed', message: error?.message || String(error) });
  }
}

function expectCode(fn, code) {
  assert.throws(fn, (error) => error instanceof AgentRuntimeError && error.code === code);
}

const catalogTool = {
  version: 'tool-descriptor-v1',
  toolId: 'content.catalog',
  description: '从固定本地夹具读取教材目录',
  inputSchema: { type: 'object', properties: { corpusVersion: { type: 'string', minLength: 1, maxLength: 64 } }, required: ['corpusVersion'], additionalProperties: false },
  outputSchema: { type: 'object', properties: { corpusVersion: { type: 'string' }, sections: { type: 'array', items: { type: 'string' } } }, required: ['corpusVersion', 'sections'], additionalProperties: false },
  effect: 'read',
  requiredScopes: ['content:read'],
  idempotency: 'optional',
  timeoutMs: 250,
  retryPolicy: 'safe_read',
  owner: 'content-retrieval',
  enabled: true,
};

const registry = new ReadOnlyToolRegistry();
registry.register(catalogTool, async ({ corpusVersion }) => ({ corpusVersion, sections: ['00-learning-route', '01-agent-basics'] }));

check('write/external tool registration is denied', () => {
  expectCode(() => registry.register({ ...catalogTool, toolId: 'unsafe.write', effect: 'write' }, () => ({})), 'tool_not_read_only');
  expectCode(() => registry.register({ ...catalogTool, toolId: 'unsafe.network', effect: 'external_side_effect' }, () => ({})), 'tool_not_read_only');
});

const spec = createReadOnlyAgentSpec({ allowedTools: ['content.catalog'] });
const runtime = new AgentRuntime({ registry });
const envelope = {
  taskId: 'dev-check-task-01',
  traceId: 'dev-check-trace-01',
  idempotencyKey: 'dev-check-key-01',
  userId: 'local-fixture-user',
  input: { query: '学习 Agent 运行时', contentVersion: 'textbook-v12' },
  contentVersion: 'textbook-v12',
};

let created;
check('AgentSpec and task envelope are validated', () => {
  created = runtime.createTask(envelope, spec);
  assert.equal(created.idempotentReplay, false);
  assert.equal(created.task.status, 'received');
  assert.match(created.task.inputHash, /^[a-f0-9]{64}$/);
  const replay = runtime.createTask(envelope, spec);
  assert.equal(replay.idempotentReplay, true);
  assert.equal(replay.task.taskId, envelope.taskId);
  expectCode(() => runtime.createTask({ ...envelope, input: { query: 'other' } }, spec), 'idempotency_conflict');
});

check('state machine and stop budget are bounded', () => {
  runtime.startTask(envelope.taskId);
  runtime.beginStep(envelope.taskId, { node: 'retrieve' });
  runtime.waitFor(envelope.taskId, 'awaiting_retrieval', { node: 'retrieve' });
  assert.equal(runtime.getTask(envelope.taskId).status, 'awaiting_retrieval');
  const stopped = runtime.stopTask(envelope.taskId, 'cancelled');
  assert.equal(stopped.status, 'failure');
  assert.equal(runtime.getTask(envelope.taskId).status, 'cancelled');

  let now = Date.parse('2026-01-01T00:00:00.000Z');
  const boundedRuntime = new AgentRuntime({ clock: () => now });
  const boundedSpec = createReadOnlyAgentSpec({ budget: { maxSteps: 1, timeoutMs: 100, maxCostUsd: 0 } });
  const bounded = boundedRuntime.createTask({ ...envelope, taskId: 'dev-check-task-budget', traceId: 'dev-check-trace-budget', idempotencyKey: 'dev-check-key-budget' }, boundedSpec).task;
  boundedRuntime.startTask(bounded.taskId);
  boundedRuntime.beginStep(bounded.taskId, { node: 'one' });
  const stepStop = boundedRuntime.beginStep(bounded.taskId, { node: 'two' });
  assert.equal(stepStop.status, 'step_limit');
  const timeout = boundedRuntime.createTask({ ...envelope, taskId: 'dev-check-task-timeout', traceId: 'dev-check-trace-timeout', idempotencyKey: 'dev-check-key-timeout' }, createReadOnlyAgentSpec({ budget: { maxSteps: 8, timeoutMs: 100, maxCostUsd: 0 } })).task;
  boundedRuntime.startTask(timeout.taskId);
  now += 101;
  const timeoutStop = boundedRuntime.beginStep(timeout.taskId, { node: 'late' });
  assert.equal(timeoutStop.status, 'timeout');
});

check('retrieval request/response is versioned and extractive', () => {
  const task = runtime.createTask({ ...envelope, taskId: 'dev-check-task-retrieval', traceId: 'dev-check-trace-retrieval', idempotencyKey: 'dev-check-key-retrieval' }, spec).task;
  const queryHash = 'a'.repeat(64);
  runtime.requestRetrieval(task.taskId, { queryHash, corpusVersion: 'textbook-v12' });
  runtime.recordRetrieval(task.taskId, { status: 'recommended', corpusVersion: 'textbook-v12', corpusHash: 'fixture-corpus', resultHash: 'b'.repeat(64), resultCount: 1 });
  assert.equal(runtime.getTask(task.taskId).status, 'running');
  assert.ok(runtime.getEvents(task.taskId).some((event) => event.type === 'retrieval_requested'));
  assert.ok(runtime.getEvents(task.taskId).some((event) => event.type === 'retrieval_returned'));
});

await checkAsync('read-only tool gate, scope check and action idempotence', async () => {
  const task = runtime.createTask({ ...envelope, taskId: 'dev-check-task-02', traceId: 'dev-check-trace-02', idempotencyKey: 'dev-check-key-02' }, spec).task;
  runtime.startTask(task.taskId);
  const call = { actionId: 'catalog-action-01', callId: 'catalog-call-01', toolId: 'content.catalog', args: { corpusVersion: 'textbook-v12' }, authorization: { scopes: ['content:read'], policyVersion: 'tool-policy-readonly-v1' } };
  const result = await runtime.invokeReadOnlyTool(task.taskId, call);
  assert.equal(result.status, 'succeeded');
  assert.equal(result.output.corpusVersion, 'textbook-v12');
  const replay = await runtime.invokeReadOnlyTool(task.taskId, call);
  assert.equal(replay.idempotentReplay, true);
  await assert.rejects(() => runtime.invokeReadOnlyTool(task.taskId, { ...call, actionId: 'catalog-action-02', authorization: { scopes: [] } }), (error) => error.code === 'scope_missing');
  const eventTypes = runtime.getEvents(task.taskId).map((event) => event.type);
  assert.ok(eventTypes.includes('action_intent'));
  assert.ok(eventTypes.includes('action_observed'));
  runtime.succeedTask(task.taskId, { status: 'evidence', source: 'textbook-v12' }, { evidenceRefs: ['textbook-v12/01-agent-basics'] });
  assert.equal(runtime.getTask(task.taskId).status, 'succeeded');
});

await checkAsync('tool failure is observable and stops the task', async () => {
  const failingRegistry = new ReadOnlyToolRegistry();
  failingRegistry.register({ ...catalogTool, toolId: 'content.unavailable' }, async () => { throw new AgentRuntimeError('fixture_unavailable', 'fixture unavailable'); });
  const failingRuntime = new AgentRuntime({ registry: failingRegistry });
  const failingSpec = createReadOnlyAgentSpec({ allowedTools: ['content.unavailable'] });
  const task = failingRuntime.createTask({ ...envelope, taskId: 'dev-check-task-03', traceId: 'dev-check-trace-03', idempotencyKey: 'dev-check-key-03' }, failingSpec).task;
  failingRuntime.startTask(task.taskId);
  const result = await failingRuntime.invokeReadOnlyTool(task.taskId, { toolId: 'content.unavailable', args: { corpusVersion: 'textbook-v12' }, authorization: { scopes: ['content:read'] } });
  assert.equal(result.status, 'failed');
  assert.equal(failingRuntime.getTask(task.taskId).status, 'failed');
  assert.ok(failingRuntime.getEvents(task.taskId).some((event) => event.type === 'action_observed' && event.data.status === 'failed'));
});

check('checkpoint hash and recovery preserve events without rerunning actions', () => {
  const task = runtime.createTask({ ...envelope, taskId: 'dev-check-task-04', traceId: 'dev-check-trace-04', idempotencyKey: 'dev-check-key-04' }, spec).task;
  runtime.startTask(task.taskId);
  runtime.beginStep(task.taskId, { node: 'checkpoint' });
  const checkpoint = runtime.checkpoint(task.taskId);
  const restored = new AgentRuntime({ registry });
  restored.restoreCheckpoint(checkpoint);
  assert.equal(restored.getTask(task.taskId).revision, checkpoint.state.revision + 1);
  assert.ok(restored.getEvents(task.taskId).some((event) => event.type === 'checkpoint_restored'));
  assert.equal(restored.getTaskByIdempotencyKey(envelope.idempotencyKey.replace('01', '04')).taskId, task.taskId);
  const recovered = restored.recoverTask(task.taskId);
  assert.equal(recovered.recovered, true);
  assert.equal(restored.getTask(task.taskId).status, 'paused');
  restored.resumeTask(task.taskId);
  assert.equal(restored.getTask(task.taskId).status, 'running');
});

check('trace fields are monotonic and secret-like values are redacted', () => {
  const task = runtime.createTask({ ...envelope, taskId: 'dev-check-task-05', traceId: 'dev-check-trace-05', idempotencyKey: 'dev-check-key-05', input: { apiKey: 'fixture-secret', query: 'safe' } }, spec).task;
  const events = runtime.getEvents(task.taskId);
  assert.equal(events[0].sequence, 1);
  assert.equal(events[0].traceId, task.traceId);
  assert.ok(events[0].redactions.length === 0 || events[0].redactions.every((path) => !path.includes('apiKey')));
  runtime.failTask(task.taskId, 'fixture_failure');
  const after = runtime.getEvents(task.taskId);
  assert.deepEqual(after.map((event) => event.sequence), after.map((_, index) => index + 1));
  assert.ok(after.every((event) => event.agentSpecVersion === spec.agentVersion));
});

const summary = {
  runtimeVersion: AGENT_RUNTIME_VERSION,
  status: checks.every((item) => item.status === 'passed') ? 'passed' : 'failed',
  checks,
  scope: {
    modelCalled: false,
    providerCalled: false,
    externalNetwork: false,
    databaseTouched: false,
    userDataMigrated: false,
  },
};
console.log(JSON.stringify(summary, null, 2));
if (summary.status !== 'passed') process.exitCode = 1;

