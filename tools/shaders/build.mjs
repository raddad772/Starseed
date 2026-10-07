import { translate } from './translate.mjs';
import fs from 'node:fs/promises';
import {shaderKey} from '../../src/render/webgpu/uniforms.js';
const root=process.env.STARSEED_SHADER_ROOT, output=process.argv[3],compiler=process.argv[2];
if(!root||!output||!compiler)throw Error('Set STARSEED_SHADER_ROOT; pass Naga CLI and output directory');
const A=await import(root+'/src/render/atmosphere.js'),S=await import(root+'/src/render/sunShadows.js'),T=await import(root+'/src/render/terrainShadow.js'),M=await import(root+'/src/render/moonlight.js');
const globals=`
uniform vec3 uSunDir; uniform vec3 uSunE; uniform vec3 uCenter; uniform float uRadius; uniform mat3 uToFixed;
uniform vec4 uCloud; uniform float uCloudOn; uniform float uCloudOpacity; uniform sampler3D tNoise; uniform sampler2D tCloudMap; uniform float uCloudMapMean;
uniform vec3 uAmbientFloor; uniform float uBodyIndex;
const float PI = 3.14159265359;
`;
const C=await import(root+'/src/render/cloudShadow.js');
const body=await fs.readFile(new URL('./lighting.glsl',import.meta.url),'utf8');
await translate('lighting',globals+A.GLSL_SURFACE_ATMO+A.GLSL_CLOUD_N+A.GLSL_CLOUD_SHADOW+A.GLSL_THERMAL+T.GLSL_TERRAIN_SHADOW+S.GLSL_SUN_SHADOW+S.GLSL_SKY_SHADOW+M.GLSL_MOON+body,output,compiler,{library:true});
const V=await import(root+'/src/render/volume.js');
const E=await import(root+'/src/render/engine.js');
const imports=[],entries=[];
for(const [name,shader,screen,outputs] of [['transmittance',A.TRANSMITTANCE_FRAG],['multiscattering',A.MS_FRAG],['irradiance',A.IRRADIANCE_FRAG],['skyview',A.SKYVIEW_FRAG],['cloudshadow',C.CLOUD_SHADOW_FRAG],['atmosphere',A.PASS_FRAG,true,2],['volume',V.FRAG,true,2],['composite',V.VOLUME_COMPOSITE_FRAG,true,1],['luminance',E.LUM_FRAG,true],['adapt',E.ADAPT_FRAG],['bright',E.BRIGHT_FRAG,true],['bloomdown',E.DOWN_FRAG,true],['bloomup',E.UP_FRAG,true],['tonemap','uniform float toneMappingExposure;\n'+E.TONEMAP_FRAG,true]]){await translate(name,shader,output,compiler,{group:0,screen});imports.push(`import * as ${name} from './${name}.js';`);entries.push(`{name:'${name}',key:'${shaderKey(shader)}',outputs:${outputs||1},...${name}}`);}
await fs.writeFile(output+'/passes.js',imports.join('\n')+'\nexport const passes = ['+entries.join(',')+'];\n');
console.log('Generated lighting and atmosphere WGSL');
