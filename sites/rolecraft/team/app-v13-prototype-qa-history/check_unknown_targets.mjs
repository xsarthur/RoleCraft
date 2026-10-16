import {instance} from './client_fixture.mjs';
import {writeFileSync} from 'node:fs';
const i=instance(),checks=[];
for(const [href,expected]of [
 ['#learn/agent/00-learning-route?version=textbook-v10','正在阅读历史教材 v10'],
 ['#learn/agent/00-learning-route/does-not-exist','这处教材位置在所选版本中不可用；不会换成另一小节'],
 ['#learn/agent/00-learning-route?version=unknown','请求的教材版本没有完整加载'],
 ['#questions/does-not-exist','该题目不存在于当前题组']
]){i.context.location.hash=href;const body=i.ex.page(href.startsWith('#questions')?'questions':'learn');checks.push({href,expected,status:body.includes(expected)?'pass':'fail'});}
const result={scope:'Independent narrow VM controlled-output check after correcting QA phrase assumption; no browser route or GUI claimed',runtime:process.version,atUtc:new Date().toISOString(),checks,status:checks.every(c=>c.status==='pass')?'pass':'fail'};
writeFileSync(new URL('./candidate01/unknown-targets-narrow.json',import.meta.url),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));process.exitCode=result.status==='pass'?0:1;
