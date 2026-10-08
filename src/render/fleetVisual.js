// One GLB per craft. Named nodes + semantic materials are the fleet asset contract.
import * as THREE from 'three';
import { loadShipModel, liveryMaterial, visibleRooms } from './glbShip.js';
import { fixtureLit, interiorMaterial } from './lightRig.js';
import { plumeMaterial } from './shipVisual.js';
import { LandingLights, hasLandingLights } from './landingLights.js';

export class FleetVisual {
  constructor(engine, vessel) {
    this.v = vessel; this.engine = engine;
    const root = new THREE.Group(); engine.scene.add(root);
    this.model = { root, loaded: false }; this.parts = []; this.nodes = [];
    this.hull = liveryMaterial(vessel.livery || vessel.type.livery);
    this.wheelAngle = 0; this.fanAngle = 0; this.time = 0;
    if (hasLandingLights(vessel.type)) this.landing = new LandingLights(vessel, root);
    this.fx = new THREE.Group(); engine.transparentScene.add(this.fx);
    const cone = new THREE.ConeGeometry(1, 1, 16, 1, true); cone.rotateX(Math.PI); cone.translate(0, -.5, 0);
    this.plumes = (vessel.type.engines || []).map((e, i) => {
      const axis = new THREE.Vector3(...(vessel.type.engineAxes?.[i] || [0,0,1]));
      const p = new THREE.Mesh(cone, plumeMaterial([.65, .72, 1], 1));
      p.position.fromArray(e); p.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), axis); p.visible = false; this.fx.add(p);
      return { p, axis, baseAxis: axis.clone(), origin: p.position.clone(), pivot: vessel.type.enginePivots?.[i] && new THREE.Vector3(...vessel.type.enginePivots[i]), radius: e[3] };
    });
    this.ready = loadShipModel(vessel.type.model).then(gltf => {
      let source=gltf.scene;
      if(vessel.type.assetRoot){gltf.scene.traverse(n=>{if((n.userData.name||n.name)===vessel.type.assetRoot)source=n;});if(source===gltf.scene)throw new Error('Missing asset root '+vessel.type.assetRoot);}
      const m=source.clone(true),cache=new Map(),byName=new Map();
      if(vessel.type.assetRoot){m.position.set(0,0,0);m.quaternion.identity();}

      m.traverse(o => {
        byName.set(o.userData.name || o.name, o);
        if (o.userData.asset_id) this.nodes.push(o);
        if (!o.isMesh) return;
        let parent = o, interior = false;
        while (parent) { if (parent.userData.interior) { interior = true; break; } parent = parent.parent; }
        const material = original => {
          const semantic = original.userData.semantic || original.name.replace(/^(Pioneer|Expedition)_/, '');
          if (semantic === 'Hull') return this.hull;
          const key = `${original.uuid}:${interior}`;
          if (!cache.has(key)) {
            const params = { color: original.color, metalness: original.metalness, roughness: original.roughness,
              emissive: original.emissive, emissiveIntensity: original.emissiveIntensity, vertexColors: false };
            const mat = interior ? interiorMaterial(params) : fixtureLit(new THREE.MeshStandardMaterial(params));
            if (semantic === 'Glass') { mat.transparent = true; mat.opacity = .24; mat.depthWrite = false; mat.side = THREE.DoubleSide; }
            mat.name = original.name; cache.set(key, mat);
          }
          return cache.get(key);
        };
        o.material = Array.isArray(o.material) ? o.material.map(material) : material(o.material);
        o.castShadow = o.receiveShadow = true;
      });
      for (const spec of vessel.type.parts || []) {
        const node = byName.get(spec.node);
        if (!node) throw new Error(`Missing animated node ${spec.node}`);
        this.parts.push({ spec, node, p0: node.position.clone(), q0: node.quaternion.clone() });
      }
      root.add(m); this.model.loaded = true;
      return this;
    }).catch(error => { this.model.error = error.message; console.error('Fleet asset failed:', vessel.type.model, error); return this; });
  }
  update(dt, camWorld) {
    const v = this.v, root = this.model.root;
    root.position.copy(v.getWorldPos(new THREE.Vector3())).sub(camWorld); root.quaternion.copy(v.quat);
    root.visible = this.fx.visible = !v.dead && root.position.length() < v.type.radius * 1400;
    this.fx.position.copy(root.position); this.fx.quaternion.copy(root.quaternion);
    this.landing?.update(dt);
    if (!root.visible) return;
    if (v.type.gearFixed) v.gear = v.gearTarget = 1;
    else v.gear += THREE.MathUtils.clamp(v.gearTarget - v.gear, -dt / 3, dt / 3);
    let speed = 0;
    if (v.type.ground) {
      const vel = v.parent ? v.lvel.clone().applyQuaternion(v.lquat.clone().invert()) : v.surfaceVel(new THREE.Vector3()).applyQuaternion(v.quat.clone().invert());
      speed = -vel.z;
    }
    this.wheelAngle = (this.wheelAngle + speed * dt) % (Math.PI * 100);
    this.fanAngle = (this.fanAngle + dt * 65 * Math.min(1, v.thrustLocal.length() / Math.max(1, v.limits.belly))) % (Math.PI * 2);
    for (const { spec, node, p0, q0 } of this.parts) {
      if (spec.channel === 'turnover') { const state=v.turnovers?.find(s=>s.pad===spec.pad);if(state)node.quaternion.setFromAxisAngle(new THREE.Vector3(0,0,-1),state.angle).multiply(q0); }
      else if (spec.channel === 'turnoverDoor') { const state=v.turnovers?.find(s=>s.pad===spec.pad);if(state)node.position.copy(p0).addScaledVector(new THREE.Vector3(...spec.slide),state.side===spec.side?state.door:0); }
      else if (spec.channel === 'turboliftCar') { node.position.copy(v.turbolift.cars[0].pos); }
      else if (spec.channel === 'turboliftLanding') { node.position.copy(p0).addScaledVector(new THREE.Vector3(...spec.slide), v.turbolift.landing[spec.station] || 0); }
      else if (spec.channel === 'turboliftCarDoor') {
        const car = v.turbolift.cars[0], st = v.turbolift.stationOf(car);
        const open = st && (st.axis || 'z') === spec.axisName && st.end === spec.end ? car.doors : 0;
        node.position.copy(p0).addScaledVector(new THREE.Vector3(...spec.slide), open);
      }
      else if(spec.scaleAxis!==undefined)node.scale.setComponent(spec.scaleAxis,spec.scaleFrom+(spec.scaleTo-spec.scaleFrom)*(v.doors[spec.door]?.open||0));
      else if (spec.slide) node.position.copy(p0).addScaledVector(new THREE.Vector3(...spec.slide), spec.door ? v.doors[spec.door].open : spec.channel==='homeHatch' ? (v.attached&&v.home?.host===v.parent?1:0) : v.gear - 1);
      else if (spec.axis && (spec.door || spec.channel === 'podTilt' || spec.channel === 'fan')) {
        const angle = spec.door ? v.doors[spec.door].open * spec.angle : spec.channel === 'podTilt' ? (v.podTilt || 0) : this.fanAngle * (spec.direction || 1);
        node.quaternion.setFromAxisAngle(new THREE.Vector3(...spec.axis), angle).multiply(q0);
      }
      else if (spec.channel === 'wheel') {
        node.quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), spec.steer ? -v.drive.steer * .48 : 0);
        node.quaternion.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(...spec.axis), -this.wheelAngle / spec.radius)).multiply(q0);
      }
    }
    const p = v.game.player, aboard = p?.aboard && p.vessel === v;
    const room = aboard ? v.interior.roomAt(p.mode === 'seat' ? new THREE.Vector3(...v.type.seats[p.seat || 0].pos) : p.sPos, 1) : null;
    const near = room ? visibleRooms(v.interior, v.interior.rooms.indexOf(room)) : null;
    for (const node of this.nodes) {
      const u = node.userData;
      node.visible = (!u.lod || aboard || root.position.length() < Math.max(65, v.type.radius * 7)) && (!u.room_id || !near || near.has(u.room_id));
      if (!aboard && u.interior && root.position.length() > v.type.radius * 6) node.visible = false;
    }
    this.time += dt;
    for (const {p, axis, baseAxis, origin, pivot, radius} of this.plumes) {
      if (pivot) {
        const rotation = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,0), v.podTilt || 0);
        axis.copy(baseAxis).applyQuaternion(rotation);
        p.position.copy(origin).sub(pivot).applyQuaternion(rotation).add(pivot);
        p.quaternion.setFromUnitVectors(new THREE.Vector3(0,-1,0), axis);
      }
      const force = Math.max(0, -v.thrustLocal.dot(axis));
      const limit = axis.y < -.5 ? v.limits.belly : v.limits.main;
      const throttle = Math.min(1, force / Math.max(1, limit));
      p.visible = throttle > .01; p.material.uniforms.uTime.value = this.time; p.material.uniforms.uThrottle.value = throttle;
      p.scale.set(radius * .9, radius * (2 + throttle * 7), radius * .9);
    }
  }
}
