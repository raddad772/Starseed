import fs from 'node:fs/promises';
import { translate } from './translate.mjs';
import { prune } from './prune.mjs';
import { shaderKey } from '../../src/render/webgpu/uniforms.js';
const root=process.env.STARSEED_SHADER_ROOT,compiler=process.argv[2],output=process.argv[3];
const T=await import(root+'/src/render/terrainMaterial.js'),P=await import(root+'/src/render/shipVisual.js'),B=await import(root+'/src/render/bigShips.js'),F=await import(root+'/src/render/falls.js'),G=await import(root+'/src/render/giant.js');
const clean=s=>s.replace(/\/\*[\s\S]*?\*\//g,'').replace(/\/\/[^\n]*/g,'').replace(/#include[^\n]*/g,'');
function removeBlock(s,marker,replacement=''){const a=s.indexOf(marker);if(a<0)throw Error('Missing shader block '+marker);let i=s.indexOf('{',a)+1,n=1;for(;n;i++){if(s[i]==='{')n++;if(s[i]==='}')n--;}return s.slice(0,a)+replacement+s.slice(i);}
let water=clean(T.FRAG);water=removeBlock(water,'if (isWater < 0.5)', 'if(isWater<0.5)discard;');water=removeBlock(water,'else {\n    float wrap','');
// Refraction and reflection project to the top-left origin used by the native
// screen textures. The shadow/LUT coordinates retain their existing conventions.
water=water.replace(/(vec[23] (?:sc|q|qh) = [^;]*\.xy\s*\/[^;]*\*\s*0\.5\s*\+\s*0\.5[^;]*;)/g,'$1');
// Central helpers cover projected ray samples as well as initial refraction.
water=water.replace('float sceneZ(vec2 uv) {','float sceneZ(vec2 uv) {\nuv.y=1.0-uv.y;');
water=water.replace(/texture\(tOpaque, ([^)]+)\)/g,'texture(tOpaque, vec2(($1).x,1.0-($1).y))');
// gl_FragCoord already uses native coordinates, unlike projected UVs.
water=water.replace('sceneZ(gl_FragCoord.xy / vec2(textureSize(tWaterDepth, 0)))','sceneZ(vec2(gl_FragCoord.x, float(textureSize(tWaterDepth,0).y)-gl_FragCoord.y) / vec2(textureSize(tWaterDepth,0)))');
const imports=[],entries=[];
for(const [name,vs,fs,defines] of [['water',T.VERT,water,'#define MAT_MODE 0\n'],['ribbon',T.RIBBON_VERT,water,'#define MAT_MODE 0\n#define RIBBON\n'],['plume',P.PLUME_VERT,P.PLUME_FRAG,''],['plasma',P.PLUME_VERT,P.PLASMA_FRAG,''],['field',B.FIELD_VERT,B.FIELD_FRAG,''],['spray',F.VERT,F.FRAG,''],['ring',G.RING_VERT,G.RING_FRAG.replace('float ringDensity(float r);',G.GLSL_RING_DENSITY),'']]){
 let fragment=prune(defines+'uniform mat4 viewMatrix;uniform mat4 projectionMatrix;\nconst float PI=3.14159265359;\n'+clean(fs));
 fragment=fragment.replace(/varying\s+(\w+)\s+(\w+)\s*;/g,(decl,type,name)=>(fragment.match(new RegExp('\\b'+name+'\\b','g'))||[]).length>1?decl:'');
 const varyings=[...fragment.matchAll(/varying\s+\w+\s+(\w+)\s*;/g)].map(m=>m[1]);
 let vertex=defines+'const float PI=3.14159265359;\nuniform mat4 modelMatrix;uniform mat4 modelViewMatrix;uniform mat4 viewMatrix;uniform mat4 projectionMatrix;\nattribute vec3 position;\n'+(/\bnormal\b/.test(vs)?'attribute vec3 normal;\n':'')+(/\buv\b/.test(vs)?'attribute vec2 uv;\n':'')+clean(vs);
 vertex=vertex.replace(/varying\s+(\w+)\s+(\w+)\s*;/g,(decl,type,name)=>varyings.includes(name)?decl:`${type} ${name};`);
 // Suppress unused worker class channels in the forward liquid stage.
 for(const name of ['vCls0','vCls1','vCls2'])if(!varyings.includes(name))vertex=vertex.replace(new RegExp('\\b'+name+'\\s*=[^;]+;','g'),'');
 for(const name of ['cls0','cls1','cls2'])vertex=vertex.replace(new RegExp('attribute vec4 '+name+';','g'),'');
 await translate(name+'Vertex',prune(vertex),output,compiler,{stage:'vert',group:0,varyings});await translate(name+'Fragment',fragment,output,compiler,{group:1,varyings});
 imports.push(`import * as ${name}Vertex from './${name}Vertex.js';\nimport * as ${name}Fragment from './${name}Fragment.js';`);entries.push(`{name:'${name}',key:'${shaderKey(vs)}:${shaderKey(name==='water'||name==='ribbon'?T.FRAG:fs)}',mode:3,vertex:${name}Vertex,fragment:${name}Fragment}`);
}
await fs.writeFile(output+'/forward.js',imports.join('\n')+'\nexport const forwardPrograms=['+entries.join(',')+'];\n');
console.log('Generated forward WGSL');
