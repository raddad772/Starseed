# World simulation plan

The working plan for generating planets by simulation (Dave, 2026-10-01): "it's already good but we
want great". This file is for Claude to act on, in order, across sessions and compactions. Keep it
current: tick items off, note results and decisions, and add what Dave asks for. HANDOFF.md "NOW:
simulated worlds" has the latest state and run commands.

## Ground rules (from Dave, keep to them)

- **Simulation, not noise.** Shapes come from processes: plates, erosion, glaciers, climate, impacts,
  volcanism. Noise is allowed only as initial perturbation or as sub-grid texture driven by the
  simulation's fields.
- **Run once, at generation.** Plates and erosion run during generation only, then freeze. At runtime
  only the season changes (blending precomputed monthly fields by orbital phase). Up to ~10 minutes
  per star system is fine if the result is cached.
- **Variety over Earth clones.** Let worlds differ: thick or thin crust, over-active volcanism, water
  worlds, dry worlds, no tectonics, no life. Use guard rails against runaway, not targets. Random world
  traits are good (volcanic activity tier is one).
- **Deterministic.** Generation must be bit-identical everywhere (multiplayer never sends terrain):
  - transcendental functions go through `src/core/dmath.js`; only + - * / sqrt are native;
  - randomness from `Rng` forks and hashes;
  - stable iteration order.
