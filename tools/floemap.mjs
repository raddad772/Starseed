// The sea's floes from above, as gen/liquidice.js seaFloe reckons them (the shader's twin): a patch of
// sea 2 km across round lat0, lon0 on a world of radius R, each point what bears you there (water dark,
// a floe white, a broken floe's piece orange, the closed pack grey). For checking the floes without a
// browser.
//   node tools/floemap.mjs [ice 0..1] [out.ppm] [lat] [lon] [R m]
import fs from 'node:fs';
const L = await import('../src/gen/liquidice.js');
const R = +(process.argv[6] || 6371000 / 64), d2r = Math.PI / 180, ice = +(process.argv[2] || 0.45);
const lat0 = +(process.argv[4] || -51.8), lon0 = +(process.argv[5] || -76), W = +(process.env.W || 600), H = +(process.env.H || 400), span = +(process.env.SPAN || 2000); // m across
const img = Buffer.alloc(W * H * 3), cnt = [0, 0, 0, 0];
const c0 = [Math.cos(lat0 * d2r) * Math.cos(lon0 * d2r), Math.sin(lat0 * d2r), Math.cos(lat0 * d2r) * Math.sin(lon0 * d2r)];
const E = [-Math.sin(lon0 * d2r), 0, Math.cos(lon0 * d2r)], N = [c0[1] * E[2] - c0[2] * E[1], c0[2] * E[0] - c0[0] * E[2], c0[0] * E[1] - c0[1] * E[0]];
const col = [[20, 80, 100], [230, 230, 235], [255, 120, 40], [120, 120, 140]];
for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
  const a = (i / W - 0.5) * span, b = (0.5 - j / H) * span * H / W;
  const d = [c0[0] + (E[0] * a + N[0] * b) / R, c0[1] + (E[1] * a + N[1] * b) / R, c0[2] + (E[2] * a + N[2] * b) / R];
  const l = Math.hypot(...d); d[0] /= l; d[1] /= l; d[2] /= l;
  const p = [d[0] * R, d[1] * R, d[2] * R];
  const on = L.seaFloe(p, d, ice), why = on ? L.seaFloe.why : 0;
  cnt[why]++;
  const c = col[why], o = (j * W + i) * 3; img[o] = c[0]; img[o + 1] = c[1]; img[o + 2] = c[2];
}
const hdr = `P6\n${W} ${H}\n255\n`;
fs.writeFileSync(process.argv[3] || 'floemap.ppm', Buffer.concat([Buffer.from(hdr), img]));
console.log('water/floe/piece/closed', cnt.map((n) => (n / (W * H)).toFixed(3)).join(' '));
