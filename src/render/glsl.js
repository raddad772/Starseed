// Shared GLSL snippets.

export const GLSL_NOISE = /* glsl */`
// Hash-based 3D value noise and fBm (render-only; not deterministic across GPUs).
float hash13(vec3 p3) {
  p3 = fract(p3 * 0.1031);
  p3 += dot(p3, p3.zyx + 31.32);
  return fract((p3.x + p3.y) * p3.z);
}
float vnoise(vec3 p) {
  vec3 i = floor(p), f = fract(p);
  vec3 u = f * f * (3.0 - 2.0 * f);
  float n000 = hash13(i), n100 = hash13(i + vec3(1,0,0)), n010 = hash13(i + vec3(0,1,0)), n110 = hash13(i + vec3(1,1,0));
  float n001 = hash13(i + vec3(0,0,1)), n101 = hash13(i + vec3(1,0,1)), n011 = hash13(i + vec3(0,1,1)), n111 = hash13(i + vec3(1,1,1));
  return mix(mix(mix(n000, n100, u.x), mix(n010, n110, u.x), u.y), mix(mix(n001, n101, u.x), mix(n011, n111, u.x), u.y), u.z) * 2.0 - 1.0;
}
const mat3 NROT = mat3(0.00, 0.80, 0.60, -0.80, 0.36, -0.48, -0.60, -0.48, 0.64);
float fbm3(vec3 p, int oct) {
  float s = 0.0, a = 0.5;
  for (int i = 0; i < 8; i++) { if (i >= oct) break; s += a * vnoise(p); p = NROT * p * 2.02 + 1.7; a *= 0.5; }
  return s;
}
`;

export const GLSL_RAY = /* glsl */`
// Ray / sphere for rays starting near the camera with spheres possibly very far:
// computed via the perpendicular offset to avoid cancellation in float32.
// Returns (t0, t1); t1 < 0 or t0 > t1 means no hit.
vec2 raySphere(vec3 center, float radius, vec3 dir) {
  float tca = dot(center, dir);
  vec3 perp = center - tca * dir;
  float h2 = dot(perp, perp);
  float r2 = radius * radius;
  if (h2 > r2) return vec2(1.0, -1.0);
  float thc = sqrt(r2 - h2);
  return vec2(tca - thc, tca + thc);
}
`;

// Depth helpers: uDepthMode 0 = reversed-Z float, 1 = logarithmic
export const GLSL_DEPTH = /* glsl */`
uniform float uDepthMode;
uniform float uNear;
uniform float uFar;
uniform float uLogDepthFC; // log2(far + 1)
float viewZFromDepth(float d) {
  if (uDepthMode < 0.5) {
    float c = uNear / (uFar - uNear);
    float dd = uFar * uNear / (uFar - uNear);
    return dd / max(d + c, 1e-30);
  }
  return exp2(d * uLogDepthFC) - 1.0;
}
bool isSkyDepth(float d) { return uDepthMode < 0.5 ? d <= 0.0 : d >= 1.0; }
`;

// Bruneton-style transmittance LUT parameterisation
export const GLSL_ATMO_LUT = /* glsl */`
uniform float uBottom; // atmosphere bottom radius
uniform float uTop;    // atmosphere top radius
vec2 transmittanceUV(float r, float mu) {
  float H = sqrt(max(0.0, uTop * uTop - uBottom * uBottom));
  float rho = sqrt(max(0.0, r * r - uBottom * uBottom));
  float disc = r * r * (mu * mu - 1.0) + uTop * uTop;
  float d = max(0.0, -r * mu + sqrt(max(disc, 0.0)));
  float dMin = uTop - r, dMax = rho + H;
  float xmu = (d - dMin) / max(dMax - dMin, 1e-6);
  float xr = rho / max(H, 1e-6);
  return vec2(xmu, xr);
}
`;

export const FULLSCREEN_VERT = /* glsl */`
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;
