// Lossless JSON transport for optional build-time bundles; IndexedDB uses native clones.
const types={Float64Array,Float32Array,Uint32Array,Int32Array,Uint16Array,Int16Array,Uint8Array,Int8Array,Uint8ClampedArray};
export function encodeSystemPack(record){return JSON.stringify(record,(k,v)=>{
  if(ArrayBuffer.isView(v))return {$systemArray:v.constructor.name,values:Array.from(v)};
  if(typeof v==='number'&&!Number.isFinite(v))return {$systemNumber:String(v)};
  return v;
});}
export function decodeSystemPack(text){return JSON.parse(text,(k,v)=>{
  if(v?.$systemArray){if(!Object.hasOwn(types,v.$systemArray)||!Array.isArray(v.values))throw Error('Invalid system array');return new types[v.$systemArray](v.values);}
  if(v?.$systemNumber){if(!['Infinity','-Infinity','NaN'].includes(v.$systemNumber))throw Error('Invalid system number');return Number(v.$systemNumber);}
  return v;
});}
