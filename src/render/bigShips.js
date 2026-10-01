// Big ships: the Halyard-class tender (330 m, two dorsal docking pads).
// (The Bastion-class carrier is modelled in Blender: render/glbShip.js.)
// Built from the layouts in sim/vesselTypes.js, so hull, decks and rooms line
// up with what the physics collides with and the player walks on. Hundreds
// of parts are merged per material: each ship is a handful of draw calls.

import * as THREE from 'three';
import { TENDER } from '../sim/vesselTypes.js';
import { interiorMaterial } from './lightRig.js';

// ---------------------------------------------------------------- geometry kit

const V = (x, y, z) => new THREE.Vector3(x, y, z);
const _n = new THREE.Vector3();

function newell(pts, out) {
  out.set(0, 0, 0);
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i], b = pts[(i + 1) % pts.length];
    out.x += (a.y - b.y) * (a.z + b.z);
    out.y += (a.z - b.z) * (a.x + b.x);
    out.z += (a.x - b.x) * (a.y + b.y);
  }
  return out.normalize();
}

class Kit {
  constructor() { this.buckets = new Map(); }

  bucket(key) {
    let b = this.buckets.get(key);
    if (!b) { b = { pos: [], nrm: [], uv: [], idx: [] }; this.buckets.set(key, b); }
    return b;
  }

  // convex planar polygon; the normal hint picks the winding; UVs are world
  // metres / s projected on the face's dominant plane unless given
  face(key, pts, nHint, s = 8, uvFn = null) {
    const b = this.bucket(key);
    newell(pts, _n);
    let P = pts;
    if (nHint && _n.dot(nHint) < 0) { P = pts.slice().reverse(); _n.negate(); }
    const base = b.pos.length / 3;
    const ax = Math.abs(_n.x), ay = Math.abs(_n.y), az = Math.abs(_n.z);
    for (const p of P) {
      b.pos.push(p.x, p.y, p.z);
      b.nrm.push(_n.x, _n.y, _n.z);
      if (uvFn) { const uv = uvFn(p); b.uv.push(uv[0], uv[1]); }
      else if (ax >= ay && ax >= az) b.uv.push((_n.x > 0 ? -p.z : p.z) / s, p.y / s);
      else if (ay >= az) b.uv.push(p.x / s, p.z / s);
      else b.uv.push((_n.z > 0 ? p.x : -p.x) / s, p.y / s);
    }
    for (let i = 1; i < P.length - 1; i++) b.idx.push(base, base + i, base + i + 1);
  }

  quadX(key, x, y0, y1, z0, z1, sign, s, uvFn) { this.face(key, [V(x, y0, z0), V(x, y1, z0), V(x, y1, z1), V(x, y0, z1)], V(sign, 0, 0), s, uvFn); }
  quadY(key, y, x0, x1, z0, z1, sign, s, uvFn) { this.face(key, [V(x0, y, z0), V(x1, y, z0), V(x1, y, z1), V(x0, y, z1)], V(0, sign, 0), s, uvFn); }
  quadZ(key, z, x0, x1, y0, y1, sign, s, uvFn) { this.face(key, [V(x0, y0, z), V(x1, y0, z), V(x1, y1, z), V(x0, y1, z)], V(0, 0, sign), s, uvFn); }

  box(key, x0, y0, z0, x1, y1, z1, s = 8, skip = '') {
    if (!skip.includes('+x')) this.quadX(key, x1, y0, y1, z0, z1, 1, s);
    if (!skip.includes('-x')) this.quadX(key, x0, y0, y1, z0, z1, -1, s);
    if (!skip.includes('+y')) this.quadY(key, y1, x0, x1, z0, z1, 1, s);
    if (!skip.includes('-y')) this.quadY(key, y0, x0, x1, z0, z1, -1, s);
    if (!skip.includes('+z')) this.quadZ(key, z1, x0, x1, y0, y1, 1, s);
    if (!skip.includes('-z')) this.quadZ(key, z0, x0, x1, y0, y1, -1, s);
  }

  // x-y polygon (counter-clockwise) extruded from z0 to z1
  prism(key, poly, z0, z1, s = 8, opts = {}) { this.loft(key, poly, z0, poly, z1, s, opts); }

