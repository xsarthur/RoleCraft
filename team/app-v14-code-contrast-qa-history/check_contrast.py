#!/usr/bin/env python3
"""Evaluate a bound, read-only browser-computed snapshot; never launch a browser."""
import argparse, datetime, hashlib, json, math, re
from pathlib import Path
STANDARD = 'https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html'
def color(value):
    value=value.strip().lower()
    if value=='transparent': return (0.,0.,0.,0.)
    if value.startswith('#'):
        h=value[1:]
        if len(h) in (3,4): h=''.join(x*2 for x in h)
        if len(h) not in (6,8): raise ValueError('unsupported hex color')
        return tuple(int(h[i:i+2],16)/255 for i in (0,2,4))+(int(h[6:8],16)/255 if len(h)==8 else 1.,)
    m=re.fullmatch(r'rgba?\(([^)]+)\)',value)
    if not m: raise ValueError('unsupported color syntax: '+value)
    parts=re.split(r'\s*[,/]\s*|\s+',m[1].strip())
    if len(parts) not in (3,4): raise ValueError('invalid RGB components')
    rgb=tuple(float(p[:-1])/100 if p.endswith('%') else float(p)/255 for p in parts[:3])
    alpha=float(parts[3][:-1])/100 if len(parts)==4 and parts[3].endswith('%') else float(parts[3]) if len(parts)==4 else 1.
    if any(not math.isfinite(x) or not 0<=x<=1 for x in rgb+(alpha,)):raise ValueError('out of range')
    return rgb+(alpha,)
def over(f,b):
    a=f[3]+b[3]*(1-f[3]);return tuple((f[i]*f[3]+b[i]*b[3]*(1-f[3]))/a for i in range(3))+(a,) if a else (0.,0.,0.,0.)
def luminance(c):
    f=lambda x:x/12.92 if x<=0.04045 else ((x+0.055)/1.055)**2.4
    return sum(a*f(x) for a,x in zip((0.2126,0.7152,0.0722),c[:3]))
def ratio(f,b):
    lo,hi=sorted((luminance(f),luminance(b)));return (hi+0.05)/(lo+0.05)
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def allowed(rel):
    return rel in ['dist/styles.css','dist/learning-workbench.css','dist/learning-experience-v13.css','dist/index.html','dist/learning-workbench.js','dist/learning-experience-v13.js','dist/content-v12-data.js'] or re.fullmatch(r'textbooks/v12/[-a-z0-9]+\.md',rel)
def run(snapshot, binding, root, minimum):
    if not math.isfinite(minimum)or minimum<4.5:raise ValueError('normal-text guard must be at least4.5')
    if binding.get('snapshotSha256')!=sha(snapshot):raise ValueError('snapshot hash mismatch; capture and bind a fresh snapshot')
    mismatches=[]
    for rel,expected in binding.get('files',{}).items():
        if not allowed(rel):raise ValueError('binding path outside public allowed scope')
        p=(root/rel).resolve()
        if not p.is_relative_to(root.resolve())or not p.is_file()or sha(p)!=expected:mismatches.append(rel)
    if not binding.get('files')or mismatches:raise ValueError('CSS/source hash mismatch; refresh computed snapshot: '+', '.join(mismatches))
    data=json.loads(snapshot.read_text());rows=[]
    if data.get('schema')!='official-cua-computed-style-1':raise ValueError('use documented computed-style snapshot schema')
    props=data.get('all_observed_ancestor_properties',{})
    for k,expected in {'opacity':'1','backgroundImage':'none','filter':'none','mixBlendMode':'normal'}.items():
        if props.get(k)!=expected:raise ValueError('unsupported ancestor effect; requires separate rendering analysis: '+k)
    for s in data.get('samples',[]):
        if float(s.get('opacity','1'))!=1 or s.get('textShadow','none')!='none':raise ValueError('unsupported opacity/shadow')
        layers=s.get('background_ancestors')
        if not layers:raise ValueError('missing actual ancestor background chain')
        bg=(1.,1.,1.,1.)
        for layer in reversed(layers):bg=over(color(layer[2]),bg)
        fg=over(color(s['color']),bg);cr=ratio(fg,bg)
        rows.append({'kind':s['kind'],'selector':s['selector'],'fontSize':s.get('fontSize'),'foreground':s['color'],'effectiveBackgroundRgb':[round(x*255,6)for x in bg[:3]],'contrastRatio':cr,'minimum':minimum,'status':'pass'if cr>=minimum else'fail','backgroundAncestorCount':len(layers)})
    if not rows:raise ValueError('no samples')
    return {'schema':'contrast-check-result-1','checkedAtUtc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'sourceKind':'official_browser_computed','snapshot':str(snapshot),'snapshotSha256':sha(snapshot),'binding':str(binding_path),'boundFiles':binding['files'],'standard':STANDARD,'scope':'bound selected code/label/inline/body only; not whole-site WCAG certification','method':'sRGB linearization/relative luminance; alpha over actual ancestor backgrounds; no rounded pass threshold','rows':rows,'status':'fail'if any(r['status']=='fail'for r in rows)else'pass'}
p=argparse.ArgumentParser(description=__doc__);p.add_argument('snapshot',type=Path);p.add_argument('--binding',required=True,type=Path);p.add_argument('--root',required=True,type=Path);p.add_argument('--report',required=True,type=Path);p.add_argument('--minimum',type=float,default=4.5);a=p.parse_args();binding_path=a.binding
try:
    result=run(a.snapshot,json.loads(a.binding.read_text()),a.root,a.minimum);code=1 if result['status']=='fail'else 0
except (ValueError,KeyError,TypeError,OSError,json.JSONDecodeError)as e:
    result={'schema':'contrast-check-result-1','checkedAtUtc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'status':'rejected','reason':str(e),'noContrastPassClaimed':True};code=2
a.report.parent.mkdir(parents=True,exist_ok=True);a.report.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n');print(json.dumps({'status':result['status'],'reason':result.get('reason'),'rows':[{k:r[k]for k in ['kind','contrastRatio','status']}for r in result.get('rows',[])]},ensure_ascii=False));raise SystemExit(code)
