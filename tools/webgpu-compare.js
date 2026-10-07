// Same scene/camera/world state, consecutive renders. Load in an owned test tab.
// const compare = await import('/tools/webgpu-compare.js'); await compare.capture(game);
export async function capture(game) {
  const engine = game.engine, gpu = await engine.webgpuReady;
  if (!gpu) throw new Error('Open the game with ?renderer=webgpu&workers=2');
  const { sky, atmos } = engine.frameInputs || {};
  if (!sky || !atmos) throw new Error('Render a game frame before comparing');
  if (engine.views.length !== 1 || engine.view.out) throw new Error('Parity capture currently requires one on-screen view');
  engine._render(0, sky, atmos, true);
  const webgl = engine.renderer.domElement.toDataURL('image/png');
  gpu.render(engine);
  const webgpu = await gpu.captureURL();
  const cv = document.createElement('canvas');
  const load = (url) => new Promise((resolve, reject) => { const im = new Image(); im.onload = () => resolve(im); im.onerror = reject; im.src = url; });
  const [left, right] = await Promise.all([load(webgl), load(webgpu)]);
  cv.width = left.width + right.width; cv.height = Math.max(left.height, right.height) + 32;
  const ctx = cv.getContext('2d'); ctx.fillStyle = '#111'; ctx.fillRect(0, 0, cv.width, cv.height);
  ctx.fillStyle = '#fff'; ctx.font = '16px sans-serif';
  ctx.fillText('WebGL reference', 10, 22); ctx.fillText('WebGPU (migration in progress)', left.width + 10, 22);
  ctx.drawImage(left, 0, 32); ctx.drawImage(right, left.width, 32);
  return { webgl, webgpu, sideBySide: cv.toDataURL('image/png'), stats: gpu.stats };
}

export async function measure(game, frames = 12) {
  const engine = game.engine, gpu = await engine.webgpuReady;
  if (!gpu) throw new Error('WebGPU renderer is not active');
  const samples = [], oldFlat = gpu.flat;
  try {
    for (const flat of [false, true, false]) {
      gpu.flat = flat;
      const ms = [], pass = [];
      for (let i = 0; i < frames + 2; i++) {
        await gpu.device.queue.onSubmittedWorkDone();
        const start = performance.now(); gpu.render(engine);
        await gpu.device.queue.onSubmittedWorkDone();
        const drained = performance.now() - start;
        await gpu.timingReady;
        if (i > 1) { ms.push(drained); pass.push({ ...gpu.timer.last }); }
      }
      const med = (a) => a.sort((a, b) => a - b)[a.length >> 1];
      samples.push({ flat, drainedMs: med(ms), passes: Object.fromEntries(Object.keys(gpu.timer.last).map((key) => [key, med(pass.map((p) => p[key]))])) });
    }
    return { samples, timestampQuery: gpu.timestamp, size: [engine.width, engine.height], ...gpu.stats };
  } finally { gpu.flat = oldFlat; }
}
