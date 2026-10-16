#!/usr/bin/env python3
"""Offline structural replay verifier for AI-PRACTICE-SOURCE-001 artifacts."""
from pathlib import Path
import hashlib, json, sys
ROOT = Path(__file__).resolve().parent

def load(name):
    return json.loads((ROOT / name).read_bytes())
def digest(data):
    return hashlib.sha256(data).hexdigest()

def main():
    manifest = load('manifest.json')
    run1 = (ROOT / 'run-1/deterministic_output.json').read_bytes()
    run2 = (ROOT / 'run-2/deterministic_output.json').read_bytes()
    assert run1 == run2
    assert digest(run1) == manifest['run_1']['sha256'] == manifest['run_2']['sha256']
    assert len(run1) == manifest['run_1']['bytes'] == manifest['run_2']['bytes']
    receipts = load('tool_and_denial_receipts.json')
    assert [x['first_failure'] for x in receipts['denials']] == [
        'SOURCE_VERSION_MISMATCH', 'SOURCE_HASH_MISMATCH', 'UNBOUND_CLAIM', 'SOURCE_SCOPE_DENIED'
    ]
    for item in receipts['denials']:
        stop = item['stop_receipt']
        assert stop['draft'] is None and stop['handoff'] is None and stop['external_action'] is None
    hold = load('holdout-output.json')
    assert hold['dynamic_binding_verified'] is True
    assert hold['changed_keys'] == ['document_id', 'source_version', 'text']
    assert hold['tool_receipt']['hash'] == digest(hold['changed_document']['text'].encode())
    print(json.dumps({'replay': 'pass', 'run_bytes': len(run1), 'run_sha256': digest(run1), 'first_failures': [x['first_failure'] for x in receipts['denials']]}, ensure_ascii=False, sort_keys=True))

if __name__ == '__main__':
    main()
