// Runtime view of a generated system: positions, velocities and orientations
// of every body at the current time (Keplerian ephemerides, double precision),
// sphere-of-influence queries, gravity, atmosphere profiles and exact ground
// heights for physics.

import * as THREE from 'three';
import { orbitState } from '../core/kepler.js';
import { TerrainGenerator, S_LEN, S_H } from '../gen/terrain.js';
import { dirFromFaceUV, faceUVFromDir, chunkArcSize } from '../gen/cubesphere.js';
import { CHUNK_N } from '../gen/chunkbuilder.js';
import * as U from '../core/units.js';

const _p = [0, 0, 0], _v = [0, 0, 0];
const _q = new THREE.Quaternion(), _q2 = new THREE.Quaternion();
const Y = new THREE.Vector3(0, 1, 0);

export class BodyRuntime {
  constructor(data, universe) {
    this.data = data;
    this.id = data.id;
    this.u = universe;
    this.parent = null;
    this.children = [];
    this.pos = new THREE.Vector3();      // world (heliocentric inertial)
    this.vel = new THREE.Vector3();
    this.relPos = new THREE.Vector3();   // relative to parent
    this.relVel = new THREE.Vector3();
    this.q = new THREE.Quaternion();     // body-fixed -> inertial
    this.qInv = new THREE.Quaternion();
    this.omega = new THREE.Vector3();    // angular velocity (inertial)
    this.qTilt = new THREE.Quaternion(...data.rotation.qTilt);
    this.R = data.R;
    this.GM = data.GM;
    this.soi = data.soi;
    this.solid = !!data.solid;
    this.isStar = data.kind === 'star';
    this.atm = data.atmosphere || null;
    this.giant = data.giant || null;
    // top of the atmosphere (m above datum); 0 for airless bodies
    this.atmHeight = this.atm && this.atm.render ? this.atm.render.height : 0;
    this._gen = null;
    this._scratch = new Float64Array(S_LEN);
    // finest LOD level: ~0.7 m vertex spacing
    this.maxLevel = this.solid ? Math.max(2, Math.ceil(Math.log2(chunkArcSize(0, this.R) / CHUNK_N / 0.7))) : 0;
  }

  get terrain() {
    if (!this._gen && this.data.terrain) this._gen = new TerrainGenerator(this.data.terrain);
    return this._gen;
  }

  // Orientation at an arbitrary time
  orientationAt(t, out) {
    const r = this.data.rotation;
    _q.setFromAxisAngle(Y, r.phase0 + r.rate * t);
    return out.copy(this.qTilt).multiply(_q);
  }

  // World <-> body-fixed conversions (body centred)
  worldToFixed(worldPos, out) { return out.copy(worldPos).sub(this.pos).applyQuaternion(this.qInv); }
  fixedToWorld(fixed, out) { return out.copy(fixed).applyQuaternion(this.q).add(this.pos); }

  // Velocity of the co-rotating frame at a body-relative inertial offset
  frameVelocity(relInertial, out) { return out.copy(this.omega).cross(relInertial); }

  // ---------------------------------------------------------------- ground