  // side walls between two x-y polygons with matching vertices; caps optional
  loft(key, A, zA, B, zB, s = 8, opts = {}) {
    const n = A.length;
    let per = 0;
    for (let i = 0; i < n; i++) {
      const a0 = A[i], a1 = A[(i + 1) % n], b0 = B[i], b1 = B[(i + 1) % n];
      const len = Math.hypot(a1[0] - a0[0], a1[1] - a0[1]);
      if (!(opts.skip && opts.skip.includes(i))) {
        const nh = V(a1[1] - a0[1], -(a1[0] - a0[0]), 0);
        const u0 = per / s, u1 = (per + len) / s;
        const pts = [V(a0[0], a0[1], zA), V(a1[0], a1[1], zA), V(b1[0], b1[1], zB), V(b0[0], b0[1], zB)];
        const uvs = new Map([[pts[0], [u0, zA / s]], [pts[1], [u1, zA / s]], [pts[2], [u1, zB / s]], [pts[3], [u0, zB / s]]]);
        this.face(key, pts, nh, s, (p) => uvs.get(p));
      }
      per += len;
    }
    const lo = zA < zB ? [A, zA] : [B, zB], hi = zA < zB ? [B, zB] : [A, zA];
    if (opts.capLo !== false) this.face(opts.capKey || key, lo[0].map(([x, y]) => V(x, y, lo[1])), V(0, 0, -1), s);
    if (opts.capHi !== false) this.face(opts.capKey || key, hi[0].map(([x, y]) => V(x, y, hi[1])), V(0, 0, 1), s);
  }

  // any three.js geometry, transformed
  geo(key, g, m) {
    const b = this.bucket(key);
    const P = g.attributes.position, N = g.attributes.normal, UV = g.attributes.uv;
    const nm = new THREE.Matrix3().getNormalMatrix(m);
    const flip = m.determinant() < 0;
    const base = b.pos.length / 3;
    const v = new THREE.Vector3();
    for (let i = 0; i < P.count; i++) {
      v.fromBufferAttribute(P, i).applyMatrix4(m); b.pos.push(v.x, v.y, v.z);
      if (N) { v.fromBufferAttribute(N, i).applyMatrix3(nm).normalize(); b.nrm.push(v.x, v.y, v.z); } else b.nrm.push(0, 1, 0);
      if (UV) b.uv.push(UV.getX(i), UV.getY(i)); else b.uv.push(0, 0);
    }
    const tri = (a, c, d) => { if (flip) b.idx.push(base + a, base + d, base + c); else b.idx.push(base + a, base + c, base + d); };
    if (g.index) for (let i = 0; i < g.index.count; i += 3) tri(g.index.getX(i), g.index.getX(i + 1), g.index.getX(i + 2));
    else for (let i = 0; i < P.count; i += 3) tri(i, i + 1, i + 2);
  }

  build(mats) {
    const group = new THREE.Group();
    const parts = {};
    for (const [key, b] of this.buckets) {
      if (!b.idx.length) continue;
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(b.pos, 3));
      g.setAttribute('normal', new THREE.Float32BufferAttribute(b.nrm, 3));
      g.setAttribute('uv', new THREE.Float32BufferAttribute(b.uv, 2));
      g.setIndex(b.idx);
      g.computeBoundingSphere();
      const mat = mats[key];
      if (!mat) throw new Error(`no material for ${key}`);
      const mesh = new THREE.Mesh(g, mat);
      mesh.castShadow = mat.userData.cast !== false;
      mesh.receiveShadow = mat.userData.receive !== false;
      mesh.name = key;
      group.add(mesh);
      parts[key] = mesh;
    }
    return { group, parts };
  }
}

// octagon: a box cross-section with chamfered long edges (counter-clockwise)
function chamfer(x0, y0, x1, y1, c) {
  return [[x0 + c, y0], [x1 - c, y0], [x1, y0 + c], [x1, y1 - c], [x1 - c, y1], [x0 + c, y1], [x0, y1 - c], [x0, y0 + c]];
}

function rng(seed) {
  let s = (seed >>> 0) || 1;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}
