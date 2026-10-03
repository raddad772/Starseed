// Scene lights shared by every vessel: the sun (with a shadow volume that
// follows the camera and reaches far sunward, so a carrier's hull shadows its
// own hangar), sky fill, and the light fixtures of the big ships.
//
// Fixtures are not three.js lights. Every vessel material evaluates up to
// MAX_FIX of them in one loop over uniform arrays, so all the lamps of a
// hangar light it end to end at once, wherever you stand. Each fixture is
// confined to the room it hangs in (a box in the host ship's frame), so a
// hangar lamp never shines through a bulkhead into the corridor beyond. A
// share of each fixture's light comes back as bounce (ambient) light, so the
// sides of things facing away from every lamp are dim rather than black.
// Interior surfaces of big ships ignore the sun and sky (interiorMaterial).

import * as THREE from 'three';

const MAX_FIX = 24;
const BOX_PAD = 2.5;   // m: room boxes grow to take in their walls, floor and ceiling
const BOUNCE_ROOM = 0.22, BOUNCE_OPEN = 0.04;
const FAR = 1e9;

const _v = new THREE.Vector3(), _w = new THREE.Vector3(), _l = new THREE.Vector3();
const _q = new THREE.Quaternion(), _qi = new THREE.Quaternion();
const _m1 = new THREE.Matrix4(), _m2 = new THREE.Matrix4();
const _one = new THREE.Vector3(1, 1, 1), _zero = new THREE.Vector3();

export const FIX_UNIFORMS = {
  uFixCount: { value: 0 },
  uFixPos: { value: Array.from({ length: MAX_FIX }, () => new THREE.Vector3()) },  // view space
  uFixCol: { value: Array.from({ length: MAX_FIX }, () => new THREE.Vector3()) },  // colour x intensity (cd)
  uFixRA: { value: Array.from({ length: MAX_FIX }, () => new THREE.Vector2()) },   // range, bounce share
  uFixMin: { value: Array.from({ length: MAX_FIX }, () => new THREE.Vector3()) },  // room box, host frame
  uFixMax: { value: Array.from({ length: MAX_FIX }, () => new THREE.Vector3()) },
  uFixToLocal: { value: new THREE.Matrix4() },                                     // view -> host frame
};

const FIX_PARS = /* glsl */`
#define MAX_FIX ${MAX_FIX}
uniform int uFixCount;
uniform vec3 uFixPos[ MAX_FIX ];
uniform vec3 uFixCol[ MAX_FIX ];
uniform vec2 uFixRA[ MAX_FIX ];
uniform vec3 uFixMin[ MAX_FIX ];
uniform vec3 uFixMax[ MAX_FIX ];
uniform mat4 uFixToLocal;
`;

const FIX_LOOP = /* glsl */`
#if defined( RE_Direct )
{
  vec3 fixLocal = ( uFixToLocal * vec4( geometryPosition, 1.0 ) ).xyz;
  vec3 fixAmb = vec3( 0.0 );
  for ( int fi = 0; fi < MAX_FIX; fi ++ ) {
    if ( fi >= uFixCount ) break;
    if ( any( lessThan( fixLocal, uFixMin[ fi ] ) ) || any( greaterThan( fixLocal, uFixMax[ fi ] ) ) ) continue;
    vec3 fixV = uFixPos[ fi ] - geometryPosition;
    float fixD = length( fixV );
    if ( fixD >= uFixRA[ fi ].x ) continue;
    vec3 fixE = uFixCol[ fi ] * getDistanceAttenuation( fixD, uFixRA[ fi ].x, 2.0 );
    fixAmb += fixE * uFixRA[ fi ].y;
    directLight.direction = fixV / max( fixD, 1e-4 );
    directLight.color = fixE;
    directLight.visible = true;
    RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
  }
  #if defined( RE_IndirectDiffuse )
  irradiance += fixAmb;
  #endif
}
#endif
`;

