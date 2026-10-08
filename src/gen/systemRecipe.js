// Portable generation inputs. Derived radii, gravity, climate and life are never patched.
import { hashStr } from '../core/rng.js';

export const RECIPE_VERSION = 1;
const fail = m => { throw Error(`System recipe: ${m}`); };
const object = v => v && Object.getPrototypeOf(v) === Object.prototype;
function fields(v, allowed, path) {
  if (!object(v) || Object.keys(v).some(k => !allowed.includes(k))) fail(`invalid fields in ${path}`);
}
const num = (v, lo, hi, path) => { if (!Number.isFinite(v) || v < lo || v > hi) fail(`invalid ${path}`); };
const name = (v, path) => { if (typeof v !== 'string' || !v.trim() || v.length > 128) fail(`invalid ${path}`); };
function composition(c) {
  fields(c, ['iron','rock','water','envelope'], 'composition');
  for (const k of ['iron','rock','water','envelope']) num(c[k], 0, 1, k);
  if (Math.abs(c.iron+c.rock+c.water-1) > 1e-6) fail('iron + rock + water must sum to 1 (envelope is separate)');
}
function planet(p, partial=false) {
  fields(p, ['name','aAU','massEarth','comp','orbit','spin','moons'], 'planet');
  if (p.name !== undefined) name(p.name, 'planet name');
  if (!partial || p.aAU !== undefined) num(p.aAU, .018, 1000, 'planet orbit in AU');
  if (!partial || p.massEarth !== undefined) num(p.massEarth, .00001, 5000, 'planet mass');
  if (!partial || p.comp !== undefined) composition(p.comp);
  if (p.orbit !== undefined) {
    fields(p.orbit, ['e','i','Om','w','M0'], 'orbit');
    for (const [k,v] of Object.entries(p.orbit)) num(v, 0, k==='e'?.8:k==='i'?Math.PI:Math.PI*2, `orbit.${k}`);
  }
  if (p.spin !== undefined) {
    fields(p.spin, ['hours','tiltDegrees','retrograde'], 'spin');
    num(p.spin.hours, .5, 100000, 'spin hours');num(p.spin.tiltDegrees, 0, 180, 'spin tilt');
    if (p.spin.retrograde !== undefined && typeof p.spin.retrograde !== 'boolean') fail('invalid retrograde flag');
  }
  if (p.moons !== undefined) {
    if (!Array.isArray(p.moons) || p.moons.length > 16) fail('expected up to 16 moons');
    for (const m of p.moons) {
      fields(m, ['name','aKm','massEarth','comp','e','i','tidalHeating'], 'moon');
      if (m.name !== undefined) name(m.name, 'moon name');
      num(m.aKm, 1, 1e8, 'moon orbit in km');num(m.massEarth, 1e-8, 100, 'moon mass');composition(m.comp);
      for (const [k,hi] of [['e',.8],['i',Math.PI],['tidalHeating',1]]) if(m[k]!==undefined)num(m[k],0,hi,k);
    }
  }
}
export function systemRecipe(input) {
  if (typeof input === 'string') { name(input, 'seed'); return {version:RECIPE_VERSION, seed:input}; }
  fields(input, ['version','seed','star','planets','planetOverrides','startPlanet'], 'recipe');
  if (input.version !== RECIPE_VERSION) fail('unsupported version');
  name(input.seed, 'seed');
  if (input.star !== undefined) {
    fields(input.star, ['name','catalog','mass','age','metallicity'], 'star');
    for (const k of ['name','catalog']) if(input.star[k]!==undefined)name(input.star[k],k);
    for (const [k,lo,hi] of [['mass',.08,3],['age',.001,12.5],['metallicity',-.8,.45]])if(input.star[k]!==undefined)num(input.star[k],lo,hi,k);
  }
  if (input.planets !== undefined) {
    if (!Array.isArray(input.planets) || !input.planets.length || input.planets.length > 16) fail('expected 1–16 planets');
    input.planets.forEach(p=>planet(p));
  }
  if (input.planetOverrides !== undefined) {
    if (input.planets || !object(input.planetOverrides) || Object.keys(input.planetOverrides).some(k=>! /^(?:[0-9]|1[0-5])$/.test(k))) fail('use planets OR planetOverrides indexed from zero');
    Object.values(input.planetOverrides).forEach(p=>planet(p,true));
  }
  if (input.startPlanet !== undefined && (!Number.isInteger(input.startPlanet) || input.startPlanet<0 || input.startPlanet>15)) fail('invalid startPlanet');
  return JSON.parse(canonical(input));
}
export function canonical(v) {
  if (Array.isArray(v)) return `[${v.map(canonical).join(',')}]`;
  if (v && typeof v==='object') return `{${Object.keys(v).sort().map(k=>`${JSON.stringify(k)}:${canonical(v[k])}`).join(',')}}`;
  return JSON.stringify(v);
}
export const fingerprint = v => hashStr(typeof v==='string'?v:canonical(v)).map(n=>n.toString(16).padStart(8,'0')).join('');
// Authored changes get distinct local storage/world-sim namespaces. Plain seeds keep old saves intact.
export function systemIdentity(input) {
  const r=systemRecipe(input);
  return Object.keys(r).length===2 ? r.seed : `D-${fingerprint(r)}`;
}
export const isAuthored = input => Object.keys(systemRecipe(input)).length>2;
