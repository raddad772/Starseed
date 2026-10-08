// One fixed controller layout (the browser's "standard" gamepad mapping, with
// Xbox names). Every button stands in for a keyboard key, so anything the
// keyboard does the pad does too; the sticks and triggers are analog. The
// help screen draws its controller diagram from this same table, so the
// picture can never disagree with what the buttons do.
//
// LB is a shift: held, it turns the left stick into strafe and up/down (roll
// and up/down on a spacewalk); tapped, it picks the next target (aboard a big
// ship, the next walking route). Start pauses. D-pad left opens the quick
// menu (ui/quickMenu.js) for the rarer actions, time warp among them.

export const BTN = { A: 0, B: 1, X: 2, Y: 3, LB: 4, RB: 5, LT: 6, RT: 7, VIEW: 8, START: 9, L3: 10, R3: 11, UP: 12, DOWN: 13, LEFT: 14, RIGHT: 15 };

export const PAD_LAYOUT = {
  flight: {
    title: 'Flight',
    sticks: { left: 'Thrust · roll', leftLB: 'Strafe · up / down', right: 'Pitch · yaw' },
    lb: 'Hold: shift left stick · tap: next target',
    buttons: {
      A: ['KeyG', 'Landing gear'], B: ['KeyR', 'Ramp'], X: ['KeyF', 'Stand up'], Y: ['KeyZ', 'Flight assist'],
      RB: ['KeyT', 'Target under reticle'], RT: ['ShiftLeft', 'Boost'], LT: ['KeyX', 'Brake'],
      L3: ['KeyV', 'Camera view'], R3: ['KeyH', 'This layout'],
      UP: ['KeyJ', 'FTL drive'], DOWN: ['KeyL', 'Landing lights'], LEFT: ['Backquote', 'Quick menu'], RIGHT: ['KeyN', 'Nav computer'],
      VIEW: ['KeyM', 'System map'],
    },
  },
  foot: {
    title: 'On foot',
    sticks: { left: 'Walk', leftLB: 'Walk', right: 'Look' },
    lb: 'Tap: next target · aboard: next route',
    buttons: {
      A: ['Space', 'Jump · hold: jetpack'], B: ['KeyB', 'Summon ship'], X: ['KeyF', 'Use: seats, lifts, ramps'], Y: ['KeyP', 'Back to pilot seat'],
      RB: ['KeyT', 'Target under reticle'], RT: ['ShiftLeft', 'Run'], LT: ['KeyL', 'Hand light'],
      L3: ['ShiftLeft', 'Run'], R3: ['KeyH', 'This layout'],
      UP: ['Tab', 'Route aboard · next target'], DOWN: ['KeyK', 'Settlement survey'], LEFT: ['Backquote', 'Quick menu'], RIGHT: ['KeyN', 'Nav computer'],
      VIEW: ['KeyM', 'System map'],
    },
  },
  eva: {
    title: 'Spacewalk',
    sticks: { left: 'Move', leftLB: 'Roll · up / down', right: 'Look' },
    lb: 'Hold: shift left stick · tap: next target',
    buttons: {
      A: ['Space', 'Up'], B: ['KeyC', 'Down'], X: ['KeyF', 'Use: ramps'], Y: ['KeyP', 'Back to pilot seat'],
      RB: ['KeyT', 'Target under reticle'], RT: ['ShiftLeft', 'Boost'], LT: ['KeyX', 'Stabilise to nearest ship'],
      L3: null, R3: ['KeyH', 'This layout'],
      UP: null, DOWN: null, LEFT: ['Backquote', 'Quick menu'], RIGHT: null,
      VIEW: ['KeyM', 'System map'],
    },
  },
};