// Teach a lit material about fixtures (idempotent; keeps any earlier patch)
export function fixtureLit(m) {
  if (!m || !m.isMeshStandardMaterial || m.userData.fixtureLit) return m;
  m.userData.fixtureLit = true;
  const prev = m.onBeforeCompile;
  const hadKey = m.customProgramCacheKey !== THREE.Material.prototype.customProgramCacheKey;
  const prevKey = hadKey ? m.customProgramCacheKey() : '';
  m.onBeforeCompile = (sh, r) => {
    prev.call(m, sh, r);
    Object.assign(sh.uniforms, FIX_UNIFORMS);
    let fs = sh.fragmentShader.replace('#include <lights_fragment_begin>', THREE.ShaderChunk.lights_fragment_begin);
    fs = fs.replace('#include <lights_pars_begin>', '#include <lights_pars_begin>\n' + FIX_PARS);
    fs = fs.replace('#if defined( RE_IndirectSpecular )', FIX_LOOP + '\n#if defined( RE_IndirectSpecular )');
    sh.fragmentShader = fs;
  };
  m.customProgramCacheKey = () => prevKey + '|fix';
  m.needsUpdate = true;
  return m;
}

// Standard material for spaces inside a hull: lit by its own fixtures and
// emissive panels, never by the sun or the sky dome.
export function interiorMaterial(params) {
  const m = new THREE.MeshStandardMaterial(params);
  m.onBeforeCompile = (sh) => {
    const chunk = THREE.ShaderChunk.lights_fragment_begin
      .replace('#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )', '#if 0')
      .replace('#if ( NUM_HEMI_LIGHTS > 0 )', '#if 0');
    sh.fragmentShader = sh.fragmentShader.replace('#include <lights_fragment_begin>', chunk);
  };
  m.customProgramCacheKey = () => 'interior';
  return fixtureLit(m);
}

// the room box a fixture lights (host frame), or null for an open-air lamp
function fixtureBox(type, f) {
  for (const r of type.rooms || []) {
    const p = f.pos;
    if (p[0] < r.min[0] || p[0] > r.max[0] || p[2] < r.min[2] || p[2] > r.max[2]) continue;
    if (p[1] < r.min[1] || p[1] > r.max[1] + BOX_PAD) continue;
    return {
      min: new THREE.Vector3(r.min[0] - BOX_PAD, r.min[1] - BOX_PAD, r.min[2] - BOX_PAD),
      max: new THREE.Vector3(r.max[0] + BOX_PAD, r.max[1] + BOX_PAD, r.max[2] + BOX_PAD),
      room: r,
    };
  }
  return null;
}

export class LightRig {
  constructor(engine) {
    this.engine = engine;
    this.sun = new THREE.DirectionalLight(0xffffff, 1);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(2048, 2048);
    const sc = this.sun.shadow.camera;
    sc.left = -36; sc.right = 36; sc.top = 36; sc.bottom = -36; sc.near = 1; sc.far = 3200;
    this.sun.shadow.bias = -0.0004;
    this.sun.shadow.normalBias = 0.04;
    engine.scene.add(this.sun, this.sun.target);
    this.hemi = new THREE.HemisphereLight(0x8899aa, 0x332211, 0.1);
    engine.scene.add(this.hemi);
    this._cand = [];
    this.host = null;     // big ship whose frame the room boxes are in
    this.inside = false;  // camera inside one of its enclosed rooms
    this.camE = 0;        // fixture illuminance at the camera, for exposure metering
  }

  // patch every lit material of a vessel model; `skip` names subtrees sealed
  // from the fixtures (a shuttle's cabin inside a lit hangar)
  adopt(root, skip) {
    const walk = (o) => {
      if (skip && skip(o)) return;
      if (o.material) for (const m of Array.isArray(o.material) ? o.material : [o.material]) fixtureLit(m);
      for (const c of o.children) walk(c);
    };
    walk(root);
  }

