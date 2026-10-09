import * as THREE from 'three';
import { FULLSCREEN } from './shaders.js';
import { shaderModule, timestampWrites } from './device.js';

// A sampled r32float copy lets translated screen-space equations use textureLoad
// without relying on depth texture filtering or losing reversed-Z precision.
const COPY_DEPTH = FULLSCREEN + /* wgsl */`
@group(0) @binding(0) var source: texture_depth_2d;
@fragment fn copyDepth(v: Fullscreen) -> @location(0) f32 { return textureLoad(source, vec2i(v.position.xy), 0); }
`;
export class AirPass {
  constructor(device, passes, textures) { this.device = device; this.passes = passes; this.textures = textures; }
  async init() {
    const module = await shaderModule(this.device, 'sampled depth', COPY_DEPTH);
    this.depthPipeline = await this.device.createRenderPipelineAsync({ label: 'sampled depth', layout: 'auto', vertex: { module, entryPoint: 'fullscreen' }, fragment: { module, entryPoint: 'copyDepth', targets: [{ format: 'r32float' }] } });
  }
  entry(texture) { return { gpuEntry: true, texture, view: texture.createView(), sampler: this.textures.linear }; }
  targets(t) {
    if (t.air) return;
    const make = (label, format, width = t.width, height = t.height) => {
      const texture = this.device.createTexture({ label, size: [width, height], format, usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING });
      t.textures.push(texture); return this.entry(texture);
    };
    t.air = [make('air ping', 'rgba16float'), make('air pong', 'rgba16float')];
    t.volume = [make('air in-scatter', 'rgba16float', Math.ceil(t.width / 2), Math.ceil(t.height / 2)), make('air transmission', 'rgba16float', Math.ceil(t.width / 2), Math.ceil(t.height / 2))];
    t.sampledDepth = make('sampled scene depth', 'r32float');
    t.depthGroup = this.device.createBindGroup({ layout: this.depthPipeline.getBindGroupLayout(0), entries: [{ binding: 0, resource: t.depth.createView() }] });
    t.hdrEntry = this.entry(t.hdr);
    t.airOwners = new Map(); t.compositeOwners = new Map();
  }
  copyDepth(t) {
    this.targets(t);
    const encoder = this.device.createCommandEncoder({ label: 'depth for atmosphere' });
    const pass = encoder.beginRenderPass({ timestampWrites:timestampWrites(this.device,'atmosphere depth'), colorAttachments: [{ view: t.sampledDepth.view, loadOp: 'clear', storeOp: 'store' }] });
    pass.setPipeline(this.depthPipeline); pass.setBindGroup(0, t.depthGroup); pass.draw(3); pass.end(); this.device.queue.submit([encoder.finish()]);
  }
  render(engine, t) {
    const atmos = engine.frameInputs?.atmos;
    this.copyDepth(t);
    const camera = engine.view.camera, camRot = new THREE.Matrix3().setFromMatrix4(camera.matrixWorld);
    const common = {
      tDepth: { value: t.sampledDepth }, uCamRot: { value: camRot }, uTanHalf: { value: engine.tanHalf },
      uDepthMode: { value: 0 }, uNear: { value: camera.near }, uFar: { value: camera.far }, uLogDepthFC: { value: Math.log2(camera.far + 1) },
    };
    let src = t.hdrEntry, index = 0;
    if(engine.bgMat&&engine.frameInputs?.sky){
      this.passes.draw('background',t,{...engine.bgMat.uniforms,...common,tColor:{value:src},tSky:{value:engine.frameInputs.sky.cubeRT.texture}},[t.air[0]]);
      // (the central black hole and the sky bent round it, in its place: webgpu/central.js)
      this.central?.render(engine, t, t.air[0], src);
      src=t.air[0];index=1;
    }
    for (const a of atmos || []) {
      const u = a.material.uniforms;
      if (!t.airOwners.has(a.material)) { t.airOwners.set(a.material, {}); t.compositeOwners.set(a.material, {}); }
      const own = t.airOwners.get(a.material), output = t.air[index];
      this.passes.draw(u.uSigma ? 'volume' : 'atmosphere', own, { ...u, ...common, tColor: { value: src }, ...(!u.uSigma ? { uTime: { value: engine.time } } : {}) }, t.volume);
      this.passes.draw('composite', t.compositeOwners.get(a.material), {
        ...common, tColor: { value: src }, tL: { value: t.volume[0] }, tT: { value: t.volume[1] },
        uLowSize: { value: new THREE.Vector2(Math.ceil(t.width / 2), Math.ceil(t.height / 2)) },
      }, [output]);
      src = output; index = 1 - index;
    }
    return src.texture;
  }
  release(t) {
    this.passes.names.get('background')?.bindings.release(t);
    for (const owner of t.airOwners?.values() || []) for (const name of ['volume', 'atmosphere']) this.passes.names.get(name).bindings.release(owner);
    for (const owner of t.compositeOwners?.values() || []) this.passes.names.get('composite').bindings.release(owner);
  }
}
