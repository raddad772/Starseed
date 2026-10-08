// Reusable first-run form. The caller provisions the fleet only after accepting
// these choices; changing a field has no effects on an existing expedition.
export function renderExpeditionSetup(container, { onCreate, submitLabel = 'Start expedition' }) {
  const doc = container.ownerDocument, form = doc.createElement('form');
  const title = doc.createElement('h2'); title.textContent = 'New expedition'; form.append(title);
  const intro = doc.createElement('p'); intro.textContent = 'A hopeful journey, with a home you bring along. Choose the kind of assistance you would like.'; form.append(intro);
  function field(name, label, options) {
    const row = doc.createElement('label'), text = doc.createElement('span'), select = doc.createElement('select');
    text.textContent = label; select.name = name;
    for (const [value, label] of options) { const option = doc.createElement('option'); option.value = value; option.textContent = label; select.append(option); }
    row.append(text, select); form.append(row);
  }
  field('flight', 'Spaceflight', [['easy', 'Easy · Horizon fleet'], ['medium', 'Medium · Expedition fleet'], ['hard', 'Hard · Pioneer fleet']]);
  field('exploration', 'Exploration', [['guided', 'Easy · Guided locations'], ['survey', 'Hard · Survey for sites']]);
  field('puzzles', 'Puzzles and traversal', [['assisted', 'Easy · Assisted traversal'], ['standard', 'Hard · Standard traversal']]);
  const button = doc.createElement('button'); button.type = 'submit'; button.textContent = submitLabel; form.append(button);
  form.addEventListener('submit', event => {
    event.preventDefault();
    onCreate({ flight: form.elements.flight.value, exploration: form.elements.exploration.value, puzzles: form.elements.puzzles.value });
  });
  container.replaceChildren(form);
  return form;
}
