import { Rng } from '../core/rng.js';
import { roomAcoustics,soundField,noiseSamples,FootstepTracker } from './acoustics.js';

export class SurveySound {
  constructor(plan,{context=null,destination=null,storage=globalThis.localStorage}={}){
    this.plan=plan;this.contextProvider=context;this.destinationProvider=destination;this.storage=storage;this.ownsContext=!context;
    this.enabled=true;try{this.enabled=storage?.getItem('starseed.survey.sound')!=='off';}catch{}
    this.active=false;this.disposed=false;this.ctx=null;this.sources=[];this.nodes=[];this.events=new Set();this.impulses=new Map();this.footsteps=new FootstepTracker();this.rng=Rng.fromString(plan.seed).fork('ambient-events');this.nextEvent=3;this.stats={steps:0,events:0,voices:0};
    this.lastAlert=-100;this.visibility=()=>this.gate();globalThis.document?.addEventListener('visibilitychange',this.visibility);
  }
  unlock(){
    if(this.disposed||!this.enabled)return;
    if(!this.ctx){try{const c=this.contextProvider?.()||(!this.contextProvider?new (globalThis.AudioContext||globalThis.webkitAudioContext)():null);if(c)this.connect(c,this.destinationProvider?.()||c.destination);}catch{return;}}
    if(this.ownsContext&&this.ctx?.state==='suspended')this.ctx.resume().catch(()=>{});
    this.gate();
  }
  node(type,...args){const n=this.ctx[type](...args);this.nodes.push(n);return n;}
  connect(c,destination){
    if(this.ctx||this.disposed)return;this.ctx=c;
    this.master=this.node('createGain');this.master.gain.value=0;
    const limiter=this.node('createDynamicsCompressor');limiter.threshold.value=-16;limiter.ratio.value=5;limiter.attack.value=.015;limiter.release.value=.2;this.master.connect(limiter).connect(destination);
    const data=noiseSamples(this.plan.seed+'-ambience',c.sampleRate*4);this.noise=c.createBuffer(1,data.length,c.sampleRate);this.noise.copyToChannel(data,0);
    this.footNoise=c.createBuffer(1,c.sampleRate,c.sampleRate);const foot=this.footNoise.getChannelData(0),footRng=Rng.fromString(this.plan.seed+'-sole');for(let i=0;i<foot.length;i++)foot[i]=(footRng.next()*2-1)*.7;
    const voice=(kind,freq)=>{
      const src=kind==='hum'?this.node('createOscillator'):this.node('createBufferSource'),filter=this.node('createBiquadFilter'),gain=this.node('createGain'),pan=this.node('createStereoPanner');
      if(kind==='hum'){src.type='triangle';src.frequency.value=47;}else{src.buffer=this.noise;src.loop=true;}
      filter.type=kind==='air'?'bandpass':'lowpass';filter.frequency.value=freq;filter.Q.value=.65;gain.gain.value=0;
      src.connect(filter).connect(gain).connect(pan).connect(this.master);src.start();this.sources.push(src);return {src,filter,gain,pan};
    };
    this.layers={rumble:voice('noise',125),air:voice('air',780),water:voice('water',2300),generator:voice('hum',220),lift:voice('lift',380)};
    this.effects=this.node('createGain');this.effects.connect(this.master);
    this.early=this.node('createDelay',1);this.earlyGain=this.node('createGain');this.earlyGain.gain.value=.1;this.effects.connect(this.early).connect(this.earlyGain).connect(this.master);
    this.reverbs=[0,1].map(()=>{const conv=this.node('createConvolver'),gain=this.node('createGain');gain.gain.value=0;this.effects.connect(conv).connect(gain).connect(this.master);return {conv,gain};});
    this.reverbIndex=0;this.stats.voices=this.sources.length;this.gate();
  }
  setEnabled(on){this.enabled=!!on;try{this.storage?.setItem('starseed.survey.sound',on?'on':'off');}catch{}if(on)this.unlock();this.gate();}
  setActive(on){this.active=!!on;this.gate();}
  gate(){if(!this.ctx)return;const audible=this.active&&this.enabled&&!globalThis.document?.hidden&&!this.disposed;this.master.gain.cancelScheduledValues(this.ctx.currentTime);if(!audible)this.master.gain.setValueAtTime(0,this.ctx.currentTime);else this.master.gain.setTargetAtTime(.6,this.ctx.currentTime,.1);}
  room(profile){
    const c=this.ctx,t=c.currentTime,decay=[.4,.8,1.4,2.4,4.8].reduce((a,b)=>Math.abs(b-profile.decay)<Math.abs(a-profile.decay)?b:a);
    this.early.delayTime.setTargetAtTime(profile.delay,t,.15);this.earlyGain.gain.setTargetAtTime(profile.wet*.4,t,.1);
    if(this.decay===decay){this.reverbs[this.reverbIndex].gain.gain.setTargetAtTime(profile.wet,t,.15);return;}this.decay=decay;
    if(!this.impulses.has(decay)){
      const length=Math.ceil(c.sampleRate*decay),buffer=c.createBuffer(2,length,c.sampleRate),rng=Rng.fromString(this.plan.seed+'-echo-'+decay);
      for(let channel=0;channel<2;channel++){const data=buffer.getChannelData(channel);for(let i=0;i<length;i++){const time=i/c.sampleRate;data[i]=(rng.next()*2-1)*Math.exp(-6.91*time/decay)*Math.min(1,time/.018);}}
      this.impulses.set(decay,buffer);
    }
    this.reverbs[this.reverbIndex].gain.gain.setTargetAtTime(0,t,.15);this.reverbIndex=1-this.reverbIndex;
    const next=this.reverbs[this.reverbIndex];next.conv.buffer=this.impulses.get(decay);next.gain.gain.setTargetAtTime(profile.wet,t,.15);
  }
  event(kind,profile,pan=0){
    if(!this.ctx||this.events.size>=8)return;
    const c=this.ctx,t=c.currentTime,metal=profile.material==='metal',duration=kind==='strain'?1.4:kind==='drip'?.25:.18;
    const tonal=kind==='drip'||kind==='strain'||kind==='alert',src=tonal?c.createOscillator():c.createBufferSource(),filter=c.createBiquadFilter(),gain=c.createGain(),stereo=c.createStereoPanner();
    if(tonal){src.type='sine';src.frequency.setValueAtTime(kind==='alert'?660:kind==='drip'?1300:92,t);src.frequency.exponentialRampToValueAtTime(kind==='alert'?880:kind==='drip'?440:68,t+duration);}else{src.buffer=kind==='step'?this.footNoise:this.noise;src.playbackRate.value=.9+this.rng.next()*.2;}
    filter.type='bandpass';filter.frequency.value=kind==='step'?(metal?1450:profile.material==='soil'?360:750):kind==='strain'?170:1700;filter.Q.value=metal?2.2:.7;
    const volume=kind==='step'?.27:kind==='drip'?.045:.075;
    gain.gain.setValueAtTime(.00001,t);gain.gain.linearRampToValueAtTime(volume,t+.009);gain.gain.exponentialRampToValueAtTime(.00001,t+duration);stereo.pan.value=pan;
    src.connect(filter).connect(gain).connect(stereo).connect(this.effects);
    const record={src,nodes:[src,filter,gain,stereo]};this.events.add(record);
    src.onended=()=>{for(const n of record.nodes)n.disconnect();this.events.delete(record);};src.start(t);src.stop(t+duration+.04);this.stats.events++;if(kind==='step')this.stats.steps++;
  }
  update(state,active=true){
    this.setActive(active);if(!this.ctx&&this.contextProvider)this.unlock();
    const step=this.footsteps.update(state,active&&this.enabled),profile=roomAcoustics(this.plan,state);this.profile=profile;
    if(!this.ctx||!active||!this.enabled||globalThis.document?.hidden)return;
    const field=soundField(this.plan,state),t=this.ctx.currentTime;this.room(profile);
    for(const [name,voice] of Object.entries(this.layers))voice.gain.gain.setTargetAtTime(field[name],t,.22);
    this.layers.generator.pan.pan.setTargetAtTime(field.pan,t,.2);
    const alert=Math.max(state.packDisabledAt??-100,state.gravityAlertAt??-100);if(alert>this.lastAlert){this.lastAlert=alert;if(state.time-alert<1)this.event('alert',{material:'suit'},0);}
    if(step)this.event('step',profile,(this.stats.steps%2?1:-1)*.07);
    if(state.time>this.nextEvent){this.nextEvent=state.time+this.rng.range(6,14);if(field.below>.5)this.event(this.plan.generator.environment.wet&&this.rng.chance(.6)?'drip':'strain',profile,this.rng.range(-.85,.85));}
  }
  dispose(){
    if(this.disposed)return;this.disposed=true;this.gate();globalThis.document?.removeEventListener('visibilitychange',this.visibility);
    for(const src of this.sources){try{src.stop();}catch{}}for(const e of this.events){try{e.src.stop();}catch{}for(const n of e.nodes)n.disconnect();}this.events.clear();
    for(const n of this.nodes)n.disconnect();this.impulses.clear();if(this.ownsContext)this.ctx?.close().catch(()=>{});
  }
}
