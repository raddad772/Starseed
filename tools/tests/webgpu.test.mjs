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