  // Exact height of the rendered finest-LOD mesh under a body-fixed direction
  // (triangle-interpolated, sea-level clamped). Matches what the eye sees.
  groundHeight(dirFixed) {
    const gen = this.terrain;
    if (!gen) return 0;
    const fu = this._fu || (this._fu = { face: 0, u: 0, v: 0 });
    const d = this._dd || (this._dd = [0, 0, 0]);
    const l = Math.hypot(dirFixed.x, dirFixed.y, dirFixed.z);
    d[0] = dirFixed.x / l; d[1] = dirFixed.y / l; d[2] = dirFixed.z / l;
    faceUVFromDir(d, fu);
    const G = (1 << this.maxLevel) * CHUNK_N;
    const gu = (fu.u + 1) * 0.5 * G, gv = (fu.v + 1) * 0.5 * G;
    let i = Math.floor(gu), j = Math.floor(gv);
    if (i >= G) i = G - 1;
    if (j >= G) j = G - 1;
    const fx = gu - i, fy = gv - j;
    const cell = 2 / G;
    const P = this._cellP || (this._cellP = [[0, 0, 0], [0, 0, 0], [0, 0, 0]]);
    // diagonal (0,0)-(1,1): lower triangle (0,0),(1,0),(1,1) when fx >= fy
    const corners = fx >= fy ? [[0, 0], [1, 0], [1, 1]] : [[0, 0], [1, 1], [0, 1]];
    const minW = chunkArcSize(this.maxLevel, this.R) / CHUNK_N * 2;
    const tmp = [0, 0, 0];
    for (let k = 0; k < 3; k++) {
      const cu = -1 + (i + corners[k][0]) * cell, cv = -1 + (j + corners[k][1]) * cell;
      dirFromFaceUV(fu.face, cu, cv, tmp);
      const key = fu.face + ':' + (i + corners[k][0]) + ':' + (j + corners[k][1]);
      let h = this._hcache && this._hcache.get(key);
      if (h === undefined) {
        h = gen.sample(tmp[0], tmp[1], tmp[2], minW, this._scratch)[S_H];
        if (gen.p.liquid && gen.contThreshold > -1e8 && h < 0) h = 0;
        if (!this._hcache) this._hcache = new Map();
        if (this._hcache.size > 4096) this._hcache.clear();
        this._hcache.set(key, h);
      }
      const r = this.R + h;
      P[k][0] = tmp[0] * r; P[k][1] = tmp[1] * r; P[k][2] = tmp[2] * r;
    }
    // intersect the ray from the centre along d with the triangle plane
    const ax = P[1][0] - P[0][0], ay = P[1][1] - P[0][1], az = P[1][2] - P[0][2];
    const bx = P[2][0] - P[0][0], by = P[2][1] - P[0][1], bz = P[2][2] - P[0][2];
    const nx = ay * bz - az * by, ny = az * bx - ax * bz, nz = ax * by - ay * bx;
    const den = nx * d[0] + ny * d[1] + nz * d[2];
    const num = nx * P[0][0] + ny * P[0][1] + nz * P[0][2];
    if (Math.abs(den) < 1e-12) return Math.hypot(P[0][0], P[0][1], P[0][2]) - this.R;
    return num / den - this.R;
  }

  // Ground height + normal (body-fixed) by sampling a small cross
  groundNormal(dirFixed, out, h0) {
    const up = this._up || (this._up = new THREE.Vector3());
    up.copy(dirFixed).normalize();
    const t1 = this._t1 || (this._t1 = new THREE.Vector3());
    const t2 = this._t2 || (this._t2 = new THREE.Vector3());
    t1.set(0, 1, 0);
    if (Math.abs(up.y) > 0.9) t1.set(1, 0, 0);
    t1.cross(up).normalize();
    t2.copy(up).cross(t1);
    const e = 0.6;
    const r = this.R + (h0 === undefined ? this.groundHeight(up) : h0);
    const pA = this._pA || (this._pA = new THREE.Vector3());
    const pB = this._pB || (this._pB = new THREE.Vector3());
    const pC = this._pC || (this._pC = new THREE.Vector3());
    const dd = this._dd2 || (this._dd2 = new THREE.Vector3());
    dd.copy(up).multiplyScalar(r).addScaledVector(t1, e).normalize();
    pA.copy(dd).multiplyScalar(this.R + this.groundHeight(dd));
    dd.copy(up).multiplyScalar(r).addScaledVector(t1, -e).normalize();
    pB.copy(dd).multiplyScalar(this.R + this.groundHeight(dd));
    dd.copy(up).multiplyScalar(r).addScaledVector(t2, e).normalize();
    pC.copy(dd).multiplyScalar(this.R + this.groundHeight(dd));
    dd.copy(up).multiplyScalar(r).addScaledVector(t2, -e).normalize();
    const pD = this._pD || (this._pD = new THREE.Vector3());
    pD.copy(dd).multiplyScalar(this.R + this.groundHeight(dd));
    pA.sub(pB); pC.sub(pD);
    out.copy(pA).cross(pC).normalize();
    if (out.dot(up) < 0) out.negate();
    return out;
  }

  isWaterAt(dirFixed) {
    const gen = this.terrain;
    if (!gen || !gen.p.liquid || gen.contThreshold <= -1e8) return false;
    const d = this._wd || (this._wd = [0, 0, 0]);
    const l = dirFixed.length();
    d[0] = dirFixed.x / l; d[1] = dirFixed.y / l; d[2] = dirFixed.z / l;
    return gen.sample(d[0], d[1], d[2], 50, this._scratch)[S_H] < 0;
  }