- **Flat typed arrays in the hot loops.** Dave wants the port in C or C++ (WASM), not Rust; the GPU is
  for render-only detail (its math isn't identical across vendors).
- **Lab first.** Iterate in `tools/worldlab.mjs` and look at the maps. Check across several seeds before
  calling anything done (see Validation). Send Dave contact sheets.
- **Checkpoints.** Commit good checkpoints as milestones land (CLAUDE.md). Commit only our own files,
  since other sessions may share the tree; push only when Dave asks. World-sim checkpoint: c9caba1.
- **Coordination.** Message the "XBox Work on Mac" session before and after browser test sessions (see
  CLAUDE.md). The lab is node-only and needs no browser.

## Where it stands (2026-10-01)

Done, in `src/gen/worldsim/`:
- `grid.js`: the cube-sphere SimGrid.
- `erosion.js`: stream-power erosion, lakes, shelves, creep.
- `tectonics.js`: the plates and everything they do:
  - **Motion:** plates move in their own frames; slab pull sets their speed.
  - **Boundaries:** subduction raises arcs; continental collisions stack crust; collisions that go on
    weld two plates into one; rifts split big plates, and their lines meander.
  - **Crust upkeep:** plateaus spread and dome; extension thins thick continents; a 30-50 km guard
    rail; ghost-crust cleanup.
  - **Volcanism:** activity tiers, hotspots and their swells, pulsed shield chains that sink, arc cones.
  - **Sea level and erosion:** sea level by the ocean-fraction rule; erosion coupled every step.
- `impacts.js`: the real lunar rate, gravity-scaled, filtered by the air; complex craters.

The lab draws before/after maps and a plate time-lapse.

Reference worlds (after realistic stars, 2026-10-01; the old six changed when the stars did):
- **Water + tectonics:**
  - LAB-5 5 Dorith (A8V)
  - LAB-21 4 Moatriia (K7V, life, tidally locked)
  - LAB-30 4 Ishiodreill (G1V, life)
  - LAB-32 3 Sechauvios (K4V)
  - LAB-35 4 Mausyu (G5V)
  - LAB-51 7 Ketheisteks (A2V, life)
- **Mars-type:** LAB-1 1 Phikscan (M6V), LAB-2 4 Clebraish (M3V).
- **Venus-type:** LAB-5 3 Dovrioshion (A8V), LAB-23 4 Traeroakand (B9V).
- **Airless:** LAB-0 1 Moaskeanion (M7V), LAB-1 2 Cheatond (M6V).
- **Icy moons:** LAB-1 13 Abevul, LAB-2 11 Ounkagriall.

The finder script is `scratchpad find2.mjs`; worth turning into `tools/worldlab-find.mjs`.

Nothing is in the game yet; uncommitted.

In progress: `src/gen/worldsim/history.js` (step 1).
- **Done:** the temperate branch: thermostat with land and sea-floor weathering, weathering swings,
  ice-albedo, snowball state, life milestones fitted to the present level, events, series, `at()`.
  Venus, Mars and airless worlds get simple event timelines.
- **Checked:** ends within ~1 K of the generator's present on all six reference worlds; early worlds
  310-330 K.
- **Snowballs:** none occur yet. The thermostat corrects within ~2 Myr, so only big, fast shocks would
  do it; that's acceptable (rare on Earth too).
- **Wired into the lab:** `--history` prints the timeline and writes `<body>-history.png` (T, CO2,
  O2, ice), then exits; the history's activity tier drives Tectonics; its rain series scales
  deep-time erosion (`Erosion.rainK`).
- **Still to do:** feed ice into glaciers (step 5); the other world types' histories (step 2); the
  history of a world with no life but past habitability.
- **Climate in the history (revised 2026-10-01):**
  - CO2 warms at 3.5 K per doubling from today (logarithmic), and scatters light at +0.01 albedo per
    bar, so warming peaks near ~5-8 bar (the maximum greenhouse). CO2 is capped at 10 bar
    (condensation).
  - Young worlds start with 4 bar.
  - CO2 changes by implicit flux, outgassing minus weathering, so hothouses take Myr to draw down.
  - The star brightens by star.js's law, L_zams (1 + 0.73 t/tauMS).
  - Early seas are darker (less land).
  - Snowball in below 255 K global mean, thaw at 245 K with ice albedo (the equator melts).
  - Inside the last 300 Myr a snowball is broken by a flood-basalt CO2 pulse, so the history reaches
    today.
- **Snowball experiment (Dave):** Moadeal moved outward with the same geology (`opts.sScale`):

  | Orbit | Result |
  |---|---|
  | x1.05 | temperate today, frozen 3.7 Gyr early |
  | x1.12 | 271 K with 8.7 bar CO2 |
  | x1.15 | 262 K with CO2 maxed |
  | x1.20 | permanent snowball |

  The six reference worlds: Moadeal, Douglonint and Dorith had long early freezes (dim young stars,
  near the cold edge); Une, Obrais and Xenzhei never froze.
- **Dave's decisions (2026-10-01):**
  - Realistic stars for all seeds: the old systems are disposable ("junk"); interesting worlds are the
    point. Go ahead with step 1b.
  - The photosynthesis pigment is a random property based on the star's output, so foliage colours
    vary a lot between worlds (step 1c).

## Plan, in order

### ARCHITECTURE (Dave, 2026-10-01): one unified model for every rocky body. This comes first.

Dave: "use the history module to create a unified model that will work for all rocky planets... so it
makes a Mars-like one with Mars' tectonic and life history, an Earth-like one with ours... that way we
could randomly place planets and moons and have them come out correct." Agreed; it replaces choosing a
sim per world type.

- **U1. The history becomes an authoritative forward model** for every rocky planet and moon, run at
  system generation (milliseconds per body).
  - **Inputs:**
    - mass, radius, composition (`b.comp`: water and iron) and formation zone;
    - orbit (insolation over time, eccentricity);
    - star (L(t), XUV and activity: `star.xuv`, `star.activeGyr`);
    - host planet (tidal heating for moons: orbit distance, eccentricity, host mass);
    - the system debris level (U4).
  - **State through time:**
    - interior heat (radiogenic decay plus tidal);
    - tectonic regime: mobile lid needs heat, water and enough mass; stagnant lid otherwise or later;
      episodic overturn when hot and dry;
    - dynamo;
    - volatile reservoirs: water (ocean, ice, vapour, mantle), CO2 (air and carbonate), N2;
    - pressure and composition;
    - temperature: thermostat, CO2 forcing, water-vapour feedback and runaway, ice-albedo and snowball;
    - life stages and O2.
  - **Escape:** Jeans and hydrodynamic escape from XUV and escape velocity; ion stripping without a
    field; impact erosion; water loss in a moist or runaway greenhouse.
  - **Output:** the present state written onto the body, replacing `bodies.js`'s present-state rules:
    - atmosphere type, pressure, composition, tau and albedo;
    - Tsurf, hydrosphere, life;
    - terrain params: tectonics, volcanism, erosion, iceCover, liquid.

    Plus the timeline: series and events.
- **Ages (Dave):** worlds should range from young and fiery to super-old and dead. Planets share their
  star's age.
  - `star.js` (done): 8% young systems at 20-400 Myr (log-uniform); the rest from 0.4 Gyr to
    min(12.5, 0.9 tauMS); metallicity falls with age ([Fe/H] ~ 0.12 - 0.035 age), so old systems are
    metal-poor.
  - U1 must use absolute interior heat (vs Earth at 4.5 Gyr), not heat relative to the present.
  - **Young worlds:** a magma ocean in the first ~1-100 Myr (longer under thick steam), a thin hot
    crust, lava seas, heavy bombardment with melt sheets, over-active volcanism, a flaring star.
  - **Old worlds:** cold interiors (plates stopped, dynamo dead), air lost if small; around ageing
    Sun-like stars, once-habitable worlds cooked by the brightening (the Venus path late).
- **U1 status (2026-10-01): DONE, first version, live in the generator.** `src/gen/worldsim/evolve.js`
  `evolveWorld(ctx)`, called from `bodies.js` buildBody for every terrestrial or dwarf body; the result
  is on `b.history`.
  - **Present state:** `atmosphereNow()` maps the end state to the renderer's types (venus / mars /
    coldco2 / temperate; titan kept as the generator's special class), with tau set so
    Teq (1 + 0.75 tau)^0.25 = the history's T. The hydrosphere comes from the history's oceans
    (frozen under 255 K or in a snowball); life level from the history; terrain tectonics from its
    regime; volcanism from its heat now. Io-like volcanic moons and lava worlds keep their rules; worlds
    under 50 Myr have lava seas (magma oceans).
  - **Physics:**
    - absolute radiogenic heat, aged faster on small worlds, plus tidal heat;
    - plates need heat, water and size;
    - dynamo lifetime ~ M^1.5 (shorter under a stagnant lid);
    - volatiles scale with pressure as M^0.9;
    - escape: 1.6 e-folds/Gyr x S x XUV / Scrit (bodies.js's cosmic shoreline), x2.5 with no
      field; air frozen out where Teq_bare < 125 K unless Titan-like;
    - CO2 capped by its vapour pressure at T-25 (polar caps);
    - a per-planet runaway limit between runaway and recent-Venus (drier worlds hold out longer);
    - weathering runs while the tropics are open (T > 255), scaled by the open fraction;
    - life rate lognormal(2.5/Gyr), with 25% of worlds never getting life;
    - the old `buildAtmosphere` is no longer called (delete it once U2 is settled).
  - **Census (400 systems):** 32 ms per system (was 0.25 ms); 57% of solid bodies airless; life on
    ~10% of systems' worlds; extinct life exists; young lava worlds exist. The HZ (0.3-5 M_earth)
    comes out ~2/3 temperate (some cold with open tropics), ~15% runaway near the inner edge, ~15%
    snowball near the outer.
  - **Labels:** frozen worlds far out are "Frozen world/moon"; "Snowball world" only when Teq > 200 K.
  - **Reference worlds (refreshed):**
    - Water + tectonics: LAB-4 2 Heludriom (K7V, life, locked), LAB-5 5 Dorith, LAB-9 1 Bagetial
      (M5V ocean world, locked), LAB-23 7 Shagokau (B9V), LAB-30 4 Ishiodreill (G1V, life, 1 Gyr),
      LAB-36 1 Moukspi (M3V, locked).
    - Mars-type: LAB-3 2 Zeloarkar, LAB-6 2 Iahahound.
    - Venus-type: LAB-3 1 Voutha.
    - Airless: LAB-0 1 Moaskeanion, LAB-1 2 Cheatond.
    - Icy moons: LAB-1 10, LAB-3 12.
- **Exceptional worlds (Dave, done v1):** `src/gen/exceptional.js`. 30% of systems get one exceptional
  world; each kind has an eligibility rule, a weight, and a cause passed to the history and to
  bodies.js.
  - **Kinds:**
    - **tidal-lava:** an inner rocky planet in resonance, tidally heated, with lava lakes and seas
      (8-35%);
    - **impact-melt:** a giant impact 2-30 Myr ago (an `impact` event; life wiped out; most of the
      water lost; the crust glowing, T from the history, ~400-1300 K; a magma sea).
  - `b.exceptional = { kind, text }` for the catalog.
  - **Kinds to add, as Dave decides:** an iron world (stripped mantle, Mercury-like), a carbon or
    diamond world (high C/O), a deep global ocean (hycean), an eyeball world with an extreme day-night
    split, a rocky world with rings, a double planet, a geyser moon (cryovolcanic plumes), a chaotic-tilt
    world (wild seasons), a super-Venus, a moon near its Roche limit shedding a ring.
- **U3 status: v1 done.** `src/gen/worldsim/world.js` `worldSim(body, star, { N, Nt, myr, steps,
  dt, host, log })`. `choosePath(body)` reads the history:
  - **plates** (mobile now, liquid seas): Tectonics plus coupled erosion over `myr`, rain from
    `H.at(..., 'rain')`, impacts; then a fine erosion epoch with impacts.
  - **stagnant** (one shell, with a past of water or air): stagnant.js with `wetWindow(H)` (when the
    series had rain) and the sea fraction from the history's oceans.
  - **barren:** barren.js.

  All impacts take the system debris level x giant-host focusing (1 + 2 sqrt(M/M_jup)) plus the late
  spike. Lab: `node tools/worldlab.mjs SEED BODY` (`--init auto` is the default now). Checked:
  Ishiodreill (plates, 27 s at N=192 / 200 Myr), Zeloarkar (stagnant, 2 s), Moaskeanion (barren,
  0.6 s).
  - **Still to do:** regime changes within one run (plates early, then stagnant), Venus resurfacing,
    icy shells, glaciers, the climate step, and the plates path's starting crust (it still seeds
    continents from the old noise generator).
- **U4 status: done (v1).** `systemDebris()` in system.js sits in the seed head.
  - level = lognormal(1, 0.7) x (giants ? 1.4 + 0.2 x giants : 0.6) x (disk solids / 11)^0.3.
  - Named quiet / ordinary / busy / "a shooting gallery" (68 / 26 / 4 / 1.4% over 2000 seeds;
    red-dwarf systems mostly quiet).
  - A late heavy bombardment spike needs 2+ giants and comes 30% of the time then: a Gaussian bump at
    0.4-1.0 Gyr, 15x lognormal.
  - Stored on `star.debris` and in the summary.
  - `Impacts` takes `rate` (pass the debris level x local focusing) and `spike`.
  - **Still to do:** giant-moon gravitational focusing per body, and wiring it into the terrain driver
    (U3).
- **Seed summaries (Dave, done):** `summarizeSystem(seed)` in system.js gives the star (type, Teff,
  colour, mass, radius, luminosity, age, [Fe/H]), the planets (names, letters, orbits, masses, kinds,
  in the HZ or not), rocky HZ planets, and the exceptional world (which, what, why) in ~0.09 ms. It
  shares `systemHead(seed)` (star, disk, protos, the exceptional roll, names) with `generateSystem`,
  so the two always agree (checked: 0 mismatches over 40 systems). It's for interesting navigation
  through the galaxy. Moons aren't in the summary (they need the planets built).
- **Dave:** don't preserve existing worlds; the generator is under heavy construction. Much more is to
  come: coarse and fine population and city sims, space traffic, space stations.
- **U2. Calibrate against a census** of hundreds of seeds. Distributions should look right:
  - temperate worlds mostly in the HZ, sometimes snowballed;
  - Venus-like worlds inside the HZ;
  - small worlds turning Mars-like;
  - airless small or hot bodies;
  - icy moons, some with subsurface oceans;
  - tidally heated volcanic moons.

  Compare with the current generator's census and keep what's good (the cosmic shoreline, the HZ
  edges).
- **U3. One terrain driver**, `worldSim(body, history)`. The process modules become switchable by the
  history's state through time:
  - **impacts** always (system debris x era flux x local focusing);
  - **plates** (tectonics.js) while mobile; the coupled run covers the last ~400 Myr if mobile now, plus
    an earlier mobile window that leaves old relief;
  - **stagnant-lid plumes, rise, shields, canyon** (stagnant.js) when stagnant;
  - **mare flooding** (barren.js) while hot, with basins;
  - **rain erosion** (erosion.js) with liquid water and air, rain scaled by the history's climate;
  - **seas** by the water inventory;
  - **glaciers** when cold and wet;
  - **wind** when air is dry;
  - **ice shells and lineae** on icy moons.

  Then climate (step 3) for the present. barren.js and stagnant.js become process code inside it.
- **U4. System "busyness" (Dave):** the impact flux scales by a per-system debris level.
  - Drawn wide (lognormal around 1, ~0.2-10x).
  - Raised by giant planets next to debris belts and by more leftover disk solids; falls with age.
  - Sometimes a late spike: a Nice-model-like giant-planet instability (a late heavy bombardment).
  - Moons of giants get gravitational focusing (more hits: Callisto).
  - Store it on the system so the catalog can say it ("a quiet system" / "a shooting gallery").
- **Then continue with the rest:** climate (3) next, since Dave's core asks (biomes from temperature,
  humidity and seasons) depend on it; then rock layers, the recent epoch, soil, snapshot/game,
  validation and catalog. Venus-type, icy moon and Titan behaviour come out of U1/U3 as processes
  rather than separate sims.

