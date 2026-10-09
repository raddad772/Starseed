// Normalize renderer-neutral attributes without modifying shared worker or LOD buffers.
const identity=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1];
const sizeOf=t=>Number(t.match(/vec(\d)/)?.[1]||1);
const attributeIds=new WeakMap();let nextAttributeId=1;
export const version=a=>{if(!a)return 'none';if(!attributeIds.has(a))attributeIds.set(a,nextAttributeId++);return [attributeIds.get(a),a.isInterleavedBufferAttribute?a.data.version:a.version||0,a.offset||0,a.data?.stride||a.itemSize,a.count].join('/');};
const component=(a,i,k)=>a?.getComponent ? a.getComponent(i,k) : a?.[['getX','getY','getZ','getW'][k]]?.(i) ?? 0;
export function attribute(object,name){if(name.startsWith('instance')&&/^instance[0-3]$/.test(name))return object.instanceMatrix;if(name==='instanceColor')return object.instanceColor;return object.geometry.attributes[name];}
export function fields(layout,object){let vertex=0,instance=0;return layout.attributes.map(a=>{const source=attribute(object,a.name),inst=!!(a.name.startsWith('instance')||source?.isInstancedBufferAttribute||source?.data?.isInstancedInterleavedBuffer);const n=sizeOf(a.type),offset=inst?instance:vertex;if(inst)instance+=n*4;else vertex+=n*4;return {...a,inst,n,offset};});}
const fieldSchemas=new WeakMap();
export function cachedFields(layout,object){
 let schemas=fieldSchemas.get(layout);if(!schemas){schemas=new Map();fieldSchemas.set(layout,schemas);}
 let key='';for(const a of layout.attributes){const source=attribute(object,a.name);key+=a.name.startsWith('instance')||source?.isInstancedBufferAttribute||source?.data?.isInstancedInterleavedBuffer?'1':'0';}
 let schema=schemas.get(key);if(!schema){schema=fields(layout,object);schemas.set(key,schema);}return schema;
}
export function layouts(fields){return [false,true].map(inst=>{const a=fields.filter(f=>f.inst===inst);return a.length?{arrayStride:a.reduce((n,f)=>n+f.n*4,0),stepMode:inst?'instance':'vertex',attributes:a.map(f=>({shaderLocation:f.location,offset:f.offset,format:f.n===1?'float32':'float32x'+f.n}))}:null;});}
// (a float attribute, plain or interleaved, one element per vertex or instance: read straight from its array,
// not component by component; the creatures' instances are packed afresh every frame, for each pass)
const direct=a=>a&&(a.isInterleavedBufferAttribute?a.data.array:a.array) instanceof Float32Array&&(a.meshPerAttribute||a.data?.meshPerAttribute||1)===1&&!a.isGLBufferAttribute;
export function pack(object,fields,inst,count){const list=fields.filter(f=>f.inst===inst),stride=list.reduce((n,f)=>n+f.n,0),out=new Float32Array(count*stride);
 const slow=[];
 for(const f of list){const a=attribute(object,f.name),col=/^instance([0-3])$/.exec(f.name),o=f.offset/4;
  if(!direct(a)){slow.push(f);continue;}
  const arr=a.isInterleavedBufferAttribute?a.data.array:a.array,step=a.isInterleavedBufferAttribute?a.data.stride:a.itemSize,base=a.isInterleavedBufferAttribute?a.offset:0;
  if(col){const c0=Number(col[1])*4;for(let i=0;i<count;i++){const src=i*step+base+c0,dst=i*stride+o;for(let k=0;k<f.n;k++)out[dst+k]=arr[src+k];}}
  else{const fill=f.name==='color'?1:0,m=Math.min(f.n,a.itemSize);for(let i=0;i<count;i++){const src=i*step+base,dst=i*stride+o;for(let k=0;k<m;k++)out[dst+k]=arr[src+k];for(let k=m;k<f.n;k++)out[dst+k]=k===3?fill:0;}}
 }
 if(slow.length)for(let i=0;i<count;i++)for(const f of slow){const a=attribute(object,f.name),col=/^instance([0-3])$/.exec(f.name);for(let k=0;k<f.n;k++){
 let v;if(col){const c=Number(col[1])*4+k;v=a?component(a,i,c):identity[c];}
 else if(a)v=k<a.itemSize?component(a,Math.floor(i/(a.meshPerAttribute||a.data?.meshPerAttribute||1)),k):(f.name==='color'&&k===3?1:0);
 else v=f.name==='instanceColor'||f.name==='color'?1:f.name==='normal'&&k===1?1:0;
 out[i*stride+f.offset/4+k]=v;
 }}return out;}
