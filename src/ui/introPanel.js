import { INTRO_COPY } from '../campaign/tutorial.js';

export function renderIntroPanel(root,intro,onChange=()=>{}){
  if(!intro)return;
  const doc=root.ownerDocument,add=(tag,text)=>{const e=doc.createElement(tag);e.textContent=text;root.append(e);return e;};
  root.replaceChildren();root.className='introPanel';
  const [title,text,action]=INTRO_COPY[intro.state.step];
  add('h3',title);add('p',text);
  const status=add('p','');status.setAttribute('role','status');
  const button=(label,fn)=>{const b=add('button',label);b.type='button';b.onclick=()=>{try{fn();renderIntroPanel(root,intro,onChange);onChange();}catch(e){status.textContent=e.message;}};return b;};
  if(action&&intro.state.step!=='ready')button(action,()=>intro.act());
  if(intro.state.step==='scan')button('Use navigation assistance',()=>intro.act('assist'));
  if(['anomaly','crossing','closed','analysis'].includes(intro.state.step)){
    const display=add('div','');display.className='surveyTelemetry';display.dataset.phase=intro.state.step;
    const sphere=doc.createElement('div');sphere.className='mirrorTrace';display.append(sphere);
    const caption=doc.createElement('p');caption.textContent='Survey telemetry · reflected-signal reconstruction';display.append(caption);
  }
  if(intro.state.step==='analysis')for(let i=0;i<3;i++){const done=intro.state.probes.includes(i);button(`Probe ${i+1} · ${done?'correlated':'compare recording'}`,()=>intro.probe(i)).disabled=done;}
  if(intro.active){
    add('p','Resume flight to practise. Enter performs the current lesson action; all actions are also available here.');
    button('Retry flight practice safely',()=>intro.act('retry'));
    button(intro.consent.pending?'Player 1 agrees to skip':'Skip introduction',()=>intro.act('skip'));
    if(intro.consent.pending){add('p','Waiting for both players. Player 2: A agrees, B cancels.');button('Keep playing the introduction',()=>intro.act('cancel'));}
  }else add('p','The flight basics below remain available. Interstellar travel and the full mirror scene are still being built; this prototype continues with local exploration.');
}
