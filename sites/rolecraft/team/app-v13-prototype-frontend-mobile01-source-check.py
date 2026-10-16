"""Engineering CSS scope/structure check; not a CSS engine or viewport test."""
from pathlib import Path
import hashlib,json,re
p=Path(__file__).resolve().parent.parent
frozen=p/'team/app-v13-prototype-qa-history/candidate02/learning-experience-v13.css'
repaired=p/'team/app-v13-prototype-frontend-history/mobile01-repaired-client/learning-experience-v13.css'
patch=p/'team/app-v13-prototype-frontend-mobile01-patch.css'
a,b,c=frozen.read_bytes(),repaired.read_bytes(),patch.read_bytes()
assert hashlib.sha256(a).hexdigest()=='d190bdc09f0fb9b3ae4eb308cd52b358c935f69d3b9b93ae16ea4418789654bd'
assert b==a+c
text=re.sub(r'/\*.*?\*/','',c.decode(),flags=re.S)
assert text.count('{')==text.count('}') and text.count('(')==text.count(')')
assert all('v13-question-filters' in selector for selector in re.findall(r'(?:^|})\s*([^{}]+){',text) if not selector.strip().startswith('@media'))
assert not re.search(r'(?:font-size|line-height|overflow|text-overflow|display\s*:\s*none)\s*:',text)
assert '@media(max-width:480px)' in text and 'grid-template-columns:minmax(0,1fr)' in text
assert 'min-width:0;width:100%;max-width:100%;min-height:44px' in text
report={'version':'app-v13-prototype-frontend-mobile01-source-check-1','issueId':'UI2-MOBILE01','scope':'engineering appended CSS source scope and delimiter/constraint check only; full CSS parser unavailable, no computed browser layout','frozenSha256':hashlib.sha256(a).hexdigest(),'repairedSha256':hashlib.sha256(b).hexdigest(),'patchSha256':hashlib.sha256(c).hexdigest(),'facts':{'onlyAppendExactPatch':True,'selectorsRestrictedToFilterArea':True,'singleColumnOnlyAtOrBelow480':True,'controlsMinimum44px':True,'fontAndLongProseUnmodified':True,'noNewOverflowMaskOrHiddenContent':True},'real390ViewportVerified':False,'wideViewportVerified':False,'currentDistWrittenByThisTask':False}
(p/'team/app-v13-prototype-frontend-mobile01-source-check.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(report,ensure_ascii=False))
