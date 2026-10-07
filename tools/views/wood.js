// Test view: the wood at 18.66N 59.63W (SOL, ?workers=2&date=2026-10-06T23:08), player at the spawn; helpers
// _placeLL(lat, lon, headingDeg, ms), _placeBy(P, r, dist, pitch, ang, ms), _grab(name) (posts to the scratchpad's
// shot server, port 8799), _fastDrain(ms), _yield(). Load: (0, eval)(await (await fetch('/tools/views/wood.js')).text())
(async () => {
  const mc = new MessageChannel(); const waiting = [];
  mc.port1.onmessage = () => { const r = waiting.shift(); r && r(); };
  window._yield = () => new Promise((r) => { waiting.push(r); mc.port2.postMessage(0); });
  window._grab = async (name, T) => { const gm = window.game; for (let i = 0; i < 3; i++) gm.frame(T || performance.now()); const url = gm.canvas.toDataURL('image/png'); const r = await fetch('http://127.0.0.1:8799/', { method: 'POST', body: name + '|' + url }); return await r.text(); };
  const t0 = performance.now();
  while (!(window.game && window.game.universe) && performance.now() - t0 < 30000) await new Promise((r) => setTimeout(r, 300));
  const tk = await import('/tools/testkit.js'); await tk.ready();
  const S = await import('/tools/scenic.js'); S.setup(); window.S = S;
  const THREE = window.THREE = await import('three');
  window._fastDrain = async (ms) => { const gm = window.game, p = gm.pool, end = performance.now() + ms; const s0 = performance.now(); let lastF = 0; while (performance.now() < end) { const now = performance.now(); if (now - lastF > 300) { gm.frame(now); lastF = performance.now(); } p.pump(); if (performance.now() - s0 > 8000 && p.queue.length + p.inFlight === 0) break; await window._yield(); } return p.queue.length + p.inFlight; };
  const ws = window.game.worldSims; ws.request(3);
  { const t1 = performance.now(); let lastF = 0; while (performance.now() - t1 < 400000) { const st = ws.status.get(3), r = ws.refine.get(3); if (st === 'ready' && r && r.status === 'ready') break; const q = ws.queue, mine = q.filter((j) => j.id === 3), rest = q.filter((j) => j.id !== 3); if (mine.length) { q.length = 0; q.push(...mine, ...rest); ws._next(); } const now = performance.now(); if (now - lastF > 200) { window.game.frame(now); lastF = performance.now(); } await window._yield(); } }
  const gm = window.game, b = window._b = S.body(3);
  window._placeLL = async (lat, lon, headDeg, ms) => { const la = lat * Math.PI / 180, lo = lon * Math.PI / 180; const p = new THREE.Vector3(Math.cos(la) * Math.cos(lo), Math.sin(la), Math.cos(la) * Math.sin(lo)); const n2 = new THREE.Vector3(0, 1, 0).addScaledVector(p, -p.y).normalize(), e2 = new THREE.Vector3().crossVectors(n2, p).normalize(); const h = headDeg * Math.PI / 180; const head = n2.clone().multiplyScalar(Math.cos(h)).addScaledVector(e2, Math.sin(h)); gm.debugFree = false; gm.player.placeOnSurface(b, p, head); gm.player.pitch = -0.1; return await window._fastDrain(ms); };
  // stand dist m from body-fixed point P (radius r), facing it, at pitch; ang: which side
  window._placeBy = async (P, r, dist, pitch, ang = 0, ms = 25000) => { const up = P.clone().normalize(); const n2 = new THREE.Vector3(0, 1, 0).addScaledVector(up, -up.y).normalize(), e2 = new THREE.Vector3().crossVectors(n2, up).normalize(); const dir = n2.clone().multiplyScalar(Math.cos(ang)).addScaledVector(e2, Math.sin(ang)); const at = P.clone().addScaledVector(dir, dist + r).normalize(); const head = P.clone().sub(at.clone().multiplyScalar(P.length())); head.addScaledVector(at, -head.dot(at)).normalize(); gm.debugFree = false; gm.player.placeOnSurface(b, at, head); gm.player.pitch = pitch; const left = await window._fastDrain(ms); for (let i = 0; i < 40; i++) { gm.frame(performance.now()); await window._yield(); } if (window._T0 !== undefined) gm.t = window._T0; return left; };
  window._T0 = gm.t;
  window._left = await window._placeLL(18.66, -59.63, 40, 30000);
  window._goDone = true;
})().catch((e) => { window._goErr = String(e && e.stack || e); });
'started';
