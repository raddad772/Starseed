import fs from 'node:fs/promises';
import { translate } from './translate.mjs';
import { shaderKey } from '../../src/render/webgpu/uniforms.js';
const root=process.env.STARSEED_SHADER_ROOT,compiler=process.argv[2],output=process.argv[3];
const S=await import(root+'/src/render/sunShadows.js'),F=await import(root+'/src/render/floraRender.js'),R=await import(root+'/src/render/rockRender.js'),G=await import(root+'/src/render/grassRender.js');
const clean=s=>s.replace(/\/\*[\s\S]*?\*\//g,'').replace(/\/\/[^\n]*/g,'').replace(/#include[^\n]*/g,'');
const vertexPrelude=`#define USE_INSTANCING\nuniform mat4 modelMatrix;uniform mat4 modelViewMatrix;uniform mat4 viewMatrix;uniform mat4 projectionMatrix;
attribute vec3 position;attribute vec4 instance0;attribute vec4 instance1;attribute vec4 instance2;attribute vec4 instance3;
#define instanceMatrix mat4(instance0,instance1,instance2,instance3)
`;
const coverVertex=G.GLSL_BLADE+'\nvoid main() { gl_Position = projectionMatrix * viewMatrix * modelMatrix * instanceMatrix * vec4(grassBlade(instanceMatrix), 1.0); }';
const coverFragment=`varying float vGA;varying float vGSide;void main(){gl_FragColor=vec4(vGA*2.0*max(0.0,1.0-abs(vGSide)),0.0,0.0,1.0);}`;
const imports=[],entries=[];
for(const [name,vs,fs] of [['depth',S.DEPTH_VERT,S.DEPTH_FRAG],['rockShadow',R.SHADOW_VERT,R.SHADOW_FRAG],['floraShadow',F.SHADOW_VERT,F.SHADOW_FRAG],['grassCover',coverVertex,coverFragment],['trunkSky',S.TRUNK_VERT,S.TRUNK_FRAG]]) {
 const varying=[...clean(vs).matchAll(/varying\s+\w+\s+(\w+)\s*;/g)].map(m=>m[1]);
 // Shadow atlas coordinates are kept in the existing bottom-up logical space.
 // Clip Z changes from Three's orthographic -1..1 to WebGPU's 0..1.
 let vertex=vertexPrelude+clean(vs);vertex=vertex.replace(/}\s*$/, 'gl_Position.y=-gl_Position.y;gl_Position.z=0.5*(gl_Position.z+gl_Position.w);\n}');
 let fragment=clean(fs);
 if(name==='floraShadow')fragment=fragment.replace('void main() {','void main() {\nvec2 uvDx=dFdx(vUv),uvDy=dFdy(vUv);').replace('ddx = dFdx(tx), ddy = dFdy(tx)','ddx = uvDx*vec2(textureSize(tLeaf,0)), ddy = uvDy*vec2(textureSize(tLeaf,0))').replace('texture2D(tLeaf, vUv)','textureGrad(tLeaf,vUv,uvDx,uvDy)');
 await translate(name+'Vertex',vertex,output,compiler,{stage:'vert',group:0,varyings:varying});await translate(name+'Fragment',fragment,output,compiler,{group:1,varyings:varying});
 imports.push(`import * as ${name}Vertex from './${name}Vertex.js';\nimport * as ${name}Fragment from './${name}Fragment.js';`);
 entries.push(`{name:'${name}',key:'${shaderKey(vs)}',mode:3,vertex:${name}Vertex,fragment:${name}Fragment}`);
}
await fs.writeFile(output+'/shadows.js',imports.join('\n')+'\nexport const shadowPrograms=['+entries.join(',')+'];\n');
for(const [name,fs] of [['skyblur',S.BLUR_FRAG],['skyrings',S.RINGS_FRAG]])await translate(name,fs,output,compiler,{group:0});
console.log('Generated shadow WGSL');