  // extra: lights that aren't a ship's fixtures (a field lamp put down, a
  // turbolift car's): [{ w: world position, color, intensity, range, host?, box? }]
  update(camWorld, camQuat, lighting, vessels, extra = []) {
    // sun: shadow box centred on the camera, light placed far up-sun
    this.sun.color.copy(lighting.sunColor);
    this.sun.intensity = lighting.sunIntensity;
    this.sun.position.copy(lighting.sunDir).multiplyScalar(1600);
    this.sun.target.position.set(0, 0, 0);
    this.sun.target.updateMatrixWorld();
    this.hemi.color.copy(lighting.skyColor);
    this.hemi.groundColor.copy(lighting.groundColor);
    this.hemi.intensity = lighting.skyIntensity;
    this.hemi.position.copy(lighting.up);

    // the host: the big ship the camera is in, or nearest to
    let host = null, hd = Infinity;
    for (const v of vessels) {
      if (v.dead || !v.big || !v.type.lights) continue;
      const d = v.getWorldPos(_v).distanceTo(camWorld) - v.type.radius;
      if (d < 400 && d < hd) { hd = d; host = v; }
    }
    this.host = host;
    const U = FIX_UNIFORMS;
    // view space -> host frame
    _qi.copy(camQuat).invert();
    if (host) {
      host.getWorldPos(_v).sub(camWorld);
      _m1.compose(_v, host.quat, _one).invert();
      _m2.compose(_zero, camQuat, _one);
      U.uFixToLocal.value.multiplyMatrices(_m1, _m2);
    } else U.uFixToLocal.value.identity();
    const camLocal = host ? host.worldToLocal(camWorld, _l) : null;
    const room = host && host.interior && host.interior.roomAt ? host.interior.roomAt(camLocal, 1.0) : null;
    this.inside = !!(room && !room.vacuum);

    // fixtures of big ships in reach, nearest first
    const cand = this._cand;
    cand.length = 0;
    for (const v of vessels) {
      if (v.dead || !v.type.lights) continue;
      if (v.getWorldPos(_v).distanceTo(camWorld) > v.type.radius + 400) continue;
      const info = v.type._fix || (v.type._fix = v.type.lights.map((f) => {
        const col = new THREE.Color(f.color);
        return { box: fixtureBox(v.type, f), col, lum: 0.2126 * col.r + 0.7152 * col.g + 0.0722 * col.b };
      }));
      v.type.lights.forEach((f, i) => {
        const w = v.localToWorld(_w.set(f.pos[0], f.pos[1], f.pos[2]), new THREE.Vector3());
        cand.push({ w, d: w.distanceTo(camWorld), f, box: v === host ? info[i].box : null, col: info[i].col, lum: info[i].lum });
      });
    }
    for (const e of extra) {
      const col = new THREE.Color(e.color);
      // (a lamp in the host's frame may be confined to a box there: a turbolift car's)
      cand.push({ w: e.w, d: e.w.distanceTo(camWorld), f: { intensity: e.intensity, range: e.range }, box: e.box && e.host === host ? e.box : null, col, lum: 0.2126 * col.r + 0.7152 * col.g + 0.0722 * col.b });
    }
    cand.sort((a, b) => a.d - b.d);
    const n = Math.min(MAX_FIX, cand.length);
    let camE = 0;
    for (let i = 0; i < n; i++) {
      const c = cand[i], f = c.f;
      U.uFixPos.value[i].copy(c.w).sub(camWorld).applyQuaternion(_qi);
      const k = f.intensity;
      U.uFixCol.value[i].set(c.col.r * k, c.col.g * k, c.col.b * k);
      const bounce = c.box ? BOUNCE_ROOM : BOUNCE_OPEN;
      U.uFixRA.value[i].set(f.range, bounce);
      if (c.box) { U.uFixMin.value[i].copy(c.box.min); U.uFixMax.value[i].copy(c.box.max); }
      else { U.uFixMin.value[i].setScalar(-FAR); U.uFixMax.value[i].setScalar(FAR); }
      // light reaching the camera (a card facing the lamp, half on average)
      const inBox = !c.box || (camLocal && camLocal.x >= c.box.min.x && camLocal.y >= c.box.min.y && camLocal.z >= c.box.min.z
        && camLocal.x <= c.box.max.x && camLocal.y <= c.box.max.y && camLocal.z <= c.box.max.z);
      if (inBox && c.d < f.range) {
        const win = Math.max(0, 1 - Math.pow(c.d / f.range, 4));
        camE += k * c.lum * win * win / Math.max(c.d * c.d, 0.01) * (0.5 + bounce);
      }
    }
    U.uFixCount.value = n;
    this.camE = camE;
  }
}
