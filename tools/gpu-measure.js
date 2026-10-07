// GPU cost of the frame's passes and of the opaque scene's lighting, in a test tab (never Dave's).
// Load the game (?workers=2), let the view settle, then:
//   const src = await (await fetch('/tools/gpu-measure.js')).text(); (0, eval)(src);
//   await window._M.passes()          // ms a pass, the GPU drained between passes (each includes its CPU submit)
//   await window._M.lighting('label') // the opaque scene: GPU ms with lighting, without it ("flat"), and the
//                                     // fragments shaded a covered pixel (early depth rejection as it is)
// How: a sync readback of a 1x1 target waits for all queued GPU work (gl.finish doesn't, in Chrome); the
// time from submit to that readback is the GPU work still queued. "flat" patches every surface's final
// output to its albedo, so the compiler drops the lighting; the count patches it to a constant added per
// fragment (blending one to one, depth testing as drawn) and reads the HDR target back. Compare A and B
// inside one load: the GPU's speed varies between loads. Written for the three.js WebGL renderer
// (2026-10-07, WEBGPU.md); the same measurements are what the WebGPU renderer should be held to.
(() => {
  const gm = window.game, E = gm.engine, r = E.renderer, THREE = window.THREE;
  const yieldNow = window._yield || (() => new Promise((res) => setTimeout(res, 0)));
  const tiny = new THREE.WebGLRenderTarget(1, 1), buf = new Uint8Array(4);
  const drain = () => { r.setRenderTarget(tiny); r.clear(); r.readRenderTargetPixels(tiny, 0, 0, 1, 1, buf); };
  const V = () => E.view;
  const scenePass = () => { const v = V(); r.setRenderTarget(v.rtScene); r.setClearColor(0x000000, 1); r.clear(true, true, false); r.render(E.scene, v.camera); };
  const med = (a) => { const s = [...a].sort((x, y) => x - y); return +s[s.length >> 1].toFixed(2); };
  const split = (n = 14) => {
    const sub = [], wait = [];
    for (let i = 0; i < n; i++) { drain(); const t0 = performance.now(); scenePass(); const t1 = performance.now(); drain(); const t2 = performance.now(); if (i >= 2) { sub.push(t1 - t0); wait.push(t2 - t1); } }
    return { submit: med(sub), wait: med(wait) };
  };
  const warm = async () => { for (let i = 0; i < 5; i++) { scenePass(); drain(); await yieldNow(); } };
  const mats = () => { const s = new Set(); E.scene.traverse((o) => { if (o.material) for (const m of Array.isArray(o.material) ? o.material : [o.material]) s.add(m); }); return s; };
  const orig = new Map();
  const OUT = [['gl_FragColor = vec4(color, 1.0);\n}', 'albedo'], ['gl_FragColor = vec4(c, 1.0);\n}', 'albedo']];
  const patch = (mode) => {
    let n = 0;
    for (const m of mats()) {
      if (!orig.has(m)) orig.set(m, { fs: m.fragmentShader, obc: m.onBeforeCompile, key: m.customProgramCacheKey, blending: m.blending, bs: m.blendSrc, bd: m.blendDst, be: m.blendEquation });
      const o = orig.get(m);
      if (m.isShaderMaterial) {
        const fs = o.fs, hit = OUT.find(([a]) => fs.lastIndexOf(a) >= 0);
        if (!hit) continue;
        const i = fs.lastIndexOf(hit[0]);
        const out = mode === 'flat' ? `gl_FragColor = vec4(${hit[1]}, 1.0);\n}` : 'gl_FragColor = vec4(1.0 / 64.0, 0.0, 0.0, 1.0);\n}';
        m.fragmentShader = fs.slice(0, i) + out + fs.slice(i + hit[0].length);
      } else if (m.isMeshStandardMaterial) {
        const prev = o.obc, out = mode === 'flat' ? 'gl_FragColor = vec4(diffuseColor.rgb, 1.0); return;' : 'gl_FragColor = vec4(1.0 / 64.0, 0.0, 0.0, 1.0); return;';
        m.onBeforeCompile = (sh, rr) => { if (prev) prev.call(m, sh, rr); sh.fragmentShader = sh.fragmentShader.replace('#include <color_fragment>', '#include <color_fragment>\n  ' + out); };
        const k0 = o.key ? o.key.call(m) : '';
        m.customProgramCacheKey = () => k0 + '|M' + mode;
      } else continue;
      if (mode === 'count') { m.blending = THREE.CustomBlending; m.blendSrc = THREE.OneFactor; m.blendDst = THREE.OneFactor; m.blendEquation = THREE.AddEquation; }
      m.needsUpdate = true; n++;
    }
    return n;
  };
  const restore = () => { for (const [m, o] of orig) { m.fragmentShader = o.fs; m.onBeforeCompile = o.obc; m.customProgramCacheKey = o.key; m.blending = o.blending; m.blendSrc = o.bs; m.blendDst = o.bd; m.blendEquation = o.be; m.needsUpdate = true; } orig.clear(); };
  const readCount = () => {
    const v = V(), W = v.rtScene.width, H = v.rtScene.height, px = new Uint16Array(W * H * 4);
    r.readRenderTargetPixels(v.rtScene, 0, 0, W, H, px);
    const h2f = (h) => { const s = h >> 15, e = (h >> 10) & 31, f = h & 1023; return (s ? -1 : 1) * (e === 0 ? f / 1024 * 2 ** -14 : 2 ** (e - 15) * (1 + f / 1024)); };
    let sum = 0, cov = 0; const hist = new Array(12).fill(0);
    for (let i = 0; i < W * H; i += 3) { const c = Math.round(h2f(px[i * 4]) * 64); if (c > 0) { sum += c; cov++; hist[Math.min(11, c)]++; } }
    return { perCovered: +(sum / Math.max(cov, 1)).toFixed(2), covered: +(cov / (W * H / 3)).toFixed(3), hist };
  };
  window._M = {
    drain, scenePass, split, patch, restore, readCount,
    async lighting(label) {
      await warm(); const a = split(); const calls = r.info.render.calls, tris = r.info.render.triangles;
      patch('flat'); await warm(); const f = split();
      restore(); await warm(); const b = split();
      patch('count'); await warm(); scenePass(); const od = readCount();
      restore(); await warm();
      return { label, full: a, flat: f, full2: b, lightingGPU: +(((a.wait + b.wait) / 2) - f.wait).toFixed(2), calls, tris, overdraw: od, depthMode: E.depthMode, size: [V().width, V().height] };
    },
    async passes(frames = 9) {
      const ob = E.passBegin, oe = E.passEnd, acc = {}; let cur = null, t0 = 0;
      E.passBegin = function (name) { drain(); cur = name; t0 = performance.now(); return ob.call(this, name); };
      E.passEnd = function () { const res = oe.call(this); drain(); if (cur) (acc[cur] = acc[cur] || []).push(performance.now() - t0); cur = null; return res; };
      const tot = [];
      try { for (let i = 0; i < frames; i++) { drain(); const a = performance.now(); gm.frame(performance.now()); drain(); tot.push(performance.now() - a); await yieldNow(); } } finally { E.passBegin = ob; E.passEnd = oe; }
      const out = {}; for (const k in acc) out[k] = med(acc[k].slice(2)); out.TOTAL_drained = med(tot.slice(2));
      return out;
    },
  };
  return 'gpu-measure ready';
})();
