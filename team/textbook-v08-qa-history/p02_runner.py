import importlib.util
import json
import pathlib
import sys
from dataclasses import replace
from hashlib import sha256

spec=importlib.util.spec_from_file_location('guard',pathlib.Path.cwd()/'runner.py')
guard=importlib.util.module_from_spec(spec);sys.modules['guard']=guard;spec.loader.exec_module(guard)
m=guard.load('p02')
guard.check('p02:default_outputs',guard.main_body(m),['INDEX_OK','HASH_MISMATCH','VERSION_MISMATCH'])
root=pathlib.Path.cwd()/'bundle';root.mkdir();content=b'fixture-record\n';(root/'record.json').write_bytes(content)
entry=m.EvidenceRef('fixture-record','record.json',sha256(content).hexdigest(),'fixture-v1','constructed_fixture','offline-qa')
guard.check('p02:valid_classified_record',m.verify_index(root,'fixture-v1',[entry])[0],'INDEX_OK')
outside=pathlib.Path.cwd()/'outside.json';outside.write_bytes(content)
(root/'outside-link.json').symlink_to(outside)
for name,changed,code in [('absolute',replace(entry,relative_path=str(outside)),'PATH_NOT_RELATIVE'),
    ('traversal',replace(entry,relative_path='../outside.json'),'PATH_ESCAPES_BUNDLE'),
    ('symlink',replace(entry,relative_path='outside-link.json'),'PATH_ESCAPES_BUNDLE'),
    ('missing_file',replace(entry,relative_path='absent.json'),'FILE_MISSING'),
    ('classification',replace(entry,kind=''),'CLASSIFICATION_MISSING')]:
    status,issues=m.verify_index(root,'fixture-v1',[changed])
    guard.check('p02:'+name,[status,(changed.evidence_id,code) in issues],['INDEX_INVALID',True])
guard.check('p02:duplicate_id',('fixture-record','DUPLICATE_EVIDENCE_ID') in m.verify_index(root,'fixture-v1',[entry,entry])[1])
print(json.dumps({'status':'passed_within_offline_bundle_index_scope','records':guard.records},ensure_ascii=False,indent=2))
