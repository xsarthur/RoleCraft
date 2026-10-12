// Frontend developer checks, not independent acceptance or textbook code execution.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import crypto from 'node:crypto';
const root=path.resolve('sites/rolecraft');
const events=new Map(), writes=[];
const context=vm.createContext({console,setTimeout,clearTimeout,AbortController,URL,Blob,location:{hash:'#home',protocol:'http:',href:'http://127.0.0.1:4421/#home'},localStorage:{getItem:k=>{assert.equal(k,'rolecraft-learning-v11');return null;},setItem:(k,v)=>writes.push([k,v])},sessionStorage:{getItem:()=>null,setItem:()=>{}},document:{addEventListener:(type,callback)=>{events.set(type,callback);},getElementById:()=>null,querySelectorAll:()=>[]},navigator:{},requestAnimationFrame:()=>0,cancelAnimationFrame:()=>{}});
vm.runInContext(fs.readFileSync(path.join(root,'dist/content-v10-data.js'),'utf8'),context);
vm.runInContext(fs.readFileSync(path.join(root,'dist/learning-workbench.js'),'utf8'),context);
const corpus=context.RolecraftContentV10, lw=context.LearningWorkbench, checks=[];
const record=(name,fn)=>{fn();checks.push({name,status:'pass'});};
const escape=v=>v.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let allHtml='', codeCount=0, headingCount=0;
record('all 20 original bodies: headings, fenced code and data byte binding',()=>{
  assert.equal(corpus.units.length,20);
  for(const u of corpus.units){
    assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,u.sourcePath))).digest('hex'),u.sourceSha256);
    const html=lw.markdown(u);allHtml+=html;
    for(const s of u.sections){assert.ok(html.includes('id="'+s.sectionId+'"'));headingCount++;}
    for(const match of u.bodyMarkdown.matchAll(/^[ \t]*```[^\n]*\n([\s\S]*?)^[ \t]*```\s*$/gm)){assert.ok(html.includes(escape(match[1].replace(/\n$/,''))),u.unitId+' code not retained');codeCount++;}
  }
});
record('original two figures, local references and internal section links render',()=>{
  const html=lw.markdown(corpus.units[0]);
  assert.ok(html.includes('content-v10-assets/agent-runtime-loop.png'));
  assert.ok(html.includes('content-v10-assets/agent-engineering-landscape.png'));
  assert.ok(html.includes('content-v10-references/textbook-v09-curriculum.md'));
  assert.ok(html.includes('#learn/agent/01-foundation/s-36b33d013882'));
  assert.equal((html.match(/<table>/g)||[]).length,3);
  assert.ok(!html.includes('lw-unavailable-link'));
});
record('all supplied actual links available or explicitly identified',()=>{
  const unavailable=(allHtml.match(/lw-unavailable-link/g)||[]).length;
  assert.equal(unavailable,0,'Original link resource missing');
});
record('HTML, executable links and unapproved images never execute',()=>{
  const fake={...corpus.units[0],bodyMarkdown:'# title\n\n<script>alert(1)</script>\n\n[x](javascript:alert)\n\n![private](file:///private/example)\n\n`<img src=x onerror=alert(1)>`',sections:[{sectionId:'safe',startLine:1}]};
  const h=lw.markdown(fake);assert.ok(!h.includes('<script>'));assert.ok(!h.includes('href="javascript:'));assert.ok(!h.includes('src="file:'));assert.ok(!h.includes('<img src=x'));assert.ok(h.includes('&lt;script&gt;'));
});
record('cached/new recommendation rejects changed version, invented excerpt, fake section and source hash',()=>{
  const u=corpus.units[0],s=u.sections[0], valid={status:'recommended',corpusVersion:corpus.corpusVersion,corpusHash:corpus.corpusHash,results:[{unitId:u.unitId,sectionId:s.sectionId,sourceSha256:u.sourceSha256,sourcePath:u.sourcePath,version:corpus.corpusVersion,unitTitle:u.title,sectionTitle:s.title,evidenceExcerpt:s.bodyMarkdown.slice(0,40),reason:'source mechanism',href:s.href}]};
  assert.equal(lw.validateResponse(valid,{}).status,'recommended');
  for(const changed of [{...valid,corpusHash:'old'}, {...valid,results:[{...valid.results[0],evidenceExcerpt:'invented source quote'}]}, {...valid,results:[{...valid.results[0],sectionId:'missing'}]}, {...valid,results:[{...valid.results[0],sourceSha256:'changed'}]}])assert.throws(()=>lw.validateResponse(changed,{}));
  assert.equal(lw.validateResponse({status:'unavailable',message:'missing index'},{}).status,'unavailable');
});
record('native project and history pages escape user values, no old storage mutations',()=>{
  assert.ok(lw.page('home').includes('Agent 开发者'));
  assert.ok(lw.page('projects').includes('未独立评价'));
  assert.ok(lw.page('records').includes('没有打开过教材正文'));
  assert.equal(writes.length,0);
});
console.log(JSON.stringify({kind:'frontend_developer_selfcheck',version:lw.version,corpusHash:corpus.corpusHash,actualUnits:corpus.units.length,actualHeadingNodes:headingCount,retainedFences:codeCount,checks,limits:['Not independent QA','Browser rendering, async interaction and local service verified separately','No textbook teaching code, provider API, private user storage or business action executed']},null,2));
