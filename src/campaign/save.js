import { CAMPAIGN_FORMAT, SCHEMA_VERSION, CONTENT_VERSION, campaignRules, recoveryTotal } from './state.js';
import { mysteryProgress } from '../understructure/recovery.js';

export const MAX_SAVE_BYTES = 10 * 1024 * 1024;
const forbidden = new Set(['__proto__', 'prototype', 'constructor']);
const fail = message => { throw new Error(message); };
const object = v => v !== null && typeof v === 'object' && !Array.isArray(v);
const string = (v, max = 200) => typeof v === 'string' && v.length > 0 && v.length <= max;
const integer = v => Number.isSafeInteger(v) && v >= 0;
const date = v => typeof v === 'string' && /^\d{4}-\d\d-\d\dT/.test(v) && Number.isFinite(Date.parse(v));

function plainJSON(root) {
  let count = 0;
  const active = new Set();
  function visit(v, depth) {
    if (++count > 200000 || depth > 48) fail('Save contains too much nested data.');
    if (v === null || typeof v === 'boolean') return;
    if (typeof v === 'number') { if (!Number.isFinite(v)) fail('Save contains a non-finite number.'); return; }
    if (typeof v === 'string') { if (v.length > 65536) fail('Save contains an oversized text field.'); return; }
    if (typeof v !== 'object' || active.has(v)) fail('Save must contain plain JSON without cycles.');
    const proto = Object.getPrototypeOf(v);
    if (!Array.isArray(v) && proto !== Object.prototype && proto !== null) fail('Runtime objects cannot be stored in a campaign record.');
    active.add(v);
    for (const [k, child] of Object.entries(v)) {
      if (forbidden.has(k)) fail('Save contains a reserved object key.');
      visit(child, depth + 1);
    }
    active.delete(v);
  }
  visit(root, 0);
}

function idArray(values, label) {
  if (!Array.isArray(values) || values.some(v => !string(v)) || new Set(values).size !== values.length) fail(`Invalid ${label}.`);
}

