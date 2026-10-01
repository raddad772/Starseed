// Start screen: seed entry, where to begin, star summary, system schematic
// and planet table.

// Where a new game can begin, best first: orbits of the home world, the most
// striking giant (ringed if any) and a big moon with its giant in the sky,
// then the carrier's hangar and the landing site.
export function startOptions(sys) {
  const byId = (id) => sys.bodies.find((b) => b.id === id);
  const home = byId(sys.startBodyId);
  const opts = [{ key: `orbit:${home.id}`, title: `Orbit of ${home.name}`, sub: `${home.label}, floating beside your ship` }];
  const giants = sys.bodies.filter((b) => b.kind === 'planet' && !b.solid)
    .sort((a, b) => (b.rings ? 1 : 0) - (a.rings ? 1 : 0) || b.R - a.R);
  if (giants[0]) opts.push({ key: `orbit:${giants[0].id}`, title: `Orbit of ${giants[0].name}`, sub: `${giants[0].label}${giants[0].rings ? ' with rings' : ''}` });
  // the moon that sees its giant largest in the sky
  const skySize = (m) => byId(m.parentId).R / m.orbit.a;
  const moons = sys.bodies.filter((b) => b.kind === 'moon' && b.R > 60000 && giants.some((g) => g.id === b.parentId)).sort((a, b) => skySize(b) - skySize(a));
  if (moons[0]) opts.push({ key: `orbit:${moons[0].id}`, title: `Orbit of ${moons[0].name}`, sub: `${moons[0].label}, ${byId(moons[0].parentId).name} in the sky` });
  opts.push({ key: 'carrier', title: 'Aboard Bastion', sub: 'The carrier\'s hangar, beside your docked ship' });
  opts.push({ key: 'surface', title: `On ${home.name}`, sub: 'The landing site, beside your ship' });
  return opts;
}

export function renderBriefing(sys, el) {
  const s = sys.star;
  el.starLine.textContent = `${s.name} · ${s.catalog} · ${s.spectral} · ${s.mass.toFixed(2)} M☉ · ${s.luminosity.toFixed(2)} L☉ · ${Math.round(s.teff)} K · ${s.age.toFixed(1)} Gyr · [Fe/H] ${s.metallicity >= 0 ? '+' : ''}${s.metallicity.toFixed(2)}`;
  drawSchematic(sys, el.schematic);
  const rows = ['<tr><th>World</th><th>Type</th><th class="num">a</th><th class="num">T</th><th class="num">g</th></tr>'];
  for (const b of sys.bodies) {
    if (b.kind === 'star') continue;
    const a = b.kind === 'moon' ? `${Math.round(b.orbit.a / 1000).toLocaleString()} km` : `${b.aAU.toFixed(2)} AU`;
    const cls = [b.kind === 'moon' ? 'moon' : '', b.id === sys.startBodyId ? 'start' : ''].join(' ');
    const name = `${b.name}${b.id === sys.startBodyId ? ' ◂ landing' : ''}`;
    rows.push(`<tr class="${cls}"><td>${name}</td><td>${b.label}${b.rings ? ', ringed' : ''}</td><td class="num">${a}</td><td class="num">${Math.round(b.Tsurf)} K</td><td class="num">${(b.gravity / 9.81).toFixed(2)}</td></tr>`);
  }
  el.table.innerHTML = rows.join('');
}

