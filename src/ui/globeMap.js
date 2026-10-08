// A world's map for the nav computer's globe (ui/screens/globe.js): its own colours and heights over
// the whole sphere (gen/portrait.js terrainGlobeMap), made once on a terrain worker after the world's
// sim and refinement are in (the ground as it is), kept with the world in the cache.
const W = 512, H = 256;

// the map, or null while it's being made (asked for once; it arrives on a later call)
export function globeMap(game, body) {
  const id = body.data.id, ws = game.worldSims;
  const st = game._globes || (game._globes = new Map());
  let e = st.get(id);
  if (e) return e.map;
  // (the ground as simulated: not before the world's sim and refinement are in)
  if (ws && (ws.status.get(id) !== 'ready' || ws.refine.get(id)?.status !== 'ready')) return null;
  e = { map: null };
  st.set(id, e);
  (async () => {
    const name = `globe${W}`, kept = ws ? await ws.kept(id, name) : null;
    if (kept && kept.rgb) { e.map = kept; return; }
    const r = await game.pool.submit({ type: 'globemap', body: id, w: W, h: H }, 40).promise;
    e.map = { w: r.w, h: r.h, rgb: r.rgb, elev: r.elev };
    if (ws) ws.keep(id, name, e.map);
  })().catch((err) => { console.warn('globe map', err); st.delete(id); });
  return null;
}
