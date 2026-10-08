import { renderStoryLog } from './storyLog.js';

export function renderExpeditionPanel(root,saves){
  const doc=root.ownerDocument;root.replaceChildren();
  const add=(tag,text,parent=root)=>{const e=doc.createElement(tag);e.textContent=text;parent.append(e);return e;};
  add('h3','Expedition saves');
  add('p','Save this flight to keep your fleet, inventories and progress. Active expeditions autosave every 30 seconds while playing.');
  add('p','Loading resumes the recorded simulation time at normal speed. Navigation orders wait for re-engagement; underground explorers return to their entrance with site progress retained.');
  const status=add('p',saves.status);status.setAttribute('role','status');status.dataset.campaignStatus='';
  const controls=add('div','');
  const act=(label,fn,parent=controls)=>{const b=add('button',label,parent);b.type='button';b.style.margin='4px 8px 4px 0';b.onclick=async()=>{b.disabled=true;try{await fn();status.textContent=saves.status;}catch(e){status.textContent=e.message;}finally{b.disabled=false;}};return b;};
  act('Save current flight',async()=>{await saves.save();await slots();showStory();});
  act('Export JSON',()=>{const url=URL.createObjectURL(new Blob([saves.exportJSON()],{type:'application/json'}));const a=doc.createElement('a');a.href=url;a.download='starseed-flight.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
  const label=add('label','Import a JSON copy '),file=doc.createElement('input');file.type='file';file.accept='.json,application/json';label.append(file);
  file.onchange=async()=>{try{const f=file.files?.[0];if(!f)return;if(f.size>10*1024*1024)throw Error('Choose a save smaller than 10 MB.');const imported=await saves.import(await f.text());status.textContent=`Imported ${imported.label} into a separate slot. Choose Load when ready.`;await slots();}catch(e){status.textContent=e.message;}finally{file.value='';}};
  const list=add('section','');
  async function slots(){list.replaceChildren();add('h4','Saved flights',list);try{const rows=await saves.storage.list();if(!rows.length)add('p','No saved flights yet.',list);for(const row of rows){const line=add('div','',list);add('span',`${row.label} · revision ${row.revision} `,line);act('Load',()=>saves.load(row.id),line);act('Load previous revision',()=>saves.load(row.id,true),line);}}catch(e){add('p',e.message,list);}}
  const orders=add('section','');
  for(const v of saves.game()?.vessels||[])if(v.nav.savedOrder)act(`Resume ${v.name}: ${v.nav.savedOrder.name||v.nav.savedOrder.kind}`,()=>{if(v.ftl.state==='spool'||v.ftl.state==='cruise')throw Error('Drop out of FTL before replanning this saved order.');if(v.nav.order(v.nav.savedOrder)){v.nav.savedOrder=null;saves.status='Navigation order replanned from the current flight state.';}},orders);
  const log=add('section','');function showStory(){const c=saves.game()?.campaign;if(c)renderStoryLog(log,c);}
  slots();showStory();
}
