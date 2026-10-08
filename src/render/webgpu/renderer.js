// Raw WebGPU deferred renderer. During the port, the existing Three scene is the
// renderer-neutral source of geometry, transforms and material parameters.
import * as THREE from 'three';
import { createDevice, bufferWithData, shaderModule, readRGBA, PassTimer } from './device.js';
import { reversedPerspective, packTerrain } from './math.js';
import { TERRAIN, LIGHTING, POST } from './shaders.js';
import { TextureCache } from './textures.js';
import { SurfaceCache } from './surfaces.js';
import { FullscreenPasses } from './passes.js';
import { ProgramBindings } from './program.js';
import { AirPass } from './air.js';
import { PostPass } from './post.js';
import { OpaquePass } from './opaque.js';
import { ShadowPass } from './shadows.js';
import { ClusteredLights } from './clustered.js';
import { ForwardPass } from './forward.js';
import { TerrainCuller } from './culling.js';
import { MapPass } from './map.js';
import { GTAO } from './gtao.js';
import { GBufferEffects } from './gbuffer-effects.js';
import { Background } from './background.js';
import { tuning, resetCounters } from './tuning.js';
import { layout as lightLayout } from './generated/lighting.js';

const OBJECT_FLOATS = 44;
const GB_FORMATS = ['rgba8unorm', 'rgba16float', 'rgba16float', 'rgba8unorm'];
const value = (u, name, fallback = 0) => u[name]?.value ?? fallback;
const vec = (data, offset, v) => { data[offset] = v?.x || 0; data[offset + 1] = v?.y || 0; data[offset + 2] = v?.z || 0; };

