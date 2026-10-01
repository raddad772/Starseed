// Menus from a controller. Whatever menu is open (briefing, pause, help,
// test scenes, ship lost) is plain HTML; this walks it like a console UI:
// the D-pad or left stick moves a highlight to the nearest control in that
// direction, A presses it, B presses the menu's back button (marked
// data-pad-back), LB / RB switch the top tabs and LT / RT the sub-tabs, and
// left / right adjust sliders and lists. The first control marked
// data-pad-default (else the primary button) is highlighted when a menu opens.

const FOCUSABLE = 'button, select, summary, input[type=range], input[type=checkbox]';
const REPEAT_FIRST = 0.38, REPEAT_NEXT = 0.12; // s: held direction auto-repeat

export class PadMenu {
  constructor() {
    this.cur = null;       // highlighted control
    this.dir = null;       // direction held: 'up' | 'down' | 'left' | 'right'
    this.hold = 0;         // time to the next repeat
  }

  controls(root) {
    return [...root.querySelectorAll(FOCUSABLE)].filter((el) => !el.disabled && el.getClientRects().length);
  }

  // drive the menu under root with this frame's pad; showHighlight: the pad is in use
  update(root, ps, dt, showHighlight) {
    const list = this.controls(root);
    if (!list.length) { this.setCur(null); return; }
    if (!this.cur || !root.contains(this.cur) || !list.includes(this.cur)) {
      this.setCur(root.querySelector('[data-pad-default]') || root.querySelector('button.primary') || list[0], showHighlight);
    } else if (showHighlight) this.cur.classList.add('padfocus');
    // held direction from the D-pad or the left stick, with auto-repeat
    let d = null;
    if (ps.held.has('UP') || ps.ly < -0.6) d = 'up';
    else if (ps.held.has('DOWN') || ps.ly > 0.6) d = 'down';
    else if (ps.held.has('LEFT') || ps.lx < -0.6) d = 'left';
    else if (ps.held.has('RIGHT') || ps.lx > 0.6) d = 'right';
    let step = null;
    if (d !== this.dir) { this.dir = d; this.hold = REPEAT_FIRST; step = d; }
    else if (d) { this.hold -= dt; if (this.hold <= 0) { this.hold = REPEAT_NEXT; step = d; } }
    if (step) {
      const el = this.cur;
      const sideways = step === 'left' || step === 'right';
      if (sideways && el && this.adjust(el, step === 'right' ? 1 : -1)) { /* slider / list moved */ }
      else this.move(list, step);
    }
    if (ps.hits.has('A') && this.cur) this.press(this.cur);
    if (ps.hits.has('B')) { const back = root.querySelector('[data-pad-back]'); if (back) back.click(); }
    if (ps.hits.has('LB') || ps.hits.has('RB')) this.cycleTab(root, '.tabs:not(.sub)', ps.hits.has('RB') ? 1 : -1);
    if (ps.hits.has('LT') || ps.hits.has('RT')) this.cycleTab(root, '.tabs.sub', ps.hits.has('RT') ? 1 : -1);
  }

  setCur(el, show = true) {
    if (this.cur && this.cur !== el) this.cur.classList.remove('padfocus');
    this.cur = el;
    if (!el) return;
    if (show) el.classList.add('padfocus');
    try { el.focus({ preventScroll: true }); } catch (e) { /* not focusable */ }
    el.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }

  // nearest control in a direction: along the axis, with sideways distance
  // costing more, so a column of buttons is walked in order
  move(list, dir) {
    if (!this.cur) { this.setCur(list[0]); return; }
    const a = this.cur.getBoundingClientRect();
    const ax = a.left + a.width / 2, ay = a.top + a.height / 2;
    let best = null, bestCost = Infinity;
    for (const el of list) {
      if (el === this.cur) continue;
      const b = el.getBoundingClientRect();
      const bx = b.left + b.width / 2, by = b.top + b.height / 2;
      let along, across;
      if (dir === 'up') { along = a.top - b.bottom; across = Math.abs(bx - ax); }
      else if (dir === 'down') { along = b.top - a.bottom; across = Math.abs(bx - ax); }
      else if (dir === 'left') { along = a.left - b.right; across = Math.abs(by - ay); }
      else { along = b.left - a.right; across = Math.abs(by - ay); }
      if (along < -4) continue; // behind us
      const cost = Math.max(0, along) + across * 2.5;
      if (cost < bestCost) { bestCost = cost; best = el; }
    }
    if (best) this.setCur(best);
  }

  // left / right on a slider or list changes its value; true if it did
  adjust(el, sgn) {
    if (el.tagName === 'INPUT' && el.type === 'range') {
      const min = +el.min || 0, max = +el.max || 100, stepV = +el.step || 1;
      const v = Math.min(max, Math.max(min, +el.value + sgn * Math.max(stepV, (max - min) / 40)));
      el.value = String(v);
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    }
    if (el.tagName === 'SELECT') {
      const i = Math.min(el.options.length - 1, Math.max(0, el.selectedIndex + sgn));
      if (i !== el.selectedIndex) { el.selectedIndex = i; el.dispatchEvent(new Event('change', { bubbles: true })); }
      return true;
    }
    return false;
  }

  press(el) {
    if (el.tagName === 'SELECT') { this.adjust(el, 1); return; }
    if (el.tagName === 'INPUT' && el.type === 'range') return;
    el.click();
  }

  cycleTab(root, sel, sgn) {
    const bar = root.querySelector(sel);
    if (!bar) return;
    const tabs = [...bar.querySelectorAll('button')];
    const i = tabs.findIndex((t) => t.classList.contains('on'));
    const next = tabs[(i + sgn + tabs.length) % tabs.length];
    if (next) next.click();
  }
}
