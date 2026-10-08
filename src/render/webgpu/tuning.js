// Per-device switches allow same-load, same-image optimization comparisons.
const states = new WeakMap();
export function tuning(device) {
  let state = states.get(device);
  if (!state) { state = { enabled: true, uniformWrites: 0, uniformBytes: 0, uniformSkips: 0, instanceCopyBytes: 0 }; states.set(device, state); }
  return state;
}
export function resetCounters(device) {
  const state = tuning(device);
  for (const key of ['uniformWrites', 'uniformBytes', 'uniformSkips', 'instanceCopyBytes']) state[key] = 0;
}
