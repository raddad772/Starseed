// Procedural spacecraft: a 26 m landing-capable fusion transport.
//
// Ship-local frame: +X right, +Y up, -Z forward; origin on the cabin floor
// centreline. Layout (bow -> stern): glazed cockpit with two seats, main cabin,
// ramp bay with a rear loading ramp, fusion drive section above the ramp.
// Belly thrusters (VTOL), RCS quads, four shock-absorbing landing legs,
// radiator wings, a heat-shielded belly. Interior walls are separate geometry
// so the hull reads correctly from both sides.

import * as THREE from 'three';

// cross-section stations along z: [z, halfWidth, top, bottom]
const STATIONS = [
  [-13.2, 0.25, 1.0, 0.35],
  [-12.4, 1.05, 1.55, -0.05],
  [-11.2, 1.85, 2.15, -0.42],
  [-9.6, 2.45, 2.65, -0.62],
  [-7.6, 2.8, 2.95, -0.72],
  [-4.0, 2.95, 3.1, -0.78],
  [2.0, 3.0, 3.15, -0.78],
  [6.6, 2.85, 3.1, -0.72],
  [8.6, 2.6, 3.25, 0.15],
  [11.4, 2.3, 3.35, 0.75],
  [12.9, 1.7, 3.1, 1.15],
];
const SQUARENESS = 3.2;

function station(z) {
  const S = STATIONS;
  if (z <= S[0][0]) return S[0].slice(1);
  for (let i = 0; i < S.length - 1; i++) {
    if (z <= S[i + 1][0]) {
      const t = (z - S[i][0]) / (S[i + 1][0] - S[i][0]);
      const u = t * t * (3 - 2 * t);
      return [1, 2, 3].map((k) => S[i][k] + (S[i + 1][k] - S[i][k]) * u);
    }
  }
  return S[S.length - 1].slice(1);
}

// point on the cross-section at angle th (0 = right side, pi/2 = top)
function sectionPoint(z, th, inset = 0) {
  const [w, top, bot] = station(z);
  const c = Math.cos(th), s = Math.sin(th);
  const e = 2 / SQUARENESS;
  const x = Math.sign(c) * Math.pow(Math.abs(c), e) * Math.max(0.05, w - inset);
  const mid = (top + bot) / 2, hh = (top - bot) / 2;
  const y = mid + Math.sign(s) * Math.pow(Math.abs(s), e) * Math.max(0.05, hh - inset);
  return new THREE.Vector3(x, y, z);
}

