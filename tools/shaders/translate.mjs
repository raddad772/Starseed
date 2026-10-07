// Offline, pinned Naga GLSL -> WGSL port helper. Generated WGSL is checked in and
// used directly by WebGPU: no runtime shader compiler or browser build step.
import fs from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
export function prepare(source, group = 2) {
  source = source.replace(/\/\*[\s\S]*?\*\//g,'').replace(/\/\/[^\n]*/g,'').replace(/precision\s+\w+\s+\w+;/g,'');
  const uniforms=[],textures=[],seen=new Map();
  source=source.replace(/uniform\s+(?:(?:highp|mediump|lowp)\s+)?(\w+)\s+(\w+)\s*(\[\s*\d+\s*\])?\s*;/g,(all,type,name,array)=>{
    if(seen.has(name)){if(seen.get(name)!==type+(array||''))throw Error('Uniform type conflict: '+name);return '';}
    seen.set(name,type+(array||''));
    (type.startsWith('sampler')?textures:uniforms).push({name,type,count:array?Number(array.match(/\d+/)[0]):0});return '';
  });
  source = source.replace('depthPixel(sampler2D t, vec2 uv)', 'depthPixel(vec2 uv)').replace('textureSize(t, 0)', 'textureSize(tDepth, 0)').replaceAll('depthPixel(tDepth,', 'depthPixel(');
  let offset=0;
  for(const u of uniforms){
    const matrix=/^mat(\d)$/.exec(u.type),vector=/^[ibu]?vec(\d)$/.exec(u.type);
    u.align=matrix||u.count?16:vector?Number(vector[1])===2?8:16:4;
    u.size=matrix?Number(matrix[1])*16:vector?Number(vector[1])*4:4;
    u.stride=u.count?Math.ceil(u.size/16)*16:u.size;
    offset=Math.ceil(offset/u.align)*u.align;u.offset=offset;offset+=u.count?u.stride*u.count:u.size;
  }
  const bytes=Math.max(16,Math.ceil(offset/16)*16);
  let prefix='#version 450\n';
  if(uniforms.length)prefix+=`layout(std140,set=${group},binding=0) uniform Params {\n`+uniforms.map(u=>`${u.type} ${u.name}${u.count?'['+u.count+']':''};`).join('\n')+'\n};\n';
  textures.forEach((t,i)=>{
    t.binding=1+i*2;t.samplerBinding=t.binding+1;
    prefix+=`layout(set=${group},binding=${t.binding}) uniform texture${t.type.slice(7)} ${t.name}Texture;\nlayout(set=${group},binding=${t.samplerBinding}) uniform sampler ${t.name}Sampler;\n#define ${t.name} ${t.type}(${t.name}Texture,${t.name}Sampler)\n`;
  });
  // LUTs and position-based cloud sampling are explicitly level zero in deferred
  // lighting. Existing textureGrad/textureLod calls retain their selected footprints.
  source=source.replace(/\btexture\s*\(/g, 'sampleImplicit(');
  let idx=0;
  while((idx=source.indexOf('sampleImplicit(',idx))>=0){
    const open=idx+'sampleImplicit'.length;let end=open+1,depth=1;
    for(;end<source.length && depth;end++){if(source[end]==='(')depth++;if(source[end]===')')depth--;}
    source=source.slice(0,idx)+'textureLod('+source.slice(open+1,end-1)+',0.0)'+source.slice(end);idx++;
  }
  if (/\b(?:isnan|isinf)\s*\(/.test(source)) {
    source=source.replace(/\bisnan\s*\(/g,'finite_isnan(').replace(/\bisinf\s*\(/g,'finite_isinf(');
    let helpers='';
    for(const [name,op] of [['isnan','>'],['isinf','==']]) {
      helpers+=`bool finite_${name}(float x){return (floatBitsToUint(x)&0x7fffffffu) ${op} 0x7f800000u;}\n`;
      for(const n of [2,3,4]) helpers+=`bvec${n} finite_${name}(vec${n} x){return bvec${n}(${Array.from({length:n},(_,i)=>`finite_${name}(x[${i}])`).join(',')});}\n`;
    }
    source=helpers+source;
  }
  let location=0;source=source.replace(/varying\s+(\w+)\s+(\w+)\s*;/g,(_,type,name)=>`layout(location=${location++}) in ${type} ${name};`);
  if(source.includes('gl_FragColor')){prefix+='layout(location=0) out vec4 fragmentColor;\n';source=source.replaceAll('gl_FragColor','fragmentColor');}
  return {source:prefix+source,metadata:{uniforms, textures, bytes, group}};
}
export async function translate(name, source, output, compiler, options={}) {
  if(options.screen) source=source.replace(/(vec2 ndc =[^;]+;)/g, '$1 ndc.y = -ndc.y;');
  const {source:glsl,metadata}=prepare(source,options.group??2);
  const dir=path.join(output,'intermediate');await fs.mkdir(dir,{recursive:true});
  const input=path.join(dir,name+'.glsl'),out=path.join(dir,name+'.wgsl');await fs.writeFile(input,glsl);
  const run=spawnSync(process.execPath,[compiler,'--input-kind','glsl','--shader-stage','frag',path.relative(process.cwd(),input),path.relative(process.cwd(),out)],{encoding:'utf8'});
  if(run.status!==0)throw Error(name+': '+run.stdout+'\n'+run.stderr);
  let code=await fs.readFile(out,'utf8');
  if(options.library) code=code.slice(0,code.indexOf('@fragment'));
  await fs.writeFile(path.join(output,name+'.js'), '// Generated offline from the existing renderer equations. See tools/shaders/.\nexport const layout = '+JSON.stringify(metadata,null,2)+';\nexport const code = /* wgsl */`\n'+code+'`;\n');
  return {code,layout:metadata};
}
