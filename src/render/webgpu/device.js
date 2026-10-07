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

export class PassTimer {
  constructor(device, enabled, maxPasses = 16) {
    this.device = device; this.enabled = enabled; this.maxPasses = maxPasses;
    this.last = {}; this.pending = false;
    if (!enabled) return;
    this.query = device.createQuerySet({ type: 'timestamp', count: maxPasses * 2 });
    this.resolve = device.createBuffer({ size: maxPasses * 16, usage: GPUBufferUsage.QUERY_RESOLVE | GPUBufferUsage.COPY_SRC });
    this.read = device.createBuffer({ size: maxPasses * 16, usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ });
  }
  begin() { this.labels = []; this.active = this.enabled && !this.pending; }
  writes(label) {
    if (!this.active || this.labels.length >= this.maxPasses) return undefined;
    const i = this.labels.length * 2; this.labels.push(label);
    return { querySet: this.query, beginningOfPassWriteIndex: i, endOfPassWriteIndex: i + 1 };
  }
  finish(encoder) {
    if (!this.active || !this.labels.length) return false;
    encoder.resolveQuerySet(this.query, 0, this.labels.length * 2, this.resolve, 0);
    encoder.copyBufferToBuffer(this.resolve, 0, this.read, 0, this.labels.length * 16);
    this.pending = true;
    return true;
  }
  async harvest() {
    const labels = [...this.labels];
    try {
      await this.read.mapAsync(GPUMapMode.READ);
      const values = new BigUint64Array(this.read.getMappedRange());
      const out = {};
      labels.forEach((label, i) => { out[label] = Number(values[i * 2 + 1] - values[i * 2]) / 1e6; });
      this.last = out;
      this.read.unmap();
    } finally { this.pending = false; }
  }
  dispose() { this.query?.destroy(); this.resolve?.destroy(); this.read?.destroy(); }
}