function hashStr(t) { let h = 2166136261; for (let i = 0; i < t.length; i++) { h ^= t.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }

// ---------------------------------------------------------------- textures

function canvasTex(S, draw, repeat = true, srgb = true) {
  const c = document.createElement('canvas');
  c.width = S; c.height = typeof S === 'number' ? S : S;
  draw(c.getContext('2d'), S);
  const t = new THREE.CanvasTexture(c);
  if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

// hull plating: courses of plates, seams, access panels, grime streaks
function hullTexture(base, seed, rows = 16) {
  return canvasTex(512, (g, S) => {
    const r = rng(seed);
    const [br, bg, bb] = base;
    g.fillStyle = `rgb(${br},${bg},${bb})`; g.fillRect(0, 0, S, S);
    const h = S / rows;
    for (let y = 0; y < S; y += h) {
      let x = -Math.floor(r() * 4) * h;
      while (x < S) {
        const w = h * (2 + Math.floor(r() * 4));
        const d = (r() - 0.5) * 18;
        g.fillStyle = `rgb(${br + d | 0},${bg + d | 0},${bb + d + 2 | 0})`;
        g.fillRect(x + 1, y + 1, w - 2, h - 2);
        g.strokeStyle = 'rgba(25,28,32,0.55)'; g.lineWidth = 1.5;
        g.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
        if (r() < 0.06) { g.fillStyle = 'rgba(30,34,38,0.55)'; g.fillRect(x + w * 0.2, y + h * 0.25, w * 0.3, h * 0.5); }
        x += w;
      }
    }
    for (let i = 0; i < 140; i++) {
      const x = r() * S, y = r() * S, l = 10 + r() * 90;
      g.fillStyle = `rgba(40,36,32,${0.03 + r() * 0.07})`;
      g.fillRect(x, y, 1 + r() * 2.5, l);
    }
    g.strokeStyle = 'rgba(20,22,26,0.6)'; g.lineWidth = 3;
    g.strokeRect(1.5, 1.5, S - 3, S - 3);
  });
}

function deckTexture(seed, light = false) {
  return canvasTex(512, (g, S) => {
    const r = rng(seed);
    g.fillStyle = light ? '#6d737a' : '#34393f'; g.fillRect(0, 0, S, S);
    for (let y = 0; y < S; y += 64) for (let x = 0; x < S; x += 64) {
      const d = (r() - 0.5) * 14;
      const c = light ? 112 + d : 56 + d;
      g.fillStyle = `rgb(${c | 0},${c + 4 | 0},${c + 9 | 0})`;
      g.fillRect(x + 2, y + 2, 60, 60);
    }
    g.strokeStyle = light ? 'rgba(40,44,50,0.6)' : 'rgba(10,12,14,0.8)'; g.lineWidth = 2;
    for (let i = 0; i <= S; i += 64) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, S); g.moveTo(0, i); g.lineTo(S, i); g.stroke(); }
    g.fillStyle = 'rgba(0,0,0,0.25)';
    for (let i = 0; i < 400; i++) g.fillRect(r() * S, r() * S, 2, 2);
  });
}

function wallTexture() {
  return canvasTex(512, (g, S) => {
    g.fillStyle = '#5a6168'; g.fillRect(0, 0, S, S);
    for (let y = 0; y < S; y += 128) for (let x = 0; x < S; x += 64) {
      g.fillStyle = '#677077'; g.fillRect(x + 3, y + 3, 58, 122);
      g.strokeStyle = '#3c4247'; g.strokeRect(x + 3.5, y + 3.5, 57, 121);
      g.fillStyle = '#4b5258'; g.fillRect(x + 10, y + 56, 44, 10);
    }
    g.fillStyle = '#c4501f'; g.fillRect(0, 300, S, 8);
  });
}

function radiatorTexture() {
  return canvasTex(256, (g, S) => {
    g.fillStyle = '#d8d3c6'; g.fillRect(0, 0, S, S);
    g.fillStyle = '#9d988d';
    for (let x = 0; x < S; x += 16) g.fillRect(x, 0, 3, S);
    g.fillStyle = 'rgba(80,76,70,0.4)'; g.fillRect(0, S / 2 - 2, S, 4);
  });
}

function podTexture(stripe) {
  return canvasTex(512, (g, S) => {
    g.fillStyle = '#8c939a'; g.fillRect(0, 0, S, S);
    for (let x = 0; x < S; x += 128) { g.fillStyle = 'rgba(30,34,38,0.6)'; g.fillRect(x, 0, 3, S); }
    g.fillStyle = stripe; g.fillRect(0, S * 0.42, S, S * 0.09);
    g.fillStyle = '#1d2024'; g.fillRect(0, S * 0.51, S, S * 0.02);
  });
}

// landing-pad decal: ring, centre mark, number, corner chevrons
function padMarkTexture(label) {
  return canvasTex(512, (g, S) => {
    g.clearRect(0, 0, S, S);
    g.strokeStyle = 'rgba(241,180,58,0.95)'; g.lineWidth = 14;
    g.beginPath(); g.arc(S / 2, S / 2, S * 0.36, 0, Math.PI * 2); g.stroke();
    g.lineWidth = 6; g.beginPath(); g.arc(S / 2, S / 2, S * 0.29, 0, Math.PI * 2); g.stroke();
    g.fillStyle = 'rgba(230,239,243,0.92)';
    g.font = 'bold 150px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText(label, S / 2, S / 2 + 6);
    g.fillStyle = 'rgba(241,180,58,0.95)';
    for (const [cx, cy, a] of [[40, 40, 0], [S - 40, 40, 1], [S - 40, S - 40, 2], [40, S - 40, 3]]) {
      g.save(); g.translate(cx, cy); g.rotate(a * Math.PI / 2);
      g.fillRect(-20, -20, 70, 12); g.fillRect(-20, -20, 12, 70); g.restore();
    }
  }, false);
}