### 1. Planetary history (a box model over the world's whole age)

One fast, time-stepped model per body, run first. It decides the story and feeds every later epoch.
Use 1 Myr steps over the star's age (`star.age` Gyr); it runs in milliseconds.

- **Star:**
  - luminosity grows with age, the faint young sun: L(t) = L_now / (1 + 0.4 (1 - t/t_now)) (Gough 1981);
  - flares and XUV are strong early (drives escape) and decay as ~t^-1.2.
- **Interior:**
  - mantle heat decays (radiogenic decay plus cooling), slower for bigger planets: tau ~ 2.5 Gyr x
    (M/M_earth)^0.3;
  - outgassing rate follows heat, times the volcanic activity tier.
  - **Tectonic regime over time:**
    - mobile lid while heat and water allow it;
    - stagnant lid when the planet is small or dry, or late as heat falls;
    - episodic overturn (Venus-like global resurfacing) when hot and dry;
    - the transition time is recorded (a Mars-like world loses its plates early).
  - **Core dynamo:** a magnetic field while the core loses heat fast enough. Lifetime grows with mass
    (Mars ~0.5 Gyr, Earth ongoing); a stagnant lid shortens it.
- **Volatiles:**
  - starting water, CO2 and N2 from `b.comp` (water fraction) and the formation zone;
  - outgassing adds to the air; sinks are carbonate (weathering), the crust and frozen ground.
