// Player-facing summaries remain separate from event/state handling.
export const LOG_ENTRIES = Object.freeze({
  'log.expedition-purpose': { title: 'Why we came', text: 'Our expedition came to study the enormous black hole and its jets. We found a nearby system enclosed by a perfect mirror and have spent several years investigating it. Our ships are our laboratories, workshops and home.' },
  'log.missing-tender': { title: 'The survey tender', text: 'A survey flight found anomalous readings on the mirror. Your daughter entered an opening while investigating. The surface closed and contact stopped. The expedition is working together to find a way to reach the people aboard and bring them home.' },
  'log.outgoing-transmission': { title: 'A new lead', text: 'The survey network recorded an electromagnetic burst during the opening. We suspect it was a communication, but have not yet established its purpose. Combining the probe recordings can tell us where it was directed.' },
  'log.destination-identified': { title: 'The transmission destination', text: 'The probe recordings point toward a charted system. Investigating it may reveal a receiver or another connection to the mirrored enclosure.' },
  'log.system-arrived': { title: 'Arrival recorded', text: 'The expedition has reached this system. Its position is recorded for the return journey.' },
  'log.site-discovered': { title: 'Megastructure located', text: 'A planetary site has been located. Its position is recorded for future visits.' },
  'log.golden-path-1': { title: 'Golden Path — a shared index', text: 'The recovered fragments share an address space. These sites are parts of the same record despite their separation. A repeated identifier translates as GOLDEN PATH.' },
  'log.golden-path-2': { title: 'Golden Path — a deeper network', text: 'The index contains references to a deeper network. Planetary copies remain useful, and further recovered data continues to contribute to our understanding.' }
});

export const BASIC_LESSONS = Object.freeze([
  { id: 'flight', title: 'Flight and assistance', text: 'W/S moves forward/back, A/D sideways and Space/C up/down. Mouse steers; Q/E rolls. Tab selects a target, N engages navigation and Z changes assistance. In ROT, use opposite burns to reduce drift. X brakes in FULL assistance’s current reference frame; selecting a small craft does not change that frame. P returns to a remembered pilot seat. On a controller, LT brakes, RB targets, right D-pad engages navigation and R3 shows the complete layout. Available engines determine how quickly your ship can stop.' },
  { id: 'time', title: 'Shared time', text: 'Both players must request faster time. Either player can cancel immediately. Burns, close encounters and surface exploration may hold the expedition at normal time.' },
  { id: 'exploration', title: 'Exploration', text: 'Guided exploration shows access markers immediately. Survey exploration reveals them when you approach within 12 metres on foot, retaining the discovery in your save. Assisted traversal permits jetpack lift over broken platform routes; standard traversal uses jumps. Both still require restoring the machinery. Keep a record of useful locations and take time to explore and prepare.' },
  { id: 'recovery', title: 'Recovering records', text: 'Optional fragments add to the central record. Recovering the central record enables surface return; finding every fragment is optional. Previously recovered data cannot be collected again for extra credit.' }
]);

export function currentLeads(campaign) {
  const q = campaign.story.quests['quest/first-receiver'];
  if (!q) return [];
  const steps = {
    'identify-bearing': ['Analyse the recorded transmission', 'Combine the survey probes’ observations to identify the likely destination.'],
    'travel-to-receiver': ['Investigate the transmission destination', 'Travel to the identified system and look for a connection to the mirrored enclosure.'],
    'survey-receiver': ['Survey the receiver system', 'Look for infrastructure with a signal signature matching the recorded transmission.']
  };
  const [title, text] = steps[q.step];
  return [{ id: 'quest/first-receiver', title, text, targetSystemId: q.targetSystemId }];
}
