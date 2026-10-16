// Artifact rendering only. No textbook program is imported or executed.
const fs = require('fs');
const path = require('path');
const dep = '/Users/shengxiong/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules';
const Viz = require(path.join(dep, '@viz-js/viz/dist/viz.cjs'));
const sharp = require(path.join(dep, 'sharp'));
const out = path.resolve(__dirname, '../../textbooks/v10/assets');
(async () => {
 const viz = await Viz.instance();
 const records = [];
 for (const name of ['agent-runtime-loop', 'agent-engineering-landscape']) {
  const dot = fs.readFileSync(path.join(out, name+'.dot'), 'utf8');
  const result = viz.render(dot, {format:'svg',engine:'neato'});
  if (result.status !== 'success') throw new Error(JSON.stringify(result.errors));
  fs.writeFileSync(path.join(out, name+'.svg'), result.output);
  await sharp(Buffer.from(result.output), {density:144}).png().toFile(path.join(out, name+'.png'));
  const info = await sharp(path.join(out, name+'.png')).metadata();
  records.push({name, graphvizVersion:viz.graphvizVersion, vizVersion:'3.25.0', sharpVersion:sharp.versions.sharp, warnings:result.errors, pngWidth:info.width, pngHeight:info.height, renderer:'Graphviz DOT via bundled Viz.js; PNG via bundled sharp', textbookCodeExecuted:false});
 }
 fs.writeFileSync(path.join(__dirname,'diagram-render-record.json'), JSON.stringify(records,null,2)+'\n');
 process.stdout.write(JSON.stringify(records,null,2)+'\n');
})();
