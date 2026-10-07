import fs from 'node:fs/promises';
import { translate } from './translate.mjs';
import { prune } from './prune.mjs';
const root=process.env.STARSEED_SHADER_ROOT,compiler=process.argv[2],output=process.argv[3];
const A=await import(root+'/src/render/atmosphere.js'),S=await import(root+'/src/render/sunShadows.js'),T=await import(root+'/src/render/terrainShadow.js'),M=await import(root+'/src/render/moonlight.js');
const globals=`uniform vec3 uSunDir;uniform vec3 uSunE;uniform vec3 uCenter;uniform float uRadius;uniform mat3 uToFixed;uniform vec4 uCloud;uniform float uCloudOn;uniform float uCloudOpacity;uniform sampler3D tNoise;uniform sampler2D tCloudMap;uniform float uCloudMapMean;uniform vec3 uAmbientFloor;const float PI=3.14159265359;`;
const light=(await fs.readFile(new URL('./lighting.glsl',import.meta.url),'utf8')).split('void main()')[0];
let fragment=await fs.readFile(new URL('./standard.frag.glsl',import.meta.url),'utf8');
fragment=fragment.slice(0,fragment.indexOf(' materialOutput('))+`
 float kind=uInterior>0.5?5.0:4.0;
 vec3 color=deferredLight(vWorld,N,base.rgb,rough,ao,0.0,0.04,1.0,0.0,length(fwidth(vWorld)),metal,kind,1.0)+emit;
 color+=nativeLocal(vWorld,N,vec4(base.rgb,ao),vec4(0.0,0.0,metal,0.04),rough,kind,gl_FragCoord.xy);
 if(uFlags.y>0.5)color=base.rgb+emit;
 float alpha=base.a;
 if(uCanopy>0.5){if(gl_FrontFacing){float fresK=pow(1.0-abs(dot(N,normalize(-vWorld))),2.5);alpha=mix(0.16,0.85,fresK);color+=vec3(0.05,0.07,0.09)*fresK;}else alpha=0.06;}
 gl_FragColor=vec4(color,alpha);
}`;
const native=`uniform float uInterior;uniform float uCanopy;
vec3 nativeLocal(vec3 clusterWorld,vec3 clusterNormal,vec4 clusterAlbedo,vec4 clusterSurface,float clusterRough,float clusterKind,vec2 clusterPixel){return vec3(12345.0);}
`;
const descriptor=await translate('standardForwardFragment',prune(globals+A.GLSL_SURFACE_ATMO+A.GLSL_CLOUD_N+A.GLSL_CLOUD_SHADOW+A.GLSL_THERMAL+T.GLSL_TERRAIN_SHADOW+S.GLSL_SUN_SHADOW+S.GLSL_SKY_SHADOW+M.GLSL_MOON+light+native+fragment),output,compiler,{group:1,varyings:['vObjPos','vObjN','vWorld','vNormal','vColor','vUv','vUv1','vUv2']});
let text=await fs.readFile(output+'/standardForwardFragment.js','utf8');
if(!text.includes('return vec3(12345f);'))throw Error('Native clustered-light hook changed');
text="import { CLUSTER_LIGHTING } from '../cluster-shader.js';\n"+text.replace('export const code = /* wgsl */`',"export const code = CLUSTER_LIGHTING.replaceAll('@group(0)', '@group(2)') + /* wgsl */`").replace('return vec3(12345f);','return clusterLight(clusterWorld,clusterNormal,clusterAlbedo,clusterSurface,clusterRough,u32(clusterKind),clusterPixel);');
await fs.writeFile(output+'/standardForwardFragment.js',text);
console.log('Generated transparent PBR with shared clustered lighting, '+descriptor.layout.textures.length+' textures');
