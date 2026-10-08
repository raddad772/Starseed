import * as THREE from 'three';
// Same scene/camera/world state, consecutive renders. Load in an owned test tab.
// const compare = await import('/tools/webgpu-compare.js'); await compare.capture(game);
export async function capture(game) {
  const engine = game.engine, gpu = await engine.webgpuReady;
  if (!gpu) throw new Error('Open the game with ?webglReference=1&workers=2');
  const { sky, atmos } = engine.frameInputs || {};
  if (!sky || !atmos) throw new Error('Render a game frame before comparing');
  if (engine.views.length !== 1 || engine.view.out) throw new Error('Parity capture currently requires one on-screen view');
  // Anchor both eyes to the same incident light. Their visible objects differ
  // with ambient occlusion, so separate metering would hide shading differences.
  const saved = [engine.meterUp, engine.meterDown];
  let webgl, webgpu;
  try {
    engine.meterUp = engine.meterDown = 0;
    engine.view.adaptReset = true;
    engine._render(0, sky, atmos, true);
    webgl = engine.renderer.domElement.toDataURL('image/png');
    engine.view.adaptReset = true;
    gpu.render(engine);
    webgpu = await gpu.captureURL();
  } finally {
    [engine.meterUp, engine.meterDown] = saved;
    engine.view.adaptReset = true;
  }
  const cv = document.createElement('canvas');
  const load = (url) => new Promise((resolve, reject) => { const im = new Image(); im.onload = () => resolve(im); im.onerror = reject; im.src = url; });
  const [left, right] = await Promise.all([load(webgl), load(webgpu)]);
  cv.width = left.width + right.width; cv.height = Math.max(left.height, right.height) + 32;
  const ctx = cv.getContext('2d'); ctx.fillStyle = '#111'; ctx.fillRect(0, 0, cv.width, cv.height);
  ctx.fillStyle = '#fff'; ctx.font = '16px sans-serif';
  ctx.fillText('WebGL reference · fixed incident-light exposure', 10, 22); ctx.fillText('WebGPU · same exposure', left.width + 10, 22);
  ctx.drawImage(left, 0, 32); ctx.drawImage(right, left.width, 32);
  return { exposure: 'incident-light anchor', webgl, webgpu, sideBySide: cv.toDataURL('image/png'), stats: gpu.stats };
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
      const drainedMs = med(ms);
      const rawPasses = Object.fromEntries(Object.keys(gpu.timer.last).map((key) => [key, med(pass.map((p) => p[key]))]));
      const plausible = Object.values(rawPasses).reduce((a,b)=>a+b,0) <= drainedMs * 1.25;
      samples.push({ flat, drainedMs, passes: rawPasses, timestampsPlausible: plausible });
    }
    return { samples, timestampQuery: gpu.timestamp, note: 'Timestamp scopes can overlap on this adapter; drained totals include all passes. Full/flat still runs the atmosphere and post.', size: [engine.width, engine.height], ...gpu.stats };
  } finally { gpu.flat = oldFlat; }
}

export async function measureCulling(game,frames=7){
 const E=game.engine,gpu=await E.webgpuReady,main=gpu.opaque.culler,shadow=gpu.shadows.geometry.culler;
 const saved=[main.enabled,shadow.enabled,E.meterUp,E.meterDown];const samples=[];let uncullPixels,cullPixels;
 try{
  E.meterUp=E.meterDown=0;
  for(const enabled of [false,true,false]){
   main.enabled=shadow.enabled=enabled;const ms=[];
   for(let i=0;i<frames+3;i++){E.view.adaptReset=true;await gpu.device.queue.onSubmittedWorkDone();const start=performance.now();gpu.render(E);await gpu.device.queue.onSubmittedWorkDone();if(i>=3)ms.push(performance.now()-start);}
   samples.push({enabled,drainedMs:ms.sort((a,b)=>a-b)[ms.length>>1]});
   const shot=await gpu.capture();if(enabled)cullPixels=shot.pixels;else if(!uncullPixels)uncullPixels=shot.pixels;
  }
  let changed=0,maxDelta=0,sum=0;for(let i=0;i<cullPixels.length;i+=4){let delta=0;for(let c=0;c<3;c++){const d=Math.abs(cullPixels[i+c]-uncullPixels[i+c]);delta=Math.max(delta,d);sum+=d;}if(delta>2)changed++;maxDelta=Math.max(maxDelta,delta);}
  return {samples,changedPixelFraction:changed/(cullPixels.length/4),meanChannelDelta:sum/(cullPixels.length/4*3),maxDelta,note:'Same scene, camera and uniforms; includes main-view and shadow instance culling.'};
 }finally{[main.enabled,shadow.enabled,E.meterUp,E.meterDown]=saved;E.view.adaptReset=true;}
}

