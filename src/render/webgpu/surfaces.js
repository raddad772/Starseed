import * as THREE from 'three';

const vector = (data, offset, value, n = 4) => {
  for (let i = 0; i < n; i++) data[offset + i] = value?.getComponent?.(i) ?? value?.[i] ?? 0;
};
const val = (u, key) => u[key]?.value;

export class SurfaceCache {
  constructor(device, textures) {
    this.device = device; this.textures = textures; this.cache = new Map();
    const F = GPUShaderStage.FRAGMENT;
    this.layout = device.createBindGroupLayout({ label: 'surface material', entries: [
      { binding: 0, visibility: F, texture: {} }, { binding: 1, visibility: F, sampler: {} },
      { binding: 2, visibility: F, texture: { viewDimension: '2d-array' } },
      { binding: 3, visibility: F, texture: { viewDimension: '2d-array' } },
      { binding: 4, visibility: F, texture: {} }, { binding: 5, visibility: F, texture: {} },
      { binding: 6, visibility: F, sampler: {} }, { binding: 7, visibility: F, buffer: { type: 'uniform' } },
      { binding: 8, visibility: F, texture: { viewDimension: '2d-array' } },
    ] });
    this.repeat = device.createSampler({ addressModeU: 'repeat', addressModeV: 'repeat', minFilter: 'linear', magFilter: 'linear', mipmapFilter: 'linear', maxAnisotropy: 8 });
    this.climate = device.createSampler({ addressModeU: 'repeat', minFilter: 'linear', magFilter: 'linear' });
    const pixel = (data, array = false) => {
      const t = array ? new THREE.DataArrayTexture(new Uint8Array(Array.from({ length: 13 }, () => data).flat()), 1, 1, 13)
        : new THREE.DataTexture(new Uint8Array(data), 1, 1);
      t.needsUpdate = true; return t;
    };
    this.neutral = [pixel([128, 128, 128, 128]), pixel([102, 102, 102, 128], true), pixel([128, 128, 204, 255], true), pixel([128, 128, 0, 255]), pixel([0, 0, 0, 255]), pixel([0, 0, 0, 128], true)];
  }
  get(u, mode = 0) {
    // Shared uniforms identify a body's material. Chunk-local origins live in Object.
    const key = u.uCenter || u;
    let entry = this.cache.get(key);
    if (!entry) {
      entry = { buffer: this.device.createBuffer({ label: 'surface coefficients', size: 160, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST }), data: new Float32Array(40), images: [] };
      this.cache.set(key, entry);
    }
    const source = ['tDetail', 'tMatA', 'tMatN', 'tSeasonMap', 'tFrost', 'tColourCube'].map((k, i) => val(u, k) || this.neutral[i]);
    const images = source.map((t) => this.textures.get(t));
    if (images.some((image, i) => image !== entry.images[i])) {
      entry.images = images;
      entry.group = this.device.createBindGroup({ layout: this.layout, entries: [
        { binding: 0, resource: images[0].view }, { binding: 1, resource: this.repeat },
        { binding: 2, resource: images[1].view }, { binding: 3, resource: images[2].view },
        { binding: 4, resource: images[3].view }, { binding: 5, resource: images[4].view },
        { binding: 6, resource: this.climate }, { binding: 7, resource: { buffer: entry.buffer } },
        { binding: 8, resource: images[5].view },
      ] });
    }
    const data = entry.data, m = val(u, 'uToFixed')?.elements || [1, 0, 0, 0, 1, 0, 0, 0, 1];
    for (let c = 0; c < 3; c++) for (let r = 0; r < 3; r++) data[c * 4 + r] = m[c * 3 + r];
    vector(data, 12, val(u, 'uSeason')); vector(data, 16, val(u, 'uFrost'));
    vector(data, 20, val(u, 'uSnowCol') || [1, 1, 1], 3); vector(data, 24, val(u, 'uSoilCol'), 3);
    vector(data, 28, val(u, 'uLavaColor'), 3); vector(data, 32, val(u, 'uWindRipple'), 2);
    data[34] = val(u, 'uTime') || 0; data[35] = mode;
    vector(data, 36, val(u, 'uColourCube'));
    this.device.queue.writeBuffer(entry.buffer, 0, data);
    return entry;
  }
  dispose() {
    for (const e of this.cache.values()) e.buffer.destroy();
    this.cache.clear(); for (const t of this.neutral) t.dispose();
  }
}
