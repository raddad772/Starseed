// The Hollow Moon (Dave, 2026-10-15: "I want that built"): a moon the founders hollowed, and in its hollow a
// sphere they set spinning, its inside a land you walk upside down on, the land across the axis overhead.
// This is its shape and its physics, the same for everyone (world state, deterministic per seed); the scene
// draws it (hollowScene.js), the walker walks it (site/fieldWalker.js).
//
// The frame: the spin's axis is y, the sphere's middle the origin. The founders' shaft comes down the axis
// from the moon's north pole through its crust to the sphere's north hub.
//  - Weight: inside the spinning sphere only the spin's, ω²ρ out from the axis (the moon's own is nothing
//    within its hollow: a shell pulls nothing inside it). On the equator 1 g; less toward the poles (ρ
//    smaller); none on the axis. In the crust above, the moon's own: falling from its surface's to nothing at
//    the hollow (a uniform shell between the hollow's radius and the surface: g(r) = g_s (r³ - Rh³) /
//    (R³ - Rh³) · R² / r²).
//  - The land: the sphere's inside, its radius Rs plus the founders' shaping: an equatorial sea whose water
//    lies on a cylinder (the spin's level: ρ the same everywhere), worked land either side of it, the polar
//    caps smooth, steepening to sheer near the hubs (in the spin's weight the cap is a wall: at latitude λ the
//    ground slopes at λ), three stairways down each.
//  - A still hollow (spin 0, the abandoned one): no weight anywhere inside, no sea, no light.
import { Rng } from '../../core/rng.js';

const G0 = 9.81;
const smooth = (e0, e1, x) => { const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };

// seed: the site's; moon: { R (m, drawn), g (m/s², its surface's) }; still: the abandoned one
export function hollowWorld(seed, { moonR = 27000, moonG = 1.62, still = false } = {}) {
  const rng = Rng.fromString(`hollow:${seed}`);
  // (a sphere ~4 km across a small moon's middle to 8 on a large one; the moon's hollow a little wider)
  const Rs = Math.round(Math.min(4000, Math.max(1200, moonR * 0.15)));
  const Rh = Math.round(Rs * 1.06), omega = still ? 0 : Math.sqrt(G0 / Rs);
  const w = {
    seed, still, Rs, Rh, omega, moonR, moonG,
    // (the sea: a band either side of the equator, its water on the cylinder ρ = seaLevel)
    seaHalf: still ? 0 : 0.045, seaLevel: Rs - 3, seaDepth: 28,
    // (the hubs: a chamber on the axis at each pole; its radius, and how far it stands in from the shell)
    hubR: 42, hubDepth: 70,
    // (the stairways: three down each cap, from the hub's rim to the land's edge at latitude landEdge)
    stairs: [0, 1, 2].map((k) => k * Math.PI * 2 / 3 + rng.range(-0.1, 0.1)), landEdge: 0.84,
    // (the worked land's plots: their own lift, a terrace each)
    plotSize: 140, plotSeed: rng.int(1, 1e9),
    cities: [0, 1, 2, 3, 4, 5].map((k) => ({ theta: k * Math.PI / 3 + rng.range(-0.3, 0.3), lat: (k % 2 ? 1 : -1) * rng.range(0.12, 0.3), size: rng.range(180, 320) })),
  };
  return w;
}

// the field at p (m/s², a vector in the site's frame): the spin's out from the axis inside the sphere; above
// the north hub, in the crust, the moon's own down the axis
export function hollowField(w) {
  const om2 = w.omega * w.omega;
  return (p) => {
    const y = p[1];
    if (y > w.Rh && Math.hypot(p[0], p[2]) < 200) {
      // (the shaft: r from the moon's middle is y here)
      const r = Math.min(y, w.moonR), k = (r ** 3 - w.Rh ** 3) / (w.moonR ** 3 - w.Rh ** 3) * (w.moonR / r) ** 2;
      return [0, -w.moonG * Math.max(0, k), 0];
    }
    return [om2 * p[0], 0, om2 * p[2]];
  };
}

