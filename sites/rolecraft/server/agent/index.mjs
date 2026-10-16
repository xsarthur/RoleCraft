/**
 * Rolecraft Agent runtime, offline/read-only stage 1.
 *
 * This module deliberately has no HTTP, model, database, network or filesystem
 * dependency.  It is an in-memory state and policy skeleton for local fixtures.
 * The existing generation and retrieval services are not imported here; they
 * can be connected later through the ToolRegistry contract owned by their
 * respective teams.
 */

import { createHash, randomUUID } from 'node:crypto';

export const AGENT_RUNTIME_VERSION = 'agent-runtime-0.1.0';
export const AGENT_SPEC_SCHEMA_VERSION = 'agent-spec-v1';
export const TOOL_DESCRIPTOR_VERSION = 'tool-descriptor-v1';

export const AGENT_STATES = Object.freeze([
  'received',
  'running',
  'awaiting_model',
  'awaiting_retrieval',
  'awaiting_tool',
  'awaiting_confirmation',
  'committing',
  'succeeded',
  'failed',
  'cancelled',
  'paused',
  'needs_clarification',
  'unknown_effect',
]);

const TERMINAL_STATES = new Set(['succeeded', 'failed', 'cancelled']);
const WAITING_STATES = new Set([
  'awaiting_model',
  'awaiting_retrieval',
  'awaiting_tool',
  'awaiting_confirmation',
  'needs_clarification',
]);
const TRANSITIONS = Object.freeze({
  received: new Set(['running', 'paused', 'failed', 'cancelled']),
  running: new Set([
    'awaiting_model',
    'awaiting_retrieval',
    'awaiting_tool',
    'awaiting_confirmation',
    'committing',
    'succeeded',
    'failed',
    'cancelled',
    'paused',
    'needs_clarification',
  ]),
  awaiting_model: new Set(['running', 'committing', 'failed', 'cancelled', 'paused', 'needs_clarification']),
  awaiting_retrieval: new Set(['running', 'awaiting_tool', 'committing', 'succeeded', 'failed', 'cancelled', 'paused', 'needs_clarification']),
  awaiting_tool: new Set(['running', 'committing', 'failed', 'cancelled', 'paused', 'unknown_effect']),
  awaiting_confirmation: new Set(['running', 'failed', 'cancelled', 'paused']),
  committing: new Set(['succeeded', 'failed', 'paused']),
  paused: new Set(['running', 'cancelled', 'failed']),
  needs_clarification: new Set(['running', 'cancelled', 'paused']),
  unknown_effect: new Set(['paused', 'failed']),
  succeeded: new Set(),
  failed: new Set(),
  cancelled: new Set(),
});

const STOP_STATUSES = new Set([
  'success',
  'failure',
  'waiting',
  'needs_clarification',
  'no_progress',
  'budget_exceeded',
  'step_limit',
  'timeout',
]);

const TASK_TYPES = new Set(['content_guidance', 'chapter_generation', 'product_workflow']);
const ID_RE = /^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,127}$/;
const SECRET_KEY_RE = /(api[_-]?key|authorization|cookie|password|secret|token|credential)/i;

export class AgentRuntimeError extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.name = 'AgentRuntimeError';
    this.code = code;
    Object.assign(this, details);
  }
}

function fail(code, message, details = {}) {
  throw new AgentRuntimeError(code, message, details);
}

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function assertObject(value, label) {
  if (!isObject(value)) fail('invalid_input', `${label} 必须是对象`);
}

function assertString(value, label, { min = 1, max = 256, pattern = null } = {}) {
  if (typeof value !== 'string' || value.length < min || value.length > max || (pattern && !pattern.test(value))) {
    fail('invalid_input', `${label} 格式无效`);
  }
}

function clone(value) {
  if (value === undefined) return undefined;
  return structuredClone(value);
}

/** Stable JSON used for input, action, checkpoint and event hashes. */
export function canonicalize(value) {
  if (value === undefined) return 'undefined';
  if (value === null || typeof value !== 'object') {
    if (typeof value === 'number' && !Number.isFinite(value)) fail('invalid_input', '输入不能包含非有限数字');
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) return `[${value.map((item) => canonicalize(item)).join(',')}]`;
  const keys = Object.keys(value).sort();
  return `{${keys.map((key) => `${JSON.stringify(key)}:${canonicalize(value[key])}`).join(',')}}`;
}

export function sha256(value) {
  const encoded = typeof value === 'string' ? value : canonicalize(value);
  return createHash('sha256').update(encoded).digest('hex');
}

