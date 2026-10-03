// The world simulation's compiled kernels (native/sim.c, built by tools/build-wasm.sh and
// embedded in src/wasm/sim.wasm.js). Each gives the same results as its JavaScript twin bit
// for bit, so the sim runs either way; this only makes it faster where WebAssembly can be
// compiled synchronously (workers and node; a browser's main thread may refuse a large
// module, and then the JavaScript runs). ?native=0 / STARSEED_NATIVE=0 turns it off.

import { SIM_WASM } from '../../wasm/sim.wasm.js';

let ex = null, tried = false, mem = null;

function off() {
  try { if (typeof process !== 'undefined' && process.env && process.env.STARSEED_NATIVE === '0') return true; } catch { /* */ }
  try { if (typeof location !== 'undefined' && /[?&]native=0/.test(location.search)) return true; } catch { /* */ }
  return false;
}

// the kernels' exports, or null (then use the JavaScript)
export function native() {
  if (tried) return ex;
  tried = true;
  if (off() || typeof WebAssembly === 'undefined') return null;
  try {
    const bin = typeof atob === 'function' ? Uint8Array.from(atob(SIM_WASM), (c) => c.charCodeAt(0)) : Uint8Array.from(Buffer.from(SIM_WASM, 'base64'));
    ex = new WebAssembly.Instance(new WebAssembly.Module(bin), {}).exports;
    mem = ex.memory;
    base = ex.arena_mark();
  } catch { ex = null; }
  return ex;
}

// ---- memory: grids' neighbour tables stay resident (the last few grids used); each call's
// arrays go in a scratch region after them, reused call to call
let base = 0, grids = [], scratch = 0;

function heap(T, ptr, len) { return new T(mem.buffer, ptr, len); }

function alloc(bytes) {
  const p = ex.arena_alloc(bytes);
  if (!p) throw new Error('native: out of memory');
  return p;
}

// the grid's CSR (nStart, nbr, nDist) in wasm memory: { nStart, nbr, nDist } pointers
function gridIn(G) {
  for (const g of grids) if (g.G === G) return g;
  if (grids.length >= 3) { grids = []; ex.arena_reset(base); }
  else if (grids.length) ex.arena_reset(grids[grids.length - 1].end);
  const n = G.n, m = G.nbr.length;
  const g = { G, nStart: alloc(4 * (n + 1)), nbr: alloc(4 * m), nDist: alloc(8 * m) };
  heap(Int32Array, g.nStart, n + 1).set(G.nStart);
  heap(Int32Array, g.nbr, m).set(G.nbr);
  heap(Float64Array, g.nDist, m).set(G.nDist);
  g.end = ex.arena_mark();
  grids.push(g);
  scratch = g.end;
  return g;
}

// tectonics.js blur() on wasm (a Float64Array field; others round each pass, so they stay
// in JavaScript): false if unavailable
export function blurNative(G, f, iters) {
  if (!(f instanceof Float64Array) || iters <= 0 || !native()) return false;
  const n = G.n;
  const g = gridIn(G);
  ex.arena_reset(grids[grids.length - 1].end);
  const fp = alloc(8 * n), tp = alloc(8 * n);
  heap(Float64Array, fp, n).set(f);
  ex.blur(n, g.nStart, g.nbr, fp, tp, iters);
  f.set(heap(Float64Array, fp, n));
  return true;
}

// erosion.js route() on wasm: fills E.fill, E.rcv, E.rcvD, E.order; false if unavailable
export function routeNative(E, wander, salt) {
  if (!native()) return false;
  const G = E.G, n = G.n;
  const g = gridIn(G);
  ex.arena_reset(grids[grids.length - 1].end);
  const h = alloc(8 * n), b = alloc(n), fill = alloc(8 * n), rcv = alloc(4 * n), rcvD = alloc(8 * n), order = alloc(4 * n), done = alloc(n), hk = alloc(8 * n), hv = alloc(4 * n);
  heap(Float64Array, h, n).set(E.h);
  heap(Uint8Array, b, n).set(E.base);
  ex.route(n, g.nStart, g.nbr, g.nDist, h, b, fill, rcv, rcvD, order, done, hk, hv, wander | 0, salt >>> 0, E.flatK || 0);
  E.fill.set(heap(Float64Array, fill, n));
  E.rcv.set(heap(Int32Array, rcv, n));
  E.rcvD.set(heap(Float64Array, rcvD, n));
  E.order.set(heap(Int32Array, order, n));
  return true;
}