- **Escape:**
  - Jeans and hydrodynamic escape from escape velocity, exospheric temperature and XUV;
  - ion pickup and sputtering when there's no magnetic field;
  - impact erosion (the impact rate is higher early: the Neukum exponential term, 5.44e-14 e^(6.93 T));
  - water is lost when the upper air is moist (above ~moist-greenhouse temperatures, or low gravity),
    with hydrogen escaping;
  - the cosmic-shoreline logic of `bodies.js buildAtmosphere` must agree at the present.
- **Climate (global mean):**
  - T from equilibrium temperature and the greenhouse: tau = tauBase(P) + 2.4 pCO2^0.9, as in
    `bodies.js`, plus methane before oxygen if there's life;
  - **ice-albedo:** below ~255 K global mean, snowball (albedo ~0.6). Weathering stops under ice and
    CO2 builds until the equator melts, then a hothouse;
  - **runaway / moist greenhouse:** above the runaway insolation the oceans evaporate and the water is
    lost (the Venus path).
- **Carbonate-silicate thermostat:**
  - weathering W = W0 * f(T) * (pCO2/p0)^0.5 * land(t) * runoff * uplift * bio, with
    f(T) = exp((T-288)/13.7) (1+0.038(T-288))^0.65 (Walker/Berner);
  - needs liquid water and exposed land;
  - with a stagnant lid, recycling is weak.
  - Solve pCO2 per step as the steady state where W = V (the response is faster than a step), except
    during a snowball (integrate the buildup).
- **Land over time:** continents grow mostly in the first ~2 Gyr (a growth curve to the present land
  fraction).
- **Life:**
  - **Origin:** a hazard rate while habitable (liquid water, 273-373 K); sometimes never, even when
    habitable.
  - **Stages:** oxygenic photosynthesis, then a delay to the Great Oxidation (sinks used up), then
    oxygen rising, then land plants (more weathering: cooling, possibly glaciation), then complex
    life. Random delays.
  - **Extinction:** sterilization by a runaway greenhouse, or by a total, lasting snowball.
  - **Past life:** "life once existed" on now-dead worlds (fossils, something to discover later).
