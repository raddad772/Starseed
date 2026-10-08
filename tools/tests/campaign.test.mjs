import test from 'node:test';
import assert from 'node:assert/strict';
import { createCampaign, applyCampaignEvent, recoveryTotal, FLEET_BY_DIFFICULTY } from '../../src/campaign/state.js';
import { encodeCampaign, decodeCampaign, importCampaignCopy, MAX_SAVE_BYTES } from '../../src/campaign/save.js';
import { CampaignStorage } from '../../src/campaign/storage.js';
import { currentLeads } from '../../src/campaign/content.js';

const NOW = '2026-10-08T12:00:00Z';
const make = (options = {}) => createCampaign({ id: 'expedition-a', seed: 'TEST', now: NOW, ...options });
const event = (c, type, data = {}) => applyCampaignEvent(c, { id: `${type}/${c.story.nextEventSequence}/${c.story.appliedEventIds.length}`, type, ...data });
const intro = (presentation = 'played') => event(event(make(), 'intro.completed', { presentation }), 'signal.bearingResolved', { systemId: 'system/receiver' });

test('all twelve first-run combinations select a fleet without instantiating or duplicating it', () => {
  for (const flight of ['easy', 'medium', 'hard']) for (const exploration of ['guided', 'survey']) for (const puzzles of ['assisted', 'standard']) {
    const c = make({ rules: { flight, exploration, puzzles } });
    assert.equal(c.rules.startingFleetEra, FLEET_BY_DIFFICULTY[flight]);
    assert.equal(c.fleet.provisioned, false); assert.equal(c.world, null);
    assert.deepEqual(decodeCampaign(encodeCampaign(c)), c);
  }
  assert.throws(() => make({ rules: { flight: 'constructor' } }), /difficulty/);
  assert.throws(() => make({ rules: { puzzles: 'unknown' } }), /assistance/);
});

test('played and skipped introductions converge on the same story and first lead', () => {
  const a = intro('played'), b = intro('skipped');
  assert.equal(b.story.intro.lessonsPractised.length, 0);
  a.story.intro.presentation = b.story.intro.presentation;
  assert.deepEqual(a, b);
  assert.equal(currentLeads(a)[0].targetSystemId, 'system/receiver');
  assert.equal(event(a, 'intro.completed', { presentation: 'played' }), a);
  assert.equal(event(a, 'signal.bearingResolved', { systemId: 'system/receiver' }), a);
  assert.throws(() => event(a, 'signal.bearingResolved', { systemId: 'elsewhere' }), /already established/);
});

test('wrong destination and duplicate arrivals cannot advance the receiver investigation', () => {
  let c = intro();
  c = event(c, 'system.arrived', { systemId: 'system/side-trip' });
  assert.equal(c.story.quests['quest/first-receiver'].step, 'travel-to-receiver');
  const id = 'arrival/receiver';
  c = applyCampaignEvent(c, { id, type: 'system.arrived', systemId: 'system/receiver' });
  assert.equal(c.story.quests['quest/first-receiver'].step, 'survey-receiver');
  assert.equal(applyCampaignEvent(c, { id, type: 'system.arrived', systemId: 'system/receiver' }), c);
  assert.equal(event(c, 'system.arrived', { systemId: 'system/receiver' }), c);
  assert.deepEqual(decodeCampaign(encodeCampaign(c)), c);
});

test('recording discoveries preserves an existing surveyed system classification', () => {
  let c = event(make(), 'intro.completed', { presentation: 'played' });
  c.discoveries.systems['system/receiver'] = { knowledge: 'surveyed' };
  c = event(c, 'signal.bearingResolved', { systemId: 'system/receiver' });
  assert.equal(c.discoveries.systems['system/receiver'].knowledge, 'surveyed');
  const next = event(c, 'system.arrived', { systemId: 'system/receiver' });
  assert.equal(next.discoveries.systems['system/receiver'].knowledge, 'surveyed');
  const discovered = event(next, 'site.discovered', { siteId: 'site/receiver', systemId: 'system/receiver' });
  assert.equal(discovered.discoveries.systems['system/receiver'].knowledge, 'surveyed');
  assert.throws(() => event(discovered, 'site.discovered', { siteId: 'site/receiver', systemId: 'another-system' }), /another system/);
});

