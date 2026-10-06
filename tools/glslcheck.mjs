// Offline compile check of the terrain material's shaders (the ground's and the rivers' water,
// terrainMaterial.js's RIBBON), the rocks' (rockRender.js) and the floes' (floeRender.js), with three's chunks pasted in, through glslangValidator: catches a
// shader that won't compile (a black or see-through world in the browser) without loading the game.
//   node tools/glslcheck.mjs [outDir]
import fs from 'node:fs';
import os from 'node:os';
import { execSync } from 'node:child_process';
const THREE = await import('../node_modules/three/build/three.module.js');
const TM = await import('../src/render/terrainMaterial.js');
const RR = await import('../src/render/rockRender.js');
const FR = await import('../src/render/floeRender.js');
const D = process.argv[2] || fs.mkdtempSync(os.tmpdir() + '/glslcheck-');
const expand = (src) => src.replace(/#include <(\w+)>/g, (_, k) => THREE.ShaderChunk[k] ?? (() => { throw new Error('chunk ' + k); })());
const prefixF = `#version 300 es
precision highp float; precision highp int; precision highp sampler3D;
#define gl_FragColor pc_fragColor
out highp vec4 pc_fragColor;
#define texture2D texture
uniform mat4 viewMatrix; uniform vec3 cameraPosition; uniform bool isOrthographic;
`;
const prefixV = `#version 300 es
precision highp float; precision highp int;
#define attribute in
#define varying out
uniform mat4 modelMatrix; uniform mat4 modelViewMatrix; uniform mat4 projectionMatrix; uniform mat4 viewMatrix; uniform mat3 normalMatrix; uniform vec3 cameraPosition; uniform bool isOrthographic;
in vec3 position;
`;
let bad = 0;
for (const [name, mat] of [['terrain', TM.makeTerrainMaterial({})], ['ribbon', TM.makeRibbonMaterial({ uniforms: {} })], ['rock', RR.ROCK_SHADERS], ['floe', FR.FLOE_SHADERS], ['block', FR.BLOCK_SHADERS]]) {
  const defs = Object.entries({ ...(mat.defines || {}), MAT_MODE: 3 }).map(([k, v]) => `#define ${k} ${v}`).join('\n') + '\n';
  for (const [st, src, pre] of [['frag', mat.fragmentShader, prefixF.replace('out highp', defs + '#define varying in\nout highp')], ['vert', mat.vertexShader, prefixV + (name === 'rock' ? 'in mat4 instanceMatrix;\n' : name === 'floe' ? 'in vec3 normal;\n' : name === 'block' ? 'in vec3 normal;\nin mat4 instanceMatrix;\n' : '') + defs]]) {
    const f = `${D}/${name}.${st}`;
    fs.writeFileSync(f, (pre + expand(src)).replace(/\baverage\(/g, 'average_('));
    try { execSync(`glslangValidator ${f}`, { stdio: 'pipe' }); console.log(name, st, 'ok'); }
    catch (e) { bad++; console.log(name, st, 'FAILED\n' + String(e.stdout).split('\n').slice(0, 8).join('\n')); }
  }
}
process.exit(bad ? 1 : 0);
