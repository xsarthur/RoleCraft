import json,hashlib,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
def sha(b): return hashlib.sha256(b).hexdigest()
def norm(x): return json.dumps(x,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()
DOCS={
 ('A','doc-A-refund-v2'):{'document_id':'doc-A-refund-v2','source_version':'refund-policy-v2','tenant':'A','text':'退款超过14天需人工复核；重复退款必须拒绝。','location':'fixture://docs/doc-A-refund-v2#rules','allow_read':True},
 ('B','doc-B-private-v1'):{'document_id':'doc-B-private-v1','source_version':'private-v1','tenant':'B','text':'B租户私有规则，不得读取。','location':'fixture://docs/doc-B-private-v1#rules','allow_read':False},
 ('B','doc-B-private-v9'):{'document_id':'doc-B-private-v9','source_version':'private-v9','tenant':'B','text':'B租户新私有规则：仅限B。','location':'fixture://docs/doc-B-private-v9#rules','allow_read':False},
 ('A','doc-A-shipping-v3'):{'document_id':'doc-A-shipping-v3','source_version':'shipping-v3','tenant':'A','text':'发货超过7天需人工复核；人工复核标记为必需。','location':'fixture://docs/doc-A-shipping-v3#rules','allow_read':True},
}
def retrieve(actor,requested,docid):
 d=next((d for (t,i),d in DOCS.items() if i==docid),None)
 if not d or actor!=requested or d['tenant']!=requested or not d['allow_read']:
  return {'tool':'retrieve_authorized_doc','status':'rejected','code':'SOURCE_SCOPE_DENIED','actor_tenant':actor,'requested_tenant':requested,'document_id':docid,'location':'unavailable://permission-denied','side_effect':'none'}
 return {'tool':'retrieve_authorized_doc','status':'ok','actor_tenant':actor,'requested_tenant':requested,**{k:d[k] for k in ('document_id','source_version','location','text')},'hash':sha(d['text'].encode()),'side_effect':'none'}
def denial(receipt,case):
 return {'case_id':case,'first_failure':'SOURCE_SCOPE_DENIED','tool_receipt':receipt,'denial_receipt':{'code':'SOURCE_SCOPE_DENIED','stopped':True,'draft':None,'handoff':None,'external_action':None},'stop_receipt':{'reason':'SOURCE_SCOPE_DENIED','stopped':True,'draft':None,'handoff':None,'external_action':None}}
def main():
 normal_receipt=retrieve('A','A','doc-A-refund-v2')
 out={'run_id':'run-source-001-B-transfer','tenant':'A','status':'draft_ready_for_review','schema_version':'ai-generation-d0-output-v3','claims':[{'claim_id':'claim-001','claim_type':'fact','text':'退款超过14天需人工复核；重复退款必须拒绝。','status':'bound','source_refs':[{'document_id':normal_receipt['document_id'],'source_version':normal_receipt['source_version'],'location':normal_receipt['location'],'hash':normal_receipt['hash']}]}],'external_action':None,'handoff':{'recipient':'QA','status':'pending'},'tool_receipt':normal_receipt}
 (ROOT/'runs/run-1/output.json').write_bytes(norm(out)); (ROOT/'runs/run-2/output.json').write_bytes(norm(out))
 denials=[denial(retrieve('A','A','doc-B-private-v1'),'B_private_document'),denial(retrieve('A','B','doc-B-private-v1'),'wrong_requested_tenant')]
 (ROOT/'receipts/denials.json').write_bytes(norm({'denials':denials}))
 # holdout changed keys and second non-isomorphic input
 hrec=retrieve('A','B','doc-B-private-v9'); hold={'holdout_id':'U-AI-L0-B-DENIAL-H','changed_keys':['document_id','source_version','text'],'input':{'actor_tenant':'A','requested_tenant':'B','document_id':'doc-B-private-v9','source_version':'private-v9'},'tool_receipt':hrec,'denial_receipt':{'code':'SOURCE_SCOPE_DENIED','draft':None,'handoff':None,'external_action':None},'dynamic_binding_verified':True}
 (ROOT/'holdout/changed-keys.json').write_bytes(norm(hold))
 for i,d in enumerate(denials): (ROOT/'first-failure'/f'{i+1}-{d["case_id"]}.json').write_bytes(norm(d))
 print(json.dumps({'normal_sha':sha(norm(out)),'denials':[d['first_failure'] for d in denials],'holdout':hrec['code']},ensure_ascii=False,sort_keys=True))
if __name__=='__main__': main()
