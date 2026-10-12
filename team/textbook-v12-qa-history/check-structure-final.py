import pathlib,json,hashlib,re,urllib.parse,datetime
root=pathlib.Path(__file__).resolve().parents[4];book=root/'sites/rolecraft/textbooks/v12';team=root/'sites/rolecraft/team'
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
c=json.loads((team/'textbook-v12-curriculum.json').read_text());order=c['readingOrder'];issues=[]
for unit in c['units']:
 for pre in unit['prerequisites']:
  if order.index(pre)>=order.index(unit['id']):issues.append(['prerequisite_order',unit['id'],pre])
old=[]
for p in (book.parent/'v10').glob('*.md'):
 if p.name in ['README.md','agent-engineering-textbook.md','00-learning-route.md']:continue
 same=(book/p.name).read_text().startswith(p.read_text());old.append({'file':p.name,'exact_old_prefix':same})
 if not same:issues.append(['old_body_changed',p.name])
links=0
for p in list(book.glob('*.md'))+[book/'examples/README.md']:
 text=re.sub(r'```.*?```','',p.read_text(),flags=re.S)
 for href in re.findall(r'!?\[[^\]]*\]\(([^\s)]+)\)',text):
  if re.match(r'\w+://|mailto:',href):continue
  raw,_,frag=href.partition('#');target=(p.parent/urllib.parse.unquote(raw)).resolve() if raw else p
  links+=1
  if not target.exists():issues.append(['missing_file',str(p.relative_to(book)),href]);continue
  if frag and target.suffix=='.md':
   headings=re.findall(r'^#{1,6}\s+(.+)$',target.read_text(),re.M);slugs=[];seen={}
   for h in headings:
    s=re.sub(r'[^\w\-\s]','',h.lower()).replace(' ','-');n=seen.get(s,0);seen[s]=n+1;slugs.append(s+(f'-{n}' if n else ''))
   anchors=re.findall(r'<a\s+id=["\']([^"\']+)',target.read_text())
   if urllib.parse.unquote(frag) not in slugs+anchors:issues.append(['anchor_candidate',str(p.relative_to(book)),href])
m=json.loads((book/'assembly-manifest.json').read_text());mismatch=[n for n,h in m['hashes'].items() if sha(book/n)!=h]
baseline=json.loads((team/'textbook-v12-qa-baseline.json').read_text());protected=[n for n,h in baseline['protected_files'].items() if sha(root/n)!=h]
r={'at':datetime.datetime.now().astimezone().isoformat(),'order_count':len(order),'unique_order_count':len(set(order)),'old_body_prefix_checks':old,'local_link_count':links,'issues':issues,'manifest_hash_mismatches':mismatch,'protected_count':len(baseline['protected_files']),'protected_changes':protected}
(team/'textbook-v12-qa-history/structure-final.json').write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n');print(json.dumps(r,ensure_ascii=False,indent=2))
