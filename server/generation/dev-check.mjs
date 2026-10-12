// Engineering self-check only. All provider responses are explicit simulations; no network calls.
import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {generateChapter,getGenerationReadiness} from './index.mjs';
const spec=JSON.parse(await readFile(new URL('../../team/generation-curriculum-v04.json',import.meta.url),'utf8'));
const config={apiKey:'DEVELOPMENT_PLACEHOLDER_NOT_A_KEY',model:'test-only',maxOutputTokens:2048,budgetUsd:1,estimatedMaxCostUsd:0.1,timeoutMs:1000};
const input={jobId:'dev-job',attemptId:'dev-attempt',leaseToken:1,inputHash:'dev-input-hash',profileSnapshot:{startingPoint:'beginner',goal:'学习安全边界'},moduleId:'e03',competencyVersion:spec.curriculumVersion,templateVersion:spec.chapterTemplate.id,rubricVersion:spec.version,sourceBundle:{version:spec.version,sources:spec.allowedSources},chapterSpecification:spec,promptVersion:'controlled-e03-v04',generationConfig:config};
const draft={moduleId:'e03',title:spec.title,prerequisites:spec.prerequisites,objectives:spec.objectives,
  sections:spec.sections.map(s=>({id:s.id,title:s.title,bodyMarkdown:s.bodyMarkdown,claimIds:s.claimIds})),
  claims:spec.supportedClaims.map(c=>({id:c.id,text:c.text,sectionIds:spec.sections.filter(s=>s.claimIds.includes(c.id)).map(s=>s.id),sourceIds:c.sourceIds,sourceLocator:c.sourceLocator})),
  examples:[{id:'pseudocode',type:'pseudocode_and_expected_results',verificationStatus:'not_run'}]};
const payload=chapter=>({id:'resp_dev_simulation',model:'test-only',status:'completed',output:[{type:'message',content:[{type:'output_text',text:JSON.stringify(chapter)}]}],usage:{input_tokens:100,output_tokens:200,total_tokens:300}});
const transportFor=(data,status=200)=>async()=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json','x-request-id':'req_dev_simulation'}});
const results=[];
async function check(name, fn){try{await fn();results.push({name,status:'passed'});}catch(e){results.push({name,status:'failed',message:e.message});process.exitCode=1;}}
async function fails(code,opts={},inbound=input){await assert.rejects(()=>generateChapter(inbound,{transport:transportFor(payload(draft)),...opts}),e=>e.code===code);}
await check('readiness fails closed without key',()=>assert.equal(getGenerationReadiness({...config,apiKey:''}).configured,false));
await check('missing config never dispatches',async()=>{let calls=0;await fails('config_missing',{config:{...config,apiKey:''},transport:async()=>{calls++;}});assert.equal(calls,0);});
await check('budget overrun never dispatches',()=>fails('budget_exceeded',{config:{...config,estimatedMaxCostUsd:2}}));
await check('valid simulated chapter retains all audit separations',async()=>{const stages=[];const r=await generateChapter(input,{transport:transportFor(payload(draft)),onEvent:stage=>stages.push(stage)});assert.equal(r.provenance.provider,'simulation');assert.equal(r.checks.simulation,true);assert.equal(r.chapterDraft.verification.professional,'unreviewed');assert.equal(r.chapterDraft.sections.length,9);assert.equal(r.usage.totalTokens,300);assert.match(r.provenance.outputHash,/^[a-f0-9]{64}$/);assert.deepEqual(stages,['sources_validating','generating','structure_validating','draft_ready']);});
await check('unknown profile rejected',()=>fails('input_invalid',{}, {...input,profileSnapshot:{startingPoint:'invented'}}));
await check('source snapshot mismatch rejected',()=>fails('source_insufficient',{}, {...input,sourceBundle:{version:'x',sources:[]}}));
await check('refusal rejected',()=>fails('provider_refusal',{transport:transportFor({...payload(draft),output:[{content:[{type:'refusal',refusal:'test'}]}]})}));
await check('incomplete rejected',()=>fails('provider_incomplete',{transport:transportFor({...payload(draft),status:'incomplete'})}));
await check('missing ninth section rejected',()=>fails('structure_invalid',{transport:transportFor(payload({...draft,sections:draft.sections.slice(0,8)}))}));
await check('unknown claim reference rejected',()=>fails('source_reference_invalid',{transport:transportFor(payload({...draft,claims:draft.claims.map((c,i)=>i?c:{...c,sourceIds:['FORGED']})}))}));
await check('claimed executed example rejected',()=>fails('structure_invalid',{transport:transportFor(payload({...draft,examples:[{...draft.examples[0],verificationStatus:'passed'}]}))}));
await check('provider body not propagated on authentication failure',async()=>{await assert.rejects(()=>generateChapter(input,{transport:transportFor({error:{message:'PRIVATE_SENTINEL'}},401)}),e=>e.code==='provider_auth'&&!JSON.stringify(e).includes('PRIVATE_SENTINEL'));});
await check('pre-cancelled never dispatches',async()=>{const c=new AbortController();c.abort();let calls=0;await fails('cancelled',{signal:c.signal,transport:async()=>{calls++;}});assert.equal(calls,0);});
await check('timeout evidence retains unknown external outcome',async()=>{await assert.rejects(()=>generateChapter(input,{config:{...config,timeoutMs:100},transport:(_url,o)=>new Promise((_resolve,reject)=>o.signal.addEventListener('abort',()=>reject(new Error('PRIVATE_TIMEOUT')),{once:true}))}),e=>e.code==='timeout'&&e.evidence.providerOutcomeUnknown===true&&!JSON.stringify(e).includes('PRIVATE_TIMEOUT'));});
await check('oversized response rejected',()=>fails('provider_invalid_response',{transport:async()=>new Response('{}',{headers:{'content-length':String(3*1024*1024)}})}));
await check('prerequisites cannot be bypassed',()=>fails('structure_invalid',{transport:transportFor(payload({...draft,prerequisites:[]}))}));
const report={type:'engineering_self_check',simulation:true,realProviderCalled:false,checkedAt:new Date().toISOString(),results};
await writeFile(new URL('./dev-check-results.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({passed:results.filter(r=>r.status==='passed').length,total:results.length,simulation:true,realProviderCalled:false}));
