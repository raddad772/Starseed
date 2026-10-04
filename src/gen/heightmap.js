// A world's heights on the six cube faces (cubesphere.js's equiangular grid), coarse: what the
// terrain's shadows are marched through (render/terrainShadow.js). Each texel the surface (the sea's
// over the deep, a lake's over its bed), band-limited to the texel's size.
import { dirFromFaceUV } from './cubesphere.js';
import { S_LEN, surfaceOf } from './terrain.js';

export function heightFace(gen, face, size) {
  const out = new Float32Array(size * size), s = new Float64Array(S_LEN), d = [0, 0, 0];
  // (a texel's width at the face's middle: the band limit)
  const texel = (Math.PI / 2) * gen.R / size;
  for (let j = 0; j < size; j++) {
    const v = -1 + (j + 0.5) * 2 / size;
    for (let i = 0; i < size; i++) {
      dirFromFaceUV(face, -1 + (i + 0.5) * 2 / size, v, d);
      gen.sample(d[0], d[1], d[2], texel, s);
      out[j * size + i] = surfaceOf(gen, s);
    }
  }
  return out;
}
