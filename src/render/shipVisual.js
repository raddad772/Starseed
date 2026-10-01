// Ship rendering: places the model, animates gear/ramp, draws thruster
// plumes, re-entry plasma, lights, and the cockpit displays.

import * as THREE from 'three';
import { buildShip, SHIP_INTERIOR } from './shipModel.js';

const PLUME_VERT = /* glsl */`
varying vec3 vLocal;
varying vec3 vN;
varying vec3 vView;
#include <common>
#include <logdepthbuf_pars_vertex>
void main() {
  vLocal = position;
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vN = normalize(mat3(modelMatrix) * normal);
  vView = -wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
  #include <logdepthbuf_vertex>
}
`;
const PLUME_FRAG = /* glsl */`
uniform float uThrottle;
uniform float uTime;
uniform vec3 uColor;
uniform float uLength;
uniform float uVacuum;
varying vec3 vLocal;
varying vec3 vN;
varying vec3 vView;
#include <common>
#include <logdepthbuf_pars_fragment>
void main() {
  #include <logdepthbuf_fragment>
  // cone along -y, apex at y = -1 (unit length, scaled by the mesh)
  float t = clamp(-vLocal.y, 0.0, 1.0);
  float edge = abs(dot(normalize(vN), normalize(vView)));
  float core = pow(edge, mix(2.5, 1.2, uVacuum));
  float flick = 0.85 + 0.15 * sin(uTime * 63.0 + t * 30.0) * sin(uTime * 41.0 + t * 11.0);
  // shock diamonds in atmosphere
  float diamonds = mix(0.75 + 0.25 * pow(abs(sin(t * 18.0 - uTime * 2.0)), 6.0), 1.0, uVacuum);
  float fade = (1.0 - t) * (1.0 - t);
  vec3 c = uColor * core * fade * flick * diamonds * uThrottle;
  c += vec3(1.0, 0.95, 0.9) * pow(edge, 8.0) * pow(1.0 - t, 6.0) * uThrottle * 3.0;
  gl_FragColor = vec4(c * 60.0, 1.0);
}
`;

const PLASMA_FRAG = /* glsl */`
uniform float uHeat;
uniform float uTime;
uniform vec3 uFlow; // flow direction in object space
varying vec3 vLocal;
varying vec3 vN;
varying vec3 vView;
#include <common>
#include <logdepthbuf_pars_fragment>
float h(vec3 p) { return fract(sin(dot(p, vec3(12.9898, 78.233, 37.719))) * 43758.5453); }
void main() {
  #include <logdepthbuf_fragment>
  float facing = max(0.0, dot(normalize(vN), -uFlow));
  float rim = 1.0 - abs(dot(normalize(vN), normalize(vView)));
  float n = 0.75 + 0.25 * sin(uTime * 40.0 + dot(vLocal, vec3(3.1, 1.7, 2.3)));
  vec3 col = mix(vec3(1.0, 0.35, 0.08), vec3(1.0, 0.75, 0.6), facing);
  gl_FragColor = vec4(col * (facing * 2.0 + rim * 0.6) * uHeat * n * 40.0, 1.0);
}
`;

export function plumeMaterial(color, vacuum) {
  return new THREE.ShaderMaterial({
    uniforms: { uThrottle: { value: 0 }, uTime: { value: 0 }, uColor: { value: new THREE.Vector3(...color) }, uLength: { value: 1 }, uVacuum: { value: vacuum } },
    vertexShader: PLUME_VERT, fragmentShader: PLUME_FRAG,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
  });
}