// The left stick per mode, as (keyboard axis -> stick component, sign).
// Keys name the keyboard pair the game reads with input.axis(neg, pos).
export function leftStickAxes(mode, lb) {
  if (mode === 'flight') return lb
    ? { 'KeyA|KeyD': ['x', 1], 'KeyC|Space': ['y', -1] }
    : { 'KeyS|KeyW': ['y', -1], 'KeyE|KeyQ': ['x', -1] };
  if (mode === 'eva') return lb
    ? { 'KeyE|KeyQ': ['x', -1], 'KeyC|Space': ['y', -1] }
    : { 'KeyS|KeyW': ['y', -1], 'KeyA|KeyD': ['x', 1] };
  return { 'KeyS|KeyW': ['y', -1], 'KeyA|KeyD': ['x', 1] };
}

// The pad button that stands in for a key in a mode (null if none does);
// Tab is also LB's tap
export function padButtonFor(code, mode) {
  const L = PAD_LAYOUT[mode];
  if (L) for (const [name, m] of Object.entries(L.buttons)) if (m && m[0] === code) return name;
  if (code === 'Tab') return 'LB';
  return null;
}

const GLYPH_TEXT = { UP: 'D-pad ↑', DOWN: 'D-pad ↓', LEFT: 'D-pad ←', RIGHT: 'D-pad →', VIEW: 'View', START: 'Menu' };
export const padButtonText = (name) => GLYPH_TEXT[name] || name;

// a button as an inline glyph: face buttons as coloured rounds, the rest as text
export function padGlyph(name) {
  const face = { A: 'a', B: 'b', X: 'x', Y: 'y' }[name];
  return `<kbd class="pb${face ? ' pb-' + face : ''}">${padButtonText(name)}</kbd>`;
}

// ------------------------------------------------------------------ diagram

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

// at most two lines of about `max` characters, broken at a " · " or a space
function wrap(text, max = 30) {
  if (text.length <= max) return [text];
  const mid = text.length / 2;
  let best = -1;
  for (const sep of [' · ', ' ']) {
    for (let i = text.indexOf(sep); i >= 0; i = text.indexOf(sep, i + 1)) if (best < 0 || Math.abs(i - mid) < Math.abs(best - mid)) best = i;
    if (best >= 0) return [text.slice(0, best), text.slice(best + sep.length)];
  }
  return [text];
}

