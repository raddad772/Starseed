import * as THREE from 'three';
import { FULLSCREEN } from './shaders.js';
import { shaderModule, timestampWrites } from './device.js';

// A sampled r32float copy lets translated screen-space equations use textureLoad
// without relying on depth texture filtering or losing reversed-Z precision.
const COPY_DEPTH = FULLSCREEN + /* wgsl */`
@group(0) @binding(0) var source: texture_depth_2d;
@fragment fn copyDepth(v: Fullscreen) -> @location(0) f32 { return textureLoad(source, vec2i(v.position.xy), 0); }
`;
// Haze where there's air but no world's atmosphere drawn (a scene's own fog: a megastructure's, a hollow
// moon's kilometres of air): exponential in the true distance to each pixel (the reversed depth decoded),
// toward the fog's colour at the scene's own light level (scene.userData.fogLuminance: a scene that sets it;
// the megastructures' fog isn't drawn yet); the sky, at no depth, all fog.
const FOG = FULLSCREEN + /* wgsl */`
struct Fog { color: vec4f, k: vec4f };
@group(0) @binding(0) var src: texture_2d<f32>;
@group(0) @binding(1) var dep: texture_2d<f32>;
@group(0) @binding(2) var<uniform> fog: Fog;
@fragment fn fogFrag(v: Fullscreen) -> @location(0) vec4f {
  let px = vec2i(v.position.xy);
  let c = textureLoad(src, px, 0);
  let d = textureLoad(dep, px, 0).r;
  var dist = 1.0e9;
  if (d > 0.0) {
    let Z = fog.k.z / (d + fog.k.y);
    let ndc = v.uv * vec2f(2.0, -2.0) + vec2f(-1.0, 1.0);
    dist = Z * length(vec3f(ndc.x * fog.color.w, ndc.y * fog.k.w, 1.0));
  }
  let f = 1.0 - exp(-fog.k.x * dist);
  return vec4f(mix(c.rgb, fog.color.rgb, f), c.a);
}
`;
export class AirPass {
  constructor(device, passes, textures) { this.device = device; this.passes = passes; this.textures = textures; }
  async init() {
    const module = await shaderModule(this.device, 'sampled depth', COPY_DEPTH);
    this.depthPipeline = await this.device.createRenderPipelineAsync({ label: 'sampled depth', layout: 'auto', vertex: { module, entryPoint: 'fullscreen' }, fragment: { module, entryPoint: 'copyDepth', targets: [{ format: 'r32float' }] } });
    const fog = await shaderModule(this.device, 'scene fog', FOG);
    this.fogPipeline = await this.device.createRenderPipelineAsync({ label: 'scene fog', layout: 'auto', vertex: { module: fog, entryPoint: 'fullscreen' }, fragment: { module: fog, entryPoint: 'fogFrag', targets: [{ format: 'rgba16float' }] } });
    this.fogBuffer = this.device.createBuffer({ label: 'scene fog', size: 32, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
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
      this.central?.render(engine, t, t.air[0]);
      src=t.air[0];index=1;
    }
    // (a rocky world's rings seen through its air, before the air's drawn over them: webgpu/rings.js)
    this.rings?.render(engine, t, src, 0);
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
    // (and the rest of them, in front of any air)
    this.rings?.render(engine, t, src, 1);
    const fog = engine.scene?.fog;
    if (fog && fog.isFogExp2 && !(atmos && atmos.length) && fog.density > 0 && engine.scene.userData.fogLuminance != null) {
      const output = t.air[index], near = camera.near, far = camera.far, A = near / (far - near), B = near * (far / (far - near));
      const tanY = Math.tan(camera.fov * Math.PI / 360), tanX = tanY * camera.aspect, L = engine.scene.userData.fogLuminance;
      const c = fog.color;
      this.device.queue.writeBuffer(this.fogBuffer, 0, new Float32Array([c.r * L, c.g * L, c.b * L, tanX, fog.density, A, B, tanY]));
      const group = this.device.createBindGroup({ layout: this.fogPipeline.getBindGroupLayout(0), entries: [{ binding: 0, resource: src.view }, { binding: 1, resource: t.sampledDepth.view }, { binding: 2, resource: { buffer: this.fogBuffer } }] });
      const encoder = this.device.createCommandEncoder({ label: 'scene fog' });
      const pass = encoder.beginRenderPass({ timestampWrites: timestampWrites(this.device, 'scene fog'), colorAttachments: [{ view: output.view, loadOp: 'clear', storeOp: 'store' }] });
      pass.setPipeline(this.fogPipeline); pass.setBindGroup(0, group); pass.draw(3); pass.end(); this.device.queue.submit([encoder.finish()]);
      src = output;
    }
    return src.texture;
  }
  release(t) {
    this.rings?.release(t);
    this.passes.names.get('background')?.bindings.release(t);
    for (const owner of t.airOwners?.values() || []) for (const name of ['volume', 'atmosphere']) this.passes.names.get(name).bindings.release(owner);
    for (const owner of t.compositeOwners?.values() || []) this.passes.names.get('composite').bindings.release(owner);
  }
}