// Lofted surface over a z-range and angle range
function loft(z0, z1, th0, th1, nz, nt, inset = 0, flip = false) {
  const pos = [], uv = [], idx = [];
  for (let i = 0; i <= nz; i++) {
    const z = z0 + (z1 - z0) * i / nz;
    for (let j = 0; j <= nt; j++) {
      const th = th0 + (th1 - th0) * j / nt;
      const p = sectionPoint(z, th, inset);
      pos.push(p.x, p.y, p.z);
      uv.push((z + 13.2) / 9, th * 0.55);
    }
  }
  for (let i = 0; i < nz; i++) for (let j = 0; j < nt; j++) {
    const a = i * (nt + 1) + j, b = a + 1, c = a + nt + 1, d = c + 1;
    // (a, b, c): t_theta x z points outward for counter-clockwise sections
    if (!flip) idx.push(a, b, c, b, d, c); else idx.push(a, c, b, b, c, d);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

function capLoft(z, th0, th1, nt, inset = 0, faceBack = false) {
  const [w, top, bot] = station(z);
  const center = new THREE.Vector3(0, (top + bot) / 2, z);
  const pos = [center.x, center.y, center.z], idx = [];
  for (let j = 0; j <= nt; j++) { const p = sectionPoint(z, th0 + (th1 - th0) * j / nt, inset); pos.push(p.x, p.y, p.z); }
  for (let j = 0; j < nt; j++) faceBack ? idx.push(0, j + 1, j + 2) : idx.push(0, j + 2, j + 1);
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

// Hull panel texture: plates, seams, rivet rows, weathering, a few markings
function hullTexture(seedName) {
  const S = 1024;
  const c = document.createElement('canvas');
  c.width = c.height = S;
  const g = c.getContext('2d');
  g.fillStyle = '#b8bcbf';
  g.fillRect(0, 0, S, S);
  let seed = 7;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  // plates
  for (let y = 0; y < S; y += 128) {
    let x = -rnd() * 256;
    while (x < S) {
      const w = 192 + Math.floor(rnd() * 3) * 96;
      const v = 172 + Math.floor(rnd() * 14);
      g.fillStyle = `rgb(${v},${v + 2},${v + 5})`;
      g.fillRect(x + 1, y + 1, w - 2, 126);
      g.strokeStyle = 'rgba(40,44,48,0.5)';
      g.lineWidth = 2;
      g.strokeRect(x + 1, y + 1, w - 2, 126);
      g.fillStyle = 'rgba(60,64,70,0.4)';
      for (let rx = x + 10; rx < x + w - 6; rx += 22) { g.fillRect(rx, y + 6, 2, 2); g.fillRect(rx, y + 120, 2, 2); }
      x += w;
    }
  }
  // grime streaks
  for (let i = 0; i < 260; i++) {
    const x = rnd() * S, y = rnd() * S, l = 20 + rnd() * 120;
    g.fillStyle = `rgba(50,45,40,${0.03 + rnd() * 0.06})`;
    g.fillRect(x, y, 1 + rnd() * 3, l);
  }
  // stripe and registration
  g.fillStyle = '#c4501f';
  g.fillRect(0, 448, S, 26);
  g.fillStyle = '#1e2226';
  g.fillRect(0, 476, S, 6);

  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

function interiorTexture() {
  const S = 512;
  const c = document.createElement('canvas');
  c.width = c.height = S;
  const g = c.getContext('2d');
  g.fillStyle = '#5c6268';
  g.fillRect(0, 0, S, S);
  for (let y = 0; y < S; y += 128) for (let x = 0; x < S; x += 128) {
    g.fillStyle = '#6a7177';
    g.fillRect(x + 3, y + 3, 122, 122);
    g.strokeStyle = '#3a3f44';
    g.strokeRect(x + 3.5, y + 3.5, 121, 121);
    g.fillStyle = '#4a5056';
    g.fillRect(x + 12, y + 56, 104, 16);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function floorTexture() {
  const S = 256;
  const c = document.createElement('canvas');
  c.width = c.height = S;
  const g = c.getContext('2d');
  g.fillStyle = '#2b2f33';
  g.fillRect(0, 0, S, S);
  g.strokeStyle = '#3f454b';
  g.lineWidth = 3;
  for (let i = -S; i < S * 2; i += 16) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i + S, S); g.stroke(); }
  g.strokeStyle = '#191c1f';
  g.lineWidth = 6;
  g.strokeRect(0, 0, S, S);
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function box(w, h, d, mat, x, y, z, parent, opts = {}) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z);
  m.castShadow = opts.cast !== false;
  m.receiveShadow = true;
  parent.add(m);
  return m;
}

// Screen texture for cockpit displays (redrawn by the game)
export function makeScreen(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return { canvas: c, ctx: c.getContext('2d'), tex };
}

export function buildShip(name = 'SS-01') {
  const root = new THREE.Group();
  root.name = 'ship';
  const hullMap = hullTexture(name);
  // (the hull's shells two-sided: their inner faces show through the openings, and no piece
  // vanishes for facing the wrong way)
  const hullMat = new THREE.MeshStandardMaterial({ map: hullMap, metalness: 0.55, roughness: 0.48, side: THREE.DoubleSide });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x2a2e33, metalness: 0.6, roughness: 0.55, side: THREE.DoubleSide });
  const shieldMat = new THREE.MeshStandardMaterial({ color: 0x1b1c1e, metalness: 0.1, roughness: 0.85, side: THREE.DoubleSide });
  const radMat = new THREE.MeshStandardMaterial({ color: 0xd9d4c8, metalness: 0.3, roughness: 0.35 });
  // glass reflects specularly and scatters almost nothing diffusely: a dark
  // base colour keeps a sunlit canopy from glowing as a grey haze
  const glassMat = new THREE.MeshPhysicalMaterial({ color: 0x141a1e, metalness: 0, roughness: 0.04, transmission: 0, transparent: true, opacity: 0.14, depthWrite: false, side: THREE.DoubleSide });
  // ...and like glass, clear looked through square on (the pilot's view) but more and more a
  // sheen at a slant (Fresnel), so from outside the canopy reads as glass, not a hole
  glassMat.onBeforeCompile = (sh) => {
    sh.fragmentShader = sh.fragmentShader.replace('#include <opaque_fragment>', `#include <opaque_fragment>
      float fresK = pow(1.0 - abs(dot(normalize(normal), normalize(vViewPosition))), 2.5);
      gl_FragColor.a = mix(0.16, 0.85, fresK);
      gl_FragColor.rgb += vec3(0.05, 0.07, 0.09) * fresK;`);
  };
  const frameMat = new THREE.MeshStandardMaterial({ color: 0x34393f, metalness: 0.7, roughness: 0.4 });
  const nozzleMat = new THREE.MeshStandardMaterial({ color: 0x4a3d33, metalness: 0.9, roughness: 0.3 });
  // (the cabin two-sided too: solid seen from outside, through the canopy and the bay)
  const wallMat = new THREE.MeshStandardMaterial({ map: interiorTexture(), metalness: 0.2, roughness: 0.7, side: THREE.DoubleSide });
  const floorMap = floorTexture();
  floorMap.repeat.set(2, 6);
  const floorMat = new THREE.MeshStandardMaterial({ map: floorMap, metalness: 0.5, roughness: 0.6, side: THREE.DoubleSide });
  const consoleMat = new THREE.MeshStandardMaterial({ color: 0x23282d, metalness: 0.4, roughness: 0.5, side: THREE.DoubleSide });
  const seatMat = new THREE.MeshStandardMaterial({ color: 0x5a2f22, metalness: 0.05, roughness: 0.9, side: THREE.DoubleSide });
  // light levels in scene units (1.0 ~ full sunlight illuminance)
  const lightMat = new THREE.MeshStandardMaterial({ color: 0x000000, emissive: 0xfff1d6, emissiveIntensity: 0.06 });

  const exterior = new THREE.Group(); exterior.name = 'exterior';
  const interior = new THREE.Group(); interior.name = 'interior';
  root.add(exterior, interior);

  // ---- hull: upper shell, belly fore/aft (ramp gap), cockpit glazing
  const PI = Math.PI;
  const upperFore = new THREE.Mesh(loft(-13.2, -7.4, 0.05 * PI, 0.95 * PI, 18, 24), hullMat); // below canopy band sides
  const upperMain = new THREE.Mesh(loft(-7.4, 12.9, -0.02 * PI, 1.02 * PI, 48, 32), hullMat);
  // belly up to the ramp hinge; aft of it only the side skirts (the ramp is the tail's underside)
  const lowerFore = new THREE.Mesh(loft(-13.2, 7.15, 1.02 * PI, 1.98 * PI, 44, 24), shieldMat);
  const lowerAftL = new THREE.Mesh(loft(7.15, 12.9, 1.02 * PI, 1.27 * PI, 12, 8), shieldMat);
  const lowerAftR = new THREE.Mesh(loft(7.15, 12.9, 1.73 * PI, 1.98 * PI, 12, 8), shieldMat);
  const sideFore = new THREE.Mesh(loft(-13.2, 12.9, -0.06 * PI, 0.05 * PI, 60, 3), hullMat);
  const sideFore2 = new THREE.Mesh(loft(-13.2, 12.9, 0.95 * PI, 1.06 * PI, 60, 3), hullMat);
  for (const m of [upperMain, lowerFore, lowerAftL, lowerAftR, sideFore, sideFore2]) { m.castShadow = true; m.receiveShadow = true; exterior.add(m); }
  // stern bay walls flanking the ramp opening
  for (const sx of [-1, 1]) {
    const wall = new THREE.Mesh(new THREE.BoxGeometry(0.12, 2.6, 5.6), darkMat);
    wall.position.set(sx * 1.66, 1.3, 9.95);
    exterior.add(wall);
  }
  const bayRoof = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.12, 5.6), darkMat);
  bayRoof.position.set(0, 2.62, 9.95);
  exterior.add(bayRoof);
  // nose cone lower part under the canopy
  upperFore.castShadow = true; upperFore.receiveShadow = true;
  // canopy: glass over the cockpit, framed
  const canopy = new THREE.Mesh(loft(-12.9, -7.4, 0.06 * PI, 0.94 * PI, 16, 20, -0.02), glassMat);
  canopy.renderOrder = 5;
  // electrochromic canopy: blocks direct sun from the cockpit (no glare inside)
  canopy.castShadow = true;
  exterior.add(canopy);
  // keep only the lower band of the fore upper shell (canopy sits above y ~ 1.3)
  const foreBand = new THREE.Mesh(loft(-13.2, -7.4, 0.0, 0.12 * PI, 18, 4), hullMat);
  const foreBand2 = new THREE.Mesh(loft(-13.2, -7.4, 0.88 * PI, 1.0 * PI, 18, 4), hullMat);
  foreBand.castShadow = foreBand2.castShadow = true;
  exterior.add(foreBand, foreBand2);
  // canopy frames: arches + spine
  for (const z of [-12.75, -8.6, -7.5]) { // arches clear of the pilot's sightline
    const pts = [];
    for (let j = 0; j <= 20; j++) pts.push(sectionPoint(z, (0.1 + 0.8 * j / 20) * PI, -0.03));
    const curve = new THREE.CatmullRomCurve3(pts);
    const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 24, 0.07, 6, false), frameMat);
    tube.castShadow = true;
    exterior.add(tube);
  }
  {
    const pts = [];
    for (let z = -12.9; z <= -7.4; z += 0.5) pts.push(sectionPoint(z, 0.5 * PI, -0.03));
    exterior.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 16, 0.08, 6, false), frameMat));
  }
  // bulkhead caps at the bow and stern
  const stern = new THREE.Mesh(capLoft(12.9, 0, 2 * PI, 32, 0, true), darkMat);
  const bow = new THREE.Mesh(capLoft(-13.2, 0, 2 * PI, 32, 0, false), darkMat);
  exterior.add(stern, bow);

  // ---- engines: twin fusion drive bells in a housing above the ramp
  const engines = [];
  const engineGlow = [];
  for (const x of [-1.15, 1.15]) {
    const bell = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.85, 1.9, 28, 1, true), nozzleMat);
    bell.rotation.x = Math.PI / 2;
    bell.position.set(x, 2.2, 13.75);
    bell.castShadow = true;
    exterior.add(bell);
    // heat-resistant throat that glows while the drive fires
    const glowMat = new THREE.MeshStandardMaterial({ color: 0x241d18, emissive: 0xff7a2a, emissiveIntensity: 0, metalness: 0.6, roughness: 0.5, side: THREE.DoubleSide });
    const throat = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.5, 0.7, 20, 1, true), glowMat);
    throat.rotation.x = Math.PI / 2;
    throat.position.set(x, 2.2, 12.6);
    exterior.add(throat);
    engineGlow.push(glowMat);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.86, 0.06, 6, 28), frameMat);
    ring.position.set(x, 2.2, 14.7);
    exterior.add(ring);
    engines.push(new THREE.Vector3(x, 2.2, 14.7));
  }
  // greebles: equipment boxes, vents and conduits along the spine and flanks
  {
    let sd = 9;
    const rnd = () => { sd = (sd * 16807) % 2147483647; return sd / 2147483647; };
    for (let i = 0; i < 26; i++) {
      const z = -6 + rnd() * 17;
      const st = station(z);
      const side = rnd() < 0.5 ? -1 : 1;
      const onTop = rnd() < 0.55;
      const w = 0.25 + rnd() * 0.6, h = 0.08 + rnd() * 0.18, d = 0.4 + rnd() * 1.4;
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), rnd() < 0.3 ? radMat : darkMat);
      if (onTop) m.position.set(side * rnd() * 1.2, st[1] - 0.05 + h / 2, z);
      else { m.position.set(side * (st[0] - 0.05), (st[1] + st[2]) * 0.5 + rnd() * 0.6, z); m.rotation.z = side * Math.PI / 2; }
      m.castShadow = true;
      exterior.add(m);
    }
    // dorsal conduit
    const pts = [];
    for (let z = -7; z <= 11; z += 1) pts.push(new THREE.Vector3(0.55, station(z)[1] + 0.06, z));
    exterior.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, 0.07, 6, false), frameMat));
    const tail = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 6), new THREE.MeshBasicMaterial({ color: new THREE.Color(3, 3, 3) }));
    tail.position.set(0, 3.42, 11.5);
    tail.userData.nav = true;
    exterior.add(tail);
  }
  // ---- belly thrusters (VTOL) in pods
  const bellyThrusters = [];
  for (const [x, z] of [[-2.35, -6.4], [2.35, -6.4], [-2.35, 9.2], [2.35, 9.2]]) {
    const pod = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.62, 0.5, 18), darkMat);
    const yb = station(z)[2];
    pod.position.set(x, yb - 0.05, z);
    exterior.add(pod);
    const noz = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.5, 0.35, 18, 1, true), nozzleMat);
    noz.position.set(x, yb - 0.4, z);
    exterior.add(noz);
    bellyThrusters.push(new THREE.Vector3(x, yb - 0.6, z));
  }
  // ---- RCS quads
  const rcs = [];
  for (const [x, y, z] of [[-2.95, 1.6, -9.0], [2.95, 1.6, -9.0], [-2.75, 1.7, 10.2], [2.75, 1.7, 10.2]]) {
    const q = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.35, 0.35), darkMat);
    q.position.set(x, y, z);
    exterior.add(q);
    rcs.push(new THREE.Vector3(x, y, z));
  }
  // ---- radiator wings
  for (const s of [-1, 1]) {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0); shape.lineTo(5.2, 1.6); shape.lineTo(5.2, 4.4); shape.lineTo(0, 7.4); shape.lineTo(0, 0);
    const wing = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth: 0.12, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04, bevelSegments: 1 }), radMat);
    wing.rotation.x = Math.PI / 2;
    wing.rotation.z = s > 0 ? 0 : 0;
    wing.scale.x = s;
    wing.position.set(s * 2.75, 0.55, -1.6);
    wing.castShadow = true; wing.receiveShadow = true;
    exterior.add(wing);
    // radiator fins
    for (let k = 0; k < 6; k++) {
      const fin = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.05, 0.08), darkMat);
      fin.position.set(s * (2.75 + 2.4), 0.62, -1.6 + 1.6 + k * 0.85);
      exterior.add(fin);
    }
    // nav light at the wing tip
    const navCol = s < 0 ? 0xff2a1a : 0x1aff4a;
    const nav = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 6), new THREE.MeshBasicMaterial({ color: new THREE.Color(navCol).multiplyScalar(3) }));
    nav.position.set(s * (2.75 + 5.25), 0.6, 2.8);
    nav.userData.nav = true;
    exterior.add(nav);
  }
  // dorsal sensor mast and antenna dish
  const mast = box(0.18, 1.0, 0.18, darkMat, 0, 3.6, 4.0, exterior);
  const dish = new THREE.Mesh(new THREE.SphereGeometry(0.55, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2.6), radMat);
  dish.position.set(0, 4.15, 4.0);
  dish.rotation.x = -0.6;
  exterior.add(dish);
  // floodlights under the nose
  const flood = new THREE.SpotLight(0xfff0dc, 0, 160, 0.6, 0.5, 2);
  flood.position.set(0, -0.6, -11.5);
  flood.target.position.set(0, -6, -22);
  exterior.add(flood, flood.target);

  // ---- landing gear: strut + shock + foot; animated
  const legs = [];
  const legDefs = [[-3.0, -6.6], [3.0, -6.6], [-3.1, 6.2], [3.1, 6.2]];
  for (const [x, z] of legDefs) {
    const pivot = new THREE.Group();
    const yb = Math.min(station(z)[2], -0.5);
    pivot.position.set(x * 0.88, yb + 0.1, z);
    exterior.add(pivot);
    box(0.34, 0.9, 0.34, darkMat, 0, -0.45, 0, pivot);
    const lowerG = new THREE.Group();
    lowerG.position.set(0, -0.85, 0);
    pivot.add(lowerG);
    box(0.2, 1.0, 0.2, frameMat, 0, -0.25, 0, lowerG);
    const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.62, 0.16, 16), darkMat);
    foot.position.set(0, -0.82, 0);
    foot.castShadow = true;
    lowerG.add(foot);
    legs.push({ pivot, lower: lowerG, foot, attach: new THREE.Vector3(x * 0.88, yb + 0.1, z), side: Math.sign(x) });
  }

  // ---- rear ramp: hinged at the cabin floor's aft edge; closed it forms the
  // sloped underside of the tail, open it is a ~30 degree walkway to the ground
  const rampPivot = new THREE.Group();
  rampPivot.position.set(0, 0, 7.15);
  exterior.add(rampPivot);
  const rampLen = 4.6;
  box(3.25, 0.22, rampLen, shieldMat, 0, -0.11, rampLen / 2, rampPivot);
  box(3.0, 0.03, rampLen - 0.25, floorMat, 0, 0.015, rampLen / 2, rampPivot, { cast: false });
  for (const sx of [-1, 1]) box(0.08, 0.5, rampLen, darkMat, sx * 1.6, 0.2, rampLen / 2, rampPivot); // side rails
  const rampLight = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.03, 0.06), lightMat);
  rampLight.position.set(0, 0.05, rampLen - 0.2);
  rampPivot.add(rampLight);

  // ---- interior: floor, walls, ceiling, bulkheads
  const cabinW = 4.0, cabinH = 2.55;
  const floor = box(cabinW, 0.1, 14.0, floorMat, 0, -0.05, 0.1, interior);
  const ckFloor = box(3.2, 0.1, 4.6, floorMat, 0, 0.2, -9.4, interior);
  box(3.2, 0.3, 0.1, consoleMat, 0, 0.05, -7.12, interior); // step
  // walls (inner faces) with light strips
  for (const s of [-1, 1]) {
    box(0.1, cabinH, 14.0, wallMat, s * (cabinW / 2 + 0.05), cabinH / 2, 0.1, interior);
    const strip = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.05, 12.5), lightMat);
    strip.position.set(s * (cabinW / 2 - 0.02), cabinH - 0.15, 0.1);
    interior.add(strip);
  }
  box(cabinW, 0.1, 14.0, wallMat, 0, cabinH + 0.05, 0.1, interior); // ceiling
  // bulkhead between cabin and cockpit with an opening
  box(0.9, cabinH, 0.12, wallMat, -1.55, cabinH / 2, -6.95, interior);
  box(0.9, cabinH, 0.12, wallMat, 1.55, cabinH / 2, -6.95, interior);
  box(2.2, 0.4, 0.12, wallMat, 0, cabinH - 0.2, -6.95, interior);
  // cockpit side walls (low, under the canopy)
  for (const s of [-1, 1]) box(0.1, 1.15, 4.6, wallMat, s * 1.65, 0.85, -9.4, interior);
  // cabin furnishings
  const crate = (x, z, w, h, d, c) => box(w, h, d, new THREE.MeshStandardMaterial({ color: c, metalness: 0.2, roughness: 0.75 }), x, h / 2, z, interior);
  crate(-1.45, 3.4, 0.9, 0.9, 1.2, 0x6b5a3a);
  crate(-1.45, 4.8, 0.9, 0.6, 1.0, 0x48505a);
  crate(1.5, 4.2, 0.8, 1.1, 0.9, 0x6b5a3a);
  box(0.7, 0.95, 3.2, consoleMat, 1.65, 0.475, -3.2, interior); // galley counter
  box(0.75, 0.5, 2.0, seatMat, -1.62, 0.4, -3.6, interior);   // bench
  box(0.75, 0.6, 0.15, seatMat, -1.9, 0.8, -3.6, interior);
  const panelScreen = makeScreen(512, 256);
  const wallDisplay = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.8), new THREE.MeshBasicMaterial({ map: panelScreen.tex, color: new THREE.Color(0.04, 0.04, 0.04), toneMapped: false }));
  wallDisplay.position.set(-1.94, 1.5, -1.2);
  wallDisplay.rotation.y = Math.PI / 2;
  interior.add(wallDisplay);
  // cockpit: seats + consoles
  const seats = [];
  for (const x of [-0.75, 0.75]) {
    const seat = new THREE.Group();
    seat.position.set(x, 0.25, -9.2);
    interior.add(seat);
    box(0.62, 0.12, 0.6, seatMat, 0, 0.45, 0, seat);
    box(0.62, 0.9, 0.12, seatMat, 0, 0.95, 0.32, seat);
    box(0.12, 0.25, 0.5, consoleMat, -0.36, 0.6, -0.05, seat);
    box(0.12, 0.25, 0.5, consoleMat, 0.36, 0.6, -0.05, seat);
    seats.push(seat);
  }
  const dash = box(3.0, 0.62, 0.7, consoleMat, 0, 0.62, -11.15, interior);
  dash.rotation.x = -0.35;
  const mfdL = makeScreen(512, 512), mfdR = makeScreen(512, 512);
  const mkMfd = (s, x) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.62), new THREE.MeshBasicMaterial({ map: s.tex, color: new THREE.Color(0.05, 0.05, 0.05), toneMapped: false }));
    m.position.set(x, 1.08, -10.58);
    m.rotation.x = -0.62;
    interior.add(m);
    return m;
  };
  mkMfd(mfdL, -0.75);
  mkMfd(mfdR, 0.75);
  // interior lights
  const cabinLight1 = new THREE.PointLight(0xffe8cc, 0.02, 10, 2);
  cabinLight1.position.set(0, 2.3, -2.5);
  const cabinLight2 = new THREE.PointLight(0xffe8cc, 0.02, 10, 2);
  cabinLight2.position.set(0, 2.3, 3.8);
  const cockpitLight = new THREE.PointLight(0x9fd8ff, 0.006, 5, 2);
  cockpitLight.position.set(0, 1.9, -9.5);
  interior.add(cabinLight1, cabinLight2, cockpitLight);

  return {
    root, exterior, interior,
    legs, rampPivot, rampLength: rampLen,
    engines, engineGlow, bellyThrusters, rcs, flood,
    seats, screens: { mfdL, mfdR, wall: panelScreen },
    lights: [cabinLight1, cabinLight2, cockpitLight],
    navLights: exterior.children.filter((c) => c.userData.nav),
  };
}

