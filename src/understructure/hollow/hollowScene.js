// The Hollow Moon drawn (hollowWorld.js for its shape and physics): the sphere's inside with its sea, its
// worked land and its caps; a light down its axis; a hub at each pole with the founders' shaft; three
// stairways down each cap, their steps level in the spin's weight (tall near the hub, where a jump carries
// you up several metres; a normal stair's at the land's edge); the founders' towers standing up into the
// middle. Everything drawn is collided with (GeometryCollision over the same meshes) and the walker's field
// is the world's.
import * as THREE from 'three';
import { GeometryCollision } from '../geometryCollision.js';
import { hollowField, groundRadius, landTexture } from './hollowWorld.js';
import { Rng } from '../../core/rng.js';

// (the steps: their width across, and the most they rise)
const STAIR_W = 6, RISE_MAX = 3;

// the land's texture (hollowWorld.js landTexture), wrapping round in longitude
function landMap(w) {
  const { data, W, H } = landTexture(w);
  const t = new THREE.DataTexture(data, W, H, THREE.RGBAFormat);
  t.colorSpace = THREE.SRGBColorSpace; t.wrapS = THREE.RepeatWrapping; t.wrapT = THREE.ClampToEdgeWrapping;
  t.magFilter = THREE.LinearFilter; t.minFilter = THREE.LinearMipmapLinearFilter; t.generateMipmaps = true; t.anisotropy = 8; t.needsUpdate = true;
  return t;
}

