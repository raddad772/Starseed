// Sound for a planned site, built on the survey's pieces (noise, footsteps,
// the suit voice): the echo of the space you are in from its size and what it
// is made of, ventilation and rumble, the surviving generator's hum near it,
// running water near seeps, footsteps, and now and then a drip or a creak; and the themes' glitches (site/
// siteGlitches.js sounds): a vent's or a pressure front's hiss, a singing conduit's or rail's tone, a fold's
// thin whine, each as loud as it is now and as near.
import { Rng } from '../../core/rng.js';
import { noiseSamples, FootstepTracker } from '../acoustics.js';
import { SuitVoice } from '../suitVoice.js';
import { inside } from '../plan/geom2.js';

const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));

export class SiteSound {
  constructor(plan, site, { storage = globalThis.localStorage } = {}) {
    this.plan = plan; this.site = site; this.storage = storage;
    this.voice = new SuitVoice({ storage });
    this.enabled = true; try { this.enabled = storage?.getItem('starseed.survey.sound') !== 'off'; } catch { /* private */ }
    this.ctx = null; this.events = new Set(); this.impulses = new Map(); this.footsteps = new FootstepTracker();
    this.rng = Rng.fromString(plan.seed).fork('site-sound'); this.nextEvent = 4; this.steps = 0;
    this.generators = site.machinesLive || [];
    this.water = [...(site.seeps || []).map((s) => [s.x, (s.y0 + s.y1) / 2, s.z]), ...site.water.map((w) => [w.poly[0][0], w.y, w.poly[0][1]])];
  }

  unlock() {
    this.voice.unlock();
    if (!this.enabled || this.ctx) { this.ctx?.resume?.(); return; }
    try { this.connect(new (globalThis.AudioContext || globalThis.webkitAudioContext)()); } catch { /* no audio */ }
  }
  setEnabled(on) { this.enabled = !!on; try { this.storage?.setItem('starseed.survey.sound', on ? 'on' : 'off'); } catch { /* */ } if (on) this.unlock(); else { this.voice.stop(); if (this.master) this.master.gain.value = 0; } }
  say(text, key, urgent = false) { this.voice.active = this.enabled && !globalThis.document?.hidden; this.voice.speak(text, key, urgent); }

  connect(c) {
    this.ctx = c;
    this.master = c.createGain(); this.master.gain.value = 0;
    const limiter = c.createDynamicsCompressor(); limiter.threshold.value = -16; limiter.ratio.value = 5;
    this.master.connect(limiter).connect(c.destination);
    const data = noiseSamples(this.plan.seed + '-ambience', c.sampleRate * 4);
    this.noise = c.createBuffer(1, data.length, c.sampleRate); this.noise.copyToChannel(data, 0);
    this.footNoise = c.createBuffer(1, c.sampleRate, c.sampleRate);
    const foot = this.footNoise.getChannelData(0), fr = Rng.fromString(this.plan.seed + '-sole');
    for (let i = 0; i < foot.length; i++) foot[i] = (fr.next() * 2 - 1) * 0.7;
    const layer = (kind, freq, tone = 47, wave = 'triangle') => {
      const src = kind === 'hum' ? c.createOscillator() : c.createBufferSource(), filter = c.createBiquadFilter(), gain = c.createGain(), pan = c.createStereoPanner();
      if (kind === 'hum') { src.type = wave; src.frequency.value = tone; } else { src.buffer = this.noise; src.loop = true; }
      filter.type = kind === 'air' ? 'bandpass' : 'lowpass'; filter.frequency.value = freq; filter.Q.value = 0.65; gain.gain.value = 0;
      src.connect(filter).connect(gain).connect(pan).connect(this.master); src.start();
      return { gain, pan };
    };
    this.layers = { rumble: layer('noise', 125), air: layer('air', 780), water: layer('water', 2300), generator: layer('hum', 220),
      // (the glitches': a hiss, a tone, a whine)
      hiss: layer('air', 3400), sing: layer('hum', 1200, 331, 'sine'), whine: layer('hum', 4000, 1187, 'sine') };
    this.effects = c.createGain(); this.effects.connect(this.master);
    this.early = c.createDelay(1); this.earlyGain = c.createGain(); this.effects.connect(this.early).connect(this.earlyGain).connect(this.master);
    this.reverbs = [0, 1].map(() => { const conv = c.createConvolver(), gain = c.createGain(); gain.gain.value = 0; this.effects.connect(conv).connect(gain).connect(this.master); return { conv, gain }; });
    this.reverbIndex = 0;
  }

  // the space you are in, as an acoustic room: Sabine-ish, bounded
  acoustics(p) {
    let width = 4, length = 10, height = 3, material = 'concrete';
    const s = this.site.spaces.find((q) => p[1] >= q.y0 - 0.5 && p[1] <= q.y1 && inside([p[0], p[2]], q.poly, 0));
    if (s) {
      const xs = s.poly.map((q) => q[0]), zs = s.poly.map((q) => q[1]);
      width = Math.max(...xs) - Math.min(...xs); length = Math.max(...zs) - Math.min(...zs); height = s.y1 - s.y0;
      if (s.id.startsWith('L') || s.id === 'ACCESS') material = 'metal'; // on a catwalk in a hall
      if (s.id === 'staging') material = 'soil';
    }
    const volume = width * length * height, surface = 2 * (width * length + width * height + length * height);
    return { material, decay: clamp(0.161 * volume / (surface * 0.18), 0.35, 4.8), delay: clamp(4 * volume / surface / 343, 0.012, 0.24), wet: clamp(volume / 2500, 0.12, 0.65) };
  }

