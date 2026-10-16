// Default is a read-only append proposal. PM must hand exclusive current CSS writes to the actual owner.
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const project=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),target=path.join(project,'dist/learning-experience-v13.css');
const patch=readFileSync(new URL('./app-v13-prototype-frontend-mobile01-patch.css',import.meta.url),'utf8'),source=readFileSync(target,'utf8'),hash=s=>createHash('sha256').update(s).digest('hex');
if(source.includes('/* UI2-MOBILE01:'))throw Error('This narrow patch is already present; do not append it twice or restore a frozen full CSS file.');
const args=process.argv.slice(2),write=args.includes('--write'),i=args.indexOf('--expected-sha256'),expected=i<0?null:args[i+1],currentSha256=hash(source),next=source+patch;
if(write){if(!/^[a-f0-9]{64}$/.test(expected||'')||expected!==currentSha256)throw Error('The explicit current-owner CSS source SHA256 must match before writing.');writeFileSync(target,next);}
const receipt={issueId:'UI2-MOBILE01',mode:write?'owner_requested_narrow_append_applied':'read_only_apply_check',target:'dist/learning-experience-v13.css',currentSha256,proposedSha256:hash(next),patchSha256:hash(patch),liveDistModified:write,preservation:'Preserves every existing byte including current v14/detail appended styles'};
if(!write)writeFileSync(new URL('./app-v13-prototype-frontend-mobile01-current-apply-check.json',import.meta.url),JSON.stringify(receipt,null,2)+'\n');
console.log(JSON.stringify(receipt));