- **Consistency with the present:** at first, the history must end at the generator's present state
  (`b.atmosphere`, `b.Tsurf`, `b.life.level`, `b.hydrosphere`).
  - Calibrate W0 so the present is the thermostat's steady state.
  - Pick the life stage times so the present level is reached.
  - For dead or dry worlds, choose plausible pasts (early wet, then lost).
  - Later (step 9) consider making the history authoritative, so the generator's present comes out of
    the history.
- **Outputs:**
  - time series on a ~5 Myr grid: T, pCO2, pO2, pressure, ocean fraction or volume, ice (0..1),
    snowball, regime, dynamo, outgassing, weathering, rain factor (Clausius-Clapeyron, ~7%/K vs
    present), plants;
  - an events list with times (origin of life, the Great Oxidation, snowballs, the end of tectonics,
    the dynamo stopping, oceans lost, land plants);
  - a short text history for the catalog.
- **Feeds into the epochs:**
  - deep-time erosion's rain factor and ice level per step;
  - whether plate tectonics runs and when it stops;
  - outgassing, so hotspot activity follows the interior heat;
  - plants, so hillslopes erode less and rivers change style.
- **Lab:** `tools/worldlab.mjs --history` prints the timeline and plots T, pCO2, pO2 and ice vs time
  to a PNG strip. Check it on the six worlds plus a Mars-like world, a Venus-like world, an airless
  moon and an icy moon.

### 1b. Realistic stars, and systems that follow them (Dave)

