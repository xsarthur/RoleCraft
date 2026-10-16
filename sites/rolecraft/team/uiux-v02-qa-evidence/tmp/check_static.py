from pathlib import Path
import re,json,hashlib,urllib.parse
b=Path('sites/rolecraft/textbooks/uiux-design-v02'); e=Path('sites/rolecraft/team/uiux-v02-qa-evidence'); m=json.loads((b/'assembly-manifest.json').read_text()); book=(b/'uiux-design-textbook.md').read_text(); checks=[]
anchors=list(re.finditer(r'<a id="(chapter-\d+)"></a>\s*\n',book)); blocks={}
for i,a in enumerate(anchors):
 end=anchors[i+1].start() if i+1<len(anchors) else len(book)
 chunk=book[a.end():end].strip()
 if chunk.endswith('---'): chunk=chunk[:-3].rstrip()
 blocks[a.group(1)]=chunk+'\n'
for x in m['chapters']:
 p=b/x['source']; raw=p.read_text(); trans=re.sub(r'(?<=\()\.\./(assets|exercises)/',r'\1/',raw).rstrip()+'\n'
 actual=blocks.get(x['anchor'],'')
 checks.append({'source':x['source'],'source_hash_match':hashlib.sha256(p.read_bytes()).hexdigest()==x['source_sha256'],'whole_body_equal':actual==trans,'included_hash_match':hashlib.sha256(actual.encode()).hexdigest()==x['included_body_sha256'],'source_chars':len(raw),'included_chars':len(actual)})
# markdown heading anchors preserving CJK and explicit IDs
files=[b/'README.md',b/'source-index.md',b/'uiux-design-textbook.md']+list((b/'chapters').glob('*.md'))+list((b/'exercises').glob('*.md'))
def anchors_in(p):
 s=p.read_text(); out=set(re.findall(r'<a id="([^"]+)"',s));counts={}
 for h in re.findall(r'^#{1,6}\s+(.+)$',s,re.M):
  slug=re.sub(r'[^\w\-\s]','',h.lower()).replace(' ','-');n=counts.get(slug,0);counts[slug]=n+1;out.add(slug+(f'-{n}' if n else ''))
 return out
links=[]
for f in files:
 s=f.read_text();s=re.sub(r'```.*?```','',s,flags=re.S)
 for match in re.finditer(r'!?\[[^\]]*\]\(([^)]+)\)',s):
  link=match.group(1)
  if link.startswith(('http:','https:','mailto:')):continue
  path,_,anchor=urllib.parse.unquote(link).partition('#');p=f.parent/path if path else f
  exists=p.exists(); ok=exists and (not anchor or p.suffix!='.md' or anchor in anchors_in(p))
  links.append({'file':str(f),'target':link,'ok':ok})
assets=[{'path':x['path'],'match':hashlib.sha256((b/x['path']).read_bytes()).hexdigest()==x['sha256']} for x in m['assets']]
r={'assembly_version':m['version'],'chapter_count':len(checks),'chapter_checks':checks,'link_count':len(links),'link_failures':[x for x in links if not x['ok']],'asset_manifest_checks':assets}
(e/'static-first.json').write_text(json.dumps(r,ensure_ascii=False,indent=2));print(json.dumps(r,ensure_ascii=False,indent=2))
