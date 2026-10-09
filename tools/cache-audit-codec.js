// Audit transport: JSON structure + raw typed-array bytes. This is a size/load
// experiment, not a new production cache format or a measurement of IDB overhead.
const TYPES={Float64Array,Float32Array,Uint32Array,Int32Array,Uint16Array,Int16Array,Uint8Array,Int8Array,Uint8ClampedArray};
function reorder(bytes,width,inverse=false){
  if(width===1)return bytes.slice();
  const out=new Uint8Array(bytes.length),n=bytes.length/width;
  for(let b=0;b<width;b++)for(let i=0;i<n;i++){
    if(inverse)out[i*width+b]=bytes[b*n+i];else out[b*n+i]=bytes[i*width+b];
  }
  return out;
}
export function pack(value,{shuffle=false}={}){
  const arrays=[];let rawBytes=0;
  const header=new TextEncoder().encode(JSON.stringify(value,(k,v)=>{
    if(ArrayBuffer.isView(v)){const id=arrays.length;const bytes=new Uint8Array(v.buffer,v.byteOffset,v.byteLength);arrays.push(shuffle?reorder(bytes,v.BYTES_PER_ELEMENT):bytes.slice());rawBytes+=v.byteLength;return {$array:id,type:v.constructor.name,bytes:v.byteLength,...(shuffle?{shuffle:true}:{})};}
    if(typeof v==='number'&&!Number.isFinite(v))return {$number:String(v)};
    return v;
  }));
  const length=new Uint8Array(4);new DataView(length.buffer).setUint32(0,header.length,true);
  return {blob:new Blob([length,header,...arrays]),rawBytes,metadataBytes:header.length+4,arrayCount:arrays.length};
}
export function unpack(buffer){
  const n=new DataView(buffer).getUint32(0,true);let offset=4+n;
  const value=JSON.parse(new TextDecoder().decode(new Uint8Array(buffer,4,n)),(k,v)=>{
    if(v&&Object.hasOwn(v,'$array')){const Type=TYPES[v.type];if(!Type||!Number.isSafeInteger(v.bytes)||v.bytes<0||offset+v.bytes>buffer.byteLength)throw Error('Invalid audit array');const raw=buffer.slice(offset,offset+v.bytes),a=new Type(v.shuffle?reorder(new Uint8Array(raw),Type.BYTES_PER_ELEMENT,true).buffer:raw);offset+=v.bytes;return a;}
    if(v&&Object.hasOwn(v,'$number'))return Number(v.$number);
    return v;
  });
  if(offset!==buffer.byteLength)throw Error('Unexpected audit payload length');return value;
}
export async function measure(value,options){
  const p=pack(value,options),start=performance.now();
  const compressed=await new Response(p.blob.stream().pipeThrough(new CompressionStream('gzip'))).blob();
  const compressMs=performance.now()-start,t=performance.now();
  const decoded=unpack(await new Response(compressed.stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer());
  return {rawBytes:p.rawBytes,metadataBytes:p.metadataBytes,packedBytes:p.blob.size,gzipBytes:compressed.size,compressMs,decodeMs:performance.now()-t,decoded,compressed};
}
