// The integer tile sim (gpu/itile.js) on a GPU through WebGPU: each pass there is a compute
// pass here, operation for operation in 32-bit integers, so the result is the same bit for bit
// as the reference's, on any GPU (and through Dawn, natively). The buffers stay on the GPU for
// the whole run; the heights and talus come back at the end.

import { hashInts } from '../core/rng.js';
import { gridTables, hardTables, apowTable, PASSES } from './itile.js';

const WGSL = /* wgsl */`
struct Params { NG: u32, n: u32, salt: u32, PB: u32, NB: u32, RB: i32, axis: u32, pad: u32 };
@group(0) @binding(0) var<uniform> P: Params;
@group(0) @binding(1) var<storage, read> hIn: array<i32>;
@group(0) @binding(2) var<storage, read_write> hOut: array<i32>;
@group(0) @binding(3) var<storage, read> FIn: array<i32>;
@group(0) @binding(4) var<storage, read_write> FOut: array<i32>;
@group(0) @binding(5) var<storage, read> AIn: array<u32>;
@group(0) @binding(6) var<storage, read_write> AOut: array<u32>;
@group(0) @binding(7) var<storage, read_write> rcv: array<u32>;
@group(0) @binding(8) var<storage, read_write> info: array<u32>;      // flags (1 base, 2 joins it when the sea rises) | hardness << 8 | channel head's drainage << 16
@group(0) @binding(9) var<storage, read> wa: array<u32>;              // the water each cell sheds
@group(0) @binding(10) var<storage, read> Bs: array<i32>;             // the starting surface
@group(0) @binding(11) var<storage, read> DW: array<u32>;             // per neighbour: distance (mm) | creep weight << 23
@group(0) @binding(12) var<storage, read> CMCE: array<i32>;           // stream power's coefficient: mantissa axis, diagonal; exponent axis, diagonal
@group(0) @binding(13) var<storage, read> TB: array<u32>;             // KH 0, KD 256, SC 512, APOW 768
@group(0) @binding(14) var<storage, read> alIn: array<i32>;
@group(0) @binding(15) var<storage, read_write> alOut: array<i32>;
@group(0) @binding(16) var<storage, read> beIn: array<u32>;
@group(0) @binding(17) var<storage, read_write> beOut: array<u32>;
@group(0) @binding(18) var<storage, read> ptIn: array<i32>;
@group(0) @binding(19) var<storage, read_write> ptOut: array<i32>;
@group(0) @binding(20) var<storage, read_write> talus: array<i32>;
@group(0) @binding(21) var<storage, read> MIn: array<i32>;
@group(0) @binding(22) var<storage, read_write> MOut: array<i32>;
@group(0) @binding(23) var<storage, read> GEO: array<u32>;            // each cell's suite | how broken (0..255) << 8
@group(0) @binding(24) var<storage, read> BOFF: array<i32>;           // its beds' offset (m)
@group(0) @binding(25) var<storage, read> COLT: array<u32>;           // the suites' columns: hardness by metre, 4 x 15000

const PONDQ: i32 = 2048;
const FMAX2: i32 = 2147418112;

fn slot(k: u32) -> vec2i { let idx = select(k + 1u, k, k < 4u); return vec2i(i32(idx % 3u) - 1, i32(idx / 3u) - 1); }
fn nb(c: u32, k: u32) -> i32 {
  let d = slot(k); let i = i32(c % P.NG) + d.x; let j = i32(c / P.NG) + d.y;
  if (i < 0 || j < 0 || i >= i32(P.NG) || j >= i32(P.NG)) { return -1; }
  return j * i32(P.NG) + i;
}
fn diag(k: u32) -> u32 { let d = slot(k); return select(0u, 1u, d.x != 0 && d.y != 0); }
fn mul16(a: i32, b: u32) -> i32 { return (a >> 16u) * i32(b) + i32((u32(a & 0xffff) * b) >> 16u); }
fn fmix32(h0: u32) -> u32 { var h = h0; h ^= h >> 16u; h *= 0x85ebca6bu; h ^= h >> 13u; h *= 0xc2b2ae35u; h ^= h >> 16u; return h; }
fn hash2(a: u32, b: u32) -> u32 { return fmix32(fmix32(fmix32(fmix32(a) ^ b))); }
fn apowIndex(A: u32) -> u32 {
  let e = firstLeadingBit(A);
  let f = select(A << (8u - e), A >> (e - 8u), e >= 8u) & 255u;
  return (e << 8u) | f;
}
fn floordiv(x: i32, m: i32) -> i32 { return select((x - (m - 1)) / m, x / m, x >= 0); }

@compute @workgroup_size(64) fn pinBlock(@builtin(global_invocation_id) g: vec3u) {
  let b = g.x; if (b >= P.NB * P.NB) { return; }
  let bi = b % P.NB; let bj = b / P.NB;
  var s = 0; var cnt = 0;
  for (var j = bj * P.PB; j < min(P.NG, bj * P.PB + P.PB); j++) {
    for (var i = bi * P.PB; i < min(P.NG, bi * P.PB + P.PB); i++) {
      let c = j * P.NG + i;
      s += clamp(hIn[c] - Bs[c], -16777215, 16777215); cnt += 1;
    }
  }
  MOut[b] = s / cnt;
}
@compute @workgroup_size(64) fn pinBlur(@builtin(global_invocation_id) g: vec3u) {
  let b = g.x; if (b >= P.NB * P.NB) { return; }
  let bi = i32(b % P.NB); let bj = i32(b / P.NB); let NB = i32(P.NB);
  var s = 0; var cnt = 0;
  for (var r = -P.RB; r <= P.RB; r++) {
    let xi = select(bi + r, bi, P.axis == 1u); let xj = select(bj, bj + r, P.axis == 1u);
    if (xi < 0 || xj < 0 || xi >= NB || xj >= NB) { continue; }
    s += MIn[xj * NB + xi] >> 4u; cnt += 1;
  }
  MOut[b] = (s / cnt) << 4u;
}
@compute @workgroup_size(256) fn pinApply(@builtin(global_invocation_id) g: vec3u) {
  let c = g.x; if (c >= P.n) { return; }
  if ((info[c] & 1u) != 0u) { hOut[c] = hIn[c]; return; }
  let PB = i32(P.PB); let NB = i32(P.NB); let P2 = 2 * PB;
  let x = i32(c % P.NG) * 2 + 1 - PB; let y = i32(c / P.NG) * 2 + 1 - PB;
  let b0i = floordiv(x, P2); let b0j = floordiv(y, P2);
  let fx = x - b0i * P2; let fy = y - b0j * P2;
  let i0 = clamp(b0i, 0, NB - 1); let i1 = clamp(b0i + 1, 0, NB - 1); let j0 = clamp(b0j, 0, NB - 1); let j1 = clamp(b0j + 1, 0, NB - 1);
  let top = (MIn[j0 * NB + i0] * (P2 - fx) + MIn[j0 * NB + i1] * fx) / P2;
  let bot = (MIn[j1 * NB + i0] * (P2 - fx) + MIn[j1 * NB + i1] * fx) / P2;
  let m = (top * (P2 - fy) + bot * fy) / P2;
  hOut[c] = hIn[c] - mul16(m, 19661u);
}
@compute @workgroup_size(256) fn rise(@builtin(global_invocation_id) g: vec3u) {
  let c = g.x; if (c >= P.n) { return; }
  if ((info[c] & 2u) != 0u) { info[c] = info[c] | 1u; }
}
@compute @workgroup_size(256) fn hardness(@builtin(global_invocation_id) g: vec3u) {
  let c = g.x; if (c >= P.n) { return; }
  let gg = GEO[c]; let su = gg & 3u; let wk = (gg >> 8u) & 255u;
  let z = clamp((hIn[c] >> 12u) + BOFF[c] + 3000, 0, 14999);
  let hd = (COLT[su * 15000u + u32(z)] * (256u - ((wk * 179u) >> 8u))) >> 8u;
  info[c] = (info[c] & 0xffff00ffu) | (hd << 8u);
}
@compute @workgroup_size(256) fn fill(@builtin(global_invocation_id) g: vec3u) {
  let c = g.x; if (c >= P.n) { return; }
  if ((info[c] & 1u) != 0u) { FOut[c] = hIn[c]; return; }
  var m = 2147483647;
  for (var k = 0u; k < 8u; k++) { let o = nb(c, k); if (o >= 0 && FIn[o] < m) { m = FIn[o]; } }
  let v = select(m + 1, hIn[c], m == 2147483647);
  FOut[c] = max(hIn[c], v);
}
@compute @workgroup_size(256) fn receivers(@builtin(global_invocation_id) g: vec3u) {
  let c = g.x; if (c >= P.n) { return; }
  if ((info[c] & 1u) != 0u) { rcv[c] = 8u; return; }
  var sl: array<i32, 8>;
  var best = 8u; var bs = 0; var sum = 0;
  for (var k = 0u; k < 8u; k++) {
    let o = nb(c, k);
    var s = 0;
    if (o >= 0) {
      var d = FIn[c] - FIn[o];
      if (d > 0) {
        d = min(d, 1048576);
        s = min((d * 1024) / i32(DW[c * 8u + k] & 0x7fffffu), 134217727);
      }
    }
    sl[k] = s;
  }
  for (var k = 0u; k < 8u; k++) { let s = sl[k]; if (s > 0) { sum += s; } if (s > bs) { bs = s; best = k; } }
  if (bs >= 1) {
    var x = hash2(c, P.salt) % u32(sum);
    for (var k = 0u; k < 8u; k++) {
      let s = sl[k];
      if (s <= 0) { continue; }
      if (x < u32(s)) { best = k; break; }
      x -= u32(s);
    }
  }
  rcv[c] = best;
}
@compute @workgroup_size(256) fn accum(@builtin(global_invocation_id) g: vec3u) {
  let c = g.x; if (c >= P.n) { return; }
  var s = wa[c];
  for (var k = 0u; k < 8u; k++) { let o = nb(c, k); if (o >= 0 && rcv[o] == 7u - k) { s += AIn[o]; } }
  AOut[c] = s;
}
@compute @workgroup_size(256) fn jumpInit(@builtin(global_invocation_id) g: vec3u) {
  let c = g.x; if (c >= P.n) { return; }
  alOut[c] = hIn[c]; beOut[c] = 0u; ptOut[c] = i32(c);
  if ((info[c] & 1u) != 0u) { return; }
  let k = rcv[c];
  if (k == 8u || FIn[c] - hIn[c] > PONDQ || AIn[c] < (info[c] >> 16u)) { return; }
  let r = nb(c, k);
  if (hIn[c] - hIn[r] <= 0) { return; }
  let hd = (info[c] >> 8u) & 255u;
  let X = TB[hd] * TB[768u + apowIndex(AIn[c])];
  let t = diag(k); let e = CMCE[c * 4u + 2u + t];
  var f = mul16(i32(X), u32(CMCE[c * 4u + t]));
  if (e >= 0) { if (f > (FMAX2 >> u32(e))) { f = FMAX2; } else { f = f << u32(e); } } else { f = f >> u32(-e); }
  let b = 65536u - (0xffffffffu / (65536u + u32(f)));
  let be = min(b, 65535u);
  beOut[c] = be; ptOut[c] = r; alOut[c] = hIn[c] - mul16(hIn[c], be);
}
@compute @workgroup_size(256) fn jump(@builtin(global_invocation_id) g: vec3u) {
  let c = g.x; if (c >= P.n) { return; }
  let q = ptIn[c];
  if (q == i32(c) || beIn[c] == 0u) { alOut[c] = alIn[c]; beOut[c] = beIn[c]; ptOut[c] = q; return; }
  alOut[c] = alIn[c] + mul16(alIn[q], beIn[c]);
  beOut[c] = (beIn[c] * beIn[q]) >> 16u;
  ptOut[c] = ptIn[q];
}
@compute @workgroup_size(256) fn jumpApply(@builtin(global_invocation_id) g: vec3u) {
  let c = g.x; if (c >= P.n) { return; }
  hOut[c] = alIn[c] + mul16(hIn[ptIn[c]], beIn[c]);
}
@compute @workgroup_size(256) fn creep(@builtin(global_invocation_id) g: vec3u) {
  let c = g.x; if (c >= P.n) { return; }
  hOut[c] = hIn[c];
  if ((info[c] & 1u) != 0u) { return; }
  var s = 0;
  for (var k = 0u; k < 8u; k++) {
    let o = nb(c, k);
    if (o < 0) { continue; }
    let d = clamp(hIn[o] - hIn[c], -4194304, 4194304);
    s += (d * i32(DW[c * 8u + k] >> 23u)) >> 8u;
  }
  hOut[c] = hIn[c] + mul16(s, TB[256u + ((info[c] >> 8u) & 255u)]);
}
@compute @workgroup_size(256) fn collapse(@builtin(global_invocation_id) g: vec3u) {
  let c = g.x; if (c >= P.n) { return; }
  var out = 0; var inn = 0;
  let baseC = (info[c] & 1u) != 0u;
  let scC = i32(TB[512u + ((info[c] >> 8u) & 255u)]);
  for (var k = 0u; k < 8u; k++) {
    let o = nb(c, k);
    if (o < 0) { continue; }
    let d = i32((DW[c * 8u + k] & 0x7fffffu) >> 6u);
    if (!baseC) { let ex = hIn[c] - hIn[o] - scC * d; if (ex > 0) { out += ex >> 4u; } }
    if ((info[o] & 1u) == 0u) { let ex = hIn[o] - hIn[c] - i32(TB[512u + ((info[o] >> 8u) & 255u)]) * d; if (ex > 0) { inn += ex >> 4u; } }
  }
  hOut[c] = hIn[c] - out + inn;
  talus[c] += inn;
}
`;

