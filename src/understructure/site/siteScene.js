// A compiled site as a scene for the deferred WebGPU renderer: the solids
// batched per material, fixture lights, the hand light, water and the finds.
import * as THREE from 'three';
import { decayMaps } from '../decayVisual.js';
import { solidGeometries } from '../plan/solidMesh.js';
import { SiteCollision } from './siteCollision.js';

const LAMP = { amber: 0xffcb8e, cyan: 0xb9e0d4, work: 0xf2f6ff, deep: 0xff7a48, core: 0xc9a2ff };

export function buildSiteScene(plan, site) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#06090a');
  scene.fog = new THREE.FogExp2('#0a1416', 0.011);
  scene.userData.localShadows = true;
  const root = new THREE.Group(); scene.add(root);
  const maps = { concrete: decayMaps(plan.seed, 'concrete'), floor: decayMaps(plan.seed, 'floor'), metal: decayMaps(plan.seed, 'metal'), rust: decayMaps(plan.seed, 'rust') };
  const mat = {
    concrete: new THREE.MeshStandardMaterial({ color: '#ffffff', ...maps.concrete, roughness: 1, normalScale: new THREE.Vector2(0.65, 0.65) }),
    floor: new THREE.MeshStandardMaterial({ color: '#ffffff', ...maps.floor, roughness: 1, normalScale: new THREE.Vector2(0.4, 0.4) }),
    metal: new THREE.MeshStandardMaterial({ color: '#ffffff', ...maps.metal, roughness: 1, metalness: 0.4, normalScale: new THREE.Vector2(0.5, 0.5) }),
    rust: new THREE.MeshStandardMaterial({ color: '#ffffff', ...maps.rust, roughness: 1, metalness: 0.1 }),
    rock: new THREE.MeshStandardMaterial({ color: '#6a5c4e', ...maps.concrete, roughness: 1 }),
    dark: new THREE.MeshStandardMaterial({ color: '#141c1d', roughness: 0.9 }),
    amber: new THREE.MeshStandardMaterial({ color: '#d2ae6e', emissive: '#ffc075', emissiveIntensity: 1.3 }),
    cyan: new THREE.MeshStandardMaterial({ color: '#9dbab1', emissive: '#b9efe0', emissiveIntensity: 1.2 }),
    work: new THREE.MeshStandardMaterial({ color: '#e8eef8', emissive: '#f2f6ff', emissiveIntensity: 1.4 }),
    record: new THREE.MeshStandardMaterial({ color: '#c7a6ff', emissive: '#b98cff', emissiveIntensity: 1.6 }),
    deep: new THREE.MeshStandardMaterial({ color: '#ff9a6a', emissive: '#ff6a30', emissiveIntensity: 1.5 }),
    seep: new THREE.MeshStandardMaterial({ color: '#7fb4c0', emissive: '#16343a', emissiveIntensity: 0.6, metalness: 0.4, roughness: 0.15, transparent: true, opacity: 0.45, depthWrite: false, side: THREE.DoubleSide }),
    water: new THREE.MeshStandardMaterial({ color: '#1b3e3a', metalness: 0.55, roughness: 0.23 }),
    wet: new THREE.MeshStandardMaterial({ color: '#10140f', metalness: 0.25, roughness: 0.2, transparent: true, opacity: 0.42, depthWrite: false, side: THREE.DoubleSide }),
    trickle: new THREE.MeshStandardMaterial({ color: '#8fa7a4', metalness: 0.6, roughness: 0.06, transparent: true, opacity: 0.38, depthWrite: false, side: THREE.DoubleSide }),
    drop: new THREE.MeshStandardMaterial({ color: '#d8ebe8', emissive: '#2c3e3c', emissiveIntensity: 0.6, metalness: 0.3, roughness: 0.05 }),
    puddle: new THREE.MeshStandardMaterial({ color: '#141c1a', metalness: 0.7, roughness: 0.04, transparent: true, opacity: 0.62, depthWrite: false }),
  };
  for (const name of ['concrete', 'floor', 'metal', 'rust', 'rock']) mat[name].userData.webgpu = { kind: 'survey' };

  // every solid is collidable: walls, slabs, rails, machinery
  const collisionMeshes = [];
  for (const [name, g] of solidGeometries(site.solids)) {
    const mesh = new THREE.Mesh(g, mat[name] || mat.concrete);
    root.add(mesh); collisionMeshes.push(mesh);
  }
  const collision = new SiteCollision(collisionMeshes, site.zones);

  // fixtures: a housing on what holds it (plan/compile.js lamp mounts), and a light aimed off it
  const fixture = [];
  const lights = [];
  const box = (w, h, d, x, y, z, yaw, m) => { const g = new THREE.BoxGeometry(w, h, d); if (yaw) g.rotateY(yaw); g.translate(x, y, z); fixture.push([g, m]); };
  const rod = (r, x, y0, y1, z, m) => { const g = new THREE.CylinderGeometry(r, r, y1 - y0, 6); g.translate(x, (y0 + y1) / 2, z); fixture.push([g, m]); };
  for (const f of site.lamps) {
    const color = LAMP[f.color] ?? LAMP.amber, [x, y, z] = f.pos, n = f.n || [0, 0], yaw = Math.atan2(n[0], n[1]);
    const aim = [x, y - 1, z];
    switch (f.mount) {
      case 'none': break;   // (a glowing band or plate is the light)
      case 'wall': {       // a bracket off the wall, the housing at its end
        const d = 0.45; box(0.09, 0.09, d, x - n[0] * d / 2, y + 0.05, z - n[1] * d / 2, yaw, 'metal'); box(0.5, 0.2, 0.2, x, y, z, yaw, f.color);
        aim[0] = x + n[0] * 0.9; aim[2] = z + n[1] * 0.9; break;
      }
      case 'post':         // on a post at the catwalk's rail
        rod(0.05, x, f.base, y - 0.05, z, 'metal'); box(0.5, 0.12, 0.3, x, y + 0.02, z, 0, f.color); break;
      case 'floor':        // a floodlight standing on the ledge, washing the wall above it
        box(0.55, 0.32, 0.4, x, f.base + 0.16, z, yaw, 'metal'); box(0.48, 0.26, 0.05, x - n[0] * 0.2, f.base + 0.2, z - n[1] * 0.2, yaw, f.color);
        aim[0] = x - n[0] * 0.6; aim[1] = y + 1.4; aim[2] = z - n[1] * 0.6; break;
      case 'cable':        // hung on a cable from above (the visitors' work lights)
        rod(0.02, x, y + 0.15, f.top, z, 'metal'); box(0.32, 0.3, 0.32, x, y, z, 0, f.color); break;
      default: {           // flush on the ceiling
        const top = f.top ?? y + 0.2; box(0.9, 0.1, 0.36, x, top - 0.05, z, 0, f.color);
      }
    }
    const l = new THREE.SpotLight(color, f.power ?? 80, f.range ?? 34, f.wall ? 1.45 : 1.15, 0.45, 2);
    l.position.set(x, y, z);
    l.target.position.set(aim[0], aim[1], aim[2]);
    l.castShadow = true; l.userData.rectAspect = 2.4; l.userData.cells = []; l.userData.power = f.power ?? 80;
    scene.add(l, l.target); lights.push(l);
  }
  for (const [g, c] of fixture) root.add(new THREE.Mesh(g, mat[c] || mat.amber));
  // water seeping from rock wounds down into the pit
  // (and trickles down walls, flat on them, the wall darkened round them)
  for (const sp of site.seeps || []) {
    if (sp.n) {
      // a trickle: a thread of water wandering down the wall, spreading as it goes, on a darker wet streak
      const H = sp.y1 - sp.y0, yaw = Math.atan2(sp.n[0], sp.n[1]);
      for (const [w, off, m] of [[sp.w * 3.2, -0.012, mat.wet], [sp.w, 0, mat.trickle]]) {
        const g = new THREE.PlaneGeometry(1, H, 1, 16), P = g.attributes.position;
        for (let i = 0; i < P.count; i++) {
          const t = 0.5 - P.getY(i) / H, wid = w * (0.45 + 0.9 * t), wan = Math.sin(t * 5.1 + sp.phase) * 0.09 + Math.sin(t * 13 + sp.phase * 2) * 0.03;
          P.setX(i, P.getX(i) * wid + wan);
        }
        g.rotateY(yaw); g.translate(sp.x + sp.n[0] * off, (sp.y0 + sp.y1) / 2, sp.z + sp.n[1] * off);
        root.add(new THREE.Mesh(g, m));
      }
      continue;
    }
    const g = new THREE.PlaneGeometry(sp.w, sp.y1 - sp.y0, 1, 8); g.rotateY(-sp.yaw); g.translate(sp.x, (sp.y0 + sp.y1) / 2, sp.z);
    root.add(new THREE.Mesh(g, mat.seep));
  }
  for (const w of site.water) {
    const shape = new THREE.Shape(w.poly.map(([x, z]) => new THREE.Vector2(x, -z)));
    const g = new THREE.ShapeGeometry(shape); g.rotateX(-Math.PI / 2); g.translate(0, w.y, 0);
    root.add(new THREE.Mesh(g, w.puddle ? mat.puddle : mat.water));
  }

  // finds: low four-wheeled crawlers in dead ends, data shards elsewhere, the record at the core
  const finds = new Map();
  for (const f of site.markers) {
    const grp = new THREE.Group(); grp.position.set(f.pos[0], f.pos[1], f.pos[2]);
    if (f.kind === 'record') {
      const core = new THREE.Mesh(new THREE.OctahedronGeometry(0.45, 0), mat.record); core.position.y = 1.7; grp.add(core);
      const l = new THREE.PointLight(0xb98cff, 40, 12, 2); l.position.y = 1.9; grp.add(l);
    } else if (f.kind === 'crawler') {
      const body = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.5, 0.3, 7), mat.metal); body.position.y = 0.32; grp.add(body);
      for (const [dx, dz] of [[0.4, 0.32], [-0.4, 0.32], [0.4, -0.32], [-0.4, -0.32]]) { const wh = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.08, 10), mat.rust); wh.rotation.z = Math.PI / 2; wh.position.set(dx, 0.14, dz); grp.add(wh); }
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 6), mat.cyan); eye.position.set(0, 0.5, 0.3); grp.add(eye);
    } else {
      const shard = new THREE.Mesh(new THREE.OctahedronGeometry(0.16, 0), mat.cyan); shard.scale.y = 2.2; shard.position.y = 1.0; grp.add(shard);
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 0.8, 6), mat.metal); post.position.y = 0.4; grp.add(post);
    }
    root.add(grp); finds.set(f.id, grp);
  }

  const ambient = new THREE.HemisphereLight(0x9fb8b2, 0x1a2420, 0.16); scene.add(ambient);
  const flashlight = new THREE.SpotLight(0xe2efe0, 120, 120, Math.PI / 7, 0.65, 1.15);
  flashlight.castShadow = true; flashlight.userData.shadowPriority = 1; scene.add(flashlight, flashlight.target);

  // water dripping through broken ceilings: a drop or two falling from each, under gravity
  const drips = site.drips || [], DROPS = 2;
  const dropMesh = drips.length ? new THREE.InstancedMesh(new THREE.SphereGeometry(0.022, 6, 4), mat.drop, drips.length * DROPS) : null;
  if (dropMesh) { dropMesh.frustumCulled = false; root.add(dropMesh); }
  const _m = new THREE.Matrix4(), _p = new THREE.Vector3(), _q = new THREE.Quaternion(), _s = new THREE.Vector3();
  function updateDrops(time) {
    if (!dropMesh) return;
    let i = 0;
    for (const d of drips) {
      const fall = Math.sqrt(2 * Math.max(0.2, d.top - d.floor) / 9.81);
      for (let k = 0; k < DROPS; k++) {
        const t = (time + d.phase + k * d.period * 0.5) % (d.period + fall);
        // (a drop gathers under the rock, then falls: stretched as it speeds up)
        const fallT = Math.max(0, t - d.period), y = fallT > 0 ? d.top - 0.5 * 9.81 * fallT * fallT : d.top - 0.02, v = 9.81 * fallT;
        _p.set(d.x, Math.max(d.floor, y), d.z); _s.set(1, 1 + Math.min(4, v * 0.6), 1).multiplyScalar(fallT > 0 || t > d.period * 0.6 ? 1 : 0.6);
        _m.compose(_p, _q, _s); dropMesh.setMatrixAt(i++, _m);
      }
    }
    dropMesh.instanceMatrix.needsUpdate = true;
  }

  function update(camera, time, state) {
    updateDrops(time);
    flashlight.position.copy(camera.position);
    flashlight.target.position.set(0, -0.03, -1).applyQuaternion(camera.quaternion).add(camera.position);
    flashlight.intensity = state.flashlight ? 120 : 0;
    for (const [id, g] of finds) {
      g.visible = !state.collected.has(id);
      if (g.children[0]?.geometry?.type === 'OctahedronGeometry') g.children[0].rotation.y = time * 0.8;
    }
  }
  return { scene, root, mat, update, collision, lights, flashlight };
}
