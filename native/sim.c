// Hot loops of the world simulation, compiled to WebAssembly (tools/build-wasm.sh;
// src/gen/worldsim/native.js loads it). Each kernel mirrors its JavaScript twin operation
// for operation: IEEE doubles, the same order of arithmetic, no fused multiply-add
// (-ffp-contract=off), ties broken the same way. So either path builds the same world,
// bit for bit, and the JavaScript stays as the reference and the fallback.
//
// Freestanding: no libc. Memory is one arena the JavaScript side lays out (arena_*).

typedef unsigned int u32;
typedef int i32;
typedef unsigned char u8;
typedef unsigned short u16;
typedef unsigned long long u64;

// ---- the arena: a bump allocator over linear memory, grown on demand
extern unsigned char __heap_base;
static unsigned long arena_top = 0;

__attribute__((export_name("arena_reset"))) void arena_reset(unsigned long to) {
  arena_top = to ? to : (unsigned long)&__heap_base;
}
__attribute__((export_name("arena_mark"))) unsigned long arena_mark(void) {
  if (!arena_top) arena_top = (unsigned long)&__heap_base;
  return arena_top;
}
__attribute__((export_name("arena_alloc"))) unsigned long arena_alloc(unsigned long bytes) {
  if (!arena_top) arena_top = (unsigned long)&__heap_base;
  unsigned long p = (arena_top + 15) & ~15UL;
  unsigned long end = p + bytes;
  unsigned long have = __builtin_wasm_memory_size(0) * 65536UL;
  if (end > have) {
    unsigned long pages = (end - have + 65535) / 65536;
    if (__builtin_wasm_memory_grow(0, pages) == (unsigned long)-1) return 0;
  }
  arena_top = end;
  return p;
}

// ---- hashing (core/rng.js fmix32, hashInts)
static u32 fmix32(u32 h) {
  h ^= h >> 16; h *= 0x85ebca6bu;
  h ^= h >> 13; h *= 0xc2b2ae35u;
  h ^= h >> 16;
  return h;
}
static u32 hash_ints(u32 a, u32 b, u32 c, u32 d) {
  return fmix32(fmix32(fmix32(fmix32(a) ^ b) ^ c) ^ d);
}

// ---- a binary min-heap of (key, cell), ties broken by cell index (erosion.js Heap)
static double *hk;
static i32 *hv;
static i32 hsize;
static double htop;

static inline int hless(i32 a, i32 b) {
  double ka = hk[a], kb = hk[b];
  return ka < kb || (ka == kb && hv[a] < hv[b]);
}
static inline void hswap(i32 a, i32 b) {
  double k = hk[a]; hk[a] = hk[b]; hk[b] = k;
  i32 v = hv[a]; hv[a] = hv[b]; hv[b] = v;
}
static inline void hpush(double key, i32 cell) {
  i32 i = hsize++;
  hk[i] = key; hv[i] = cell;
  while (i > 0) { i32 p = (i - 1) >> 1; if (!hless(i, p)) break; hswap(i, p); i = p; }
}
static inline i32 hpop(void) {
  i32 cell = hv[0];
  htop = hk[0];
  i32 n = --hsize;
  if (n > 0) {
    hk[0] = hk[n]; hv[0] = hv[n];
    i32 i = 0;
    for (;;) {
      i32 l = 2 * i + 1, r = l + 1, m = i;
      if (l < n && hless(l, m)) m = l;
      if (r < n && hless(r, m)) m = r;
      if (m == i) break;
      hswap(i, m); i = m;
    }
  }
  return cell;
}

