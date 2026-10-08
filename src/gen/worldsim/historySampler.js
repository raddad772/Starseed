// Restore the history query method after structured-clone/IndexedDB storage.
export function attachHistorySampler(history) {
  history.at = (agoMyr, key) => {
    const {age,series}=history;
    const tt = age - agoMyr / 1000, ts = series.t;
    if (ts.length < 2) return ts.length ? series[key][0] : null;
    let lo = 0, hi = ts.length - 1;
    while (hi - lo > 1) { const m = (lo + hi) >> 1; if (ts[m] <= tt) lo = m; else hi = m; }
    const f = Math.max(0, Math.min(1, (tt - ts[lo]) / (ts[hi] - ts[lo] || 1)));
    return series[key][lo] * (1 - f) + series[key][hi] * f;
  };
  return history;
}