test('site recovery unlocks cumulative leads once across reloads and all sites', () => {
  let c = intro();
  for (let i = 0; i < 3; i++) {
    c = event(c, 'site.discovered', { siteId: `site/${i}`, systemId: `system/${i}` });
    c = event(c, 'site.recoveryRecorded', { siteId: `site/${i}`, rawUnits: 125 });
    c = decodeCampaign(encodeCampaign(c));
  }
  assert.equal(recoveryTotal(c), 510);
  assert.deepEqual(c.story.journal.filter(e => e.textId.startsWith('log.golden-path')).map(e => e.textId), ['log.golden-path-1', 'log.golden-path-2']);
  const snapshot = structuredClone(c);
  assert.equal(event(c, 'site.recoveryRecorded', { siteId: 'site/0', rawUnits: 90 }), c);
  assert.equal(event(c, 'site.recoveryRecorded', { siteId: 'site/0', rawUnits: 125 }), c);
  assert.throws(() => event(c, 'site.recoveryRecorded', { siteId: 'site/0', rawUnits: Infinity }), /quantity/);
  assert.throws(() => event(c, 'site.recoveryRecorded', { siteId: 'unknown', rawUnits: 90 }), /Discover/);
  assert.deepEqual(c, snapshot, 'invalid events leave the old record intact');
  const broken = structuredClone(c); broken.story.appliedOneTimeEffects.pop();
  assert.throws(() => encodeCampaign(broken), /milestones/);
});

test('save round trip preserves simulated time and import creates a separate campaign identity', () => {
  const a = intro(); a.clock.simulationSeconds = 1200000;
  const json = encodeCampaign(a), b = importCampaignCopy(json, { id: 'expedition-b', now: '2030-01-01T00:00:00Z' });
  assert.equal(b.clock.simulationSeconds, a.clock.simulationSeconds);
  assert.equal(b.clock.advanceWhileClosed, false); assert.equal(b.campaignId, 'expedition-b');
  assert.equal(b.revision, 0); assert.equal(a.campaignId, 'expedition-a');
  assert.equal(b.story.journal.length, a.story.journal.length);
});

test('malformed, incompatible, non-finite and unsafe imported records are rejected', () => {
  assert.throws(() => decodeCampaign('{'), /valid JSON/);
  assert.throws(() => decodeCampaign(' '.repeat(MAX_SAVE_BYTES + 1)), /10 MB/);
  for (const change of [c => c.schemaVersion++, c => c.exampleOnly = true, c => c.world = {}, c => c.rules.megastructurePresence.eligiblePlanetChance = '1', c => c.story.contentVersion++, c => c.clock.simulationSeconds = Infinity, c => c.fleet.provisioned = true]) {
    const c = make(); change(c); assert.throws(() => encodeCampaign(c));
  }
  const json = encodeCampaign(make()).replace('"sites": {}', '"sites": {"__proto__": {"polluted": true}}');
  assert.throws(() => decodeCampaign(json), /reserved/); assert.equal({}.polluted, undefined);
  const c = make(); c.cycle = c; assert.throws(() => encodeCampaign(c), /cycles/);
});

test('broken quest references and mismatched intro states cannot masquerade as completed progress', () => {
  const c = intro(); delete c.discoveries.systems['system/receiver']; assert.throws(() => encodeCampaign(c), /destination/);
  const d = make(); d.story.facts.surveyTenderMissing = true; assert.throws(() => encodeCampaign(d), /Pending/);
  const e = intro(); e.story.journal[1].id = e.story.journal[0].id; assert.throws(() => encodeCampaign(e), /journal/);
  const f = intro(); f.story.facts.destinationIdentified = 'true'; assert.throws(() => encodeCampaign(f), /boolean/);
  const g = intro(); g.story.journal[0].subjects = { system: {} }; assert.throws(() => encodeCampaign(g), /journal/);
});

test('unavailable browser storage reports failure instead of claiming a successful save', async () => {
  const store = new CampaignStorage({ indexedDB: null });
  const c = make(); await assert.rejects(store.save(c), /unavailable/); assert.equal(c.revision, 0);
});
