import * as THREE from 'three';
import { shaderModule } from './device.js';
import { packUniforms } from './uniforms.js';

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
  get(key, uniforms) {
    let e = this.entries.get(key);
    if (!e) {
      e = { data: new ArrayBuffer(this.descriptor.bytes), images: [], samplers: [],
        buffer: this.device.createBuffer({ label: 'shader parameters', size: this.descriptor.bytes, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST }) };
      this.entries.set(key, e);
    }
    this.device.queue.writeBuffer(e.buffer, 0, packUniforms(this.descriptor, uniforms, e.data));
    const images = this.descriptor.textures.map(t => this.image(t, t.name === 'tSkyView' && !(uniforms.uSkyView?.value?.x > 0) ? null : uniforms[t.name]?.value));
    const samplers = images.map((image, i) => ['tShadowAtlas', 'tDepth', 'tAtlas', 'tWaterDepth', 'tSceneDepth'].includes(this.descriptor.textures[i].name) ? this.textures.nearest : image.sampler);
    if (!e.group || images.some((t, i) => t !== e.images[i] || samplers[i] !== e.samplers[i])) {
      e.images = images; e.samplers = samplers;
      e.group = this.device.createBindGroup({ layout: this.layout, entries: [
        ...(this.descriptor.uniforms.length ? [{ binding: 0, resource: { buffer: e.buffer } }] : []),
        ...this.descriptor.textures.flatMap((t, i) => [{ binding: t.binding, resource: images[i].view }, { binding: t.samplerBinding, resource: samplers[i] }]),
      ] });
    }
    return e;
  }
  release(key) { const e = this.entries.get(key); if (e) { e.buffer.destroy(); this.entries.delete(key); } }
  dispose() { for (const key of this.entries.keys()) this.release(key); for (const t of this.fallbacks.values()) t.dispose(); }
}
