// std140 layout written by tools/shaders/translate.mjs and consumed by Naga's
// generated WGSL. Offsets are in bytes; vec3 may share its last slot with a scalar.
export function packUniformsReference(layout, uniforms, data = new ArrayBuffer(layout.bytes)) {
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

// Decode immutable shader layouts once, rather than running type regexes for
// every field of every object in every shadow/main pass.
const packingLayouts = new WeakMap(), packingViews = new WeakMap();
export function packUniforms(layout, uniforms, data = new ArrayBuffer(layout.bytes)) {
  let fields = packingLayouts.get(layout);
  if (!fields) {
    fields = layout.uniforms.map(field => ({ ...field, offset: field.offset / 4, stride: field.stride / 4,
      matrix: Number(/^mat(\d)$/.exec(field.type)?.[1] || 0),
      width: Number(/vec(\d)/.exec(field.type)?.[1] || 1),
      storage: /^(i|b)/.test(field.type) ? 1 : /^u/.test(field.type) ? 2 : 0 }));
    packingLayouts.set(layout, fields);
  }
  let views = packingViews.get(data);
  if (!views) { views = [new Float32Array(data), new Int32Array(data), new Uint32Array(data)]; packingViews.set(data, views); }
  const f = views[0]; f.fill(0);
  for (const field of fields) {
    const values = uniforms[field.name]?.value, dst = views[field.storage];
    for (let index = 0; index < (field.count || 1); index++) {
      const value = field.count ? values?.[index] : values;
      const offset = field.offset + (field.count ? index * field.stride : 0);
      if (field.matrix) {
        const n = field.matrix, array = value?.elements || value;
        for (let c = 0; c < n; c++) for (let r = 0; r < n; r++) f[offset + c * 4 + r] = array?.[c * n + r] ?? (c === r ? 1 : 0);
      } else if (field.width === 1) dst[offset] = value ?? 0;
      else if (value?.isColor) for (let k = 0; k < field.width; k++) dst[offset + k] = value[['r','g','b'][k]] ?? 0;
      else for (let k = 0; k < field.width; k++) dst[offset + k] = value?.getComponent?.(k) ?? value?.[k] ?? 0;
    }
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
