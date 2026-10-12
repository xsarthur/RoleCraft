import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
if(Number(process.versions.node.split('.')[0])!==24){
  process.stderr.write(`Rolecraft v11 requires verified Node.js 24; current runtime is ${process.version}. Use a Node 24 binary to run this launcher.\n`);
  process.exit(1);
}
const server=fileURLToPath(new URL('../sites/rolecraft/server/index.mjs',import.meta.url));
const child=spawn(process.execPath,[server],{stdio:'inherit',env:process.env});
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>child.kill(signal));
child.on('exit',code=>process.exit(code ?? 0));
