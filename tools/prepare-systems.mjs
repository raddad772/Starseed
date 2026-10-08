#!/usr/bin/env node
import { mkdir,writeFile } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
import { resolve } from 'node:path';
import { createCampaign } from '../src/campaign/state.js';
import { ensureGalaxy,resolveSystem } from '../src/campaign/galaxy.js';
import { generateSystem } from '../src/gen/system.js';
import { systemRecord } from '../src/gen/systemCache.js';
import { fingerprint } from '../src/gen/systemRecipe.js';
import { encodeSystemPack } from '../src/gen/systemPack.js';

const region=process.argv[2]||'FSPB-8DTW',dir=resolve(process.argv[3]||'assets/systems');
const c=ensureGalaxy(createCampaign({seed:region})),index={version:1,region,systems:{}};
await mkdir(dir,{recursive:true});
for(const id of [c.galaxy.currentSystemId,c.generation.storyAnchors.receiver.systemId,'star/0/0/2','star/0/0/3']) {
  const e=resolveSystem(c,id),r=systemRecord(e.definition||e.seed,generateSystem(e.definition||e.seed));
  const filename=`${fingerprint(r.key)}.json.gz`,bytes=gzipSync(encodeSystemPack(r));
  await writeFile(resolve(dir,filename),bytes);index.systems[r.key]=filename;
  console.log(`${e.address} ${e.summary.name}: ${(bytes.length/1024).toFixed(0)} KiB packed / ${(r.bytes/1048576).toFixed(2)} MiB cache estimate`);
}
await writeFile(resolve(dir,'index.json'),JSON.stringify(index,null,2)+'\n');