const ENTRIES = ['pinBlock', 'pinBlur', 'pinApply', 'rise', 'hardness', 'fill', 'receivers', 'accum', 'jumpInit', 'jump', 'jumpApply', 'creep', 'collapse'];

export class ITileGPU {
  static async create() {
    if (typeof navigator === 'undefined' || !navigator.gpu) return null;
    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) return null;
    const L = adapter.limits;
    const device = await adapter.requestDevice({ requiredLimits: {
      maxStorageBuffersPerShaderStage: Math.min(L.maxStorageBuffersPerShaderStage, 16),
      maxStorageBufferBindingSize: L.maxStorageBufferBindingSize, maxBufferSize: L.maxBufferSize,
    } });
    return new ITileGPU(device);
  }

  constructor(device) {
    this.device = device;
    const module = device.createShaderModule({ code: WGSL });
    this.pipes = {};
    for (const e of ENTRIES) this.pipes[e] = device.createComputePipeline({ layout: 'auto', compute: { module, entryPoint: e } });
    this.bgCache = new Map();
  }

  _buf(name, bytes, usage = GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC) {
    const b = this.device.createBuffer({ size: Math.max(16, Math.ceil(bytes / 4) * 4), usage, label: name });
    b._name = name;
    return b;
  }
  // a pipeline's bind group for these buffers by binding, cached
  _bg(entry, binds) {
    const key = entry + '|' + Object.entries(binds).map(([k, b]) => k + ':' + b._name).join(',');
    let g = this.bgCache.get(key);
    if (!g) {
      g = this.device.createBindGroup({ layout: this.pipes[entry].getBindGroupLayout(0), entries: Object.entries(binds).map(([k, b]) => ({ binding: +k, resource: { buffer: b } })) });
      this.bgCache.set(key, g);
    }
    return g;
  }

  // runs T (localsim's ints()) on the GPU; resolves to { h, talus } as runInt returns
  async run(T) {
    const dev = this.device, { NG, n } = T;
    this.bgCache.clear();
    const { D, W, CM, CE } = gridTables(T), { KH, KD, SC } = hardTables(T.kd0), AP = apowTable();
    const PB = T.sig <= 6 ? 4 : 8, NB = Math.ceil(NG / PB), RB = Math.max(1, Math.round(T.sig / PB));
    const put = (name, arr) => { const b = this._buf(name, arr.byteLength); dev.queue.writeBuffer(b, 0, arr); return b; };
    const info = new Uint32Array(n);
    for (let c = 0; c < n; c++) info[c] = (T.flags[c] | (T.hd[c] << 8) | (T.Acu[c] << 16)) >>> 0;
    const dw = new Uint32Array(n * 8);
    for (let i = 0; i < n * 8; i++) dw[i] = (D[i] & 0x7fffff) | (W[i] << 23);
    const cmce = new Int32Array(n * 4);
    for (let c = 0; c < n; c++) { cmce[c * 4] = CM[c * 2]; cmce[c * 4 + 1] = CM[c * 2 + 1]; cmce[c * 4 + 2] = CE[c * 2]; cmce[c * 4 + 3] = CE[c * 2 + 1]; }
    const tb = new Uint32Array(768 + AP.length);
    tb.set(KH, 0); tb.set(KD, 256); tb.set(SC, 512); tb.set(AP, 768);
    const B = {
      info: put('info', info), wa: put('wa', T.a), Bs: put('Bs', T.B), DW: put('DW', dw), CMCE: put('CMCE', cmce), TB: put('TB', tb),
      h0: put('h0', T.h0), h1: this._buf('h1', n * 4), F0: put('F0', T.h0), F1: this._buf('F1', n * 4),
      A0: put('A0', T.a), A1: this._buf('A1', n * 4), rcv: put('rcv', new Uint32Array(n).fill(8)),
      al0: this._buf('al0', n * 4), al1: this._buf('al1', n * 4), be0: this._buf('be0', n * 4), be1: this._buf('be1', n * 4), pt0: this._buf('pt0', n * 4), pt1: this._buf('pt1', n * 4),
      talus: put('talus', new Int32Array(n)), M0: this._buf('M0', NB * NB * 4), M1: this._buf('M1', NB * NB * 4),
    };
    if (T.geo) {
      const Gx = T.geo, geo = new Uint32Array(n);
      for (let c = 0; c < n; c++) geo[c] = Gx.suite[c] | (Gx.weak[c] << 8);
      B.GEO = put('GEO', geo); B.BOFF = put('BOFF', Gx.bedOff); B.COLT = put('COLT', Uint32Array.from(Gx.colHd));
    }
    const params = [0, 1].map((ax) => this._buf('P' + ax, 32, GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST));
    const pdata = new Int32Array(8);
    let hc = 0, Fc = 0, Ac = 0;
    const hb = () => B['h' + hc], hb2 = () => B['h' + (1 - hc)];
    const wgN = Math.ceil(n / 256), wgB = Math.ceil(NB * NB / 64);
    for (let st = 0; st < T.steps; st++) {
      const salt = hashInts(st, T.salt) >>> 0;
      for (const ax of [0, 1]) { pdata.set([NG, n, salt | 0, PB, NB, RB, ax, 0]); dev.queue.writeBuffer(params[ax], 0, pdata); }
      // (one compute pass a step: its dispatches run in order, each seeing the last one's writes)
      const enc = dev.createCommandEncoder(), cp = enc.beginComputePass();
      const pass = (entry, binds, wg, P = params[0]) => {
        cp.setPipeline(this.pipes[entry]);
        cp.setBindGroup(0, this._bg(entry, { 0: P, ...binds }));
        cp.dispatchWorkgroups(wg);
      };
      if (st % 2 === 1) {
        pass('pinBlock', { 1: hb(), 10: B.Bs, 22: B.M0 }, wgB);
        let m = 0;
        for (let p = 0; p < 3; p++) for (const ax of [0, 1]) { pass('pinBlur', { 21: B['M' + m], 22: B['M' + (1 - m)] }, wgB, params[ax]); m = 1 - m; }
        pass('pinApply', { 1: hb(), 2: hb2(), 8: B.info, 21: B['M' + m] }, wgN); hc = 1 - hc;
      }
      if (st === T.rise) pass('rise', { 8: B.info }, wgN);
      if (T.geo) pass('hardness', { 1: hb(), 8: B.info, 23: B.GEO, 24: B.BOFF, 25: B.COLT }, wgN);
      for (let p = 0; p < PASSES.fill; p++) { pass('fill', { 1: hb(), 3: B['F' + Fc], 4: B['F' + (1 - Fc)], 8: B.info }, wgN); Fc = 1 - Fc; }
      pass('receivers', { 3: B['F' + Fc], 7: B.rcv, 8: B.info, 11: B.DW }, wgN);
      for (let p = 0; p < PASSES.accum; p++) { pass('accum', { 5: B['A' + Ac], 6: B['A' + (1 - Ac)], 7: B.rcv, 9: B.wa }, wgN); Ac = 1 - Ac; }
      pass('jumpInit', { 1: hb(), 3: B['F' + Fc], 5: B['A' + Ac], 7: B.rcv, 8: B.info, 12: B.CMCE, 13: B.TB, 15: B.al0, 17: B.be0, 19: B.pt0 }, wgN);
      let jc = 0;
      for (let p = 0; p < PASSES.jump; p++) { pass('jump', { 14: B['al' + jc], 15: B['al' + (1 - jc)], 16: B['be' + jc], 17: B['be' + (1 - jc)], 18: B['pt' + jc], 19: B['pt' + (1 - jc)] }, wgN); jc = 1 - jc; }
      pass('jumpApply', { 1: hb(), 2: hb2(), 14: B['al' + jc], 16: B['be' + jc], 18: B['pt' + jc] }, wgN); hc = 1 - hc;
      pass('creep', { 1: hb(), 2: hb2(), 8: B.info, 11: B.DW, 13: B.TB }, wgN); hc = 1 - hc;
      for (let p = 0; p < PASSES.collapse; p++) { pass('collapse', { 1: hb(), 2: hb2(), 8: B.info, 11: B.DW, 13: B.TB, 20: B.talus }, wgN); hc = 1 - hc; }
      cp.end();
      dev.queue.submit([enc.finish()]);
      // (a couple of steps at a time, then wait for them: the game draws on the same GPU, and
      // a queue full of steps would hold its frames back)
      if (st % 2 === 1) await dev.queue.onSubmittedWorkDone();
    }
    // the result back
    const rb = (src) => { const b = dev.createBuffer({ size: n * 4, usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST }); const e = dev.createCommandEncoder(); e.copyBufferToBuffer(src, 0, b, 0, n * 4); dev.queue.submit([e.finish()]); return b; };
    const rh = rb(hb()), rt = rb(B.talus);
    await Promise.all([rh.mapAsync(GPUMapMode.READ), rt.mapAsync(GPUMapMode.READ)]);
    const out = { h: new Int32Array(rh.getMappedRange().slice(0)), talus: new Int32Array(rt.getMappedRange().slice(0)) };
    rh.destroy(); rt.destroy();
    for (const b of [...Object.values(B), ...params]) b.destroy();
    return out;
  }
}
