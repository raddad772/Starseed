// std140 layout written by tools/shaders/translate.mjs and consumed by Naga's
// generated WGSL. Offsets are in bytes; vec3 may share its last slot with a scalar.
export function packUniforms(layout, uniforms, data = new ArrayBuffer(layout.bytes)) {
  const f = new Float32Array(data), i = new Int32Array(data), u = new Uint32Array(data);
  f.fill(0);
  const put = (field, value, offset) => {
    const matrix = /^mat(\d)$/.exec(field.type);
    if (matrix) {
      const n = Number(matrix[1]), a = value?.elements || value;
      for (let c = 0; c < n; c++) for (let r = 0; r < n; r++) f[offset + c * 4 + r] = a?.[c * n + r] ?? (c === r ? 1 : 0);
    } else {
      const count = Number(field.type.match(/vec(\d)/)?.[1] || 1);
      const dst = /^(i|b)/.test(field.type) ? i : /^u/.test(field.type) ? u : f;
      for (let k = 0; k < count; k++) dst[offset + k] = count === 1 ? (value ?? 0) : value?.getComponent?.(k) ?? (value?.isColor ? value[['r','g','b'][k]] : value?.[k]) ?? 0;
    }
  };
  for (const field of layout.uniforms) {
    const value = uniforms[field.name]?.value;
    if (field.count) for (let k = 0; k < field.count; k++) put(field, value?.[k], (field.offset + k * field.stride) / 4);
    else put(field, value, field.offset / 4);
  }
  return data;
}

export function shaderKey(source) {
  let h = 2166136261;
  for (let i = 0; i < source.length; i++) h = Math.imul(h ^ source.charCodeAt(i), 16777619);
  return (h >>> 0).toString(16);
}

export function snapshotUniforms(uniforms) {
  const copy = (v) => v?.isTexture ? v : v?.clone ? v.clone() : Array.isArray(v) ? v.map(copy) : ArrayBuffer.isView(v) ? v.slice() : v;
  return Object.fromEntries(Object.entries(uniforms).map(([k, u]) => [k, { value: copy(u.value) }]));
}
