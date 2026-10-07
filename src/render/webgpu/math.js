// Right-handed camera, -Z forward, WebGPU 0..1 clip depth: near=1, far=0.
// Build independently of Three's WebGL clip-control state.
export function reversedPerspective(fov, aspect, near, far, out = new Float32Array(16)) {
  if (!(near > 0 && far > near && aspect > 0 && fov > 0 && fov < 180)) throw new RangeError('Invalid perspective frustum');
  const f = 1 / Math.tan(fov * Math.PI / 360);
  out.fill(0);
  out[0] = f / aspect; out[5] = f; out[11] = -1;
  out[10] = far === Infinity ? 0 : near / (far - near);
  out[14] = far === Infinity ? near : near * (far / (far - near));
  return out;
}

// THREE.BufferAttribute accessors decode normalized integer and interleaved worker attributes.
// Keep the worker buffers immutable, including those shared with physics and the WebGL comparison.
export function packTerrain(geometry) {
  const a = geometry.attributes, count = a.position.count;
  const data = new Float32Array(count * 44);
  const copy = (attribute, vertex, offset, size, fallback = 0) => {
    for (let j = 0; j < size; j++) data[offset + j] = attribute && j < attribute.itemSize ? attribute.getComponent(vertex, j) : fallback;
  };
  for (let i = 0; i < count; i++) {
    const k = i * 44;
    copy(a.position, i, k, 3); copy(a.occ, i, k + 3, 1);
    copy(a.morph || a.position, i, k + 4, 3);
    copy(a.nrm, i, k + 8, 4); copy(a.mnrm || a.nrm, i, k + 12, 4);
    copy(a.col, i, k + 16, 4); copy(a.mcol || a.col, i, k + 20, 4);
    copy(a.ext, i, k + 24, 4);
    copy(a.mat, i, k + 28, 4);
    copy(a.cls0, i, k + 32, 4); copy(a.cls1, i, k + 36, 4); copy(a.cls2, i, k + 40, 4);
  }
  return data;
}
