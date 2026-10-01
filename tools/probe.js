// Dev-only: lighting / exposure probes for browser tests.
const g = () => window.game;

export function setup() {
  const gm = g(), p = gm.player, e = gm.engine, r = e.renderer;
  const h2f = (h) => { const s = (h & 0x8000) ? -1 : 1, ex = (h >> 10) & 0x1f, m = h & 0x3ff; if (ex === 0) return s * Math.pow(2, -14) * (m / 1024); if (ex === 31) return m ? NaN : s * Infinity; return s * Math.pow(2, ex - 15) * (1 + m / 1024); };
  // mean luminance of an n x n block of the final HDR frame at (fx, fy) from the top-left
  window.readHDR = (fx, fy, n = 8) => {
    const rt = e.lastHDR; const W = rt.width, H = rt.height;
    const x = Math.floor(fx * W), y = Math.floor((1 - fy) * H);
    const buf = new Uint16Array(n * n * 4);
    r.readRenderTargetPixels(rt, x, y, n, n, buf);
    let L = 0; for (let i = 0; i < n * n; i++) L += 0.2126 * h2f(buf[i * 4]) + 0.7152 * h2f(buf[i * 4 + 1]) + 0.0722 * h2f(buf[i * 4 + 2]);
    return +(L / (n * n)).toFixed(5);
  };
  window.readAdapt = () => { const rt = e.rtAdapt[e.adaptIdx]; const b = new Float32Array(4); r.readRenderTargetPixels(rt, 0, 0, 1, 1, b); return b[0]; };
  // stand on the planet where the sun is elevDeg up, facing it (azOff turns away)
  window.sunScene = (elevDeg, pitch = 0.25, azOff = 0) => {
    const b = p.currentBody();
    const sunW = gm.universe.star.pos.clone().sub(b.pos).normalize();
    const sF = sunW.clone().applyQuaternion(b.qInv);
    const hereF = (p.mode === 'surface' ? p.fPos.clone() : gm.ship.pos.clone().applyQuaternion(b.qInv)).normalize();
    const axis = sF.clone().cross(hereF).normalize();
    const dirF = sF.clone().applyAxisAngle(axis, (90 - elevDeg) * Math.PI / 180);
    const sunH = sF.clone().addScaledVector(dirF, -sF.dot(dirF)).normalize();
    if (azOff) sunH.applyAxisAngle(dirF, azOff * Math.PI / 180);
    p.placeOnSurface(b, dirF, sunH);
    p.pitch = pitch;
    e.adaptReset = true;
  };
  window.expo = () => {
    const ad = window.readAdapt();
    return { meterRef: +e.meterRef.toFixed(5), exposure: +(0.18 / Math.pow(2, ad)).toFixed(2), anchorExp: +(0.18 / e.meterRef).toFixed(2), camE: +gm.lights.camE.toFixed(4), inside: gm.lights.inside };
  };
}

export async function settle(maxMs = 30000) {
  const t0 = performance.now();
  while (performance.now() - t0 < maxMs) {
    await window.debugRun(4000, 16);
    if (g().world.pendingNear() === 0) return true;
  }
  return false;
}
