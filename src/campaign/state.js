// Campaign records are plain JSON. Runtime flight snapshots are a separate adapter;
// a record alone must never be advertised as a resumable flight save.
import { openingPlacements } from './systemPlacements.js';
import { GENERATOR_VERSION } from '../gen/system.js';
import { SIM_VERSION } from '../gen/worldsim/snapshot.js';
import { LEN_SCALE } from '../core/units.js';
import { creditedData, mysteryProgress } from '../understructure/recovery.js';

export const CAMPAIGN_FORMAT = 'starseed-campaign';
export const SCHEMA_VERSION = 1;
export const CONTENT_VERSION = 1;
export const FLEET_BY_DIFFICULTY = Object.freeze({ easy: 'horizon', medium: 'expedition', hard: 'pioneer' });
export const DEFAULT_RULES = Object.freeze({ flight: 'easy', exploration: 'guided', puzzles: 'assisted' });
const own = (object, key) => Object.hasOwn(object, key);

export function campaignRules(input = {}) {
  const rules = { ...DEFAULT_RULES, ...input };
  if (!own(FLEET_BY_DIFFICULTY, rules.flight)) throw new Error('Unknown spaceflight difficulty.');
  if (!['guided', 'survey'].includes(rules.exploration)) throw new Error('Unknown exploration difficulty.');
  if (!['assisted', 'standard'].includes(rules.puzzles)) throw new Error('Unknown puzzle assistance.');
  return { flight: rules.flight, exploration: rules.exploration, puzzles: rules.puzzles };
}

export function createCampaign({ id = globalThis.crypto.randomUUID(), seed, label = 'New expedition', rules, now = new Date().toISOString(), simulationSeconds = 0 } = {}) {
  if (typeof seed !== 'string' || !seed.trim() || seed.length > 128) throw new Error('A galaxy seed is required.');
  if (typeof id !== 'string' || !id || id.length > 128) throw new Error('A campaign ID is required.');
  if (typeof label !== 'string' || !label.trim() || label.length > 120) throw new Error('Give the expedition a name of up to 120 characters.');
  if (!Number.isFinite(simulationSeconds) || !Number.isFinite(Date.parse(now))) throw new Error('Invalid campaign time.');
  const choices = campaignRules(rules);
  return {
    format: CAMPAIGN_FORMAT, schemaVersion: SCHEMA_VERSION, saveKind: 'campaign-record',
    campaignId: id, label: label.trim(), revision: 0, createdAt: now, savedAt: now,
    generation: { galaxySeed: seed.trim(), versions: { galaxy: 1, system: GENERATOR_VERSION, world: SIM_VERSION, storyContent: CONTENT_VERSION }, localLengthScale: LEN_SCALE, storyAnchors: {}, systemPlacements:openingPlacements(seed.trim()) },
    clock: { epoch: '2026-10-05T00:00:00Z', simulationSeconds, advanceWhileClosed: false },
    rules: { ...choices, startingFleetEra: FLEET_BY_DIFFICULTY[choices.flight], recoveryPolicyVersion: 1, megastructurePresence: { version: 1, eligiblePlanetChance: 1, maxPerPlanet: 1 } },
    fleet: { provisioned: false, vesselIds: [] },
    players: [],
    discoveries: { systems: {}, sites: {}, returnAnchors: [] },
    story: {
      contentVersion: CONTENT_VERSION, nextEventSequence: 1,
      intro: { status: 'pending', presentation: null, checkpoint: 'not-started', lessonsPractised: [] },
      facts: {}, quests: {}, journal: [], appliedEventIds: [], appliedOneTimeEffects: []
    },
    sites: {}, recovery: { policyVersion: 1, highestRawBySite: {} }, world: null, legacyImports: []
  };
}

export function recoveryTotal(campaign) {
  return Object.values(campaign.recovery.highestRawBySite).reduce((sum, raw) => sum + creditedData(raw), 0);
}

function safeId(value) {
  if (typeof value !== 'string' || !value || value.length > 200 || ['__proto__', 'prototype', 'constructor'].includes(value)) throw new Error('Invalid event reference.');
  return value;
}

function journal(campaign, textId, subjects = {}) {
  const story = campaign.story;
  story.journal.push({ id: `event/${story.nextEventSequence++}`, textId, simulationSeconds: campaign.clock.simulationSeconds, subjects });
}

