#!/usr/bin/env node
// Offline search. Never import this search loop into the galactic map.
import { writeFile } from 'node:fs/promises';
import { summarizeSystem, generateSystem } from '../src/gen/system.js';
import { hostedLife, lifeHistory } from '../src/gen/lifeHistory.js';
import { systemDetails, surveyTargets } from '../src/campaign/surveyCatalogue.js';
import { validatePlacements } from '../src/campaign/systemPlacements.js';

const args={prefix:'SURVEY',start:'0',limit:'1000',life:'either',minSolid:'3',address:'0:0:2'};
for(let i=2;i<process.argv.length;i+=2){const k=process.argv[i].replace(/^--/,'');if(!['prefix','start','limit','life','minSolid','address','position','spectral','out'].includes(k)||process.argv[i+1]===undefined)throw Error('Use --prefix NAME --limit 1000 --life present|past|either|any --minSolid 3 --spectral GK --address 0:0:2 [--position 25,0,2] [--out file.json]');args[k]=process.argv[i+1];}
const start=+args.start,limit=+args.limit,minSolid=+args.minSolid;
if(!Number.isSafeInteger(start)||start<0||!Number.isSafeInteger(limit)||limit<1||limit>1000000||!Number.isInteger(minSolid)||minSolid<1||minSolid>256||!['present','past','either','any'].includes(args.life))throw Error('Invalid search bounds');
const probe={[args.address]:{definition:{version:1,seed:`${args.prefix}-${start}`},...(args.position?{position:args.position.split(',').map(Number)}:{})}};validatePlacements(probe);
let found=null,fullBuilds=0;const began=performance.now();
for(let i=start;i<start+limit;i++) {
  const seed=`${args.prefix}-${i}`,head=summarizeSystem(seed);
  if(args.spectral&&!args.spectral.includes(head.spectral[0]))continue;
  if(!head.nPlanets)continue;
  // Past life can lie outside today's HZ: never discard it using present habitability.
  const system=generateSystem(seed);fullBuilds++;
  if(system.bodies.filter(b=>b.solid).length<minSolid)continue;
  const candidates=system.bodies.filter(b=>b.kind==='planet'&&b.solid&&(args.life==='any'||args.life==='either'?args.life==='any'||hostedLife(b):lifeHistory(b)===args.life));
  if(!candidates.length)continue;
  found={seed,body:candidates[0],targets:surveyTargets(systemDetails(system))};break;
}
if(!found){console.error(`No match in ${limit} candidates (${fullBuilds} full builds). Resume with --start ${start+limit}.`);process.exitCode=1;}
else {
  probe[args.address].definition.seed=found.seed;
  const text=JSON.stringify(probe,null,2)+'\n';if(args.out)await writeFile(args.out,text);else process.stdout.write(text);
  console.error(JSON.stringify({seed:found.seed,eligibleBody:found.body.id,life:lifeHistory(found.body),surveyTargets:found.targets,fullBuilds,ms:Math.round(performance.now()-began)},null,2));
}
