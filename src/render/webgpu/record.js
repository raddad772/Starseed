// Temporary scene-producer bridge during parity testing. Records the existing
// LUT/material producers; the WebGPU device computes its own copies from WGSL.
import { shaderKey, snapshotUniforms } from './uniforms.js';
export function recordPasses(renderer, supported) {
  const render = renderer.render.bind(renderer), keys = new Set(supported);
  const hashes = new WeakMap(); let revision = 0;
  renderer.render = (scene, camera) => {
    const target = renderer.getRenderTarget();
    if (target && camera.isOrthographicCamera && scene.children.length === 1) {
      const material = scene.children[0].material;
      if (material?.fragmentShader) {
        let key = hashes.get(material); if (!key) { key = shaderKey(material.fragmentShader); hashes.set(material, key); }
        if (keys.has(key)) {
          const recipe = { key, revision: ++revision, uniforms: snapshotUniforms(material.uniforms), target };
          for (const texture of target.textures) texture.userData.webgpuRecipe = recipe;
        }
      }
    }
    return render(scene, camera);
  };
}