function chartSystem(campaign, id) {
  const previous = campaign.discoveries.systems[id];
  campaign.discoveries.systems[id] = { ...previous, knowledge: previous?.knowledge === 'surveyed' ? 'surveyed' : 'charted' };
}

// Pure event application. An invalid event cannot leave half-awarded state behind.
// Caller replaces its record only after this returns successfully.
export function applyCampaignEvent(current, event) {
  safeId(event?.id);
  if (current.story.appliedEventIds.includes(event.id)) return current;
  const c = structuredClone(current), s = c.story;
  switch (event.type) {
    case 'intro.completed': {
      if (!['played', 'skipped'].includes(event.presentation)) throw new Error('Invalid intro presentation.');
      if (s.intro.status === 'complete') return current;
      s.intro = { ...s.intro, status: 'complete', presentation: event.presentation, checkpoint: 'incident-recorded' };
      s.facts.surveyTenderMissing = true;
      s.facts.outgoingPulseRecorded = true;
      s.appliedOneTimeEffects.push('intro.canonical-incident');
      s.quests['quest/first-receiver'] = { state: 'active', step: 'identify-bearing', targetSystemId: null, completedObjectives: [] };
      journal(c, 'log.expedition-purpose');
      journal(c, 'log.missing-tender');
      journal(c, 'log.outgoing-transmission');
      break;
    }
    case 'signal.bearingResolved': {
      if (s.intro.status !== 'complete') throw new Error('Record the introductory incident first.');
      const target = safeId(event.systemId), q = s.quests['quest/first-receiver'];
      if (s.facts.destinationIdentified) {
        if (q.targetSystemId !== target) throw new Error('The first transmission destination is already established.');
        return current;
      }
      q.targetSystemId = target; q.step = 'travel-to-receiver'; q.completedObjectives.push('identify-bearing');
      s.facts.destinationIdentified = true; s.intro.checkpoint = 'departure-ready';
      chartSystem(c, target);
      journal(c, 'log.destination-identified', { destination: target });
      break;
    }
    case 'system.arrived': {
      const id = safeId(event.systemId), previous = c.discoveries.systems[id];
      const q = s.quests['quest/first-receiver'];
      const advances = q?.step === 'travel-to-receiver' && q.targetSystemId === id;
      if (previous?.visited && !advances) return current;
      chartSystem(c, id);
      c.discoveries.systems[id].visited = true;
      if (advances) { q.step = 'survey-receiver'; q.completedObjectives.push('reach-receiver'); }
      journal(c, 'log.system-arrived', { system: id });
      break;
    }
    case 'site.discovered': {
      const id = safeId(event.siteId), systemId = safeId(event.systemId);
      if (own(c.discoveries.sites, id)) {
        if (c.discoveries.sites[id].systemId !== systemId) throw new Error('The site already belongs to another system.');
        return current;
      }
      chartSystem(c, systemId);
      c.discoveries.sites[id] = { systemId };
      journal(c, 'log.site-discovered', { site: id, system: systemId });
      break;
    }
    case 'site.recoveryRecorded': {
      const id = safeId(event.siteId), raw = event.rawUnits;
      if (!own(c.discoveries.sites, id)) throw new Error('Discover the site before recording its data.');
      if (!Number.isSafeInteger(raw) || raw < 0 || raw > 1000000) throw new Error('Invalid recovered data quantity.');
      const previous = c.recovery.highestRawBySite[id] || 0;
      if (raw <= previous) return current;
      const before = mysteryProgress(recoveryTotal(c)).stage;
      c.recovery.highestRawBySite[id] = raw;
      const after = mysteryProgress(recoveryTotal(c)).stage;
      for (let stage = before + 1; stage <= after; stage++) {
        const effect = `goldenPath.lead-${stage}`;
        if (!s.appliedOneTimeEffects.includes(effect)) {
          s.appliedOneTimeEffects.push(effect);
          journal(c, `log.golden-path-${stage}`);
        }
      }
      break;
    }
    case 'tutorial.practised': {
      const lesson = safeId(event.lessonId);
      if (s.intro.lessonsPractised.includes(lesson)) return current;
      s.intro.lessonsPractised.push(lesson);
      break;
    }
    default: throw new Error(`Unsupported campaign event: ${event.type}`);
  }
  s.appliedEventIds.push(event.id);
  return c;
}