// gpu/itile.js runInt() on wasm (integers, pass for pass: the same tile bit for bit), given the
// tables runInt built (gridTables, hardTables, apowTable): { h, talus } or null if unavailable
export function runIntNative(T, t) {
  if (!native()) return null;
  const { NG, n } = T;
  // (a tile's arrays want the room: the grids' resident tables go, and come back when next used)
  grids = []; ex.arena_reset(base);
  const i32 = (len) => alloc(4 * len), u8 = (len) => alloc(len), u16 = (len) => alloc(2 * len);
  const flags = u8(n), hd = u8(n), h = i32(n), B = i32(n), a = i32(n), D = i32(n * 8), W = u16(n * 8), CM = i32(n * 2), CE = i32(n * 2);
  const KH = i32(256), KD = i32(256), SC = i32(256), AP = i32(t.AP.length), Acu = u16(n);
  const g = T.geo, colHd = g ? u8(g.colHd.length) : 0, suite = g ? u8(n) : 0, bedOff = g ? i32(n) : 0, weak = g ? u8(n) : 0;
  const h2 = i32(n), F = i32(n), F2 = i32(n), A = i32(n), A2 = i32(n), rcv = u8(n), talus = i32(n);
  const al = i32(n), al2 = i32(n), be = i32(n), be2 = i32(n), pt = i32(n), pt2 = i32(n);
  const PB = T.sig <= 6 ? 4 : 8, NB = Math.ceil(NG / PB), M = i32(NB * NB), M2 = i32(NB * NB);
  heap(Uint8Array, flags, n).set(T.flags); heap(Uint8Array, hd, n).set(T.hd);
  heap(Int32Array, h, n).set(T.h0); heap(Int32Array, B, n).set(T.B); heap(Uint32Array, a, n).set(T.a);
  heap(Uint32Array, D, n * 8).set(t.D); heap(Uint16Array, W, n * 8).set(t.W); heap(Uint32Array, CM, n * 2).set(t.CM); heap(Int32Array, CE, n * 2).set(t.CE);
  heap(Uint32Array, KH, 256).set(t.KH); heap(Uint32Array, KD, 256).set(t.KD); heap(Uint32Array, SC, 256).set(t.SC); heap(Uint32Array, AP, t.AP.length).set(t.AP);
  heap(Uint16Array, Acu, n).set(T.Acu);
  if (g) { heap(Uint8Array, colHd, g.colHd.length).set(g.colHd); heap(Uint8Array, suite, n).set(g.suite); heap(Int32Array, bedOff, n).set(g.bedOff); heap(Uint8Array, weak, n).set(g.weak); }
  // (a step a call: after the first few, the engine's optimised compile runs them)
  let cur = h, other = h2;
  for (let st = 0; st < T.steps; st++) {
    const hp = ex.run_int(NG, st, st + 1, st === 0 ? 1 : 0, T.rise, T.K0 > 0 ? 1 : 0, T.salt >>> 0, T.sig, flags, hd, cur, B, a, D, W, CM, CE, KH, KD, SC, AP, Acu,
      colHd, g ? g.colLo : 0, suite, bedOff, weak, other, F, F2, A, A2, rcv, talus, al, al2, be, be2, pt, pt2, M, M2);
    if (hp !== cur) { other = cur; cur = hp; }
  }
  const out = { h: Int32Array.from(heap(Int32Array, cur, n)), talus: Int32Array.from(heap(Int32Array, talus, n)) };
  ex.arena_reset(base);
  return out;
}
