import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const project=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const sha=raw=>createHash('sha256').update(raw).digest('hex');
const corpus=JSON.parse(readFileSync(path.join(project,'server/retrieval/content-v13-index.json')));
const vectors=JSON.parse(readFileSync(path.join(project,'server/retrieval/vectors-v13.json')));
const intentVectors=JSON.parse(readFileSync(path.join(project,'server/retrieval/intent-vectors-v13.json')));
const paths=[
 'server/index.mjs','server/careers.mjs','server/agent/index.mjs','server/voice/index.mjs',
 'server/retrieval/index.mjs','server/retrieval/semantic.mjs','server/retrieval/dialog.mjs','server/retrieval/build-content-v13.mjs','server/retrieval/rebind-learning-v13.mjs','server/retrieval/bind-v13.mjs','server/retrieval/smoke-v13-cutover.mjs',
 'dist/content-retrieval-core.js','dist/content-v13-data.js','dist/learning-v13-data.js','dist/learning-workbench.js','dist/learning-experience-v13.js','dist/index.html','dist/app.js',
 'server/retrieval/content-v13-index.json','server/retrieval/vectors-v13.json','server/retrieval/intent-vectors-v13.json','server/retrieval/model-lock.json',
 'textbooks/v13/assembly-manifest.json','textbooks/v13/README.md','textbooks/v13/agent-engineering-textbook.md','team/textbook-v13-workbench-curriculum.json','team/textbook-v13-pm-deployment-handoff.md',
 ...corpus.units.map(u=>u.sourcePath),
 ...corpus.assets.flatMap(a=>[a.sourcePath,'dist/'+a.staticHref]),...corpus.references.flatMap(a=>[a.sourcePath,'dist/'+a.staticHref])
];
const files=[...new Set(paths)].map(name=>{const raw=readFileSync(path.join(project,name));return {path:name,bytes:raw.length,sha256:sha(raw)};});
const record={
 kind:'engineering_binding_not_independent_acceptance',
 builtAt:new Date().toISOString(),
 retrievalVersion:'content-retrieval-0.13-v13',
 corpusVersion:corpus.corpusVersion,
 corpusHash:corpus.corpusHash,
 bookSha256:corpus.bookSha256,
 units:corpus.units.length,
 sections:corpus.units.reduce((n,u)=>n+u.sections.length,0),
 rollbackCorpus:'textbook-v12',
 activeCurrent:'textbook-v13',
 sourceBinding:corpus.sourceBinding,
 model:{modelId:vectors.modelId,revision:vectors.revision,dtype:vectors.dtype,pooling:vectors.pooling,dimensions:vectors.dimensions,modelHash:vectors.modelHash},
 passageVectors:{corpusVersion:vectors.corpusVersion,corpusHash:vectors.corpusHash,chunkHash:vectors.chunkHash,count:vectors.items.length},
 taskVectors:{corpusVersion:intentVectors.corpusVersion,descriptionHash:intentVectors.descriptionHash,count:intentVectors.items.length},
 files
};
const raw=JSON.stringify(record,null,2)+'\n';
writeFileSync(path.join(project,'team/app-v13-textbook-cutover-retrieval-binding.json'),raw);
console.log(JSON.stringify({files:files.length,bindingSha256:sha(raw),corpusHash:record.corpusHash,passages:record.passageVectors.count,intents:record.taskVectors.count}));
