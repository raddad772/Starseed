// Reusable first-run form. The caller provisions the fleet only after accepting
// these choices; changing a field has no effects on an existing expedition.
export function renderExpeditionSetup(container, { onCreate, submitLabel = 'Start expedition', details=false, seed='', onBack }) {
  const doc = container.ownerDocument, form = doc.createElement('form');
  form.className='expeditionSetup';
  const title = doc.createElement('h2'); title.textContent = 'New expedition'; form.append(title);
  const intro = doc.createElement('p'); intro.textContent = 'A hopeful journey, with a home you bring along. Choose the kind of assistance you would like.'; form.append(intro);
  function field(name, label, options) {
    const row = doc.createElement('label'), text = doc.createElement('span'), select = doc.createElement('select');
    text.textContent = label; select.name = name;
    for (const [value, label] of options) { const option = doc.createElement('option'); option.value = value; option.textContent = label; select.append(option); }
    row.append(text, select); form.append(row);return row;
  }
  if(details)for(const [name,title,value,max] of [['label','Expedition name','Our expedition',120],['seed','Region seed',seed,100]]){
    const row=doc.createElement('label'),input=doc.createElement('input');row.className='identityField';row.textContent=title;input.name=name;input.value=value;input.required=true;input.maxLength=max;row.append(input);form.append(row);
  }
  const flight=field('flight', 'Spaceflight', [['easy', 'Easy · Horizon fleet'], ['medium', 'Medium · Expedition fleet'], ['hard', 'Hard · Pioneer fleet']]);
  const explain=doc.createElement('span');explain.className='explain';flight.append(explain);
  const explainFlight=()=>{explain.textContent={easy:'Strong engines, artificial gravity and forgiving handling. Your home craft is Neptune 3.',medium:'More planning and careful braking. Start in Hearth with the Expedition fleet.',hard:'Early technology, weaker maneuvering engines and freefall cabins. Start in Nomad with the Pioneer fleet.'}[form.elements.flight.value];};
  form.elements.flight.onchange=explainFlight;explainFlight();
  field('exploration', 'Exploration', [['guided', 'Easy · Guided locations'], ['survey', 'Hard · Survey for sites']]);
  field('puzzles', 'Puzzles and traversal', [['assisted', 'Easy · Assisted traversal'], ['standard', 'Hard · Standard traversal']]);
  if(details){
    const row=field('intro','Introduction',[['play','Play the single-player tutorial'],['skip','Skip · read the Story Log']]);
    const hint=doc.createElement('span');hint.className='explain';hint.textContent='The introduction is single-player. Friends can join after you finish or skip it.';row.append(hint);
  }
  const status=doc.createElement('p');status.hidden=true;status.setAttribute('role','status');form.append(status);
  const footer=doc.createElement('footer');form.append(footer);
  const button = doc.createElement('button'); button.type = 'submit';button.className='primary'; button.textContent = submitLabel; footer.append(button);
  if(onBack){const back=doc.createElement('button');back.type='button';back.textContent='Back';back.dataset.padBack='';back.onclick=onBack;footer.append(back);}
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if(button.disabled)return;button.disabled=true;status.hidden=false;status.textContent='Preparing your fleet…';
    try{await onCreate({ flight: form.elements.flight.value, exploration: form.elements.exploration.value, puzzles: form.elements.puzzles.value },details?{label:form.elements.label.value.trim(),seed:form.elements.seed.value.trim(),intro:form.elements.intro.value}:{});status.textContent='';}
    catch(error){status.textContent=error.message;}finally{button.disabled=false;status.hidden=!status.textContent;}
  });
  container.replaceChildren(form);
  return form;
}
