// Prototype voice uses an installed English female system voice when available.
// No network service, generated asset download or shared audio context required.
export function chooseSuitVoice(voices){
 const english=voices.filter(v=>/^en[-_]/i.test(v.lang));
 for(const name of ['Samantha','Serena','Karen','Moira','Victoria','Zira','Susan','Google US English']){const v=english.find(v=>v.name.includes(name));if(v)return v;}
 return english.find(v=>v.default)||english[0]||null;
}
export class SuitVoice {
 constructor({storage=globalThis.localStorage,synth=globalThis.speechSynthesis,Utterance=globalThis.SpeechSynthesisUtterance}={}){
  this.storage=storage;this.synth=synth;this.Utterance=Utterance;this.enabled=true;try{this.enabled=storage?.getItem('starseed.survey.voice')!=='off';}catch{}
  this.unlocked=false;this.active=false;this.queue=[];this.current=null;this.seen=new Map();this.stats={spoken:0,voice:'',last:''};
 }
 unlock(){this.unlocked=true;}
 setEnabled(on){this.enabled=!!on;try{this.storage?.setItem('starseed.survey.voice',on?'on':'off');}catch{}if(!on)this.stop();}
 stop(){this.queue=[];if(this.current){this.current.onend=this.current.onerror=null;this.synth?.cancel();this.current=null;}}
 speak(text,key,urgent=false){if(!this.enabled||!this.active||!this.unlocked||!this.synth||!this.Utterance)return;if(this.queue.some(q=>q.key===key)||this.current?.key===key)return;
  if(urgent){this.stop();}this.queue.push({text,key});if(this.queue.length>3)this.queue.shift();this.next();
 }
 next(){if(this.current||!this.queue.length||!this.active||!this.enabled)return;const {text,key}=this.queue.shift(),u=new this.Utterance(text),voice=chooseSuitVoice(this.synth.getVoices());
  if(voice)u.voice=voice;u.lang=voice?.lang||'en-US';u.rate=.94;u.pitch=1;u.volume=.8;u.key=key;this.current=u;
  u.onstart=()=>{this.stats.spoken++;this.stats.voice=voice?.name||'System English';this.stats.last=text;};
  u.onend=u.onerror=()=>{if(this.current===u){this.current=null;this.next();}};this.synth.speak(u);
 }
 update(s,active){
  this.active=active&&this.enabled&&!globalThis.document?.hidden;if(!this.active){this.stop();for(const [key,value] of [['pack',s.packDisabledAt],['gravity',s.gravityAlertAt],['recovery',s.recoveries],['scan',s.scanAt],['record',Number(s.dataRecovered)],['circuits',s.solved.size]])this.seen.set(key,value);return;}
  const event=(key,value,text,urgent=false)=>{const old=this.seen.get(key);this.seen.set(key,value);if(old!==undefined&&value>old)this.speak(text,key,urgent);};
  event('pack',s.packDisabledAt,'Jetpack disabled.',true);
  // Settle a threshold crossing before speaking, so stepping on a sill cannot chatter.
  if(s.time-s.gravityAlertAt>.35)event('gravity',s.gravityAlertAt,s.gravityAlert,true);
  event('recovery',s.recoveries,'Safety tether engaged. Returning to a stable ledge.',true);
  event('scan',s.scanAt,'Scanning data. Golden Path data found. Signal saved. Find more.');
  event('record',Number(s.dataRecovered),'Central record recovered. Surface return is online.');
  event('circuits',s.solved.size,s.archiveReady?'Archive bus restored. Central record available.':'Return circuit restored.');
 }
 dispose(){this.stop();this.active=false;}
}
export const noticeDuration=text=>Math.min(20000,Math.max(6500,text.trim().split(/\s+/).length*330+1800));
export function appendNoticeLog(parent,sim){
 if(!sim.noticeLog?.length)return;const h=document.createElement('h3');h.textContent='Recent suit messages';parent.append(h);
 for(const text of [...sim.noticeLog].reverse()){const p=document.createElement('p');p.textContent=text;parent.append(p);}
}