export function validateCampaign(c) {
  plainJSON(c);
  if (!object(c) || c.format !== CAMPAIGN_FORMAT) fail('This is not a Starseed campaign file.');
  if (c.exampleOnly) fail('This file is a documentation example, not a saved campaign.');
  if (c.schemaVersion !== SCHEMA_VERSION) fail(`Unsupported campaign schema ${c.schemaVersion}; this build reads version ${SCHEMA_VERSION}.`);
  if (c.saveKind !== 'campaign-record' || c.world !== null) fail('This build reads campaign records; live-flight restoration is not available yet.');
  if (!string(c.campaignId, 128) || !string(c.label, 120) || !integer(c.revision)) fail('Invalid campaign identity or revision.');
  if (!date(c.createdAt) || !date(c.savedAt)) fail('Invalid save timestamp.');
  if (!object(c.generation) || !string(c.generation.galaxySeed, 128) || !object(c.generation.versions) || !object(c.generation.storyAnchors)) fail('Invalid generation information.');
  for (const key of ['galaxy', 'system', 'world', 'storyContent']) if (!integer(c.generation.versions[key]) || c.generation.versions[key] < 1) fail('Invalid generator version.');
  if (typeof c.generation.localLengthScale !== 'number' || !(c.generation.localLengthScale > 0 && c.generation.localLengthScale <= 1)) fail('Invalid local distance scale.');
  if (!object(c.clock) || !date(c.clock.epoch) || !Number.isFinite(c.clock.simulationSeconds) || c.clock.advanceWhileClosed !== false) fail('Invalid campaign clock.');
  if (!object(c.rules)) fail('Missing campaign rules.');
  campaignRules(c.rules);
  if (!['pioneer', 'expedition', 'horizon'].includes(c.rules.startingFleetEra) || c.rules.recoveryPolicyVersion !== 1) fail('Unsupported fleet or recovery rules.');
  const presence = c.rules.megastructurePresence;
  if (!object(presence) || presence.version !== 1 || presence.maxPerPlanet !== 1 || typeof presence.eligiblePlanetChance !== 'number' || !(presence.eligiblePlanetChance >= 0 && presence.eligiblePlanetChance <= 1)) fail('Invalid site presence policy.');
  if (!object(c.fleet) || c.fleet.provisioned !== false || !Array.isArray(c.fleet.vesselIds) || c.fleet.vesselIds.length || !Array.isArray(c.players) || c.players.length) fail('Campaign records cannot contain a partially saved live fleet.');
  const d = c.discoveries;
  if (!object(d) || !object(d.systems) || !object(d.sites) || !Array.isArray(d.returnAnchors)) fail('Invalid discovery catalogue.');
  for (const [id, system] of Object.entries(d.systems)) if (!string(id) || !object(system) || !['detected', 'charted', 'surveyed'].includes(system.knowledge) || (system.visited !== undefined && typeof system.visited !== 'boolean')) fail('Invalid system discovery.');
  for (const [id, site] of Object.entries(d.sites)) if (!string(id) || !object(site) || !string(site.systemId) || !Object.hasOwn(d.systems, site.systemId)) fail('Invalid site discovery.');
  const s = c.story;
  if (!object(s) || s.contentVersion !== CONTENT_VERSION || c.generation.versions.storyContent !== CONTENT_VERSION || !object(s.facts) || !object(s.quests)) fail('Unsupported story content.');
  if (Object.values(s.facts).some(value => typeof value !== 'boolean')) fail('Story facts must be boolean.');
  if (!integer(s.nextEventSequence) || s.nextEventSequence < 1 || !Array.isArray(s.journal)) fail('Invalid journal sequence.');
  idArray(s.appliedEventIds, 'event IDs'); idArray(s.appliedOneTimeEffects, 'one-time effects');
  const intro = s.intro;
  if (!object(intro) || !['pending', 'complete'].includes(intro.status)) fail('Invalid intro state.');
  if (intro.status === 'pending' ? intro.presentation !== null || intro.checkpoint !== 'not-started' : !['played', 'skipped'].includes(intro.presentation) || !['incident-recorded', 'departure-ready'].includes(intro.checkpoint)) fail('Invalid intro checkpoint.');
  idArray(intro.lessonsPractised, 'tutorial lessons');
  const ids = new Set(); let previous = 0;
  for (const entry of s.journal) {
    const sequence = /^event\/(\d+)$/.exec(entry?.id)?.[1];
    if (!object(entry) || !sequence || +sequence <= previous || +sequence >= s.nextEventSequence || ids.has(entry.id) || !string(entry.textId) || !Number.isFinite(entry.simulationSeconds) || !object(entry.subjects) || Object.values(entry.subjects).some(value => !string(value))) fail('Invalid journal entry.');
    ids.add(entry.id); previous = +sequence;
  }
  if (intro.status === 'complete' && (!s.facts.surveyTenderMissing || !s.facts.outgoingPulseRecorded || !s.appliedOneTimeEffects.includes('intro.canonical-incident'))) fail('Incomplete introductory incident.');
  const q = s.quests['quest/first-receiver'];
  if (intro.status === 'pending' && (q || s.facts.surveyTenderMissing || s.facts.destinationIdentified)) fail('Pending introduction contains completed story state.');
  if (intro.status === 'complete') {
    if (!object(q) || q.state !== 'active' || !['identify-bearing', 'travel-to-receiver', 'survey-receiver'].includes(q.step)) fail('Invalid first investigation.');
    idArray(q.completedObjectives, 'quest objectives');
    if (q.step !== 'identify-bearing' && (!string(q.targetSystemId) || !Object.hasOwn(d.systems, q.targetSystemId) || !s.facts.destinationIdentified)) fail('First investigation has no charted destination.');
    if (q.step === 'identify-bearing' && (q.targetSystemId !== null || s.facts.destinationIdentified || intro.checkpoint !== 'incident-recorded')) fail('Invalid unresolved transmission state.');
    if (q.step !== 'identify-bearing' && (!q.completedObjectives.includes('identify-bearing') || intro.checkpoint !== 'departure-ready')) fail('Missing transmission evidence.');
    if (q.step === 'survey-receiver' && (!d.systems[q.targetSystemId].visited || !q.completedObjectives.includes('reach-receiver'))) fail('The receiver has not been reached.');
  }
  if (!object(c.sites) || !object(c.recovery) || c.recovery.policyVersion !== 1 || !object(c.recovery.highestRawBySite)) fail('Invalid recovery ledger.');
  for (const [id, raw] of Object.entries(c.recovery.highestRawBySite)) if (!Object.hasOwn(d.sites, id) || !integer(raw) || raw > 1000000) fail('Invalid per-site recovered data.');
  const stage = mysteryProgress(recoveryTotal(c)).stage;
  for (let i = 1; i <= 2; i++) {
    const unlocked = i <= stage;
    if (s.appliedOneTimeEffects.includes(`goldenPath.lead-${i}`) !== unlocked || s.journal.filter(entry => entry.textId === `log.golden-path-${i}`).length !== (unlocked ? 1 : 0)) fail('Recovery milestones do not match the saved data.');
  }
  if (!Array.isArray(c.legacyImports)) fail('Invalid migration record.');
  return c;
}

export function encodeCampaign(campaign) {
  validateCampaign(campaign);
  const json = JSON.stringify(campaign, null, 2);
  if (new TextEncoder().encode(json).byteLength > MAX_SAVE_BYTES) fail('Campaign exceeds the current 10 MB import/export limit.');
  return json;
}

export function decodeCampaign(json) {
  if (typeof json !== 'string' || json.length > MAX_SAVE_BYTES || new TextEncoder().encode(json).byteLength > MAX_SAVE_BYTES) fail('Campaign file exceeds the current 10 MB limit.');
  let record;
  try { record = JSON.parse(json); } catch { fail('The campaign file is incomplete or is not valid JSON.'); }
  return validateCampaign(record);
}

// Import into a new identity by default. Importing a file never silently replaces
// an existing slot with the same campaign ID.
export function importCampaignCopy(json, { id = globalThis.crypto.randomUUID(), now = new Date().toISOString() } = {}) {
  const c = decodeCampaign(json);
  c.campaignId = id; c.revision = 0; c.createdAt = now; c.savedAt = now;
  return validateCampaign(c);
}
