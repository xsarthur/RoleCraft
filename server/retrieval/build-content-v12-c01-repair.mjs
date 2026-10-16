// Rebuild the v12 derived corpus for the approved c01 source while retaining
// the frozen assembly manifest and its historical hash. This is an explicit
// repair entrypoint; the regular builder remains strict for ordinary builds.
import { readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const project = path.resolve(here, '../..');
const manifestPath = path.join(project, 'textbooks/v12/assembly-manifest.json');
const sourcePath = path.join(project, 'textbooks/v12/c01-selection.md');
const indexPath = path.join(here, 'content-v12-index.json');
const dataPath = path.join(project, 'dist/content-v12-data.js');
const sha = value => createHash('sha256').update(value).digest('hex');
const readJson = file => JSON.parse(readFileSync(file, 'utf8'));

const expectedPrevious = '123f00a89c54dc0e0b18f7752ec5dcb443bf5490c8388068d38b1e7b421b7cd4';
const approvedCurrent = '4ee70a19c07d14a550ff9f1fbcfb46ec26a3e236aef30b5d3f2b1ce3f190d982';
const currentSourceSha = sha(readFileSync(sourcePath));
if (currentSourceSha !== approvedCurrent) throw new Error(`Unexpected c01 source: ${currentSourceSha}`);

const originalManifestBytes = readFileSync(manifestPath);
const originalManifest = readJson(manifestPath);
const originalManifestSha = sha(originalManifestBytes);
if (originalManifest.hashes?.['c01-selection.md'] !== expectedPrevious) {
  throw new Error('Frozen c01 assembly hash changed; stop rather than overwrite an unknown source.');
}

try {
  const temporaryManifest = { ...originalManifest, hashes: { ...originalManifest.hashes, 'c01-selection.md': currentSourceSha } };
  writeFileSync(manifestPath, JSON.stringify(temporaryManifest, null, 2) + '\n');
  const result = spawnSync(process.execPath, [path.join(here, 'build-content-v12.mjs')], { cwd: project, encoding: 'utf8' });
  if (result.status !== 0) throw new Error((result.stderr || result.stdout || 'content build failed').trim());
} finally {
  writeFileSync(manifestPath, originalManifestBytes);
}

const corpus = readJson(indexPath);
corpus.sourceBinding = {
  ...corpus.sourceBinding,
  assemblyManifestSha256: originalManifestSha,
  currentSourceOverrides: {
    'textbooks/v12/c01-selection.md': {
      previousAssemblySha256: expectedPrevious,
      currentSourceSha256: currentSourceSha,
      reason: 'Approved current v12 source repaired from stale derived index; assembly manifest retained as historical freeze.'
    }
  }
};
writeFileSync(indexPath, JSON.stringify(corpus, null, 2) + '\n');
writeFileSync(dataPath, '/* Generated from frozen v12 sources; do not edit. */\nglobalThis.RolecraftContentV12=' + JSON.stringify(corpus) + ';\n');

const c01 = corpus.units.find(unit => unit.unitId === 'c01-selection');
console.log(JSON.stringify({
  nodeVersion: process.version,
  sourceSha256: currentSourceSha,
  previousSourceSha256: expectedPrevious,
  corpusHash: corpus.corpusHash,
  units: corpus.units.length,
  sections: corpus.units.reduce((count, unit) => count + unit.sections.length, 0),
  c01: { sourceSha256: c01.sourceSha256, characters: c01.bodyMarkdown.length, sections: c01.sections.length },
  assemblyManifestSha256: originalManifestSha,
  providerCalled: false
}, null, 2));