function nameTexture(name, sub) {
  const c = document.createElement('canvas');
  c.width = 1024; c.height = 256;
  const g = c.getContext('2d');
  g.clearRect(0, 0, 1024, 256);
  g.fillStyle = 'rgba(232,236,240,0.92)';
  g.font = 'bold 150px sans-serif'; g.textBaseline = 'middle'; g.textAlign = 'center';
  g.fillText(name.toUpperCase().split('').join(' '), 512, 110);
  g.font = 'bold 44px monospace';
  g.fillText(sub, 512, 220);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

function screenTexture(seed) {
  return canvasTex(256, (g, S) => {
    const r = rng(seed);
    g.fillStyle = '#04090d'; g.fillRect(0, 0, S, S);
    g.strokeStyle = '#1a2a33'; g.strokeRect(4, 4, S - 8, S - 8);
    for (let i = 0; i < 9; i++) {
      g.fillStyle = r() < 0.2 ? '#f1b43a' : (r() < 0.5 ? '#6ade8f' : '#4fd6e6');
      g.fillRect(16, 20 + i * 24, 40 + r() * 150, 8);
    }
    g.strokeStyle = '#4fd6e6'; g.beginPath();
    for (let x = 0; x < S; x += 8) g.lineTo(x, 200 + Math.sin(x * 0.07 + seed) * 18);
    g.stroke();
  }, false);
}

// ---------------------------------------------------------------- materials

function std(params, user = {}) { const m = new THREE.MeshStandardMaterial(params); Object.assign(m.userData, user); return m; }
function basic(color, k = 1, user = {}) { const m = new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(k) }); Object.assign(m.userData, { cast: false, receive: false }, user); return m; }
function inner(params, user = {}) { const m = interiorMaterial(params); Object.assign(m.userData, user); return m; }

function commonMaterials(seed, tint, accent) {
  const hull = hullTexture(tint, seed);
  const hull2 = hullTexture(tint.map((c) => c * 0.62), seed + 7);
  const wall = wallTexture();
  const ideck = deckTexture(seed + 3);
  return {
    hull: std({ map: hull, metalness: 0.5, roughness: 0.55 }),
    hull2: std({ map: hull2, metalness: 0.55, roughness: 0.5 }),
    dark: std({ color: 0x2b3036, metalness: 0.6, roughness: 0.5 }),
    trim: std({ color: 0x4d545c, metalness: 0.7, roughness: 0.42 }),
    accent: std({ color: accent, metalness: 0.3, roughness: 0.6 }),
    radiator: std({ map: radiatorTexture(), metalness: 0.3, roughness: 0.35 }),
    nozzle: std({ color: 0x3d3229, metalness: 0.9, roughness: 0.35, side: THREE.DoubleSide }),
    glow: std({ color: 0x1a1410, emissive: 0xff7a2a, emissiveIntensity: 0, metalness: 0.6, roughness: 0.5, side: THREE.DoubleSide }, { cast: false }),
    window: basic(0xffd9a6, 0.9),
    lamp: basic(0xfff3e0, 2.6),
    amber: basic(0xf1b43a, 2.2),
    glass: new THREE.MeshPhysicalMaterial({ color: 0x0c1216, metalness: 0, roughness: 0.03, transparent: true, opacity: 0.22, depthWrite: false, side: THREE.DoubleSide }),
    iwall: inner({ map: wall, metalness: 0.25, roughness: 0.7, emissive: 0x2a2f34, emissiveIntensity: 0.05 }),
    ifloor: inner({ map: ideck, metalness: 0.45, roughness: 0.65, emissive: 0x23272b, emissiveIntensity: 0.05 }),
    iconsole: inner({ color: 0x23282d, metalness: 0.4, roughness: 0.5, emissive: 0x1a1e22, emissiveIntensity: 0.06 }),
    iseat: inner({ color: 0x5a2f22, metalness: 0.05, roughness: 0.9, emissive: 0x2a1610, emissiveIntensity: 0.05 }),
    ipanel: basic(0xfff1d6, 0.55),
    screen: (() => { const m = new THREE.MeshBasicMaterial({ map: screenTexture(seed), color: new THREE.Color(1.6, 1.6, 1.6) }); m.userData.cast = false; return m; })(),
  };
}

function navLight(color, k) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 8), basic(color, k));
  m.userData.nav = true;
  return m;
}

function bell(kit, x, y, zExit, r, length) {
  const g = new THREE.CylinderGeometry(r, r * 0.55, length, 40, 1, true);
  const m = new THREE.Matrix4().makeRotationX(Math.PI / 2).setPosition(x, y, zExit - length / 2);
  kit.geo('nozzle', g, m);
  const t = new THREE.CylinderGeometry(r * 0.56, r * 0.5, length * 0.14, 32, 1, true);
  kit.geo('glow', t, new THREE.Matrix4().makeRotationX(Math.PI / 2).setPosition(x, y, zExit - length + length * 0.07));
  kit.geo('trim', new THREE.TorusGeometry(r * 1.01, r * 0.025, 6, 40), new THREE.Matrix4().setPosition(x, y, zExit));
}

