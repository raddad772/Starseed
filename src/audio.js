// Procedural sound: every voice is synthesised (noise through filters,
// oscillators), driven by the simulation each frame. Starts on first gesture.

export class AudioEngine {
  constructor(game) {
    this.game = game;
    this.ctx = null;
    this.ready = false;
    const start = () => { this.init(); window.removeEventListener('pointerdown', start); window.removeEventListener('keydown', start); };
    window.addEventListener('pointerdown', start);
    window.addEventListener('keydown', start);
    this.lastFoot = 0;
    this.alarmT = 0;
    this.rcsLevel = 0;
    this.muted = false;
  }

  init() {
    if (this.ctx) return;
    try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return; }
    const c = this.ctx;
    this.master = c.createGain(); this.master.gain.value = 0.55;
    this.comp = c.createDynamicsCompressor();
    this.master.connect(this.comp).connect(c.destination);
    // shared noise
    const len = c.sampleRate * 2;
    const buf = c.createBuffer(1, len, c.sampleRate);
    const d = buf.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      b0 = 0.99765 * b0 + w * 0.099; b1 = 0.963 * b1 + w * 0.2965; b2 = 0.57 * b2 + w * 1.0526; // pinkish
      d[i] = (b0 + b1 + b2 + w * 0.1848) * 0.18;
    }
    this.noiseBuf = buf;
    const noise = () => { const s = c.createBufferSource(); s.buffer = buf; s.loop = true; s.start(0, Math.random() * 2); return s; };
    const voice = (type, freq, q) => {
      const src = noise(); const f = c.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q || 0.7;
      const g = c.createGain(); g.gain.value = 0; src.connect(f).connect(g).connect(this.master);
      return { f, g };
    };
    this.main = voice('lowpass', 180, 0.9);
    this.mainHum = c.createOscillator(); this.mainHum.type = 'sawtooth'; this.mainHum.frequency.value = 42;
    this.mainHumF = c.createBiquadFilter(); this.mainHumF.type = 'lowpass'; this.mainHumF.frequency.value = 160;
    this.mainHumG = c.createGain(); this.mainHumG.gain.value = 0;
    this.mainHum.connect(this.mainHumF).connect(this.mainHumG).connect(this.master); this.mainHum.start();
    this.belly = voice('bandpass', 420, 0.6);
    this.wind = voice('bandpass', 600, 0.4);
    this.jet = voice('highpass', 1800, 0.5);
    this.rcs = voice('highpass', 2600, 0.8);
    this.ftl = c.createOscillator(); this.ftl.type = 'sine'; this.ftl.frequency.value = 80;
    this.ftlG = c.createGain(); this.ftlG.gain.value = 0;
    this.ftl.connect(this.ftlG).connect(this.master); this.ftl.start();
    this.ready = true;
  }

  set(g, v, t = 0.08) { if (this.ready) g.gain.setTargetAtTime(v, this.ctx.currentTime, t); }

  update(dt) {
    if (!this.ready) return;
    const g = this.game, s = g.focus, p = g.player;
    if (this.ctx.state === 'suspended' && !g.paused) this.ctx.resume();
    if(p.understructure){
      // The local survey shares this master/context, including pause handling.
      // Exterior flight and surface wind must not leak into the sealed interior.
      for(const voice of [this.main,this.belly,this.wind,this.jet,this.rcs])this.set(voice.g,0);
      this.set(this.mainHumG,0);this.set(this.ftlG,0);this.lastFoot=p.footstep;return;
    }
    const inShip = p.aboard;
    const nearShip = inShip || (g.camPos.distanceTo(s.getWorldPos(this._v || (this._v = s.pos.clone()))) < 400);
    const air = Math.min(1, (inShip ? s.env.pressure : p.env.pressure) * 1.2);
    const carry = inShip ? 1 : (nearShip ? air * 0.6 : 0); // vacuum carries no sound outside
    const L = s.limits;
    // (a ground vehicle has no thrusters: its engine note follows the throttle)
    const mainT = s.type.ground ? Math.abs(s.drive.throttle) * 0.5 : (L.main > 0 ? Math.max(0, -s.thrustLocal.z) / L.main : 0);
    const bellyT = L.belly > 0 ? Math.max(0, s.thrustLocal.y) / L.belly : 0;
    this.set(this.main.g, mainT * 0.9 * carry);
    this.main.f.frequency.setTargetAtTime(120 + mainT * 260, this.ctx.currentTime, 0.1);
    this.set(this.mainHumG, mainT * 0.25 * carry);
    this.set(this.belly.g, bellyT * 0.6 * carry);
    this.belly.f.frequency.setTargetAtTime(300 + bellyT * 500, this.ctx.currentTime, 0.1);
    // wind with dynamic pressure
    const q = inShip ? s.env.dynPressure : 0.5 * (p.env.pressure * 1.2) * 4;
    this.set(this.wind.g, Math.min(0.7, Math.sqrt(q) / 400) * (inShip ? 0.6 : 1));
    this.wind.f.frequency.setTargetAtTime(250 + Math.min(2500, Math.sqrt(q) * 6), this.ctx.currentTime, 0.2);
    this.set(this.jet.g, p.jetOn ? 0.35 * Math.max(0.15, air) : 0, 0.03);
    // rcs puffs when the attitude controller works hard
    const rcsNow = p.mode === 'seat' ? Math.min(1, (Math.abs(s.ctrl.pitch) + Math.abs(s.ctrl.yaw) + Math.abs(s.ctrl.roll)) * 0.6) : 0;
    this.set(this.rcs.g, rcsNow * 0.12, 0.02);
    // ftl drone
    const f = g.ftl;
    const fe = f.state === 'spool' ? (1 - f.timer / f.spoolTime) * 0.2 : (f.state === 'cruise' ? 0.18 : 0);
    this.set(this.ftlG, fe * (inShip ? 1 : 0), 0.3);
    this.ftl.frequency.setTargetAtTime(60 + f.effect * 140 + (f.state === 'spool' ? (1 - f.timer / f.spoolTime) * 80 : 0), this.ctx.currentTime, 0.2);
    // footsteps
    if (p.footstep !== this.lastFoot) { this.lastFoot = p.footstep; if (p.grounded && (p.mode === 'surface' || p.mode === 'ship')) this.tick(p.mode === 'ship' ? 900 : 300, 0.06 * Math.max(0.2, air)); }
    // alarms
    this.alarmT -= dt;
    const danger = inShip && (s.env.pressure > s.hullRating * 0.8 || s.hull < 0.3 || s.hullTemp > 1700 || (s.agl < 400 && s.surfaceVel(this._v2 || (this._v2 = s.pos.clone())).dot(s.pos.clone().normalize()) < -25));
    if (danger && this.alarmT <= 0) { this.alarmT = 0.5; this.beep(880, 0.12, 0.08); }
  }

  tick(freq, vol) {
    if (!this.ready) return;
    const c = this.ctx;
    const s = c.createBufferSource(); s.buffer = this.noiseBuf;
    const f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = freq * (0.8 + Math.random() * 0.4); f.Q.value = 1.2;
    const gn = c.createGain(); gn.gain.value = vol;
    gn.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.12);
    s.connect(f).connect(gn).connect(this.master);
    s.start(0, Math.random()); s.stop(c.currentTime + 0.15);
  }

  beep(freq, dur, vol) {
    if (!this.ready) return;
    const c = this.ctx;
    const o = c.createOscillator(); o.type = 'square'; o.frequency.value = freq;
    const gn = c.createGain(); gn.gain.value = vol;
    gn.gain.setTargetAtTime(0, c.currentTime + dur, 0.02);
    o.connect(gn).connect(this.master); o.start(); o.stop(c.currentTime + dur + 0.1);
  }

  clunk() { this.tick(140, 0.5); setTimeout(() => this.tick(90, 0.4), 120); }

  boom() {
    if (!this.ready) return;
    const c = this.ctx;
    const s = c.createBufferSource(); s.buffer = this.noiseBuf;
    const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 400;
    f.frequency.exponentialRampToValueAtTime(40, c.currentTime + 2.5);
    const gn = c.createGain(); gn.gain.value = 1.4;
    gn.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 3);
    s.connect(f).connect(gn).connect(this.master); s.start(); s.stop(c.currentTime + 3.2);
  }

  dispose() { if (this.ctx) this.ctx.close(); }
}
