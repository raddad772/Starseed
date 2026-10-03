// Big ships modelled in Blender (tools/blender/build_carrier.py) and loaded as
// glTF. The exported materials are only names: each is swapped for the game's
// own (interiors lit by their fixtures alone, glows as plain emissive colour),
// the hull is painted in the ship's livery through its vertex-colour mask
// (R main colour, G second colour, B stripes, A grime) with plate seams drawn
// in the hull's own coordinates, and of the interior only the rooms near you
// are drawn: the room you're in and those within two doorways of it.

import * as THREE from 'three';
import { GLTFLoader } from '../../vendor/addons/loaders/GLTFLoader.js';
import { interiorMaterial, fixtureLit } from './lightRig.js';
import { makeForceField } from './bigShips.js';

export const DEFAULT_LIVERY = { main: '#737a82', second: '#3b4046', stripe: '#8c2418' };

const loads = new Map();
export function loadShipModel(url) {
  if (!loads.has(url)) loads.set(url, new GLTFLoader().loadAsync(url));
  return loads.get(url);
}

// ------------------------------------------------------------------ materials

const PAINT_CHUNK = /* glsl */`
#if defined( USE_COLOR_ALPHA )
  vec4 mask = vColor;
#elif defined( USE_COLOR )
  vec4 mask = vec4( vColor, 0.0 );
#else
  vec4 mask = vec4( 1.0, 0.0, 0.0, 0.0 );
#endif
vec3 paint = mix( mix( uPaint1, uPaint2, mask.g ), uPaint3, mask.b );
// plates: seams and a little tone from plate to plate, on the face's dominant plane
vec3 an = abs( vObjN );
vec2 q = an.x > max( an.y, an.z ) ? vObjPos.zy : ( an.y > an.z ? vObjPos.xz : vObjPos.xy );
vec2 cs = vec2( 9.0, 4.5 );
vec2 f = fract( q / cs ) - 0.5;
vec2 fw = fwidth( q / cs );
float fade = 1.0 - smoothstep( 0.03, 0.12, max( fw.x, fw.y ) );
float seam = fade * max( 1.0 - smoothstep( 0.0, 1.5 * fw.x + 0.004, 0.5 - abs( f.x ) ), 1.0 - smoothstep( 0.0, 1.5 * fw.y + 0.004, 0.5 - abs( f.y ) ) );
float tone = fract( sin( dot( floor( q / cs ), vec2( 12.9898, 78.233 ) ) ) * 43758.5453 );
diffuseColor.rgb *= paint * ( 0.9 + 0.12 * tone ) * ( 1.0 - 0.35 * seam ) * ( 1.0 - 0.45 * mask.a );
`;

// the hull's paint: three colours mixed by the model's mask, changeable any time
export function liveryMaterial(livery = DEFAULT_LIVERY) {
  const m = new THREE.MeshStandardMaterial({ vertexColors: true, metalness: 0.5, roughness: 0.5 });
  const U = {
    uPaint1: { value: new THREE.Color(livery.main) },
    uPaint2: { value: new THREE.Color(livery.second) },
    uPaint3: { value: new THREE.Color(livery.stripe) },
  };
  m.userData.livery = U;
  m.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, U);
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vObjPos;\nvarying vec3 vObjN;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvObjPos = position;\nvObjN = normal;');
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\nuniform vec3 uPaint1;\nuniform vec3 uPaint2;\nuniform vec3 uPaint3;\nvarying vec3 vObjPos;\nvarying vec3 vObjN;')
      .replace('#include <color_fragment>', PAINT_CHUNK);
  };
  m.customProgramCacheKey = () => 'livery';
  return fixtureLit(m);
}

export function setLivery(m, livery) {
  const U = m.userData.livery;
  if (!U) return;
  if (livery.main) U.uPaint1.value.set(livery.main);
  if (livery.second) U.uPaint2.value.set(livery.second);
  if (livery.stripe) U.uPaint3.value.set(livery.stripe);
}

const INTERIOR = {
  Wall: [0x9aa1a7, 0.1, 0.65], Floor: [0x34383c, 0.25, 0.7], Ceiling: [0x7a8086, 0.1, 0.7],
  Trim: [0x4a5056, 0.5, 0.45], Grate: [0x3c4044, 0.7, 0.5], Hazard: [0xd6a02a, 0.1, 0.6],
  Console: [0x23272b, 0.4, 0.4], Fabric: [0x36506e, 0, 0.9], Wood: [0x6b4a2e, 0, 0.6],
  Plant: [0x2e7a2a, 0, 0.8], Crate: [0x5c6143, 0.2, 0.7], Metal: [0x23272c, 0.8, 0.35], Hull: [0x6e757c, 0.5, 0.5],
};
const EXTERIOR = { Metal: [0x1d2125, 0.8, 0.35] };
const GLOW = {
  WindowGlow: [0xffd9a0, 2.2], EngineGlow: [0x7fb4ff, 0.6], LightPanel: [0xfff0da, 3.5], Screen: [0x40d0f0, 2.4],
  Holo: [0x50d8ff, 2.0], Core: [0x5a8cff, 5], NavRed: [0xff2a1a, 4], NavGreen: [0x1aff4a, 4], NavWhite: [0xffffff, 4],
};

