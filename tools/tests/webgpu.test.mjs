import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../../vendor/three.module.js';
import { reversedPerspective, packTerrain } from '../../src/render/webgpu/math.js';

test('reversed WebGPU depth preserves near detail across astronomical distances', () => {
  const near = 0.05, far = 1e13;
  const p = reversedPerspective(72, 4 / 3, near, far);
  const depth = (distance) => (-p[10] * distance + p[14]) / distance;
  assert.ok(Math.abs(depth(near) - 1) < 1e-7);
  assert.ok(Math.abs(depth(far)) < 1e-20);
  for (const d of [0.05, 1, 100, 1e6, 1e12]) assert.ok(depth(d) > depth(d * 1.01));
  const inf = reversedPerspective(72, 4 / 3, near, Infinity);
  assert.equal(inf[10], 0);
  assert.ok(Math.abs(inf[14] / 1e9 - near / 1e9) < 1e-17);
});

test('camera-relative projection and WebGPU frustum agree', () => {
  const p = new THREE.Matrix4().fromArray(reversedPerspective(90, 1, 0.05, 1e13));
  const f = new THREE.Frustum().setFromProjectionMatrix(p, THREE.WebGPUCoordinateSystem, true);
  for (const d of [0.051, 1, 100, 1e12]) assert.ok(f.containsPoint(new THREE.Vector3(0, 0, -d)));
  for (const xyz of [[0, 0, -0.01], [0, 0, 1], [2, 0, -1], [0, 2, -1], [0, 0, -2e13]]) {
    assert.equal(f.containsPoint(new THREE.Vector3(...xyz)), false, xyz.join(','));
  }
  const inv = p.clone().invert();
  const point = new THREE.Vector3(0.25, -0.4, -2);
  assert.ok(point.clone().applyMatrix4(p).applyMatrix4(inv).distanceTo(point) < 1e-9);
});

test('worker attributes keep their normalization and source arrays unchanged', () => {
  const g = new THREE.BufferGeometry();
  const positions = new Float32Array([1, 2, 3]);
  const normal = new Int16Array([0, 32767, -32768, 1234]);
  const color = new Uint8Array([128, 64, 255, 0]);
  g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  g.setAttribute('nrm', new THREE.BufferAttribute(normal, 4, true));
  g.setAttribute('col', new THREE.BufferAttribute(color, 4, true));
  g.setAttribute('ext', new THREE.InterleavedBufferAttribute(new THREE.InterleavedBuffer(new Uint8Array([99, 0, 128, 255, 0]), 5), 4, 1, true));
  const packed = packTerrain(g);
  assert.deepEqual([...packed.slice(0, 3)], [1, 2, 3]);
  assert.deepEqual([...packed.slice(4, 7)], [1, 2, 3]);
  assert.deepEqual([...packed.slice(8, 11)], [0, 1, -1]);
  assert.ok(Math.abs(packed[16] - 128 / 255) < 1e-7);
  assert.equal(packed[18], 1);
  assert.equal(packed[26], 1);
  assert.deepEqual([...positions], [1, 2, 3]);
  assert.deepEqual([...normal], [0, 32767, -32768, 1234]);
  assert.deepEqual([...color], [128, 64, 255, 0]);
});

import { packUniforms } from '../../src/render/webgpu/uniforms.js';
import { prepare } from '../shaders/translate.mjs';
test('translated uniform layouts preserve vec3/scalar packing, matrices and arrays', () => {
  const { metadata } = prepare('uniform vec3 a; uniform float b; uniform mat3 m; uniform vec3 c[2]; uniform int n; void main(){}');
  const packed = packUniforms(metadata, { a: { value: [1,2,3] }, b: { value: 4 }, m: { value: [5,6,7,8,9,10,11,12,13] }, c: { value: [[14,15,16],[17,18,19]] }, n: { value: 7 } });
  const f = new Float32Array(packed), ints = new Int32Array(packed);
  assert.deepEqual([...f.slice(0,4)],[1,2,3,4]);
  assert.deepEqual([...f.slice(4,16)],[5,6,7,0,8,9,10,0,11,12,13,0]);
  assert.deepEqual([...f.slice(16,24)],[14,15,16,0,17,18,19,0]);
  assert.equal(ints[24],7);
});