  room(profile) {
    const c = this.ctx, t = c.currentTime, decay = [0.4, 0.8, 1.4, 2.4, 4.8].reduce((a, b) => (Math.abs(b - profile.decay) < Math.abs(a - profile.decay) ? b : a));
    this.early.delayTime.setTargetAtTime(profile.delay, t, 0.15); this.earlyGain.gain.setTargetAtTime(profile.wet * 0.4, t, 0.1);
    if (this.decay === decay) { this.reverbs[this.reverbIndex].gain.gain.setTargetAtTime(profile.wet, t, 0.15); return; }
    this.decay = decay;
    if (!this.impulses.has(decay)) {
      const len = Math.ceil(c.sampleRate * decay), buf = c.createBuffer(2, len, c.sampleRate), rng = Rng.fromString(this.plan.seed + '-echo-' + decay);
      for (let ch = 0; ch < 2; ch++) { const d = buf.getChannelData(ch); for (let i = 0; i < len; i++) { const tt = i / c.sampleRate; d[i] = (rng.next() * 2 - 1) * Math.exp(-6.91 * tt / decay) * Math.min(1, tt / 0.018); } }
      this.impulses.set(decay, buf);
    }
    this.reverbs[this.reverbIndex].gain.gain.setTargetAtTime(0, t, 0.15); this.reverbIndex = 1 - this.reverbIndex;
    const next = this.reverbs[this.reverbIndex]; next.conv.buffer = this.impulses.get(decay); next.gain.gain.setTargetAtTime(profile.wet, t, 0.15);
  }

  event(kind, profile, pan = 0) {
    if (!this.ctx || this.events.size >= 8) return;
    const c = this.ctx, t = c.currentTime, metal = profile.material === 'metal', dur = kind === 'strain' ? 1.4 : kind === 'drip' ? 0.25 : kind === 'chime' ? 0.9 : 0.18;
    const tonal = kind !== 'step', src = tonal ? c.createOscillator() : c.createBufferSource(), filter = c.createBiquadFilter(), gain = c.createGain(), stereo = c.createStereoPanner();
    if (tonal) { src.type = 'sine'; const [f0, f1] = kind === 'drip' ? [1300, 440] : kind === 'chime' ? [660, 990] : [92, 68]; src.frequency.setValueAtTime(f0, t); src.frequency.exponentialRampToValueAtTime(f1, t + dur); }
    else { src.buffer = this.footNoise; src.playbackRate.value = 0.8 + this.rng.next() * 0.4; }
    filter.type = 'bandpass'; filter.frequency.value = kind === 'step' ? (metal ? 1450 : profile.material === 'soil' ? 360 : 750) : kind === 'strain' ? 170 : 1700; filter.Q.value = metal ? 2.2 : 0.7;
    const vol = kind === 'step' ? 0.27 : kind === 'drip' ? 0.045 : kind === 'chime' ? 0.06 : 0.075;
    gain.gain.setValueAtTime(0.00001, t); gain.gain.linearRampToValueAtTime(vol, t + 0.009); gain.gain.exponentialRampToValueAtTime(0.00001, t + dur); stereo.pan.value = pan;
    src.connect(filter).connect(gain).connect(stereo).connect(this.effects);
    const rec = { src, nodes: [src, filter, gain, stereo] }; this.events.add(rec);
    src.onended = () => { for (const n of rec.nodes) n.disconnect(); this.events.delete(rec); };
    src.start(t); src.stop(t + dur + 0.04);
  }

  // state: { pos, yaw, grounded, zeroG, time }
  update(state, active) {
    const step = this.footsteps.update({ ...state, moving: false }, active && this.enabled);
    if (!this.ctx) return;
    const audible = active && this.enabled && !globalThis.document?.hidden, t = this.ctx.currentTime;
    this.master.gain.setTargetAtTime(audible ? 1 : 0, t, 0.15);
    if (!audible) return;
    const profile = this.acoustics(state.pos); this.room(profile);
    const p = state.pos, near = (pts, k) => pts.reduce((m, q) => Math.max(m, 1 / (1 + Math.hypot(q[0] - p[0], (q[1] - p[1]) * 0.5, q[2] - p[2]) / k)), 0);
    const gen = near(this.generators, 40), wat = near(this.water, 25);
    let pan = 0;
    if (this.generators.length) { const g = this.generators[0], dx = g[0] - p[0], dz = g[2] - p[2]; pan = clamp((dx * Math.cos(state.yaw) - dz * Math.sin(state.yaw)) / Math.max(5, Math.hypot(dx, dz)), -1, 1); }
    const lv = { rumble: 0.13, air: 0.085, generator: gen * 0.11, water: wat * 0.12, hiss: 0, sing: 0, whine: 0 };
    // (the glitches' sounds: each kind's loudest, by how loud it is now and how near)
    for (const g of state.glitchSounds || []) if (g.level > 0) lv[g.kind] = Math.max(lv[g.kind], g.level * near([g.pos], 6) * (g.kind === 'hiss' ? 0.16 : g.kind === 'sing' ? 0.07 : 0.025));
    for (const [k, v] of Object.entries(this.layers)) v.gain.gain.setTargetAtTime(lv[k], t, 0.22);
    this.layers.generator.pan.pan.setTargetAtTime(pan, t, 0.2);
    if (step) this.event('step', profile, (++this.steps % 2 ? 1 : -1) * 0.07);
    if (state.time > this.nextEvent) { this.nextEvent = state.time + this.rng.range(6, 14); this.event(this.water.length && this.rng.chance(0.6) ? 'drip' : 'strain', profile, this.rng.range(-0.85, 0.85)); }
  }
}
