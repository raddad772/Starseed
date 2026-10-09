// The k-th smallest of a (reordered in place), as Float64Array.from(a).sort()[k] gives it, by
// Hoare's selection: a few passes over it, not a sort (sea levels and cut-offs read one value).
export function kth(a, k) {
  let lo = 0, hi = a.length - 1;
  while (hi > lo) {
    const x = a[(lo + hi) >> 1]; let i = lo, j = hi;
    while (i <= j) { while (a[i] < x) i++; while (a[j] > x) j--; if (i <= j) { const t = a[i]; a[i] = a[j]; a[j] = t; i++; j--; } }
    if (k <= j) hi = j; else if (k >= i) lo = i; else return a[k];
  }
  return a[k];
}