// SVG of the pad with every control labelled for one mode
export function padDiagram(mode) {
  const L = PAD_LAYOUT[mode];
  const b = (k) => (L.buttons[k] ? L.buttons[k][1] : '—');
  const ink = 'var(--ink)', dim = 'var(--ink-dim)', hair = 'var(--hair)', acc = 'var(--target)';
  const line = 'stroke="var(--ink)" stroke-opacity="0.55" stroke-width="1.5"';
  const fillA = 'fill="rgba(230,239,243,0.06)"';
  // a label at (x, y), joined to the control at (cx, cy) by an elbow leader
  const callout = (x, y, cx, cy, head, text, anchor) => {
    const ex = anchor === 'end' ? x + 10 : x - 10;
    const lines = Array.isArray(text) ? text : wrap(text);
    return `<path d="M${cx} ${cy} L${(cx + ex) / 2} ${y} L${ex} ${y}" fill="none" stroke="${hair}" stroke-width="1.3"/>
      <circle cx="${cx}" cy="${cy}" r="3" fill="${acc}"/>
      <text x="${x}" y="${y - 8}" text-anchor="${anchor}" fill="${dim}" font-size="12" letter-spacing="0.14em">${esc(head.toUpperCase())}</text>
      ${lines.map((t, i) => `<text x="${x}" y="${y + 11 + i * 18}" text-anchor="${anchor}" fill="${ink}" font-size="15">${esc(t)}</text>`).join('')}`;
  };
  const face = (cx, cy, letter, col) => `<circle cx="${cx}" cy="${cy}" r="14" ${fillA} stroke="${col}" stroke-width="1.8"/>
    <text x="${cx}" y="${cy + 5}" text-anchor="middle" fill="${col}" font-size="14" font-weight="700">${letter}</text>`;
  const stick = (cx, cy) => `<circle cx="${cx}" cy="${cy}" r="29" fill="rgba(0,0,0,0.25)" stroke="${hair}" stroke-width="1.5"/>
    <circle cx="${cx}" cy="${cy}" r="19" ${fillA} ${line}/>`;
  const dpad = (cx, cy) => `<path d="M${cx - 9} ${cy - 27} h18 v18 h18 v18 h-18 v18 h-18 v-18 h-18 v-18 h18 z" ${fillA} ${line}/>`;
  const leftStick = L.sticks.left === L.sticks.leftLB ? [L.sticks.left] : [L.sticks.left, `LB held: ${L.sticks.leftLB}`];
  const dl = [];
  for (const [k, arrow] of [['UP', '↑'], ['DOWN', '↓'], ['LEFT', '←'], ['RIGHT', '→']]) if (L.buttons[k]) dl.push(`${arrow} ${L.buttons[k][1]}`);
  const dlines = [dl.slice(0, 2).join(' · '), dl.slice(2).join(' · ')].filter(Boolean);
  return `<svg class="pad" viewBox="0 0 1100 540" role="img" aria-label="Controller layout: ${esc(L.title)}" font-family="var(--font-ui)">
    <path d="M412 196 C470 182 630 182 688 196 C750 208 788 262 804 338 C822 420 790 466 748 450 C718 438 690 392 662 376 C610 360 490 360 438 376 C410 392 382 438 352 450 C310 466 278 420 296 338 C312 262 350 208 412 196 Z" fill="rgba(230,239,243,0.05)" ${line}/>
    <path d="M376 186 C396 168 442 160 486 164 L482 182 C448 180 414 186 390 198 Z" ${fillA} ${line}/>
    <path d="M724 186 C704 168 658 160 614 164 L618 182 C652 180 686 186 710 198 Z" ${fillA} ${line}/>
    <rect x="394" y="122" width="62" height="34" rx="9" ${fillA} ${line}/>
    <rect x="644" y="122" width="62" height="34" rx="9" ${fillA} ${line}/>
    <text x="425" y="144" text-anchor="middle" fill="${dim}" font-size="12">LT</text>
    <text x="675" y="144" text-anchor="middle" fill="${dim}" font-size="12">RT</text>
    <text x="436" y="181" text-anchor="middle" fill="${dim}" font-size="11">LB</text>
    <text x="664" y="181" text-anchor="middle" fill="${dim}" font-size="11">RB</text>
    ${stick(430, 262)}${dpad(488, 330)}${stick(612, 330)}
    ${face(676, 230, 'Y', '#f1c33a')}${face(646, 262, 'X', '#5aa8ff')}${face(706, 262, 'B', '#ff6a5a')}${face(676, 294, 'A', '#6ade8f')}
    <rect x="506" y="254" width="20" height="13" rx="5" fill="none" ${line}/>
    <rect x="574" y="254" width="20" height="13" rx="5" fill="none" ${line}/>
    <circle cx="550" cy="222" r="13" fill="none" ${line}/>
    ${callout(290, 100, 425, 139, 'LT', b('LT'), 'end')}
    ${callout(290, 160, 410, 180, 'LB', L.lb, 'end')}
    ${callout(290, 240, 401, 262, 'Left stick', leftStick, 'end')}
    ${callout(290, 318, 430, 288, 'L3 · press', b('L3'), 'end')}
    ${callout(290, 400, 488, 354, 'D-pad', dlines.length ? dlines : ['—'], 'end')}
    ${callout(810, 100, 675, 139, 'RT', b('RT'), 'start')}
    ${callout(810, 150, 688, 180, 'RB', b('RB'), 'start')}
    ${callout(810, 200, 690, 222, 'Y', b('Y'), 'start')}
    ${callout(810, 250, 652, 250, 'X', b('X'), 'start')}
    ${callout(810, 300, 720, 262, 'B', b('B'), 'start')}
    ${callout(810, 350, 684, 306, 'A', b('A'), 'start')}
    ${callout(810, 400, 641, 334, 'Right stick', L.sticks.right, 'start')}
    ${callout(810, 452, 612, 359, 'R3 · press', b('R3'), 'start')}
    ${callout(470, 500, 516, 268, 'View', b('VIEW'), 'end')}
    ${callout(630, 500, 584, 268, 'Start', 'Pause', 'start')}
  </svg>`;
}
