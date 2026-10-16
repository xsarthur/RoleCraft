// QA renders existing code-native SVG into a display-width preview only. No textbook program or project runtime is imported.
const fs=require('fs'),path=require('path');
const sharp=require('/Users/shengxiong/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const src='/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v10/assets';
const dst=path.join(__dirname,'after-layout-repair-1');
(async()=>{fs.mkdirSync(dst,{recursive:true});const records=[];
for(const name of ['agent-runtime-loop','agent-engineering-landscape']){
 const svg=fs.readFileSync(path.join(src,name+'.svg'));
 const text=svg.toString('utf8');if(/<script|<image|<foreignObject|(?:xlink:)?href\s*=/.test(text))throw Error('external/interactive SVG content not permitted');
 await sharp(svg,{density:72}).resize({width:760}).png().toFile(path.join(dst,name+'-width760.png'));
 const metadata=await sharp(path.join(dst,name+'-width760.png')).metadata();records.push({name,width:metadata.width,height:metadata.height,sharpVersion:sharp.versions.sharp,mode:'SVG raster preview, 760 pixel viewing width',textbookBehaviorExecuted:false});}
 fs.writeFileSync(path.join(dst,'preview-render.json'),JSON.stringify(records,null,2)+'\n');console.log(JSON.stringify(records));})();
