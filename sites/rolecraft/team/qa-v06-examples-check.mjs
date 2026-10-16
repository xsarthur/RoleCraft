// Only the c01 final fenced example, manually reviewed as stdlib json and memory.
// Does not execute any v05 example, provider/API, real filesystem business action or DB.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const dir=path.dirname(fileURLToPath(import.meta.url));
const bytes=fs.readFileSync(path.join(dir,'textbook-v06.json')),book=JSON.parse(bytes);
const hash=x=>crypto.createHash('sha256').update(x).digest('hex');
const c=book.chapters.find(c=>c.id==='c01'),s=c.sections.find(s=>s.id==='example');
const blocks=[...s.bodyMarkdown.matchAll(/```python\n([\s\S]*?)\n```/g)];
assert.equal(blocks.length,1);
const code=blocks[0][1],fileBytes=code+'\n',meta=c.examples.find(e=>e.id==='c01-example');
assert.equal(meta.executionStatus,'not_run');
assert.deepEqual(meta.actualResults,[]);
assert.equal(meta.codeSha256,hash(fileBytes));
// Secondary guard only; manual complete line reading is the safety basis.
assert(!/\b(import\s+(?:os|subprocess|socket|requests|urllib)|open\s*\(|exec\s*\(|eval\s*\(|__import__)/.test(code));
assert.deepEqual([...code.matchAll(/^import ([^\n]+)$/gm)].map(x=>x[1]),['json']);
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'rolecraft-v06-c01-qa-'));
const environment=spawnSync('python3',['-c','import sys,json;print(json.dumps({"python":sys.version.split()[0]}))'],{encoding:'utf8',timeout:10000,env:{PATH:process.env.PATH}});
assert.equal(environment.status,0);
const records=[];
const variants=[
["normal","默认输入、带空格合法型号、保存回执与资料版本相符"],
["boundary","0/1/20步数及调用额度，工具调用不超上限；布尔预算及非法JSON类型拒绝"],
["failure","缺型号、未知型号、权限拒绝、持续超时、保存失败、开始前取消/到期"],
["perturbation","首轮超时随后成功、持续超时最多两次、禁止新动作字符串且无工具调用"]
];
const extra=String.raw`
def qa_assert_status(expected, **kwargs):
    result = run_warranty(**kwargs)
    assert result["status"] == expected, (kwargs, result)
    assert result["tool_calls"] == len(result["trace"])
    return result

r = qa_assert_status("completed", model="  星河-01  ")
assert [x["action"] for x in r["trace"]] == ["read_policy", "save_draft"]
assert r["state"]["draft"]["policy_id"] == r["state"]["policy"]["policy_id"]
assert r["state"]["draft"]["text"] == "星河-01耳机保修期限为购买之日起12个月。"
for steps in (0, 1, 2, 6, 20):
    for budget in (0, 1, 2, 4, 20):
        r = run_warranty(max_steps=steps, tool_budget=budget)
        assert r["tool_calls"] <= budget
        assert len(r["trace"]) <= steps
        assert (r["status"] == "completed") == (steps >= 2 and budget >= 2)
for value in (None, True, False, -1, 21, 1.5, "", "2", [], {}):
    qa_assert_status("invalid_input", max_steps=value)
    qa_assert_status("invalid_input", tool_budget=value)
for value in (True, False, 0, 1, 1.5, [], {}):
    qa_assert_status("invalid_input", model=value)
for value in (None, True, 0, 1.5, [], {}, "", "new_status"):
    qa_assert_status("invalid_input", scenario=value)
for value in (None, 0, 1, "", [], {}):
    qa_assert_status("invalid_input", cancelled=value)
    qa_assert_status("invalid_input", deadline_expired=value)
for value in (None, "", "  "):
    qa_assert_status("waiting_for_info", model=value)
qa_assert_status("not_found", model="星河-02")
for scenario, status, count in [
    ("permission_denied", "permission_denied", 1),
    ("not_found", "not_found", 1),
    ("timeout", "no_progress", 2),
    ("save_failed", "save_failed", 2)]:
    r = qa_assert_status(status, scenario=scenario)
    assert r["tool_calls"] == count
    assert r["state"]["draft"] is None
assert qa_assert_status("cancelled", cancelled=True)["tool_calls"] == 0
assert qa_assert_status("deadline_exceeded", deadline_expired=True)["tool_calls"] == 0

# QA temporary replacements obey the explicit string-action / dictionary-result
# controlled teaching contract. They are not model/schema/security certification.
original_read = read_policy
calls = []
def once_timeout(model, scenario):
    calls.append(model)
    return {"status":"timeout"} if len(calls) == 1 else original_read(model, scenario)
read_policy = once_timeout
r = qa_assert_status("completed")
assert r["tool_calls"] == 3
assert [x["observation"]["status"] for x in r["trace"]] == ["timeout","found","saved"]
assert calls == ["星河-01","星河-01"]
read_policy = original_read
original_choose = choose_action
choose_action = lambda state: "refund"
r = qa_assert_status("action_denied")
assert r["tool_calls"] == 0 and r["trace"] == [] and r["state"]["draft"] is None
choose_action = original_choose
print("QA c01 normal/boundary/failure/controlled-perturbation assertions passed")
`;
try{
 for(const [phase,content] of [['verbatim_author_example',fileBytes],['qa_declared_variants',fileBytes+extra]]){
  const file=path.join(tmp,'c01_warranty_demo.py');fs.writeFileSync(file,content);
  const result=spawnSync('python3',[file],{cwd:tmp,encoding:'utf8',timeout:10000,env:{PATH:process.env.PATH}});
  records.push({exampleId:'c01-example',chapterId:'c01',phase,bodySha256:hash(s.bodyMarkdown),fencedCodeSha256:hash(code),codeSha256:hash(fileBytes),executedFileSha256:hash(content),command:'python3 <temporary-dir>/c01_warranty_demo.py'+(phase==='qa_declared_variants'?' with independent QA appended assertions':''),exitCode:result.status,stdout:result.stdout.trim(),stderr:result.stderr.trim(),testedCases:phase==='qa_declared_variants'?variants:[]});
  assert.equal(result.status,0,phase+': '+result.stderr);
 }
}finally{fs.rmSync(tmp,{recursive:true,force:true});}
const evidence={schemaVersion:'1.0',textbookVersion:book.version,sourceFile:'team/textbook-v06.json',inputSha256:hash(bytes),reviewer:'/root/qa_engineer_v05',executedAt:'2026-10-11',environment:JSON.parse(environment.stdout),authorExecutionStatus:meta.executionStatus,records,scope:'Only c01 standard-library json memory control-loop example and explicit normal/boundary/failure/string-action controlled variations.',
 limits:['Deterministic decision/tool replacements; no real model or store and no external saving.','No persistent resume, wall-clock deadline, asynchronous cancellation, real cost or user/object identity authentication tested.','Malformed future model/tool interface is outside this controlled example contract and remains untested.','No v05 examples reexecuted or inherited as v06/new whole-book execution.','No expert, learner, comparative advantage, production or browser evidence.']};
fs.writeFileSync(path.join(dir,'qa-v06-examples-evidence.json'),JSON.stringify(evidence,null,2)+'\n');
console.log(JSON.stringify({textbookVersion:evidence.textbookVersion,inputSha256:evidence.inputSha256,exampleId:'c01-example',codeSha256:hash(fileBytes),records:records.map(x=>({phase:x.phase,exitCode:x.exitCode})),environment:evidence.environment,scope:evidence.scope},null,2));
