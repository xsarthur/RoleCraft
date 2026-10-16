import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const project=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const sha=raw=>createHash('sha256').update(raw).digest('hex');
const corpus=JSON.parse(readFileSync(path.join(project,'server/retrieval/content-v12-index.json')));
const vectors=JSON.parse(readFileSync(path.join(project,'server/retrieval/vectors-v12.json')));
const intentVectors=JSON.parse(readFileSync(path.join(project,'server/retrieval/intent-vectors-v12.json')));
const paths=[
 'server/index.mjs','server/retrieval/index.mjs','server/retrieval/semantic.mjs','server/retrieval/build-content-v12.mjs','server/retrieval/self-check-v12.mjs','server/retrieval/self-check-v12-repair.mjs','server/retrieval/preview-v12.mjs','server/retrieval/bind-v12.mjs',
 'dist/content-retrieval-core.js','dist/content-v12-data.js','server/retrieval/content-v12-index.json','server/retrieval/vectors-v12.json','server/retrieval/intent-vectors-v12.json','server/retrieval/model-lock.json',
 'team/app-v12-textbook-integration-retrieval.md','team/app-v12-textbook-integration-retrieval-self-check.json','team/app-v12-textbook-integration-retrieval-self-check-input-error.json','team/app-v12-textbook-integration-retrieval-self-check-contract-error.json',
 'team/app-v12-textbook-integration-retrieval-repair-self-check.json','team/app-v12-textbook-integration-retrieval-repair-check.json',
 'team/app-v12-textbook-integration-retrieval-preview.json',
 'team/app-v12-textbook-integration-retrieval-history/candidate/binding.json',
 ...['dist/content-retrieval-core.js','server/retrieval/index.mjs','server/retrieval/semantic.mjs','team/app-v12-textbook-integration-retrieval.md','team/app-v12-textbook-integration-retrieval-binding.json','team/app-v12-textbook-integration-retrieval-self-check.json'].map(p=>'team/app-v12-textbook-integration-retrieval-history/candidate/'+p.replaceAll('/','__')),
 'textbooks/v12/assembly-manifest.json','team/textbook-v12-curriculum.json','textbooks/v12/agent-engineering-textbook.md',
 ...corpus.units.map(u=>u.sourcePath),
 ...corpus.assets.flatMap(a=>[a.sourcePath,'dist/'+a.staticHref]),...corpus.references.flatMap(a=>[a.sourcePath,'dist/'+a.staticHref])
];
const files=[...new Set(paths)].map(name=>{const raw=readFileSync(path.join(project,name));return {path:name,bytes:raw.length,sha256:sha(raw)};});
const record={kind:'engineering_binding_not_independent_acceptance',builtAt:new Date().toISOString(),retrievalVersion:'content-retrieval-0.12-v12',corpusVersion:corpus.corpusVersion,corpusHash:corpus.corpusHash,bookSha256:corpus.bookSha256,units:corpus.units.length,sections:corpus.units.reduce((n,u)=>n+u.sections.length,0),sourceBinding:corpus.sourceBinding,model:{modelId:vectors.modelId,revision:vectors.revision,dtype:vectors.dtype,pooling:vectors.pooling,dimensions:vectors.dimensions,modelHash:vectors.modelHash},passageVectors:{corpusVersion:vectors.corpusVersion,corpusHash:vectors.corpusHash,chunkHash:vectors.chunkHash,count:vectors.items.length},taskVectors:{corpusVersion:intentVectors.corpusVersion,descriptionHash:intentVectors.descriptionHash,count:intentVectors.items.length},files};
const raw=JSON.stringify(record,null,2)+'\n';writeFileSync(path.join(project,'team/app-v12-textbook-integration-retrieval-binding.json'),raw);console.log(JSON.stringify({files:files.length,bindingSha256:sha(raw),corpusHash:record.corpusHash}));
