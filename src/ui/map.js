// System map: an orrery of the live simulation. Orbits, the habitable zone
// (conservative and optimistic), the formation-era snow line, belts, the
// ship's current conic, and clickable bodies. Floating origin at the focus.

import * as THREE from 'three';
import { orbitPointAtTrueAnomaly } from '../core/kepler.js';
import * as U from '../core/units.js';
import { planetSwatch } from './briefing.js';

const _v = new THREE.Vector3();

function srgbColor(css) { const c = new THREE.Color(css); return c; }

export class MapView {
  constructor(game) {
    this.game = game;
    this.open = false;
    this.owner = null; // the player looking at it (it takes their view)
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(50, 1, 1, 1e14);
    this.focus = null;
    this.yaw = 0.6; this.pitch = 0.75;
    this.dist = 1e10;
    this.labelsEl = document.getElementById('mapLabels');
    this.items = [];
    this.dragging = false;
    this.build();
    const canvas = game.canvas;
    canvas.addEventListener('mousedown', (e) => { if (this.open && e.button === 0) { this.dragging = true; this.lx = e.clientX; this.ly = e.clientY; } });
    window.addEventListener('mouseup', () => { this.dragging = false; });
    window.addEventListener('mousemove', (e) => {
      if (!this.open || !this.dragging) return;
      this.yaw -= (e.clientX - this.lx) * 0.006;
      this.pitch = THREE.MathUtils.clamp(this.pitch + (e.clientY - this.ly) * 0.006, -1.5, 1.5);
      this.lx = e.clientX; this.ly = e.clientY;
    });
    canvas.addEventListener('wheel', (e) => { if (this.open) this.dist *= Math.pow(1.18, Math.sign(e.deltaY)); }, { passive: true });
    this.resize();
  }