function dish(kit, x, y, z, r, tilt = -0.6) {
  const g = new THREE.SphereGeometry(r, 18, 8, 0, Math.PI * 2, 0, Math.PI / 2.6);
  kit.geo('radiator', g, new THREE.Matrix4().makeRotationX(tilt).setPosition(x, y, z));
  kit.box('trim', x - r * 0.06, y - r * 0.8, z - r * 0.06, x + r * 0.06, y, z + r * 0.06, 4);
}

// random equipment blocks on an axis-aligned rectangle of a face
function greebles(kit, r, count, face, opts = {}) {
  const { axis, at, sign, u0, u1, v0, v1 } = face;
  const sMin = opts.sMin || 0.8, sMax = opts.sMax || 4, hMax = opts.hMax || 1.6;
  for (let i = 0; i < count; i++) {
    const w = sMin + r() * (sMax - sMin), d = sMin + r() * (sMax - sMin) * 1.6, h = 0.2 + r() * hMax;
    const u = u0 + r() * (u1 - u0 - w), v = v0 + r() * (v1 - v0 - d);
    const key = r() < 0.22 ? 'dark' : (r() < 0.35 ? 'trim' : (r() < 0.12 ? 'radiator' : 'hull2'));
    const o0 = at, o1 = at + sign * h;
    const [a0, a1] = sign > 0 ? [o0, o1] : [o1, o0];
    if (axis === 'y') kit.box(key, u, a0, v, u + w, a1, v + d, 6);
    else if (axis === 'x') kit.box(key, a0, u, v, a1, u + w, v + d, 6);
    else kit.box(key, u, v, a0, u + w, v + d, a1, 6);
  }
}

// rows of lit windows on an x-facing hull side
function windowRows(kit, r, x, sign, ys, z0, z1, avoid = () => false, dark = 0.12) {
  for (const y of ys) {
    let z = z0 + r() * 6;
    while (z < z1) {
      const run = 3 + Math.floor(r() * 9);
      for (let i = 0; i < run && z < z1; i++, z += 2.4) {
        if (avoid(y, z) || r() < dark) continue;
        kit.quadX('window', x + sign * 0.06, y, y + 0.9, z, z + 1.4, sign, 4);
      }
      z += 4 + r() * 14;
    }
  }
}

function nameDecal(name, sub, x, sign, y0, y1, z0, z1) {
  const mat = new THREE.MeshStandardMaterial({ map: nameTexture(name, sub), transparent: true, metalness: 0.2, roughness: 0.6, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 });
  const g = new THREE.PlaneGeometry(z1 - z0, y1 - y0);
  const m = new THREE.Mesh(g, mat);
  m.position.set(x + sign * 0.08, (y0 + y1) / 2, (z0 + z1) / 2);
  m.rotation.y = sign > 0 ? Math.PI / 2 : -Math.PI / 2;
  return m;
}

// ---------------------------------------------------------------- Halyard-class tender