export function buildHollowScene(w) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(w.still ? '#030405' : '#0b0d0e');
  // (the air across it: kilometres of it between you and the land overhead)
  scene.fog = new THREE.FogExp2(w.still ? '#050607' : '#9aa6aa', w.still ? 0.00035 : 0.00007);
  // (its light: the air lit by the axis, a little under the land it lies over)
  scene.userData.fogLuminance = w.still ? 0.02 : 0.45;
  const root = new THREE.Group(); scene.add(root);
  const mat = {
    land: new THREE.MeshStandardMaterial({ map: landMap(w), roughness: 0.95, metalness: 0 }),
    stone: new THREE.MeshStandardMaterial({ color: '#8e8a80', roughness: 0.8, metalness: 0.1 }),
    dark: new THREE.MeshStandardMaterial({ color: '#2a2c2b', roughness: 0.7, metalness: 0.3 }),
    metal: new THREE.MeshStandardMaterial({ color: '#9aa3a0', roughness: 0.45, metalness: 0.6 }),
    water: new THREE.MeshStandardMaterial({ color: '#1d3a38', metalness: 0.5, roughness: 0.18, side: THREE.DoubleSide }),
    glow: new THREE.MeshStandardMaterial({ color: w.still ? '#ff6a40' : '#fff2d8', emissive: w.still ? '#ff4a20' : '#fff0d0', emissiveIntensity: w.still ? 5 : 6 }),
    lamp: new THREE.MeshStandardMaterial({ color: '#e8d9b0', emissive: '#ffd890', emissiveIntensity: 1.6 }),
  };
  const meshes = [];
  const add = (geo, m) => { const mesh = new THREE.Mesh(geo, m); root.add(mesh); meshes.push(mesh); return mesh; };

  // the land: the sphere's inside, its faces turned in, shaped and coloured by the world
  {
    const edge = w.Rs > 3000 ? 48 : 30, detail = Math.max(8, Math.round(1.05 * w.Rs / edge) - 1);
    const g = new THREE.IcosahedronGeometry(1, detail), p = g.attributes.position, n = p.count;
    const uv = new Float32Array(n * 2), d = [0, 0, 0];
    for (let i = 0; i < n; i++) {
      d[0] = p.getX(i); d[1] = p.getY(i); d[2] = p.getZ(i);
      const l = Math.hypot(d[0], d[1], d[2]); d[0] /= l; d[1] /= l; d[2] /= l;
      const r = groundRadius(w, d);
      p.setXYZ(i, d[0] * r, d[1] * r, d[2] * r);
      uv[i * 2] = Math.atan2(d[2], d[0]) / (Math.PI * 2) + 0.5; uv[i * 2 + 1] = Math.asin(Math.max(-1, Math.min(1, d[1]))) / Math.PI + 0.5;
    }
    // (turned in: each triangle's winding reversed, so its face looks at the middle; a triangle across the
    // seam of longitude takes its texture the short way round)
    for (let i = 0; i < n; i += 3) {
      const ax = p.getX(i), ay = p.getY(i), az = p.getZ(i); p.setXYZ(i, p.getX(i + 2), p.getY(i + 2), p.getZ(i + 2)); p.setXYZ(i + 2, ax, ay, az);
      for (let c = 0; c < 2; c++) { const t = uv[i * 2 + c]; uv[i * 2 + c] = uv[(i + 2) * 2 + c]; uv[(i + 2) * 2 + c] = t; }
      const us = [uv[i * 2], uv[i * 2 + 2], uv[i * 2 + 4]];
      if (Math.max(...us) - Math.min(...us) > 0.5) for (let c = 0; c < 3; c++) if (uv[(i + c) * 2] < 0.5) uv[(i + c) * 2] += 1;
    }
    g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    g.computeVertexNormals();
    add(g, mat.land);
  }

  // the sea: its water on the spin's level, a cylinder round the axis
  if (w.seaHalf > 0) {
    const yH = w.Rs * Math.sin(w.seaHalf * 1.25), g = new THREE.CylinderGeometry(w.seaLevel, w.seaLevel, 2 * yH, 512, 1, true);
    const sea = new THREE.Mesh(g, mat.water); root.add(sea);   // (not stood on: you go under)
  }

  // the light down the axis: a tube glowing the length of it, lit by lamps along it (a line's light falls
  // as 1/d, which a row of point lights close enough together makes)
  const lights = [];
  {
    const L = w.Rs - w.hubDepth - 40, tube = new THREE.Mesh(new THREE.CylinderGeometry(5, 5, 2 * L, 24, 1, true), mat.glow);
    root.add(tube);
    if (!w.still) {
      const n = Math.max(6, Math.round(2 * L / 320));
      for (let k = 0; k < n; k++) {
        const l = new THREE.PointLight(0xfff0d8, 9e5, 20000, 2); l.position.set(0, -L + (k + 0.5) * (2 * L / n), 0); root.add(l); lights.push(l);
      }
    } else {
      // (the still one's axis dying: an ember along it, a few of its lamps still failing on)
      for (let k = 0; k < 4; k++) { const l = new THREE.PointLight(0xff5a30, 3e5, 20000, 2); l.position.set(0, -L * 0.7 + k * L * 0.47, 0); root.add(l); lights.push(l); }
    }
  }
  scene.add(new THREE.HemisphereLight(w.still ? 0x3a2016 : 0x6c7066, w.still ? 0x180c08 : 0x2a2a24, w.still ? 0.2 : 0.25));
  // (the still one: the rubble of its works adrift in the dark round the north hub, weightless)
  if (w.still) {
    const rng = Rng.fromString(`hollow-drift:${w.seed}`), N = 260, im = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(1, 0), mat.stone, N), _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler();
    for (let k = 0; k < N; k++) {
      const a = rng.range(0, Math.PI * 2), r = rng.range(15, 260), y = w.Rs - w.hubDepth - rng.range(10, 420), sz = 0.3 + Math.pow(rng.next(), 3) * 7;
      im.setMatrixAt(k, _m.compose(new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r), _q.setFromEuler(_e.set(rng.range(0, 6), rng.range(0, 6), rng.range(0, 6))), new THREE.Vector3(sz, sz * rng.range(0.4, 1), sz)));
    }
    root.add(im);
  }
  const sun = new THREE.DirectionalLight(0xffffff, 0); scene.add(sun, sun.target);

  // the hubs: a drum at each pole, standing in from the shell on the axis; the shaft into the north one
  for (const s of [1, -1]) {
    // (its wall, and at its foot where it meets the cap a doorway onto each stairway's top: the wall's lower
    // band in pieces between them)
    const DOOR = 14, gap = 5.5 / w.hubR, drumM = Object.assign(mat.stone.clone(), { side: THREE.DoubleSide });
    const upper = new THREE.CylinderGeometry(w.hubR, w.hubR, w.hubDepth - DOOR, 48, 1, true); upper.translate(0, s * (w.Rs - DOOR - (w.hubDepth - DOOR) / 2), 0);
    add(upper, drumM);
    // (three's cylinders run their angle from +z toward +x: a stairway at th lies at pi/2 - th)
    const doors = w.stairs.map((th) => ((Math.PI / 2 - th) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2)).sort((a, b) => a - b);
    doors.forEach((d, k) => {
      const from = d + gap, to = (k + 1 < doors.length ? doors[k + 1] : doors[0] + Math.PI * 2) - gap;
      const band = new THREE.CylinderGeometry(w.hubR, w.hubR, DOOR, 16, 1, true, from, to - from); band.translate(0, s * (w.Rs - DOOR / 2), 0);
      add(band, drumM);
    });
    // (its inner end, facing the far pole, with a ring of lamps; open in the middle onto the axis)
    const ring = new THREE.RingGeometry(14, w.hubR, 48); ring.rotateX(s > 0 ? Math.PI / 2 : -Math.PI / 2); ring.translate(0, s * (w.Rs - w.hubDepth), 0);
    add(ring, Object.assign(mat.metal.clone(), { side: THREE.DoubleSide }));
    for (let k = 0; k < 12; k++) {
      const a = k * Math.PI / 6, lamp = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.4, 1.2), mat.lamp);
      lamp.position.set(Math.cos(a) * (w.hubR - 3), s * (w.Rs - w.hubDepth + 0.4), Math.sin(a) * (w.hubR - 3)); root.add(lamp);
    }
    if (!w.still) { const l = new THREE.PointLight(0xffd890, 700, 160, 2); l.position.set(0, s * (w.Rs - w.hubDepth * 0.5), 0); root.add(l); }
  }
  {
    // (the shaft: up the axis from the north hub through the crust to the moon's surface, its walls ringed with
    // lamps; the express lift runs it)
    const top = Math.max(w.Rs + 400, w.moonR), L = top - w.Rs;
    const sh = new THREE.CylinderGeometry(8, 8, L, 32, 1, true); sh.translate(0, w.Rs + L / 2, 0);
    add(sh, Object.assign(mat.dark.clone(), { side: THREE.DoubleSide }));
    const n = Math.floor(L / 40), rings = new THREE.InstancedMesh(new THREE.TorusGeometry(7.6, 0.15, 6, 32), w.still ? mat.dark : mat.lamp, n), _m = new THREE.Matrix4(), _q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2);
    for (let k = 0; k < n; k++) rings.setMatrixAt(k, _m.compose(new THREE.Vector3(0, w.Rs + 20 + k * 40, 0), _q, new THREE.Vector3(1, 1, 1)));
    rings.frustumCulled = false; root.add(rings);
  }

  // the stairways: three down each cap, from the hub's rim to the land; each step level in the spin's weight
  // (its tread at one distance from the axis), tall where weight is slight
  const stairs = [];
  {
    const pos = [], idx = [];
    const box = (c, ax, hs) => {
      // (a box at c with axes ax[0..2] and half-sizes hs)
      const b = pos.length / 3;
      for (const sx of [-1, 1]) for (const sy of [-1, 1]) for (const sz of [-1, 1]) for (let k = 0; k < 3; k++) pos.push(c[k] + ax[0][k] * hs[0] * sx + ax[1][k] * hs[1] * sy + ax[2][k] * hs[2] * sz);
      for (const f of [[0, 1, 3, 2], [4, 6, 7, 5], [0, 4, 5, 1], [2, 3, 7, 6], [0, 2, 6, 4], [1, 5, 7, 3]]) idx.push(b + f[0], b + f[1], b + f[2], b + f[0], b + f[2], b + f[3]);
    };
    const rhoEnd = w.Rs * Math.cos(w.landEdge), yCap = (rho) => Math.sqrt(Math.max(0, w.Rs * w.Rs - rho * rho));
    for (const s of [1, -1]) for (const th of w.stairs) {
      const rh = [Math.cos(th), 0, Math.sin(th)], tg = [-Math.sin(th), 0, Math.cos(th)], yv = [0, s, 0];
      const path = [];
      let rho = w.hubR + 1;
      while (rho < rhoEnd) {
        const g = rho / w.Rs, rise = Math.min(RISE_MAX, Math.max(0.3, 0.55 / Math.max(g, 0.01)));
        const r1 = Math.min(rhoEnd, rho + rise), ya = yCap(rho), yb = yCap(r1 + 0.6);
        // (the step: its tread facing the axis at rho, from the cap below it up to here; buried into the cap)
        const depth = rise + 1.5, c = [rh[0] * (rho + depth / 2), s * (ya + yb) / 2, rh[2] * (rho + depth / 2)];
        box(c, [rh, yv, tg], [depth / 2, Math.max(0.15, (ya - yb) / 2), STAIR_W / 2]);
        path.push([rh[0] * rho, s * (ya + yb) / 2, rh[2] * rho]);
        rho = r1;
      }
      stairs.push({ pole: s, theta: th, path });
    }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
    add(g, mat.stone);
  }

  // the founders' towers: standing in from the land in its cities, up toward the axis
  if (!w.still) {
    const rng = Rng.fromString(`hollow-cities:${w.seed}`), pos = [], idx = [];
    const box = (c, ax, hs) => {
      const b = pos.length / 3;
      for (const sx of [-1, 1]) for (const sy of [-1, 1]) for (const sz of [-1, 1]) for (let k = 0; k < 3; k++) pos.push(c[k] + ax[0][k] * hs[0] * sx + ax[1][k] * hs[1] * sy + ax[2][k] * hs[2] * sz);
      for (const f of [[0, 1, 3, 2], [4, 6, 7, 5], [0, 4, 5, 1], [2, 3, 7, 6], [0, 2, 6, 4], [1, 5, 7, 3]]) idx.push(b + f[0], b + f[1], b + f[2], b + f[0], b + f[2], b + f[3]);
    };
    for (const city of w.cities) {
      for (let k = 0; k < 18; k++) {
        const th = city.theta + rng.range(-1, 1) * city.size / w.Rs, lat = city.lat + rng.range(-1, 1) * city.size / w.Rs;
        const d = [Math.cos(lat) * Math.cos(th), Math.sin(lat), Math.cos(lat) * Math.sin(th)], r = groundRadius(w, d);
        // (standing along the spin's up there: in toward the axis, square to it)
        const up = [-Math.cos(th), 0, -Math.sin(th)], ax2 = [-Math.sin(th), 0, Math.cos(th)], h = rng.range(20, 140), fw = rng.range(8, 24), fd = rng.range(8, 24);
        const base = [d[0] * r, d[1] * r, d[2] * r], c = [base[0] + up[0] * (h / 2 - 4), base[1], base[2] + up[2] * (h / 2 - 4)];
        box(c, [up, [0, 1, 0], ax2], [h / 2 + 4, fd / 2, fw / 2]);
      }
    }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
    add(g, mat.stone);
  }

  const collision = new GeometryCollision(meshes);
  collision.fieldAt = hollowField(w);
  collision.omega = w.omega > 0 ? [0, w.omega, 0] : null;
  // (where you arrive: floating in the north hub, on the axis, looking down it toward the far pole)
  const spawn = { pos: [0.5, w.Rs - w.hubDepth * 0.6, 0], up: [0, 1, 0], fwd: [1, 0, 0] };
  const hand = new THREE.SpotLight(0xe2efe0, 120, 120, Math.PI / 7, 0.65, 1.15); hand.castShadow = true; scene.add(hand, hand.target);
  function update(camera, time, state = {}) {
    hand.position.copy(camera.position);
    hand.target.position.set(0, 0, -1).applyQuaternion(camera.quaternion).add(camera.position);
    hand.intensity = state.flashlight === false ? 0 : 120;
  }
  return { scene, root, mat, collision, spawn, stairs, lights, update };
}