// ---- erosion.js route(): the priority flood from the base level (filling every pit
// with a faint gradient, EPS a cell) and each cell's receiver down the filled surface
// (the steepest, or with wander a slope-weighted draw where the slope is real; wander 2 on
// the flats too: water finds its own way across a filled plain, not the grid's lines)
#define EPS 1e-4
__attribute__((export_name("route"))) i32 route(
    i32 n, const i32 *nStart, const i32 *nbr, const double *nDist,
    const double *h, const u8 *base,
    double *fill, i32 *rcv, double *rcvD, i32 *order,
    u8 *done, double *heapK, i32 *heapV, i32 wander, u32 salt, double flatK) {
  hk = heapK; hv = heapV; hsize = 0;
  for (i32 c = 0; c < n; c++) done[c] = 0;
  for (i32 c = 0; c < n; c++) if (base[c]) { fill[c] = h[c]; hpush(h[c], c); done[c] = 1; }
  i32 k = 0;
  while (hsize) {
    i32 c = hpop();
    double z = htop;
    order[k++] = c;
    for (i32 e = nStart[c]; e < nStart[c + 1]; e++) {
      i32 o = nbr[e];
      if (done[o]) continue;
      done[o] = 1;
      // (the fill's faint gradient by the step's length when flatK is given: a distance across
      // the flat, not a count of steps, so it has no favoured directions)
      double ep = flatK > 0 ? EPS * nDist[e] * flatK : EPS;
      fill[o] = h[o] > z + ep ? h[o] : z + ep;
      hpush(fill[o], o);
    }
  }
  for (i32 c = 0; c < n; c++) {
    if (base[c]) { rcv[c] = -1; rcvD[c] = 0; continue; }
    i32 best = -1;
    double bs = 0, bd = 0, sum = 0;
    double fc = fill[c];
    for (i32 e = nStart[c]; e < nStart[c + 1]; e++) {
      i32 o = nbr[e];
      double s = (fc - fill[o]) / nDist[e];
      if (s > 0) sum += s;
      if (s > bs) { bs = s; best = o; bd = nDist[e]; }
    }
    if ((wander == 1 && bs > 1e-5) || (wander == 2 && bs > 0)) {
      double x = (double)hash_ints((u32)c, salt, 0, 0) / 4294967296.0 * sum;
      for (i32 e = nStart[c]; e < nStart[c + 1]; e++) {
        double s = (fc - fill[nbr[e]]) / nDist[e];
        if (s <= 0) continue;
        x -= s;
        if (x <= 0) { best = nbr[e]; bd = nDist[e]; break; }
      }
    }
    rcv[c] = best; rcvD[c] = bd;
  }
  return k;
}

// ---- tectonics.js blur(): neighbour averaging, iters times (the cell counts twice)
__attribute__((export_name("blur"))) void blur(
    i32 n, const i32 *nStart, const i32 *nbr, double *f, double *t, i32 iters) {
  for (i32 it = 0; it < iters; it++) {
    for (i32 c = 0; c < n; c++) {
      double s = f[c] * 2, w = 2;
      for (i32 e = nStart[c]; e < nStart[c + 1]; e++) { s += f[nbr[e]]; w++; }
      t[c] = s / w;
    }
    for (i32 c = 0; c < n; c++) f[c] = t[c];
  }
}

// ---- gpu/itile.js runInt(): the tile sim in integers, pass for pass (each a Jacobi gather over
// the 8 neighbours from the last pass's values). JavaScript's integer rules kept exactly: |0 and
// Int32Array stores wrap mod 2^32, >>> is unsigned, >> arithmetic, Math.trunc of a quotient
// rounds toward zero (C's /), Math.floor of a negative one down (fdiv). Products are taken in 64
// bits wherever JavaScript's doubles would hold them exactly.
static const i32 IDI[8] = { -1, 0, 1, -1, 1, -1, 0, 1 }, IDJ[8] = { -1, -1, -1, 0, 0, 1, 1, 1 };
static const i32 IDIAG[8] = { 1, 0, 1, 0, 0, 1, 0, 1 };
#define FMAX2 0x7fff0000
#define PONDQ 2048