export function buildTender(name, reg) {
  const T = TENDER;
  const seed = hashStr(name);
  const r = rng(seed);
  const k = new Kit();
  const M = commonMaterials(seed, [150, 156, 162], 0xc4501f);
  M.deckTop = std({ map: deckTexture(seed + 11, true), metalness: 0.45, roughness: 0.6 });
  M.pod = std({ map: podTexture('#c4501f'), metalness: 0.4, roughness: 0.55 });
  M.deckTop.map.repeat.set(1, 1);

  // spine and command module
  k.prism('hull', chamfer(-7, -8, 7, 4, 1.6), -112, 122, 24, { capLo: false, capHi: false });
  for (const x of [-4, 0, 4]) k.box('dark', x - 0.6, -9, -110, x + 0.6, -8, 120, 4);
  const cm = chamfer(-16, -12, 16, 9, 3.5);
  const nose = cm.map(([x, y]) => [x * 0.6, -2 + (y + 2) * 0.66]);
  k.loft('hull', nose, -152, cm, -140, 24, { capHi: false });
  k.prism('hull', cm, -140, -112, 24, { capLo: false });
  windowRows(k, r, 16, 1, [-7, -3, 1, 5], -138, -114, (y, z) => y > 0 && z > -138 && z < -118);
  windowRows(k, r, -16, -1, [-7, -3, 1, 5], -138, -114, (y, z) => y > 0 && z > -138 && z < -118);
  greebles(k, r, 30, { axis: 'y', at: 9, sign: 1, u0: -12, u1: 12, v0: -125, v1: -113 });
  // bridge house: walls around a wraparound window band
  const H = 'hull';
  k.box(H, -11, 14.9, -150, 11, 15.5, -126, 8);
  k.box(H, -11, 9, -126.6, 11, 14.9, -126, 8);
  for (const s of [-1, 1]) {
    const xa = s < 0 ? -11 : 10.4, xb = s < 0 ? -10.4 : 11;
    k.box(H, xa, 9, -150, xb, 10.8, -126, 8);
    k.box(H, xa, 13.6, -150, xb, 14.9, -126, 8);
    k.box(H, xa, 10.8, -138, xb, 13.6, -126, 8);
    k.box('trim', xa, 10.8, -144.2, xb, 13.6, -143.8, 4);
    k.quadX('glass', s * 10.7, 10.8, 13.6, -150, -138, s, 4);
  }
  k.box(H, -11, 9, -150, 11, 10.8, -149.4, 8);
  k.box(H, -11, 13.6, -150, 11, 14.9, -149.4, 8);
  for (const x of [-6.3, -2.1, 2.1, 6.3]) k.box('trim', x - 0.2, 10.8, -150, x + 0.2, 13.6, -149.4, 4);
  k.quadZ('glass', -149.7, -10.4, 10.4, 10.8, 13.6, -1, 4);
  dish(k, 0, 12.6, -119, 3.2);
  k.box('trim', -0.3, 15.5, -131.3, 0.3, 22, -130.7, 4); // whip antenna on the bridge roof
  // bridge interior
  k.box('ifloor', -10, 9.0, -149.4, 10, 9.5, -126.6, 4, '-y');
  k.quadY('iwall', 14.5, -10, 10, -149.4, -126.6, -1, 6);
  k.quadZ('iwall', -126.7, -10, 10, 9.5, 14.5, -1, 6);
  for (const s of [-1, 1]) {
    k.quadX('iwall', s * 10.0, 9.5, 10.8, -149.4, -126.6, -s, 6);
    k.quadX('iwall', s * 10.0, 13.6, 14.5, -149.4, -126.6, -s, 6);
    k.quadX('iwall', s * 10.0, 10.8, 13.6, -138, -126.6, -s, 6);
  }
  for (const z of [-145, -138, -131]) k.quadY('ipanel', 14.45, -3, 3, z - 0.8, z + 0.8, -1, 4);
  k.box('iconsole', -7, 9.5, -148.6, 7, 10.6, -146.4, 4);
  for (const x of [-5, -1.6, 1.8]) k.face('screen', [V(x, 10.62, -147.9), V(x + 3, 10.62, -147.9), V(x + 3, 11.4, -148.5), V(x, 11.4, -148.5)], V(0, 0.6, 0.8), 1, (p) => [(p.x - x) / 3, p.y > 11 ? 1 : 0]);
  k.box('iseat', -0.45, 9.5, -142.45, 0.45, 10.05, -141.55, 2);
  k.box('iseat', -0.45, 10.05, -141.6, 0.45, 11.3, -141.35, 2);
  k.box('iconsole', -0.75, 9.5, -142.3, -0.55, 10.4, -141.6, 2);
  k.box('iconsole', 0.55, 9.5, -142.3, 0.75, 10.4, -141.6, 2);
  k.quadZ('amber', -126.75, -1.1, 1.1, 12.1, 12.2, -1, 2);
  for (const s of [-1, 1]) k.quadZ('amber', -126.75, s * 1.1 - 0.05, s * 1.1 + 0.05, 9.5, 12.2, -1, 2);

  // docking deck: hull below, plated top, pads with markings and edge lights
  k.box('hull', -20, -2, -92, 20, 6, 12, 16, '+y');
  k.quadY('deckTop', 6, -20, 20, -92, 12, 1, 8);
  for (const s of [-1, 1]) k.box('trim', s < 0 ? -20 : 19.6, 6, -92, s < 0 ? -19.6 : 20, 6.35, 12, 4);
  k.box('trim', -20, 6, -92, 20, 6.35, -91.6, 4);
  k.box('trim', -20, 6, 11.6, 20, 6.35, 12, 4);
  greebles(k, r, 40, { axis: 'x', at: 20, sign: 1, u0: -1.5, u1: 5, v0: -90, v1: 10 }, { hMax: 0.8 });
  greebles(k, r, 40, { axis: 'x', at: -20, sign: -1, u0: -1.5, u1: 5, v0: -90, v1: 10 }, { hMax: 0.8 });
  // kiosks with lift doors facing the pads
  for (const zc of [-65, -14]) {
    k.box('hull2', 14.5, 6, zc - 2.5, 18.5, 9.5, zc + 2.5, 4);
    k.quadX('amber', 14.44, 6.1, 8.6, zc - 1.25, zc - 1.1, -1, 2);
    k.quadX('amber', 14.44, 6.1, 8.6, zc + 1.1, zc + 1.25, -1, 2);
    k.quadX('amber', 14.44, 8.5, 8.65, zc - 1.25, zc + 1.25, -1, 2);
    k.box('lamp', 16.2, 9.5, zc - 0.3, 16.8, 9.8, zc + 0.3, 1);
  }
  // floodlight masts at the deck corners
  for (const [x, z] of [[-19, -90], [19, -90], [-19, 10], [19, 10], [-19, -40], [19, -40]]) {
    k.box('trim', x - 0.25, 6, z - 0.25, x + 0.25, 17, z + 0.25, 4);
    k.box('lamp', x - 0.7, 17, z - 0.4, x + 0.7, 17.5, z + 0.4, 1);
  }
  // drive section and bells
  k.prism('hull2', chamfer(-20, -16, 20, 12, 4), 122, 165, 24, { capLo: false });
  greebles(k, r, 40, { axis: 'y', at: 12, sign: 1, u0: -15, u1: 15, v0: 124, v1: 163 }, { hMax: 1.2 });
  for (const [x, y, z, rr] of T.engines) bell(k, x, y, z, rr, 15);
  // cargo pods on clamps
  for (const c of [35, 65, 95]) for (const s of [-1, 1]) {
    const g = new THREE.CylinderGeometry(6.5, 6.5, 26, 36, 1, false);
    k.geo('pod', g, new THREE.Matrix4().makeRotationX(Math.PI / 2).setPosition(s * 14, -6, c));
    k.box('dark', s < 0 ? -8.6 : 7, -7, c - 9, s < 0 ? -7 : 8.6, -5, c - 6, 2);
    k.box('dark', s < 0 ? -8.6 : 7, -7, c + 6, s < 0 ? -7 : 8.6, -5, c + 9, 2);
  }
  // spine equipment, radiators on truss arms
  greebles(k, r, 70, { axis: 'y', at: 4, sign: 1, u0: -6, u1: 6, v0: 14, v1: 120 }, { hMax: 1.4 });
  greebles(k, r, 30, { axis: 'x', at: 7, sign: 1, u0: -7, u1: 3, v0: 14, v1: 120 }, { hMax: 0.7 });
  greebles(k, r, 30, { axis: 'x', at: -7, sign: -1, u0: -7, u1: 3, v0: 14, v1: 120 }, { hMax: 0.7 });
  for (const s of [-1, 1]) {
    k.box('radiator', s < 0 ? -62 : 20, -0.4, 128, s < 0 ? -20 : 62, 0.4, 160, 4);
    k.box('trim', s < 0 ? -62 : 20, -1.2, 143, s < 0 ? -20 : 62, -0.4, 145, 4);
  }
  dish(k, 0, 15.5, 140, 4.5, -0.9);
  // spine corridor, lift lobbies
  k.box('ifloor', -2, -1.2, -140, 2, -1, 10, 4, '-y');
  k.quadY('iwall', 2.6, -2, 2, -140, 10, -1, 6);
  k.quadX('iwall', -2, -1, 2.6, -140, 10, 1, 6);
  for (const [z0, z1] of [[-140, -71], [-60, -20], [-9, 10]]) k.quadX('iwall', 2, -1, 2.6, z0, z1, -1, 6);
  k.quadZ('iwall', -140, -2, 2, -1, 2.6, 1, 6);
  k.quadZ('iwall', 10, -2, 2, -1, 2.6, -1, 6);
  for (let z = -136; z < 8; z += 6) k.quadY('ipanel', 2.58, -0.5, 0.5, z, z + 2, -1, 2);
  k.quadZ('amber', -139.95, -1.1, 1.1, 1.5, 1.6, 1, 2);
  for (const s of [-1, 1]) k.quadZ('amber', -139.95, s * 1.1 - 0.05, s * 1.1 + 0.05, -1, 1.6, 1, 2);
  for (const [z0, z1] of [[-71, -60], [-20, -9]]) {
    k.box('ifloor', 2, -1.2, z0, 9, -1, z1, 4, '-y');
    k.quadY('iwall', 2.6, 2, 9, z0, z1, -1, 6);
    k.quadX('iwall', 9, -1, 2.6, z0, z1, -1, 6);
    k.quadZ('iwall', z0, 2, 9, -1, 2.6, 1, 6);
    k.quadZ('iwall', z1, 2, 9, -1, 2.6, -1, 6);
    const zc = (z0 + z1) / 2 - 0.5;
    k.quadX('amber', 8.95, -1, 1.6, zc - 1.2, zc - 1.05, -1, 2);
    k.quadX('amber', 8.95, -1, 1.6, zc + 1.05, zc + 1.2, -1, 2);
    k.quadX('amber', 8.95, 1.5, 1.6, zc - 1.2, zc + 1.2, -1, 2);
    k.quadY('ipanel', 2.58, 4.5, 6.5, zc - 1, zc + 1, -1, 2);
  }
  const { group, parts } = k.build(M);
  // pads: markings, edge lights and pylons that rise when a craft is clamped
  const pads = [];
  T.zones.forEach((z, i) => {
    const [px, py, pz] = z.pad;
    const mark = new THREE.Mesh(new THREE.PlaneGeometry(28, 28), new THREE.MeshStandardMaterial({ map: padMarkTexture(String(i + 1)), transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, metalness: 0.2, roughness: 0.7 }));
    mark.rotation.x = -Math.PI / 2; mark.position.set(px, py + 0.02, pz);
    group.add(mark);
    const lk = new Kit();
    for (const [x0, x1, z0, z1] of [[-15, 15, -21, -20.6], [-15, 15, 20.6, 21], [-15, -14.6, -21, 21], [14.6, 15, -21, 21]]) lk.box('l', px + x0, py, pz + z0, px + x1, py + 0.12, pz + z1, 1);
    const lightMat = basic(0xf1b43a, 2.4);
    const lights = lk.build({ l: lightMat }).group;
    group.add(lights);
    const pk = new Kit();
    for (const [x, zz] of [[-15.5, -16], [15.5, -16], [-15.5, 0], [15.5, 0], [-15.5, 16], [15.5, 16]]) pk.box('p', px + x - 0.5, 0, pz + zz - 0.5, px + x + 0.5, 3, pz + zz + 0.5, 2);
    const pyl = pk.build({ p: M.trim }).group;
    pyl.position.y = py;
    pyl.scale.y = 0.15;
    group.add(pyl);
    pads.push({ zone: z, lightMat, pylons: pyl, lift: 0 });
  });
  group.add(nameDecal(name, reg, 16, 1, 0.5, 6.5, -137, -115));
  group.add(nameDecal(name, reg, -16, -1, 0.5, 6.5, -137, -115));
  const navLights = [];
  for (const [c, kk, x, y, z, s] of [[0xff2a1a, 3, -62.6, 0, 144, 0.6], [0x1aff4a, 3, 62.6, 0, 144, 0.6], [0xffffff, 4, 0, 15.9, -138, 0.5], [0xffffff, 4, 0, 12.5, 150, 0.5], [0xffffff, 4, 0, -16.5, 150, 0.5]]) {
    const n = navLight(c, kk); n.scale.setScalar(s); n.position.set(x, y, z); group.add(n); navLights.push(n);
  }
  return { root: group, parts, pads, glow: M.glow, navLights, materials: M };
}

