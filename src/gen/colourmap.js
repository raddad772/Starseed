// A world's ground as seen from afar, on the six cube faces (cubesphere.js's equiangular grid): each
// texel the colour the terrain's own vertices take there (shade's: the land's, or the water's own over
// the sea and the lakes) and whether it's under water. The terrain's far chunks have their vertices
// kilometres apart, and drew a coast, a forest's edge, the sea's shallows at that fineness, blocks seen
// from orbit; past where the map is finer than they are, the ground's colour and its shore are read
// from it instead (render/colourCube.js, which takes its shore's distance from the water here).
// Sampled and shaded as the vertices are: band-limited to the texel, its slope from its neighbours'.
import { dirFromFaceUV } from './cubesphere.js';
import { S_LEN, S_H } from './terrain.js';
import { MAT_N } from './matclasses.js';

// (as chunkbuilder.js's vertices: the colour's square root over the byte)
const enc = (c) => Math.max(0, Math.min(255, Math.round(Math.sqrt(Math.max(c, 0)) * 255)));
// the shore's distance's reach (texels each way) over the byte's half: far enough out to set the surf's
// crests along the coast (liquid.js surfPhase: ~3.7 km on an Earth)
export const COLOUR_SHORE_R = 24;

// rows j0 .. j1 - 1 of a face size texels a side: RGBA bytes, a 255 under water and 0 on land
export function colourFace(gen, face, size, j0 = 0, j1 = size) {
  const out = new Uint8Array((j1 - j0) * size * 4);
  const texel = (Math.PI / 2) * gen.R / size, d = [0, 0, 0], col = [0, 0, 0], mat = new Float64Array(MAT_N);
  // (three rows of samples at a time: a row's slope from the rows either side)
  const rows = [0, 1, 2].map(() => new Float64Array(size * S_LEN));
  const sampleRow = (j, buf) => {
    const v = -1 + (Math.min(Math.max(j, 0), size - 1) + 0.5) * 2 / size;
    for (let i = 0; i < size; i++) {
      dirFromFaceUV(face, -1 + (i + 0.5) * 2 / size, v, d);
      gen.sample(d[0], d[1], d[2], texel, buf.subarray(i * S_LEN, (i + 1) * S_LEN));
    }
  };
  sampleRow(j0 - 1, rows[(j0 + 2) % 3]); sampleRow(j0, rows[j0 % 3]);
  const shadeSp = gen._shadeSp;
  gen._shadeSp = texel;
  for (let j = j0; j < j1; j++) {
    const below = rows[(j + 2) % 3], here = rows[j % 3], above = rows[(j + 1) % 3];
    sampleRow(j + 1, above);
    for (let i = 0; i < size; i++) {
      const s = here.subarray(i * S_LEN, (i + 1) * S_LEN);
      const hl = here[Math.max(i - 1, 0) * S_LEN + S_H], hr = here[Math.min(i + 1, size - 1) * S_LEN + S_H];
      const gx = (hr - hl) / (2 * texel), gy = (above[i * S_LEN + S_H] - below[i * S_LEN + S_H]) / (2 * texel);
      gen.shade(s, 1 - 1 / Math.sqrt(1 + gx * gx + gy * gy), col, mat, null);
      const k = (j - j0) * size + i;
      out[k * 4] = enc(col[0]); out[k * 4 + 1] = enc(col[1]); out[k * 4 + 2] = enc(col[2]);
      out[k * 4 + 3] = mat[4] > 0 ? 255 : 0;
    }
  }
  gen._shadeSp = shadeSp;
  return out;
}
