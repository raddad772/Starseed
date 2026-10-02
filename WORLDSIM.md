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

### DEEP-TIME CHECKLIST (Dave asked 2026-10-01: "have you implemented ALL the things we discussed?")

The order agreed: work down this list; keep the statuses current.

| # | Item | Status |
|---|---|---|
| 1 | Plates: collisions, rifts, welds, slab pull, spreading, hotspot island chains, arc volcanoes, activity tiers | done |
| 2 | River erosion coupled to the plates; lakes, shelves, deltas; creep | done |
| 3 | Impacts: real rates, early bombardment, system debris, giant focusing, late spike | done |
| 4 | History: atmosphere, CO2 thermostat, snowballs, runaway, life, escape, dynamo, ages, exceptional worlds | done |
| 5 | Climate in history -> rain -> erosion | partial: rain ~ exp(0.07 (T - 288)); plants speed weathering |
| 6 | **Feature finder:** peaks by prominence, ranges, rivers, gorges and canyons, lakes, trenches, deepest wet and dry spots, continents, islands, archipelagos and chains, waterfall sites, cliffs, plateaus, craters, volcanoes | done v1 (`worldsim/features.js` `findFeatures`; the lab prints and marks them). Still to do: names, deltas, fjords and mesas once they exist, deserts and forests (climate), "largest crater lake"; the catalog and game use (step 10) |
| 7 | **Rock layers of different hardness:** basement granite, oceanic and hotspot basalt, stratified sediments, chalk and limestone from warm living seas; erosion cuts the exposed layer | done v1, global (see below) |
| 8 | **Glaciers:** ice flow and erosion off peaks and in cold epochs; ice-age sea-level swings | done v1: glaciers and ice sheets, U-valleys, fjords (see below); ice-age cycles and sea-level swings still to do |
| 9 | **Coasts:** wave erosion (cliffs, platforms, stacks), reefs (fringing, barrier, atolls), **beaches (Dave: "amazing beaches")** and spits. **Tides (Dave: "don't forget tides"):** tidal range from the moons and the star (force ~ M/d^3), amplified in funnel bays (Fundy), tidal flats, salt marshes, mangroves, estuaries; locked worlds almost none (only eccentricity tides); the game's water level moving with them. Sand takes its source's colour: white coral, black basalt (volcanic islands), golden quartz (granite and sandstone), pink (coral and shells). Feature finder: longest beaches, white and black sand beaches | done v1 (`worldsim/coasts.js`): wave exposure (open sea within 6 cells), coastal wear by rock softness, sea cliffs (energy > 0.4, h > 60), beaches from river sediment plus wear on gentle shores with sand by source (coral / black / quartz: rock types 11-13), coral reefs up to the surface (complex life, warm, clear, < 60 m), atolls. Features: beaches (longest, plus the best of each sand), sea cliffs (<= 1 km, by rock: chalk = Dover), mountain coasts, reefs, atolls. Checked on Quokarn: 1400 km golden beaches, a 150 km coral-sand beach, a 50 km black-sand beach, 18k km2 reefs, 5 atolls. Still to do: longshore drift (spits, barrier islands), wave-cut platforms and stacks at local detail, pink sand, beach colour in the render |
| 10 | **Life's effect on erosion:** plant cover holds soil (less hillslope wash), meandering vs braided rivers; atmosphere changes (O2 and others) through rain and temperature | done v1: before land plants, erosion x1.5 everywhere (bare ground); after, cover = rain-based, slopes (A < 30 cells) wear x(1 - 0.6 cover); `riverStyle` meandering or braided by whether plants exist now; follows the history's plant arrival and extinction through both epochs (checked on Quokarn, plants 30 Myr ago, and Vaidriar). Still to do: soil depth (item 12); river channel style in the render |
| 11 | **Climate model:** seasons from tilt, wind belts, rain shadows, Köppen biomes; rain for every path. **Deserts (Dave asked):** subtropical sinking air, rain shadows, continental interiors, cold-current coasts, polar cold; then salt flats, dune seas, flash-flood erosion and mesas | done v1 on the plates path (`worldsim/climate.js`, see the notes below). Deserts in the climate, closed basins and salt flats, dune seas (true deserts with sand to hand on gentle ground) and mesa country (dry, a hard cap over shale, dissected) done; glaciers run on the climate's months (degree-day melt ~5 mm/K/day, snow = precipitation in freezing months; Opast 17 C: largest sheet 21M km2, Quokarn 9 C: 16% of land, Vaidriar -4 C: 61%); reefs need the coldest month's sea above ~18 C (climate SST). Still: features for the largest forest per kind exist; the climate on the stagnant and barren paths |
| 12 | Soil depth: meadows vs forests | **v1 done (2026-10-01, worldsim/soil.js; Dave: "soil thickness and subsurface water movement and depth, to help determine grassland vs forest"):** soil depth from making (P0 2e-4 m/yr x warmth and wetness x rock x up to 2.5 under plants, shielded e^(-d/0.4 m)) against the fine epoch's wear; thick where rivers laid sediment, thin where ice scraped it; loess spread a set distance from deserts and ice edges. Water table from recharge (Schreiber) and the wetness index ln(a/tan b); wetlands where it's at the surface on flats, and on cold wet flats (bogs, mires). Lab: soil line; features: wetlands. Resolution: soil thins at finer grids (steeper cells: true hillslopes are below any grid; the local detail's job) |
| 12b | **Plant maturity (Dave):** the time since land plants arrived sets the flora: <~50 Myr ground cover (mosses), ~50-90 Myr shrubs and ferns, ~90+ Myr forests (Earth's first trees ~85 Myr after land plants), ~300+ Myr diverse forests and grasslands; tree height scales with gravity (taller on weak gravity) | done v1: evolve.js gives `plantsMyr`, `floraStage` (-1 bare, 0 microbial crusts, 1 ground cover, 2 shrubs and ferns, 3 forests, 4 diverse forests and grasslands), `floraName`, `maxTreeM` (forests 30 -> 90 m, then 110 m, x sqrt(9.81/g), cap 250). bodies.js passes `floraStage` and `maxTree` into the terrain params; flora.js has no trees below stage 3, no shrubs below 2, crusts only (plants x0.08) below 1, trees capped at 0.6 maxTree (x1.6 base at stage 4). In the game now. Still to do: species variety growing with stage (more forms), grasses at stage 4, the catalog line |
| 13 | Regime changes within one run; Venus resurfacing; icy shells; Titan methane rain | todo |
| 14 | **Slab-pull steering (Dave asked about plate rotation):** today each plate keeps a random Euler pole (plates mostly slide, a few spin); slab pull only scales speed. Steer each plate's pole so it moves toward its own trenches (plates follow their sinking slabs; trench-ringed plates are fastest) | todo |
| 15 | **Life: stages, pace and extinctions (Dave, 2026-10-01).** "We start out likely with bacterial analog... more complex life, sea life, plant life, animal life"; "a living world of single cell organisms" when young; "a recently struck world with volcanic clouds choking everything, or a young planet with ocean life but not much on land yet". **Stages:** single cells at vents -> photosynthesis (mats, stromatolites; pigment colours) -> oxygen (banded iron, red beds) -> complex cells -> soft-bodied sea life -> sea animals and reefs -> land plants (floraStage) -> land animals (small, then large). **Pace (Dave):** more usable energy, more innovation: usable light (photon energy from the star's spectrum: a dim red dwarf's far-red light barely drives oxygenic photosynthesis, so oxygen comes late or never and complex life with it), warmth, chemical energy (vents, volcanism, tides); UV from active stars raises mutation (faster change) but keeps life off land until oxygen makes ozone; large animals need oxygen. **Extinctions:** big impacts (the same draws that make the craters, so the worst crater and the worst die-off match), flood-basalt eruptions (laid as basalt provinces in the rock), snowballs, greenhouse and oxygen crashes; each knocks diversity back by its size, recovery over Myr, the worst reset stages (microbes in the deep crust can reseed after sterilisation). **Present states:** a flood-basalt eruption under way (volcanic haze), a world recovering from a recent strike (low diversity, ferns everywhere), a fresh impact winter (a rare exceptional world) | **timeline v1 done (2026-10-01, evolve.js):** stages on per-step leap chances (Dave: "a chance to make a leap... low, but complexity or coverage should influence it"; "a higher-gradient world should evolve a bit faster"): hazard = curves x energy gradient (1 + 0.3 heat, x1.3 with oxygen) x radiation boost after die-offs x sqrt(how full the biosphere is) x2 if re-evolving / difficulty (Earth-paced, lognormal 0.4). **Curves (Dave: "curves aren't linear"):** warmth (2x per 10 K to an optimum, falling to the stage's heat limit: microbes 395 K or boiling, complex cells 332, animals 322); light saturating (1.5 L/(L+0.5)); radiation dose from the star's XUV, ozone (from O2), the magnetic field (x2.5 without) and the air, water shielding sea life: mutation up to +60%, deadly past ~500x (microbes), 50x (complex sea life), 20x (land plants), 10x (land animals); oxygen enabling 0.03-0.12 bar, toxic and burning past ~0.4. Usable light = 400-750 nm photons per unit light vs the Sun's (`parPhotons`). Water's liquid range from pressure (boiling point by Clausius-Clapeyron; seas freeze ~271 K). **Extinctions (Dave: \"a meteor extinction forces down sunlight, which needs to be an input\"):** impacts at impacts.js's rates (largest per step; craters >= 150 km listed in `bigImpacts`): dust and soot optical depth 40 (E/E_Chicxulub) (R_E/R)^2, months to years of darkness; each guild dies by its reserve (plankton 0.8 yr, sea animals 1.5, land plants 4, land animals 1, microbes 30, with refugia floors): Chicxulub ~ 75%, a 100 km crater ~ 10%; the worst lose the top stage; craters >= 0.3 R sterilise (deep microbes reseed 60%, 25% if the seas boil). Flood basalts (rate ~ heat^1.5 x tier; CO2 lognormal, 0.3-2 Myr): loss from the warming. Snowballs: darkness under the ice. Heat past the limits and deadly radiation on land strip stages. **Radiations (Dave: extinctions cause new biodiversity):** the boost 1 + 4 loss e^(-dt/15 Myr) on leaps and on diversity regrowth (logistic, exact per step, ~5-20 Myr recoveries). Outputs: `lifeStage`, `lifeStageName`, `diversity`, `usableLight`, `extinctions`, `bigImpacts`, `floodBasalts`, `eruption` (under way now), `recovering`; series `stage`, `div`, `light`. Census (300 seeds, 69 worlds ever alive): 34 dead again (mostly sterilised early then frozen or dried: Mars), 12 complex cells, 11 single cells, 5 land animals (diversity 0.4-0.99), 5 erupting now. Still to do: the spatial model (15b), the terrain stamping the history's big impacts and flood basalts, the game showing stage, eruption and recovery (catalog) **Supervolcanoes (Dave: "what about super volcanoes causing extinction events"; "make them dependent on core activity"; "make sure it actually affects the life map"):** explosive caldera eruptions ~1.2/Myr x interior heat x tier x (arcs: plates; hotspots: core plumes), size Pareto from 1000 km^3 (largest per step); sulfate haze scatters (dims to ~a third, chills a few K for years: not an impact's black), so only giants hurt: loss 0.25 (1 - e^-(V/40k)^2); recent ones listed (calderas for the terrain). Volcanism follows interior heat (mantle melting: Venus erupts without a field; Io by tides); plume-fed eruptions (flood basalts, hotspot supervolcanoes) also by the core: (iron/0.32)^0.5 x (dynamo running ? 1 : 0.5). Every event has a place (`at`, `reachKm`): impacts, flood-basalt provinces, calderas; the life map knocks diversity back everywhere (recovering over ~8 Myr), worse round the site, forest back to scrub there for ~1 Myr, and a province erupting or freshly cooled is bare lava. |
| 15b | **Life on the map (Dave):** "a coarse model of this life in the geographic and climate simulation, both in deep time and recently... spread speed, complexity, a basic flexible ecosystem model that can answer 'after 100 million years on this planet what MIGHT life roughly cover and at what complexity'". worldsim/life.js: per cell productivity (climate NPP from temperature and rain, usable light, nutrients from rivers and upwelling), each stage spreading from where it arose at its own speed (barriers: sea for land life with chance crossings, ice, desert), on the moving plates in deep time (joining continents mix, splitting ones isolate: realms like Australia's), diversity by time since arrival x productivity x area, extinctions hitting everywhere with refuges; feeding plant cover to erosion and soil, reef builders to coasts, vegetation albedo to the climate | **v1 done (2026-10-01, worldsim/life.js):** on the climate grid: land productivity (Miami NPP x usable light), forest (water: P/PET or groundwater within 5 m; soil; warm months; a flora old enough), fire (oxygen 15-20%+, dry months) keeping grassland open, shrubs before grasses, tundra and desert; sea productivity (light x nutrients: cold-current upwelling from climate.js gyres, high-latitude mixing, river sediment at coasts); spread (Dave: "how different a neighboring cell is... IF there aren't mobile animals yet... a bird that's good at hot wet areas can fly across the world"): adaptation-limited creep (exp(-2 x climate gap)), rare crossings to other landmasses (new lineages: realms), fliers' far jumps to like climates ~30 Myr after land animals; diversity from time since arrival, productivity and realm size (A^0.25) x the history's diversity now. Feedback (Dave: "this model needs to feed back and forth"): two passes: climate -> life -> climate with the cover (forests darken the land, snow on forest shows dark, land hands back 20% of its rain bare to 70% under cover) -> life; the cover holds the fine epoch's slopes (E.veg) and quickens soil making. Lab `<body>-auto-plates-life.png` in the world's foliage colour. Opast: land 22% covered (forest 12%), sea 35%, 1 realm. Still: realms through deep time on the moving plates (merges and splits), reefs from the sea-animal map, the game's flora from the map (with the snapshot) |
| 16 | **Formation chemistry, air by species, metabolisms and biochemistries (Dave):** "solar system formation to play into it. The atmospheric mix doesn't have to be like earth, availability of carbon or silicon if it's silicon based life, modeled carbon and silicon cycle"; "all the plausible atmospheric respiration cycles, and a survey of atmospheric compositions to see which worlds aren't hospitable"; "some may have all those rivers but no life (never started or died long ago like Mars)". **Formation:** a system C/O ratio with its metallicity; each world's C, N, S, water and Si budgets from where it formed (snow, soot and CO lines); mantle redox from them (high C/O: carbide worlds, graphite crusts). **Air by species:** N2, CO2, CO, CH4, H2, NH3, H2O, SO2, H2S, O2, Ar: outgassing by mantle redox (oxidised: CO2, H2O, SO2, N2; reduced: CO, H2, CH4, NH3, H2S), escape (light gases fastest), photolysis, weathering and dissolution, life. **Metabolisms** with energy yields: aerobic respiration (big animals), methanogenesis, sulfur, iron and nitrogen cycles, anoxygenic and oxygenic photosynthesis (light quality), hydrogen breathers in H2 air; their gases change the air (biosignatures). **Biochemistries:** carbon in water; carbon in ammonia (cold); carbon in methane or ethane (Titan; slow); acid-cloud microbes (Venus); silicon (rare, speculative: cold or hot, oxygen-free, silicon-rich, low carbon). **Survey:** every world's air and which chemistries it could host | **v1 done (2026-10-01):** star.js gives each birth cloud `CO` (0.55 x 10^(0.4 [Fe/H]): ~0.3 metal-poor to ~0.8 metal-rich), `alphaFe` (up to +0.3 when metal-poor: system.js gives their rocky planets smaller iron cores) and `radio` (thorium and uranium, lognormal 0.35); Dave: "very young suns with old planets won't have a lot of complex elements?": a star and its planets share their birth cloud's make-up, set by how enriched the galaxy was when they formed (old stars metal-poor), and carbon follows (C/O rises over galactic time). evolve.js: carbon-rich clouds make dry worlds (water x (1 - (C/O - 0.8)/0.3)) and more carbon; mantle redox (dIW, Earth +3.5) from water and C/O; volcanic gas by redox (CO2/CO/CH4, H2, SO2/H2S, NH3); birth hydrogen on big rocky worlds; steady-state minor gases with their sinks (hydrogen: diffusion-limited ~30 kyr or energy-limited ~120 bar/Gyr x XUV; methanogens eat H2; CH4 lives 10 kyr anoxic, 10 yr with oxygen; CO, NH3, SO2 by rain and light); greenhouse adds CH4 (with organic-haze cooling past CH4/CO2 ~0.2), H2 collisions, NH3; the oxidation needs an oxidised mantle and no hydrogen air. Core and field (Dave: "link them to a core and magnetic field that can die"): dynamo life ~ M^1.5 (iron/0.32)^1.5 radio^0.5 (x0.6 under a stagnant lid); field strength by core size, fading; it scales escape and the radiation dose (x2.5 with none). Gases freeze by vapour pressure at the cold poles (nitrogen, CO2), coming back as worlds warm. Present `air` by gas, `airType` (none, hydrogen, nitrogen, nitrogen-methane, carbon dioxide, hothouse, steam, oxygen, reducing nitrogen, methane haze, carbon monoxide, sulfurous). **Liquids (Dave: "ones where the gasses are liquid... what liquids are even there"), worldsim/liquids.js:** water, ammonia-water, CO2, nitrogen, methane, ethane, ammonia, SO2, sulfur, each with triple and critical points, vapour pressure, density and colours; what condenses past its vapour pressure at the cold trap (a lot of it at the mean temperature), liquid between triple and critical points (CO2 needs 5 bar), liquid depth capped at high-pressure ice (~1 GPa); bodies.js uses the main liquid for the seas and their colours (no bucket). Survey (300 seeds, 3212 solid worlds): air: none 62%, hydrogen 9.7%, nitrogen 8.6%, nitrogen-methane 6%, CO2 hothouse 5.1%, CO2 4.8%, steam 2.9%, oxygen 0.5% (all alive); main liquids: water 82, nitrogen 56, ammonia-water 15, ethane 12, CO2 10, methane 1. Mercury can't pool (~1e-7 of rock, bound to sulfur). Still to do: metabolisms and biochemistries (below), the materials table (16b) |
| 16b | **Materials and reactions (Dave: "viscosity, density (important if we dive), acidity, luminousness (lava, later bioluminescence), refractive index, reflectiveness"; "a special case for lava: if it meets water, which forms islands... and other rough interactions"; a falling-sand game's approach, coarse for now):** one materials.js for every substance (rocks, sands, soils, ices, liquids, gases, aerosols, reef, peat): phase points and vapour pressure, density, viscosity (and its temperature dependence: basalt runs, rhyolite barely), heat capacity, optics (absorption spectrum, refractive index -> Fresnel reflection, roughness), glow (blackbody from temperature: lava, molten sulfur; bioluminescence a life trait), chemistry (acidity, oxidiser/reducer, what it dissolves), strength and erodibility. Reaction rules with conditions and outcomes: lava + water (quench: pillow basalt, steam, black sand, new land and islands), lava + ice (meltwater floods, tuyas), acid + carbonate (karst, CO2), CO2 + water (acid seas slow reefs), ammonia + water (antifreeze), methane + oxygen (fire past ~17% O2), water + rock (weathering, clays, soil), wet/dry soil, permafrost. Planet scale: each cell a composition (shares of rocks, liquid layers, ice, soil moisture) and reactions as rate laws inside the processes; the local detail later may run a real cellular (falling-sand style) sim near the player from the same table. Render (19) and diving read it | **v1 (2026-10-01):** worldsim/materials.js holds rocks, sediments, sands, liquids (water, ammonia-water, CO2, nitrogen, methane, ethane, ammonia, SO2, sulfur, lava, brine), ices and biological materials with density, heat capacity, viscosity (Arrhenius-style: basalt lava 100 Pa s at 1450 K, 1600 at 1250 K), refractive index (`reflectance`: water 2%, molten sulfur ~10%), colours, tags (acid, carbonate, salt, fuel, reducer); lithology.js and liquids.js take their tables from it; `seaPH` (8.2 at Earth's CO2, ~7.2 at 0.05 bar, lower with SO2) and `carbonateOK` (shells and reefs need ~7.6+: coasts.js reef growth and marineRock's limestone and chalk); REACTIONS lists the rules and where each is used. Still to do: the reactions not yet applied (lava + ice, fire, weathering into soil), viscosity and density in the game (lava flows, diving) |
| 17 | **Freshly struck worlds (Dave: "a way to represent and land on planets that were JUST impacted and boiled"; "a recently struck world with volcanic clouds choking everything"):** new exceptional kinds tied to the history's impacts: (a) **just boiled** (years to ~1 Myr after a crust-melting or sea-boiling strike): cooling stages: rock-vapour sky (~kyr, 2000+ K), steam sky over a magma ocean, crust forming with glowing cracks and a melt sheet in the fresh basin, then the first rains and the seas coming back; landable on the cooling crust; (b) **impact winter** (a Chicxulub-class strike within ~10 years): dark sooty skies, fires, cold, a fresh glowing crater; (c) the existing impact-melt (Myr ago). Needs: the terrain stamping the basin and melt sheet at the strike's place, the render (glowing melt, lava, steam and soot skies), the catalog lines. **Survival rules (Dave: "once a world HAS life, sterilization should be tricky... some should usually survive in the deep oceans unless the rock is boiled"), done in evolve.js:** a surface-sterilising strike (crater >= 0.25 R) spares the deep sea 98% of the time (life keeps up to complex cells); boiling the seas (>= 0.4 R) spares crust microbes 85%; melting the crust (>= 0.55 R) 3%. Sea life's radiation: mutation from the sunlit layer (1% of the surface dose), harm only at depth (0.1%) | todo |
| 18 | **Habitable moons of giant planets (Dave: "is there any way for a habitable moon to form like this of like a gas giant?"):** today none can: no Jupiter-class planet ever sits in the habitable zone (no migration in system.js; the "giants" there are 3-10 Earth-mass gas dwarfs without moons) and regular moons are Galilean-sized (2e-4 of the host's mass shared out), too small to keep air warm. To do: giant migration (a chance a giant moves into the inner system, scattering the rocky protoplanets there and bringing its icy, water-rich moons: ocean moons), moons scaling with the host (a super-Jupiter's reach Mars-to-Earth mass), rare captured terrestrial planets as moons. Their life and climate: locked to the giant (days-long days), eclipses, tidal heat, the giant's radiation belts in the radiation model (unless the moon has its own field or orbits outside them), the giant filling the sky. Impact focusing by a giant host is in both world.js and the history (bodies.js passes the host); a planet's own moon doesn't meaningfully shield it (its cross-section is tiny) | todo, after 16 |
| 19 | **Unified rendering from physical state (Dave: "If you're making different rendering paradigms for different world types, please stop that... rough out a unified way to handle rendering these rocky and possibly life-bearing worlds, based on how they are... let their diversity breathe"; "light reaching the surface [should] be colored by atmosphere too"):** one pipeline for every rocky world, parameters from the sim, replacing the bucket code (bodies.js `atmosphere.type` temperate/mars/venus/coldco2/titan, terrain.js's water/methane/lava branches). **Surface spectrum** (sim, ~12 bands 300-1100 nm): the star's blackbody x the air's transmission (Rayleigh ~ column/lambda^4 from the gas mix, aerosol extinction, gas absorption: ozone from O2, CH4 red/near-IR, H2O near-IR, SO2/NO2 blue); feeds the sun's colour on the ground and the sky light (render), the pigments life evolves (pigments.js from the surface light, not the star), and usable light for the life clock (evolve.js `parPhotons`). **Sky:** scattering from the gas mix (rayleighRel exists); aerosols by kind and amount from the sim (dust from dryness, wind and thin air; water clouds; sulfuric acid clouds from SO2 + water; organic haze from CH4/CO2; soot from fires and impacts; volcanic ash; CO2 and CH4 ice clouds), each with its own scattering, absorption colour and height. **Surface:** rock colours from lithology (worldsim rock), ices by substance (water white, CO2 frost, nitrogen ice with tholins, SO2 frost), liquids by substance (liquids.js: absorption colours; freezing by their own triple points), salt flats and sands, vegetation and microbial mats by pigment (purple shores, green seas). **Glow:** anything hot glows as a blackbody at its temperature (lava, a fresh melt sheet, molten sulfur, a hothouse surface): no lava special case. **Clouds (Dave: "the clouds are kinda bad"):** from the climate model (climate.js monthly humidity, rain and rising air): the rain belt following the seasons, storm tracks, clear subtropical deserts, fog over cold currents, cloud kinds by condensable (water, ammonia, methane, CO2 ice, sulfuric acid). **Browser check 2026-10-01:** Liostar (LAB-11, 43 bar hydrogen, nitrogen seas) renders as a uniform khaki disk: the 'temperate' bucket's pressure-scaled Earth haze (hydrogen scatters weakly: really a thin pale haze); Opast (LAB-271, oxygen, red foliage for its F8 star) looks right apart from the noise-band clouds. Later: aurora (field x stellar wind), airglow, city lights | todo (principle in effect now: no new buckets) |

Notes:
- **Item 7 v1 (`worldsim/lithology.js`):**
  - **Rock types:** 11 (granite, basalt, andesite, sandstone, shale, limestone, chalk, alluvium, salt,
    regolith, ice), each with an erodibility multiplier, a colour and a standing angle (for future
    cliffs).
  - **`Lithology`:** a per-cell layer stack over a basement, with `erode`, `deposit`, `kField` and
    `exposed`.
  - **Deep time:** each plate carries `sed` (sediment cover, m) and `carb` (limestone or chalk laid
    on warm (|lat| < ~33 deg), shallow (< 300 m), living shelves); sediment is stripped first where it
    wears. Deep-time erodibility is x2 on sediment, x0.45 on granite and x0.6 on basalt.
  - **Fine epoch (`buildRock`):** the basement, the plates' sediment as laterally continuous beds (24
    bed definitions waving gently across the world: shale or sandstone, carbonate among the upper
    ones), and volcanic caps (andesite on continents, basalt at sea). Erosion uses the exposed layer's
    K; cut material comes off the stack; deposits go on as alluvium (land), chalk or limestone (warm,
    living, shallow sea; chalk where clear) or shale; impacts lay regolith.
  - **Lab:** `<body>-auto-plates-rock.png` (a geology map) and the exposed-rock shares (Ishiodreill:
    basalt 30%, granite 23%, alluvium 20%, shale 14%, andesite 8%, limestone 4%, chalk 1%).
  - **To do:**
    - cliff retreat with rock strength (`stand`): mesas, buttes and chalk cliffs are 1-10 km features,
      so they come with the local detail (step 7), which reads these stacks;
    - salt in drying basins (climate);
    - ice rock on icy worlds; rock on the stagnant and barren paths (basalt plains, regolith, wet-era
      layers);
    - carry the exposed rock and the stacks into the snapshot and the terrain shading (Dave: rock
      colours in the final render).
- **Item 8 v1 (`worldsim/glaciers.js`):**
  - **Mass balance:** per-cell annual temperature (the generator's latitude law, lapse with height, plus
    the history's T then vs now). Accumulation up to 1.5 m/yr below 268 K (scaled by snowfall); melt
    0.6 m/yr per K above.
  - **Flow:** ice flux summed down the river routing tree. Thickness 60 (real flux / 1e6)^0.35, capped
    at 3.5 km. Erosion 8e-9 flux^0.6 (game flux), 35% of it off the valley walls (U-shape); troughs
    capped at 1.2 km below their start; no sea-level limit, so tidewater glaciers dig fjords.
  - **Features:** `iceFields` (ice sheet vs cap) and `fjords` (ice-cut ground now under a sea).
  - **Height limit:** the fine epoch's uplift fades out near 9 km x sqrt(9.81/g) (crustal strength).
  - **Checked:**
    - Ishiodreill: two polar sheets of 12-14 M km2, ~3 km thick, fjords ~1.4 km, top peak 8.3 km;
    - Heludriom (tidally locked): a 33 M km2 night-side sheet, 3.5 km thick.
  - **To do:**
    - ice-age cycles (the history has no Milankovitch rhythm, so ice is steady through the epoch);
    - sea-level swings with ice volume;
    - moraines and till (the ice's debris is dropped);
    - cirques, aretes and horns at local-detail scale;
    - glaciers in the deep-time coarse epoch and on stagnant worlds;
    - ice as a rock layer on icy worlds.
- **The feature finder caught two bugs (fixed):**
  - the plate sim's uplift rate was a fading sum without averaging (8.5x too high), which raised
    33 km peaks; U is now x(1 - fade) and capped at 10 mm/yr, giving a 9.6 km top peak and 4-5 km
    canyons on Ishiodreill;
  - oversize impacts were clamped to the cap (piles of identical basins); they are now redrawn.
- **Item 11 v1 (`worldsim/climate.js`, 2026-10-01):**
  - **Energy balance:** monthly insolation from tilt, eccentricity and perihelion; per-cell heat
    capacity (ocean 50 m, land by air pressure; both deeper as sqrt(year length)); band-coupled
    (36 bands in sin(lat), harmonic-mean capacity) with implicit poleward diffusion
    D = 0.2 sqrt(P) x spin factor ((rotH/24)^0.3 in [0.5, 3]; locked x6, bands are rings round the
    substellar point); outgoing heat A (T/Tmean)^ex, ex = 4 - 1.5 (wet air) so the slope is ~2 W/m2/K
    near the mean and a hot day side can't run away; A bisected so the mean matches the history's
    T; ice albedo below 271 K; a cloud deck on locked water worlds' day sides.
  - **Gyres:** sea cells within ~20 deg of a coast to the east in the subtropics get a cold current
    (-45 W/m2), within ~20 deg of a coast to the west in 15-60 deg a warm one (+35); wide basins only;
    mirrored on backward spinners.
  - **Rain:** wind belts by Hadley count (mirrored on backward spinners); evaporation 0.08 qs(T) per
    cell off the sea; land gives back at most 60% of what fell on it; carried downwind (80 sweeps,
    precomputed link geometry); rain-out (0.015 + 0.1 rise) x stability x (sea 0.5) + 0.3 upslope,
    rise 1 in the rain belt, 0.04 in the sinking subtropics; stability from the ground vs its band's
    air at sea level (summer monsoons, dry winter continents); land within two cells of a cold
    current x0.2-ish (fog deserts); what the air can't hold (its band's air temperature less lapse)
    comes out; scaled to ~1000 mm/yr x e^(0.025 dT) x sqrt(ocean/0.7).
  - **Köppen** classes and broad biomes; the lab draws `<body>-auto-plates-climate.png`.
  - **Checked** (old-generator heights, 8 temperate worlds): land rain 450-850 mm/yr vs sea
    860-1700; deserts 6-43% of land (Saeverkion, 44 deg tilt: temperate and mediterranean; Seamibest,
    78% land: 41% desert); locked Thugroadath 60 C under its sun, -14 C opposite; Heludriom (0.06
    bar) 163 C / -80 C; ~0.6-1.2 s at N 40. Quokarn's plates world: cold interior deserts, a hot core,
    wet west coasts.
  - **Known:** Seamibest (78% land, 994-day year, 38 deg tilt) swings ~100 K at 45N on land; plausible
    for a land world with long seasons. The rain distribution is still steep near coasts.
  - **To do:**
    - desert landforms: closed lakes DONE (see below); dune seas, mesa country flagged for the local
      detail still to do. Flash-flood erosion (Langbein-Schumm, semi-arid wears fastest) already
      comes out of the plant-cover rule (erosion ~ rain^0.45 x (1 - 0.6 cover));
    - glaciers from the climate's temperatures and snow (they still use the generator's latitude law);
    - reefs from sea temperatures (they still use a latitude band);
    - features: largest desert, dune sea, salt flat, forest; the climate on the stagnant and barren
      paths (Mars' wet era, Titan's methane);
    - biomes into the game's flora and colours (with the snapshot, step 7).
- **Erosion fixes (2026-10-01, found chasing oversized lakes):**
  - **A bug cancelled most river incision since the start:** after cutting, the sediment pass
    refilled any cell lower than the pre-step water surface, which includes every freshly cut
    cell, from upstream sediment. Only cells that were lakes before the step keep sediment now
    (erosion.js `wasLake`).
  - **K recalibrated to real values** (deep time 6e-7, fine 8e-7: a real K ~1e-6 m^0.1/yr x
    ~0.8 at the game's scale; the old 3e-6 / 1e-5 were tuned against the bug). Env `WS_KD`,
    `WS_KF` for experiments.
  - **Isostasy:** deep time (tectonics.js stepEroded): the regional part of each step's change
    (blurred over ~3 cells) is rock on or off the crust (thickness += dReg/1000 km: a km worn
    off a region lowers it ~150 m), the local rest is relief. Before, erosion took crust off 6.7x
    too fast. Fine epoch (world.js): the regional part rebounds 85%; sea level re-levelled each
    step to hold the ocean share.
  - **Spillways** of overflowing lakes cut 5x harder (outburst floods); water below sea level
    joined to a sea over a sill under 10 m is sea (the Black Sea).
  - **Coasts:** beaches only on wave-exposed shores (energy 0.3-0.95), worn by the waves each
    step (they last only while fed); sheltered muddy shores become mudflats (`mud`: tidal
    flats, mangroves, marsh); reefs only as fringing (near land) or shelf-edge reefs; features
    report reef systems by length.
  - **Checked (N 160-192):** peaks 8-10 km, gorges to ~8 km of local relief, lakes 0.5-0.9% of
    land (Earth ~2%), land mean 620-930 m (Earth 840), ocean share held (Quokarn 0.462 ->
    0.462), ice cover by each world's temperature (Quokarn 9 C: 27% of land, Vaidriar -4 C:
    67%), beaches to a few thousand km, reef systems 2000-5000 km long (GBR 2300).
- **Closed basins (2026-10-01, erosion.js `lakes()`):** the sea is only connected water below sea
  level of at least 0.2% of the surface; smaller hollows are basins. Each lake's balance: runoff
  by Schreiber's curve (P e^(-PET/P)), PET from the climate (0.3 e^(0.06 T) m/yr, x1.8 in warm dry
  air), loss (PET - P) off the lake. A lake that can't fill is closed: no water or sediment leaves
  (drain stops, sediment spreads over its floor), it shrinks to the balancing area (salt lake) with
  salt flats round it to ~3x that, or dries to a salt flat; salt 1.5e-4 m^3 per m^3 of inflow,
  laid as salt in the rock. Lake mud as shale. Features: lakes (fresh, salt, under the ice), salt
  flats, rivers to closed basins, the largest deserts and forests (Köppen regions). Checked:
  Quokarn 285 lakes, 163 closed; a Messinian-style salt flat 289k km2 at 2.6 km below sea level;
  4,000 km rivers ending inland; perched inland seas (cut-off ocean basins, Black Sea style, 4.7 km
  deep). Moukspi (0.02 bar): every lake a salt flat.
- **Big closed-basin lakes** (up to ~2M km2 real) stay full because erosion fills every basin to
  its spill point. Real ones overflow and cut their outlets (wet) or dry to salt flats (arid): this
  needs the climate (item 11), a lake water balance of rain against evaporation.
- **The erosion sim treats all ground below sea level as sea,** even inland hollows. The feature
  finder treats only connected regions over 0.2% of the planet as seas. Align the sim later
  (endorheic basins).
- Item 7 makes the mesas (caprock), canyon ledges and Dover-like chalk cliffs, the last with item 9.
- **Rock colour and material (Dave):** layers aren't just hardness. Each rock type has a colour and
  material when exposed: white chalk, red sandstone, grey granite, dark basalt, banded shale, pale
  limestone, black lava, ice.
  - The sim records the exposed rock type per cell, plus the layer stack and depths so canyon walls
    can show their bands.
  - The snapshot (step 7) stores it.
  - The game's terrain shading should colour by it: today `bodies.js` picks one minerals palette per
    world (rock / rock2 / regolith / sand), so this becomes a per-cell rock type with a per-world
    palette for each type. Carry it through to the final render.
- Fjords need items 7, 8 and the sea-level swings.

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
- **Pre-generated library (Dave, 2026-10-01):** "even if we just pre generate 1000 really good
  systems for people to explore that's great. And if they want to go deeper it takes time." So: a
  shipped set of curated, fully simulated systems (cached snapshots, picked with the seed summaries
  for variety), and any other seed generated on demand. Keep the generator deterministic so the
  library can be rebuilt from seeds and a version.

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
- **Timelapse from orbit (Dave, 2026-10-01, later):** watch a world's history play out on the globe:
  continents drifting and colliding, ice sheets advancing, seas rising and falling, deserts and
  forests moving. The sim is deterministic and stepped, so either:
  - keep frames as it runs (coarse heights ~50 KB per frame at N 64, plus ice, sea level and the
    history's climate per frame; a few hundred frames fit the cache), played back with blending
    between frames; or
  - keep a checkpoint (say 50 Myr ago) and replay the recent history on request, at any detail.
  The `onPlateStep` hook in world.js is the place to take frames.

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
