// Starseed draws with its own WebGPU renderer and gives three-avbd a GPUDevice
// (World.create({ device })), so the solver never needs three.js's WebGPURenderer.
// world.js still imports 'three/webgpu' for its renderer path; pages map that
// specifier here.
export class StorageInstancedBufferAttribute {
  constructor() { throw new Error('three-avbd: create the World with { device }, not a three.js renderer'); }
}
