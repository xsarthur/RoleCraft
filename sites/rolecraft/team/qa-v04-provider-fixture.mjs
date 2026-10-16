// Independent QA-only simulated provider, used only by disposable QA child.
import fs from 'node:fs';
export const spec=JSON.parse(fs.readFileSync(new URL('./generation-curriculum-v04.json',import.meta.url),'utf8'));
export const draft=()=>({moduleId:spec.moduleId,title:spec.title,prerequisites:spec.prerequisites,objectives:spec.objectives,sections:spec.sections.map(s=>({id:s.id,title:s.title,bodyMarkdown:s.bodyMarkdown,claimIds:s.claimIds})),claims:spec.supportedClaims.map(c=>({id:c.id,text:c.text,sectionIds:spec.sections.filter(s=>s.claimIds.includes(c.id)).map(s=>s.id),sourceIds:c.sourceIds,sourceLocator:c.sourceLocator})),examples:[{id:'qa-pseudocode',type:'pseudocode_and_expected_results',verificationStatus:'not_run'}]});
export const payload=(d=draft())=>({id:'resp_qa_synthetic',model:'qa-synthetic-model',status:'completed',output:[{content:[{type:'output_text',text:JSON.stringify(d)}]}],usage:{input_tokens:2,output_tokens:3,total_tokens:5}});
export const response=(p=payload(),status=200)=>new Response(JSON.stringify(p),{status,headers:{'x-request-id':'req_qa_synthetic'}});