// Interior collision volumes (ship-local AABBs): solid obstacles
export const SHIP_INTERIOR = {
  // walkable cells the player is confined to (union of boxes)
  cells: [
    { min: [-1.95, 0, -6.95], max: [1.95, 2.5, 7.15] },   // cabin incl. ramp bay
    { min: [-1.55, 0.25, -11.1], max: [1.55, 2.4, -6.3] }, // cockpit (raised floor), overlapping the cabin so the doorway is passable
  ],
  solids: [
    { min: [-1.9, 0, 2.8], max: [-1.0, 0.9, 4.0] },
    { min: [-1.9, 0, 4.3], max: [-1.0, 0.6, 5.3] },
    { min: [1.1, 0, 3.75], max: [1.9, 1.1, 4.65] },
    { min: [1.3, 0, -4.8], max: [1.95, 0.95, -1.6] },
    { min: [-1.95, 0, -4.6], max: [-1.25, 0.65, -2.6] },
    { min: [-1.55, 0.25, -11.6], max: [1.55, 1.15, -10.6] }, // dash
    { min: [-2.0, 0, -7.02], max: [-1.1, 2.6, -6.88] },      // bulkhead (port)
    { min: [1.1, 0, -7.02], max: [2.0, 2.6, -6.88] },        // bulkhead (starboard)
  ],
  seatPos: [new THREE.Vector3(-0.75, 0.25, -9.2), new THREE.Vector3(0.75, 0.25, -9.2)],
  pilotEye: new THREE.Vector3(-0.75, 1.55, -9.25),
  rampHinge: new THREE.Vector3(0, 0, 7.15),
  rampLength: 4.6, rampWidth: 1.5,
  rampClosed: -0.56, rampOpen: 0.52,
};

