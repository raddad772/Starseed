// Offline migration utility only; never loaded by the browser. Expose shader
// constants for translation without changing the legacy renderer's runtime API.
import fs from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
const root = process.env.STARSEED_SHADER_ROOT || new URL('../../', import.meta.url).pathname;
export async function resolve(specifier, context, nextResolve) {
  if (specifier === 'three') return { url: pathToFileURL(root + '/vendor/three.module.js').href, shortCircuit: true };
  return nextResolve(specifier, context);
}
export async function load(url, context, nextLoad) {
  const result = await nextLoad(url, context);
  if (url.startsWith(pathToFileURL(root + '/src/render/').href) && result.format === 'module') {
    let source = String(result.source);
    const names = [...source.matchAll(/^const ([A-Z][A-Z_0-9]*)\s*=\s*(?:\/\* glsl \*\/)?\s*`/gm)].map(m=>m[1]);
    if(names.length) source += '\nexport { '+names.join(',')+' };\n';
    return {...result, source};
  }
  return result;
}
