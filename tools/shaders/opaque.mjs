// Material-only ports. Geometry equations stay identical to the scene producers;
// all opaque families write the same G-buffer and share one lighting pass.
import fs from 'node:fs/promises';
import { translate } from './translate.mjs';
import { shaderKey } from '../../src/render/webgpu/uniforms.js';
const root=process.env.STARSEED_SHADER_ROOT, compiler=process.argv[2], output=process.argv[3];
const R=await import(root+'/src/render/rockRender.js'),F=await import(root+'/src/render/floraRender.js'),I=await import(root+'/src/render/floeRender.js');
const clean=s=>s.replace(/\/\*[\s\S]*?\*\//g,'').replace(/\/\/[^\n]*/g,'').replace(/#include[^\n]*/g,'');
// Remove functions unreachable from main before extracting uniforms. This keeps
// lighting's textures out of the material stage and stays within baseline limits.
import { prune } from './prune.mjs';
const outputGLSL=`
uniform float uBodyIndex;
layout(location=0) out vec4 gAlbedo;
layout(location=1) out vec4 gNormal;
layout(location=2) out vec4 gEmission;
layout(location=3) out vec4 gSurface;
vec2 octEncode(vec3 n){n/=abs(n.x)+abs(n.y)+abs(n.z);return n.z>=0.0?n.xy:(1.0-abs(n.yx))*vec2(n.x>=0.0?1.0:-1.0,n.y>=0.0?1.0:-1.0);}
void materialOutput(vec3 albedo,vec3 normal,float roughness,float ao,float trans,float wet,float F0){
 gAlbedo=vec4(clamp(albedo,0.0,1.0),clamp(ao,0.0,1.0));gNormal=vec4(octEncode(normalize(normal)),roughness,uBodyIndex);
 gEmission=vec4(0.0,0.0,0.0,1.0);gSurface=vec4(trans,wet,0.0,F0);
}
`;
const prefix=`#define USE_INSTANCING\n#define USE_INSTANCING_COLOR\nconst float PI=3.14159265359;\n`;
const vertexPrelude=`uniform mat4 modelMatrix;uniform mat4 viewMatrix;uniform mat4 projectionMatrix;
attribute vec3 position;attribute vec3 normal;attribute vec4 instance0;attribute vec4 instance1;attribute vec4 instance2;attribute vec4 instance3;attribute vec3 instanceColor;
#define instanceMatrix mat4(instance0,instance1,instance2,instance3)
`;
let rock=clean(R.FRAG);rock=rock.slice(0,rock.indexOf('float muS = dot(up, uSunDir);'))+'materialOutput(albedo,N,rough,ao,0.0,0.0,0.04);\n}';
let flora=clean(F.FRAG);flora=flora.slice(0,flora.indexOf('float ndl = max(dot(N, uSunDir), 0.0);'))+'materialOutput(albedo,N,0.8,ao,(vPart>0.5 && vPart<1.5?0.35:0.0)*(1.0-snowK),0.0,0.04);\n}';
flora=flora.replace(/float seam\s*=\s*0\.0;[\s\S]*?(?=float snowK\s*=\s*0\.0;)/,'float ao=vAo;\n');
flora=flora.replace(/vec3 sunA = atmoSunTransmittance[\s\S]*?vec3 sunT = sunTop \* keySh;/,'float skyBl=skyBlocked(vWorld),skyK=1.0-skyBl;');
flora=flora.replace('float foot = length(fwidth(vWorld));', 'float foot = length(fwidth(vWorld));\nvec2 uvDx=dFdx(vUv),uvDy=dFdy(vUv);\nvec3 fdx=uToFixed*dFdx(vWorld),fdy=uToFixed*dFdy(vWorld);');
flora=flora.replace('vec3 fdx = dFdx(pF), fdy = dFdy(pF);','').replaceAll('texture2D(tBark, vUv)','textureGrad(tBark,vUv,uvDx,uvDy)').replaceAll('texture2D(tLeaf, vUv)','textureGrad(tLeaf,vUv,uvDx,uvDy)').replace('ddx = dFdx(tx), ddy = dFdy(tx)','ddx = uvDx * vec2(textureSize(tLeaf,0)), ddy = uvDy * vec2(textureSize(tLeaf,0))');
let ice=clean(I.FRAG);ice=ice.slice(0,ice.indexOf('vec3 color = alb / PI'))+'materialOutput(alb,N2,mix(0.22,0.7,snowy),1.0,0.0,pond,0.02);\n}';
ice=ice.replace(/vec3 sunA = atmoSunTransmittance[\s\S]*?vec3 N2 =/,'vec3 N2 =');
const G=await import(root+'/src/render/grassRender.js'),S=await import(root+'/src/render/sunShadows.js');
const grassVertex='#define GRASS_TRUNKS\n'+clean(S.GLSL_TRUNK_VS)+clean(G.GLSL_BLADE)+`
#define GRASS_TRUNKS
uniform vec3 uSunShadowDir;
varying vec3 vNormal;varying vec3 vTint;
void main(){vec3 p=grassBlade(instanceMatrix);vec4 wp=modelMatrix*instanceMatrix*vec4(p,1.0);vNormal=normalize(mat3(modelMatrix)*instanceMatrix[1].xyz);vTint=instanceColor;vGS/=max(dot(vNormal,uSunShadowDir),0.08);gl_Position=projectionMatrix*viewMatrix*wp;}`;
const grassFragment=`varying float vGA;varying float vGSide;varying float vGT;varying float vGK;varying float vGS;varying vec3 vNormal;varying vec3 vTint;
void main(){vec3 albedo=vTint*mix(0.3,1.0,pow(vGT,0.8))*(0.82+0.36*vGK);materialOutput(albedo,normalize(vNormal),0.85,1.0,0.0,0.0,0.04);gEmission.a=-exp(-vGS);}`;
const standardVertex=await fs.readFile(new URL('./standard.vert.glsl',import.meta.url),'utf8'),standardFragment=await fs.readFile(new URL('./standard.frag.glsl',import.meta.url),'utf8');
const Sky=await import(root+'/src/render/sky.js'),Giant=await import(root+'/src/render/giant.js');
const sunFragment=clean(Sky.SUN_FRAG).replace('gl_FragColor = vec4(c, 1.0);','materialOutput(vec3(0.0),normalize(vN),0.8,1.0,0.0,0.0,0.04);gEmission.rgb=c;');
let giantFragment=clean(Giant.GIANT_FRAG.replace('float ringDensity(float r);',Giant.GLSL_RING_DENSITY));
giantFragment=giantFragment.replace('vec3 sunT = atmoSunTransmittance(length(rel), muS);','float sunT=1.0;');
giantFragment=giantFragment.slice(0,giantFragment.indexOf('vec3 skyE = atmoSkyIrradiance'))+'materialOutput(col,N,0.9,1.0,0.0,0.0,0.0);gEmission.a=-sunT;\n}';
const imports=[],entries=[];
for(const [name,vert,frag,modes] of [['rock',R.VERT,rock,[0,2,3]],['flora',F.VERT,flora,[0,2,3]],['floe',I.VERT,ice,[3]],['iceblock',I.BLOCK_VERT,ice,[3]],['grass',grassVertex,grassFragment,[3]],['standard',standardVertex,standardFragment,[3]],['sun',Sky.SUN_VERT,sunFragment,[3]],['giant',Giant.GIANT_VERT,giantFragment,[3]]]) {
  const varyings=[...clean(frag).matchAll(/varying\s+\w+\s+(\w+)\s*;/g)].map(m=>m[1]);
  await translate(name+'Vertex',prune(prefix+vertexPrelude+clean(vert)),output,compiler,{stage:'vert',group:0,varyings});imports.push(`import * as ${name}Vertex from './${name}Vertex.js';`);
  for(const mode of modes){const fName=name+'Material'+mode;await translate(fName,prune('#define MAT_MODE '+mode+'\n'+prefix+outputGLSL+frag),output,compiler,{group:1,varyings});imports.push(`import * as ${fName} from './${fName}.js';`);entries.push(`{name:'${name}',key:'${name==='grass'||name==='standard'?name:shaderKey(vert)}',mode:${mode},vertex:${name}Vertex,fragment:${fName}}`);}
}
await fs.writeFile(output+'/opaque.js',imports.join('\n')+'\nexport const opaquePrograms = ['+entries.join(',')+'];\n');
console.log('Generated opaque geometry/material WGSL');