// hashed plot lift (m), a terrace each: the founders' worked land
function plotLift(w, th, lat) {
  const s = w.plotSize / w.Rs, i = Math.floor(th / s), j = Math.floor(lat / s);
  let h = (i * 374761393 + j * 668265263 + w.plotSeed) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16;
  return ((h >>> 0) / 4294967296 - 0.5) * 6;
}

// the land's radius in the unit direction d: how far out from the middle its ground is (m)
export function groundRadius(w, d) {
  const lat = Math.asin(Math.max(-1, Math.min(1, d[1]))), th = Math.atan2(d[2], d[0]), al = Math.abs(lat);
  let r = w.Rs;
  if (w.still) {
    // (the abandoned one: the moon's raw hollow, rough rock, its rubble and its pits)
    const n = Math.sin(th * 7 + lat * 3) * Math.cos(lat * 11 - th * 2) + 0.5 * Math.sin(th * 23 + lat * 17);
    return w.Rs + 18 * n;
  }
  // (the sea's trench)
  if (al < w.seaHalf * 1.3) r += w.seaDepth * smooth(w.seaHalf * 1.3, w.seaHalf * 0.7, al);
  // (the worked land: its plots' terraces, fading out up the caps)
  const land = smooth(w.landEdge + 0.05, w.landEdge - 0.08, al) * smooth(w.seaHalf * 1.2, w.seaHalf * 1.6, al);
  if (land > 0) r -= plotLift(w, th, lat) * land;
  return r;
}

// the land's colour (linear rgb) at the direction d and its radius r: the sea's bed, the plots (gardens and
// fallow, a few bare), the caps' pale worked stone
export function groundColour(w, d) {
  const lat = Math.asin(Math.max(-1, Math.min(1, d[1]))), th = Math.atan2(d[2], d[0]), al = Math.abs(lat);
  if (w.still) { const k = 0.5 + 0.5 * Math.sin(th * 13 + lat * 9); return [0.14 + 0.04 * k, 0.13 + 0.035 * k, 0.12 + 0.03 * k]; }
  if (al < w.seaHalf * 1.15) return [0.10, 0.11, 0.09];
  if (al > w.landEdge - 0.04) { const k = smooth(w.landEdge - 0.04, w.landEdge + 0.04, al); return [0.16 + 0.05 * k, 0.155 + 0.05 * k, 0.15 + 0.045 * k]; }
  const lift = plotLift(w, th, lat), kind = ((lift + 3) / 6 * 5) | 0;
  return [[0.10, 0.18, 0.06], [0.16, 0.20, 0.07], [0.22, 0.19, 0.10], [0.09, 0.14, 0.05], [0.25, 0.22, 0.15]][Math.min(4, kind)];
}

