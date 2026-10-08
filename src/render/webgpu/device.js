// Raw WebGPU ownership. No renderer singleton: the tile workers have their own devices.
const canvasOwners = new WeakMap();
export async function createDevice(canvas, onError, signal) {
  signal?.throwIfAborted();
  if (!navigator.gpu) throw new Error('WebGPU is unavailable in this browser.');
  const adapter = await navigator.gpu.requestAdapter({ powerPreference: 'high-performance' });
  if (!adapter) throw new Error('No WebGPU adapter is available.');
  const timestamp = adapter.features.has('timestamp-query');
  const device = await adapter.requestDevice({
    label: 'Starseed renderer',
    requiredFeatures: timestamp ? ['timestamp-query'] : [],
  });
  if (signal?.aborted) { device.destroy(); signal.throwIfAborted(); }
  device.addEventListener('uncapturederror', (event) => onError(event.error));
  device.lost.then((info) => { if (info.reason !== 'destroyed') onError(new Error(`WebGPU device lost: ${info.message}`)); });
  const context = canvas.getContext('webgpu');
  if (!context) { device.destroy(); throw new Error('Could not create a WebGPU canvas context.'); }
  const format = navigator.gpu.getPreferredCanvasFormat();
  context.configure({ device, format, alphaMode: 'opaque', usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC | GPUTextureUsage.COPY_DST });
  canvasOwners.set(canvas, device);
  const releaseContext = () => {
    if (canvasOwners.get(canvas) === device) { context.unconfigure(); canvasOwners.delete(canvas); }
  };
  return { adapter, device, context, format, timestamp, releaseContext };
}

export function bufferWithData(device, label, data, usage) {
  const buffer = device.createBuffer({ label, size: Math.max(4, Math.ceil(data.byteLength / 4) * 4), usage, mappedAtCreation: true });
  new Uint8Array(buffer.getMappedRange()).set(new Uint8Array(data.buffer, data.byteOffset, data.byteLength));
  buffer.unmap();
  return buffer;
}

export async function shaderModule(device, label, code) {
  const module = device.createShaderModule({ label, code });
  const info = await module.getCompilationInfo();
  const errors = info.messages.filter((m) => m.type === 'error');
  if (errors.length) throw new Error(`${label}:\n${errors.map((m) => `${m.lineNum}:${m.linePos}: ${m.message}`).join('\n')}`);
  return module;
}

// Copy while the texture is current; the mapped bytes remain valid between animation frames.
export async function readRGBA(device, texture, width, height, format = 'rgba8unorm') {
  const bytesPerRow = Math.ceil(width * 4 / 256) * 256;
  const buffer = device.createBuffer({ label: 'frame readback', size: bytesPerRow * height, usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ });
  try {
    const encoder = device.createCommandEncoder({ label: 'frame readback' });
    encoder.copyTextureToBuffer({ texture }, { buffer, bytesPerRow }, [width, height]);
    device.queue.submit([encoder.finish()]);
    await buffer.mapAsync(GPUMapMode.READ);
    const mapped = new Uint8Array(buffer.getMappedRange());
    const pixels = new Uint8ClampedArray(width * height * 4);
    for (let y = 0; y < height; y++) pixels.set(mapped.subarray(y * bytesPerRow, y * bytesPerRow + width * 4), y * width * 4);
    if (format.startsWith('bgra')) for (let i = 0; i < pixels.length; i += 4) { const r = pixels[i]; pixels[i] = pixels[i + 2]; pixels[i + 2] = r; }
    buffer.unmap();
    return { pixels, width, height };
  } finally { buffer.destroy(); }
}

const timers=new WeakMap();
export const timestampWrites=(device,label)=>timers.get(device)?.writes(label);
export class PassTimer {
  constructor(device, enabled, maxPasses = 128) {
    this.device = device; this.enabled = enabled; this.maxPasses = maxPasses;
    this.last = {}; this.pending = false; this.active = false; timers.set(device,this);
    if (!enabled) return;
    this.query = device.createQuerySet({ type: 'timestamp', count: maxPasses * 2 });
    this.resolve = device.createBuffer({ size: maxPasses * 16, usage: GPUBufferUsage.QUERY_RESOLVE | GPUBufferUsage.COPY_SRC });
    this.read = device.createBuffer({ size: maxPasses * 16, usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ });
  }
  begin() { this.labels = []; this.dropped = 0; this.active = this.enabled && !this.pending && !this.disposed; }
  writes(label) {
    if (!this.active) return undefined;
    if(this.labels.length >= this.maxPasses){this.dropped++;return undefined;}
    const i = this.labels.length * 2; this.labels.push(label);
    return { querySet: this.query, beginningOfPassWriteIndex: i, endOfPassWriteIndex: i + 1 };
  }
  finish(encoder) {
    if (!this.active || !this.labels.length) return false;
    encoder.resolveQuerySet(this.query, 0, this.labels.length * 2, this.resolve, 0);
    encoder.copyBufferToBuffer(this.resolve, 0, this.read, 0, this.labels.length * 16);
    this.pending = true; this.active = false;
    this.sampleLabels=[...this.labels];this.sampleDropped=this.dropped;
    return true;
  }
  async harvest() {
    const labels = this.sampleLabels;
    try {
      await this.read.mapAsync(GPUMapMode.READ);
      if(this.disposed)return;
      const values = new BigUint64Array(this.read.getMappedRange());
      const out = {}, intervals = [];
      labels.forEach((label, i) => { const a=values[i*2],b=values[i*2+1];if(b>=a){out[label]=(out[label]||0)+Number(b-a)/1e6;intervals.push([a,b]);} });
      // Some Metal/Dawn paths report overlapping command-buffer intervals for
      // separate passes. Their sum is not GPU frame time. Report interval union
      // and explicitly flag that per-pass attribution is unavailable there.
      intervals.sort((a,b)=>a[0]<b[0]?-1:a[0]>b[0]?1:0);
      let union=0n,lo=0n,hi=0n,overlap=false;
      for(const [a,b] of intervals){if(b===a)continue;if(hi&&a<hi){overlap=true;if(b>hi)hi=b;}else{union+=hi-lo;lo=a;hi=b;}}
      union+=hi-lo;this.gpuMs=Number(union)/1e6;this.passAttributionReliable=!overlap&&intervals.length===labels.length&&!this.sampleDropped;

      this.last = out; this.coverage={passes:labels.length,dropped:this.sampleDropped,passAttributionReliable:this.passAttributionReliable,gpuIntervalUnionMs:this.gpuMs};
      this.read.unmap();
    } catch(error) {
      // Destroying a renderer cancels its pending telemetry readback. A failure
      // on a live device still reaches the renderer's normal error handler.
      if(!this.disposed)throw error;
    } finally { this.pending = false; }
  }
  dispose() { this.disposed=true;this.active=false;timers.delete(this.device);this.query?.destroy(); this.resolve?.destroy(); this.read?.destroy(); }
}