  // ---------------------------------------------------------------- atmosphere

  // Thermodynamic state at altitude h (m above datum / 1-bar level for giants)
  atmosphereAt(h, out = {}) {
    const a = this.atm;
    if (!a || !a.render) { out.pressure = 0; out.density = 0; out.temperature = this.data.Tsurf || 3; out.inside = false; return out; }
    const H = a.render.rayleighH;
    const mu = a.mu * U.AMU;
    if (this.giant) {
      const g = this.giant;
      if (h >= 0) {
        const T = Math.max(g.T1bar * 0.75, g.T1bar - g.lapse * h * 0.3);
        out.pressure = Math.exp(-h / H);
        out.temperature = T;
      } else {
        const T = g.T1bar - g.lapse * h;
        out.temperature = T;
        out.pressure = Math.pow(T / g.T1bar, g.polytrope);
      }
    } else {
      const T0 = this.data.Tsurf;
      const lapse = this.data.terrain ? this.data.terrain.climate.lapse : 0;
      const T = Math.max(T0 * 0.6, T0 - lapse * Math.max(h, 0));
      out.temperature = T;
      out.pressure = a.pressure * Math.exp(-h / H);
    }
    out.density = out.pressure * 1e5 * mu / (U.K_B * out.temperature);
    out.inside = h < this.atmHeight;
    return out;
  }
}

export class Universe {
  constructor(system) {
    this.system = system;
    this.t = 0;
    this.bodies = system.bodies.map((b) => new BodyRuntime(b, this));
    for (const b of this.bodies) {
      if (b.data.parentId >= 0) {
        b.parent = this.bodies[b.data.parentId];
        b.parent.children.push(b);
      }
    }
    this.star = this.bodies[0];
    this.update(0);
  }

  update(t) {
    this.t = t;
    for (const b of this.bodies) {
      if (b.parent) {
        orbitState(b.data.orbit, t, _p, _v);
        b.relPos.set(_p[0], _p[1], _p[2]);
        b.relVel.set(_v[0], _v[1], _v[2]);
        b.pos.copy(b.parent.pos).add(b.relPos);
        b.vel.copy(b.parent.vel).add(b.relVel);
      } else {
        b.pos.set(0, 0, 0); b.vel.set(0, 0, 0);
      }
      b.orientationAt(t, b.q);
      b.qInv.copy(b.q).invert();
      b.omega.set(0, 1, 0).applyQuaternion(b.qTilt).multiplyScalar(b.data.rotation.rate);
    }
  }

  // World position/velocity of a body at an arbitrary time (no caching)
  bodyStateAt(b, t, outPos, outVel) {
    if (!b.parent) { outPos.set(0, 0, 0); if (outVel) outVel.set(0, 0, 0); return; }
    const pp = this._tmpP || (this._tmpP = new THREE.Vector3());
    const pv = this._tmpV || (this._tmpV = new THREE.Vector3());
    this.bodyStateAt(b.parent, t, pp, pv);
    orbitState(b.data.orbit, t, _p, _v);
    outPos.set(pp.x + _p[0], pp.y + _p[1], pp.z + _p[2]);
    if (outVel) outVel.set(pv.x + _v[0], pv.y + _v[1], pv.z + _v[2]);
  }

  // Deepest body whose sphere of influence contains the world point
  dominantBody(worldPos) {
    let best = this.star;
    let changed = true;
    while (changed) {
      changed = false;
      for (const c of best.children) {
        if (c.pos.distanceToSquared(worldPos) < c.soi * c.soi) { best = c; changed = true; break; }
      }
    }
    return best;
  }

  // Nearest body surface (for mass lock, FTL limits, map focus)
  nearestBody(worldPos) {
    let best = null, bestD = Infinity;
    for (const b of this.bodies) {
      const d = b.pos.distanceTo(worldPos) - b.R;
      if (d < bestD) { bestD = d; best = b; }
    }
    return { body: best, dist: bestD };
  }

  // Illuminance from the star at a world point (relative to S_earth)
  sunIlluminance(worldPos) {
    const d = worldPos.length();
    return this.system.star.luminosity * (U.GAME_AU / d) * (U.GAME_AU / d);
  }
}
