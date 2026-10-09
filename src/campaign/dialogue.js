// Spoken lines: a subtitle under the view, the speaker's name and what they say, with their voice
// when it's been recorded (assets/voice/<id>.m4a, campaign/lines.js). A line without a recording
// stays up as long as it takes to read. Lines queue; a new one waits for the last to finish.
// Nothing here is saved: who said what when is presentation, not campaign state.
const VOICE_DIR = 'assets/voice/';
const missing = new Set();   // (recordings known not to exist, not fetched again)

export class Dialogue {
  constructor(doc = document) {
    this.el = doc.createElement('div');
    this.el.className = 'dialogueLine';
    this.el.setAttribute('role', 'status');
    this.el.setAttribute('aria-live', 'polite');
    this.who = doc.createElement('strong');
    this.what = doc.createElement('span');
    this.el.append(this.who, this.what);
    this.el.hidden = true;
    doc.body.append(this.el);
    this.queue = [];
    this.current = null;
    this.left = 0;
    this.volume = 1;
  }
  // line: {id, speaker, text}
  say(line) {
    if (this.current && this.current.id === line.id) return;
    if (this.queue.some(q => q.id === line.id)) return;
    this.queue.push(line);
    if (!this.current) this.next();
  }
  next() {
    const line = this.queue.shift();
    this.current = line || null;
    if (this.audio) { this.audio.pause(); this.audio = null; }
    if (!line) { this.el.hidden = true; return; }
    this.who.textContent = line.speaker;
    this.who.hidden = !line.speaker;
    this.what.textContent = line.text;
    // (no speaker: your own thoughts, set apart)
    this.el.classList.toggle('narration', !line.speaker);
    this.el.hidden = false;
    // (as long as it takes to read, and a moment after; the recording's own length when it plays)
    const words = line.text.split(/\s+/).length;
    this.left = Math.max(2.5, words * 0.38) + 1.2;
    if (!missing.has(line.id)) {
      const audio = new Audio(VOICE_DIR + line.id + '.m4a');
      audio.volume = this.volume;
      audio.addEventListener('loadedmetadata', () => { if (this.audio === audio && Number.isFinite(audio.duration)) this.left = audio.duration + 1.0; });
      audio.addEventListener('error', () => { missing.add(line.id); });
      // (over the radio: through a radio's narrow band, a little driven, a squelch and a breath of
      // static either side)
      if (line.radio) this.radio(audio);
      audio.play().catch(() => {});
      this.audio = audio;
    }
  }
  radio(audio) {
    try {
      const ctx = this.ctx || (this.ctx = new AudioContext());
      if (ctx.state === 'suspended') ctx.resume();
      const src = ctx.createMediaElementSource(audio);
      const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 350; hp.Q.value = 0.9;
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 3400; lp.Q.value = 0.9;
      const mid = ctx.createBiquadFilter(); mid.type = 'peaking'; mid.frequency.value = 1700; mid.gain.value = 5; mid.Q.value = 1.2;
      const drive = ctx.createWaveShaper(); drive.curve = this.curve || (this.curve = softClip(2.4)); drive.oversample = '2x';
      const out = ctx.createGain(); out.gain.value = 0.9 * this.volume;
      src.connect(hp).connect(lp).connect(mid).connect(drive).connect(out).connect(ctx.destination);
      const burst = (when, length, level) => {
        const n = Math.floor(ctx.sampleRate * length), buf = ctx.createBuffer(1, n, ctx.sampleRate), d = buf.getChannelData(0);
        for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * level * (1 - i / n);
        const b = ctx.createBufferSource(); b.buffer = buf;
        const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 2200; bp.Q.value = 0.7;
        b.connect(bp).connect(out); b.start(when);
      };
      audio.addEventListener('play', () => burst(ctx.currentTime, 0.12, 0.35), { once: true });
      audio.addEventListener('ended', () => burst(ctx.currentTime, 0.18, 0.3), { once: true });
    } catch { /* (no audio graph: the plain recording) */ }
  }
  update(dt) {
    if (!this.current) return;
    this.left -= dt;
    if (this.left <= 0) this.next();
  }
  clear() { this.queue.length = 0; this.next(); }
  get idle() { return !this.current && !this.queue.length; }
  set hidden(h) { this.el.style.visibility = h ? 'hidden' : ''; }
  dispose() { this.clear(); this.el.remove(); }
}

// a soft clipper's curve: drive > 1 squashes the peaks, a radio's slight crunch
function softClip(drive) {
  const n = 1024, c = new Float32Array(n);
  for (let i = 0; i < n; i++) { const x = i / (n - 1) * 2 - 1; c[i] = Math.tanh(drive * x) / Math.tanh(drive); }
  return c;
}
