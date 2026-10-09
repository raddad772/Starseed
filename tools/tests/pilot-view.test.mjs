// Every fleet craft's pilot sees out ahead: from the pilot seat's eye, rays across the middle of the
// view (where the horizon is, and what's coming) pass out through glass, not into the ship. A
// carrier's flight deck 40 m back in its nose saw a slot through the hull; a small craft's pilot,
// sat by the cabin wall, saw the wall. (tools/blender: the decks at the bow, bridge_side_glazing in
// exterior.py; tools/blender/pilot_views.py maps the whole view)
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as THREE from 'three';
import { HORIZON_TYPES } from '../../src/sim/layouts/horizon.data.js';
import { EXPEDITION_TYPES } from '../../src/sim/layouts/expedition.data.js';
import { PIONEER_TYPES } from '../../src/sim/layouts/pioneer.data.js';

const SHIPS = [...Object.values(HORIZON_TYPES), ...Object.values(EXPEDITION_TYPES), ...Object.values(PIONEER_TYPES)];

// A GLB's triangles in the vessel's frame (glTF's frame is the game's: x starboard, y up, z aft),
// each with whether it's glass; only those within reach of a point.
function triangles(file, near, reach) {
  const b = readFileSync(new URL('../../' + file, import.meta.url));
  const n = b.readUInt32LE(12), g = JSON.parse(b.subarray(20, 20 + n)), bin = b.subarray(20 + n + 8);
  const view = (a) => { const acc = g.accessors[a], bv = g.bufferViews[acc.bufferView], off = (bv.byteOffset || 0) + (acc.byteOffset || 0);
    const T = { 5126: Float32Array, 5123: Uint16Array, 5125: Uint32Array, 5121: Uint8Array }[acc.componentType], k = { SCALAR: 1, VEC3: 3, VEC2: 2, VEC4: 4 }[acc.type];
    const stride = bv.byteStride ? bv.byteStride / T.BYTES_PER_ELEMENT : k, all = new T(bin.buffer, bin.byteOffset + off, (acc.count - 1) * stride + k);
    return (i, c = 0) => all[i * stride + c]; };
  const out = [], m = new THREE.Matrix4(), v = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()];
  const visit = (ni, parent) => {
    const nd = g.nodes[ni], local = new THREE.Matrix4();
    if (nd.matrix) local.fromArray(nd.matrix);
    else local.compose(new THREE.Vector3(...(nd.translation || [0, 0, 0])), new THREE.Quaternion(...(nd.rotation || [0, 0, 0, 1])), new THREE.Vector3(...(nd.scale || [1, 1, 1])));
    const world = parent.clone().multiply(local);
    if (nd.mesh !== undefined) for (const p of g.meshes[nd.mesh].primitives) {
      const pos = view(p.attributes.POSITION), idx = p.indices !== undefined ? view(p.indices) : (i) => i;
      const count = p.indices !== undefined ? g.accessors[p.indices].count : g.accessors[p.attributes.POSITION].count;
      const glass = /Glass/.test(g.materials[p.material]?.name || '');
      for (let i = 0; i < count; i += 3) {
        for (let k = 0; k < 3; k++) { const j = idx(i + k); v[k].set(pos(j, 0), pos(j, 1), pos(j, 2)).applyMatrix4(world); }
        if (Math.min(...v.map((q) => q.distanceTo(near))) > reach && v[0].distanceTo(near) > reach + v[0].distanceTo(v[1]) + v[0].distanceTo(v[2])) continue;
        out.push({ tri: new THREE.Triangle(v[0].clone(), v[1].clone(), v[2].clone()), glass });
      }
    }
    for (const c of nd.children || []) visit(c, world);
  };
  for (const r of g.scenes[g.scene || 0].nodes) visit(r, m);
  return out;
}

// (out through the glass: nothing but glass along the ray, as far as the ship reaches)
function clear(tris, eye, dir) {
  const ray = new THREE.Ray(eye, dir), at = new THREE.Vector3();
  for (const { tri, glass } of tris) if (!glass && ray.intersectTriangle(tri.a, tri.b, tri.c, false, at)) return false;
  return true;
}

for (const t of SHIPS) {
  const name = t.className.split(' —')[0];
  test(`${name}: the pilot sees out ahead`, () => {
    const s = t.seats.find((q) => q.pilot), eye = new THREE.Vector3(...s.eye);
    const tris = triangles(t.model, eye, 160);
    // (30 degrees either side, from 6 below the level to 14 above: the middle of a 70-degree view)
    let n = 0, ok = 0;
    for (let a = -30; a <= 30; a += 5) for (let e = -6; e <= 14; e += 5) {
      const h = a * Math.PI / 180, el = e * Math.PI / 180;
      const dir = new THREE.Vector3(Math.sin(h) * Math.cos(el), Math.sin(el), -Math.cos(h) * Math.cos(el));
      n++; if (clear(tris, eye, dir)) ok++;
    }
    assert.ok(ok / n >= 0.9, `${name}: ${(100 * ok / n).toFixed(0)}% of the view ahead is out through glass`);
  });
}