Today `src/gen/star.js` draws a lognormal mass near solar, clamped to 0.42-1.45 M_sun ("biased to FGK
like survey targets"), with L ~ M^4 (valid only ~0.43-2 M_sun). Dave wants realistic variety, so that
habitable zones move and planets respect them.

- **Mass from the initial mass function** (Kroupa/Chabrier): ~75% M dwarfs, ~12% K, ~7% G, ~3% F, ~1% A.
  Upper limit ~2.5-3 M_sun, since bigger stars are short-lived and rare, and their HZ is short-lived.
  - Consider a mild game weighting only if Dave wants it. Default is realistic.
- **Mass-luminosity, radius and Teff relations valid down to 0.08 M_sun:** piecewise L ~ 0.23 M^2.3
  below 0.43, M^4 for 0.43-2, 1.4 M^3.5 above 2; radius ~M^0.8 (low mass); MS lifetime ~10 M^-2.5 Gyr.
  - Ages drawn over the galaxy's history (~0-12 Gyr), capped by the lifetime.
  - Brightening with age.
  - Later: evolved hosts (subgiants, red giants, white dwarfs).
- **Activity:** flares and XUV last Gyr on M dwarfs, much longer than on the Sun. This feeds the
  history's escape (M-dwarf HZ planets lose air more easily). Consider a flare visual later.
- **HZ:** the Kopparapu S_eff is valid for Teff 2600-7200 K; clamp or extend for A stars.
- **System formation follows the star** (`src/gen/system.js`):
  - disk mass ~ star mass;
  - the snow line already ~2.7 M^2 AU;
  - giant-planet frequency ~ M_star x 10^(1.2 [Fe/H]), so M dwarfs mostly get compact families of
    small rocky planets (TRAPPIST-1-like);
  - HZ planets around M dwarfs tidally locked (check the generator's locking rule uses the tidal
    timescale with the star's mass);
  - check the habitable-zone placement logic respects the new HZ.
- **Game effects to check:** star colour and brightness (exposure under dim red light), plant colour
  (`vegetationColor(teff)` exists), sky, start screen ("Choose a world" must still find habitable
  starts; with mostly M dwarfs, maybe search seeds for one), catalog text.
- **This changes what every seed generates** (FSPB-8DTW and the HANDOFF test seeds included). Tell
  Dave before landing it; version the generator if old seeds should keep working.

### 1b status: DONE in the generator (2026-10-01; game smoke test pending)

- **Stars:** `star.js` draws mass from a Kroupa IMF over 0.08-3 M_sun, with piecewise L(M), R ~ M^0.85
  (low mass), ages over the galaxy, `activeGyr` and `xuv` (lifetime X-ray/UV dose vs the Sun).
- **Atmospheres:** `bodies.js` buildAtmosphere scales the cosmic shoreline by xuv^0.6, so flare stars
  strip close planets.
- **Systems:** `system.js` disk solids go ~M^1.5; gas giants need `pr.next() < 1.1 M_star`; giant mass
  scales by min(1, M/0.6).
- **Census of 800 seeds:**

  | Star class | Share | Gas giants / system | Temperate worlds / system | Of those locked |
  |---|---|---|---|---|
  | M | 75% | 0.02 | 0.23 | 99% |
  | K | 15% | 0.6 | 0.9 | 47% |
  | G | 3% | 1.1 | 1.2 | 0% |
  | F | 3% | 1.2 | 1.1 | 0% |
  | A | 3% | - | - | - |
  | B | 1% | - | - | - |

  About 8 planets per system for every class, which is high for M dwarfs (later: thin the comb for
  small stars).
- **FSPB-8DTW** is now an F6V system; its start world is Eldnedunt (a 304 K desert under thick CO2).

### 1c. Photosynthesis pigments and foliage colour (Dave)

Status: DONE in the generator. `src/gen/pigments.js`:
- `drawPigments` puts bands around the photon peak (3.67e6/Teff nm), adds a Soret-like blue band, and
  under cool stars a broad visible band.
- The red edge is capped in the visible.
- `albedoRGB` integrates against the CIE fit under 6504 K light, 25% desaturated.

`bodies.js` stores `life.pigment` and `life.vegColor`. Red dwarfs come out dark purples, browns and
blue-blacks; K stars grey-greens and tans; G stars greens and teals; F and A stars reds, magentas and
yellows. Later: show the pigment in the catalog (`describePigments`).

Original notes:

Life tunes its light-harvesting pigments to the star:
- **Absorption bands:** pick 1-2 bands at random near where the star's photon flux peaks (and its
  blue/red flanks), with widths. The red edge (reflecting near-infrared) sits past the last band.
  Following Kiang et al. 2007: plants under M dwarfs absorb broadly and may look dark or black; under
  F stars they might reflect yellow-orange; hotter stars give a bluer peak.
- **Foliage colour:** the reflectance (one minus the absorption) integrated under a neutral
  illuminant, D65 (the renderer lights it with the star's colour), converted to linear RGB.
  - Dry or dead foliage is a muted mix toward soil.
  - Ocean algae could share the pigment.
- **Where it plugs in:** `vegetationColor(lr, star.teff)` in `bodies.js`. Store the bands on
  `b.life.pigment` for the catalog ("absorbs 540-610 nm: magenta-blue foliage").

### 2. World kinds: each body gets the deep-time sim that fits it

Progress (2026-10-01):
- **7. Airless / barren v1 done:** `src/gen/worldsim/barren.js`; lab `--init barren`.
  - Impacts over the whole age follow the Neukum chronology (`Impacts.fluxN1`, the heavy flux counted
    from 4.3 Gyr back).
  - Primordial swells plus an optional lopsided hemisphere.
  - Basins at or over ~280 km (scaled by body size) flood with dark lava 0.1-0.8 Gyr later while the
    interior is hot (volcEnd = 1 + 15 M^0.6 Gyr). Likelier on the low, thin-crust side; never on
    icy worlds.
  - A freshness field fades with space weathering (450 Myr).
  - The smallest crater is 6 cells; smaller ones belong to the local detail.
  - Checked on Moaskeanion (icy, saturated like Callisto) and Moader (rocky, Moon-like, maria
    concentrated on one side, one fresh rayed crater).
  - **To improve:** maria should merge into broad plains (overflow between basins, a Procellarum-like
    region); giant basins should read (depth saturating ~5-10 km real); multi-ring basins; ray
    streaks; contraction scarps; icy worlds' viscous relaxation and bright ice.
- **4. Stagnant lid (Mars-type) v1 done:** `src/gen/worldsim/stagnant.js`; lab `--init stagnant`.
  - Primordial swells; a dichotomy (65%: a lowered hemisphere with a wobbly boundary).
  - A volcanic rise near the dichotomy edge, with 0-8 shields by activity tier: a giant (~22 km real
    x 3.7/g) plus smaller ones, built while the interior is hot.
  - A rift canyon off the rise (60%) once the rise has grown.
  - Impacts on the chronology.
  - A wet era from the history's 'seas' to 'drying' events: Erosion with rain fading out, and a sea in
    the lows (fraction from water content). The valley networks are recorded (`river`).
  - Checked on Moader: highland valley networks, lowland plains, shields; 21 s at N=256.
  - **To do:** outflow channels (late floods from ground ice), polar layered ice, wind (dunes and
    yardangs), an ancient shoreline mark, lava plains around the shields, a giant impact basin as the
    dichotomy's cause.
- **Crater scale decision:** populations are drawn for the real world (real area and sizes) and each
  crater is drawn scaled down whole, keeping its shape with 2.5x vertical exaggeration (VEXAG in
  impacts.js). Real depths on 1/10 widths made spikes. Mountains keep real heights (1:1), as the old
  generator does.
- **Axial tilt (Dave asked):** already generated (`bodies.js`: ~72% under ~30 deg, 23% 29-63, 5%
  69-95; locked worlds ~0; Venus-like slow retrograde spinners). It's used for the spin axis and the
  annual-mean climate. Seasons are step 3. Tilt wander without a big moon is a history item to add.

Choose from the history's regime and the body type.

1. **Mobile lid with ocean** (current). Feed the history's rain and ice.
2. **Mobile lid, dry or arid:**
   - the base level is closed basins (playas, salt flats);
   - wind matters (dunes, yardangs);
   - flash-flood channels (episodic rain).
3. **Water world:** tectonics under a deep ocean; islands only from hotspots and arcs; seamounts,
   guyots, atolls.
4. **Stagnant lid (Mars-like, and early or late phases of others):**
   - one plate, so plumes stay put: giant shield volcanoes (Olympus Mons scale, taller with lower
     gravity) and volcanic rises (Tharsis);
   - flexure around big loads (moats, arcuate rifts: Valles Marineris-like);
   - wrinkle ridges;
   - impacts accumulate;
   - **Mars arc:** an early wet period (the history says when: valley networks, deltas, a possible
     northern ocean), then drying (frozen ground, outflow channels from ground ice and floods), then
     polar layered ice.
5. **Regime change in mid-history:** run the plate sim until the stop time, then switch to stagnant
   lid with the existing topography carried over.
6. **Venus type:**
   - runaway greenhouse; no water erosion;
   - thick air filters impacts under ~3 km;
   - episodic global resurfacing (lava plains, few craters, all young);
   - tesserae (deformed old highlands), coronae (circular plume uplifts), rifts;
   - wind streaks and dunes.
7. **Airless or barren (Moon, Mercury, small bodies, cold or hot worlds outside the habitable zone).
   This will get the most use:**
   - the full impact history over Gyr with the Neukum chronology (the heavy early flux);
   - crater saturation and overlap, younger cutting older;
   - big basins: multi-ring, then flooded by mare volcanism when the interior is hot, so dark maria
     appear in that age band;
   - global contraction as it cools: lobate scarps (Mercury);
   - space weathering: rays fade and young craters stay brighter;
   - regolith depth grows with age.
   - Cheap: impacts plus a little volcanism; no rivers.
8. **Icy moons:**
   - ice shell over an ocean, and tidal heating from the orbit (eccentricity, distance to the primary);
   - lineae and bands (Europa), chaos terrain, grooves (Ganymede);
   - cryovolcanism and plumes (Enceladus);
   - craters relax viscously in warm ice (old ones flatten);
   - Callisto-like (no heat): saturated with impacts.
9. **Titan type:** methane rain, so the same erosion code with methane runoff; dune seas at low
   latitudes; methane lakes at the poles.
10. **Tidally locked worlds:** the climate is substellar (the eyeball pattern); ice on the night side;
    winds and rain from day to night.
11. **Gas giants:** "deep time" doesn't apply to a surface; the bands and storms are the equivalent:
    - the number of zonal jets from rotation rate and radius (the Rhines scale): fast spinners get more
      bands;
    - band colours from temperature and chemistry (ammonia, water, chromophore haze);
    - long-lived storms (Great Red Spot class), with lifetimes and drift;
    - polar hexagons and vortex clusters;
    - rings from tidal disruption or moon debris (Roche limit), and their age;
    - moons forming in the circumplanetary disk;
    - feed `giantPortrait` and the giant renderer.

### 3. Climate (coarse grid, through the year)

On a coarse SimGrid (N 32-64). Outputs 12 monthly fields: temperature, precipitation, snowfall, snow
cover, sea ice.

- **Sunlight:** daily-mean insolation by latitude and month from obliquity and eccentricity (with
  perihelion phase from `rotation.tiltAzimuth`), and the star from the history.
- **Energy balance:**
  - heat capacity: land small, ocean mixed layer large (so mild coasts and harsh interiors);
  - outgoing longwave A + B*T calibrated so the global mean matches the history's T;
  - diffusive heat transport, weaker with a thin atmosphere;
  - lapse rate with height.
- **Winds:** cells and belts from rotation rate (the Hadley count is in `bodies.js`); the rain belt
  follows the thermal equator through the year (monsoons).
- **Moisture:**
  - evaporation from oceans by temperature (Clausius-Clapeyron);
  - carried downwind;
  - rain where air rises: convergence, mountains (windward wet, lee rain shadow), fronts;
  - rain out when saturated; continental interiors dry.
- **Snow and ice:** snow when cold; melt by degree-days; ice where yearly snow outlasts melt (glacier
  sources, permanent ice caps).
- **Köppen classification** from monthly T and P, mapped to the game's biomes and flora; tilt and
  seasons now decide biomes.
- **Feeds:** rain to erosion (runoff = P - evapotranspiration); snow and ice to glaciers; biomes to
  flora, colours and the catalog.
- **Runtime:** monthly fields interpolated by orbital phase (seasons: snow lines move, vegetation
  colours shift, rivers swell, sea ice grows).

### 4. Rock and sediment layers

- **Lithology per cell as a short stack of layers:** type, thickness, erodibility K, colour. Types:
  basement granite/gneiss, basalt (volcanic, oceanic), sandstone, shale, limestone/chalk (reefs and
  marine carbonate), evaporites (playas), till, alluvium.
- **Where layers come from:**
  - the epochs' deposition (lakes, seas, deltas, shelves record layers);
  - volcanism (lava flows);
  - reef carbonate;
  - uplift exposes them.
- **Erosion uses the exposed layer's K:**
  - caprock over soft rock gives mesas, buttes and cuestas;
  - tilted layers give hogbacks;
  - canyons with ledges.
- **Karst** on limestone: sinkholes, disappearing rivers (later).
- **Feeds** rock colours and textures in the renderer (bands in canyon walls).

### 5. Recent epoch: the last ~2-5 Myr (ice ages, coasts, reefs)

- **Glacial cycles:** obliquity and precession rhythms set cold and warm phases (scaled from the
  history's ice level).
- **Glaciers:** a shallow-ice flow model (ice thickness flowing downhill; flux ~ H^5 S^3) fed by the
  climate's mass balance. Erosion follows the sliding speed:
  - U-valleys and overdeepened troughs;
  - fjords where they reach the sea;
  - cirques, arêtes and horns (detail-scale signatures placed by the patch step);
  - moraines and drumlins from deposited till;
  - lakes in glacial basins.
  - Alpine glaciers off high peaks even in warm phases, wherever the snowline is below the summits.
- **Sea-level swings** with ice volume (tens of m to ~120 m):
  - drowned valleys (rias), raised terraces, land bridges;
  - flooded fjords after melt.
- **Reefs:**
  - carbonate grows up to the surface in warm (SST above ~20 C), clear (low river sediment), shallow
    water with life;
  - fringing and barrier reefs;
  - atolls on sinking hotspot islands (Darwin's sequence: the tectonics already sinks them);
  - lagoons.
- **Coasts:**
  - wave erosion by fetch and wave energy: cliffs (Dover-like on chalk), wave-cut platforms, sea stacks;
  - longshore drift: beaches, spits, barrier islands;
  - deltas at mouths with a heavy sediment load; estuaries.
- **Wind:**
  - dune fields from wind and sand supply (deserts and coasts), sand seas;
  - loess downwind of ice sheets and deserts.
- **Meanders:** rivers meander once plants hold the banks (the history's plants); braided rivers
  before plants or on steep sediment-rich fans.

### 6. Soil and vegetation (Dave: a later pass)

- **Soil depth:** produced from bedrock (faster when warm and wet, slower when deep), carried downslope
  by creep, washed off steep slopes. Thin on ridges and steep slopes, deep in valleys and on
  floodplains.
- **Soil type** by climate and rock.
- **Vegetation:** from Köppen, the life level, soil depth and water. Meadows where it's shallow or
  dry, forests where it's deep and wet. Ties into `flora.js` (meadows exist now as the flattest point
  per cell; replace with soil and moisture driven).

### 7. Snapshot, fine detail and the game

- **Snapshot format per body:**
  - heights; top rock layer and its stack;
  - soil, climate months, biome, river network (vector polylines with flow), lakes (levels), glaciers,
    reefs;
  - volcano list, crater list, plate boundary lines, history events.
  - Versioned (`SIM_VERSION`).
- **Cache** in IndexedDB keyed by seed, body and version. Generation in workers, with progress on the
  loading screen (show the world forming; it's cool).
- **`TerrainGenerator.sample` reads the snapshot:**
  - smooth interpolation across face seams (sample with ghost cells, bicubic);
  - fine detail driven by the fields (rock type, slope, wetness, soil), not free noise.
- **Local patch erosion near the player** (~50 km at ~30 m), deterministic, with boundary conditions
  from the snapshot: real canyons and valleys at walking scale, cirques, gullies.
  - Seams between patches: overlap and blend, or a hierarchical scheme.
  - Physics and rendering must read the same heights (physically real worlds).
- **Water:** rivers as water surfaces in their channels (flow direction for animation), lakes at their
  levels, waterfalls where rivers drop over steps.
- **C/C++ to WASM port** of the hot loops: priority-flood routing, the implicit solve, the tectonics
  gather, patch erosion.
  - Toolchain: Homebrew LLVM with lld, or emscripten; `-ffp-contract=off`, no fast-math.
  - Own math functions, ported from dmath.
  - Determinism tests: JS vs WASM bit-identical on fixed inputs.
- **Performance target:** a whole system within a few minutes on first visit (Dave allows ~10), then
  instant from the cache.

### 8. Validation (keep doing this)

- **`tools/worldlab-batch.mjs`:** runs the reference worlds in parallel and prints a metrics table:
  - plates, continental area and mean thickness, land fraction, median land height, hypsometry
    (bimodal?);
  - sea-floor age, number of rivers and longest river, drainage density, Hack's law exponent;
  - lake count, crater count by size, hotspot chains, volcano count;
  - and writes a contact sheet.
- **Reference sets per world kind:** six mobile-lid ocean worlds (above), plus dry, water world,
  Mars-like, Venus-like, airless moon, icy moon and gas giant examples (find seeds with a finder script
  like `scratchpad find.mjs`).
- **Determinism check:** run twice and compare a hash of the output fields. Later JS vs WASM too.
- **Look at the maps.** Numbers miss things (domes, cliffs, seams, straight rifts).

### 9. Make the history authoritative (later; changes the game)

Let the history produce the present atmosphere, temperature, oceans and life, instead of matching the
generator. This touches `bodies.js`, rendering, the catalog and the start screen; do it once steps 1-3
are solid and Dave agrees.

### 10. Catalog and UI

- **Pause-screen planet catalog:** a "History" panel (timeline: formed, life, oxygen, snowballs,
  plates stopped, oceans lost) and a "Geology" panel (tallest peak, longest river, deepest trench,
  largest crater, hotspot chains, regime, volcanic activity tier).
- **Features list for the survey/delivery game ideas:** named peaks, rivers, craters, volcanoes,
  reefs, with coordinates.

## Open notes and decisions

- **Sea level** in deep time is set by rule (ocean fraction), only as erosion's base level. The sea does
  real work in climate, ice ages, coasts and reefs.
- **Guard rails, not targets:** continental mean thickness rail is 30-50 km. The tuners were removed on
  Dave's call.
- **Impacts** are realistic; a world this size gets few big craters in 400 Myr. Old ones erode or get
  subducted. Airless worlds are where craters dominate.
- **"Fewer impacts with a moon":** the physical effect is negligible. A big moon does stabilize axial
  tilt (Laskar), so moonless worlds can have wildly varying obliquity over time (a history output for
  the climate).
- **Grid:** the cube-sphere is fine. A geodesic hex grid would be more uniform; the sim only uses
  neighbour lists, so switching is cheap if artifacts show.
- **Planet sizes:** the game draws worlds at 1/10 of their real radius. The sim uses game R; cell size
  varies with R at a fixed N. Consider choosing N from R for a constant cell size.
