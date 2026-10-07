// Upload renderer-independent Three texture data and own its WebGPU lifetime.
// Render targets are owned by the frame graph and do not pass through this cache.
import * as THREE from 'three';
import { FULLSCREEN } from './shaders.js';

const MIP_SHADER = FULLSCREEN + /* wgsl */`
@group(0) @binding(0) var source: texture_2d<f32>;
@group(0) @binding(1) var linearSampler: sampler;
@fragment fn mip(v: Fullscreen) -> @location(0) vec4f {
  return textureSample(source, linearSampler, v.uv);
}
`;

export class TextureCache {
  constructor(device) {
    this.device = device; this.cache = new WeakMap(); this.renderTargets = new WeakMap(); this.live = new Set();
    this.mipPipelines = new Map(); this.samplers = new Map();
    this.mipModule = device.createShaderModule({ label: 'texture mipmaps', code: MIP_SHADER });
    this.nearest = device.createSampler();
    this.mipLinear = device.createSampler({minFilter:'linear',magFilter:'linear',mipmapFilter:'linear'});
    this.linear = device.createSampler({ minFilter: 'linear', magFilter: 'linear' });
  }
  sampler(texture) {
    const wrap = (v) => v === THREE.RepeatWrapping ? 'repeat' : v === THREE.MirroredRepeatWrapping ? 'mirror-repeat' : 'clamp-to-edge';
    const nearest = texture.magFilter === THREE.NearestFilter;
    const options = { addressModeU: wrap(texture.wrapS), addressModeV: wrap(texture.wrapT), addressModeW: wrap(texture.wrapR),
      minFilter: nearest ? 'nearest' : 'linear', magFilter: nearest ? 'nearest' : 'linear', mipmapFilter: nearest ? 'nearest' : 'linear',
      maxAnisotropy: nearest ? 1 : Math.max(1, Math.min(16, texture.anisotropy || 1)),
    };
    const key = JSON.stringify(options);
    if (!this.samplers.has(key)) this.samplers.set(key, this.device.createSampler(options));
    return this.samplers.get(key);
  }
  get(texture) {
    if (this.renderTargets.has(texture)) return this.renderTargets.get(texture);
    if (texture?.userData?.webgpuSky) return this.background.cube(texture);
    if (texture?.gpuEntry) return texture;
    if (texture?.userData?.webgpuRecipe) return this.passes.resolve(texture);
    if (texture?.isRenderTargetTexture) throw new Error('WebGPU render target has no producer');
    if (!texture?.image) throw new Error('WebGPU texture has no image data');
    let entry = this.cache.get(texture);
    if (entry && entry.version === texture.version) return entry;
    if (entry) entry.dispose();
    const image = texture.image, d = this.device;
    const channels = texture.format === THREE.RedFormat ? 1 : texture.format === THREE.RGFormat ? 2 : 4;
    const half = texture.type === THREE.HalfFloatType, float = texture.type === THREE.FloatType;
    const prefix = channels === 1 ? 'r' : channels === 2 ? 'rg' : 'rgba';
    const format = half || float ? `${prefix}16float` : `${prefix}8unorm${texture.colorSpace === THREE.SRGBColorSpace && channels === 4 ? '-srgb' : ''}`;
    const dimension = texture.isData3DTexture ? '3d' : '2d';
    const layers = texture.isDataArrayTexture || texture.isData3DTexture ? image.depth : 1;
    const mipLevelCount = texture.generateMipmaps && dimension === '2d' ? 1 + Math.floor(Math.log2(Math.max(image.width, image.height))) : 1;
    const gpu = d.createTexture({ label: texture.name || 'material texture', size: [image.width, image.height, layers], dimension, format, mipLevelCount,
      usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | (dimension === '2d' ? GPUTextureUsage.RENDER_ATTACHMENT : 0),
    });
    if (image.data) {
      // Preserve floating-point LUTs while making filtering portable without float32-filterable.
      const data = float ? Uint16Array.from(image.data, (v) => THREE.DataUtils.toHalfFloat(v)) : image.data;
      d.queue.writeTexture({ texture: gpu }, data, { bytesPerRow: image.width * channels * (half || float ? 2 : 1), rowsPerImage: image.height }, [image.width, image.height, layers]);
    } else {
      d.queue.copyExternalImageToTexture({ source: image, flipY: texture.flipY }, { texture: gpu }, [image.width, image.height]);
    }
    if (mipLevelCount > 1) this.generateMips(gpu, format, mipLevelCount, layers);
    entry = { texture: gpu, version: texture.version, format, mipLevelCount,
      view: gpu.createView({ dimension: dimension === '3d' ? '3d' : texture.isDataArrayTexture ? '2d-array' : '2d' }), sampler: this.sampler(texture),
    };
    entry.dispose = () => { gpu.destroy(); this.live.delete(entry); this.cache.delete(texture); texture.removeEventListener('dispose', entry.dispose); };
    texture.addEventListener('dispose', entry.dispose); this.cache.set(texture, entry); this.live.add(entry);
    return entry;
  }
  generateMips(texture, format, count, layers) {
    const d = this.device;
    let pipeline = this.mipPipelines.get(format);
    if (!pipeline) {
      pipeline = d.createRenderPipeline({ label: `mipmaps ${format}`, layout: 'auto',
        vertex: { module: this.mipModule, entryPoint: 'fullscreen' },
        fragment: { module: this.mipModule, entryPoint: 'mip', targets: [{ format }] },
      }); this.mipPipelines.set(format, pipeline);
    }
    const encoder = d.createCommandEncoder({ label: 'mipmap chain' });
    for (let layer = 0; layer < layers; layer++) for (let level = 1; level < count; level++) {
      const view = (mip) => texture.createView({ dimension: '2d', baseMipLevel: mip, mipLevelCount: 1, baseArrayLayer: layer, arrayLayerCount: 1 });
      const group = d.createBindGroup({ layout: pipeline.getBindGroupLayout(0), entries: [{ binding: 0, resource: view(level - 1) }, { binding: 1, resource: this.linear }] });
      const pass = encoder.beginRenderPass({ colorAttachments: [{ view: view(level), loadOp: 'clear', storeOp: 'store' }] });
      pass.setPipeline(pipeline); pass.setBindGroup(0, group); pass.draw(3); pass.end();
    }
    d.queue.submit([encoder.finish()]);
  }
  dispose() { for (const entry of [...this.live]) entry.dispose(); this.samplers.clear(); this.mipPipelines.clear(); }
}