function glowMaterial(name) {
  const [c, k] = GLOW[name];
  const m = new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(k) });
  m.userData.cast = false;
  return m;
}

// ------------------------------------------------------------------ the model

// Returns at once (an empty group); fills in when the file has loaded.
export function buildGlbShip(engine, vessel) {
  const root = new THREE.Group();
  const out = {
    root, parts: {}, field: null, navLights: [], rooms: new Map(), glows: new Map(), hall: null,
    hull: liveryMaterial(vessel.livery),
    // the drive glow: brighter with the throttle (BigShipVisual drives it)
    glow: new THREE.MeshStandardMaterial({ color: 0x000000, emissive: new THREE.Color(0x7fb4ff), emissiveIntensity: 0.2 }),
    fields: [], loaded: false, templates: {},
  };
  const cache = {};
  const matFor = (name, inside) => {
    const key = (inside ? 'i:' : 'e:') + name;
    if (cache[key]) return cache[key];
    let m;
    if (name === 'Hull' && !inside) m = out.hull;
    else if (name === 'EngineGlow') m = out.glow;
    else if (GLOW[name]) m = glowMaterial(name);
    else if (inside) { const [c, met, r] = INTERIOR[name] || INTERIOR.Wall; m = interiorMaterial({ color: c, metalness: met, roughness: r }); }
    else { const [c, met, r] = EXTERIOR[name] || INTERIOR[name] || INTERIOR.Wall; m = fixtureLit(new THREE.MeshStandardMaterial({ color: c, metalness: met, roughness: r })); }
    return (cache[key] = m);
  };
  loadShipModel(vessel.type.model).then((gltf) => {
    const scene = gltf.scene.clone(true);
    // small craft carried aboard are models of their own (wherever they hang: the refit's
    // yacht is under its dock's mount)
    const carried = [];
    scene.traverse((o) => { const nm = o.userData.name || o.name; if (nm === 'yacht' || nm === 'pod') carried.push([nm, o]); });
    for (const [nm, o] of carried) { out.templates[nm] = o; o.parent.remove(o); }
    const nodes = [...scene.children];
    for (const n of nodes) {
      const name = n.userData.name || n.name;
      // (the turbolift runs inside the hull and stands in the bays: lit like the rooms)
      const inside = name.startsWith('room:') || name === 'eng-hall' || name === 'bastion:turbolift_system';
      n.traverse((o) => {
        if (!o.isMesh) return;
        const mname = o.material && o.material.name;
        if (mname === 'Glass') { o.visible = false; return; }
        if (mname === 'ForceField') return;
        o.material = matFor(mname, inside);
        o.castShadow = !inside && !GLOW[mname];
        o.receiveShadow = !inside && !GLOW[mname];
      });
      if (name.startsWith('room:')) { out.rooms.set(name.slice(5), n); n.visible = false; }
      else if (name === 'eng-hall') { out.hall = n; n.visible = false; }
      else if (name.startsWith('glow:')) out.glows.set(name.slice(5), n);
      else if (name === 'navlights') out.navLights.push(n);
      else if (name === 'bastion:turbolift_system') { out.turbolift = turboliftParts(n); out.parts[name] = n; }
      else if (name.startsWith('forcefield:')) {
        // the shimmering field, drawn with the transparent pass
        n.traverse((o) => {
          if (!o.isMesh) return;
          o.geometry.computeBoundingBox();
          const bb = o.geometry.boundingBox, size = new THREE.Vector3();
          bb.getSize(size);
          const f = makeForceField(Math.max(size.x, size.z), size.y);
          bb.getCenter(f.position);
          if (size.x < size.z) f.rotation.y = Math.PI / 2;
          out.fields.push(f);
        });
        scene.remove(n);
      } else out.parts[name] = n;
    }
    root.add(scene);
    out.loaded = true;
    if (out.onLoaded) out.onLoaded(out);
  }, (err) => console.error('ship model failed to load', vessel.type.model, err));
  return out;
}

// The turbolift's moving parts, by their names in the model: the car and its
// four door leaves (car_door_<end>_<side>: end 1 is the car's -z end), the
// landing doors' leaves (door_<station>_L / _R), the junctions' tongues
// (switch_<junction>_negative / _positive, sliding apart; vertical_tongues_
// <junction>, rising into the guideway). BigShipVisual moves them from the
// turbolift's state.
function turboliftParts(root) {
  const T = { car: null, carDoors: [], landing: [], switches: [], tongues: [] };
  root.traverse((o) => {
    const nm = o.userData.name || o.name;
    let m;
    if (nm === 'turbolift:car') T.car = o;
    else if ((m = /^turbolift:car_door_(-?1)_(-?1)$/.exec(nm))) T.carDoors.push({ o, end: -Number(m[1]), side: Number(m[2]), x0: o.position.x });
    else if ((m = /^turbolift:door_(.+)_([LR])$/.exec(nm))) T.landing.push({ o, st: m[1], side: m[2] === 'L' ? -1 : 1, x0: o.position.x });
    else if ((m = /^turbolift:switch_(.+)_(negative|positive)$/.exec(nm))) T.switches.push({ o, name: m[1], sign: m[2] === 'negative' ? -1 : 1 });
    else if ((m = /^turbolift:vertical_tongues_(.+)$/.exec(nm))) T.tongues.push({ o, name: m[1] });
  });
  return T;
}

