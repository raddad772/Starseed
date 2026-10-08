import { systemRecipe, systemIdentity } from '../gen/systemRecipe.js';
import { summarizeSystem } from '../gen/system.js';

// Author these inputs, or paste the output from tools/find-system.mjs. A fresh
// expedition copies them; subsequent edits cannot move an existing save's worlds.
export const OPENING_PLACEMENTS = {};
export function openingPlacements(regionSeed) { return structuredClone(OPENING_PLACEMENTS[regionSeed] || {}); }
export function validatePlacements(placements) {
  if(placements===undefined)return;
  if(!placements||typeof placements!=='object'||Array.isArray(placements)||Object.keys(placements).length>512)throw Error('Invalid system placements');
  for(const [address,p] of Object.entries(placements)) {
    const a=/^(-?\d+):(-?\d+):([0-7])$/.exec(address);
    if(!a||Math.abs(+a[1])>100000||Math.abs(+a[2])>100000||`${+a[1]}:${+a[2]}:${+a[3]}`!==address)throw Error('Invalid placement address');
    if(!p||Object.keys(p).some(k=>!['definition','position','label'].includes(k)))throw Error('Invalid system placement');
    systemRecipe(p.definition);summarizeSystem(p.definition); // cheap input validation only
    if(p.position!==undefined&&(!Array.isArray(p.position)||p.position.length!==3||p.position.some(n=>!Number.isFinite(n)||Math.abs(n)>1e6)))throw Error('Invalid placement position in parsecs');
    if(p.label!==undefined&&(typeof p.label!=='string'||p.label.length>128))throw Error('Invalid placement label');
  }
  const seeds=Object.values(placements).map(p=>systemIdentity(p.definition));
  if(new Set(seeds).size!==seeds.length)throw Error('Each placed system needs its own identity');
}
