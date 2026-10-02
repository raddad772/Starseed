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
// (the steepest, or with wander a slope-weighted draw where the slope is real)
#define EPS 1e-4
__attribute__((export_name("route"))) i32 route(
    i32 n, const i32 *nStart, const i32 *nbr, const double *nDist,
    const double *h, const u8 *base,
    double *fill, i32 *rcv, double *rcvD, i32 *order,
    u8 *done, double *heapK, i32 *heapV, i32 wander, u32 salt) {
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
      fill[o] = h[o] > z + EPS ? h[o] : z + EPS;
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
    if (wander && bs > 1e-5) {
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