export function drawSchematic(sys, canvas) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const W = canvas.clientWidth || 480, H = canvas.clientHeight || 132;
  canvas.width = W * dpr; canvas.height = H * dpr;
  const g = canvas.getContext('2d');
  g.scale(dpr, dpr);
  g.clearRect(0, 0, W, H);
  const planets = sys.bodies.filter((b) => b.kind === 'planet');
  const minA = Math.min(0.02, ...planets.map((p) => p.aAU)) * 0.8;
  const maxA = Math.max(5, ...planets.map((p) => p.aAU)) * 1.3;
  const x = (a) => 14 + (Math.log(a) - Math.log(minA)) / (Math.log(maxA) - Math.log(minA)) * (W - 28);
  const css = getComputedStyle(document.documentElement);
  const col = (v) => css.getPropertyValue(v).trim() || '#fff';
  const midY = 58;
  // habitable zone (conservative, plus optimistic margins)
  g.fillStyle = 'rgba(106, 222, 143, 0.10)';
  g.fillRect(x(sys.hz.optimisticInner), 8, x(sys.hz.optimisticOuter) - x(sys.hz.optimisticInner), 100);
  g.fillStyle = 'rgba(106, 222, 143, 0.22)';
  g.fillRect(x(sys.hz.inner), 8, x(sys.hz.outer) - x(sys.hz.inner), 100);
  // snow line
  g.strokeStyle = col('--target');
  g.setLineDash([3, 4]);
  g.beginPath(); g.moveTo(x(sys.disk.snowLine), 8); g.lineTo(x(sys.disk.snowLine), 108); g.stroke();
  g.setLineDash([]);
  // axis
  g.strokeStyle = 'rgba(230,239,243,0.25)';
  g.beginPath(); g.moveTo(10, midY); g.lineTo(W - 10, midY); g.stroke();
  g.font = '10px "B612 Mono", monospace';
  g.fillStyle = col('--ink-dim');
  for (const a of [0.01, 0.1, 1, 10, 100]) {
    if (a < minA || a > maxA) continue;
    g.fillRect(x(a), midY - 3, 1, 6);
    g.fillText(`${a} AU`, x(a) + 3, 120);
  }
  g.fillStyle = col('--engaged');
  g.fillText('HZ', x(Math.sqrt(sys.hz.inner * sys.hz.outer)) - 6, 20);
  g.fillStyle = col('--target');
  g.fillText('snow line', x(sys.disk.snowLine) + 4, 20);
  // star glow
  const sc = sys.star.color;
  g.fillStyle = `rgb(${Math.min(255, sc[0] * 230)}, ${Math.min(255, sc[1] * 230)}, ${Math.min(255, sc[2] * 230)})`;
  g.beginPath(); g.arc(4, midY, 9, 0, Math.PI * 2); g.fill();
  // planets sized by radius (sqrt-compressed)
  for (const p of planets) {
    const r = Math.max(2, Math.min(13, Math.sqrt(p.radiusEarth) * 3.2));
    const c = planetSwatch(p);
    g.fillStyle = c;
    g.beginPath(); g.arc(x(p.aAU), midY, r, 0, Math.PI * 2); g.fill();
    if (p.rings) { g.strokeStyle = c; g.beginPath(); g.ellipse(x(p.aAU), midY, r * 1.9, r * 0.45, -0.3, 0, Math.PI * 2); g.stroke(); }
    if (p.id === sys.startBodyId) { g.strokeStyle = col('--engaged'); g.lineWidth = 1.5; g.beginPath(); g.arc(x(p.aAU), midY, r + 4, 0, Math.PI * 2); g.stroke(); g.lineWidth = 1; }
    // moons as ticks below
    p.moons.forEach((mid, k) => { g.fillStyle = col('--ink-dim'); g.fillRect(x(p.aAU) - 1, midY + r + 5 + k * 4, 2, 2); });
  }
}

export function planetSwatch(b) {
  const lin = (c) => Math.round(255 * Math.min(1, Math.sqrt(Math.max(0, c)) * 1.15));
  let c;
  if (b.giant) c = b.giant.palette[0];
  else if (b.terrain) {
    const p = b.terrain.palette;
    const o = b.terrain.ocean || 0;
    const land = p.veg && b.life ? p.veg.map((v, i) => v * 0.6 + p.regolith[i] * 0.4) : p.regolith;
    c = land.map((v, i) => v * (1 - o) + p.waterShallow[i] * o * 0.8);
    if (b.atmosphere && b.atmosphere.type === 'venus') c = [0.85, 0.75, 0.45];
    if (b.terrain.icy) c = p.snow;
  } else c = [0.5, 0.5, 0.5];
  return `rgb(${lin(c[0])}, ${lin(c[1])}, ${lin(c[2])})`;
}
