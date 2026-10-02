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
  ex.route(n, g.nStart, g.nbr, g.nDist, h, b, fill, rcv, rcvD, order, done, hk, hv, wander ? 1 : 0, salt >>> 0);
  E.fill.set(heap(Float64Array, fill, n));
  E.rcv.set(heap(Int32Array, rcv, n));
  E.rcvD.set(heap(Float64Array, rcvD, n));
  E.order.set(heap(Int32Array, order, n));
  return true;
}
