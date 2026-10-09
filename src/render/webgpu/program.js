import * as THREE from 'three';
import { shaderModule } from './device.js';
import { packUniforms, packUniformsReference } from './uniforms.js';
import { tuning } from './tuning.js';
// (textures read texel for texel: depths and the shadow atlas)
const NEAREST = new Set(['tShadowAtlas', 'tDepth', 'tAtlas', 'tWaterDepth', 'tSceneDepth']);

// Uniform blocks are packed into pages (ProgramBindings.allocate) and each page's changed span written
// once, just before the queue's next submit: not a write a draw (a frame near the ground drew ~2600).
const PAGE_BYTES = 1 << 18, waiting = new WeakMap();
function pagesToWrite(device) {
  let set = waiting.get(device);
  if (set) return set;
  set = new Set(); waiting.set(device, set);
  const queue = device.queue, submit = queue.submit.bind(queue), write = queue.writeBuffer.bind(queue);
  queue.submit = (buffers) => {
    for (const p of set) { if (p.hi >= p.lo) write(p.buffer, p.lo * p.stride, p.cpu, p.lo * p.stride, (p.hi - p.lo + 1) * p.stride); p.lo = Infinity; p.hi = -1; }
    set.clear();
    return submit(buffers);
  };
  return set;
}
const dimension = (type) => ({ sampler2D: '2d', sampler2DArray: '2d-array', sampler3D: '3d', samplerCube: 'cube' })[type];
export class ProgramBindings {
  constructor(device, descriptor, textures, visibility = GPUShaderStage.FRAGMENT) {
    this.device = device; this.descriptor = descriptor; this.textures = textures; this.entries = new Map(); this.fallbacks = new Map();
    this.pages = []; this.align = device.limits?.minUniformBufferOffsetAlignment || 256; this.dirty = pagesToWrite(device);
    this.layout = device.createBindGroupLayout({ entries: [
      ...(descriptor.uniforms.length ? [{ binding: 0, visibility, buffer: { type: 'uniform' } }] : []),
      ...descriptor.textures.flatMap(t => [
        { binding: t.binding, visibility, texture: { viewDimension: dimension(t.type), sampleType: ['tShadowAtlas', 'tDepth', 'tAtlas', 'tWaterDepth', 'tSceneDepth'].includes(t.name) ? 'unfilterable-float' : 'float' } },
        { binding: t.samplerBinding, visibility, sampler: { type: ['tShadowAtlas', 'tDepth', 'tAtlas', 'tWaterDepth', 'tSceneDepth'].includes(t.name) ? 'non-filtering' : 'filtering' } },
      ]),
    ] });
  }
  fallback(type) {
    if (!this.fallbacks.has(type)) {
      const t = type === 'sampler3D' ? new THREE.Data3DTexture(new Uint8Array([0]), 1, 1, 1)
        : type === 'sampler2DArray' ? new THREE.DataArrayTexture(new Uint8Array([0, 0, 0, 0, 0, 0]), 1, 1, 6)
        : new THREE.DataTexture(new Uint8Array([255]), 1, 1, THREE.RedFormat);
      t.format = THREE.RedFormat; t.needsUpdate = true; this.fallbacks.set(type, t);
    }
    return this.fallbacks.get(type);
  }
  image(t, value) {
    try { return this.textures.get(value || this.fallback(t.type)); }
    catch (error) { throw new Error(`Texture ${t.name}: ${error.message}`, { cause: error }); }
  }
  // (stamp: a pass's draws that share one entry (a material's, its uniforms the same for all of them) pack
  // it once; the same stamp again returns it as packed)
  get(key, uniforms, stamp) {
    let e = this.entries.get(key);
    if (stamp !== undefined && e?.group && e.stamp === stamp) return e;
    if (!e) { e = { images: [], samplers: [] }; this.entries.set(key, e); }
    const options = tuning(this.device), bytes = this.descriptor.bytes;
    // (where its block lives follows the optimisations' switch: a page's slot, or a buffer of its own)
    const paged = options.enabled;
    if (e.paged !== paged) { e.paged = paged; e.group = null; }
    if (this.descriptor.uniforms.length) {
      if (paged) {
        if (!e.page) this.allocate(e);
        const page = e.page;
        packUniforms(this.descriptor, uniforms, page.cpu, e.slot * page.stride / 4);
        if (e.slot < page.lo) page.lo = e.slot;
        if (e.slot > page.hi) page.hi = e.slot;
        this.dirty.add(page); options.uniformWrites++; options.uniformBytes += bytes;
      } else {
        if (!e.buffer) { e.data = new ArrayBuffer(bytes); e.buffer = this.device.createBuffer({ label: 'shader parameters', size: bytes, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST }); }
        packUniformsReference(this.descriptor, uniforms, e.data);
        this.device.queue.writeBuffer(e.buffer, 0, e.data); options.uniformWrites++; options.uniformBytes += bytes;
      }
    }
    // (its textures as they stand, checked against its bind group's without building arrays for every draw)
    const tex = this.descriptor.textures, n = tex.length;
    const nearest = this.nearest || (this.nearest = tex.map(t => NEAREST.has(t.name)));
    const images = this.scratchImages || (this.scratchImages = new Array(n)), samplers = this.scratchSamplers || (this.scratchSamplers = new Array(n));
    let same = !!e.group;
    for (let i = 0; i < n; i++) {
      const t = tex[i], image = this.image(t, t.name === 'tSkyView' && !(uniforms.uSkyView?.value?.x > 0) ? null : uniforms[t.name]?.value);
      images[i] = image; samplers[i] = nearest[i] ? this.textures.nearest : image.sampler;
      if (same && (image !== e.images[i] || samplers[i] !== e.samplers[i])) same = false;
    }
    if (!same) {
      e.images = images.slice(); e.samplers = samplers.slice();
      const block = !this.descriptor.uniforms.length ? null : paged ? { buffer: e.page.buffer, offset: e.slot * e.page.stride, size: bytes } : { buffer: e.buffer };
      e.group = this.device.createBindGroup({ layout: this.layout, entries: [
        ...(block ? [{ binding: 0, resource: block }] : []),
        ...tex.flatMap((t, i) => [{ binding: t.binding, resource: e.images[i].view }, { binding: t.samplerBinding, resource: e.samplers[i] }]),
      ] });
    }
    e.stamp = stamp;
    return e;
  }
  // A slot for an entry's block in a page: a uniform buffer shared by many entries, at the device's
  // offset alignment, with a copy on the CPU it's packed into
  allocate(e) {
    let page = this.pages.find(p => p.free.length);
    if (!page) {
      const stride = Math.ceil(this.descriptor.bytes / this.align) * this.align, slots = Math.max(8, Math.floor(PAGE_BYTES / stride));
      page = { stride, buffer: this.device.createBuffer({ label: 'shader parameters page', size: slots * stride, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST }),
        cpu: new ArrayBuffer(slots * stride), free: Array.from({ length: slots }, (_, i) => slots - 1 - i), lo: Infinity, hi: -1 };
      this.pages.push(page);
    }
    e.page = page; e.slot = page.free.pop();
  }
  release(key) { const e = this.entries.get(key); if (e) { e.buffer?.destroy(); if (e.page) e.page.free.push(e.slot); this.entries.delete(key); } }
  dispose() { for (const key of this.entries.keys()) this.release(key); for (const p of this.pages) { this.dirty.delete(p); p.buffer.destroy(); } this.pages.length = 0; for (const t of this.fallbacks.values()) t.dispose(); }
}