// The founders' land drawn: an archive of the living world below, its kinds of country laid in belts along
// the sea (reeds and wetland at its shore, meadow, the worked fields' strips, forest, heath, then the caps'
// stone), their edges wandering; rivers running down the meridians to the sea (the spin's downhill), the
// roads from the stairways' feet straight to it, the cities' stone. A texture over the whole inside: u the
// longitude, v the latitude (linear rgb, 0..1)
export function landTexture(w, W = 2048, H = 1024) {
  const data = new Uint8Array(W * H * 4), rng = Rng.fromString(`hollow-land:${w.seed}`);
  const rivers = Array.from({ length: 14 }, (_, k) => ({ th: (k + rng.range(0.2, 0.8)) * Math.PI * 2 / 14, amp: rng.range(0.004, 0.012), freq: rng.range(18, 40), ph: rng.range(0, 6.28), width: rng.range(10, 28) / w.Rs, top: rng.range(0.55, 0.8) }));
  const wig = (th, lat, k) => Math.sin(th * (5 + k) + lat * 7 + k) * 0.5 + Math.sin(th * (17 + 3 * k) - lat * 13 + 2 * k) * 0.25 + Math.sin(th * 41 + lat * 37 + k * 5) * 0.12;
  const put = (i, c) => { data[i] = Math.round(255 * Math.sqrt(Math.min(1, c[0]))); data[i + 1] = Math.round(255 * Math.sqrt(Math.min(1, c[1]))); data[i + 2] = Math.round(255 * Math.sqrt(Math.min(1, c[2]))); data[i + 3] = 255; };
  const mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  const C = { bed: [0.05, 0.06, 0.05], sand: [0.33, 0.29, 0.20], reed: [0.10, 0.14, 0.05], meadow: [0.13, 0.20, 0.05], field: [[0.22, 0.20, 0.07], [0.12, 0.17, 0.04], [0.28, 0.22, 0.12], [0.16, 0.21, 0.06]], forest: [0.035, 0.07, 0.025], heath: [0.14, 0.12, 0.07], stone: [0.17, 0.165, 0.155], road: [0.30, 0.28, 0.24], river: [0.04, 0.07, 0.08], city: [0.24, 0.235, 0.22] };
  for (let j = 0; j < H; j++) {
    const lat = (j + 0.5) / H * Math.PI - Math.PI / 2, al = Math.abs(lat), side = lat < 0 ? 1 : 0;
    for (let i = 0; i < W; i++) {
      const th = (i + 0.5) / W * Math.PI * 2 - Math.PI, k = (j * W + i) * 4;
      let c;
      if (w.still) { const n = 0.5 + 0.5 * wig(th, lat, 1); c = mix([0.10, 0.095, 0.09], [0.17, 0.16, 0.15], n); put(k, c); continue; }
      if (al < w.seaHalf) { put(k, C.bed); continue; }
      if (al > w.landEdge + 0.02) { const n = 0.5 + 0.25 * wig(th, lat, 3); put(k, mix(C.stone, [0.21, 0.205, 0.19], n)); continue; }
      // (the belts, by latitude, their edges wandering a few hundred metres)
      const b = (al - w.seaHalf) / (w.landEdge - w.seaHalf) + 0.035 * wig(th, lat, side);
      if (b < 0.025) c = C.sand;
      else if (b < 0.09) c = mix(C.reed, C.meadow, 0.3 + 0.3 * wig(th, lat, 4));
      else if (b < 0.26) c = mix(C.meadow, C.heath, 0.15 + 0.15 * wig(th, lat, 5));
      else if (b < 0.52) {
        // (the fields: strips along the latitude lines, a hundred-odd metres by several hundred)
        const fi = Math.floor(lat * w.Rs / 110), fj = Math.floor(th * w.Rs / (260 + 120 * Math.sin(fi)));
        let h = (fi * 73856093) ^ (fj * 19349663) ^ w.plotSeed; h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16;
        c = C.field[(h >>> 0) % 4];
        // (hedges between them)
        const fy = (lat * w.Rs / 110) % 1, fx = (th * w.Rs / (260 + 120 * Math.sin(fi))) % 1;
        if (Math.abs(fy) < 0.05 || Math.abs(fx) < 0.02) c = C.forest;
      } else if (b < 0.78) c = mix(C.forest, [0.05, 0.09, 0.03], 0.5 + 0.5 * wig(th * 3, lat * 3, 6));
      else c = mix(C.heath, C.stone, Math.min(1, (b - 0.78) / 0.22));
      // (rivers down the meridians to the sea)
      for (const r of rivers) {
        if (al > r.top) continue;
        const rt = r.th + r.amp * Math.sin(al * r.freq + r.ph) + 0.25 * r.amp * Math.sin(al * r.freq * 2.7 + 2 * r.ph);
        let d = Math.abs(th - rt); if (d > Math.PI) d = Math.PI * 2 - d;
        if (d * Math.cos(lat) < r.width * (0.6 + al)) { c = C.river; break; }
      }
      // (roads from the stairways' feet to the sea)
      for (const st of w.stairs) { let d = Math.abs(th - (st > Math.PI ? st - Math.PI * 2 : st)); if (d > Math.PI) d = Math.PI * 2 - d; if (d * w.Rs * Math.cos(lat) < 5) { c = C.road; break; } }
      // (the cities' stone)
      for (const ct of w.cities) { const dt = Math.atan2(Math.sin(th - ct.theta), Math.cos(th - ct.theta)) * Math.cos(lat), dl = lat - ct.lat; if (Math.hypot(dt, dl) * w.Rs < ct.size * 1.2) { c = mix(c, C.city, 0.85); break; } }
      put(k, c);
    }
  }
  return { data, W, H };
}
