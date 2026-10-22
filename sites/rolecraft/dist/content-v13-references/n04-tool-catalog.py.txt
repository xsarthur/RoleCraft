"""Permission-filtered lexical catalog and invocation gates, not an MCP server."""
from dataclasses import dataclass, replace
import json
import re

@dataclass(frozen=True)
class Tool:
    name: str
    version: int
    scope: str
    description: str
    terms: frozenset[str]
    fields: frozenset[str]
    mutates: bool = False

@dataclass(frozen=True)
class Credential:
    subject: str
    audience: str
    scopes: frozenset[str]
    expires_at: int
    revoked: bool = False


def discover(query, catalog, scopes, limit=3):
    # Deliberate ASCII token fixture: not Chinese semantic retrieval.
    terms = set(re.findall(r'[a-z_]+', query.lower()))
    visible = [t for t in catalog.values() if t.scope in scopes]
    ranked = [(len(terms & t.terms),t) for t in visible]
    ranked.sort(key=lambda x:(-x[0],x[1].name))
    return [t for score,t in ranked if score > 0][:limit]


def gate(name, version, args, catalog, credential, now, expected_subject,
         target_audience='reports-service', allowed_report_ids=frozenset({'r1'})):
    if credential.revoked or credential.expires_at <= now:
        return 'CREDENTIAL_EXPIRED_OR_REVOKED'
    if credential.audience != target_audience or credential.subject != expected_subject:
        return 'CREDENTIAL_BINDING'
    tool = catalog.get(name)
    if not tool:
        return 'UNREGISTERED'
    if tool.version != version:
        return 'CATALOG_CHANGED'
    if tool.scope not in credential.scopes:
        return 'SCOPE_DENIED'
    if type(args) is not dict or set(args) != tool.fields:
        return 'ARGUMENT_FIELDS'
    if any(type(v) is not str or not v.strip() or len(v)>200 for v in args.values()):
        return 'ARGUMENT_TYPES'
    if 'report_id' in args and args['report_id'] not in allowed_report_ids:
        return 'RESOURCE_DENIED'
    if tool.mutates:
        return 'EXACT_APPROVAL_REQUIRED'
    return 'READ_ALLOWED'


def negotiate(requested, offered, supported):
    if requested not in supported:
        return 'INVALID_REQUEST_VERSION'
    return 'READY' if offered in supported else 'DISCONNECT_UNSUPPORTED'


def main():
    catalog = {f'metric_{i}':Tool(f'metric_{i}',1,'metrics.read','Read a metric',
                               frozenset({f'metric_{i}'}),frozenset({'metric_id'}))
               for i in range(100)}
    for tool in [
        Tool('search_reports',1,'reports.read','Find report IDs, not report content',
             frozenset({'find','search','report','failure'}),frozenset({'query'})),
        Tool('read_report',1,'reports.read','Read a known report ID',
             frozenset({'read','report','id'}),frozenset({'report_id'})),
        Tool('create_issue',1,'issues.write','Create issue only after exact approval',
             frozenset({'create','issue','report'}),frozenset({'report_id'}),True)
    ]:
        catalog[tool.name]=tool
    credential = Credential('user1','reports-service',frozenset({'reports.read'}),100)
    candidates = discover('find failure report',catalog,credential.scopes)
    assert candidates[0].name == 'search_reports'
    assert all(t.scope in credential.scopes for t in candidates)
    assert discover('photograph',catalog,credential.scopes) == []
    args={'report_id':'r1'}
    assert gate('read_report',1,args,catalog,credential,1,'user1') == 'READ_ALLOWED'
    assert gate('read_report',1,{'report_id':'r2'},catalog,credential,1,'user1') == 'RESOURCE_DENIED'
    assert gate('read_report',1,args,catalog,credential,100,'user1') == 'CREDENTIAL_EXPIRED_OR_REVOKED'
    assert gate('read_report',1,args,catalog,replace(credential,audience='other'),1,'user1') == 'CREDENTIAL_BINDING'
    assert gate('read_report',1,args,catalog,replace(credential,scopes=frozenset()),1,'user1') == 'SCOPE_DENIED'
    catalog['read_report']=replace(catalog['read_report'],version=2)
    assert gate('read_report',1,args,catalog,credential,1,'user1') == 'CATALOG_CHANGED'
    assert negotiate('2025-11-25','unknown',{'2025-11-25'}) == 'DISCONNECT_UNSUPPORTED'
    assert negotiate('2025-11-25','2025-11-25',{'2025-11-25'}) == 'READY'
    print(json.dumps({'status':'SELF_CHECK_OK','catalog_size':len(catalog),
                      'candidates':[t.name for t in candidates],
                      'boundary':'fixture gates only; no OAuth or MCP transport'},sort_keys=True))

if __name__ == '__main__':
    main()
