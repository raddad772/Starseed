// The immersive pilot view (ui/immersiveView.js): Horizon and Expedition pilot seats have it, Pioneer's
// and the older craft's don't; only a pilot in their seat in that view gets it; the ship's meshes leave
// the camera's layer for that view and come back after, still casting shadows; every craft with it
// has a hull outline.
import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { VESSEL_TYPES } from '../../src/sim/vesselTypes.js';
import { hasImmersiveView, immersiveFor, hideFromView, restoreView, hullOutline } from '../../src/ui/immersiveView.js';

const T = Object.values(VESSEL_TYPES);

test('Horizon and Expedition pilot seats have the immersive view, Pioneer and the older craft not', () => {
  for (const t of T) assert.equal(hasImmersiveView(t), t.era === 'Horizon' || t.era === 'Expedition', t.key);
  assert.ok(T.filter(hasImmersiveView).length === 14);
});

test('only the pilot, seated, in the immersive view', () => {
  const vessel = { type: VESSEL_TYPES.horizon_lark };
  const p = (o) => ({ camMode: 'immersive', flying: true, vessel, ...o });
  assert.equal(immersiveFor(p({})), true);
  assert.equal(immersiveFor(p({ camMode: 'first' })), false);
  assert.equal(immersiveFor(p({ flying: false })), false);
  assert.equal(immersiveFor(p({ vessel: { type: VESSEL_TYPES.pioneer_nomad } })), false);
});

test('the ship leaves the view and comes back; what was off the layer stays off', () => {
  const root = new THREE.Group(), a = new THREE.Mesh(), b = new THREE.Mesh(), shadowOnly = new THREE.Mesh();
  a.castShadow = true; shadowOnly.layers.set(5); root.add(a, b, shadowOnly);
  const hidden = hideFromView({ visual: { model: { root } } });
  assert.equal(a.layers.isEnabled(0) || b.layers.isEnabled(0), false);
  assert.equal(a.castShadow, true);
  restoreView(hidden);
  assert.ok(a.layers.isEnabled(0) && b.layers.isEnabled(0));
  assert.equal(shadowOnly.layers.isEnabled(0), false);
});

test('every craft with the view has its hull outline, inside its bounds', () => {
  for (const t of T.filter(hasImmersiveView)) {
    const s = hullOutline(t);
    assert.ok(s.length >= 6 * 100, `${t.key}: ${s.length / 6} segments`);
    const [lo, hi] = t.bounds;
    for (let i = 0; i < s.length; i += 3) for (let k = 0; k < 3; k++) assert.ok(s[i + k] >= lo[k] - 0.5 && s[i + k] <= hi[k] + 0.5, `${t.key}: ${[s[i], s[i + 1], s[i + 2]]}`);
  }
});
