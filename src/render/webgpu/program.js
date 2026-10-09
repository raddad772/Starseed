import * as THREE from 'three';
import { shaderModule } from './device.js';
import { packUniforms, packUniformsReference } from './uniforms.js';
import { tuning } from './tuning.js';
// (textures read texel for texel: depths and the shadow atlas)
const NEAREST = new Set(['tShadowAtlas', 'tDepth', 'tAtlas', 'tWaterDepth', 'tSceneDepth']);

const dimension = (type) => ({ sampler2D: '2d', sampler2DArray: '2d-array', sampler3D: '3d', samplerCube: 'cube' })[type];
export class ProgramBindings {
  constructor(device, descriptor, textures, visibility = GPUShaderStage.FRAGMENT) {
    this.device = device; this.descriptor = descriptor; this.textures = textures; this.entries = new Map(); this.fallbacks = new Map();
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
    if (!e) {
      e = { data: new ArrayBuffer(this.descriptor.bytes), images: [], samplers: [],
        buffer: this.device.createBuffer({ label: 'shader parameters', size: this.descriptor.bytes, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST }) };
      this.entries.set(key, e);
    }
    const options = tuning(this.device);
    (options.enabled ? packUniforms : packUniformsReference)(this.descriptor, uniforms, e.data);
    const bytes = e.words || (e.words = new Uint32Array(e.data));
    let changed = !options.enabled || !e.previous;
    if (!changed) for (let i = 0; i < bytes.length; i++) if (bytes[i] !== e.previous[i]) { changed = true; break; }
    if (changed) {
      this.device.queue.writeBuffer(e.buffer, 0, e.data);
      if (!e.previous) e.previous = new Uint32Array(bytes.length);
      e.previous.set(bytes); options.uniformWrites++; options.uniformBytes += e.data.byteLength;
    } else options.uniformSkips++;
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
      e.group = this.device.createBindGroup({ layout: this.layout, entries: [
        ...(this.descriptor.uniforms.length ? [{ binding: 0, resource: { buffer: e.buffer } }] : []),
        ...tex.flatMap((t, i) => [{ binding: t.binding, resource: e.images[i].view }, { binding: t.samplerBinding, resource: e.samplers[i] }]),
      ] });
    }
    e.stamp = stamp;
    return e;
  }
  release(key) { const e = this.entries.get(key); if (e) { e.buffer.destroy(); this.entries.delete(key); } }
  dispose() { for (const key of this.entries.keys()) this.release(key); for (const t of this.fallbacks.values()) t.dispose(); }
}
