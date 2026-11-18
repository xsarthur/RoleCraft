import { readFileSync } from 'node:fs';
import { createContext, runInContext } from 'node:vm';
import { fileURLToPath } from 'node:url';

const code = readFileSync(fileURLToPath(new URL('../dist/recording-support.js', import.meta.url)), 'utf8');
const sandbox = {};
sandbox.globalThis = sandbox;
createContext(sandbox);
runInContext(code, sandbox);

const api = sandbox.RolecraftRecordingSupport;

export const inspectRecordingEnvironment = api.inspectRecordingEnvironment;
export const classifyMediaError = api.classifyMediaError;
export const recordingSupportMessage = api.recordingSupportMessage;
export const readRecordingEnvironment = api.readRecordingEnvironment;