const FIELD_VERT = /* glsl */`
varying vec2 vUv;
varying vec3 vN;
varying vec3 vView;
#include <common>
#include <logdepthbuf_pars_vertex>
void main() {
  vUv = uv;
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vN = normalize(mat3(modelMatrix) * normal);
  vView = -wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
  #include <logdepthbuf_vertex>
}
`;
const FIELD_FRAG = /* glsl */`
uniform float uTime;
uniform vec2 uSize;
varying vec2 vUv;
varying vec3 vN;
varying vec3 vView;
#include <common>
#include <logdepthbuf_pars_fragment>
void main() {
  #include <logdepthbuf_fragment>
  vec2 p = vUv * uSize / 6.0;
  // hexagonal cells drifting slowly, brightest at their edges
  vec2 r = vec2(1.0, 1.7320508);
  vec2 h = r * 0.5;
  vec2 a = mod(p, r) - h, b = mod(p - h, r) - h;
  vec2 g = dot(a, a) < dot(b, b) ? a : b;
  float edge = smoothstep(0.38, 0.5, max(abs(g.x) * 0.866 + abs(g.y) * 0.5, abs(g.y)));
  float wave = 0.5 + 0.5 * sin(uTime * 0.8 + vUv.x * 18.0 + sin(vUv.y * 9.0 + uTime));
  float facing = 1.0 - abs(dot(normalize(vN), normalize(vView)));
  float frame = smoothstep(0.03, 0.0, min(min(vUv.x, 1.0 - vUv.x), min(vUv.y, 1.0 - vUv.y)) * 8.0);
  // faint: the view out through the door must stay clear
  vec3 c = vec3(0.25, 0.6, 1.0) * (edge * 0.0035 * wave + facing * 0.004 + frame * 0.04 + 0.0003);
  gl_FragColor = vec4(c, 1.0);
}
`;

// the hangar force field: a faint shimmer of hexagons across an opening
export function makeForceField(w, h) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h, 1, 1), new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uSize: { value: new THREE.Vector2(w, h) } },
    vertexShader: FIELD_VERT, fragmentShader: FIELD_FRAG,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
  }));
  return m;
}