import { fields, pack } from '../../src/render/webgpu/geometry.js';
test('tree LOD views retain interleaved matrix offsets and instance temperatures',()=>{
 const data=new Float32Array(32);for(let i=0;i<32;i++)data[i]=i;
 const matrices=new THREE.InstancedInterleavedBuffer(data,16,1);
 const temperatures=new THREE.InstancedInterleavedBuffer(new Float32Array([10,20]),1,1);
 const g=new THREE.BufferGeometry();g.setAttribute('fTa',new THREE.InterleavedBufferAttribute(temperatures,1,1));
 const object={geometry:g,instanceMatrix:new THREE.InterleavedBufferAttribute(matrices,16,16)};
 const f=fields({attributes:[{name:'instance3',type:'vec4',location:0},{name:'fTa',type:'float',location:1}]},object);
 assert.ok(f.every(a=>a.inst));assert.deepEqual([...pack(object,f,true,1)],[28,29,30,31,20]);
 assert.deepEqual([...data],Array.from({length:32},(_,i)=>i));
});

import { packUniformsReference } from '../../src/render/webgpu/uniforms.js';
test('cached uniform packing matches the reference byte-for-byte after mutations',()=>{
 const {metadata}=prepare('uniform float scalar; uniform int signed; uniform uint unsigned; uniform bool flag; uniform vec2 pair; uniform vec3 color; uniform vec4 vector; uniform mat2 m2; uniform mat3 m3; uniform mat4 m4; uniform float weights[3]; uniform vec2 offsets[2]; uniform mat3 transforms[2]; void main(){}');
 const uniforms={scalar:{value:1.3},signed:{value:-7},unsigned:{value:0xf1234567},flag:{value:true},pair:{value:new THREE.Vector2(2,3)},color:{value:new THREE.Color(0.2,0.7,0.9)},vector:{value:new THREE.Vector4(1,2,3,4)},m2:{value:[1,2,3,4]},m3:{value:new THREE.Matrix3().set(1,2,3,4,5,6,7,8,9)},m4:{value:new THREE.Matrix4().makeTranslation(3,4,5)},weights:{value:[-0,Infinity,NaN]},offsets:{value:[[1,2],[3,4]]},transforms:{value:[new THREE.Matrix3(),[1,2,3,4,5,6,7,8,9]]}};
 const reused=new ArrayBuffer(metadata.bytes);
 for(let step=0;step<20;step++){
  assert.deepEqual(new Uint8Array(packUniforms(metadata,uniforms,reused)),new Uint8Array(packUniformsReference(metadata,uniforms)));
  uniforms.pair.value.x+=0.01;uniforms.scalar.value=step?-step:undefined;uniforms.weights.value[0]=step;uniforms.m4.value.elements[12]++;uniforms.transforms.value[1]=step%2?undefined:[1,2,3,4,5,6,7,8,9];
 }
 uniforms.pair.value=new THREE.Color(0.1,0.2,0.3);uniforms.vector.value=new THREE.Color(0.4,0.5,0.6);
 assert.deepEqual(new Uint8Array(packUniforms(metadata,uniforms,reused)),new Uint8Array(packUniformsReference(metadata,uniforms)));
 assert.deepEqual(new Uint8Array(packUniforms(metadata,{},reused)),new Uint8Array(packUniformsReference(metadata,{})));
});

import { PassTimer } from '../../src/render/webgpu/device.js';
test('overlapping GPU timestamp ranges never inflate the displayed frame time', async () => {
 const prior=globalThis.GPUMapMode;globalThis.GPUMapMode={READ:1};
 const timer=new PassTimer({},false),values=new BigUint64Array([0n,6000000n,4000000n,10000000n,12000000n,14000000n]);
 timer.sampleLabels=['shadow','opaque','post'];timer.sampleDropped=0;
 timer.read={async mapAsync(){},getMappedRange(){return values.buffer;},unmap(){}};
 try{await timer.harvest();assert.equal(timer.gpuMs,12);assert.equal(timer.passAttributionReliable,false);assert.deepEqual(timer.last,{shadow:6,opaque:6,post:2});}
 finally{globalThis.GPUMapMode=prior;}
});