export class DeferredRenderer {
  static async create(canvas, onError, signal) {
    const gpu = await createDevice(canvas, onError, signal);
    const renderer = new DeferredRenderer(canvas, gpu, onError);
    try { await renderer.init(); } catch (error) { renderer.dispose(); throw error; }
    return renderer;
  }
  constructor(canvas, gpu, onError) {
    Object.assign(this, gpu);
    this.canvas = canvas; this.onError = onError;
    this.geometryCache = new WeakMap(); this.geometries = new Set(); this.targets = new Map();
    this.objectCapacity = 0; this.bodyCapacity = 0;
    this.viewProjection = new THREE.Matrix4(); this.projection = new THREE.Matrix4();
    this.inverse = new THREE.Matrix4(); this.frustum = new THREE.Frustum();
    this.stats = { calls: 0, triangles: 0, geometries: 0, passes: {} };
    this.timer = new PassTimer(this.device, gpu.timestamp);
    this.frameData = new Float32Array(36);
    this.textures = new TextureCache(this.device);
    this.surfaces = new SurfaceCache(this.device, this.textures);
    this.passes = new FullscreenPasses(this.device, this.textures, this.format); this.textures.passes = this.passes;
    this.background = new Background(this.device,this.textures,this.passes);
    this.air = new AirPass(this.device, this.passes, this.textures);
    this.post = new PostPass(this.device, this.passes, this.textures, this.air);
    this.shadows = new ShadowPass(this.device,this.textures,this.passes);
    this.localLights = new ClusteredLights(this.device);
    this.gtao = new GTAO(this.device);
    this.map = new MapPass(this.device,this.format);
    this.terrainCuller = new TerrainCuller(this.device);
    this.materialEffects = new GBufferEffects(this.device);
    this.forward = new ForwardPass(this.device,this.textures,this.localLights);
    this.opaque = new OpaquePass(this.device, this.textures);
    this.lightBindings = new ProgramBindings(this.device, lightLayout, this.textures);
  }
  async init() {
    const d = this.device, S = GPUShaderStage;
    await Promise.all([this.passes.init(), this.air.init(), this.opaque.init(), this.shadows.init(), this.forward.init(), this.localLights.init(), this.gtao.init(), this.materialEffects.init(), this.map.init(), this.terrainCuller.init()]);
    this.frameLayout = d.createBindGroupLayout({ label: 'frame and world', entries: [
      { binding: 0, visibility: S.VERTEX | S.FRAGMENT, buffer: { type: 'uniform' } },
      { binding: 1, visibility: S.VERTEX | S.FRAGMENT, buffer: { type: 'read-only-storage' } },
      { binding: 2, visibility: S.FRAGMENT, buffer: { type: 'read-only-storage' } },
    ] });
    this.geometryLayout = d.createBindGroupLayout({ label: 'terrain vertices', entries: [
      { binding: 0, visibility: S.VERTEX, buffer: { type: 'read-only-storage' } },
    ] });
    this.gbufferLayout = d.createBindGroupLayout({ label: 'G-buffer inputs', entries: [
      ...[0, 1, 2].map((binding) => ({ binding, visibility: S.FRAGMENT, texture: { sampleType: 'unfilterable-float' } })),
      { binding: 3, visibility: S.FRAGMENT, texture: { sampleType: 'depth' } },
      { binding: 4, visibility: S.FRAGMENT, texture: { sampleType: 'unfilterable-float' } },
      { binding: 5, visibility: S.FRAGMENT, texture: { sampleType: 'unfilterable-float' } },
    ] });
    this.postLayout = d.createBindGroupLayout({ label: 'HDR input', entries: [{ binding: 0, visibility: S.FRAGMENT, texture: { sampleType: 'unfilterable-float' } }] });
    this.frameBuffer = d.createBuffer({ label: 'camera', size: 144, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
    this.ensureCapacity(1, 1);
    const [terrain, lighting, post] = await Promise.all([
      shaderModule(d, 'terrain G-buffer', TERRAIN), shaderModule(d, 'deferred lighting', LIGHTING), shaderModule(d, 'post', POST),
    ]);
    const layout = (second) => d.createPipelineLayout({ bindGroupLayouts: [this.frameLayout, second] });
    this.terrainPipeline = await d.createRenderPipelineAsync({
      label: 'terrain G-buffer', layout: d.createPipelineLayout({ bindGroupLayouts: [this.frameLayout, this.geometryLayout, this.surfaces.layout] }),
      vertex: { module: terrain, entryPoint: 'vertexMain', buffers:[{arrayStride:4,stepMode:'instance',attributes:[{shaderLocation:0,offset:0,format:'uint32'}]}] },
      fragment: { module: terrain, entryPoint: 'fragmentMain', targets: GB_FORMATS.map((format) => ({ format })) },
      primitive: { topology: 'triangle-list', cullMode: 'back', frontFace: 'ccw' },
      depthStencil: { format: 'depth32float', depthWriteEnabled: true, depthCompare: 'greater' },
    });
    this.lightPipeline = await d.createRenderPipelineAsync({
      label: 'deferred lighting', layout: d.createPipelineLayout({ bindGroupLayouts: [this.frameLayout, this.gbufferLayout, this.lightBindings.layout] }),
      vertex: { module: lighting, entryPoint: 'fullscreen' },
      fragment: { module: lighting, entryPoint: 'light', targets: [{ format: 'rgba16float' }] },
    });
    this.postPipeline = await d.createRenderPipelineAsync({
      label: 'post', layout: layout(this.postLayout),
      vertex: { module: post, entryPoint: 'fullscreen' },
      fragment: { module: post, entryPoint: 'post', targets: [{ format: this.format }] },
    });
  }
  ensureCapacity(objects, bodies) {
    const d = this.device;
    if (objects <= this.objectCapacity && bodies <= this.bodyCapacity) return;
    if (objects > this.objectCapacity) {
      this.objectCapacity = 2 ** Math.ceil(Math.log2(Math.max(64, objects)));
      const size = this.objectCapacity * OBJECT_FLOATS * 4;
      if (size > d.limits.maxStorageBufferBindingSize) throw new Error('Visible geometry exceeds the WebGPU object buffer limit');
      this.objectBuffer?.destroy();this.objectIndices?.destroy();
      this.objectIndices=bufferWithData(d,'terrain object indices',Uint32Array.from({length:this.objectCapacity},(_,i)=>i),GPUBufferUsage.VERTEX);
      this.objectBuffer = d.createBuffer({ label: 'objects', size, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST });
      this.objectData = new Float32Array(this.objectCapacity * OBJECT_FLOATS);
    }
    if (bodies > this.bodyCapacity) {
      this.bodyCapacity = 2 ** Math.ceil(Math.log2(Math.max(16, bodies)));
      this.bodyBuffer?.destroy();
      this.bodyBuffer = d.createBuffer({ label: 'body lights', size: this.bodyCapacity * 64, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST });
      this.bodyData = new Float32Array(this.bodyCapacity * 16);
    }
    this.frameGroup = d.createBindGroup({ layout: this.frameLayout, entries: [
      { binding: 0, resource: { buffer: this.frameBuffer } },
      { binding: 1, resource: { buffer: this.objectBuffer } },
      { binding: 2, resource: { buffer: this.bodyBuffer } },
    ] });
  }
  geometry(g) {
    let entry = this.geometryCache.get(g);
    if (entry) return entry;
    const vertices = packTerrain(g);
    if(!g.boundingSphere)g.computeBoundingSphere();const sphere=g.boundingSphere.clone();
    let morphMargin=0;for(let i=0;i<vertices.length;i+=44)morphMargin=Math.max(morphMargin,Math.hypot(vertices[i]-vertices[i+4],vertices[i+1]-vertices[i+5],vertices[i+2]-vertices[i+6]));sphere.radius+=morphMargin;
    const indices = g.index?.array || Uint32Array.from({ length: g.attributes.position.count }, (_, i) => i);
    if (vertices.byteLength > this.device.limits.maxStorageBufferBindingSize) throw new Error('Terrain chunk exceeds the WebGPU vertex buffer limit');
    const vertexBuffer = bufferWithData(this.device, 'terrain vertices', vertices, GPUBufferUsage.STORAGE);
    const indexBuffer = bufferWithData(this.device, 'terrain indices', indices, GPUBufferUsage.INDEX);
    entry = {
      sphere, vertexBuffer, indexBuffer, indexFormat: indices instanceof Uint16Array ? 'uint16' : 'uint32', count: indices.length,
      bindGroup: this.device.createBindGroup({ layout: this.geometryLayout, entries: [{ binding: 0, resource: { buffer: vertexBuffer } }] }),
    };
    entry.dispose = () => {
      vertexBuffer.destroy(); indexBuffer.destroy(); this.geometries.delete(entry); this.geometryCache.delete(g);
      g.removeEventListener('dispose', entry.dispose);
    };
    g.addEventListener('dispose', entry.dispose);
    this.geometries.add(entry); this.geometryCache.set(g, entry);
    return entry;
  }
  target(view) {
    let t = this.targets.get(view);
    if (t && t.width === view.width && t.height === view.height) return t;
    if (t) { this.air.release(t); this.post.release(t); this.localLights.release(t); for (const texture of t.textures) texture.destroy(); }
    const d = this.device, width = view.width, height = view.height;
    const make = (label, format, extra = 0) => d.createTexture({ label, size: [width, height], format, ...(format===this.format?{viewFormats:[this.format+'-srgb']} : {}), usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING | extra });
    const gbuffer = GB_FORMATS.map((format, i) => make(`G-buffer ${i}`, format, GPUTextureUsage.COPY_SRC));
    const depth = make('reversed depth', 'depth32float', GPUTextureUsage.COPY_SRC);
    const ground = ['rgba8unorm','rgba16float','rgba8unorm','depth32float'].map((format,i)=>make(`underlying terrain ${i}`,format,GPUTextureUsage.COPY_DST));
    const shadedGbuffer = GB_FORMATS.map((format,i)=>make(`processed G-buffer ${i}`,format));
    const ao = make('indirect visibility','r8unorm',GPUTextureUsage.COPY_SRC);
    const hdr = make('lit HDR', 'rgba16float', GPUTextureUsage.COPY_SRC);
    const output = make('presented frame', this.format, GPUTextureUsage.COPY_SRC);
    t = { width, height, gbuffer, shadedGbuffer, ground, ao, depth, hdr, output, textures: [...gbuffer, ...shadedGbuffer, ...ground, ao, depth, hdr, output] };
    t.rawLightGroup=d.createBindGroup({layout:this.gbufferLayout,entries:[gbuffer[0],gbuffer[1],gbuffer[2],depth,gbuffer[3],ao].map((tex,binding)=>({binding,resource:tex.createView()}))});
    t.lightGroup = d.createBindGroup({ layout: this.gbufferLayout, entries: [shadedGbuffer[0], shadedGbuffer[1], shadedGbuffer[2], depth, shadedGbuffer[3], ao].map((tex, binding) => ({ binding, resource: tex.createView() })) });
    t.postGroup = d.createBindGroup({ layout: this.postLayout, entries: [{ binding: 0, resource: hdr.createView() }] });
    if(view.out)this.textures.renderTargets.set(view.out.texture,{gpuEntry:true,texture:output,view:output.createView({format:this.format+'-srgb'}),sampler:this.textures.linear});
    this.targets.set(view, t);
    return t;
  }
  render(engine, animate = true) {
    if (this.disposed) return;
    const start = performance.now(), view = engine.view, camera = view.camera;
    this.timer.begin();resetCounters(this.device);
    const options=tuning(this.device),cpu={};let mark=start;const stage=name=>{const now=performance.now();cpu[name]=now-mark;mark=now;};
    camera.updateMatrixWorld(); engine.scene.updateMatrixWorld();
    if(animate&&engine.sunShadows)this.shadows.update(engine.sunShadows,engine.scene);
    if(this.shadows.state)this.opaque.uniformOverrides=this.shadows.uniforms;stage('scene and shadows');
    this.projection.fromArray(reversedPerspective(camera.fov, camera.aspect, camera.near, camera.far));
    this.viewProjection.multiplyMatrices(this.projection, camera.matrixWorldInverse);
    this.inverse.copy(this.viewProjection).invert();
    // Three's frustum extraction knows the WebGPU clip convention and reversed Z.
    this.frustum.setFromProjectionMatrix(this.viewProjection, THREE.WebGPUCoordinateSystem, true);
    const draw = [], opaqueObjects = [], pendingStandard = [], lights = [], bodyIds = new Map(), surfaces = new Map();
    engine.scene.traverseVisible((object) => {
      if (!object.isMesh || !object.layers.test(camera.layers)) return;
      if (!object.geometry.attributes.nrm && object.frustumCulled && !this.frustum.intersectsObject(object)) return;
      const materials=Array.isArray(object.material)?object.geometry.groups.map(group=>({material:object.material[group.materialIndex],group})):[{material:object.material}];
      for(const {material,group} of materials){
        if(!material||material.transparent||!material.visible)continue;
        const u=material.uniforms||material.userData.webgpu?.uniforms;
        const terrain=object.geometry.attributes.nrm&&u?.uMorph;
        if(!terrain&&!this.opaque.program(material))continue;
        if(!u?.uCenter){pendingStandard.push({object,material,group});continue;}
        const key=u.uCenter;
        if(!bodyIds.has(key)){bodyIds.set(key,lights.length);lights.push(u);}
        if(terrain){
          if(!surfaces.has(key))surfaces.set(key,this.surfaces.get(u,material.defines?.MAT_MODE||0));
          draw.push({object,u,body:bodyIds.get(key),surface:surfaces.get(key),geometry:this.geometry(object.geometry)});
        }else opaqueObjects.push({object,material,group,body:bodyIds.get(key)});
      }
    });
    // Lit meshes without a planetary material (vessels, fauna, items) use the
    // nearest visible body's atmosphere. Scene lighting supplies the space case.
    for (const entry of pendingStandard) {
      const p = new THREE.Vector3().setFromMatrixPosition(entry.object.matrixWorld);
      let body = 0, distance = Infinity;
      lights.forEach((u,i) => { const r = p.distanceTo(u.uCenter.value) - (u.uRadius?.value || 0); if (r < distance) {distance=r;body=i;} });
      if (!lights.length) {
        let sun=null, ambient=null;engine.scene.traverseVisible(o=>{if(o.isDirectionalLight&&!sun)sun=o;if(o.isHemisphereLight&&!ambient)ambient=o;});
        const dir=sun?sun.position.clone().sub(sun.target.position).normalize():new THREE.Vector3(0,1,0);
        lights.push({uCenter:{value:new THREE.Vector3(0,-1e12,0)},uRadius:{value:1},uSunDir:{value:dir},uSunE:{value:sun?sun.color.clone().multiplyScalar(sun.intensity):new THREE.Color(1,1,1)},uAmbientFloor:{value:ambient?ambient.color.clone().multiplyScalar(ambient.intensity):new THREE.Color(0.001,0.001,0.001)}});
      }
      opaqueObjects.push({...entry,body});
    }
    stage('visibility');
    const opaque = opaqueObjects.map(({object,material,body,group})=>{const draw=this.opaque.prepare(object,material,body,this.projection,camera);if(draw)draw.group=group;return draw;}).filter(Boolean);
    stage('draw preparation');
    this.ensureCapacity(draw.length, lights.length);
    draw.forEach(({ object, u, body }, i) => {
      const k = i * OBJECT_FLOATS, data = this.objectData;
      data.set(object.matrixWorld.elements, k);
      vec(data, k + 16, value(u, 'uCamLocal')); data[k + 19] = value(u, 'uMorph').x;
      vec(data, k + 20, value(u, 'uNearOff')); data[k + 23] = value(u, 'uMorph').y;
      vec(data, k + 24, value(u, 'uNearUp')); data[k + 27] = value(u, 'uNear').x;
      data[k + 28] = value(u, 'uNear').y; data[k + 29] = value(u, 'uNearMode');
      data[k + 30] = value(u, 'uNearBand').x; data[k + 31] = value(u, 'uNearBand').y;
      data[k + 32] = body;
      vec(data, k + 36, value(u, 'uOriginMod')); vec(data, k + 40, value(u, 'uOriginRel'));
    });
    lights.forEach((u, i) => {
      const k = i * 16, data = this.bodyData;
      vec(data, k, value(u, 'uSunDir')); vec(data, k + 4, value(u, 'uSunE'));
      vec(data, k + 8, value(u, 'uAmbientFloor')); vec(data, k + 12, value(u, 'uCenter'));
    });
    const data = this.frameData;
    data.set(this.viewProjection.elements, 0); data.set(this.inverse.elements, 16);
    data[32] = view.width; data[33] = view.height;
    data[34] = Math.max(engine.minExposure, Math.min(view.maxExposure, 0.18 / Math.max(view.meterRef, 1e-9))) * view.exposureBias;
    data[35] = this.flat ? 1 : 0;
    const d = this.device;
    d.queue.writeBuffer(this.frameBuffer, 0, data);
    if (draw.length) d.queue.writeBuffer(this.objectBuffer, 0, this.objectData, 0, draw.length * OBJECT_FLOATS);
    if (lights.length) d.queue.writeBuffer(this.bodyBuffer, 0, this.bodyData, 0, lights.length * 16);
    const lightGroups = lights.map((u, i) => this.lightBindings.get(u.uCenter || u, {
      ...u, ...(this.shadows.state ? this.shadows.uniforms : this.opaque.uniformOverrides), uBodyIndex: { value: i },
      ...(!u.tCloudShadow?.value?.userData?.webgpuRecipe ? { tCloudShadow: { value: null }, uCSOn: { value: 0 } } : {}),
    }).group);
    const t = this.target(view),effects=this.materialEffects.plan(engine.scene,draw,opaque,options.enabled);t.activeGbuffer=effects.process?t.shadedGbuffer:t.gbuffer;stage('frame bindings'); let encoder = d.createCommandEncoder({ label: 'deferred frame' });
    this.opaque.culler.encode(encoder,opaque,this.frustum,camera);
    this.terrainCuller.encode(encoder,draw,this.frustum);
    let pass = encoder.beginRenderPass({ label: 'G-buffer',
      colorAttachments: t.gbuffer.map((texture) => ({ view: texture.createView(), clearValue: [0, 0, 0, 0], loadOp: 'clear', storeOp: 'store' })),
      depthStencilAttachment: { view: t.depth.createView(), depthClearValue: 0, depthLoadOp: 'clear', depthStoreOp: 'store' },
      timestampWrites: this.timer.writes('gbuffer'),
    });
    pass.setPipeline(this.terrainPipeline); pass.setBindGroup(0, this.frameGroup);
    let triangles = 0;
    draw.forEach(({ geometry: g, surface }, i) => {
      pass.setBindGroup(2, surface.group);
      pass.setBindGroup(1, g.bindGroup); pass.setIndexBuffer(g.indexBuffer, g.indexFormat);
      pass.setVertexBuffer(0,this.objectIndices,i*4,4);pass.drawIndexedIndirect(this.terrainCuller.args,i*20); triangles += g.count / 3;
    });
    pass.end();
    if(effects.capture)this.materialEffects.captureGround(encoder,t);
    pass = encoder.beginRenderPass({label:'opaque G-buffer',colorAttachments:t.gbuffer.map(texture=>({view:texture.createView(),loadOp:'load',storeOp:'store'})),depthStencilAttachment:{view:t.depth.createView(),depthLoadOp:'load',depthStoreOp:'store'},timestampWrites:this.timer.writes('opaque')});
    triangles += this.opaque.draw(pass, opaque);
    pass.end();
    if(effects.process)this.materialEffects.render(encoder,engine,t,this.inverse,effects);
    this.gtao.render(encoder,t,this.inverse,camera);
    for (const [label, texture, pipeline, group] of [
      ['lighting', t.hdr, this.lightPipeline, effects.process?t.lightGroup:t.rawLightGroup], ['post', t.output, this.postPipeline, t.postGroup],
    ]) {
      if (label === 'post') {
        d.queue.submit([encoder.finish()]);stage('opaque encoding');
        this.localLights.render(engine,t,this.inverse,!this.flat);
        this.forward.clusterGroup=t.clusterGroup;this.forward.bodyLights=lights;
        this.forward.uniformOverrides=this.opaque.uniformOverrides;
        triangles+=this.forward.liquids(engine,t,this.projection,this.frustum,this.air);
        this.forward.stars(engine,t,this.projection);
        const hdr = this.air.render(engine, t);
        triangles+=this.forward.effects(engine,t,hdr,this.projection,this.frustum);
        stage('lighting and atmosphere');encoder = d.createCommandEncoder({ label: 'post and present' });
        if (engine.toneMat) { this.post.render(engine, t, hdr); continue; }
        t.postGroup = d.createBindGroup({ layout: this.postLayout, entries: [{ binding: 0, resource: hdr.createView() }] });
      }
      pass = encoder.beginRenderPass({ label, colorAttachments: [{ view: texture.createView(), clearValue: [0, 0, 0, 1], loadOp: 'clear', storeOp: 'store' }], timestampWrites: this.timer.writes(label) });
      pass.setPipeline(pipeline); pass.setBindGroup(0, this.frameGroup); pass.setBindGroup(1, label === 'post' ? t.postGroup : group);
      if (label === 'lighting') { for (const body of lightGroups) { pass.setBindGroup(2, body); pass.draw(3); } }
      else pass.draw(3);
      pass.end();
    }
    if (!view.out) {
      const canvasTexture = this.context.getCurrentTexture();
      if (animate) {
        pass = encoder.beginRenderPass({ timestampWrites:this.timer.writes('canvas clear'),colorAttachments: [{ view: canvasTexture.createView(), clearValue: [0, 0, 0, 1], loadOp: 'clear', storeOp: 'store' }] }); pass.end();
      }
      const x = Math.floor(view.rect.x * engine.pixelRatio), y = Math.floor(view.rect.y * engine.pixelRatio);
      encoder.copyTextureToTexture({ texture: t.output }, { texture: canvasTexture, origin: [x, y] }, [Math.min(t.width, this.canvas.width - x), Math.min(t.height, this.canvas.height - y)]);
    }
    const timed = this.timer.finish(encoder);
    d.queue.submit([encoder.finish()]);
    if (timed) this.timingReady = this.timer.harvest().catch(this.onError);
    stage('post and present');this.lastView = view;
    this.stats = { calls: draw.length + opaque.length, triangles, geometries: this.geometries.size, submitMs: performance.now() - start, passes: this.timer.last, cpu, optimizations:{...options}, materialEffects:effects.process,groundCopy:effects.capture,timingCoverage:this.timer.coverage };
    engine.gpuMs = this.timer.gpuMs || 0;
  }
  setOptimizations(enabled){tuning(this.device).enabled=!!enabled;}
  get optimizationsEnabled(){return tuning(this.device).enabled;}
  releaseView(view){const t=this.targets.get(view);if(!t)return;this.air.release(t);this.post.release(t);this.localLights.release(t);for(const texture of t.textures)texture.destroy();this.targets.delete(view);if(view.out)this.textures.renderTargets.delete(view.out.texture);}
  async capture(view = this.lastView) {
    const t = this.targets.get(view);
    if (!t) throw new Error('Render a WebGPU frame before capturing');
    return readRGBA(this.device, t.output, t.width, t.height, this.format);
  }
  async captureURL(view) {
    const { pixels, width, height } = await this.capture(view);
    const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
    canvas.getContext('2d').putImageData(new ImageData(pixels, width, height), 0, 0);
    return canvas.toDataURL('image/png');
  }
  dispose() {
    if (this.disposed) return; this.disposed = true;
    for (const geometry of [...this.geometries]) geometry.dispose();
    for (const target of this.targets.values()) { this.air.release(target); this.post.release(target); this.localLights.release(target); for (const texture of target.textures) texture.destroy(); }
    this.targets.clear(); this.timer.dispose(); this.surfaces.dispose(); this.background.dispose(); this.shadows.dispose(); this.opaque.dispose(); this.forward.dispose(); this.localLights.dispose(); this.gtao.dispose(); this.map.dispose(); this.terrainCuller.dispose(); this.materialEffects.dispose(); this.lightBindings.dispose(); this.passes.dispose(); this.textures.dispose();
    this.frameBuffer?.destroy(); this.objectBuffer?.destroy(); this.objectIndices?.destroy(); this.bodyBuffer?.destroy();
    this.releaseContext(); this.device.destroy();
  }
}