// ------------------------------------------------------------------ what to draw inside

// Rooms within two doorways of the one you're in (doorways are rooms of their
// own in the layout, so that's four steps through the room graph); nothing
// but the bays when you're outside. Cached per room.
export function visibleRooms(interior, roomIndex) {
  const R = interior.rooms;
  interior._vis = interior._vis || new Map();
  if (interior._vis.has(roomIndex)) return interior._vis.get(roomIndex);
  const out = new Set();
  for (const r of R) if (r.type === 'bay') out.add(r.id);
  if (roomIndex >= 0) {
    const adj = interior.graph();
    const depth = new Map([[roomIndex, 0]]);
    const queue = [roomIndex];
    while (queue.length) {
      const i = queue.shift();
      out.add(R[i].id);
      if (depth.get(i) >= 4) continue;
      for (const e of adj[i]) {
        if (e.kind !== 'door' || depth.has(e.to)) continue;
        depth.set(e.to, depth.get(i) + 1);
        queue.push(e.to);
      }
    }
    // deep inside, the bays are only drawn when one is near
    const near = [...out].some((id) => id.startsWith('cross-') || id.startsWith('bay-') || id.startsWith('gallery'));
    if (!near) for (const r of R) if (r.type === 'bay') out.delete(r.id);
  }
  interior._vis.set(roomIndex, out);
  return out;
}

// ------------------------------------------------------------------ small craft

const _cv = new THREE.Vector3(), _pa = new THREE.Vector3(), _ph = new THREE.Vector3(), _pq = new THREE.Quaternion();

// A small craft whose model is a named node in a shared file (the yacht and
// the pods in the carrier's, the vehicles and landers in craft.glb): cloned,
// painted in the craft's livery. Its moving parts (a container's door, a
// ramp) are child nodes named '<template>:<part>', swung about their hinges
// from the vessel's door state (world state: the visual only reads it).
export class GlbCraftVisual {
  constructor(engine, vessel) {
    this.engine = engine;
    this.v = vessel;
    const root = new THREE.Group();
    this.model = { root };
    engine.scene.add(root);
    const t = vessel.type;
    const hull = liveryMaterial(vessel.livery || t.livery || { main: '#b9bec4', second: '#41464c', stripe: '#8c2418' });
    this.hull = hull; // (the Paint app sets its colours)
    this.parts = [];
    const cache = {};
    loadShipModel(t.model).then((gltf) => {
      let src = null;
      gltf.scene.traverse((n) => { if (!src && (n.userData.name || n.name) === t.template) src = n; });
      if (!src) return;
      const m = src.clone(true);
      m.position.set(0, 0, 0);
      if (t.templateTurn) m.rotation.y = t.templateTurn;
      m.traverse((o) => {
        if (!o.isMesh) return;
        const name = o.material && o.material.name;
        o.material = name === 'Hull' ? hull : (cache[name] || (cache[name] = GLOW[name] ? glowMaterial(name)
          : fixtureLit(new THREE.MeshStandardMaterial({ color: (EXTERIOR[name] || INTERIOR[name] || INTERIOR.Wall)[0], metalness: 0.6, roughness: 0.4 }))));
        o.castShadow = o.receiveShadow = !GLOW[name];
      });
      for (const pt of t.parts || []) {
        let node = null;
        m.traverse((o) => { if (!node && (o.userData.name || o.name) === `${t.template}:${pt.node}`) node = o; });
        if (node) this.parts.push({ pt, node, p0: node.position.clone(), q0: node.quaternion.clone() });
      }
      root.add(m);
    }, (err) => console.warn('craft model not loaded', t.model, err && err.message));
  }

  update(dt, camWorld) {
    const v = this.v, root = this.model.root;
    root.position.copy(v.getWorldPos(_cv)).sub(camWorld);
    root.quaternion.copy(v.quat);
    root.visible = !v.dead && root.position.length() < 300000;
    for (const P of this.parts) {
      _pq.setFromAxisAngle(_pa.fromArray(P.pt.axis), v.doors[P.pt.door].open * P.pt.angle);
      _ph.fromArray(P.pt.hinge);
      P.node.position.copy(P.p0).sub(_ph).applyQuaternion(_pq).add(_ph);
      P.node.quaternion.copy(_pq).multiply(P.q0);
    }
  }
}
