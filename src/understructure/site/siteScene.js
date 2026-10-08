// A compiled site as a scene for the deferred WebGPU renderer: the solids
// batched per material, fixture lights, the hand light, water and the finds.
import * as THREE from 'three';
import { decayMaps } from '../decayVisual.js';
import { solidGeometries } from '../plan/solidMesh.js';
import { SiteCollision } from './siteCollision.js';

const LAMP = { amber: 0xffcb8e, cyan: 0xb9e0d4, work: 0xf2f6ff };

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
    water: new THREE.MeshStandardMaterial({ color: '#1b3e3a', metalness: 0.55, roughness: 0.23 }),
  };
  for (const name of ['concrete', 'floor', 'metal', 'rust', 'rock']) mat[name].userData.webgpu = { kind: 'survey' };

  // every solid is collidable: walls, slabs, rails, machinery
  const collisionMeshes = [];
  for (const [name, g] of solidGeometries(site.solids)) {
    const mesh = new THREE.Mesh(g, mat[name] || mat.concrete);
    root.add(mesh); collisionMeshes.push(mesh);
  }
  const collision = new SiteCollision(collisionMeshes, site.zones);

  // fixtures: a housing and a light
  const fixture = [];
  const lights = [];
  for (const f of site.lamps) {
    const color = LAMP[f.color] ?? LAMP.amber;
    const g = new THREE.BoxGeometry(0.9, 0.12, 0.36); g.translate(f.pos[0], f.pos[1] + 0.1, f.pos[2]);
    fixture.push([g, f.color]);
    const l = new THREE.SpotLight(color, f.power ?? 80, 34, f.wall ? 1.45 : 1.15, 0.45, 2);
    l.position.set(f.pos[0], f.pos[1], f.pos[2]);
    l.target.position.set(f.pos[0], f.pos[1] - 1, f.pos[2]);
    l.castShadow = true; l.userData.rectAspect = 2.4; l.userData.cells = []; l.userData.power = f.power ?? 80;
    scene.add(l, l.target); lights.push(l);
  }
  for (const [g, c] of fixture) root.add(new THREE.Mesh(g, mat[c] || mat.amber));
  for (const w of site.water) {
    const shape = new THREE.Shape(w.poly.map(([x, z]) => new THREE.Vector2(x, -z)));
    const g = new THREE.ShapeGeometry(shape); g.rotateX(-Math.PI / 2); g.translate(0, w.y, 0);
    root.add(new THREE.Mesh(g, mat.water));
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

  function update(camera, time, state) {
    flashlight.position.copy(camera.position);
    flashlight.target.position.set(0, -0.03, -1).applyQuaternion(camera.quaternion).add(camera.position);
    flashlight.intensity = state.flashlight ? 120 : 0;
    for (const [id, g] of finds) {
      g.visible = !state.collected.has(id);
      if (g.children[0]?.geometry?.type === 'OctahedronGeometry') g.children[0].rotation.y = time * 0.8;
    }
  }
  return { scene, update, collision, lights, flashlight };
}
