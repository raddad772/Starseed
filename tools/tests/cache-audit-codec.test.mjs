import test from 'node:test';
import assert from 'node:assert/strict';
import {pack,unpack,measure} from '../cache-audit-codec.js';

function fixture(){
  const shared=new Int16Array(new SharedArrayBuffer(6));shared.set([-32768,0,32767]);
  // Deliberately retain a noncanonical NaN bit pattern, a signed zero, offsets
  // and odd-length byte arrays: numeric equality alone would miss corruption.
  const floats=new Float32Array(new Uint32Array([0x7fc01234,0x80000000,0x3f800000,0x7f800000]).buffer);
  return {bytes:new Uint8Array([0,255,3]),shared,floats,offset:new Uint32Array([1,2,3,4]).subarray(1,3),empty:new Float64Array(),nested:{f64:new Float64Array([Math.PI,Number.MIN_VALUE]),nonfinite:[NaN,Infinity,-Infinity]},text:'orbit → surface'};
}
for(const shuffle of [false,true])test(`audit codec preserves every byte (shuffle=${shuffle})`,async()=>{
  const value=fixture(),m=await measure(value,{shuffle});
  assert.deepEqual(m.decoded,value);
  const original=new Uint8Array(await pack(value).blob.arrayBuffer());
  const restored=new Uint8Array(await pack(m.decoded).blob.arrayBuffer());
  assert.deepEqual(restored,original);
  assert.equal(m.rawBytes,3+6+16+8+16);
  assert.ok(m.gzipBytes>0&&m.decodeMs>=0);
});
test('audit decoder rejects a truncated typed payload',async()=>{
  const b=await pack(fixture()).blob.arrayBuffer();assert.throws(()=>unpack(b.slice(0,-1)));
});
