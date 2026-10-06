// Moonlight: what lights a world's night, from the other bodies in its sky (its moons; from a moon, its
// planet and its sisters). Each a sphere the star lights, seen at its phase: a Lambert sphere's, Phi(a) =
// (sin a + (pi - a) cos a) / pi at phase angle a, its geometric albedo two thirds of its Bond albedo, so
// at the world E = p E*(at it) (R / d)^2 Phi (sizes and distances as drawn: the moon as bright as it
// looks big). The full Moon on Earth: ~1.6e-6 of the Sun's light, ~0.2 lux.
//
// Drawn NIGHT_GAIN brighter: the eye's dark adaptation goes some thirteen stops past what the exposure here
// follows (and the scene's half-float buffers can't hold a moonlit field's ~1e-7: their floor), so a
// moonlit night reads as one, its shadows sharp, and a night without a moon is dark.
import * as THREE from 'three';

export const NIGHT_GAIN = 8192;

const _v = new THREE.Vector3(), _s = new THREE.Vector3();

// the brightest of b's night lights: { E (relative to Earth's sunlight, gained), dir (unit, world, from b's
// centre), body }; E 0 if none
export function moonLight(u, b, out = { E: 0, dir: new THREE.Vector3(0, 1, 0), body: null }) {
  out.E = 0; out.body = null;
  const consider = (m) => {
    if (!m || m === b || m.isStar) return;
    const toM = _v.copy(m.pos).sub(b.pos), d = toM.length();
    if (!(d > m.R + b.R)) return;
    toM.divideScalar(d);
    // (its phase: the star at the origin)
    const cosA = Math.max(-1, Math.min(1, -_s.copy(m.pos).normalize().dot(toM))), a = Math.acos(cosA);
    const phi = (Math.sin(a) + (Math.PI - a) * cosA) / Math.PI;
    const p = (2 / 3) * (m.data.albedo ?? 0.3);
    const E = p * u.sunIlluminance(m.pos) * (m.R / d) * (m.R / d) * phi * NIGHT_GAIN;
    if (E > out.E) { out.E = E; out.body = m; out.dir.copy(toM); }
  };
  for (const c of b.children) consider(c);
  if (b.parent && !b.parent.isStar) { consider(b.parent); for (const s of b.parent.children) consider(s); }
  return out;
}

// a surface's moonlight (after GLSL_SURFACE_ATMO, GLSL_TERRAIN_SHADOW and GLSL_CLOUD_SHADOW, its
// cloudLight called first): rel from the world's centre (r its length, up rel / r), N the normal, sh the
// key shadow map's (sunShadows.js: the moon's at night), trans how much comes through from behind (leaves),
// wrap the sky's share by the normal, skyK the canopy's (skyShadow)
export const GLSL_MOON = /* glsl */`
uniform vec3 uMoonDir;
uniform vec3 uMoonE;
vec3 moonLit(vec3 rel, float r, vec3 up, vec3 N, float sh, float trans, float wrap, float skyK) {
  if (uMoonE.g <= 0.0) return vec3(0.0);
  float muM = dot(up, uMoonDir);
  if (muM < -0.1) return vec3(0.0);
  vec3 pF = uToFixed * rel;
  vec3 T = atmoSunTransmittance(r, muM) * terrainShadow(pF, normalize(pF), uToFixed * uMoonDir, uRadius) * sh * cloudDirZ;
  vec3 S = atmoSkyIrradiance(r, muM) * cloudTotZ;
  float nd = dot(N, uMoonDir);
  return uMoonE * (T * (max(nd, 0.0) + trans * max(-nd, 0.0)) + S * wrap * skyK);
}
`;
