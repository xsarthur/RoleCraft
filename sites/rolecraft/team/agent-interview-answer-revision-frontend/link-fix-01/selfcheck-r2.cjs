// Developer self-check only. Independent content and browser acceptance belong to QA.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '../../..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const sha = value => crypto.createHash('sha256').update(value).digest('hex');
const checks = [];
function check(name, fn) { fn(); checks.push({name, status:'passed'}); }
const context = {URL}; vm.createContext(context);
vm.runInContext(read('dist/interview-answer-renderer.js'), context);
const renderer = context.RolecraftInterviewAnswerRenderer;
const fixture = {
  id:'P01', question:'fixture question', answerVersion:'fixture-only', answerSha256:'a'.repeat(64),
  contentStatus:'met_within_reviewed_scope',
  bodyMarkdown:'# Heading\n\nFull first paragraph.\n\nFull final paragraph.',
  sourceLinks:[
    {originalHref:'../../v12/c03.md',label:'tools section',occurrence:1,kind:'local_textbook',href:'#learn/agent/c03/s-tools'},
    {originalHref:'https://example.test/reference',label:'external reference',occurrence:2,kind:'external',href:'https://example.test/reference'},
    {originalHref:'javascript:alert(1)',label:'bad',occurrence:3,kind:'external',href:'javascript:alert(1)'},
  ],
};
context.RolecraftInterviewAnswersV1 = {answerSetVersion:'interview-answers-v1',byId:{P01:fixture}};
check('approved current fixture includes complete body and version identity', () => {
  const result = renderer.answerHTML('P01',{question:'fixture question'});
  assert(result.includes('Full first paragraph.') && result.includes('Full final paragraph.'));
  assert(result.includes('data-answer-sha256="'+'a'.repeat(64)+'"'));
});
check('pending answer body is withheld and status stays honest', () => {
  fixture.contentStatus='pending';
  const result=renderer.answerHTML('P01');
  assert(result.includes('待当前版本复核') && !result.includes('Full first paragraph.'));
  fixture.contentStatus='met_within_reviewed_scope';
});
check('identity mismatch does not expose another question answer', () => {
  assert(!renderer.answerHTML('P01',{question:'different'}).includes('Full first paragraph.'));
  assert(!renderer.answerHTML('P99').includes('Full first paragraph.'));
});
check('markdown raw HTML, inline code and fenced code cannot execute', () => {
  const result=renderer.markdown('<img src=x onerror=alert(1)>\n\n`<b>inline</b>`\n\n```html\n<script>alert(1)</script>\n```',fixture);
  assert(!result.includes('<img') && !result.includes('<script>'));
  assert(result.includes('&lt;img') && result.includes('&lt;b&gt;inline&lt;/b&gt;') && result.includes('&lt;script&gt;'));
});
check('only bound HTTP(S) and known textbook targets are linked', () => {
  assert.equal(renderer.textbookLink('../../v12/c03.md',fixture,{}),'#learn/agent/c03/s-tools');
  assert.equal(renderer.textbookLink('../../v12/c03.md',fixture,{textbookBase:'index.html'}),'index.html#learn/agent/c03/s-tools');
  assert.equal(renderer.textbookLink('https://example.test/reference',fixture,{}),'https://example.test/reference');
  for(const link of ['javascript:alert(1)','data:text/html,hi','//example.test','https://unbound.test']) assert.equal(renderer.textbookLink(link,fixture,{}),'');
});
check('same file references bind their own labels and reject ambiguous targets', () => {
  const answer={...fixture,sourceLinks:[
    {originalHref:'../../v12/c03.md',label:'first section',occurrence:1,kind:'local_textbook',href:'#learn/agent/c03/s-first'},
    {originalHref:'../../v12/c03.md',label:'second section',occurrence:2,kind:'local_textbook',href:'#learn/agent/c03/s-second'},
  ]};
  const html=renderer.markdown('[first section](../../v12/c03.md) and [second section](../../v12/c03.md)',answer,{textbookBase:'index.html'});
  assert(html.includes('href="index.html#learn/agent/c03/s-first">first section</a>'));
  assert(html.includes('href="index.html#learn/agent/c03/s-second">second section</a>'));
  assert.equal(renderer.textbookLink('../../v12/c03.md',answer,{}),'');
  assert.equal(renderer.textbookLink('../../v12/c03.md',answer,{},{label:'missing'}),'');
  answer.sourceLinks.push({originalHref:'../../v12/c03.md',label:'first section',occurrence:3,kind:'local_textbook',href:'#learn/agent/c03/s-other'});
  assert.equal(renderer.textbookLink('../../v12/c03.md',answer,{},{label:'first section'}),'');
  assert.equal(renderer.textbookLink('../../v12/c03.md',answer,{},{label:'first section',occurrence:2}),'');
});
check('tables, code pipes, nested lists and final text remain present', () => {
  const result=renderer.markdown('# Title\n\n| Item | Value |\n| --- | --- |\n| `a|b` | 2 |\n\n1. first\n  - child\n\n> quoted\n\nlast Ω ≤ 0.5',fixture);
  assert(result.includes('<table>') && result.includes('<code>a|b</code>') && result.includes('<ol>') && result.includes('<ul>') && result.includes('<blockquote>'));
  assert(result.includes('last Ω ≤ 0.5'));
});
check('prototype questions, original answers, followups and timing unchanged', () => {
  const values = source => vm.runInNewContext(source.match(/const questions=(\[[\s\S]*?\n\]);/)[1]);
  assert.equal(JSON.stringify(values(read('dist/interview-prep-v1-prototype.html'))),JSON.stringify(values(read('team/agent-interview-answer-revision-frontend/received/interview-prep-v1-prototype.html'))));
  assert(!read('dist/interview-prep-v1-prototype.html').includes("q.answer.map("));
});
check('main experience change is limited to the existing internal answer function', () => {
  const baseline=read('team/agent-interview-answer-revision-frontend/received/learning-experience-v13.js');
  const expected=baseline.replace("function evidenceHTML(q){return '<div class=\"v13-reference-analysis\">", "function evidenceHTML(q){const full=globalThis.RolecraftInterviewAnswerRenderer?.answerHTML(qid(q),{question:q.prompt||q.questionText||q.question})||'';return full+'<div class=\"v13-reference-analysis\">");
  assert.equal(read('dist/learning-experience-v13.js'),expected);
  assert(read('dist/learning-experience-v13.js').includes("if(['questions','review','check'].includes(view))return '<div class=\"v13-deferred\">"));
});
check('main index keeps received content and appends only necessary local assets', () => {
  const baseline=read('team/agent-interview-answer-revision-frontend/received/index.html');
  const expected=baseline.replace('<link rel="stylesheet" href="auth-career-v15.css">','<link rel="stylesheet" href="auth-career-v15.css"><link rel="stylesheet" href="interview-answer-reader.css">').replace('<script src="learning-experience-v13.js"></script>','<script src="interview-answers-v1-data.js"></script><script src="interview-answer-renderer.js"></script><script src="learning-experience-v13.js"></script>');
  assert.equal(read('dist/index.html'),expected);
});
check('prototype inline application JavaScript remains syntactically valid', () => {
  const html=read('dist/interview-prep-v1-prototype.html');
  for(const match of html.matchAll(/<script>([\s\S]*?)<\/script>/g))new vm.Script(match[1]);
});
let dataSummary = null;
if (fs.existsSync(path.join(root,'dist/interview-answers-v1-data.js'))) {
  vm.runInContext(read('dist/interview-answers-v1-data.js'),context);
  const data=context.RolecraftInterviewAnswersV1;
  let tables=0,fences=0,localLinks=0,externalLinks=0;
  check('all current answer bodies parse with code fence counts and bound links preserved', () => {
    assert.equal(data.items.length,124);
    for(const item of data.items){
      const result=renderer.markdown(item.bodyMarkdown,item,{textbookBase:'index.html'});
      assert(result.length>0);
      const display=renderer.answerHTML(item.id,{question:item.question,textbookBase:'index.html'});
      assert(display.includes(result),item.id+' renders entire processed body');
      assert(display.includes('data-answer-sha256=\"'+item.answerSha256+'\"'),item.id+' visible version binding');
      const expectedFences=(item.bodyMarkdown.match(/^```/gm)||[]).length/2;
      const actualFences=(result.match(/class="ia-code"/g)||[]).length;
      assert.equal(actualFences,expectedFences,item.id+' code fence count');
      tables+=(result.match(/<table>/g)||[]).length;fences+=actualFences;
      for(const link of item.sourceLinks||[]){
        const href=renderer.textbookLink(link.originalHref,item,{textbookBase:'index.html'},{label:link.label,occurrence:link.occurrence});
        assert(href,item.id+' mapped link '+link.originalHref);
        if(link.kind==='local_textbook'){assert(href.startsWith('index.html#learn/agent/'));localLinks++;}else externalLinks++;
      }
    }
  });
  check('all prototype mappings match the original question identity', () => {
    const original=vm.runInNewContext(read('dist/interview-prep-v1-prototype.html').match(/const questions=(\[[\s\S]*?\n\]);/)[1]);
    for(const question of original){const id=data.prototypeMap[question.id];assert.equal(data.byId[id].question,question.title);assert.equal(JSON.stringify(data.byId[id].followups),JSON.stringify(question.follow));}
  });
  dataSummary={answerSetSha256:data.answerSetSha256,contentStatus:data.contentStatus,counts:data.collections.map(c=>({id:c.id,count:c.count,counts:c.counts})),tables,fences,localLinks,externalLinks};
}
const outputs=['dist/index.html','dist/learning-experience-v13.js','dist/interview-prep-v1-prototype.html','dist/interview-answer-renderer.js','dist/interview-answer-reader.css'];
const report={kind:'developer_selfcheck_not_independent_qa',runtime:process.version,checks,dataSummary,bindings:outputs.map(file=>({path:file,sha256:sha(fs.readFileSync(path.join(root,file)))})),limitations:['No browser UI execution in this developer self-check.','No independent content review or acceptance performed by frontend author.','No user storage, database, server or external API is accessed.']};
fs.writeFileSync(path.join(__dirname,'selfcheck-r2-result.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