function cloneAndRedact(value, redactions, path = '') {
  if (value === null || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.slice(0, 32).map((item, index) => cloneAndRedact(item, redactions, `${path}[${index}]`));
  const result = {};
  for (const [key, item] of Object.entries(value)) {
    const keyPath = path ? `${path}.${key}` : key;
    if (SECRET_KEY_RE.test(key)) {
      result[key] = '[REDACTED]';
      redactions.push(keyPath);
    } else {
      result[key] = cloneAndRedact(item, redactions, keyPath);
    }
  }
  return result;
}

function publicEventData(data) {
  const redactions = [];
  let result = cloneAndRedact(data ?? {}, redactions);
  if (!isObject(result)) result = { value: result };
  // Trace data is diagnostic metadata, never the complete user input/output.
  const encoded = canonicalize(result);
  if (encoded.length > 8192) {
    result = { dataHash: sha256(encoded), truncated: true };
    redactions.push('data');
  }
  return { result, redactions };
}

function validateStringArray(value, label, { maxItems = 64, itemMax = 256, allowEmpty = true } = {}) {
  if (!Array.isArray(value) || value.length > maxItems || (!allowEmpty && value.length === 0)) fail('invalid_input', `${label} 必须是字符串数组`);
  for (const item of value) assertString(item, `${label} 项`, { min: allowEmpty ? 0 : 1, max: itemMax });
}

function validateBudget(budget, label = 'budget') {
  assertObject(budget, label);
  if (!Number.isInteger(budget.maxSteps) || budget.maxSteps < 1 || budget.maxSteps > 100) fail('invalid_input', `${label}.maxSteps 超出范围`);
  if (!Number.isInteger(budget.timeoutMs) || budget.timeoutMs < 100 || budget.timeoutMs > 3_600_000) fail('invalid_input', `${label}.timeoutMs 超出范围`);
  if (budget.maxCostUsd !== undefined && (!Number.isFinite(budget.maxCostUsd) || budget.maxCostUsd < 0 || budget.maxCostUsd > 1000)) fail('invalid_input', `${label}.maxCostUsd 超出范围`);
  return {
    maxSteps: budget.maxSteps,
    timeoutMs: budget.timeoutMs,
    ...(budget.maxCostUsd === undefined ? {} : { maxCostUsd: budget.maxCostUsd }),
  };
}

/**
 * Validate and normalize the architecture's AgentSpec.  No model provider is
 * selected by this function; modelPolicyId is only a versioned policy handle.
 */
export function validateAgentSpec(input) {
  assertObject(input, 'AgentSpec');
  if (input.schemaVersion !== AGENT_SPEC_SCHEMA_VERSION) fail('spec_version_unsupported', `仅支持 ${AGENT_SPEC_SCHEMA_VERSION}`);
  for (const field of ['agentId', 'agentVersion', 'modelPolicyId', 'retrievalPolicyId', 'toolPolicyId', 'memoryPolicyId', 'stateSchemaId']) {
    assertString(input[field], `AgentSpec.${field}`, { pattern: ID_RE });
  }
  assertString(input.taskType, 'AgentSpec.taskType', { pattern: ID_RE });
  if (!TASK_TYPES.has(input.taskType)) fail('invalid_input', `不支持的 taskType：${input.taskType}`);
  assertObject(input.goal, 'AgentSpec.goal');
  assertString(input.goal.text, 'AgentSpec.goal.text', { max: 2000 });
  validateStringArray(input.goal.successCriteria, 'AgentSpec.goal.successCriteria', { allowEmpty: false, maxItems: 32 });
  validateStringArray(input.goal.stopCriteria, 'AgentSpec.goal.stopCriteria', { allowEmpty: false, maxItems: 32 });
  const budget = validateBudget(input.budget, 'AgentSpec.budget');
  validateStringArray(input.allowedTools, 'AgentSpec.allowedTools', { maxItems: 64, itemMax: 128 });
  validateStringArray(input.allowedSources, 'AgentSpec.allowedSources', { maxItems: 128, itemMax: 256 });
  assertObject(input.outputContract, 'AgentSpec.outputContract');
  if (input.outputContract.type !== 'json') fail('invalid_input', 'AgentSpec.outputContract.type 必须为 json');
  assertString(input.outputContract.schemaId, 'AgentSpec.outputContract.schemaId', { pattern: ID_RE });
  const normalized = {
    schemaVersion: AGENT_SPEC_SCHEMA_VERSION,
    agentId: input.agentId,
    agentVersion: input.agentVersion,
    taskType: input.taskType,
    goal: {
      text: input.goal.text,
      successCriteria: [...input.goal.successCriteria],
      stopCriteria: [...input.goal.stopCriteria],
    },
    modelPolicyId: input.modelPolicyId,
    retrievalPolicyId: input.retrievalPolicyId,
    toolPolicyId: input.toolPolicyId,
    memoryPolicyId: input.memoryPolicyId,
    stateSchemaId: input.stateSchemaId,
    budget,
    allowedTools: [...new Set(input.allowedTools)],
    allowedSources: [...new Set(input.allowedSources)],
    outputContract: { type: 'json', schemaId: input.outputContract.schemaId },
  };
  return Object.freeze(normalized);
}

export function createReadOnlyAgentSpec(overrides = {}) {
  return validateAgentSpec({
    schemaVersion: AGENT_SPEC_SCHEMA_VERSION,
    agentId: 'rolecraft-learning-agent',
    agentVersion: '0.1.0',
    taskType: 'content_guidance',
    goal: {
      text: '依据当前已核验教材版本定位可引用的学习内容',
      successCriteria: ['返回版本绑定的只读证据或明确无匹配/需澄清'],
      stopCriteria: ['来源版本不一致', '达到步数或时间预算', '无法确认目标'],
    },
    modelPolicyId: 'model-policy-offline-unavailable-v1',
    retrievalPolicyId: 'retrieval-policy-local-readonly-v1',
    toolPolicyId: 'tool-policy-readonly-v1',
    memoryPolicyId: 'memory-policy-none-v1',
    stateSchemaId: 'agent-state-v1',
    budget: { maxSteps: 8, timeoutMs: 30_000, maxCostUsd: 0 },
    allowedTools: [],
    allowedSources: ['textbook-v12'],
    outputContract: { type: 'json', schemaId: 'content-evidence-v1' },
    ...overrides,
  });
}

function validateJsonSchemaValue(value, schema, path = 'args') {
  if (!isObject(schema)) fail('tool_schema_invalid', '工具 schema 必须是对象');
  if (schema.type) {
    const valid = schema.type === 'object' ? isObject(value)
      : schema.type === 'array' ? Array.isArray(value)
        : schema.type === 'string' ? typeof value === 'string'
          : schema.type === 'number' ? typeof value === 'number' && Number.isFinite(value)
            : schema.type === 'integer' ? Number.isInteger(value)
              : schema.type === 'boolean' ? typeof value === 'boolean' : true;
    if (!valid) fail('tool_args_invalid', `${path} 类型不符合工具 schema`);
  }
  if (Array.isArray(schema.enum) && !schema.enum.some((item) => canonicalize(item) === canonicalize(value))) fail('tool_args_invalid', `${path} 不在工具允许范围`);
  if (schema.type === 'string') {
    if (schema.minLength !== undefined && value.length < schema.minLength) fail('tool_args_invalid', `${path} 太短`);
    if (schema.maxLength !== undefined && value.length > schema.maxLength) fail('tool_args_invalid', `${path} 太长`);
  }
  if (schema.type === 'object' && isObject(value)) {
    const properties = isObject(schema.properties) ? schema.properties : {};
    for (const required of schema.required || []) if (!(required in value)) fail('tool_args_invalid', `${path}.${required} 为必填`);
    if (schema.additionalProperties === false) for (const key of Object.keys(value)) if (!(key in properties)) fail('tool_args_invalid', `${path}.${key} 不允许`);
    for (const [key, child] of Object.entries(properties)) if (key in value) validateJsonSchemaValue(value[key], child, `${path}.${key}`);
  }
  if (schema.type === 'array' && Array.isArray(value) && schema.items) for (let i = 0; i < value.length; i += 1) validateJsonSchemaValue(value[i], schema.items, `${path}[${i}]`);
}

export function validateToolDescriptor(input) {
  assertObject(input, 'ToolDescriptor');
  if (input.version !== TOOL_DESCRIPTOR_VERSION) fail('tool_version_unsupported', `仅支持 ${TOOL_DESCRIPTOR_VERSION}`);
  for (const field of ['toolId', 'description', 'owner']) assertString(input[field], `ToolDescriptor.${field}`, { max: field === 'description' ? 2000 : 128 });
  if (input.effect !== 'read') fail('tool_not_read_only', `第一阶段拒绝 ${input.effect || 'unknown'} 工具`);
  if (input.enabled !== true) fail('tool_disabled', `工具 ${input.toolId} 未启用`);
  assertObject(input.inputSchema, 'ToolDescriptor.inputSchema');
  assertObject(input.outputSchema, 'ToolDescriptor.outputSchema');
  validateStringArray(input.requiredScopes, 'ToolDescriptor.requiredScopes', { maxItems: 16, itemMax: 128 });
  if (!['required', 'optional', 'none'].includes(input.idempotency)) fail('invalid_input', 'ToolDescriptor.idempotency 无效');
  if (!Number.isInteger(input.timeoutMs) || input.timeoutMs < 1 || input.timeoutMs > 60_000) fail('invalid_input', 'ToolDescriptor.timeoutMs 超出范围');
  if (!['never', 'safe_read', 'query_then_decide'].includes(input.retryPolicy)) fail('invalid_input', 'ToolDescriptor.retryPolicy 无效');
  return Object.freeze({
    version: TOOL_DESCRIPTOR_VERSION,
    toolId: input.toolId,
    description: input.description,
    inputSchema: clone(input.inputSchema),
    outputSchema: clone(input.outputSchema),
    effect: 'read',
    requiredScopes: [...new Set(input.requiredScopes)],
    idempotency: input.idempotency,
    timeoutMs: input.timeoutMs,
    retryPolicy: input.retryPolicy,
    owner: input.owner,
    enabled: true,
  });
}

/** Registry deliberately rejects write/external tools at registration time. */
export class ReadOnlyToolRegistry {
  #tools = new Map();

  register(descriptor, handler) {
    const normalized = validateToolDescriptor(descriptor);
    if (typeof handler !== 'function') fail('tool_handler_invalid', `工具 ${normalized.toolId} 缺少离线处理器`);
    if (this.#tools.has(normalized.toolId)) fail('tool_duplicate', `工具已注册：${normalized.toolId}`);
    this.#tools.set(normalized.toolId, { descriptor: normalized, handler });
    return clone(normalized);
  }

  get(toolId) {
    const item = this.#tools.get(toolId);
    return item ? clone(item.descriptor) : null;
  }

  list() {
    return [...this.#tools.values()].map(({ descriptor }) => clone(descriptor));
  }

  #entry(toolId) {
    const item = this.#tools.get(toolId);
    if (!item) fail('tool_not_found', `工具不存在：${toolId}`);
    return item;
  }

  async execute(toolId, args, { signal } = {}) {
    const { descriptor, handler } = this.#entry(toolId);
    if (descriptor.effect !== 'read') fail('tool_not_read_only', `工具 ${toolId} 不是只读工具`);
    validateJsonSchemaValue(args, descriptor.inputSchema);
    if (signal?.aborted) fail('cancelled', '工具调用在执行前已取消');
    let timer;
    const timeout = new Promise((_, reject) => {
      timer = setTimeout(() => reject(new AgentRuntimeError('tool_timeout', `工具 ${toolId} 超时`)), descriptor.timeoutMs);
    });
    try {
      const result = await Promise.race([Promise.resolve().then(() => handler(clone(args), { signal })), timeout]);
      validateJsonSchemaValue(result, descriptor.outputSchema, 'output');
      return clone(result);
    } finally {
      clearTimeout(timer);
    }
  }
}

function validateEnvelope(input, spec) {
  assertObject(input, 'AgentTaskEnvelope');
  const taskId = input.taskId || randomUUID();
  assertString(taskId, 'taskId', { pattern: ID_RE });
  const traceId = input.traceId || randomUUID();
  assertString(traceId, 'traceId', { pattern: ID_RE });
  assertString(input.idempotencyKey, 'idempotencyKey', { max: 256 });
  assertString(input.userId, 'userId', { pattern: ID_RE });
  if (input.careerId !== undefined) assertString(input.careerId, 'careerId', { pattern: ID_RE });
  if (input.agentSpecId !== undefined && input.agentSpecId !== spec.agentId) fail('spec_mismatch', '任务 agentSpecId 与 AgentSpec 不一致');
  if (input.agentSpecVersion !== undefined && input.agentSpecVersion !== spec.agentVersion) fail('spec_mismatch', '任务 agentSpecVersion 与 AgentSpec 不一致');
  const budget = validateBudget(input.budget || spec.budget, 'AgentTaskEnvelope.budget');
  const inputHash = input.inputHash || sha256(input.input);
  assertString(inputHash, 'inputHash', { max: 64, pattern: /^[a-f0-9]{64}$/ });
  if (input.inputHash && input.inputHash !== sha256(input.input)) fail('input_hash_mismatch', 'inputHash 与输入不一致');
  if (input.contentVersion !== undefined) assertString(input.contentVersion, 'contentVersion', { max: 128 });
  if (input.sourceHash !== undefined) assertString(input.sourceHash, 'sourceHash', { max: 128 });
  if (input.contentVersion !== undefined && spec.allowedSources.length > 0 && !spec.allowedSources.includes(input.contentVersion)) fail('source_version_not_allowed', '任务教材版本不在 AgentSpec 允许来源内');
  return {
    taskId,
    traceId,
    idempotencyKey: input.idempotencyKey,
    userId: input.userId,
    ...(input.careerId === undefined ? {} : { careerId: input.careerId }),
    agentSpecId: spec.agentId,
    agentSpecVersion: spec.agentVersion,
    inputHash,
    budget,
    ...(input.contentVersion === undefined ? {} : { contentVersion: input.contentVersion }),
    ...(input.sourceHash === undefined ? {} : { sourceHash: input.sourceHash }),
  };
}

function idempotencyIndexKey(userId, key) {
  return `${userId}\u0000${key}`;
}

/** Public envelope validator for adapters and independent QA fixtures. */
export function validateTaskEnvelope(input, agentSpec = createReadOnlyAgentSpec()) {
  return validateEnvelope(input, validateAgentSpec(agentSpec));
}

function stopDecision(status, reasonCode, details = {}) {
  if (!STOP_STATUSES.has(status)) fail('invalid_input', `无效停止状态：${status}`);
  return {
    status,
    reasonCode,
    evidenceRefs: Array.isArray(details.evidenceRefs) ? [...details.evidenceRefs] : [],
    nextAction: details.nextAction || (status === 'needs_clarification' ? 'ask_user' : status === 'success' ? 'none' : 'none'),
    ...(details.message ? { message: details.message } : {}),
  };
}

function stateHash(state) {
  const { input, ...publicState } = state;
  return sha256(publicState);
}

export class AgentRuntime {
  #tasks = new Map();
  #idempotency = new Map();
  #registry;
  #clock;
  #idFactory;

  constructor({ registry = new ReadOnlyToolRegistry(), clock = () => Date.now(), idFactory = randomUUID } = {}) {
    this.#registry = registry;
    this.#clock = clock;
    this.#idFactory = idFactory;
  }

  get registry() {
    return this.#registry;
  }

  createTask(envelope, agentSpec = createReadOnlyAgentSpec()) {
    const spec = validateAgentSpec(agentSpec);
    const normalized = validateEnvelope(envelope, spec);
    const indexKey = idempotencyIndexKey(normalized.userId, normalized.idempotencyKey);
    const idempotencyHash = sha256({ key: normalized.idempotencyKey, userId: normalized.userId, inputHash: normalized.inputHash, agentSpecVersion: spec.agentVersion });
    const previousId = this.#idempotency.get(indexKey);
    if (previousId) {
      const previous = this.#tasks.get(previousId);
      if (previous && previous.idempotencyHash !== idempotencyHash) fail('idempotency_conflict', 'idempotencyKey 已绑定不同任务输入');
      return { task: this.getTask(previousId), idempotentReplay: true };
    }
    if (this.#tasks.has(normalized.taskId)) fail('task_duplicate', `任务已存在：${normalized.taskId}`);
    const now = new Date(this.#clock()).toISOString();
    const state = {
      taskId: normalized.taskId,
      traceId: normalized.traceId,
      runId: normalized.traceId,
      run_id: normalized.traceId,
      agentSpecId: spec.agentId,
      agentSpecVersion: spec.agentVersion,
      agentVersion: spec.agentVersion,
      agentSpecHash: sha256(spec),
      schemaVersion: 'agent-state-v1',
      userId: normalized.userId,
      ...(normalized.careerId === undefined ? {} : { careerId: normalized.careerId }),
      ...(normalized.contentVersion === undefined ? {} : { contentVersion: normalized.contentVersion }),
      ...(normalized.sourceHash === undefined ? {} : { sourceHash: normalized.sourceHash }),
      inputHash: normalized.inputHash,
      idempotencyKeyHash: sha256(normalized.idempotencyKey),
      status: 'received',
      revision: 0,
      step: 0,
      goal: clone(spec.goal),
      budget: normalized.budget,
      usage: { costUsd: 0, tokens: 0 },
      facts: [],
      plan: null,
      pendingActions: [],
      checkpoints: [],
      consumedVersions: {},
      stopDecision: null,
      createdAt: now,
      updatedAt: now,
    };
    const task = { state, spec, events: [], actions: new Map(), idempotencyHash, idempotencyKey: normalized.idempotencyKey, idempotencyIndexKey: indexKey, input: clone(envelope.input) };
    this.#tasks.set(state.taskId, task);
    this.#idempotency.set(indexKey, state.taskId);
    this.#event(task, 'task_received', { inputHash: state.inputHash, idempotencyKeyHash: state.idempotencyKeyHash });
    return { task: this.getTask(state.taskId), idempotentReplay: false };
  }

  #task(taskId) {
    const task = this.#tasks.get(taskId);
    if (!task) fail('task_not_found', `任务不存在：${taskId}`);
    return task;
  }

  #event(task, type, data = {}, { bumpRevision = false } = {}) {
    const { result, redactions } = publicEventData(data);
    if (bumpRevision) {
      task.state.revision += 1;
      task.state.updatedAt = new Date(this.#clock()).toISOString();
    }
    const event = {
      traceId: task.state.traceId,
      runId: task.state.runId,
      trace_id: task.state.traceId,
      run_id: task.state.runId,
      taskId: task.state.taskId,
      task_id: task.state.taskId,
      sequence: task.events.length + 1,
      at: new Date(this.#clock()).toISOString(),
      type,
      agentSpecVersion: task.state.agentSpecVersion,
      agentSpecHash: task.state.agentSpecHash,
      agentVersion: task.state.agentSpecVersion,
      agent_version: task.state.agentSpecVersion,
      stateRevision: task.state.revision,
      state_revision: task.state.revision,
      step: task.state.step,
      data: result,
      redactions,
    };
    task.events.push(event);
    return clone(event);
  }

  #transition(task, next, details = {}) {
    const current = task.state.status;
    if (current === next) return this.getTask(task.state.taskId);
    if (!AGENT_STATES.includes(next)) fail('state_invalid', `未知状态：${next}`);
    if (!TRANSITIONS[current]?.has(next)) fail('invalid_transition', `${current} 不能转移到 ${next}`);
    task.state.status = next;
    if (details.stopDecision) task.state.stopDecision = clone(details.stopDecision);
    this.#event(task, 'state_changed', { from: current, to: next, reasonCode: details.reasonCode || null }, { bumpRevision: true });
    return this.getTask(task.state.taskId);
  }

  getTask(taskId) {
    const task = this.#task(taskId);
    return clone(task.state);
  }

  getEvents(taskId) {
    const task = this.#task(taskId);
    return clone(task.events);
  }

  listTasks() {
    return [...this.#tasks.values()].map((task) => clone(task.state));
  }

  getTaskByIdempotencyKey(key, userId = null) {
    assertString(key, 'idempotencyKey', { max: 256 });
    const matches = userId
      ? [this.#idempotency.get(idempotencyIndexKey(userId, key))].filter(Boolean)
      : [...this.#idempotency.entries()].filter(([indexKey]) => indexKey.endsWith(`\u0000${key}`)).map(([, taskId]) => taskId);
    if (!userId && matches.length > 1) fail('idempotency_scope_required', '多个用户使用了同一 idempotencyKey，请提供 userId');
    const taskId = matches[0];
    return taskId ? this.getTask(taskId) : null;
  }

  startTask(taskId) {
    const task = this.#task(taskId);
    if (task.state.status === 'paused' && task.state.pendingActions.some((action) => ['sent', 'unknown', 'intent'].includes(action.status))) fail('recovery_requires_effect_check', '存在未确认动作，不能从 paused 直接启动');
    if (task.state.status === 'received' || task.state.status === 'paused') this.#transition(task, 'running', { reasonCode: 'start' });
    else if (task.state.status !== 'running') fail('state_invalid', `任务当前不能启动：${task.state.status}`);
    this.#event(task, 'task_started', {});
    return this.getTask(taskId);
  }

  beginStep(taskId, { node = null } = {}) {
    const task = this.#task(taskId);
    if (task.state.status === 'received' || task.state.status === 'paused') this.startTask(taskId);
    if (task.state.status !== 'running') fail('state_invalid', `任务当前不能推进：${task.state.status}`);
    const elapsed = this.#clock() - Date.parse(task.state.createdAt);
    if (elapsed > task.state.budget.timeoutMs) return this.stopTask(taskId, 'timeout', { message: '任务超出时间预算' });
    if (task.state.step >= task.state.budget.maxSteps) return this.stopTask(taskId, 'step_limit', { message: '任务达到最大步数' });
    task.state.step += 1;
    task.state.updatedAt = new Date(this.#clock()).toISOString();
    this.#event(task, 'step_started', { node, step: task.state.step }, { bumpRevision: true });
    return this.getTask(taskId);
  }

  waitFor(taskId, state, details = {}) {
    const task = this.#task(taskId);
    if (!WAITING_STATES.has(state)) fail('invalid_input', `不是等待状态：${state}`);
    this.#transition(task, state, details);
    this.#event(task, 'wait_started', { state, node: details.node || null });
    return this.getTask(taskId);
  }

  /** Record a versioned retrieval request without implementing retrieval here. */
  requestRetrieval(taskId, { queryHash, corpusVersion, current = null } = {}) {
    const task = this.#task(taskId);
    assertString(queryHash, 'retrieval.queryHash', { max: 64, pattern: /^[a-f0-9]{64}$/ });
    assertString(corpusVersion, 'retrieval.corpusVersion', { max: 128 });
    if (task.state.status === 'received' || task.state.status === 'paused') this.startTask(taskId);
    if (task.state.status === 'running') this.#transition(task, 'awaiting_retrieval', { reasonCode: 'retrieval_requested' });
    if (task.state.status !== 'awaiting_retrieval') fail('state_invalid', `任务当前不能请求检索：${task.state.status}`);
    this.#event(task, 'retrieval_requested', {
      queryHash,
      corpusVersion,
      current: current && { unitId: current.unitId || null, sectionId: current.sectionId || null, sourceSha256: current.sourceSha256 || null },
    });
    return this.getTask(taskId);
  }

  /**
   * Accept only retrieval metadata.  The retrieval owner supplies the actual
   * evidence and source hashes; this runtime never fabricates result text.
   */
  recordRetrieval(taskId, { status, corpusVersion, corpusHash = null, resultHash = null, resultCount = 0 } = {}) {
    const task = this.#task(taskId);
    if (!['recommended', 'needs_clarification', 'no_match', 'unavailable', 'invalid_input'].includes(status)) fail('invalid_input', 'retrieval.status 无效');
    assertString(corpusVersion, 'retrieval.corpusVersion', { max: 128 });
    if (task.state.contentVersion && task.state.contentVersion !== corpusVersion) fail('source_version_mismatch', '检索版本与任务版本不一致');
    if (corpusHash !== null) assertString(corpusHash, 'retrieval.corpusHash', { max: 128 });
    if (resultHash !== null) assertString(resultHash, 'retrieval.resultHash', { max: 64, pattern: /^[a-f0-9]{64}$/ });
    if (!Number.isInteger(resultCount) || resultCount < 0 || resultCount > 1000) fail('invalid_input', 'retrieval.resultCount 无效');
    if (task.state.status !== 'awaiting_retrieval') fail('state_invalid', `任务当前没有等待检索：${task.state.status}`);
    this.#event(task, 'retrieval_returned', { status, corpusVersion, corpusHash, resultHash, resultCount });
    task.state.consumedVersions.corpus = corpusVersion;
    if (status === 'needs_clarification') {
      const decision = stopDecision('needs_clarification', 'retrieval_ambiguous', { nextAction: 'ask_user' });
      this.#transition(task, 'needs_clarification', { reasonCode: decision.reasonCode, stopDecision: decision });
    } else if (status === 'unavailable') {
      this.#transition(task, 'failed', { reasonCode: 'retrieval_unavailable', stopDecision: stopDecision('failure', 'retrieval_unavailable', { nextAction: 'retry_safe' }) });
    } else {
      this.#transition(task, 'running', { reasonCode: `retrieval_${status}` });
    }
    return this.getTask(taskId);
  }

  recordUsage(taskId, { costUsd = 0, tokens = 0 } = {}) {
    const task = this.#task(taskId);
    if (!Number.isFinite(costUsd) || costUsd < 0 || !Number.isFinite(tokens) || tokens < 0) fail('invalid_input', 'usage 必须是非负数');
    task.state.usage.costUsd += costUsd;
    task.state.usage.tokens += tokens;
    this.#event(task, 'usage_recorded', { costUsd, tokens }, { bumpRevision: true });
    if (task.state.budget.maxCostUsd !== undefined && task.state.usage.costUsd > task.state.budget.maxCostUsd) return this.stopTask(taskId, 'budget_exceeded', { message: '任务达到费用预算' });
    return this.getTask(taskId);
  }

  setConsumedVersion(taskId, name, version) {
    const task = this.#task(taskId);
    assertString(name, 'version name', { max: 128 });
    assertString(version, 'version', { max: 256 });
    task.state.consumedVersions[name] = version;
    this.#event(task, 'version_consumed', { name, version }, { bumpRevision: true });
    return this.getTask(taskId);
  }

  async invokeReadOnlyTool(taskId, call) {
    const task = this.#task(taskId);
    assertObject(call, 'ToolCall');
    assertString(call.toolId, 'ToolCall.toolId', { pattern: ID_RE });
    const descriptor = this.#registry.get(call.toolId);
    if (!descriptor) {
      this.#event(task, 'policy_decision', { decision: 'deny', reasonCode: 'tool_not_found', toolId: call.toolId });
      fail('tool_not_found', `工具不存在：${call.toolId}`);
    }
    if (descriptor.effect !== 'read') {
      this.#event(task, 'policy_decision', { decision: 'deny', reasonCode: 'tool_not_read_only', toolId: call.toolId });
      fail('tool_not_read_only', `工具 ${call.toolId} 不是只读工具`);
    }
    if (!task.spec.allowedTools.includes(call.toolId)) {
      this.#event(task, 'policy_decision', { decision: 'deny', reasonCode: 'tool_not_allowed', toolId: call.toolId });
      fail('tool_not_allowed', `AgentSpec 未允许工具：${call.toolId}`);
    }
    if (descriptor.idempotency === 'required' && !call.idempotencyKey) fail('idempotency_required', `工具 ${call.toolId} 需要 idempotencyKey`);
    const scopes = call.authorization?.scopes || [];
    if (!Array.isArray(scopes) || descriptor.requiredScopes.some((scope) => !scopes.includes(scope))) {
      this.#event(task, 'policy_decision', { decision: 'deny', reasonCode: 'scope_missing', toolId: call.toolId });
      fail('scope_missing', `工具 ${call.toolId} 缺少权限`);
    }
    validateJsonSchemaValue(call.args, descriptor.inputSchema);
    const actionId = call.actionId || call.idempotencyKey || this.#idFactory();
    assertString(actionId, 'ToolCall.actionId', { pattern: ID_RE });
    if (call.idempotencyKey !== undefined) assertString(call.idempotencyKey, 'ToolCall.idempotencyKey', { max: 256 });
    const argsHash = sha256(call.args);
    const prior = task.actions.get(actionId);
    if (prior) {
      if (prior.argsHash !== argsHash || prior.toolId !== call.toolId) fail('idempotency_conflict', 'actionId 已绑定不同工具调用');
      if (!prior.result) fail('action_in_progress', '相同 actionId 的只读调用仍在执行');
      return { ...clone(prior.result), idempotentReplay: true };
    }
    if (task.state.status === 'received' || task.state.status === 'paused') this.startTask(taskId);
    if (!['running', 'awaiting_retrieval', 'awaiting_tool'].includes(task.state.status)) fail('state_invalid', `任务当前不能调用工具：${task.state.status}`);
    if (task.state.status === 'running' || task.state.status === 'awaiting_retrieval') this.#transition(task, 'awaiting_tool', { reasonCode: 'read_only_tool' });
    const action = {
      actionId,
      callId: call.callId || this.#idFactory(),
      taskId,
      toolId: call.toolId,
      toolVersion: descriptor.version,
      argsHash,
      effect: 'read',
      status: 'intent',
      startedAt: new Date(this.#clock()).toISOString(),
    };
    task.actions.set(actionId, { ...action, result: null });
    task.state.pendingActions.push(action);
    this.#event(task, 'action_intent', { actionId, callId: action.callId, toolId: call.toolId, toolVersion: descriptor.version, effect: 'read', argsHash }, { bumpRevision: true });
    this.#event(task, 'action_sent', { actionId, toolId: call.toolId, effect: 'read' });
    let result;
    try {
      const output = await this.#registry.execute(call.toolId, call.args);
      result = { callId: action.callId, actionId, status: 'succeeded', output, toolId: call.toolId, startedAt: action.startedAt, endedAt: new Date(this.#clock()).toISOString() };
      action.status = 'succeeded';
      action.endedAt = result.endedAt;
      this.#event(task, 'action_observed', { actionId, callId: action.callId, toolId: call.toolId, status: 'succeeded', outputHash: sha256(output) }, { bumpRevision: true });
      const pending = task.state.pendingActions.find((item) => item.actionId === actionId);
      if (pending) pending.status = 'succeeded';
      task.actions.get(actionId).status = action.status;
      task.actions.get(actionId).endedAt = action.endedAt;
      if (task.state.status === 'awaiting_tool') this.#transition(task, 'running', { reasonCode: 'read_only_tool_succeeded' });
    } catch (error) {
      const code = error?.code === 'tool_timeout' ? 'timed_out' : error?.code === 'cancelled' ? 'cancelled' : 'failed';
      result = { callId: action.callId, actionId, status: code, errorCode: error?.code || 'tool_failed', toolId: call.toolId, startedAt: action.startedAt, endedAt: new Date(this.#clock()).toISOString() };
      action.status = code;
      action.endedAt = result.endedAt;
      const pending = task.state.pendingActions.find((item) => item.actionId === actionId);
      if (pending) pending.status = code;
      task.actions.get(actionId).status = action.status;
      task.actions.get(actionId).endedAt = action.endedAt;
      this.#event(task, 'action_observed', { actionId, callId: action.callId, toolId: call.toolId, status: code, errorCode: result.errorCode }, { bumpRevision: true });
      if (task.state.status === 'awaiting_tool') this.#transition(task, 'failed', { reasonCode: result.errorCode, stopDecision: stopDecision('failure', result.errorCode, { nextAction: 'retry_safe' }) });
    }
    task.actions.get(actionId).result = result;
    return clone(result);
  }

  markUnknownAction(taskId, actionId, reasonCode = 'runtime_interrupted') {
    const task = this.#task(taskId);
    const action = task.actions.get(actionId);
    if (!action) fail('action_not_found', `动作不存在：${actionId}`);
    if (['succeeded', 'failed', 'cancelled'].includes(action.status)) return this.getTask(taskId);
    action.status = 'unknown';
    const pending = task.state.pendingActions.find((item) => item.actionId === actionId);
    if (pending) pending.status = 'unknown';
    if (task.state.status !== 'unknown_effect') this.#transition(task, 'unknown_effect', { reasonCode });
    this.#event(task, 'action_effect_unknown', { actionId, toolId: action.toolId, reasonCode }, { bumpRevision: true });
    return this.getTask(taskId);
  }

  resolveUnknownAction(taskId, actionId, resolution) {
    const task = this.#task(taskId);
    const action = task.actions.get(actionId);
    if (!action || action.status !== 'unknown') fail('action_not_unknown', `动作不是 unknown 状态：${actionId}`);
    if (!['succeeded', 'failed'].includes(resolution)) fail('invalid_input', 'unknown action 只能由效果查询解析为 succeeded 或 failed');
    action.status = resolution;
    const pending = task.state.pendingActions.find((item) => item.actionId === actionId);
    if (pending) pending.status = resolution;
    this.#event(task, 'action_effect_resolved', { actionId, resolution }, { bumpRevision: true });
    if (task.state.status === 'unknown_effect') this.#transition(task, 'paused', { reasonCode: 'effect_resolved' });
    return this.getTask(taskId);
  }

  stopTask(taskId, reason = 'cancelled', details = {}) {
    const task = this.#task(taskId);
    const map = {
      // StopDecision has no separate cancelled value in the architecture
      // contract; the task status carries cancellation while the decision
      // remains a failure with an explicit cancelled reason code.
      cancelled: ['cancelled', 'failure'],
      timeout: ['failed', 'timeout'],
      step_limit: ['failed', 'step_limit'],
      budget_exceeded: ['failed', 'budget_exceeded'],
      no_progress: ['paused', 'no_progress'],
      failure: ['failed', 'failure'],
    };
    const [next, stopStatus] = map[reason] || map.cancelled;
    const decision = stopDecision(stopStatus, reason, details);
    if (TERMINAL_STATES.has(task.state.status)) return decision;
    if (task.state.status === 'unknown_effect' && next !== 'failed') {
      task.state.stopDecision = decision;
      this.#event(task, 'stop_decided', { status: decision.status, reasonCode: reason }, { bumpRevision: true });
      return decision;
    }
    this.#transition(task, next, { reasonCode: reason, stopDecision: decision });
    this.#event(task, next === 'cancelled' ? 'task_cancelled' : 'stop_decided', { status: decision.status, reasonCode: reason });
    return decision;
  }

  clarifyTask(taskId, question, details = {}) {
    const task = this.#task(taskId);
    assertString(question, 'clarification.question', { max: 2000 });
    const decision = stopDecision('needs_clarification', 'ambiguous_goal', { nextAction: 'ask_user', evidenceRefs: details.evidenceRefs });
    this.#transition(task, 'needs_clarification', { reasonCode: 'ambiguous_goal', stopDecision: decision });
    this.#event(task, 'stop_decided', { status: decision.status, reasonCode: decision.reasonCode, question });
    return { task: this.getTask(taskId), clarification: { question, options: details.options || [] } };
  }

  succeedTask(taskId, output = null, { evidenceRefs = [] } = {}) {
    const task = this.#task(taskId);
    if (!['running', 'awaiting_retrieval', 'awaiting_tool', 'committing'].includes(task.state.status)) fail('state_invalid', `任务当前不能成功结束：${task.state.status}`);
    const pending = task.state.pendingActions.filter((action) => ['intent', 'sent', 'unknown'].includes(action.status));
    if (pending.length) fail('pending_action', '存在尚未确认效果的工具动作，不能提交成功结果');
    if (task.state.status !== 'committing') this.#transition(task, 'committing', { reasonCode: 'output_validated' });
    const decision = stopDecision('success', 'goal_satisfied', { evidenceRefs });
    task.state.stopDecision = decision;
    task.state.outputHash = output === null ? null : sha256(output);
    task.state.output = output === null ? null : clone(output);
    this.#transition(task, 'succeeded', { reasonCode: 'goal_satisfied', stopDecision: decision });
    this.#event(task, 'task_succeeded', { outputHash: task.state.outputHash, evidenceRefs });
    return { task: this.getTask(taskId), output: clone(output), stopDecision: decision };
  }

  failTask(taskId, reasonCode = 'runtime_failed', details = {}) {
    const task = this.#task(taskId);
    if (TERMINAL_STATES.has(task.state.status)) return { task: this.getTask(taskId), stopDecision: task.state.stopDecision };
    const decision = stopDecision('failure', reasonCode, details);
    this.#transition(task, 'failed', { reasonCode, stopDecision: decision });
    this.#event(task, 'task_failed', { reasonCode, evidenceRefs: decision.evidenceRefs });
    return { task: this.getTask(taskId), stopDecision: decision };
  }

  requestStop(taskId, reason = 'cancelled') {
    return this.stopTask(taskId, reason);
  }

  recoverTask(taskId, { reasonCode = 'runtime_restarted' } = {}) {
    const task = this.#task(taskId);
    if (TERMINAL_STATES.has(task.state.status)) return { task: this.getTask(taskId), recovered: false, reason: 'terminal' };
    const unknown = task.state.pendingActions.some((action) => ['sent', 'unknown', 'intent'].includes(action.status));
    if (unknown) {
      if (task.state.status !== 'unknown_effect') this.#transition(task, 'unknown_effect', { reasonCode });
      this.#event(task, 'recovery_blocked', { reasonCode, pendingUnknownAction: true });
      return { task: this.getTask(taskId), recovered: false, reason: 'unknown_effect' };
    }
    if (task.state.status !== 'paused') this.#transition(task, 'paused', { reasonCode, stopDecision: stopDecision('waiting', reasonCode, { nextAction: 'retry_safe' }) });
    this.#event(task, 'task_recovered', { reasonCode, resumed: false });
    return { task: this.getTask(taskId), recovered: true, reason: 'paused_for_resume' };
  }

  resumeTask(taskId) {
    const task = this.#task(taskId);
    if (task.state.status === 'unknown_effect') fail('recovery_requires_effect_check', 'unknown_effect 必须先查询并解析动作效果');
    if (task.state.status !== 'paused' && task.state.status !== 'needs_clarification') fail('state_invalid', `任务当前不能恢复：${task.state.status}`);
    const unknown = task.state.pendingActions.some((action) => ['sent', 'unknown', 'intent'].includes(action.status));
    if (unknown) fail('recovery_requires_effect_check', '存在未确认动作，不能盲目重试');
    this.#transition(task, 'running', { reasonCode: 'resume' });
    this.#event(task, 'task_resumed', {});
    return this.getTask(taskId);
  }

  checkpoint(taskId) {
    const task = this.#task(taskId);
    const snapshot = {
      runtimeVersion: AGENT_RUNTIME_VERSION,
      spec: clone(task.spec),
      idempotencyKey: task.idempotencyKey,
      idempotencyIndexKey: task.idempotencyIndexKey,
      state: this.getTask(taskId),
      events: this.getEvents(taskId),
      actions: [...task.actions.values()].map((action) => clone(action)),
    };
    const checkpointHash = sha256(snapshot);
    const checkpoint = { revision: task.state.revision, hash: checkpointHash, committedAt: new Date(this.#clock()).toISOString() };
    task.state.checkpoints.push(checkpoint);
    this.#event(task, 'state_committed', { checkpointHash, revision: checkpoint.revision }, { bumpRevision: true });
    return { ...snapshot, checkpoint: clone(checkpoint), checkpointHash };
  }

  restoreCheckpoint(snapshot, { replace = false } = {}) {
    assertObject(snapshot, 'checkpoint');
    if (snapshot.runtimeVersion !== AGENT_RUNTIME_VERSION) fail('checkpoint_version_unsupported', 'checkpoint runtime 版本不支持');
    if (!isObject(snapshot.state) || !Array.isArray(snapshot.events) || !Array.isArray(snapshot.actions)) fail('checkpoint_invalid', 'checkpoint 结构无效');
    const providedHash = snapshot.checkpointHash;
    const hashPayload = { runtimeVersion: snapshot.runtimeVersion, spec: snapshot.spec, idempotencyKey: snapshot.idempotencyKey, idempotencyIndexKey: snapshot.idempotencyIndexKey, state: snapshot.state, events: snapshot.events, actions: snapshot.actions };
    if (providedHash !== sha256(hashPayload)) fail('checkpoint_hash_mismatch', 'checkpoint hash 不一致');
    const taskId = snapshot.state.taskId;
    if (this.#tasks.has(taskId) && !replace) fail('task_duplicate', `任务已存在：${taskId}`);
    const spec = validateAgentSpec(snapshot.spec || createReadOnlyAgentSpec({ agentId: snapshot.state.agentSpecId, agentVersion: snapshot.state.agentSpecVersion }));
    const restoredIndexKey = snapshot.idempotencyIndexKey || idempotencyIndexKey(snapshot.state.userId, snapshot.idempotencyKey);
    const task = { state: clone(snapshot.state), spec, events: clone(snapshot.events), actions: new Map(snapshot.actions.map((action) => [action.actionId, clone(action)])), idempotencyHash: sha256({ key: snapshot.idempotencyKey, userId: snapshot.state.userId, inputHash: snapshot.state.inputHash, agentSpecVersion: snapshot.state.agentSpecVersion }), idempotencyKey: snapshot.idempotencyKey, idempotencyIndexKey: restoredIndexKey, input: undefined };
    this.#tasks.set(taskId, task);
    if (snapshot.idempotencyKey) this.#idempotency.set(restoredIndexKey, taskId);
    this.#event(task, 'checkpoint_restored', { checkpointHash: providedHash }, { bumpRevision: true });
    return this.getTask(taskId);
  }
}

export function createRuntime(options = {}) {
  return new AgentRuntime(options);
}