static inline i32 mul16(i32 a, u32 b) {
  // Math.imul(a >> 16, b) + ((((a & 0xffff) * b) >>> 16) | 0) | 0
  u32 hi = (u32)(a >> 16) * b;
  u32 lo = ((u32)(a & 0xffff) * b) >> 16;
  return (i32)(hi + lo);
}
// a cell on the grid's edge (some of its neighbours missing: those passes check each one)
#define EDGE(i, j) ((i) == 0 || (j) == 0 || (i) == NG - 1 || (j) == NG - 1)
static inline i32 fdiv(i32 a, i32 b) { i32 q = a / b; return (a % b != 0 && ((a < 0) != (b < 0))) ? q - 1 : q; }
static inline i32 apow_index(u32 A) {
  i32 e = 31 - __builtin_clz(A);
  return (e << 8) | ((e >= 8 ? A >> (e - 8) : A << (8 - e)) & 255);
}

// (called a step or a few at a time, st0 .. st1: a long call stays in the engine's quick first
// compile, while the steps after the first few calls run in its optimised one; init on the first.
// The heights end in whichever of h and h2 the step's swaps left them: its address returned)
__attribute__((export_name("run_int"))) unsigned long run_int(
    i32 NG, i32 st0, i32 st1, i32 init, i32 rise, i32 streams, u32 salt0, i32 sig,
    u8 *flags, u8 *hd, i32 *h, const i32 *B, const u32 *a,
    const u32 *D, const u16 *W, const u32 *CM, const i32 *CE,
    const u32 *KH, const u32 *KD, const u32 *SC, const u32 *AP, const u16 *Acu,
    const u8 *colHd, i32 colLo, const u8 *suite, const i32 *bedOff, const u8 *weak,
    i32 *h2, i32 *F, i32 *F2, u32 *A, u32 *A2, u8 *rcv, i32 *talus,
    i32 *al, i32 *al2, u32 *be, u32 *be2, i32 *pt, i32 *pt2, i32 *M, i32 *M2) {
  const i32 n = NG * NG;
  i32 OFF[8];
  for (i32 k = 0; k < 8; k++) OFF[k] = IDJ[k] * NG + IDI[k];
  if (init) for (i32 c = 0; c < n; c++) { h2[c] = 0; F[c] = h[c]; A[c] = a[c]; rcv[c] = 8; talus[c] = 0; }
  const i32 PB = sig <= 6 ? 4 : 8, NB = (NG + PB - 1) / PB;
  i32 RB = (sig + PB / 2) / PB; if (RB < 1) RB = 1;   // Math.max(1, Math.round(sig / PB)) (sig, PB > 0)
  i32 *tp; u32 *tu;
  for (i32 st = st0; st < st1; st++) {
    // the mean held (every other step)
    if (st % 2 == 1) {
      for (i32 bj = 0; bj < NB; bj++) for (i32 bi = 0; bi < NB; bi++) {
        long long s = 0; i32 cnt = 0;
        i32 je = bj * PB + PB < NG ? bj * PB + PB : NG, ie = bi * PB + PB < NG ? bi * PB + PB : NG;
        for (i32 j = bj * PB; j < je; j++) for (i32 i = bi * PB; i < ie; i++) {
          i32 c = j * NG + i, d = h[c] - B[c];
          s += d > 16777215 ? 16777215 : d < -16777215 ? -16777215 : d; cnt++;
        }
        M[bj * NB + bi] = (i32)(s / cnt);
      }
      for (i32 pass = 0; pass < 3; pass++) for (i32 ax = 0; ax < 2; ax++) {
        for (i32 bj = 0; bj < NB; bj++) for (i32 bi = 0; bi < NB; bi++) {
          long long s = 0; i32 cnt = 0;
          for (i32 r = -RB; r <= RB; r++) {
            i32 xi = ax ? bi : bi + r, xj = ax ? bj + r : bj;
            if (xi < 0 || xj < 0 || xi >= NB || xj >= NB) continue;
            s += M[xj * NB + xi] >> 4; cnt++;
          }
          M2[bj * NB + bi] = (i32)((u32)(i32)(s / cnt) << 4);
        }
        for (i32 q = 0; q < NB * NB; q++) M[q] = M2[q];
      }
      const i32 P2 = 2 * PB;
      for (i32 j = 0; j < NG; j++) for (i32 i = 0; i < NG; i++) {
        i32 c = j * NG + i;
        if (flags[c] & 1) continue;
        i32 x = i * 2 + 1 - PB, y = j * 2 + 1 - PB;
        i32 b0i = fdiv(x, 2 * PB), b0j = fdiv(y, 2 * PB);
        i32 fx = x - b0i * 2 * PB, fy = y - b0j * 2 * PB;
        i32 i0 = b0i < 0 ? 0 : b0i > NB - 1 ? NB - 1 : b0i, i1 = b0i + 1 < 0 ? 0 : b0i + 1 > NB - 1 ? NB - 1 : b0i + 1;
        i32 j0 = b0j < 0 ? 0 : b0j > NB - 1 ? NB - 1 : b0j, j1 = b0j + 1 < 0 ? 0 : b0j + 1 > NB - 1 ? NB - 1 : b0j + 1;
        long long top = ((long long)M[j0 * NB + i0] * (P2 - fx) + (long long)M[j0 * NB + i1] * fx) / P2;
        long long bot = ((long long)M[j1 * NB + i0] * (P2 - fx) + (long long)M[j1 * NB + i1] * fx) / P2;
        i32 m = (i32)((top * (P2 - fy) + bot * fy) / P2);
        h[c] = (i32)((u32)h[c] - (u32)mul16(m, 19661));
      }
    }
    if (st == rise) for (i32 c = 0; c < n; c++) if (flags[c] & 2) flags[c] |= 1;
    // how hard each cell's rock is, as it stands now (a pyramid tile's columns)
    if (colHd) for (i32 c = 0; c < n; c++) {
      i32 z = (h[c] >> 12) + bedOff[c] - colLo;
      z = z < 0 ? 0 : z > 14999 ? 14999 : z;
      hd[c] = (u8)(((i32)colHd[suite[c] * 15000 + z] * (256 - (((i32)weak[c] * 179) >> 8))) >> 8);
    }
    if (streams) {
      // lakes' surfaces (the grid's inside row by row with its neighbours at fixed offsets, no
      // branches; its edge cells checked one by one)
      for (i32 p = 0; p < 8; p++) {
        for (i32 j = 0; j < NG; j++) {
          const i32 inner = j > 0 && j < NG - 1;
          for (i32 i = 0; i < NG; i++) {
            if (inner && i == 1) {
              const i32 c0 = j * NG;
              for (i32 c = c0 + 1; c < c0 + NG - 1; c++) {
                i32 m = F[c - NG - 1];
                i32 v1 = F[c - NG]; m = v1 < m ? v1 : m;
                v1 = F[c - NG + 1]; m = v1 < m ? v1 : m;
                v1 = F[c - 1]; m = v1 < m ? v1 : m;
                v1 = F[c + 1]; m = v1 < m ? v1 : m;
                v1 = F[c + NG - 1]; m = v1 < m ? v1 : m;
                v1 = F[c + NG]; m = v1 < m ? v1 : m;
                v1 = F[c + NG + 1]; m = v1 < m ? v1 : m;
                i32 v = m + 1, hc = h[c];
                i32 f = hc > v ? hc : v;
                F2[c] = (flags[c] & 1) ? hc : f;
              }
              i = NG - 2;
              continue;
            }
            i32 c = j * NG + i;
            if (flags[c] & 1) { F2[c] = h[c]; continue; }
            i32 m = 0x7fffffff;
            for (i32 k = 0; k < 8; k++) {
              i32 ii = i + IDI[k], jj = j + IDJ[k];
              if (ii < 0 || jj < 0 || ii >= NG || jj >= NG) continue;
              i32 v = F[jj * NG + ii]; if (v < m) m = v;
            }
            i32 v = m == 0x7fffffff ? h[c] : m + 1;
            F2[c] = h[c] > v ? h[c] : v;
          }
        }
        tp = F; F = F2; F2 = tp;
      }
      // receivers: the steepest way down the filled surface, or a draw weighted by slope
      u32 salt = hash_ints((u32)st, salt0, 0, 0);
      for (i32 j = 0; j < NG; j++) for (i32 i = 0; i < NG; i++) {
        i32 c = j * NG + i;
        if (flags[c] & 1) { rcv[c] = 8; continue; }
        i32 sl[8]; i32 best = 8, bs = 0; u32 sum = 0;
        const i32 edge = EDGE(i, j);
        for (i32 k = 0; k < 8; k++) {
          sl[k] = 0;
          i32 o;
          if (edge) { i32 ii = i + IDI[k], jj = j + IDJ[k]; if (ii < 0 || jj < 0 || ii >= NG || jj >= NG) continue; o = jj * NG + ii; }
          else o = c + OFF[k];
          i32 d = F[c] - F[o];
          if (d <= 0) continue;
          if (d > 1048576) d = 1048576;
          i32 s = (i32)(((long long)d * 1024) / (long long)D[c * 8 + k]);
          sl[k] = s > 134217727 ? 134217727 : s;
        }
        for (i32 k = 0; k < 8; k++) { i32 s = sl[k]; if (s > 0) sum += (u32)s; if (s > bs) { bs = s; best = k; } }
        if (bs >= 1) {
          u32 x = hash_ints((u32)c, salt, 0, 0) % sum;
          for (i32 k = 0; k < 8; k++) { i32 s = sl[k]; if (s <= 0) continue; if (x < (u32)s) { best = k; break; } x -= (u32)s; }
        }
        rcv[c] = (u8)best;
      }
      // the water through each cell (inside row by row, no branches: a neighbour's water counts
      // where it drains into this cell, slot 7 - k)
      for (i32 p = 0; p < 16; p++) {
        for (i32 j = 0; j < NG; j++) {
          const i32 inner = j > 0 && j < NG - 1;
          for (i32 i = 0; i < NG; i++) {
            if (inner && i == 1) {
              const i32 c0 = j * NG;
              for (i32 c = c0 + 1; c < c0 + NG - 1; c++) {
                u32 s = a[c];
                s += rcv[c - NG - 1] == 7 ? A[c - NG - 1] : 0;
                s += rcv[c - NG] == 6 ? A[c - NG] : 0;
                s += rcv[c - NG + 1] == 5 ? A[c - NG + 1] : 0;
                s += rcv[c - 1] == 4 ? A[c - 1] : 0;
                s += rcv[c + 1] == 3 ? A[c + 1] : 0;
                s += rcv[c + NG - 1] == 2 ? A[c + NG - 1] : 0;
                s += rcv[c + NG] == 1 ? A[c + NG] : 0;
                s += rcv[c + NG + 1] == 0 ? A[c + NG + 1] : 0;
                A2[c] = s;
              }
              i = NG - 2;
              continue;
            }
            i32 c = j * NG + i;
            u32 s = a[c];
            for (i32 k = 0; k < 8; k++) {
              i32 ii = i + IDI[k], jj = j + IDJ[k];
              if (ii < 0 || jj < 0 || ii >= NG || jj >= NG) continue;
              i32 o = jj * NG + ii;
              if (rcv[o] == 7 - k) s += A[o];
            }
            A2[c] = s;
          }
        }
        tu = A; A = A2; A2 = tu;
      }
      // streams cut: the implicit step solved down each river by pointer jumping
      for (i32 j = 0; j < NG; j++) for (i32 i = 0; i < NG; i++) {
        i32 c = j * NG + i;
        al[c] = h[c]; be[c] = 0; pt[c] = c;
        if (flags[c] & 1) continue;
        i32 k = rcv[c];
        if (k == 8 || F[c] - h[c] > PONDQ || A[c] < Acu[c]) continue;
        i32 r = (j + IDJ[k]) * NG + (i + IDI[k]);
        if (h[c] - h[r] <= 0) continue;
        i32 X = (i32)(KH[hd[c]] * AP[apow_index(A[c])]), t = IDIAG[k], e = CE[c * 2 + t];
        i32 f = mul16(X, CM[c * 2 + t]);
        f = e >= 0 ? (f > (FMAX2 >> e) ? FMAX2 : f << e) : f >> -e;
        u32 b = 65536u - (4294967295u / (u32)(65536 + f));
        be[c] = b > 65535 ? 65535 : b; pt[c] = r;
        al[c] = (i32)((u32)h[c] - (u32)mul16(h[c], be[c]));
      }
      for (i32 p = 0; p < 12; p++) {
        for (i32 c = 0; c < n; c++) {
          i32 q = pt[c];
          if (q == c || be[c] == 0) { al2[c] = al[c]; be2[c] = be[c]; pt2[c] = q; continue; }
          al2[c] = (i32)((u32)al[c] + (u32)mul16(al[q], be[c]));
          be2[c] = (be[c] * be[q]) >> 16;
          pt2[c] = pt[q];
        }
        tp = al; al = al2; al2 = tp; tu = be; be = be2; be2 = tu; tp = pt; pt = pt2; pt2 = tp;
      }
      for (i32 c = 0; c < n; c++) h2[c] = (i32)((u32)al[c] + (u32)mul16(h[pt[c]], be[c]));
      tp = h; h = h2; h2 = tp;
    }
    // soil creeps
    for (i32 j = 0; j < NG; j++) for (i32 i = 0; i < NG; i++) {
      i32 c = j * NG + i;
      h2[c] = h[c];
      if (flags[c] & 1) continue;
      i32 s = 0;
      const i32 edge = EDGE(i, j);
      for (i32 k = 0; k < 8; k++) {
        i32 o;
        if (edge) { i32 ii = i + IDI[k], jj = j + IDJ[k]; if (ii < 0 || jj < 0 || ii >= NG || jj >= NG) continue; o = jj * NG + ii; }
        else o = c + OFF[k];
        i32 d = h[o] - h[c];
        d = d > 4194304 ? 4194304 : d < -4194304 ? -4194304 : d;
        s += (d * (i32)W[c * 8 + k]) >> 8;
      }
      h2[c] = (i32)((u32)h[c] + (u32)mul16(s, KD[hd[c]]));
    }
    tp = h; h = h2; h2 = tp;
    // slopes collapse into the cells below (talus)
    for (i32 p = 0; p < 3; p++) {
      for (i32 j = 0; j < NG; j++) for (i32 i = 0; i < NG; i++) {
        i32 c = j * NG + i;
        i32 out = 0, inn = 0;
        const i32 edge = EDGE(i, j);
        for (i32 k = 0; k < 8; k++) {
          i32 o;
          if (edge) { i32 ii = i + IDI[k], jj = j + IDJ[k]; if (ii < 0 || jj < 0 || ii >= NG || jj >= NG) continue; o = jj * NG + ii; }
          else o = c + OFF[k];
          i32 d = (i32)(D[c * 8 + k] >> 6);
          if (!(flags[c] & 1)) { i32 ex = h[c] - h[o] - (i32)SC[hd[c]] * d; if (ex > 0) out += ex >> 4; }
          if (!(flags[o] & 1)) { i32 ex = h[o] - h[c] - (i32)SC[hd[o]] * d; if (ex > 0) inn += ex >> 4; }
        }
        h2[c] = h[c] - out + inn;
        talus[c] = (i32)((u32)talus[c] + (u32)inn);
      }
      tp = h; h = h2; h2 = tp;
    }
  }
  // (the heights end in whichever of the two buffers the last swap left them: its address)
  return (unsigned long)h;
}