// Explicit test-only comparison: drain the GL queue with a real pixel read,
// then repeat native drawing in the same load. Includes CPU submission cost.
export async function measureReference(game,frames=5){
 const E=game.engine;if(!E._render)return null;const {sky,atmos}=E.frameInputs,gpu=await E.webgpuReady,result=[];
 for(const backend of ['webgpu','webgl','webgpu']){
  const samples=[],pixel=new Float32Array(4);
  for(let i=0;i<frames+3;i++){
   await gpu.device.queue.onSubmittedWorkDone();const start=performance.now();
   if(backend==='webgl'){pixel.fill(NaN);E._render(0,sky,atmos,true);E.renderer.readRenderTargetPixels(E.view.rtAdapt[E.view.adaptIdx],0,0,1,1,pixel);if(pixel.every(Number.isNaN))throw Error('Reference timing readback did not complete');}
   else{gpu.render(E);await gpu.device.queue.onSubmittedWorkDone();}
   if(i>=3)samples.push(performance.now()-start);
  }
  result.push({backend,drainedMs:samples.sort((a,b)=>a-b)[samples.length>>1]});
 }
 return {samples:result,note:'Same-load full-frame medians, including CPU submission. Native includes GTAO and material contact processing.'};
}

export async function measureOptimizations(game,frames=9,live=false){
 const E=game.engine,gpu=await E.webgpuReady,saved=[gpu.optimizationsEnabled,E.meterUp,E.meterDown],samples=[];
 let before,after;const look=live&&game.debugFree?game.freecam.quatF.clone():null;
 try{
  E.meterUp=E.meterDown=0;
  for(const enabled of [false,true,false]){
   gpu.setOptimizations(enabled);const elapsed=[],cpu=[],counts=[],pass=[];
   for(let i=0;i<frames+3;i++){
    await gpu.device.queue.onSubmittedWorkDone();E.view.adaptReset=true;
    const start=performance.now();
    if(live){if(look)game.freecam.quatF.copy(look).multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),0.06*Math.sin(i*0.4)));game.frame(performance.now());}else gpu.render(E);
    const submission=performance.now()-start;await gpu.device.queue.onSubmittedWorkDone();const drained=performance.now()-start;await gpu.timingReady;
    if(i>=3){elapsed.push(drained);cpu.push(submission);counts.push({...gpu.stats.optimizations});pass.push({...gpu.timer.last});}
   }
   const median=a=>a.sort((a,b)=>a-b)[a.length>>1];
   samples.push({enabled,drainedMs:median(elapsed),submitMs:median(cpu),counters:Object.fromEntries(['uniformWrites','uniformBytes','uniformSkips','instanceCopyBytes'].map(k=>[k,median(counts.map(x=>x[k]))])),passes:Object.fromEntries([...new Set(pass.flatMap(p=>Object.keys(p)))].map(k=>[k,median(pass.map(p=>p[k]||0))])),coverage:gpu.timer.coverage,cpuStages:gpu.stats.cpu});
   if(!live){const shot=await gpu.capture();if(enabled)after=shot.pixels;else if(!before)before=shot.pixels;}
  }
  let changed=0,maxDelta=0,sum=0;if(before)for(let i=0;i<before.length;i+=4){let delta=0;for(let c=0;c<3;c++){const d=Math.abs(before[i+c]-after[i+c]);delta=Math.max(delta,d);sum+=d;}if(delta>2)changed++;maxDelta=Math.max(maxDelta,delta);}
  return {live,cameraSweep:!!look,samples,...(before?{changedPixelFraction:changed/(before.length/4),meanChannelDelta:sum/(before.length/4*3),maxDelta}:{}),note:'Same-load A/B/A, warmed medians; drained totals include transfers and CPU submission. Timestamp sums are diagnostic, not total GPU latency.'};
 }finally{gpu.setOptimizations(saved[0]);[E.meterUp,E.meterDown]=saved.slice(1);if(look){game.freecam.quatF.copy(look);game.freecam.sync();}E.view.adaptReset=true;}
}
