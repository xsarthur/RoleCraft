/* Paste this documented read-only function into tab.playwright.evaluate(...) in official CUA.
   Freeze/verify stylesheet and source hashes before capture; attach them via a separate binding manifest.
   This file does not launch a browser, modify styles, or read application/browser storage. */
() => {
 const root=document.querySelector('.lw-prose'), block=Array.from(root.querySelectorAll('.lw-code')).find(x=>x.textContent.includes('def refund(days)'));
 const targets=[['block_code',block.querySelector('pre code')],['block_pre',block.querySelector('pre')],['language_label',block.querySelector(':scope>span')],['inline_code',root.querySelector('p code')],['body_paragraph',root.querySelector(':scope>p')]];
 const samples=[],checks=[];
 for(const[kind,e]of targets){if(!e)throw Error('representative element missing: '+kind);const s=getComputedStyle(e),anc=[];
  for(let n=e;n;n=n.parentElement){const v=getComputedStyle(n);checks.push({opacity:v.opacity,backgroundImage:v.backgroundImage,filter:v.filter,mixBlendMode:v.mixBlendMode});anc.push([n.tagName,n.id?'#'+n.id:n.className||'',v.backgroundColor]);}
  samples.push({kind,selector:kind,text:e.textContent.trim().slice(0,80),color:s.color,backgroundColor:s.backgroundColor,opacity:s.opacity,fontSize:s.fontSize,fontWeight:s.fontWeight,textShadow:s.textShadow,background_ancestors:anc});
 }
 const uniform={};for(const k of ['opacity','backgroundImage','filter','mixBlendMode']){const values=Array.from(new Set(checks.map(x=>x[k])));uniform[k]=values.length===1?values[0]:'MIXED:'+values.join('|');}
 return{schema:'official-cua-computed-style-1',observed_at:new Date().toISOString(),url:document.URL,source_stylesheets:Array.from(document.querySelectorAll('link[rel="stylesheet"]')).map(x=>x.href),all_observed_ancestor_properties:uniform,samples};
}
