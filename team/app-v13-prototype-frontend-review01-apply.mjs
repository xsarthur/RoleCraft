// Local handoff helper. Check is read-only; actual owner must obtain PM exclusive write handoff first.
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const project=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const patch=JSON.parse(readFileSync(new URL('./app-v13-prototype-frontend-review01-patch.json',import.meta.url),'utf8'));
const target=path.join(project,patch.target),source=readFileSync(target,'utf8'),sha256=content=>createHash('sha256').update(content).digest('hex');
const args=process.argv.slice(2),write=args.includes('--write'),at=args.indexOf('--expected-sha256'),expected=at>=0?args[at+1]:null;
const occurrences=source.split(patch.oldFragment).length-1;
if(occurrences!==1)throw Error('The completion fragment is already changed or not uniquely present; do not replace the current file with a v13 full snapshot.');
const currentSha256=sha256(source),next=source.replace(patch.oldFragment,patch.newFragment);
if(write){if(!/^[a-f0-9]{64}$/.test(expected||'')||expected!==currentSha256)throw Error('Current source SHA256 must exactly match the explicit owner handoff value.');writeFileSync(target,next);}
const receipt={issueId:patch.issueId,mode:write?'owner_requested_local_patch_applied':'read_only_apply_check',target:patch.target,currentSha256,proposedSha256:sha256(next),oldFragmentOccurrences:occurrences,liveDistModified:write,preservation:'Only the exact completion fragment changes; no original v13 full-source restore'};
if(!write)writeFileSync(new URL('./app-v13-prototype-frontend-review01-current-apply-check.json',import.meta.url),JSON.stringify(receipt,null,2)+'\n');
console.log(JSON.stringify(receipt));
