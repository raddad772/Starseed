import { FULLSCREEN } from './shaders.js';
import { shaderModule } from './device.js';
import { ProgramBindings } from './program.js';
import { passes } from './generated/passes.js';

export class FullscreenPasses {
  constructor(device, textures, format) { this.format = format; this.device = device; this.textures = textures; this.programs = new Map(); this.names = new Map(); this.targets = new Map(); }
  async init() {
    const d = this.device;
    await Promise.all(passes.map(async spec => {
      const bindings = new ProgramBindings(d, spec.layout, this.textures);
      const module = await shaderModule(d, spec.name, FULLSCREEN + spec.code);
      const pipeline = await d.createRenderPipelineAsync({ label: spec.name, layout: d.createPipelineLayout({ bindGroupLayouts: [bindings.layout] }),
        vertex: { module, entryPoint: 'fullscreen' }, fragment: { module, entryPoint: 'main', targets: Array.from({ length: spec.outputs || 1 }, () => ({ format: spec.name === 'tonemap' ? this.format : 'rgba16float' })) } });
      const program = { bindings, pipeline, name: spec.name };
      this.programs.set(spec.key, program); this.names.set(spec.name, program);
    }));
  }
  draw(program, owner, uniforms, outputs) {
    if (typeof program === 'string') program = this.names.get(program) || this.programs.get(program);
    if (!program) throw new Error('Unported WebGPU fullscreen shader');
    const binding = program.bindings.get(owner, uniforms);
    const encoder = this.device.createCommandEncoder({ label: program.name });
    const pass = encoder.beginRenderPass({ label: program.name, colorAttachments: outputs.map(output => ({ view: output.texture.createView({ baseMipLevel: 0, mipLevelCount: 1 }), loadOp: 'clear', storeOp: 'store' })) });
    pass.setPipeline(program.pipeline); pass.setBindGroup(0, binding.group); pass.draw(3); pass.end(); this.device.queue.submit([encoder.finish()]);
  }
  resolve(texture) {
    const recipe = texture.userData.webgpuRecipe, { target } = recipe, program = this.programs.get(recipe.key);
    if (!program) throw new Error('Unported WebGPU fullscreen shader: ' + recipe.key);
    let entry = this.targets.get(target);
    if (!entry || entry.width !== target.width || entry.height !== target.height) {
      entry?.dispose();
      const outputs = target.textures.map(source => {
        const mipLevelCount = source.generateMipmaps ? 1 + Math.floor(Math.log2(Math.max(target.width, target.height))) : 1;
        const gpu = this.device.createTexture({ label: program.name, size: [target.width, target.height], format: 'rgba16float', mipLevelCount, usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_SRC });
        return { gpuEntry: true, mipLevelCount, width: target.width, height: target.height, texture: gpu, format: 'rgba16float', view: gpu.createView(), sampler: this.textures.sampler(source) };
      });
      entry = { width: target.width, height: target.height, outputs, revision: -1 };
      entry.dispose = () => { for (const e of outputs) e.texture.destroy(); this.targets.delete(target); program.bindings.release(target); target.removeEventListener('dispose', entry.dispose); };
      target.addEventListener('dispose', entry.dispose); this.targets.set(target, entry);
    }
    if (entry.revision !== recipe.revision) {
      this.draw(program, target, recipe.uniforms, entry.outputs);
      for (const e of entry.outputs) if (e.mipLevelCount > 1) this.textures.generateMips(e.texture, e.format, e.mipLevelCount, 1);
      entry.revision = recipe.revision;
    }
    return entry.outputs[target.textures.indexOf(texture)];
  }
  dispose() { for (const target of [...this.targets.values()]) target.dispose(); for (const p of this.programs.values()) p.bindings.dispose(); this.programs.clear(); }
}