  build() {
    const g = this.game, sys = g.system;
    const u = g.universe;
    const lineMat = (c, o = 0.6) => new THREE.LineBasicMaterial({ color: c, transparent: true, opacity: o, depthWrite: false });
    this.root = new THREE.Group();
    this.scene.add(this.root);
    // star
    const sc = sys.star.color;
    const starMesh = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 16), new THREE.MeshBasicMaterial({ color: new THREE.Color(Math.min(1, sc[0]), Math.min(1, sc[1]), Math.min(1, sc[2])) }));
    this.root.add(starMesh);
    this.items.push({ body: u.star, mesh: starMesh, minPx: 9 });
    // habitable zone rings (in the system's reference plane)
    const ring = (r0, r1, color, opacity) => {
      const m = new THREE.Mesh(new THREE.RingGeometry(r0, r1, 256, 1), new THREE.MeshBasicMaterial({ color, transparent: true, opacity, side: THREE.DoubleSide, depthWrite: false }));
      m.rotation.x = -Math.PI / 2;
      this.root.add(m);
      return m;
    };
    const AU = U.GAME_AU;
    this.hzOpt = ring(sys.hz.optimisticInner * AU, sys.hz.optimisticOuter * AU, 0x6ade8f, 0.06);
    this.hz = ring(sys.hz.inner * AU, sys.hz.outer * AU, 0x6ade8f, 0.14);
    // snow line
    const snowPts = [];
    for (let i = 0; i <= 256; i++) { const a = i / 256 * Math.PI * 2; snowPts.push(new THREE.Vector3(Math.cos(a) * sys.disk.snowLine * AU, 0, Math.sin(a) * sys.disk.snowLine * AU)); }
    const snow = new THREE.Line(new THREE.BufferGeometry().setFromPoints(snowPts), new THREE.LineDashedMaterial({ color: 0x4fd6e6, dashSize: sys.disk.snowLine * AU * 0.02, gapSize: sys.disk.snowLine * AU * 0.02, transparent: true, opacity: 0.5 }));
    snow.computeLineDistances();
    this.root.add(snow);
    for (const belt of sys.belts) ring(belt.inner, belt.outer, 0xb0a080, 0.07);
    // bodies and orbits
    for (const b of u.bodies) {
      if (b.isStar) continue;
      const pts = [];
      const o = b.data.orbit;
      for (let i = 0; i <= 256; i++) pts.push(orbitPointAtTrueAnomaly(o, i / 256 * Math.PI * 2, [0, 0, 0]));
      const geo = new THREE.BufferGeometry().setFromPoints(pts.map((p) => new THREE.Vector3(p[0], p[1], p[2])));
      const line = new THREE.Line(geo, lineMat(b.data.kind === 'moon' ? 0x7d8f99 : 0xb8c6cf, b.data.kind === 'moon' ? 0.35 : 0.55));
      this.root.add(line);
      const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 12), new THREE.MeshBasicMaterial({ color: new THREE.Color(planetSwatch(b.data)) }));
      this.root.add(mesh);
      const item = { body: b, mesh, line, minPx: b.data.kind === 'moon' ? 3.5 : 6 };
      if (b.data.rings) {
        const rg = new THREE.Mesh(new THREE.RingGeometry(b.data.rings.inner, b.data.rings.outer, 96, 1), new THREE.MeshBasicMaterial({ color: 0xd8cfb8, transparent: true, opacity: 0.4, side: THREE.DoubleSide, depthWrite: false }));
        rg.rotation.x = -Math.PI / 2;
        const holder = new THREE.Group(); holder.add(rg); holder.quaternion.copy(b.qTilt);
        this.root.add(holder);
        item.rings = holder;
      }
      this.items.push(item);
      const el = document.createElement('div');
      el.className = 'ml' + (b.data.kind === 'moon' ? ' moon' : '');
      el.textContent = b.data.name;
      el.addEventListener('click', () => this.select(b));
      this.labelsEl.appendChild(el);
      item.label = el;
    }
    // ship marker + trajectory
    this.shipMarker = new THREE.Mesh(new THREE.OctahedronGeometry(1), new THREE.MeshBasicMaterial({ color: 0xe65bd9 }));
    this.root.add(this.shipMarker);
    this.trajGeo = new THREE.BufferGeometry();
    this.trajGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(513 * 3), 3));
    this.traj = new THREE.Line(this.trajGeo, lineMat(0xe65bd9, 0.9));
    this.traj.frustumCulled = false;
    this.root.add(this.traj);
    this.shipLabel = document.createElement('div');
    this.shipLabel.className = 'ml target';
    this.shipLabel.textContent = 'YOU';
    this.labelsEl.appendChild(this.shipLabel);
    this.legend = document.createElement('div');
    this.legend.className = 'ml';
    this.legend.style.cssText = 'left:16px; bottom:72px; top:auto; transform:none; color: var(--ink-dim); pointer-events:none';
    this.labelsEl.appendChild(this.legend);
    // the map renders straight to the canvas without colour conversion, so
    // store display (sRGB) values in the materials
    this.scene.traverse((o) => { if (o.material && o.material.color) o.material.color.convertLinearToSRGB(); });
  }

  resize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
  }

  // focus the view on a body and make it the target
  select(b) {
    const g = this.game;
    this.focus = b; (this.owner || g.player).target = b;
    this.dist = Math.max(b.R * 12, (b.data.kind === 'moon' ? b.data.orbit.a : b.soi) * 1.5);
    g.requestSurvey(b, 80);
  }

  // controller: right stick turns the view, RT / LT zoom in / out, the D-pad
  // (or LB / RB) steps through the bodies, B or View closes. On the pause
  // screen (embedded) only left / right step: the rest works its tabs
  padUpdate(ps, dt, embedded = false) {
    this.yaw -= ps.rx * 2.2 * dt;
    this.pitch = THREE.MathUtils.clamp(this.pitch + ps.ry * 1.6 * dt, -1.5, 1.5);
    this.dist *= Math.pow(6, (ps.lt - ps.rt) * dt);
    const step = embedded ? (ps.hits.has('RIGHT') ? 1 : (ps.hits.has('LEFT') ? -1 : 0))
      : (ps.hits.has('RIGHT') || ps.hits.has('DOWN') || ps.hits.has('RB')) ? 1 : ((ps.hits.has('LEFT') || ps.hits.has('UP') || ps.hits.has('LB')) ? -1 : 0);
    if (step) {
      const list = this.items.filter((it) => !it.body.isStar).map((it) => it.body);
      const i = list.indexOf(this.focus);
      this.select(list[(i + step + list.length) % list.length]);
    }
    if (!embedded && (ps.hits.has('B') || ps.hits.has('VIEW'))) this.toggle();
  }

  // the pause screen's map: the whole screen, for player p (focused where they are)
  openFull(p) {
    if (this.open && this.full) return;
    if (this.open) this.close();
    this.open = true; this.full = true; this.owner = p;
    this.labelsEl.hidden = false;
    const inp = p.input || this.game.input;
    this.legend.innerHTML = (inp.usingPad ? 'Right stick: rotate · RT / LT: zoom · D-pad ◂ ▸: next world'
      : 'Drag to rotate · wheel to zoom · click a world to focus it')
      + ' · <span style="color:var(--engaged)">green: habitable zone</span> · <span style="color:var(--target)">dashed: snow line</span> · <span style="color:var(--nav)">magenta: your trajectory</span>';
    const cur = p.currentBody();
    this.focus = cur;
    this.dist = Math.max(cur.R * 14, cur.soi && isFinite(cur.soi) ? cur.soi * 0.6 : cur.R * 40);
  }

  close() {
    this.open = false; this.full = false; this.owner = null;
    this.labelsEl.hidden = true;
  }

  // open or close it for player p (open for another player: it moves to p's view)
  toggle(p = this.game.player) {
    const g = this.game;
    const handOver = this.open && this.owner && this.owner !== p;
    if (!handOver) this.open = !this.open;
    if (handOver && this.owner.input) this.owner.input.requestLock();
    this.owner = this.open ? p : null;
    this.full = false;
    this.labelsEl.hidden = !this.open;
    const inp = p.input || g.input;
    this.legend.innerHTML = (inp.usingPad
      ? 'Right stick: rotate · RT / LT: zoom · D-pad: next body (targets it) · B: close'
      : 'Drag to rotate · wheel to zoom · click a body to focus and target')
      + ' · <span style="color:var(--engaged)">green: habitable zone</span> · <span style="color:var(--target)">dashed: snow line</span> · <span style="color:var(--nav)">magenta: your trajectory</span>';
    if (this.open) {
      inp.releaseLock();
      const cur = p.currentBody();
      if (!this.focus || handOver) { this.focus = cur; this.dist = Math.max(cur.R * 14, cur.soi && isFinite(cur.soi) ? cur.soi * 0.6 : cur.R * 40); }
    } else inp.requestLock();
  }

  // into its owner's view: rect {x, y, w, h} in CSS px (default: the whole canvas)
  render(dt, rect = null) {
    const g = this.game;
    const r = g.engine.renderer;
    const focusPos = this.focus ? this.focus.pos : g.universe.star.pos;
    const cam = this.camera;
    const rc = rect || { x: 0, y: 0, w: window.innerWidth, h: window.innerHeight };
    if (Math.abs(cam.aspect - rc.w / rc.h) > 1e-4) cam.aspect = rc.w / rc.h;
    cam.position.set(Math.cos(this.pitch) * Math.sin(this.yaw), Math.sin(this.pitch), Math.cos(this.pitch) * Math.cos(this.yaw)).multiplyScalar(this.dist);
    cam.near = this.dist * 1e-4; cam.far = this.dist * 1e5;
    cam.updateProjectionMatrix();
    cam.lookAt(0, 0, 0);
    cam.updateMatrixWorld();
    const pxPerRad = rc.h / THREE.MathUtils.degToRad(cam.fov);
    // floating origin: everything relative to the focus
    this.root.position.copy(focusPos).negate();
    const w = rc.w, h = rc.h;
    const place = (worldPos, el, show = true) => {
      _v.copy(worldPos).sub(focusPos).project(cam);
      const vis = show && _v.z < 1 && _v.z > -1 && Math.abs(_v.x) < 1.05 && Math.abs(_v.y) < 1.05;
      el.style.display = vis ? '' : 'none';
      if (vis) { el.style.left = (rc.x + (_v.x + 1) / 2 * w) + 'px'; el.style.top = (rc.y + (1 - _v.y) / 2 * h) + 'px'; }
    };
    this.legend.style.left = (rc.x + 16) + 'px';
    this.legend.style.bottom = (window.innerHeight - rc.y - rc.h + 72) + 'px';
    for (const it of this.items) {
      const b = it.body;
      it.mesh.position.copy(b.pos);
      const d = cam.position.distanceTo(_v.copy(b.pos).sub(focusPos));
      const minR = it.minPx / pxPerRad * d;
      it.mesh.scale.setScalar(Math.max(b.R, minR));
      if (it.line) {
        it.line.position.copy(b.parent.pos);
        // hide moon orbits when zoomed far out
        const orbitPx = b.data.orbit.a / d * pxPerRad;
        it.line.visible = orbitPx > 12;
        it.mesh.visible = b.data.kind !== 'moon' || orbitPx > 8;
      }
      if (it.rings) { it.rings.position.copy(b.pos); it.rings.visible = (b.data.rings.outer / d * pxPerRad) > 4; }
      if (it.label) {
        const show = it.mesh.visible && (b.data.kind !== 'moon' || (b.data.orbit.a / d * pxPerRad) > 30);
        place(b.pos, it.label, show);
        it.label.classList.toggle('target', g.target === b);
      }
    }
    // other ships
    this.vesselMarks = this.vesselMarks || new Map();
    for (const v of g.vessels) {
      if (v === g.focus.root) continue;
      let vm = this.vesselMarks.get(v);
      if (!vm) {
        const mesh = new THREE.Mesh(new THREE.OctahedronGeometry(1), new THREE.MeshBasicMaterial({ color: 0x4fd6e6 }));
        this.root.add(mesh);
        const el = document.createElement('div');
        el.className = 'ml';
        el.textContent = v.name;
        this.labelsEl.appendChild(el);
        vm = { mesh, el };
        this.vesselMarks.set(v, vm);
      }
      const vp = v.getWorldPos(new THREE.Vector3());
      const shown = !v.dead && g.listed(v);
      vm.mesh.visible = shown;
      vm.mesh.position.copy(vp);
      vm.mesh.scale.setScalar(3 / pxPerRad * cam.position.distanceTo(_v.copy(vp).sub(focusPos)));
      place(vp, vm.el, shown);
    }
    // ship and its conic
    const s = g.focus.root;
    const sp = s.getWorldPos(new THREE.Vector3());
    this.shipMarker.position.copy(sp);
    const ds = cam.position.distanceTo(_v.copy(sp).sub(focusPos));
    this.shipMarker.scale.setScalar(5 / pxPerRad * ds);
    place(sp, this.shipLabel);
    this.updateTrajectory();
    if (r.isNativeWebGPU) {
      g.engine.webgpu?.map.render(g.engine,this.scene,cam,rc);
      return;
    }
    const prevAuto = r.autoClear;
    r.setRenderTarget(null);
    const gy = window.innerHeight - rc.y - rc.h; // (GL: from the bottom)
    r.setViewport(rc.x, gy, rc.w, rc.h);
    r.setScissor(rc.x, gy, rc.w, rc.h);
    r.setScissorTest(true);
    r.setClearColor(0x03070b, 1);
    r.clear(true, true, false);
    r.render(this.scene, cam);
    r.setScissorTest(false);
    r.autoClear = prevAuto;
  }

  updateTrajectory() {
    const g = this.game, s = g.focus.root;
    const pos = this.trajGeo.attributes.position;
    const arr = pos.array;
    if (s.landed || g.ftl.state === 'cruise') { this.traj.visible = false; return; }
    this.traj.visible = true;
    const o = s.orbit();
    const b = s.body;
    const h = new THREE.Vector3(...o.h).normalize();
    const P = o.e > 1e-6 ? new THREE.Vector3(...o.evec).normalize() : s.pos.clone().normalize();
    const Q = h.clone().cross(P).normalize();
    const p = o.p;
    let nuMin = -Math.PI, nuMax = Math.PI;
    if (o.e >= 1) {
      const nuInf = Math.acos(-1 / o.e) * 0.995;
      nuMin = -nuInf; nuMax = nuInf;
      // limit to the sphere of influence
      if (isFinite(b.soi)) {
        const c = (p / b.soi - 1) / o.e;
        if (c > -1 && c < 1) { const nuS = Math.acos(c); nuMin = -nuS; nuMax = nuS; }
      }
    }
    for (let i = 0; i <= 512; i++) {
      const nu = nuMin + (nuMax - nuMin) * i / 512;
      const rr = p / (1 + o.e * Math.cos(nu));
      const x = rr * Math.cos(nu), y = rr * Math.sin(nu);
      arr[i * 3] = P.x * x + Q.x * y; arr[i * 3 + 1] = P.y * x + Q.y * y; arr[i * 3 + 2] = P.z * x + Q.z * y;
    }
    pos.needsUpdate = true;
    this.traj.position.copy(b.pos);
  }
}