// Exterior hull approximation for the player bumping into the ship (AABBs)
export const SHIP_HULL_BOXES = [
  { min: [-2.9, -0.75, -7.6], max: [2.9, 3.1, 6.6] },
  { min: [-2.2, -0.4, -11.5], max: [2.2, 2.4, -7.6] },
  { min: [-1.0, 0.3, -13.2], max: [1.0, 1.4, -11.5] },
  // stern around the open ramp bay: side walls and roof only
  { min: [-2.6, 0.2, 6.6], max: [-1.62, 3.35, 13.0] },
  { min: [1.62, 0.2, 6.6], max: [2.6, 3.35, 13.0] },
  { min: [-1.62, 2.6, 6.6], max: [1.62, 3.35, 13.0] },
  { min: [-8.0, 0.4, -1.7], max: [-2.9, 0.75, 6.0] },
  { min: [2.9, 0.4, -1.7], max: [8.0, 0.75, 6.0] },
];

// Points on the hull used for terrain collision (ship-local)
export const HULL_PROBES = [
  [0, 0.6, -13.2], [0, -0.7, -9.6], [-2.8, -0.6, -4], [2.8, -0.6, -4], [-2.8, -0.6, 4], [2.8, -0.6, 4],
  [0, -0.75, 0], [0, 0.4, 12.9], [-2.2, 0.9, 12.5], [2.2, 0.9, 12.5],
  [-8.0, 0.6, 3.0], [8.0, 0.6, 3.0], [0, 3.2, 2], [0, 4.4, 4],
];