export class ShipVisual {
  constructor(engine, ship) {
    this.engine = engine;
    this.ship = ship;
    const m = buildShip(`${ship.registry || 'SV-27'} ${ship.name.toUpperCase()}`);
    this.model = m;
    engine.scene.add(m.root);
    m.root.traverse((o) => { o.frustumCulled = false; });
    ship.setLegAttach(m.legs);
    // plumes in the transparent pass
    this.fx = new THREE.Group();
    engine.transparentScene.add(this.fx);
    this.plumes = [];
    // unit plume: wide end at the nozzle (y = 0), tip at y = -1
    const cone = new THREE.ConeGeometry(1, 1, 24, 1, true);
    cone.rotateX(Math.PI);      // apex -0.5, base +0.5
    cone.translate(0, -0.5, 0); // apex -1, base 0
    for (const p of m.engines) {
      const mesh = new THREE.Mesh(cone, plumeMaterial([0.45, 0.55, 1.0], 1));
      mesh.position.copy(p);
      mesh.rotation.x = -Math.PI / 2; // -y -> +z (aft)
      mesh.userData.kind = 'main';
      this.fx.add(mesh); this.plumes.push(mesh);
    }
    for (const p of m.bellyThrusters) {
      const mesh = new THREE.Mesh(cone, plumeMaterial([0.5, 0.6, 1.0], 1));
      mesh.position.copy(p);
      mesh.userData.kind = 'belly';
      this.fx.add(mesh); this.plumes.push(mesh);
    }
    // re-entry plasma shell
    const shell = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 16), new THREE.ShaderMaterial({
      uniforms: { uHeat: { value: 0 }, uTime: { value: 0 }, uFlow: { value: new THREE.Vector3(0, 0, -1) } },
      vertexShader: PLUME_VERT, fragmentShader: PLASMA_FRAG,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.FrontSide,
    }));
    shell.scale.set(4.2, 3.4, 15.5);
    shell.position.set(0, 1.2, 0);
    this.fx.add(shell);
    this.plasma = shell;
    this.time = 0;
    this.navBlink = 0;
    this.floodOn = false;
    this.screenTimer = 0;
  }

  update(dt, camWorld, lighting) {
    const s = this.ship;
    const m = this.model;
    this.time += dt;
    const wp = s.getWorldPos(new THREE.Vector3());
    m.root.position.copy(wp).sub(camWorld);
    m.root.quaternion.copy(s.quat);
    this.fx.position.copy(m.root.position);
    this.fx.quaternion.copy(s.quat);
    m.root.visible = this.fx.visible = !s.dead && m.root.position.lengthSq() < 4e10;
    // animations
    s.gear += THREE.MathUtils.clamp(s.gearTarget - s.gear, -dt / 3, dt / 3);
    s.ramp += THREE.MathUtils.clamp(s.rampTarget - s.ramp, -dt / 3.5, dt / 3.5);
    const I = SHIP_INTERIOR;
    m.rampPivot.rotation.x = I.rampClosed + (I.rampOpen - I.rampClosed) * s.ramp;
    for (let i = 0; i < 4; i++) {
      const leg = m.legs[i];
      // retract: swing outward/up into the hull
      leg.pivot.rotation.z = (1 - s.gear) * 1.45 * -leg.side;
      const comp = Math.min(s.legComp[i] || 0, 0.9);
      leg.lower.position.y = -0.85 + comp;
      if (dt > 0) s.legComp[i] = (s.legComp[i] || 0) * 0.8; // decays unless refreshed by contact (once a frame: a second view passes dt 0)
    }
    // plumes
    const L = s.limits;
    const tl = s.thrustLocal;
    const mainT = Math.max(0, -tl.z) / L.main;
    const bellyT = Math.max(0, tl.y) / L.belly;
    const vac = s.env.pressure > 0.01 ? Math.max(0, 1 - s.env.pressure) : 1;
    for (const p of this.plumes) {
      const u = p.material.uniforms;
      u.uTime.value = this.time;
      u.uVacuum.value = vac;
      if (p.userData.kind === 'main') {
        u.uThrottle.value = mainT;
        const len = 4 + 22 * mainT * (0.6 + 0.4 * vac);
        const rad = (0.85 + 0.6 * vac) * (0.6 + 0.4 * mainT);
        p.scale.set(rad, len, rad);
        p.visible = mainT > 0.01;
      } else {
        u.uThrottle.value = bellyT;
        const len = 1.5 + 6 * bellyT;
        p.scale.set(0.42 + 0.3 * vac, len, 0.42 + 0.3 * vac);
        p.visible = bellyT > 0.01;
      }
    }
    // drive throats glow with the main engine (and cool slowly)
    this.throatHeat = (this.throatHeat || 0) + (mainT - (this.throatHeat || 0)) * Math.min(1, dt * (mainT > (this.throatHeat || 0) ? 3 : 0.4));
    for (const gm of m.engineGlow) gm.emissiveIntensity = this.throatHeat * 0.6;
    // plasma
    const pu = this.plasma.material.uniforms;
    pu.uHeat.value = Math.max(0, Math.min(1.5, s.heatGlow - 0.05));
    pu.uTime.value = this.time;
    this.plasma.visible = pu.uHeat.value > 0.01;
    if (this.plasma.visible) {
      const vAir = s.surfaceVel(new THREE.Vector3()).applyQuaternion(s.quat.clone().invert()).normalize();
      pu.uFlow.value.copy(vAir).negate();
    }
    // nav lights blink
    this.navBlink = (this.navBlink + dt) % 1.6;
    for (const n of m.navLights) n.visible = this.navBlink < 0.12;
    m.flood.intensity = this.floodOn ? 3.0 : 0;
  }

  // cockpit multi-function displays
  drawScreens(info) {
    this.screenTimer -= 1;
    if (this.screenTimer > 0) return;
    this.screenTimer = 6;
    const { mfdL, mfdR, wall } = this.model.screens;
    const css = { ink: '#d9f2ff', dim: '#6f8b99', nav: '#e65bd9', ok: '#6ade8f', warn: '#ff5248', cau: '#f1b43a', tgt: '#4fd6e6' };
    const drawBg = (g, w, h) => { g.fillStyle = '#04090d'; g.fillRect(0, 0, w, h); g.strokeStyle = '#1a2a33'; g.lineWidth = 2; g.strokeRect(4, 4, w - 8, h - 8); };
    {
      const g = mfdL.ctx; drawBg(g, 512, 512);
      g.font = 'bold 30px "B612 Mono", monospace'; g.fillStyle = css.dim; g.fillText('FLIGHT', 24, 50);
      g.font = '28px "B612 Mono", monospace';
      const rows = info.left || [];
      rows.forEach((r, i) => { g.fillStyle = r[2] || css.ink; g.fillText(r[0], 24, 110 + i * 46); g.textAlign = 'right'; g.fillText(r[1], 488, 110 + i * 46); g.textAlign = 'left'; });
      mfdL.tex.needsUpdate = true;
    }
    {
      const g = mfdR.ctx; drawBg(g, 512, 512);
      g.font = 'bold 30px "B612 Mono", monospace'; g.fillStyle = css.dim; g.fillText('SYSTEMS', 24, 50);
      g.font = '28px "B612 Mono", monospace';
      const rows = info.right || [];
      rows.forEach((r, i) => { g.fillStyle = r[2] || css.ink; g.fillText(r[0], 24, 110 + i * 46); g.textAlign = 'right'; g.fillText(r[1], 488, 110 + i * 46); g.textAlign = 'left'; });
      mfdR.tex.needsUpdate = true;
    }
    {
      const g = wall.ctx; g.fillStyle = '#04090d'; g.fillRect(0, 0, 512, 256);
      g.font = 'bold 26px "B612 Mono", monospace'; g.fillStyle = css.tgt; g.fillText(info.wallTitle || '', 20, 44);
      g.font = '20px "B612 Mono", monospace'; g.fillStyle = css.ink;
      (info.wall || []).forEach((l, i) => g.fillText(l, 20, 84 + i * 30));
      wall.tex.needsUpdate = true;
    }
  }
}
