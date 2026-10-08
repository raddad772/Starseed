import { LOG_ENTRIES, BASIC_LESSONS, currentLeads } from '../campaign/content.js';
import { recoveryTotal } from '../campaign/state.js';

// A DOM view of existing state. Rendering never fires story events or rewards.
export function renderStoryLog(container, campaign) {
  const doc = container.ownerDocument;
  const root = doc.createElement('section'); root.className = 'storyLog';
  function add(tag, text, parent = root) { const el = doc.createElement(tag); el.textContent = text; parent.append(el); return el; }
  add('h2', 'Story Log');
  add('p', `${campaign.label} · ${recoveryTotal(campaign)} Golden Path data`);
  add('h3', 'Current leads');
  const leads = currentLeads(campaign);
  if (!leads.length) add('p', 'Your expedition record will collect the leads you discover.');
  for (const lead of leads) { const article = add('article', ''); add('h4', lead.title, article); add('p', lead.text, article); if (lead.targetSystemId) add('p', `Destination: ${lead.targetSystemId}`, article); }
  add('h3', 'Expedition record');
  if (!campaign.story.journal.length) add('p', 'No events recorded yet.');
  for (const event of campaign.story.journal) {
    const entry = LOG_ENTRIES[event.textId] || { title: 'Earlier expedition entry', text: event.textId };
    const article = add('article', ''); article.dataset.eventId = event.id;
    add('h4', entry.title, article); add('p', entry.text, article);
    if (Object.keys(event.subjects).length) add('p', Object.values(event.subjects).join(' · '), article);
  }
  add('h3', 'Basics');
  for (const lesson of BASIC_LESSONS) {
    const details = add('details', ''); add('summary', lesson.title, details); add('p', lesson.text, details);
  }
  container.replaceChildren(root);
  return root;
}
