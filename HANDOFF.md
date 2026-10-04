# Starseed Infinite handoff (2026-10-01, session 68fc2903, updated by sessions 0f13fab4, 109eda38 and 39d69fa8)

Dave is play-testing and giving feedback in short bursts.

## NOW: England-sized worlds, true-scale ground, channels as lines (session 39d69fa8, 2026-10-03/04)

Dave looked at the same mountain (SOL Earth, Yotaxus Peak, 33.44 N 157.97 W) from orbit, descent, a low
pass, the valley 27 km out and the summit, as the game was and as an England-sized Earth, and chose the
small one: "I definitely like right a lot more", then "Yeah fix refine and optimize". All committed:
- **Drawn size apart from the deep time's** (ef0d07f, b1b87fa): `units.js LEN_SCALE = 1/64` (Earth R 99.5
  km); the world sim always runs at `SIM_LEN = 0.1` (its caches unchanged) and `SnapshotSampler(s, Rd)`
  lays its grid on the drawn globe, converting the sizes across the ground (craters, tuyas, rivers'
  inflow). Drawn heights = real x `HEIGHT_SCALE = sqrt(LEN_SCALE)` (x0.125; Dave chose the sqrt rule).
  `?len=0.1` draws the old size (own tile caches: `TILE_VERSION = 38 + 10000*round(1/LEN_SCALE)`, 640038
  at the default). Days are 3 h and orbits ~11 min at this size: untested in play.
- **True scale below the deep time** (60093b7) with the integer sim's streams at their full rate
  (7e7ab0a, `INT_CUT = 1`): the fine levels cut gullies and spurs into the mountains; at a third of the
  rate they stayed smooth domes (the "doughy" look). Channel heads by valley spacing (`opts.headWidth`,
  survey `--hw`) and a rough start (`--rough`) were tried and changed little: left as switches, off.
- **Channels read as lines** (b1b87fa): a channel running diagonally across a level's cells was read
  between them as a row of saddles (two floor cells, two bank cells blended): beads along every valley
  that the next level's water ponded in, rungs along the valley walls ("ladders" in the survey views,
  "a chain of lumps" in the game). Now `RefineReader.creekAt` also gives `cwc` (how steeply a channel's
  banks rise), and near a channel the ground is held to a V from the line: the next level's starting
  surface (localsim.js, channels of 10+ parent cells' water) and the sampler (terrain.js, 30+ cells).
  Reading every rill as a line scratched the ground with short dashes: hence the thresholds.
- **Tile seams** (3f2a577, 60093b7): the tile blend weights now reach zero at both ends of a tile's
  readable window and sum to one across an overlap (a 1/48 step left a dark straight line); the detail
  a tile level holds fades with the level's coverage instead of switching at a line (raised slabs).
- **Tiles sooner** (the last commit): GPU tile sim batches 8 steps between waits (a tile alone: 21 s ->
  6 s), wanted tiles ordered nearest-first across levels, two in flight. Ground under the camera at 10,
  21, 32 s for the three levels in a hidden test tab (was ~22 s for the first and a minute for the rest).
  `WorldSims.tileMs` keeps each tile's setup/sim/finish/wait ms (read it in the console).
- Air squeezed above a ~12 km knee by sqrt(LEN_SCALE) (4328686): from orbit the small planet reads as a
  planet with a thick sky, which Dave accepted ("daytime stars make sense from very high up").

**Overnight (2026-10-04, "fix refine and optimize", then "continue through the night"):**
- Fault throws, bed dips and fold amplitudes drawn by hScale; a belt is a belt by its real relief
  (geology.js). The summit's straight scarp is gone (survey eng_coast spot 2).
- The refinement's shore as a line (localsim.js finish): the wave rules decide each cell, and stepped the
  ground between them; now a +1/-1 field blurred over a cell crosses zero along a smooth coast and the
  cells near it slope through zero along it. Reef coast views: eng_reef vs sol_eng. TILE 40.
- The crater record read where each crater falls (craters.js latticeCraters: the cell draws at the most
  the record gives anywhere in it, each crater kept by the record where it lies) and blended between the
  world sim's cells (SnapshotSampler.crat): a resurfaced plain's edge was a staircase of lattice cells
  (Venus's peak view). TILE 41. Venus check: scratchpad venus_edge.
- The big ships' orbit offsets scaled with the drawn size (game.js FLEET_K). Smoke test at the new size
  in a hidden tab: opening orbit 62 km up, tender/carrier at 64/94 km, orbit at 15 km, entry at 3 km, no
  NaNs; days 2.99 h.
- The SOL suite at the new size (scratchpad sol_eng, 8 worlds): all read as before, scaled. FSPB-8DTW's
  start moon (R 35 km) too.
- Pass counts are not slack: PASSES 6,10,9 changes 43% of a tile's cells (up to 580 m) against 8,16,12
  (scratchpad passes.mjs). GPU time per tile stays ~6 s alone; a real gain needs merged passes in the
  shaders or routing every other step in all three sims, with a visual check.
- Not done: the chunk-rebuild storm (~140 chunks per tile), setup ~2.4 s / finish ~1 s per tile in the
  worker (creekAt ~180 ms, bedAt ~170 ms, parent.rockAt ~180 ms in Node). Mercury's "straight line" in
  the crater view is the mare's stamped wrinkle ridges (folds), concentric to the basin: by design.
  The survey's views beyond its single pyramid tile show that tile's edge (the game makes a 3x3).

- SOL suite at the end of the second night (scratchpad shots/sol_final.jpg): all eight read as before.
  Europa's views show groups of short parallel dashes aligned with the face grid (present before tonight
  too; not the folds, which follow great circles; not yet traced). Europa's chaos rafts are still 600 m
  drawn (terrain.js _chaosAt L), a size from the old tenth-size worlds.

- Random-world survey (24 new worlds from LAB-100..180, all kinds; scratchpad shots/rand/*.jpg, survey
  dirs rand0/1/2). Fixed from it: a sea-less world's playas (all a basin's sediment onto its one sink
  cell: Vovuld LAB-122:4 reached +1,428 km), rain on hot worlds (e^24 x Earth's at 1,240 K), melt pools
  as cell rectangles, tuya flanks (rectangular plateaus on icy worlds), hydrocarbon seas cut at a
  latitude, 0 m "peaks" as landmarks, ammonia-water frozen-ocean worlds labelled "barren rock".
  Not a bug: the 100%-sea "Temperate world with life" / "Ocean world" picks (Quepavraith LAB-140:2,
  Hakrar LAB-171:7, Coavre LAB-178:15, Lanern LAB-118:7) are planned that way by the system generator
  (2-50% water by mass, ocean fraction 1.0; Earth is 0.03%); the deep time follows the plan.
  Seen and not fixed:
  an ice-sheet margin on Saeverkion LAB-162:5 shows grid-stepped parallel grooves; Coavre's ice cap
  shows a straight line at 3 km.

- In-game renders (tools/scenic.js, d5fd0dc; sheet: scratchpad render_sheet.jpg): Earth, Seamibest
  LAB-110:5, Saeverkion LAB-162:5, Vovuld LAB-122:4, Opaediss LAB-134:16, Ludrionar LAB-118:10, each from
  space and at a landmark. Dave: "That's too much clouds, clouds don't cover the real earth like that".
  Fixed (90e4b8d): the noise behind the cover sits in a narrow band (half of it 0.657 .. 0.705) and was
  read by thresholds 0.6 .. 0.8, so every point was about a third covered, a veil over the whole globe.
  Now one `cloudCover` (atmosphere.js) for the far shell, the near volume and the ground's cloud
  shadows: the noise spread to the thresholds, its weather systems a fraction of the radius (`CLOUD_K`:
  fronts a quarter of it across) and drawn out east-west, each octave faded to its mean where a pixel
  spans its texels (no speckle from orbit), the climate's cloud map about its own mean (`uCloudMapMean`;
  the world's cover sets the amount). Measured as the share of the lit disc that clouds brighten
  (clouds off vs on): Earth 30% side-on, 29-53% face-on by longitude (mean 43%); Seamibest (cover
  0.42) 28%.
- Dave: "Fix and make it better" (03737f8, f5b21bc, d393ca8; sheet: scratchpad render_fixes.jpg):
  - Dark dashes along the skyline: the half-res sky traced each fragment's ray through its 2x2 block's
    centre but read one of its four depths, so where a horizon crossed a block a sky-labelled sample took
    a ground-length path (dark) and the sky pixels beside took it up. Now ray and depth come from one
    full-res pixel (`depthPixel`, glsl.js) in the sky, the volume and the composite; a pixel with no
    sample at its depth takes the nearest of 16. Any dashes left are real: land over a 2.4 km horizon.
  - Vovuld's ring: the cloud noise was bound to the far sky only beside a near volume, and a sulfuric
    deck has none, so its deck read zero and was never drawn (the world a haze ball, the solid planet's
    edge a ring). Bound always now; Venus-likes show a pale yellow deck. `cloudBias`: cover 1 closes a
    deck, 0 clears it (the middle unchanged); the deck's tops thin with height (soft limb).
  - Hot worlds glow: `blackbodyGlow` (Planck through the eye's response, 256 cd/m^2 at 1,240 K, game
    radiance 1 = ~127,000 cd/m^2), `uThermal` from Tsurf (>650 K) with the dry adiabat (ground by real
    height, air by drawn). Ground emits (1 - albedo) x glow; each air step adds glow x (1 - its
    transmittance), taken one optical depth in (at the jittered sample it dithered). Vovuld's surface
    is an orange oven, visibility a few hundred metres. Not done: the ground doesn't reflect the air's
    glow (so it reads darker than the air: physically all would be near one brightness); day/night T
    on thin-air hot worlds; the lava's own (tuned, ~170x physical) glow left as it was.
  - Aurora from orbit drew as rows of dots (a curtain thinner than the ray's run between its 28 shells):
    each sample's arc widened by that run and the pixel, its light kept.
  - Plants: shrunk into the ground over their last 30% of range (the screen-door dither left dark
    specks) and in the clouds' shadow (`cloudShadow`, shared with the ground).
  - Ground cover patches came from the 64 m detail tile alone and from a km off read as a lattice of
    spots; 512 m tile's patches beyond ~500 m, both moved by the 4 km tile (one more tri() per pixel).
  - Half-res sky upsample: depth weight with a 2% tolerance (cloud edges came in 2-pixel steps).
  Seen, not fixed: beach sand lies only on gentle slopes, so every rill's banks on a beach show as dark
  soil streaks (Seamibest's Iophoaris Sands); trees end in a disc at 1.5 km; the "cups" plants read as
  stumps; the far sky's jitter shows faintly as a hatch in flat skies.

**What's still wrong / next:**
- Snow covers most of a high mountain (the snowline reads the real height: physically right, maybe too
  white for Dave).
- Rock beds stay at their real thickness (tried scaling them with the heights, TILE 42, reverted in
  9713f52: true scale below the deep time means a 1 km mountain of 10 m beds is right, a Grand Canyon).
- The world sim's rivers carved into the refinement's start now at the drawn size (their wobble and
  widths were the old tenth-size worlds' drawn metres). TILE 44.
- The straight parallel gullies on an even mountain front (survey 3 km views): NOT the joints (off: same),
  NOT the world sim's one-cell valleys (filled before the run: same), NOT the refinement's run (off: the
  L+2 level cuts them too). They are what the tile sims cut on a planar slope: the deep time's surface is
  planar between its 500 m cells. Fixed by starting the refinement and pyramid a little uneven
  (localsim.js seedRough 0.3 by default where water runs, TILE 45): the gullies branch into networks.
  At 1.0 the start's bumps outlast the run (lumpy). Survey sheets: scratchpad shots/roughness.jpg.
- Each level's channels burned in as lines when it finishes (localsim.js burnChannels, TILE 47): a
  channel crossing the grid diagonally joined its cells corner to corner and the cells beside each joint
  stood as banks: a row of teeth along every diagonal channel (Dave's valley view: sharp spikes on the
  river banks; survey views: ladder rungs, grid-squared "staple" grooves). Ground within 1.5 cells of a
  channel (10+ cells' water) held to a V from its smooth line. Jaggedness down at every level (rms of
  each cell less its neighbours' mean: 5.1/3.0/0.63 m -> 3.9/2.4/0.47 m at 38/9.6/2.4 m cells).
  Not the beds, joints or dips (each switched off: the same grooves; `opts.beds false` stays as a switch).
  Bed dips and folds back at real size (geology.js; the fault throw stays drawn by hScale).
- Tile sims run 60 steps at twice the stream and creep rates (localsim.js, TILE 48): the survey's views
  alike at 8/3/1 km on Earth, Mars and Titan, the sim time halved (Node/wasm: refinement tile 7.4 -> 4.0 s,
  L3 6.7 -> 3.6 s, L5 12.7 -> 6.2 s). A chunk rebuild costs 10-15 ms (not the bottleneck).
- Rock contacts bent at every scale (TILE 51): the world sim's rock warp got a second, cell-scale part
  (snapshot.js rockWarp: 4 octaves from 1.3 cells' wavelength; its first part varies over ~14 km, so a
  contact ran straight along a cell edge for half a km), and each pyramid level reads its parent's rock
  about half a parent cell off true (localsim.js finish): the parent's staircase of cells bends. Delta
  views (scratchpad shots/delta_cmp3.jpg): contacts in lobes and tongues, no ruler lines.
- Tried and dropped: each tile level faded out by the mesh's spacing (to cut chunk rebuilds and aliasing):
  the finest level (2.4 m) wears down sharp cones the 9.6 m level leaves (L+4 has ~5.6% of its cells
  steeper than 60 degrees), and without it they stood in the middle distance. Every level is read at
  every sampling. The ground layer's youth isn't read by anything yet (no point calibrating it now).
- The survey's pictures are the yardstick: `STARSEED_LEN` env for Node (default now 1/64),
  `tools/survey.mjs --at lat,lon --scales 8,3,1 --px 640 --pyrCache 1`; the scratchpad's eng_* dirs hold
  this session's runs; `?len=0.1` in the game shows the old size.
- Older queue: ground-layer youth calibration, nutrient factor for life origin, life map through the
  last 10 Myr, the integer-vs-float gap's other half.

## NOW: true scale, the ground layer, life through history (session 39d69fa8, 2026-10-03)

Dave's asks: fix rivers inside canyons ("random noise is not interesting, but simulated history is"),
optimise generation; then a rethink of the whole pipeline. Decisions, in his words where possible:
- Keep the deep time (plates, climate, life) as it is; draw its gross features on a smaller planet but
  simulate everything below its grid at true scale (no 10x height exaggeration). "We want a world to look
  locally real, and have interesting features, and look convincing from space."
- "We don't want things looking like moons": fake bigness from orbit (atmosphere squeezed above a knee);
  "we still want moons nicely visible and sized in skies" (one global LEN_SCALE keeps angular sizes).
- The integer tile sim is canonical; judge terrain changes with a SOL suite of worlds.
- Long term: pre-generated compressed world packs, seamless descent, shareable links with notes, a catalogue
  of the land for later life/civilization sims (memory: world-packs).

**Committed this session:**
- 802f469 survey `--pyrCache 1` (pyramid tiles kept on disk: redraws after sampler changes in seconds).
- c4f1f67 (SIM 57) life and climate through the history: the life map advances every 2.5 Myr through the
  plate stage in the climate of the time (rerun every 25 Myr with the history's T, P and plant cover);
  erosion takes that time's rain pattern and plants; spread by stage (spores slow over land but far on
  the wind, seeds, animal-carried, flyers), faster onto richer land; die-offs strike as they happen.
  Muriogleaks (LAB-95:3, plants 80 Myr old): plants reach 1-2 continents not all (15% cover vs 41%), the
  bare ones turn desert. Cost ~+20%. Note: erosion couples into the plate sim, which is chaotic: any
  change to rain/plants rearranges the continents (A/B comparisons are different samples).
- d7f6976 (SIM 58) the ground layer (src/gen/worldsim/ground.js): per world cell, simulated through both
  stages: local relief (toward what the wear holds by rock; valley glaciers deepen, ice sheets scour),
  youth, valley spacing (creep vs channels; plants widen it), grain (belts' trend, ice flow), glaciation.
  In the snapshot (gLr, gVsp, gYouth, gGx, gGy, gGlac; SnapshotSampler.ground). Youth reads "old" almost
  everywhere: needs calibrating against each world's own range.
- 494dde0 survey `--trueScale 0`, `--heads N` (own caches).
- 76a2c8b tile-sim switches, off by default (history replay, jittered cells, water spread on slopes
  (ROUTE.mfd), channel heads, creep substeps, seeded roughness, trueScale).

**Uncommitted (in the tree):**
- True scale as the default (localsim.js `trueScale`, terrain.js sampler detail from the ground layer,
  gpu/itile.js `hardTables(kd0, scK)`: collapse angles by cell size, bit-identical JS/C/GPU via the shared
  table; TILE 33). Relief each level adds is held to the ground layer's local relief at real scale (rms
  over 20 km ~ lr/2, H <= 0.55). On the float sim it gave the first convincing mountains at 12/3/1 km.
- The integer sim cuts ~3x deeper at its cells' scale than the float sim at every level (1.1 km, 284 m,
  71 m; measured, not collapse, not the fill), so at true scale its valleys turned into a grid of straight
  N-S/E-W slots (also faintly present today). `INT_CUT = 0.33` (opts.intCut, survey `--intCut`) brings it
  in line with the float sim, but the integer sim is canonical: whether that stays is being decided by
  the SOL suite (running: scratchpad sol_today vs sol_ts; Mercury, Venus, Earth, Mars, Moon, Io, Europa,
  Titan). Root cause not found (candidates: its water build-up over steps, 8-pass local lake fill, draws).
- Rivers on explicit channels and canyons cut along them (src/gen/channels.js new; canyon.js rewritten:
  walls from the rock column worn back by softness x exposure time, volume-fit in closed form, slip-off
  slopes inside bends; terrain.js `_refRiverAt`, `_canyons` as fine-minus-coarse detail, a lower envelope
  over records; meanders.js migration rates). Better than 8bf9fc2 (the canyon follows the river, heads
  taper) but a few straight seams remain; the plan is to write rivers into the tiles instead.
- Upper atmosphere squeezed (bodies.js `atmoAlt`/`atmoReal`, knee max(12 km, 1.4 H), above it x
  LEN_SCALE; render/atmosphere.js uKnee/uUpper and cloud altitude; sim/universe.js air density). Earth's
  air now tops out at ~20 km drawn. Not yet looked at in the browser.

**What didn't work (so nobody retries it blind):** history replay of the world sim's last 10 Myr into
the refinement (almost no difference); water spread on slopes and jittered cells (little difference at
the refinement; plates diverge if applied to the world sim); higher channel thresholds and more creep
(combs become blank slopes); running tiles 10x longer to equilibrium (combs deepen or vanish); starting
roughness alone (more texture, still parallel). The cause: each level ran on a smooth copy of the level
above and made features at its own grid scale; true scale plus the ground layer's relief fixed the look.

**Next, in order:** judge the SOL suite and settle INT_CUT (or find the integer sim's root cause); commit
true scale; check the atmosphere in a test tab (message XBox Work first); same seed at 1/20 drawn size;
rivers written into the tiles (retires the overlay seams); calibrate the ground layer's youth; a nutrient
factor for life's origin; run the life map through the last 10 Myr too.

**Tools:** survey flags above; scratchpad scripts (this session's, may not survive): methods.mjs (one tile
several ways), l5test.mjs (a 71 m tile on cached parents), kcal.mjs (int vs float relief per level),
step1.mjs (int vs float after N steps), lifehist.mjs (today vs life through history), groundmaps.mjs
(ground layer maps), replay.mjs, compress.mjs / decodecost.mjs / finecost.mjs (pack size and cost).

## NOW: rivers and canyons (session 109eda38, 2026-10-03), committed at 8bf9fc2

Dave's asks this stretch: cliffs you can land near or fly through, all at true scale (each level of
detail a filtered view of the same ground, nothing exaggerated, no popping); then "the rivers are
non-contiguous with obvious seams". Full notes are under Simulated worlds: "Rivers made
continuous" and "Canyons".

- **Done and verified on survey maps (not yet in game):**
  - rivers are continuous on Thugroadath (LAB-44:5) and Ishiodreill (LAB-30:4); Earth is unchanged;
  - canyons appear in dry plateaus: walls from the rock column, volume matched to the coarse
    levels, tapering at river ends. They're modest now; granite valleys stay V valleys.
- **Open, in order:**
  1. **River heads.** Dave: "Should it just like...end like that?" No. A river appears at full
     width (~50 m) where its catchment passes RIVER_A = 1e8 m², a blunt blob with nothing feeding
     it; creeks only draw on tiles with cells of 60 m or less. Plan:
     - taper the width over the first record or two;
     - extend a thin stream upstream along the refinement's fl/rcv below the threshold;
     - make sure pyramid creeks join it.
     See -40.764, -31.155 on LAB-44:5.
  2. **Canyon leftovers** at the sandstone site (-40.77, -31.18): one stray wall arc, and a dark
     diagonal seam by the river head.
  3. **In-game check** of rivers and canyons with the chase camera: test tab, `?workers=2`, message
     XBox Work first.
  4. **Earth's great rivers** show angular corners at 12 km: refine.js bigChannels thins its trace
     to every other point. Great rivers also get no canyons yet; next is entrenched meanders along
     the big segments.
  5. Canyon cost is ~+1 µs per sample near dry canyon rivers (3.3 vs 2.3 µs).
- **Tools:**
  - survey.mjs `--at lat,lon/...`, `--pyr 0` (refinement only), `--pyrN 3` (3x3 pyramid tiles),
    `--scales`.
  - Survey cache (SIM 56, TILE 31) for LAB-44:5, LAB-30:4, SOL:3, SOL:4, SOL:18 is in this
    session's scratchpad `cache15`, which may not survive; rebuilding a world costs about 1-2
    minutes with 4 threads. Ask XBox Work before heavy runs, and say "Starseed done" after.
  - Diagnostics, also in the scratchpad: xsec.mjs (cross-sections), rivmap.mjs (which river the
    sampler takes), jog.mjs and seam.mjs (trace the channel and record choice), cbench.mjs
    (sampling cost).

## NOW: the refit fleet and the turbolift (session 109eda38, 2026-10-02 late), committed

Dave: "Ok fix any inconsistencies and do the work we had talked about. If you don't know what to do;
import the new models. The carrier has changed especially and has a turbolift I want working", then
"There's meshes for the turbolift and such now".

**Models.** Dave's refit lives in his open Blender file (~/aackpnt-craft-redesign.blend; never save
over it).
- `tools/blender/export_refit.py` writes the Bastion scene to assets/models/bastion.glb, the Craft
  scene to craft.glb, and a copy of the file to assets/blender/fleet-refit.blend.
  - Each file takes the active scene only. Before this, craft.glb's default scene was the Bastion
    one, so no craft would have loaded.
- glbShip finds the `yacht` and `pod` templates anywhere in the tree (the yacht now hangs under
  `bastion:dock_yacht`).
- Re-run these after the model changes (all in Blender, via MCP):
  - `hull_colliders.py`: the carrier's hull boxes, made by ray-casting the exterior mesh with the
    bays cut out → `src/sim/layouts/bastion-hull.data.js`.
  - `yacht_layout.py`: the yacht's deck, seats and hull → `yacht.data.js`.
  - `craft_layout.py`: every craft's hull from its mesh, plus the dropship's deck → `craft.data.js`.

**The carrier now follows the refit** (`src/sim/layouts/bastion.js`). Every room was diffed
against the model's room:* meshes.
- 1250 m long. Bays at x ±102..230, z −220..510, 34 m tall.
- Galleries and cross passages run out to the bays (pressure doors at ±96 and ±102).
- Seven pads per bay, at the positions painted on the model's floor: x ±192.35, z −111.65, −36, 28,
  92, 156, 248.5, 412.7.
- Hull colliders come from the mesh: 759 boxes. They have an x/z grid index (`boxesNear` in
  vesselTypes) so tests stay cheap (0.37 µs a query).
- Engines: six main nozzles of radius 12.5 at z 570; the bays' flattened nozzles at z 553. Radius 730.
- **Escape pods now launch dorsally** (from a tube top at y 30, up). The refit's hull reaches out to
  the bays, so the old flank tubes ended inside the hull. *Tell Dave:* the model has no pod hatches
  in the dorsal plating yet.
- The yacht boards by the transfer lift at z −235.

**The turbolift** (`src/sim/turbolift.js`, data in `TURBOLIFT` in bastion.js; from the model's
`bastion:turbolift_system` route, stations and preview rig):
- **Route and stations.** One car on a guideway at y 22: up to the bridge, aft to engineering, and
  across to shafts down into both bays. Stations: bridge (deck 1), engineering (deck 4), port bay,
  starboard bay. The spare car sits in its siding.
- **How a trip runs.** It's cut into legs at each change of axis, with a stop at each.
  - At a shaft junction the tongues move while the car stands: horizontal ones slide 3.25 m apart,
    vertical ones rise 5.2 m. Both are animated from state, as Dave's drivers do.
  - Before each leg the car reserves that leg's blocks; the spare holds its siding.
  - Runs are exact trapezoids: 50 m/s at 6 m/s² along, 12 m/s at 4 m/s² up and down (tunable in
    `TURBOLIFT.run`). Starboard bay to the bridge takes about 44 s.
- **Doors.** Landing doors open only with the car there, and together with its doors. The doorway is
  walkable while both are open. They won't close on anyone in the doorway.
- **Riding.**
  - Riders are carried (`RoomInterior.carry`) and kept to the car (and its doorway at a stop).
  - In the bays the shafts are solid. The car's own space is walkable only while it stands there
    with its doors open.
  - **F at a landing** calls the car. **F in the car** opens the panel app (src/ui/apps/turbolift.js;
    keys 1–4).
  - The car has its own lamp, boxed to its cabin (LightRig extras can now carry a host box).
  - Wayfinding routes through the turbolift when that's the shorter way.
- Verified in a test tab: called, walked in, rode starboard bay → bridge, walked out onto the
  bridge. Engineering and the port bay were served in turn. A Node walk test covers the shaft walls
  and doorways.

**Refit craft:**
- **Yacht:** the Jupiter 2-style family yacht.
  - Its oval main deck is rasterised from the model: one room, with walls and furniture as solids.
    The cockpit's platform and steps are solids you stand on.
  - Docked, you come and go by the dorsal hatch over the hub; landed, by the port airlock.
  - The airlock doors are interlocked, and the outer one stays shut while docked. The garage
    pressure door is a sliding door too.
- **Lifter:** the refit cabin (two seats up on the flight deck, berths, galley, WC); rocket pods in
  its hull.
- **Dropship:** a 7.4 m bay and a 7.6 m ramp. The tank drives in and Y locks it to the mount at the
  model's dock point.
- **Tank:** the wider hull.
- **Walking:** anything up to 0.36 m high is now a stair you step up onto.

**Not done yet (refit):**
- The yacht's ramp and garage sequence; deploying its hover runabout.
- The carrier's transfer-lift and dorsal-hatch animation.
- The spare car in service, and more cars.
- Calling a destination from a landing.
- Tank optional guns (that collection isn't exported).
- The rigged astronaut as the walking avatar.
- The lifter's tilting rocket pods (static now).

## Simulated worlds (session 109eda38, 2026-10-01/02), committed as it went

**Latest (2026-10-02):**
- **Water:** lakes and rivers are real water (you wade and swim; your eyes stay above the water).
- **Simulation:** one sim per world, sized by radius (N 288 for an Earth; worlds never change once
  made); two sims in parallel; a world-sim progress line.
- **Render:** smoothed, warped cloud maps; aurora and airglow from each world's field, wind and air.
- **World features:** tuyas where hotspots erupted under ice; flora from the life map; moons'
  eclipses in their climate.
- **Catalog:** named landmarks.
- **C/WASM:** kernels (native/sim.c), bit-identical to the JavaScript.

All are recorded in WORLDSIM.md (step 7, items 6, 16b and 18).

**Terrain below the world sim's grid (2026-10-02, later), all committed:**

Dave's rules:
- "history, not noise" (memory: history-not-noise).
- No grid-size minimum feature.
- Terrain "tunable by fractal dimension like real coastlines and mountains", without looking like noise.

What's in:
- **The tile sim (`src/gen/localsim.js`):** one sim, three kinds.
  - `refine` covers the whole world at ~4x the world sim's resolution.
  - `pyr` makes finer levels, 4x each, around the camera, each on the level above.
  - `region` and `local` add structure (beds, faults, joints) and are headless only.
  - The history:
    - stream power, with channel heads by place;
    - creep, and collapse to each rock's angle;
    - an ice-age low sea, then its rise (drowned valleys);
    - waves, and longshore drift on soft shores;
    - rock read as a stack at each height, with deposits in the lows and alluvium.
  - Fractal hold: each level's added relief is held to H by place (roughness by place).
- **The integer GPU sim:**
  - `src/gpu/itile.js` is the integer reference.
  - `src/gpu/itileGPU.js` is the WebGPU version, bit-identical to it (`tools/gputile.html` checks).
  - It runs a 608² tile in 0.8 s.
- **Refinement (`worldsim/refine.js`):**
  - Runs after each world's sim on a dedicated GPU tile worker.
  - Cached in IndexedDB (`TILE_VERSION`).
  - Shared with the terrain workers as SharedArrayBuffers. The dev server sends COOP/COEP headers for this.
  - Read as smooth cubic fields.
- **Pyramid (`src/sim/terrainTiles.js`):**
  - Tiles are wanted when the camera can resolve them.
  - The generator blends the levels by coverage.
  - Only the chunks under a new tile are rebuilt.
  - The descent waits for the tiles.
- **Coasts and contacts:**
  - Coasts follow the ground's contours (no stair-steps).
  - Rock contacts are a stratigraphic stack with blending on even ground.
  - A dry world's rivers and lakes are empty.

**Later the same day (Dave's /goal: "make it better and better yourself. faster, looking better",
surveying many worlds; bit-exact across runs and clients, not across revisions):**
- **Geology in the pyramid:** each region's structure (folds, dip, faults, joints) and rock columns
  per suite, read each step at the cell's height (integer sim too: `geo` tables), so cliff bands
  stand where hard beds outcrop.
- **Creeks:** drawn from the finest pyramid level's own drainage (`fl`, `rcv`), as curves.
- **Speed:** world sim ~34 -> ~23 s (Opast); refinement 222 -> ~30 s; volume chunks 16.8 ->
  11.3 ms; refinement jobs are one tile each, sim workers take pyramid tiles first, the snapshot
  goes to each worker once, and a tile's arrival rebuilds its chunks once (debounced).
- **Craters at every scale (`src/gen/craters.js`):** the world sim's grid keeps only craters 16+
  of its cells across (`impacts.js craterFloor`); each finer level stamps the band its cells hold
  (10+ cells) as exact round profiles (bowls; flat floors and peaks when big), worn by age over
  size squared. Their number is the world's crater record by place (snapshot `crat`: the
  bombardment since that ground was last flooded or resurfaced), placed by a hashed lattice on
  the cube faces (the same craters for every tile and client). Barren and stagnant-lid worlds.
  Each crater's form comes from its impact (`craterForm`, the world sim's too): the angle (P ~ sin
  2a) and heading give lopsided ejecta and a lower rim uprange (long craters when grazing); rims
  slumped in scallops, outlines squared by joints, wandering terraces, central peaks as knobs.
  Dave: "Those big craters are too perfect" (perfect rings before this).
  Craters excavate (Dave: "as if they are always impacting a flat plane"): inside its cavity a
  crater replaces the ground (its floor level at the ground's mean there; `excavation`), its rim
  and ejecta built on the ground, oldest first. Only the refinement stamps its octaves; every
  finer octave is drawn by the sampler (`CraterField`, the same hashed lattice, cached per
  worker, each octave faded in where the sampling resolves it: no square of extra craters where
  the pyramid's tiles end; a crater's floor sits on the ground as bigger craters left it). Young
  craters (~12% of the record) throw bright ejecta and rays (S_RAY), each crater's own, where
  the air is thin (< ~0.05 bar). Ejecta blankets mute the older relief round a young crater out
  to ~2 radii, draped on the ground's slope (`excavate`, `groundPlane`). Craters 15+ km (real)
  throw secondaries: chains and clusters 2-5 radii out, small and shallow, worn by their size.
- **Airless worlds:** no climate means no rain: the tile sim runs no streams there (CPU and GPU
  skip routing and stream power, bit-identical; ~2x faster) and no fractal hold.
- **Dry worlds:** with no liquid there is no sea (snapshot `sea: false`): ground below the datum
  stays as deep as it is (was flattened to the datum and treated as sea, waves and all).
- **Icy shells:** cracks are kept as arcs (snapshot `lineae`) and drawn as smooth double ridges,
  each level at the width it holds (`stampRidges`), sharpening to the real width.
- **Refinement's start:** the world sim's surface read as a cubic B-spline (no bilinear facets, no
  stair-stepped one-cell valleys); the world grid's samplers read across face edges (no seams).
- **Determinism sweep:** Math.hypot/exp/sin/log/asin in generation replaced by dmath.
- **Dunes (`src/gen/dunes.js`):** Werner's slab model (lift, hop downwind, settle, lee shadow,
  avalanche) run on two periodic patches (barchans; transverse ridges), once a process, carried
  in desert worlds' snapshots. The sampler lays them over the world sim's sand seas (snapshot
  `dunes`, smoothed so lone sandy cells stay sheets), turned to the trades / westerlies / the
  substellar wind, shifted cell to cell so the repeat doesn't line up, faded in by resolution.
- **Bare airless rock:** snow needs water (a water cycle or an ice inventory); maria are basalt.
- **The sea is the world sim's sea** (snapshot `ocean`): a closed basin below the datum is dry or
  a lake (Opast's salt pan was drawn as deep ocean).
- **Maria** fill the lows (snapshot `mareLv`; the contact rule lays their basalt in the lows near
  a mare, so its edge embays craters instead of tracing cells). No alluvium on airless worlds.
- **Grid-row ridges (fixed):** the plates' frame grids map many world cells to one frame cell
  where a plate has barely turned, and collisions' thickening and impacts were applied once per
  world cell: a frame row shown by two world rows grew twice, a dead straight ridge along a grid
  row (Opast's salt lake). Now shared among the world cells showing each frame cell. Worth a
  look: Dorith (LAB-5 5) has a straight N-S coast near 156E (a young rift margin, or not).
- **Shallow lakes showed the pyramid tiles' edges (fixed):** the water's shading dimmed by a
  fifth in a step at 3 m deep, so a lake near 3 m deep showed every small change of its bed as a
  hard edge (a pyramid tile's bed sits ~1.4 m off its parent's: talus off the shores; and the
  bed's own fine relief, as sharp blotches). Now the dimming fades in over 0-3 m.
- **Thick air and craters (SIM 16, TILE 16):** the air's cut goes by its mass per square metre
  (pressure over gravity: `impacts.js airCut`, ~30 m real under Earth's air, ~1.3 km on Moadeal),
  and above the cut it lets through only a share (`craters.js airKeep`: 1 - exp(-(D/10 Dair)^2),
  ~6% of the craters 3 cuts and up, a third of those 10 cuts and up), in the world sim's draws
  and the lattice's alike. (An overturn resets only the plains it floods: Dave, "It should only
  reset the parts it covered"; Moadeal's crowded highlands are its young system's late
  bombardment.)
- **The Solar System (seed `SOL`) and atmospheric physics fixed by it (SIM 23):** `?seed=SOL` is
  the Sun and its eight planets as they are (orbits, masses, make-up: system.js `SOL`), all else
  the same physics as any system (moons generated). Its Mars came out 0.54 bar, Venus 14, so the
  history model (evolve.js) was wrong; Dave: fix the physics, don't pin. Now:
  - escape is a flux (bar/Gyr, shared by the air's make-up), not a fraction of the air: a thick
    air loses little of itself, a thin one all of it; CO2 frozen in caps is drawn up to be lost;
  - heavy-gas escape fades with the star's X-rays/UV (t^-1.2, ~100x at 0.1 Gyr; no floor), and
    past r = S XUV / Scrit ~ 0.4 rises steeply (the upper air flows off: Tian 2009, early Mars);
  - a world too small for plates has a stagnant lid from the start; lid outgassing is the
    mantle's own carbon (0.25 of plates'), falling as heat^2 once it cools;
  - the polar cold trap is a share of the mean temperature (9% in a bar, 30% at a few mbar):
    CO2 and N2 freeze out of thin airs (Mars' caps; Pluto's and Triton's thin N2);
  - snowballs need air to carry water (end below 10 mbar, start above 30);
  - greenhouse lines broaden with pressure (x P^0.35: Mars' 6 mbar a few K, Venus' 92 bar 737 K);
  - weathered carbon is kept as carbonate rock and baked back out on a hot surface (Venus);
  - a magma ocean breathes out a third of the carbon at once (was capped at 4 bar);
  - cold dry or frozen regolith holds CO2 in step with the air (Mars' ~0.04 bar).
  SOL now: Venus 51 bar 794 K, Earth 0.7 bar 286 K, Mars 3.9 mbar 221 K (`mars` air, cold
  desert). Over 60 draws: Venus 28-97 bar (median 58), Earth 0.55-2.2, Mars microbar to 16 mbar
  (Mars-like in ~a third: it's on the shoreline). Population (1120 worlds): habitable-temperature
  N2 airs 39 -> 78, cold icy worlds' thin N2 frozen out, greenhouse worlds hotter (median 795 ->
  1167 K). Moadeal (Dave's start world): 57 bar 612 K -> 190 bar 1184 K (its surface would glow).
  Venus is ~60 K hot for its pressure; next: the other known rocky worlds (the Moon, Galilean
  moons, Titan, Triton, Pluto) as presets to check against.
- **SOL's moons and radii (SIM 28):** SOL has its real moons (the Moon, Phobos, Deimos, the
  Galilean four, Enceladus, Rhea, Titan, Titania, Oberon, Triton: real orbits, masses, make-up;
  Titan's thick air known, Ganymede's and Callisto's absence of one). They showed: radii 17-46%
  too big for small worlds (R ~ M^0.27 for all), now uncompressed density from make-up (iron,
  rock, ice by volume) times self-compression 1 + 0.35 M^0.6: every SOL world within a few % of
  its real radius; Europa labelled volcanic (icy only past 20% water): icy past 4% water
  (`ICY_WATER`, a shell tens of km deep), checked before volcanism. Thin-air frozen water covers
  only its cold traps (Mars' caps, ~5% of the area at 16 mbar, poleward of ~70 degrees). Rays
  only on worlds with next to no air. On a dusty world exposed rock wears the dust's rind.
- **Heat transport (SIM 32):** the climate's poleward diffusion was 0.2 sqrt(P) W/m^2/K, about
  half what energy-balance models fit to Earth's gradient: SOL's Earth ran 40 C at the equator
  and -47 C at 80S, ice to 50 degrees. Now 0.5 sqrt(P): 33 C, 0 C at 60N, -18 C at 80N (real
  -18), ice poleward of ~65-70 degrees. Every plate world's climate milder toward its poles.
  SOL's Earth's life started late by its own draws (1.4 Gyr ago, no land plants): bare land.
- **No special-casing (Dave, 2026-10-02: "Don't special-case Mars, make it arise from first
  principles... you can tune the algorithms... but don't just make up a wet history"):** SOL's
  worlds carry only inputs (orbits, masses, make-up, spins); their dichotomies, volcanoes,
  canyons, palettes and airs come from the same physics and draws as any world's.
- **Titan's air by mechanism (SIM 48, evolve.js):** a cold icy world keeps a nitrogen-methane
  air where its nitrogen came as ammonia in cold-formed ices (teq under ~100-125 K) and its
  impacts came in slowly enough to build an air rather than erode it: impact speed from the
  comets' approach (0.42 of its orbital speed round the star), a giant host's well (3 v_orb^2)
  and its escape speed; kept under ~4.6x escape speed, lost over ~5.8x (Zahnle et al. 1992).
  SOL: Titan 1.48 bar 97 K every time (real 1.47 bar, 94 K); Callisto (6.3x) and Ganymede
  (7.2x) airless. Population: 24% of cold worlds over 1500 km, 14% of cold moons.
- **Titan's haze (SIM 50, stagnant.js `haze`):** a titanish world's photochemical organics fall
  out (Titan ~80 m a Gyr at 1% of Earth's sunlight, by its sunlight: Lorenz & Lunine 1996) and
  are washed and blown into the lows, filling crater bowls toward the ground round them; where
  ~200 m deep the crater record restarts. Effect: Titan's crater relief -18% small scale, -12%
  large (shallow craters, as Titan's are). **Open:** Titan still keeps far too many big craters
  (real: a handful over 50 km, a 0.2-1 Gyr surface). Haze alone can't erase km-deep bowls;
  methane-rain erosion over more of its history than the model's last-Gyr window, or relaxation
  in warm ice, would; the rain's crater reset is still a threshold (rk > 0.2), not cumulative.
- **CO2 caps (SIM 48):** the condensation's polar cold is reckoned as the high-tilt test's (they
  disagreed: caps froze and sublimed by turns every step); near its frost point an air still
  collapses and comes back with the tilt's swings (a coarse stand-in for Mars' obliquity
  cycles), told once per 0.5 Gyr. SOL Mars 8.9 mbar, 206 K.
- **Iahahound airless is right:** 0.22 Earth masses (6.7 km/s escape) at Earth's sunlight from
  a 0.45 M_sun M dwarf, active ~3 Gyr: its upper air flows off (heating/hold ~2) through that
  youth, and its weak volcanism can't rebuild one after (the cosmic shoreline).
- **Early Mars from the physics (SIM 44, TILE 24), evolve.js:**
  - the young Sun strips a small world's first air (hydrodynamic onset); its volcanoes rebuild
    one: stagnant-lid outgassing 0.08 x heat^2 (capped at 4x: the young hot mantle) of a plate
    world's (juvenile carbon only; Mars ~0.25 bar since 4.1 Ga in estimates);
  - a frozen world's outgassing all goes to the air (the 30% to sea carbonates needs liquid);
  - a planet's tilt wanders (no big moon to steady it): at high tilt its CO2 caps sublime, and
    if the air, once up, keeps its poles above frost it stays (collapse hysteresis);
  - snowballs only from open water a step before (no global ice on an already-frozen world);
  - warm spells: below freezing in the mean, but a thin air's afternoons and summers run ~60 K
    above it; with a few tenths of a bar melt lasts and flows: a little rain (the share of time
    warm enough x melt's rain), and carbonate weathering by the same land law at 275 K;
  - the regolith's adsorbed CO2 settles in balance with the air each step (it flip-flopped).
  SOL's Mars now, from all that alone: stripped by 0.05 Gyr, caps release ~0.4 Gyr, 0.2-0.28
  bar with warm-spell rain 0.4-3 Gyr (Noachian into Hesperian), thinning to 7 mbar, 205 K today
  (real 6 mbar, 210 K). Over 40 draws: median 3.7 mbar, quartiles 0.04-19 mbar.
  - world.js: the stagnant sim follows the history's rain through time (`rainAt`), and only
    lasting rain (> 0.2 of an Earth's) resets the crater record. The snapshot carries the past
    rain (`wetRain`: how hard while it rained) and its share of the time (`wetFrac`): on a world
    with no climate grid the tiles route that rain (it was a default 0.8 of Earth's: dry Mars grew
    an Earth's rivers) and cut at K0 x wetFrac. SOL's Mars: 0.6% of Earth's rain, 71% of its time:
    valley networks over its highlands (survey mars7). Titan-like methane: its window, rainK0.
  - refine.js riverIndex: the phase walk marks its path (was `stack.includes`, quadratic: Mars'
    long flat-ground chains hung the survey) and the smoothing walk is guarded (loops in links).
  - Mars' channels drew as dark stitched strokes from afar, three causes (terrain.js): the "wet
    ground beside a river" shading (S_WET) was set along every channel, even with no liquid now;
    a channel's banks were held at or above the datum (`Math.max(rv.hs, 0)`), so on a world with
    no sea a channel below it pulled its banks up into ridges (`_bankOf`: only with a sea); and
    a channel narrower than the sampling was drawn as wide as it (so a river shows from afar),
    which on a dry world made one-sample trenches that shade as beaded lines. A dry world's old
    channels are now valleys at their own width.
- **Survey 14 (14 worlds on SIM 45):** Earth, Opast, Europa, Moon, Ephai, Gliavekseth fine.
  Iahahound (LAB-6 2, was a Mars-like desert) is now airless (the new escape); Moadeal now
  190 bar, 1184 K (it glows); SOL's Titan airless and Callisto Titan-like (the coin toss).
  Io-like moons (SIM 46): repaved every few Myr, the crater record restarts everywhere
  (`paveAll`), only the lows flooded; their heights keep old basin-rim relief as blocks.
- **Greenhouse broadening saturates (SIM 47):** P^0.35 below a bar (Mars), P^0.22 above (bands
  saturating; fits Venus 92 bar ~737 K): SOL's Venus 50 bar 697 K, Moadeal 200 bar 1011 K (was
  1184).
  - Population (1075 worlds over 1500 km): habitable-temperature N2 airs 77 -> 88, others a few.
- **Known spins; Mars' caps (SIM 34):** SOL's planets carry their real day lengths and axial
  tilts (`known.rotH`, `obliquityDeg`, `retro`: Mercury's 3:2 spin, Venus' slow retrograde
  one; Mars had drawn 37.5 degrees and a 13 h day). Thin-air ice covers its cold traps only
  (~2% of Mars, caps to ~78-80 degrees; was 6%, to 69). The snow rule on a world with no
  climate grid finds its coldest from its own climate at the poles (was a fixed -90 C).
  Dust on a dusty world varies (SIM 35): thickest on high ground (thin air's winds can't lift it
  again), swept off low plains by the winds' broad pattern, dark basalt sand in deep hollows
  (crater floors): Mars' dark regions. SOL's Mars carries its ferric palette (`known.minerals`;
  it had drawn ochre).
- **SOL's rocky worlds, still to fix (2026-10-02 mosaic):** Mars' caps reach ~60 degrees (real: the seasonal cap to ~55-60 in winter, the residual
  caps far smaller); Io keeps cratered blocks (the 10% its resurfacing leaves: its mountains
  should be uncratered fault blocks); Venus' tesserae/plains are flat-shaded at world scale.
  Earth's water corrected to 2.6e-4 of its mass (it had two oceans' worth: one big sea).
  (Earth's ice and Mars' caps: fixed, below/above.)
- **Io, airless crusts, crater forms (SIM 31, TILE 22):** a rock moon its tides melt (tidal >
  0.6, lava) is repaved every few Myr (Io: 6 Myr; its mountains keep theirs): it had a full
  crater record and sampled at 108 us a sample, now 1.8. An airless world's old crust is ice on
  an icy world, regolith on a rocky one (was granite everywhere: Europa showed brown rock
  islands). craterForm's tables by angle addition over shared half-angle sines/cosines: 7.3x
  faster, the same shapes (to the last digits). The Moon sampled at ~43 us: the cost was each
  big crater's secondaries (~50 each), all tested by every point in its 5.5-radius reach (~4000
  tests a sample). Now each ray's cluster has a box tested first; each lattice cell keeps a
  bucket index of the craters that can reach each quarter of it (`_targ`); candidates are
  rejected on squared distance; continuous ejecta end at 2.4 radii (fading from 1.7; was 3,
  from 2). Moon: 16 us at 10 m cells, 5 us at 1 km (SIM 36, TILE 23).
- **Mars looking like Mars (SIM 25):**
  - a Mars-type world that once had water rusts (ferric/ochre dust, no grey basalt draw);
  - snow (the terrain's rule and the climate's ice albedo) needs air to carry water: in thin
    air it lies only where it's nearly as cold as the world's coldest place (the cold trap
    sets the frost point), the climate's ice albedo likewise (it treated all frozen ground as
    snow);
  - on a dusty world (dry, under 0.05 bar) dust blankets all but steep ground;
  - a known world carries its history (body.known; SOL's Mars: dichotomy, five giant shields,
    a great canyon), the same draws made either way;
  - a dichotomy's lowland fills with lava and sediment partway through the volcanic era, to a
    flat floor embaying what stood up; only the ground it covers starts its craters again.
- **Glaciers are a surface (S_ICE):** the ice was paint on the bed (every valley under an ice
  cap showing, its edge a smooth curve across the land). Now the ice fills the ground's lows to a
  level as much as it holds (`terrain.js`, after everything else): thin ice lies in the valleys
  on the ground's own shape (tongues down them, ridges bare); ice thicker than the relief lifts
  the surface into a smooth dome, ridges standing through; over the sea it floats (a tenth above
  the water); no rivers or lakes under 30+ m of it. The snapshot's ice is the sim's smoothed
  as a surface (6 passes of the bed plus ice over the ice; the sim's flux-based ice is thickest
  along its flow lines, a ridge on each otherwise) and capped near its edge by Nye's plastic
  profile (H^2 = 2 tau/(rho g) x; it was 3.5 km thick at the ice front). Checked on Opast's
  sheet (71N 102E) and a mountain ice field (-45, -107).
- **Channel heads at least three cells' worth (TILE 20):** at the refinement and pyramid levels
  a cell (0.5 km^2 on Iahahound) was bigger than a real channel head (~0.03 km^2), so every cell
  cut: rills one cell apart combing every slope (the dimple lattice). Now a level cuts only where
  at least three of its cells' water gathers (`AcC`); the finer levels cut the rills between.
  Opast's valleys keep their courses. Faults' traces (the straight double ridge on Iahahound's
  volcano) now bow gently and wander a little along their length (TILE 21; hashed per fault).
- **Ragged contacts below the grid's scale:** the world's rock cells are read a little off true
  (`SnapshotSampler.rockWarp`: up to ~0.9 cell, three octaves from ~4 cells), by the sampler's
  grid-level read and the refinement's rock rule alike, so a contact the cells would draw
  straight (a coral-sand beach on Opast against a column of cells) is ragged; and across a
  tile's margin the two levels' rocks blend by its coverage (`rockAt(.., below)`), so a tile's own
  deposits don't stop at a straight line.
- **Titan's seas at its poles (SIM 21):** the stagnant path had no sea mask, so every crater
  floor below the datum was a methane lake at every latitude. Now a methane/ethane world's datum
  is the level that holds its liquid share in the basins poleward of ~55 degrees (`ocean` mask in
  the snapshot), its low latitudes standing ~400 m higher, their basins floored dry. And the
  sampler's own craters (drawn after its dry-dip rule) no longer dig below the datum where the
  sea doesn't reach: the rule runs again after them.
- **Crater planes blew up refinement tiles (fixed, SIM 19, TILE 18):** a crater's ground plane
  (its floor level and the slope its ejecta drape) was fit to the tile's own cells under it; a
  crater a tile's edge cut left a thin strip of cells, the fit ill-conditioned, and its slope
  across the crater made relief of hundreds of km (Quaelyn LAB-5 11: a tile at 32767 m, bars
  and slabs on its map; tiles disagreeing at seams generally). Now the plane comes from the
  world's smooth surface at 13 fixed points round the crater (the same for every tile), and
  `groundPlane` refuses near-collinear points and caps the slope at 0.7.
- **Lakes by contour, not cells (TILE 17):** the refinement copied the world sim's lake cells
  (bed forced under the level in each, the whole square a lake) and every finer level inherited
  the squares (Dradriokae's Lake Vuzeksys, Heludriom's salt lake). Now its lake is wherever its
  smooth starting surface lies under the level, in the lake's cells and round them (held under
  round each lake cell's middle, so a one-cell lake stays); the sampler keeps a lake cell's bed
  under the water only where the tiles have the lake (their lake share). Natural shores now.
- **Contacts on even ground (SIM 18):** the sampler's refinement- and grid-level rock choice
  now weighs where the fine ground stands against the smooth surface (cover on the rises,
  basement in the hollows), as the tiles' did; and the starting cover's thickness varies at
  every scale (`world.js buildRock`), so where it thins out its edge is ragged. The long straight
  contact on Touveatar (19N 136E): its chalk cover thins in a smooth ramp (300 m to nothing over
  six cells) where erosion deepens evenly up a slope, so it runs out along a straight contour; a
  share of thickness can't move a pinch-out, so the cover also varies by +-180 m (SIM 22): the edge
  now wanders a few cells with outliers and inliers, but the diagonal trend remains.
- **Rock beds without the jigsaw (`src/gen/geology.js`, new):** a pyramid tile used the one
  region at its middle (its column, its planar dip) for the whole tile (up to 128 km), and the
  refinement outside it one rock per cell: each tile showed as a square of stripes, its edges
  and the regions' straight. Now each suite's column is the world's (`worldColumn`, windows to
  powers of two), each cell's bed offset and joints are the four regions round it blended
  smoothly (`bedAt`), and the sampler colours ground no tile covers by the same rule
  (`terrain.js _bedRock`), so the beds carry on past a tile's edge. Region structure reads the
  world sim's smooth surface (no nested sampling). Faults still come from the 3x3 regions round
  a tile's middle. Left: the world sim's own rock map has long straight contacts (Touveatar
  19N 136E, granite against chalk along a diagonal of cells), straight on even ground.
- **Shield fields (SIM 17):** after a stagnant-lid overturn, a third of the lava flows' vents
  and most coronae feed a field of small shield volcanoes (`stagnant.js shieldField`: its own
  rng stream, the world otherwise unchanged; snapshot `shieldFields`). The sampler draws them
  (`terrain.js _shieldsAt`): a hashed lattice on each field's plane sized to its biggest shields
  (~5-16 km real), most cells holding one in the field's middle, low domes (flanks of a few
  degrees, exaggerated as the craters), half with a summit pit, faded in by resolution. Moadeal
  has 29 fields (e.g. 52.85N 21.5E). Venus's tesserae are still to draw.
- **The climate grid read smoothly:** its fields (sea-level temperature, rain, the life map's
  cover / forest / open) are read as the cells' B-spline blend (`snapshot.js _gcRead`, the
  corners kept for the fields read at the same point): plant cover showed the coarse grid's
  squares from afar. Next: vegetation by the ground (wetter valleys, bare ridges, aspect).
- **Rivers from afar:** a river narrower than the sampling's spacing is drawn as wide as that
  spacing (its true width near), so far terrain shows it as a line of water, not as the few
  vertices that happen to land in it (dotted water, or none).
- **Sampler speed (bit-identical heights):** `faceUVFromDir` keeps its last answer (a sample
  reads many fields at one point; atan was 12%); `corners16` no longer allocates; the
  refinement's river curves and the great rivers' channel segments (groups of eight) are culled
  by bounding circles; the river's wet ground goes in the sample (S_WET) instead of a second
  river lookup in the shading. Dorith with its refinement: 21 -> 8.8 us a sample at 10 m cells,
  14.5 -> 7.1 at 100 m (scratchpad `sbench.mjs`; `hashcheck.mjs` compares heights between trees).
- **Survey maps were lit from the south-east** (bowls read as domes); now from the north-west.
- **Snow by aspect:** a slope facing the pole (away from the star on a locked world) shades as
  up to 8 C colder, one facing the sun as warmer (none at the equator): the snowline runs down
  the shady sides of ridges and pulls back from the sunny ones. The chunk and volume builders
  pass each vertex's normal to `shade()` (optional 5th argument).
- **GPU check still to rerun** on a fluvial tile (the hidden pane throttles the GPU too hard to
  finish one): the integer sim's code is unchanged on that path since its last check; the
  airless path (streams skipped) was checked bit-identical (Idaull).
- **Rivers from the refinement (`refine.js tileRivers / riverIndex`):** each refinement tile's
  cells with 1e8+ m^2 of water become smooth curves (halfway to the main inflow, through the
  cell, halfway on) with the ground along them, indexed by world-sim cell; the sampler draws the
  nearest (widths continuous with the creeks'). The old world-sim lines left the water in pools
  where the refinement's valley wandered off them. Tiles route water across flats by a
  distance-based fill and a slope-weighted draw (`flatK`, wander 2; native/sim.c rebuilt, bit
  for bit with erosion.js): rivers wind across plains instead of running along the grid's lines.
- **Rivers no longer draw dotted (2026-10-03):** a river's (and a creek's) distance was taken to
  the nearest of nine points sketched along its record's curve; between them (~125 m apart on a
  ~1 km record) it swelled past a narrow river's banks, so its water showed in dashes. Now the
  nearest point on the curve (eight chords, each projected onto: terrain.js `nearestOnCurve`,
  refine.js `creekAt`). Also: a wet river narrower than the sampling drawn 0.75 of the spacing
  each side (a diagonal line at 0.5 dotted), and a wet creek likewise, up to 4 times its own
  width (narrower than that, not drawn: no dotted lines).
- **Faster tiles (2026-10-03):**
  - The integer tile sim's CPU fallback (gpu/itile.js `runInt`, used by the worldsim worker when
    there's no WebGPU) is compiled now: native/sim.c `run_int`, the same passes in C, bit for bit
    (checked: refinement and pyramid tiles, 8 and 120 steps, against the JavaScript). A tile 38 s
    -> 7.7 s. It's called a step at a time (`runIntNative`): one long call stays in V8's quick
    first compile, while the steps after the first few calls run optimised (2x).
  - Refinement tiles keep each cell's rock-warp place (the float history 20% faster, bit for
    bit) and reckon the warp every fourth cell (setup 24% faster, TILE 28).
- **Survey tool:** `node tools/survey.mjs --out DIR --cache DIR SEED[:body] ...` writes each world's
  map and its landmarks at 400/60/12 km; the GPU check page takes `?seed=&body=` (runs the sim).
  It now runs the game's own integer tile sim (compiled), the refinement's tiles on `--threads`
  workers (tools/surveyWorker.mjs, default 4): a world's refinement ~270 s -> ~57 s, and bit
  for bit the game's (checked 2026-10-03: Ishiodreill's refinement, river index and two pyramid
  tiles hash the same in a test tab and the survey). `--float 1` runs the float sim instead;
  `--pyrIn 0` turns off the pyramid's inflow (for comparisons). Cache: one `ref-...-r29i.v8`.
- **Pyramid inflow (TILE 29, 2026-10-03):** a pyramid tile takes in the water coming from beyond
  it (localsim.js `pyrInflow`): where the level above's drainage crosses into its grid carrying
  more than ~400 cells' worth, it comes in a cell inside that edge and the edge there is shut,
  as the refinement's world-sim inflow does. The refinement keeps its drainage for this
  (`R.fl`, `R.rcv`: 2 bytes a cell more; stored in IndexedDB too); the pyramid's parents pass
  theirs. Integer inflow held under 2^30 units. The effect at Ishiodreill's gorges is small (the
  refinement already cut them); it's for rivers keeping their channels at every level.
- **Game plumbing (2026-10-03):** the refinement's river index is built from the tiles in tile
  order (was arrival order: clients could differ); a pyramid worker gets the refinement once
  (without the river index, ~7 MB on an Earth-sized world, which every pyramid job used to copy).
- **Rock rule (TILE 29):** in all three copies (snapshot.js rockAtWarped, the refinement's in
  localsim.js, RefineReader.rockAt) the height terms now scale with each rock's share, as the
  lows/rises term did: a rock entering the cells round a point (from weight 0) no longer wins
  at once on height alone along the cells' edges.
- **Straight coasts (SIM 53, 2026-10-03):** Ishiodreill (LAB-30 4) had a dead straight N-S
  coast at ~-4E, 10-28N; Lycauhaer (LAB-90 4) a straight N-S strait. Three causes in
  tectonics.js, all fixed (traced with scratchpad platetrace*.mjs / simmap.mjs, onPlateStep):
  - *Rift lines were great circles.* The wander fields (a cell-scale smoothed field, +-0.14 rad)
    were far stronger than their scale: they broke the line into blobs either side of the circle,
    which went as islands, so the margins left were the circle itself. Now fractal noise on the
    frame (0.8 x fbm, 6 octaves from ~30 degrees): bends about as deep as they are long.
  - *Welds left holes along straight lines.* merge() pushed each of B's frame cells to its nearest
    in A's frame; one turned grid onto another skips cells in a moire of straight lines, holes
    that opened as the plate turned on, as thin straight strips of new sea floor. Now each of A's
    cells pulls from B.
  - *Stretching continents grew by whole rings of cells.* The crust a continent frees was shared
    evenly among its margin cells, so a ring turned continent at once, again and again: a
    dilation by the grid's 8-neighbour square, which straightens any coast near a grid row or
    column (a meridian on the equator's faces). Now shared by the old crust's weakness
    (`weakW`, from wobble2): weak places stretch first.
  - Dorith (LAB-5 5)'s long straight N-S coast (~80 degrees of latitude, crossing face edges)
    stays: not the grid (check: a tidally locked world's terminator?).
- **Great rivers' channels (TILE 30):** bigChannels laid the meander trace along the river's line
  smoothed over two meander wavelengths (+-18 widths: +-14 km for a 760 m river), which cut across
  the valley's own bends: straight legs over the hills, kinked where they met (Earth's Ciadairon
  at 12 km). Now +-5 widths.
- **Rivers fade from afar (terrain.js `S_RFADE`):** a river drawn wider than itself so it shows
  as a line (0.75 of the sampling's spacing each side) fades out when that's 4-16x its own width:
  its channel shallower, wet ground paler, water blended into the ground's colour (shadeSnap
  shades the ground under it and mixes). Dave: "sure fade those rivers" (2026-10-03). World maps
  no longer veined teal; the greatest rivers stay faint at map scale and come in as you descend.
- **Impact rates calibrated to the Moon (SIM 54, system.js systemDebris):** the chronology *is*
  the Moon's record, so SOL's debris level is 1 (it was a random draw, x2.3: SOL's Moon had 2.3x
  its own record, Titan 4.8x); other systems scale by their giants against SOL's four (1.4 +
  0.2 x giants over 2.2) and their disk. Most systems' craters drop ~0.45-0.75x.
- **Icy shells relax (SIM 54, world.js shellRelax, barren.js relaxShell, craters.js shape):** an
  icy world's warm, soft ice flows under its cold lid, so relief wider than ~2 lids relaxes to 15%
  (a palimpsest). The lid: down the conductive profile its heat flow sets (k ~ 651/T, so T = Ts
  e^(qz/651); q = heatNow x 87 mW/m^2) to where the ice is soft (~216 K, 1e17 Pa s). SOL: Europa
  2 km, Ganymede 26 km, Callisto 111 km (its ghost basins), Titan 154 km. The grid's relief is
  relaxed every 250 Myr and at the end (blur at ~4 lids, minus 85% of it); the finer levels'
  craters by the snapshot's `crater.Drel` (drawn m). Titan's relief ~ +-10 km -> ~1.3 km (its
  511 basins over 300 km and the Mars recipe's dichotomy and giant shields were the excess).
- **Uthmir (LAB-86 1) investigated (Dave, 2026-10-03), SIM 54:** a 0.59 Earth-mass world 43 Myr
  old (its whole system is newborn), locked, 827 K, 27 mbar CO2, no water since birth. It looked
  bland: the barren path (dead moons') gave it a primordial crust, a quarter of the Moon's early
  bombardment (the chronology's first 43 Myr), and basins that flood 0.1-0.8 Gyr later (the
  Moon's timing): nothing yet. Its history, though, has it 'mobile' (evolve.js keeps any world
  under 0.2 Gyr mobile: too hot for a lid) at 2.4x Earth's heat with no water: physically a heat
  pipe (Io's way; the early Earth's, Moore & Webb 2013). Now (world.js `heatPipe`, barren.js
  `pave`): while the history has a world mobile and dry with heat > 1, lava pours out at
  1e4 m/Myr x (heat/12)^3 (Io's ~1 cm/yr at 12x), flooding the lows to the level that holds it
  (crater record restarting there) with vent lobes over them; a pipe still running leaves vent
  shield fields (snapshot shieldFields). Uthmir: 85 m of lava a Myr, 89% of it fresh basalt
  plains, the old cratered highlands standing above. And dust and soil take time
  (terrain.js `aged`, terrain param `ageGyr`): a world under ~0.3 Gyr has bare rock, so the thin
  dry air's Mars dust no longer blankets a newborn world's lava. Still: the plains are flat and
  near-black, too uniform close up (texture wanted: flow fronts, wrinkle ridges, more vents).
- **Titan (2026-10-03, SIM 54-55):** its world sim stamped 511 basins over 300 km (real Titan
  has one over 400 km) at 4.8x the Moon's rate, and the stagnant path's Mars recipe gave it a
  dichotomy, giant shields and a canyon. Fixed, from its physics:
  - impacts x2.1 (Saturn's focusing only: the debris calibration above); the shell relaxation
    (above) takes out its relief wider than ~270 km;
  - **its history keeps its air** (evolve.js): a titanish world's nitrogen is what its ammonia ices
    gave the air its impacts built (a drawn bar or two, moved here from bodies.js, which now takes
    the history's), and the generic escape law (the cosmic shoreline's, which stripped it in Myr)
    doesn't take it (Titan loses ~1% in 4.5 Gyr, Strobel 2008); its albedo is its haze's (0.265)
    not a snowball's; the cold trap scales with the air's column (liquids.js `coldTrapK`: Titan's
    poles ~4 K under its equator, not 25; Earth's and Mars' as before). SOL Titan: 0.71 bar, 96 K,
    ethane lakes, methane in the air;
  - so its methane era runs again (off since SIM 48): rain from an outgassing 0.3-1 Gyr ago
    (Tobie et al. 2006), and its crater record starts again then (stagnant.js `recordAt`): a few
    small craters, as Titan's 0.2-1 Gyr surface. (The methane rain no longer counts as an
    Earth's lasting rain that reset the record every step: rk is its own rainK0.)
  - its seas: a polar bowl (its poles stand ~120 m low) and liquid only poleward of ~55 degrees.
  - **Mountains, Xanadus, dunes (SIM 56, TILE 31):** its lid squeezed as its shell thickens
    (stagnant.js `contractionRidges`, Mitri et al. 2010): fold ridges 10-40 km across, east-west
    chains near the equator, 3-6 provinces packed with short ones (Xanadu's), scattered others.
    Kept as arcs (snapshot `folds`) the terrain's levels draw after their own history (craters.js
    `stampFolds`: the refinement whole, each finer level narrower; drawn into the grid they were a
    smear its haze buried, and drawn into a tile's starting ground its creep wore them away). The
    grid keeps where they stand close (`rugged`): bare ice there (bright provinces), regolith
    elsewhere. Dunes of the haze's organic sand (stagnant.js `sed`: where it washed in thick) in
    the dry low latitudes, off the provinces, the belt narrowing round them, dark brown.
  - Fixed on the way: with no sea (Titan's seas are under 2%) the rain era's erosion had no base
    level and its lakes filled the world level; creep ran at an Earth's whatever the rain (now with
    the rain: a trickle, hardly); a trickle like Titan's (rainK0 < 0.05) traces its water but cuts
    nothing a world cell shows; the rain's strength was counted twice; a polar bowl let the dry-
    basin floor flatten the low latitudes (reverted to the original 400 m lift).
  - Still: the bright provinces are flat-toned blobs with hard edges; its seas lie between ridges
    now but are small (0.9% of the world: the history's ethane); stampFolds loops each arc over a
    tile's cells (Titan's refinement ~80 s, was ~50).
- **Cliffs: investigation (2026-10-03, nothing committed but the survey's --scales).** Dave: "cliffs
  you can land near from space and enjoy, or fly through in the fighter"; "all things should be
  visible at their proper scale" (true size, each level of detail a correctly filtered view of the
  same world; nothing widened or exaggerated to show from afar).
  - Measured (scratchpad slopes.mjs, Thugroadath's sandstone gorge -41.3, -31.2): slopes per level
    p50 4-15 deg, p99 51 deg at every level (257 m, 64 m, 16 m cells), max ~70; >60 deg in 0.1-0.5%
    of cells. Game geometry is 10x vertically exaggerated (planets 1/10 size, heights real), so
    this is gentle ground. The finer levels add detail but never build faces.
  - Letting a rock stand vertical up to its critical height (4c/(rho g) tan(45 + phi/2)) in the
    integer sim's collapse changed nothing: the slope limit isn't what's missing; nothing cuts faces.
  - Tried: stepped slopes from each place's real bed column (hard beds steep, soft gentle: the
    height mapped through the column, blurred to the sampling), blended across contacts by the
    suites' smooth shares. Survey views at 12 km show bedding on the walls; in game, terraces read
    from ~3 km; from 350 m oblique the ground is still smooth rounded swells, and level-of-detail
    rings seam where the blur differs. Reverted; patch in scratchpad bed-steps-experiment.patch.
  - The real gap: the km-scale ground is smooth. Cliffs need big steep relief made by processes:
    canyons cut narrow through caprock, escarpments retreating (mesas, buttes), fault scarps, sea
    cliffs, glacial walls. Next: those as features defined once from the history (lines with their
    real profile: vertical up to the critical height, talus below), drawn by every level filtered
    by its sampling, so nothing pops; and in the tile sims, processes that make faces (caprock
    undercut and block fall) rather than only rules that allow them.
- **Rivers made continuous (2026-10-03, terrain.js `_meander`, `_meanderA`, `_meanderFrame`,
  `_meanderLine`, `_rivLinks`; meanders.js `meanderNearA`).** Dave: rivers "non-contiguous with
  obvious seams" (Thugroadath -40.77, -31.18; Ishiodreill everywhere). Causes, all in the sampler's
  meanders of ordinary rivers (great ones are refine.js bigChannels, untouched):
  - amplitude from each record's own slope, with a hard cutoff (A < 0.35: straight), so it
    flipped record to record. Now `_meanderA`: slope over 3 records each way, continuous,
    blended along each record to its neighbours'; `meanderNearA` scales the trace's swing by A
    with true distances, so any A works.
  - phase restarted at each record (`phase + (0.5 - t) len / w` assumes the curve's middle is its
    cell and its halves equal; D8 diagonals are 1.4x longer): jogs at every junction. Now each
    junction has one phase (halfway between the records' cell phases) and one width, shared.
  - the trace's frame was the record's own curve, which zigzags at the D8 cells' 45 deg turns: a
    loop out on the belt reached into the next record's reach and was sliced. Now laid along
    each river's smoothed line (cell points averaged over 3 records each way, the window equal
    both ways so it keeps to the river at its ends), the nearest of 5 frames (2 each way); its
    banks' level taken along the same frame; swing capped at 0.7 x the smoothed line's turning
    radius.
  - loops cut off at a river's source or mouth: the swing grows from 0 over the first record and
    dies over the last; oxbow lakes only where it swings freely (A 0.5-0.85).
  - Ishiodreill: records meandering 5425 (was 10551 with the noisy per-record slope), mean belt
    half width 82 m (was 122). Earth's great rivers unchanged; their channel shows angular
    corners at 12 km (bigChannels thins its trace to every other point): a separate fix.
  - Records link end to start by position (`_rivLinks`: dn, up = main inflow, river ids).
- **Canyons (terrain.js `_canyons`, `_canyonRec`, `_canyonRaw`, `_canyonFit`, `_greaterNear`;
  canyon.js), 2026-10-03.** Rivers entrenched in dry land get canyons at true size, each level a
  filtered view of the same ground:
  - Where: the refinement's levels show a dip a cell or two across that is sharper than the valley's
    sides. Each river record, at 5 points per side, reads the levels (refinement only, so it is
    deterministic and doesn't depend on which pyramid tiles exist) at d1 = 1.5 and d2 = 2.5 refCells
    across. The side is carried inward as a line, no higher than at d1; a V valley's sides meet at its
    river, so no canyon. Needs: depth > 30 m (full at 80 m); the side not falling away beyond d1;
    rain < 1200 mm (full below 500); not a great river (next: entrenched meanders along the big
    segments); no river 1.5x wider on another river within d1 (the dip is that one's valley).
  - Walls: canyon.js turns the rock column (geology.js rockColumn, 1 m beds) into a wall. Each bed
    lays back by 1/tan of its slope: tan = 0.6 + 9·smoothstep(0.35, 0.8, hardness)². Sandstone and
    limestone are cliffs, shale is benches, granite is one sheer wall. Prefix sums give the exact
    average over any window, so `canyonAt` filters the profile over minW: from afar the mean slope,
    close up each cliff.
  - Volume: the floor is no wider than the river and its belt allow (x4 in sedimentary rock, x3 in
    volcanic, x2 elsewhere: walls retreat faster where soft beds are sapped). `_canyonFit` solves
    the rim height so the gorge plus a broader valley above it remove what the levels are missing
    below the carried-in side. A full gorge (rim at the side) gets the levels' dip filled to the
    side line; a lowered rim keeps the levels' valley and cuts the gorge into its floor. So
    Thugroadath's 1 km granite valley is a V valley again (a narrow granite slot can't account for
    it), not the 800 m-floored box it was in the first tries.
  - Seams fixed along the way:
    - params smoothed along the river over ±2 records (compact kernel, so where one record gives
      way to the next both read alike), tapering out over the 2 records nearest a source or mouth;
    - one canyon per river (its nearest record, by Newton-polished nearest point:
      `nearestOnCurveFine`), different rivers taking the lower cut;
    - the floor is the rivers' levels at 5 curve points each, blended by nearness, the exact level
      only by the water.
  - Fades in by 1 - smoothstep(W, 3W, minW) (W the half width at the top) and 1 - smoothstep(d1,
    3 d1, minW). Cost: ~+1 us per sample near dry canyon rivers (3.3 vs 2.3 us at the granite
    valley); nothing elsewhere.
  - Still: at the sandstone site one wall arc and a short dark seam by the river's source; how
    canyons look in game is untested.
  - survey.mjs: `--at lat,lon/...` views at given places; `--pyr 0` refinement only; `--pyrN 3` a
    3x3 block of pyramid tiles (one tile's edges cross the 3 km views).
- **Wrinkle ridges (barren.js `wrinkleRidges`):** lava plains settle and shrink as they cool:
  ridges 100-350 m high, 4-10 km across, 60-350 km long, about one per 150 km square of plains
  (up to 5000), as folds. On Uthmir's and the Moon's maria. Faint on near-black basalt in the
  survey's flat light.
- **Icy and airless surfaces (terrain.js):** old icy ground warm enough to sublime (over ~90 K)
  grows a dark lag by its crater record (exposure) x warmth: Callisto dark, Ganymede dark with
  bright polar caps, Rhea/Triton/Europa bright. On an airless world the regolith is its own rock
  ground up, so the Moon's maria now show dark. Darnzend (LAB-86 5) is wet (a frozen third of an
  ocean), so it's not a heat pipe; the stagnant path has the heat pipe too now for those that are.
- **Drowned rivers (terrain.js):** a river whose line runs below the sea fades out over its last
  3 m (`rvK`): its banks were held up to the datum, building levees out across the shelf, drawn
  as canals in the sea.

Open:
- **Canyons (SIM 49, TILE 27; Dave asked how the Grand Canyon formed, 2026-10-02):**
  - *Great rivers come into the tiles* (localsim.js `riverInflow`). A refinement tile's drainage
    used to be only its own rain, so a great river crossing it cut like a creek. Now, where a
    world-sim river (>= 1e8 rain-weighted m^2) crosses into a tile from a cell outside it, its
    upstream drainage comes in a cell inside that edge, and the edge there is shut (it's no
    outlet). `Erosion.drain` takes the `src` term; the integer sim gets it in its per-cell `a`.
    On a world with no climate grid (stagnant: its history ran on a unit rain) it's scaled by
    the tile's rain. Big rivers' drawn half width is capped at 600 m (refine.js riverIndex),
    since whole basins' water now reaches them.
  - *Canyon country* (world.js `gorge`, snapshot `gorge` u16, `gorgeSmooth`). A great river
    (>= 1.5% of the world's greatest drainage) in dry country (Koppen B or < 0.45 m/yr) that lies
    > 150 m below the even ground either side held its course as the land rose under it (an
    antecedent river). Its world cell averages the gorge in with the plateau, a broad dip, so
    the refinement starts from the plateau's level there (`hSmooth + gorgeSmooth`). The river's
    trench stays at its own level; stream power with the inflow cuts the gorge, and collapse to
    each rock's angle widens it (in layered rock, cliff bands).
  - Canyon country also needs the ground above freezing (Tsl - lapse h > 275 K: a river's, not a
    glacier's) and the river itself > 150 m up (high country, not a coastal valley) (SIM 52).
  - The sampler's floodplain leveling no longer flattens valley walls (terrain.js `_levelled`):
    full across ground up to ~2 river depths above the bank, none past ~8 (still raised where
    the ground lies below the bank, so the water stays in).
  - Scan (tools: scratchpad gorgescan): 12 of 40 temperate water worlds have some; Thugroadath
    (LAB-44 5), Ishiodreill (LAB-30 4) and Quuhiaglou (LAB-73 3) have 200+ cells. Thugroadath's
    deepest (858 m, granite) is a water gap through a range; its sandstone ones (215-290 m) are
    narrow cliff-walled canyons in a plateau (Canyonlands rather than a 1.8 km Grand Canyon).
  - `node tools/survey.mjs ... --gorges N [--gorgeRock sandstone,shale]` renders the deepest.
  - Still open: deeper plateau canyons need more uplift history than the world sim's 150 Myr
    fine epoch gives a dry plateau; side canyons and scarp retreat come from the pyramid levels'
    own drainage (which now has inflow: TILE 29, above).
- **Desert landforms:** dunes are in (below); wadis and mesas (the world sim marks mesa
  country) still to draw.
- **Big rivers:** now drawn from the refinement's own drainage (below); finer meanders (a lateral
  migration history) would be the next step.
- **Drainage pattern:** D8-straight parallel gullies on even slopes (MFD routing would help).
- **Chaos terrain:** icy chaos is a flat matrix; its rafts should be drawn by the finer levels.
- **Rock contacts on even ground:** the refinement's now follow the tile's own lows and rises
  (basement in valleys, cover strata and lava on rises); the finer levels still read them by
  cell shares (RefineReader.rockAt) and the pyramid's suites: polygons at ~60 km remain.
- **Venus-like worlds:** after an overturn, lava flows (from vents, running to the lowest ground
  until spent: lobes and ponds) and coronae now; small shield fields and tesserae still wanted.
- **Meanders (done, `src/gen/meanders.js`):** a Howard-Knutson channel simulated once (each
  centreline point moves toward its outer bank by its own and its upstream curvature; necks under
  1.6 widths cut through, leaving oxbows), baked into meanders.data.js; drift removed, loops
  pressed to a ~17-width half belt. The river index gives each record its phase (widths up its
  river, via the receivers' keys). Rivers under 250 m wide: the sampler lays the trace by phase
  as it samples (belt kept within ~1.8 km, faded where the loops can't be resolved). Wider: their
  channels are built along whole stems in `bigChannels` (line smoothed over two wavelengths,
  slope from smoothed heights), as indexed segments. Young oxbows are lakes, old ones swales.
  (The first draft's "runaway into tiny wiggles" was a sign error: points moved toward the inner
  bank.) The index is built in a worker of its own when a refinement completes
  (workers/riverIndexWorker.js; ~12 ms a tile). A river switches from the sampler's meanders to a built channel at 250 m wide:
  its belt widens there in a step.
- **Near-field loading:** the volume rings make the descent slow with few workers.
- **Near-field seam:** fixed: the heightfield reaches 3% in under the volume's last ring, 0.4 m
  low (terrainMaterial.js NEAR_OVERLAP), so the dotted crack where they met is covered.
- **Hidden-tab GPU:** in a hidden page the GPU tile sim crawls (~0.9 s a step; Chromium throttles
  it), so test-tab refinements take minutes: load the test tab with `&tilegpu=0` (the tile sims
  on the CPU's integer reference, the same results). Screenshots of a hidden pane: post the
  canvas to a small local receiver (scratchpad `recv.py`) instead.
- **Fractal hold:** the measured H runs ~0.1 above the target (calibrate).

Measuring tool (scratchpad `fractal.mjs` pattern): variogram slope (H) and box-counting coast D per
level.

**Backlog from Dave's play-testing (2026-10-02), for later:**
- **Jetpack:** flight-assist modes like the ships' (with ROT off you can spin out of control).
- **Terrain:** shadows from terrain on itself (a near-field shadow map).
- **Exposure:** a lit moonlet against black space blows out (the meter opens ~5 stops); Dave said
  not now.

**The plan to act on is `WORLDSIM.md`**: its DEEP-TIME CHECKLIST table has every item with its status
(items 1-19, most at v1) and step 7 (the game) has the in-game state. In one line: worlds come from a
forward history (evolve.js: star, chemistry, air by gas, liquids, life's stages, extinctions) and a
world sim (plates, erosion with isostasy, climate, glaciers with ice ages, coasts and tides, soil and
groundwater, a life map), all deterministic; `tools/worldlab.mjs <seed> <body>` runs one and draws its
maps (relief, Köppen, rock, life). **In the game the simulated worlds are opt-in: `?worldsim=1`**
(`&simN=128..384`): a background worker runs each solid body's sim, caches it in IndexedDB, and the
terrain generator draws from the snapshot. Making it the default is Dave's call. Erosion had a
long-standing bug (fixed: refill of freshly cut cells) and K is now real-world; see WORLDSIM.md's
notes before re-tuning anything.

Direction from Dave:
- **Worlds:** worlds made by simulation, not noise: plate tectonics, weathering and erosion carving
  valleys and canyons over time, rivers that run from mountains to the sea, coral reefs, impact craters
  ("fewer with a moon"), and biomes from temperature and humidity with seasons, where axial tilt matters.
- **Epochs:**
  1. deep time (plates and coarse erosion);
  2. recent time (fine erosion with climate and rock layers);
  3. ice ages and present (glaciers and fjords, sea-level swings, reefs, coastal cliffs);
  4. a coarse snapshot from which fine detail is generated near the player.
- **Run once:** plates move only during generation. The only thing that changes at runtime is the
  season, from the orbit's phase blending precomputed monthly fields.
- **Scope and budget:** this applies to worlds with water and plate tectonics; others keep their own
  processes. Up to ~10 minutes per star system is fine as long as the result is cached.
- **Language:** Dave wants C or C++ for the WASM port, not Rust. GPU math isn't bit-identical across
  vendors, so the GPU is for render-only detail. The port uses its own math functions (port dmath),
  no fast-math, `-ffp-contract=off`, and no relaxed SIMD. Built with Homebrew LLVM
  (`tools/build-wasm.sh`: clang --target=wasm32 + wasm-ld; Apple clang lacks the backend).
- **Glaciers:** carving down off peaks (cirques, arêtes, horns, U-valleys), not only in ice ages.
  They need a flow model (ice thickness flowing downhill) fed by the climate's snow and melt, with
  erosion that follows the ice's sliding speed. Valley glaciers show at a 2 km grid; cirques and horns
  need the local detail near the player.
- **Soil depth (a later pass):** soil is made from bedrock and creeps downslope, so it's thin on ridges
  and steep slopes and deep in valleys. Meadows grow where it's shallow, forests where it's deep.
- **Gameplay direction:** interstellar package delivery, with the sim making each delivery a physics
  problem. It needs save/load (carrying world state between systems), places (outposts from the
  settlement-site analysis), goods with limits, a job board and a galaxy. Discussed only; nothing built.

- **More direction from Dave:**
  - The sea only sets the erosion base level in deep time: set it by rule (the ocean fraction), not
    as a sim output.
  - Let worlds vary (continental thickness and area); use guard rails, not targets.
  - Use realistic impact rates and sizes.
  - Volcanoes, volcanic islands and beautiful island chains (sometimes). Activity is a random world
    trait, including over-active worlds.
  - Interesting variety: dry worlds, water worlds, no plate tectonics, and so on.
  - Rain depends on how hot and wet a world is.
  - A planetary history comes first: whether life ever arose (sometimes never), and the initial
    atmosphere and how it changed. Atmosphere drives temperature, which drives rain and erosion over time.
  - Check across seeds.

Files (new, all in `src/gen/worldsim/`):
- `grid.js`: SimGrid, a cube-sphere with N x N cells per face, flat neighbour tables, `cellAt` without
  atan, and `sample` bilinear within a face.
- `erosion.js`: implicit FastScape stream power.
  - Routing is a priority flood with slope-weighted random receivers, so the grid doesn't show.
  - Lakes fill with sediment; shelves build on the sea floor; hillslope creep.
- `tectonics.js`: each plate keeps its crust in its own frame grid (`own`, `thick`, `cont`, `age`,
  `rate`, `relief`), and world cells gather it by rotating back into each frame.
  - **Plate interactions:**
    - subduction raises arcs and island arcs (new continent);
    - continental collision stacks crust, with an 85 km hard limit that fills outward;
    - gaps become new ocean floor (GDH1 depth).
  - **Driving forces:** slab pull sets plate speed (0.15-0.9 deg/Myr); collisions merge plate motions,
    and sustained ones weld two plates into one; rifts split big continental plates (sooner when there
    are few plates).
  - **Crust upkeep:** gravitational spreading (nonlinear, so plateaus dome); extension thins
    continents over 40 km and adds the crust at their margins (100 Myr); a guard rail speeds collapse
    only when the mean passes 50 km; ghost crust (hidden under other plates) is cleared each step.
  - **Volcanism:**
    - activity tiers (quiet / Earth-like / busy / over-active);
    - hotspots fixed in the mantle with a swell, pulsed shield volcanoes, and chains that sink as they
      move away;
    - arc volcano cones behind trenches.
  - **Sea level and erosion:** sea level comes from the ocean-fraction rule; `stepEroded` couples
    coarse erosion every step. Erosion takes volcanoes down before crust and fills craters first.
- `impacts.js`: the present-day lunar production rate (N(>=1 km) 8.4e-4 per km^2 per Gyr, falling as
  D^-2), scaled by gravity, with small impactors filtered by the air; complex crater profile.
- `tools/worldlab.mjs`: the driver and PNG maps.

Run: `node tools/worldlab.mjs <seed> <bodyId|start> --init tect --myr 400 --N 192 --steps 40 --dt 2.5e5
--kd 1 --deepK 3e-6 [--hot N] [--impacts 1] [--at peak|mouth|hot --zoom km] --out <dir>`.
- **Outputs:** `<body>-plates.png` (frames over time), `-map.png` (before/after) and `-zoom-*.png`.
- **Worlds with water and tectonics, for multi-seed checks:** FSPB-8DTW start (Moadeal), LAB-0 7,
  LAB-2 5, LAB-4 5, LAB-5 5 (Dorith, 94% ocean), LAB-6 5. Run them in parallel; ~1 min each at N=128.
- **Timings (M4, node):** 400 Myr of tectonics plus coarse erosion at N=128 is ~50 s; fine erosion is
  ~90 ms/step at N=256.

Verified across the six worlds (maps only, nothing in the game):
- **Stable and varied:**
  - continental crust stays at 35-43 km mean thickness;
  - plate counts 7-22 with rifts and welds (a supercontinent cycle);
  - sea floor 40-100 Myr old on average;
  - median land 0.4-2 km;
  - continental area drifts up on some worlds into broad shallow seas.
- **Features:** plateaus dome; hotspot tracks and island groups appear; impacts happen and get eroded.

Known issues and next steps: see `WORLDSIM.md`. The grid-like patch on Xenzhei was rift-thinned
shelf (crossing rifts). Dave: fine. Rift lines now meander. Equirectangular lab maps smear at the poles.

## START HERE (end of session 0f13fab4, before a context compaction)

Everything up to the polish work is committed ("Two local players, walkable craft, ..."), and the world simulation up to c9caba1. Commit good checkpoints as work lands; push only when Dave asks (CLAUDE.md). The dev server
(launch config `starseed`, port 8765) and Blender (MCP) were running. "XBox Work on Mac" just said
"XBox Work done" (machine free); message it before and after any browser / Blender run (it asks for
~10-15 min exclusive pauses now and then: close the test tab, no Blender, reply "paused").

### Immediate next steps (in this order)
1. DONE after the compaction: two local players (split screen, two gamepads, pilot seats: see "Two
   local players" below); every ship walkable built and tested (see "Every ship walkable").
2. Next in Dave's queue (below, "Still queued"): B live viewscreen DONE; C tabbed pause screen with
   the planet catalog DONE; D meadows DONE; next: per-biome flora (offered, Dave's call), E carrier
   sliding doors (world-state doors), F polish.
3. Rebuild commands (each MCP call is a fresh namespace: exec the file each time):
   craft `exec(open('/Users/dave/dev/starseed/tools/blender/build_craft.py').read()); build_vehicles()`;
   carrier craft (yacht, pods) `exec(open('.../build_carrier.py').read()); build('craft')` then (new
   call) exec again + `export()`; then `check_zfight.py` `zfight([...])`. After layout edits:
   `node tools/export-layout.mjs > tools/blender/out/bastion-layout.json`.
4. Screenshots of the hidden test tab: `python3 tools/shot_server.py <scratchpad>/shots` (background),
   then in the page `shot(name)` (draws the canvas right after `game.frame()` and POSTs it); the pane's
   own screenshot is stale while it is hidden.

### What Dave asked for this session, and where it stands
- Z-fighting on the bay floors -> fixed and checked (0 overlapping pairs, 0 intrusions). Depth buffer
  was already best (reversed-Z float32, camera-relative doubles on the CPU).
- Escape pods hidden from vessel lists / markers unless "Navigation > Escape pods in lists" -> done.
- Basic inventory and items; put them in a ship, fly to a planet, still there -> done and verified.
- Vehicles: cart, container, lifter, dropship, fighter, hover-tank; the trip (cart into a box, sealed,
  clamped to the lifter, carrier to a planet, lifter lands, box opened, cart drives out); "skip the
  lifter"; the falling stunt -> all verified (screenshots sent).
- Doors that open on approach (carrier) -> queued (0b); world vs player state rule saved to memory.
- Trees physically real -> trunks / rocks solid for craft and walkers (verified). Destructible trees:
  later ("a bit much rn"). Meadows on flat ground in the generator: Dave's idea, queued (0d).
- Hover-tank: Battlezone II handling and look (Dave sent BZ screenshots), cockpit with a canopy that
  lifts, 2 seats + a rear compartment with a viewscreen; pads pull down only on light worlds (Dave:
  getting air over a hill is fun); it rides with the lifter, not the dropship -> written, not built.
- "ALL ships must be walkable and have at least a basic interior" -> Cheyenne, lifter, container
  verified; Kestrel, tank, fighter written, not built (see above). Pods stay seat-only.
- Next feature after vehicles (Dave): Map/pause as a tabbed screen; a catalog page of the system's
  planets (small picture, zone from the star, biomes...) and a field to enter another system's seed.

### Test recipes that worked (paste into the test tab)
```js
window.TK = await import('/tools/testkit.js?' + Date.now()); await TK.ready();
window.tap = async (code) => { dispatchEvent(new KeyboardEvent('keydown', { code, bubbles: true }));
  await debugRun(100, 16); dispatchEvent(new KeyboardEvent('keyup', { code, bubbles: true })); await debugRun(100, 16); };
game.startAboard(); await debugRun(4000, 16, (n, g) => g.state === 'playing' && n > 30 ? false : undefined);
game.parkCraft();                       // the vehicles in the starboard bay
TK.chain(game.cart)                     // "Mule [Container hold, parked] < Container 1 < Bastion < Moadeal"
await TK.hold(ms, ['KeyW', 'ShiftLeft'], (n, g) => { ...; return false to stop });
game.quick.tree().find(r => r.id === 'ship').items   // the quick menu's craft actions (run())
```
- Flying a child craft precisely in its host (test only): set `v.auto = { lvel, lnose, lup, move, land }`
  each frame AND mute `v.nav.update` (an idle nav computer clears `auto` every frame). See `goTo` in
  the session transcript; land with `land: true` until `v.attached`.
- Placing things on a planet: body-fixed basis must be right-handed (`makeBasis(east, up, east x up)`);
  a left-handed one flips the craft upside down. Use `b.R + b.groundHeight(dir)` (it is negative in
  basins: never clamp it at 0).
- The tab's rAF stops while the Browser pane is hidden: step frames with `debugRun` (a key press needs
  frames to be read). Surveys (`game.requestSurvey`) resolve only while frames run.
- Screenshots of a region at full res: draw the WebGL canvas into an overlay canvas right after
  `game.frame()` (showCrop in the transcript) and screenshot; remove the overlay afterwards (Dave
  watches the pane).

### Lessons from this session (also in "Gotchas")
- Coplanar faces z-fight however good the depth buffer; cut cavities a little bigger than the rooms
  drawn in them; `check_zfight.py` finds them.
- Thin colliders: a wheel sagging into a 15 cm floor is nearer its underside and gets pushed through:
  give hosts thick `inner` colliders for what is inside them.
- Point contacts on rough low-g ground creep forever (viscous friction never sticks): let cargo /
  vehicles settle (`restsOn`) with fewer than 3 legs.
- One key press can be handled twice in a frame (out of a seat, then the on-foot check sees F again):
  skip on-foot interactions in the frame you left a seat.
- Aim from the eye as of now (`player.computeCamera`), not last frame's camera: planets move ~500 m
  per frame.
- Divisions by thrust limits: ground vehicles have none (audio, camera shake, HUD guarded).
- recalc_face_normals turns open shells (a hull with an open back) inward: wind those by hand.
- Releasing cargo inside another collider explodes it (the dropship belly / tank): leave clearance.

## First steps for the new session (older, from session 68fc2903)

1. Start the dev server: `preview_start` with launch config `starseed` (now also in
   `~/dev/starseed/.claude/launch.json`), or `python3 tools/serve.py 8765`. Check
   http://localhost:8765/ answers 200.
2. Blender MCP: `.mcp.json` in this folder defines server `blender` =
   `/opt/homebrew/bin/uvx mcp-for-blender` (the PyPI package was renamed from `blender-mcp`; the
   `claude` CLI is NOT installed, so never tell Dave to run `claude mcp add`). Dave was installing
   Blender (`brew install --cask blender`) and uv (`brew install uv`), then
   `uvx mcp-for-blender install-addon`, enabling "MCP for Blender" and pressing Start MCP Server in
   Blender's N panel. If the blender tools are loaded, check the connection (scene info / a viewport
   screenshot). Purpose: better big-ship models (kit parts with bevels, booleans, baked AO, exported
   glTF, assembled procedurally) and more interior function (lifts and decks inside the carrier).
3. Ask Dave how the latest build plays: the orbit start (default) and the start chooser, the Nahasia
   moon start (never seen on screen), exposure/AgX, stars in space, carrier lights, jetpack, routes
   (Tab / LB tap / D-pad Up), the controller layout, and whether the Safari mouse fix helped (he was
   told Chrome is the better browser for this game: no dropped mouse events, no 30 fps Low Power cap).

## State of the repo and builds

- Repo: `~/dev/starseed`, git branch `main`, pushed to `git@github.com:raddad772/Starseed.git` (public,
  remote `origin`) on 2026-10-01 at Dave's request. Commit / push only when Dave asks.
- Renamed **Starseed Infinite** (Dave: avoid clashing with existing games called Starseed): page title,
  briefing h1 and title card ("STARSEED" + an "INFINITE" line), README. localStorage keys unchanged.
- Hosting: GitHub Pages from `main` / root (`.nojekyll` present) would serve
  https://raddad772.github.io/Starseed/ ; Dave has to switch it on in the repo's Settings > Pages
  (`gh` is installed but not logged in). Global git identity is already raddad772 noreply; end commit
  messages with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Published artifact (private): https://claude.ai/artifact/ENURBtsu2EgGZQyqmibhGS. Version 2 has the
  fleet; it does NOT yet have the mouse fix, T targeting or the landing view. Republish: `node
  tools/build-artifact.mjs`, then Artifact publish `file_path=/Users/dave/dev/starseed/dist/index.html`,
  `root=/Users/dave/dev/starseed/dist`, files = the list in `dist/files.json` (as `{path}` objects).
  `three` is loaded from jsdelivr three@0.186.0 in the artifact (byte-identical to `vendor/`).
  The artifact lacks everything since the fleet (v2).
- Dev server: launch config `starseed` (`tools/serve.py 8765`, no-store headers; `/vN/` path prefixes
  alias the root to defeat module caching in test tabs). Not running after the reboot.

## Coordination

- Dave plays in his own browser (Safari earlier; Chrome recommended). Never test in his tab.
  "XBox Work on Mac" asked to be told when Dave stops playing.
- Before my own browser test sessions: message "XBox Work on Mac" (SendMessage) with expected duration;
  message again when done. They run real-time emulator tests; keep terrain workers at 2 (`?workers=2`).

## Testing toolkit

- In a page: `const T = await import('/tools/testkit.js?v=N'); await T.ready(30000)` (waits for
  `playing`, launches, sets `window.debugHold = true` so the sim only advances inside `debugRun`).
- `T.fly(ms, (n, game) => { ...; return false to stop }, every)`, `T.keys('KeyW', ...)`, `T.holdPitch(deg)`,
  `T.orbit(bodyName, altM)`, `T.telemetry()`, `T.body(name)`, `T.basisQuat(x, y, z)`.
- `window.debugRun(ms, frameMs, onFrame)` steps frames manually. The JS tool times out at 45 s: split
  long runs; if a call times out the page keeps running, so wait (`setTimeout`) and re-read state.
- Useful shortcuts: `game.startAboard()` (shuttle docked in Bastion's hangar, player on deck);
  `ship.dockAt(host, host.type.zones[i], lpos, lquat)`; `player.sitDown(seat, vessel)`;
  `player.placeAboard(vessel, localPos, headingLocal)`.

## Architecture added this session (vessels and coordinate spaces)

Dave's requirements: small ship + a big ship you dock on the hull of + one you fly inside; they carry
you around and can be explored in flight; big ships just keep their course (no autopilot) and cannot
land; a docked ship lives in the host's reference frame "same as you walking around"; P = back to your
last pilot seat.

- `src/sim/vesselTypes.js`: SHUTTLE, TENDER (Halyard, 330 m, pads on a dorsal deck, lifts to a spine
  corridor and bow bridge), CARRIER (Bastion, 1.55 km, port-side hangar with force field, door to a
  corridor, lift to the bridge atop the tower). Single source of truth for colliders (AABBs), zones
  (pad/hangar volumes + plating gravity), rooms (walkable, `open` sides lead to space, `capture` rooms
  pull spacewalkers in), solids, lifts (a<->b, trigger radius 2 m, points sit in front of the doors),
  seats (pos/eye/stand/heading), light fixtures, engines, probes. Helpers: `boxPenetration`,
  `deckBelow`, `insideBox`.
- `src/sim/ship.js`: `Ship` = any vessel. Global state always valid (pos/vel/quat/angVel in the dominant
  body's inertial frame). Hierarchy: `parent`, `zone`, `attached` (docked) and local state
  `lpos/lvel/lquat/lang` in parent coordinates; `syncFromParent`, `enterParent`, `leaveParent`, `dockAt`.
  Inside a zone: `computeControlLocal` (deck-frame FULL assist, hover/auto-level), `stepLocal`,
  `contactsLocal` (legs/hull probes vs host colliders), `tryLandLocal` (docks). Free flight:
  `contactsVessels` (bump into big hulls). `refVessel`: FULL assist holds velocity relative to a big ship
  within 30 km (frame `vessel:<name>`). Big ships: no legs, any terrain contact or dynamic pressure over
  `maxDynPressure` destroys them ("broke apart under its own weight"). `accel` = proper acceleration
  (felt), `accelW` = total inertial acceleration.
- `src/sim/interiors.js`: `ShuttleInterior` (old cabin logic: cells, ramp, seat/ramp prompts) and
  `RoomInterior` (rooms, solids, lifts, seats, capture). The shuttle cockpit cell now overlaps the cabin
  (the doorway was impassable before).
- `src/sim/player.js`: `player.vessel` for seat/ship modes; `childAboard` (board a docked child's ramp,
  bump its hull); `exitVessel` (into the host's room, else EVA/surface); EVA capture into big ships'
  capture rooms; `lastSeat` + `recallSeat()` (P); `rideLift()` with fade.
- `src/sim/ftl.js`: one FTL per vessel. Ship targets: the bubble co-moves with the target, drops 6 km off
  with velocity matched and the assist referenced to it (`dropAtVessel`). Big ships lock FTL within
  radius + 2 km. `pathObstruction` respects ship targets.
- `src/game.js`: `vessels`, `ship` (Wayfarer), `tender` (Halyard), `carrier` (Bastion);
  `spawnFleet`/`placeInOrbit` (circular equatorial orbits above Moadeal's mass lock, no spin),
  `startAboard` (start chooser "Aboard Bastion"); `advanceVessels` (one clock; roots
  landed/rails/physics/ftl, children via `stepChild`; a piloted ship is always fine-stepped at 1/120 s
  or stiff contacts explode), `checkZones`, `chooseReference`, `syncTree`; `targetList`, `cycleTarget`
  (Tab), `targetUnderCursor` (T, reticle when captured); camera modes first/chase/landing (V cycles;
  landing = rigid, level with horizon or host deck, above and behind); spacewalk sub-stepping with the
  world's exact dt (fixed a 100 m jump per slow frame).
- Rendering: `src/render/bigShips.js` (Kit geometry merger, procedural textures, `buildTender`,
  `buildCarrier`, force-field shader), `src/render/bigShipVisual.js` (plumes, pad lights amber/cyan/green,
  rising pylons, strobes), `src/render/lightRig.js` (sun with a camera-following shadow box 72 m wide,
  3.2 km deep; hemi; fixtures: see "Fixture lighting" below, the point-light pool is gone;
  `interiorMaterial` ignores sun and sky). Shuttle visual no longer owns lights. Exposure metering:
  see "Exposure" below (the old mean/rms/p4 metering is gone).
- HUD: zone/docked flight rows, chips (DOCKED, REF, FTL —, LANDING CAM), docking guide markers on pads
  and hangar doors, ship labels; map shows ship markers.

## Verified in the browser this session

Hangar: walk up the shuttle's ramp from Bastion's deck (frame hand-off), sit, lift off the deck, fly out
the door (leaves zone, assist referenced to Bastion), fly back in, land, dock. Tender: FTL 960 km to
Halyard (drop 6 km, matched), approach via waypoint above, land on pad 1, dock; ramp -> deck -> kiosk lift
-> corridor -> bridge lift -> bridge. Bastion bridge: command seat, pilot the carrier with the shuttle
docked (rides exactly); 50 min x1000 warp aboard; Bastion FTL 34,000 km to Prelglopri with the shuttle
docked. EVA off a deck edge; capture back onto a deck. Halyard lowered onto the moon breaks apart. Planet
regression: board from surface, take off, land. P recall. No console errors. ~270 draw calls, 117k tris
with the ships in view.

## Done after the first handoff (all uncommitted, verified in a test tab unless noted)

Dave plays in **Safari** now (localhost:8765). Test in my own in-app-browser tab (never his), message
"XBox Work on Mac" before/after. Test tabs are silent (audio starts only on a real click/keypress).
`tools/probe.js` (setup(): readHDR / readAdapt / sunScene / expo; settle()) + the Test scenes panel.

- Exposure (Dave: "the ground should set the exposure, the sky may blow out a little"; black space
  "in between"): incident-light anchor `Game.updateMeter` (18% card under 0.5 sun + sky outdoors, or
  the ship fixtures' light inside a big ship's room; `engine.meterRef`). LUM pass meters log2(l/ref)
  clamped [-6,+3] with depth-aware weights: solid 1 (0.25 within ~3-12 m: cockpits), bright sky 0.04,
  dark sky 0.35; plus a 4th-power highlight guard over solid pixels. ADAPT: stops = clamp(max(logAvg *
  0.75, hi), -5, +0.5) around the anchor; speeds 1.1 / 0.6. Root cause of the dim ground in Dave's
  shot: **cloud shadows** (terrain `sunT *= 1 - 0.8 cd`), ground reads x~0.1-0.25 under them.
- Tone curve: AgX (three's chunk) + 1.2 saturation by default; pause menu "Highlights" select
  (AgX wide / ACES punchy), `engine.toneCurve`, setting `tone`.
- Fixture lighting (Dave: "lights need to work from further away inside the carrier"): lightRig.js
  replaced the 4-point-light pool with a uniform-array loop (MAX_FIX 24) patched into every vessel
  material (`fixtureLit`, `LightRig.adopt` from `addVessel`; the shuttle's `interior` group is
  skipped). Each fixture is confined to its room box (host frame, +2.5 m) and adds 22% bounce.
  `lights.camE` / `lights.inside` feed the exposure anchor.
- Player: jetpack aboard big ships (hold Space after a jump); rooms may be `open: ['+y']` (tender
  deck: fly out the top into EVA; capture 1 m below the rim); stand on `solids` tops; EVA drag uses
  air-relative velocity; on foot is sub-stepped with the world's exact dt (warp <= 4); the parked-ship
  ramp/hull helpers now need `ship.landed` (they used to zero your fall speed one frame after jumping
  out of a flying ship); boarding a moving ship uses velocity relative to it; `jetOn` reset every
  update (stuck jet hiss after P-recall mid-burn = Dave's "loud white noise while flying").
- Pause really pauses now (`game.setPaused`, audio context suspended); keys ignored while paused
  except H.
- Wayfinding: aboard a big ship Tab cycles destinations (`RoomInterior.destinations/graph/nextStep`,
  Dijkstra over overlapping rooms + lifts; doorways start from every room you stand in); HUD
  `drawRoute` marker + chip; arrives within 2.2 m. Carrier route verified: Hangar airlock ->
  Starboard corridor -> Lift lobby -> Bridge lift -> Command seat (159 m).
- Mouse (Safari): WebKit bug 235116 drops mousemove events (movement lost) when the page is busy.
  input.js sums mousemove and pointermove `getCoalescedEvents()` per frame and uses the larger;
  pause menu shows "Mouse input: …/s · using …" for the last second of looking. Slider max 6.
  **Not yet confirmed by Dave in Safari.**
- Gamepad (Dave's spec: right stick pitch/yaw, left stick thrust/roll, LB held = strafe/up-down,
  "you assign others"): `src/padLayout.js` = single source of truth (BTN, PAD_LAYOUT per mode
  flight/foot/eva, leftStickAxes, `padDiagram(mode)` SVG); `Input.pollPad(mode, dt)` from
  `Game.frame`; LB tap = Tab; Start = pause/resume; R3 = help. Help overlay (H) has tabs Keyboard &
  mouse / Controller (Flight / On foot / Spacewalk). Verified with a stubbed `navigator.getGamepads`.
- Test scenes (pause menu): sun ahead / behind / low sun, carrier hangar, carrier bridge, falling
  shuttle with ramp open (assist OFF, 3.5 km, 110 m/s down), tender deck, low orbit; checkbox for the
  exposure readout (`game.showMeter`, HUD `drawMeter`).

## Later the same day (also uncommitted, verified in a test tab)

- **Orbit start is the default** (Dave: "start out in space in orbit ... ship ready to enter floating
  right there ... a planet in the background ... a few start locations"). Briefing "Where to begin"
  chooser (`startOptions(sys)` in ui/briefing.js): orbit of the home world, the most striking giant
  (ringed first), the moon that sees its giant largest, aboard Bastion, the landing site. main.js
  `launchGame` -> `game.requestStart(key)`; `applyStart`; `composeOrbitView(b)` (Fibonacci search of
  camera positions x view azimuths: sun behind the camera plane, ~130 deg side light, daylit planet
  in the lower frame, ringed giants seen 12-40 deg above the rings, a moon's planet in frame and clear
  of the moon's disk; r = 1.08 x mass-lock radius, giants >= 2.6 R and outside the rings);
  `startInOrbit(b)` (EVA beside the shuttle 30 m ahead, ramp down, sunlit flank turned to you, P =
  seat); loading mode 'orbit'; `rollTitle()` -> `hud.showTitle` (#titleCard, body labels hidden while
  it shows). Respawn returns to the chosen orbit start.
- Stars stay visible in space beside sunlit planets (sky.js star vertex shader reads the eye
  adaptation and brightens stars up to 12x below exposure 70; off inside atmospheres).
- Seated in first person, the cockpit (within 3.5 m of the eye) barely counts for exposure
  (`engine.meterNearCut`; Dave: "don't use the UI to calculate world exposure").
- Hangar: catwalks (y 22, 44), rails, crane beams/trolleys/cables and wall ribs are solids;
  `pushOutOfSolids3D` resolves along the least-penetration axis (land on tops, head bumps); the floor
  lookup uses max(prevY, y) so fast falls cannot tunnel through. Routes draw a dashed floor path
  (`hud.drawFloorPath`); D-pad Up on foot = Tab.
- Screenshots of a hidden test tab: run `python3 tools/shot_server.py <outdir>` (port 8799), then in
  the page draw the WebGL canvas right after `game.frame()` into a 2D canvas and POST
  `name|dataURL` to http://127.0.0.1:8799/ (the in-app pane cannot screenshot while hidden).
- `notes/` (untracked): older scratch test scripts and reference screenshots saved from /tmp before
  Dave's reboot (orbit_*.jpg are the opening shots).
- The Nahasia start has now been seen on screen (lava glow below, Eldnedunt in the sky); not yet by Dave.

## Start preview and loading cover (session 0f13fab4, uncommitted, verified in a test tab)

Dave: "Orbit of Moadeal is selected, but the scene still loads on the surface at browser load ... it
should default to orbit, so we see stars" and "I want a loading bar on scene select, I don't want to
watch the landscape load in".
- main.js `boot` calls `game.requestStart(startChoice)` at once; clicking a start in the briefing
  previews it live (before the first launch only); Launch calls `game.launch()`.
- game.js: `placeStart` -> `applyStart(startPending || 'surface')`; new `startOnSurface()` (re-lands the
  ship if needed); every start goes through `beginLoading(mode 'surface'|'space', text, arrive)`;
  `arrive()` (title card / arrival messages) runs only when playing AND launched. `updateLoading` sets
  `loadProgress` (survey creep to 10%, surface: (deepest/(maxLevel-1))^3 then the pending-tile drain,
  space: the drain only, plus settle). Carrier start now loads too; test scenes use `beginLoading`.
- index.html: `#loading` is an opaque cover (label, %, cyan bar) under the briefing and pause overlay,
  centred beside the briefing panel at >= 900 px; it snaps on and fades out (0.8 s). Errors go to
  `#errorLine` instead. Timings with ?workers=2: orbit ~2 s, carrier ~2 s, Nahasia ~3 s, surface ~28 s.

## Controller everywhere (session 0f13fab4, verified with a stubbed pad)

Dave: "a way to dismiss the overlay", "show controller prompts for buttons like take pilot seat ... if
the person is using controller", "launching to a new scene to work"; also mused that Elite: Dangerous
shows controller configs can be complex (an open design question: see the queue).
- `Input.device` ('pad' | 'kbm', last thing touched; body class `using-pad`), `input.usingPad`,
  `Input.padState` (hits/held BTN names, sticks, triggers), `input.padRouter(ps, dt)` runs first and
  returning true keeps the pad from the game that frame.
- `src/ui/padMenu.js`: any open HTML menu (briefing, pause, help, test scenes, ship lost): D-pad / left
  stick moves a highlight spatially (auto-repeat), A presses, B clicks `[data-pad-back]`, LB/RB top tabs,
  LT/RT sub-tabs, left/right adjust sliders/selects; default highlight `[data-pad-default]` or
  `.primary`. Start launches from the briefing; R3 opens/closes the controller layout from pause.
- Map (`MapView.padUpdate`): right stick rotates, RT/LT zoom, D-pad / LB-RB step bodies (targets them),
  B or View closes.
- Prompts and chips: `hud.keyGlyph(code, label)` / `keyName` look the key up in the current mode's
  `PAD_LAYOUT` (`padButtonFor`, `padGlyph` in padLayout.js); face buttons draw as coloured rounds.
  Prompts may carry `code` (default `'Key' + key`).
- Relaunch: the pause menu's Change system returns to the briefing (`game.launched = false`); picking any
  start moves you there (`resetFleet()` first: FTL idle, big ships back on their home orbits); Launch
  without picking carries on where you were.

## Quick menu and Choose a world (session 0f13fab4, uncommitted, verified in a test tab)

- Dave prefers No Man's Sky's quick menu for rare actions. `src/ui/quickMenu.js`: lower-left list,
  categories then actions, built per frame from game state (your ship's systems when seated, your ship
  / summon on foot, routes aboard big ships, a Targets list, Navigation, Time warp, Controls). Opens
  with D-pad Left (PAD_LAYOUT LEFT = 'Backquote' in every mode; D-pad Right is now free) or ` on the
  keyboard. Pad: up/down, A/right choose, B/left back/close; the router takes only the D-pad and A/B
  (`padRouter` may return a Set), sticks keep flying. Keyboard: arrows/wheel, 1-9, Enter, Backspace.
  Actions inject the same key hit their own key would (or run a function); `stay` keeps it open.
- Dave: "a custom start screen ... select planets ... sites like on land -> near a river ... or
  biomes". Survey (`analyzeSettlements`, SETTLEMENT_VERSION 2) now also returns `spots`: the best
  landable spot per kind (river, river mouth, lake shore, coast / other-liquid shore, lava shore,
  plains, mountains, every biome covering >= 24 cells on living worlds; crater floor / rim, pole or
  terminator elsewhere; moonlets fall back to their flattest ground). Briefing tab "Choose a world"
  (main.js `setStartTab`, `renderWorlds`, `showWorld`): planets with their moons, picking one previews
  its orbit; its sites list once the survey is in. Keys `site:<bodyId>:<spotKey>` ->
  `Game.startAtSpot` (cover held with `loadHold` until the survey resolves; `startToken` drops stale
  results) -> `startOnSurface(b, dir, spot)` (morning if the sun is under 10 deg; respawn there).

## Falling-shuttle fix (uncommitted, verified in a test tab on seed Q9W6-WDJZ, moon Tearess)

Dave (playing on GitHub Pages): stepping off the falling shuttle, "the shuttle zooms away way too fast".
Causes: (1) keys held to walk down the ramp (W, Space) became EVA jetpack thrust the moment you left;
(2) on-foot free fall braked your horizontal speed relative to the ground even with no input and no
air; (3) EVA <-> on-foot switched at 4 km above the mean radius, not the ground (high terrain: you
could sink into it). Fixes in player.js: `moveLatch` (set by `exitVessel` when the ship isn't landed;
movement keys/stick count only after release), air control only with input and scaled by air density
(capped 3 m/s^2), `EVA_AGL` = 4000 m over the ground both ways (+2 km hysteresis to go back to EVA).

## Time-warp attitude fix (uncommitted, verified in a test tab)

Dave: pointing at a planet with FULL assist, "if I warp time, it starts pointing away from my current
vector; if I warp it severely I spin all around". Causes: (1) `Game.rotateOnly` (rails / FTL rotation)
integrated the 0.18 s rate damper explicitly with multi-second warp steps -> residual rates grew into a
spin; (2) rails coast ballistically while FULL assist held an inertial attitude, and on leaving rails the
stale `targetVel` made the ship burn (7.5 g, km/s) back to its pre-warp velocity. Fixes: `Ship.rateCommand
(out, feedback)` (pilot rates + FULL terms; attitude-feedback terms only when the step < 0.1 s);
rotateOnly moves rates toward it by at most alpha*dt (no overshoot); `enterRails` sets targetFrame 'none'
(re-based on exit); on rails with a pilot aboard FULL adds the flight-path turn rate (v x g)/|v|^2.

## Nav computer v1 (uncommitted; verified in a test tab, seed FSPB-8DTW)

`src/sim/navComputer.js` (one instance, `game.nav`, for the Wayfarer only; N / D-pad Right / quick menu
"Nav computer"). Phases depart -> climb -> align/spool/cruise (FTL legs; `plan()` routes around every
lock sphere incl. the star's 5R; `ftl.nav = { aim, legLimit }` overrides the drive's target) ->
descend/hop -> land, or approach -> dock (pad or hangar). Ship hooks: `ship.auto` {vel (abs inertial),
nose/up, lvel/lnose/lup (deck frame), move, land} consumed by computeControl / computeControlLocal /
rateCommand (`attitudeRates`). `avoidHazards` strips velocity toward any body / big ship within the
stopping horizon. Verified: orbit start -> Halyard pad (2 FTL legs, around Moadeal); Halyard pad ->
Bastion hangar; Bastion hangar -> Nahasia lava shore (140 km powered descent, landed); Moadeal
surface -> Halyard (heat-limited climb, hull peak 693 K); Halyard -> Eldnedunt orbit was mid-FTL when
Dave stopped the test. Not tested: same-world hop, player walking in the cabin while it flies.

Dave's next asks (2026-10-01): per-ship agents (each ship its own nav computer and state: parked in
orbit / in space / on a planet / navigating; several ships on different trips at once), commanded from
the in-suit interface (virtual screen); speed limit, warp limit, no-FTL time-compressed journeys,
automatic time compression; waypoints on planets with defaults at the start screen's sites; orbit is a
valid destination; later space stations and starships as destinations.

## Per-ship agents + suit Fleet app (uncommitted, verified in a test tab)

- Every vessel has `v.nav` (NavComputer, created in `addVessel`); `game.nav` = the focus ship's. Orders:
  `order({kind: 'site'|'orbit'|'dock'|'meet'|'park'|'hold', ...})`, `comeToPlayer()`, `cancel()`;
  `describe()` -> {state: Parked / In orbit / Docked / Holding / Navigating / Drifting / Falling / Lost,
  line, tone}. Big ships: orbit / meet / park / hold only (`canLand` false); `aMax` and `tau` per hull.
  New phases meet (stand-off: radii + 60 m small, + 1.5 km big), station (keep station by a ship / you /
  over the ground), park (circular parking orbit; big ships above the lock). `keepVel(A)` coasts
  (`ship.auto.coast`: engines off, attitude steered) while aligning / spooling / cooling down.
- FTL under nav: `ftl.nav = { aim, legLimit, align }`; slow-down immediate (a lagging slow-down was
  under-damped and overshot), speed gated by nose alignment (big ships turn slowly), leg limit caps speed.
  Planner: a ship near a world's lock (as FTL arrivals leave them) gets an "ABOVE <SHIP>" waypoint only
  when the straight jump would hit the lock; jumps to ships are checked only to the 6 km drop.
  `avoidHazards` ignores ships in FTL (their Newtonian velocity is stale) and reacts only when the
  projected path passes within the hazard radius.
- Screen apps: `src/ui/screens/kit.js` (immediate-mode canvas UI: controls, lists, spatial D-pad nav),
  `src/ui/screens/suit.js` (visor panel host: U, quick menu "Suit computer"; modal input; virtual cursor
  from captured mouse), `src/ui/apps/fleet.js` (ships, states, orders, destination picker: worlds -> orbit
  / sites; ships -> dock / alongside). Messages from ships you're not aboard are signed with their name.
- Verified: Halyard (big) FTL to orbit of Nahasia; Wayfarer to Moadeal river site (descent started) at the
  same time; Wayfarer dock on Halyard at Nahasia with the player on EVA at Moadeal; Bastion meet Halyard
  at Nahasia (holds station 2.3 km, rel. speed 0.04 m/s). ETA estimates are rough.

Next (Dave, 2026-10-01): a new carrier modelled in Blender, styled after a BC-304 Daedalus, laid out like
a Starfleet ship (bridge, astrogation, engineering, quarters...), game-ready low poly, with an interior
rendering system (only nearby rooms drawn). Dave wants: plan in text -> sketch -> model.

## The new Bastion (Blender) (uncommitted; built in Blender, loaded and walked in test tabs)

Dave: a Daedalus-style carrier laid out like a Starfleet ship, game-ready, with an interior rendering
system; repaintable exterior; a captain's yacht blended into the hull and launchable escape pods.
Flight bays moved aft at Dave's request; scale 900 m approved.
- `src/sim/layouts/bastion.js`: the single source (decks 1 +42, 2 +37, 3 +12, 4 0, 5 -12; 124 rooms,
  56 doors, windows, 3 multi-stop lifts, 2 bays with 7 pads each and forward mouths, yacht recess +
  dock, 16 pods at 8 stations, hull shapes, colliders, 387 lights). `node tools/export-layout.mjs >
  tools/blender/out/bastion-layout.json` feeds `tools/blender/build_carrier.py` (run in Blender via the
  MCP: exec the file, then build('exterior'|'interior'|'craft'|'export'); each MCP call starts with a
  fresh namespace, so exec it every call). Output: assets/models/bastion.glb (+ assets/blender/bastion.blend).
  Exterior ~7.6k tris (paint mask in vertex colour 'paint': R main, G second, B stripe, A grime),
  interiors 125 objects ~37k tris, yacht + pod templates. Blender lessons: touching coplanar shells
  break EXACT booleans (sink parts 0.5 m, cut per piece, then join); the default scene's Cube got
  exported until selection was set per view layer.
- Game: vendor/addons (GLTFLoader + utils, three r186 unchanged). `CARRIER` built from the layout
  (doors as rooms, zones = bays with `mouth`, `hatches`); `render/glbShip.js` (material swap by name,
  `liveryMaterial` / `setLivery` with plate seams in object space, `visibleRooms`: room + 4 graph steps,
  bays when near; `GlbCraftVisual` for yacht / pods); BigShipVisual.showRooms; old procedural carrier
  removed from bigShips.js. Multi-stop lifts open `ui/apps/lift.js` in the suit host (aspect per app).
  Yacht ('Kestrel') and 16 pods are vessels (`seatOnly`, `SeatInterior`), docked by `Game.dockCarried`
  (berth pseudo-zones), boarded at hatches (F), launched by any thrust (`launchCraft`), F in the seat
  leaves them (hatch if docked). Nav computer: bays via mouths and free pads. startAboard: starboard
  bay pad 2.

After a reboot: restart the dev server (`preview_start` with launch config `starseed`, or
`python3 tools/serve.py 8765` in ~/dev/starseed).

### Files new this session (0f13fab4), all uncommitted
- sim: `src/sim/items.js` (items registry), `src/sim/floraField.js` (solid flora), additions across
  `ship.js` (nesting, gravity, doors, colliders(inner), ground vehicles, hover pads, flora contacts,
  restsOn), `interiors.js` (ramps, entries, exits, spotInside), `player.js` (exit up the chain,
  boardByRamp, collideFlora, craft prompts), `navComputer.js` (levelSpot, no-FTL hops),
  `vesselTypes.js` (CART, CRATE, TANK, LIFTER, DROPSHIP, FIGHTER, restHeight, rotated door boxes),
  `game.js` (parkCraft, zoneAdmits, rehome, clampCargo, toggleClamp, craftInteract, craftStack,
  itemInteract, putDownItem, listed, effMass).
- render: `src/render/itemVisuals.js`, `glbShip.js` (parts swung from door state, liveries per type),
  `lightRig.js` (extra lights), `planetTerrain.js` (shares clearings / flora with the field).
- ui: `src/ui/apps/inventory.js`, quick menu (clamp, container doors, Climb into, escape pods toggle,
  inventory), Fleet filter, test scenes "Cargo run: the cart / the lifter".
- tools: `tools/blender/build_craft.py` (-> assets/models/craft.glb, assets/blender/craft.blend),
  `tools/blender/check_zfight.py`, testkit `vantage`, `chain`, `hold`.

### Z-fighting pass (verified: Blender checks 0/0, bay floor clean in a test tab)
Dave saw z-fighting on the bay floors. Not the depth buffer: reversed-Z with a 32-bit float depth
texture is already in use (log depth only as a fallback), and rendering is camera-relative in doubles
on the CPU before anything reaches the GPU. The faces really were coplanar (the bay cut vs the bay
room's floor). `tools/blender/check_zfight.py`: `zfight()` (coplanar, same-facing, overlapping faces
that look different) and `intrusions()` (hull faces that cut through a room, facing into it). Fixes in
build_carrier.py: cavities cut 0.5 m bigger than their rooms; window cuts stop at the wall plane;
bay passages / galleries punched through the skin (`punch`: no cavity faces) with sleeves across the
gap to the pods; pods' outer top edge reshaped (POD_RIDGE) so the bay's corner stays inside it; spine
moved aft of the island lounge; stern engine block proud; catwalk sign fixed; frames 1 cm off planes.

### Items and inventory (session 0f13fab4, verified in a test tab)
Dave: a basic inventory and object system with a few items; put them down in a ship, fly it to a planet,
check they're still there. `src/sim/items.js` (world state: one registry `game.items`; an item is held
by a character, your inventory being what you hold, or rests in a frame: `vessel` (ship-local, rides
along with any flight / FTL / docking), `surface` (body-fixed), `orbit` (analytic, dropped on EVA);
a destroyed ship's items go onto the wreck's orbit). Types: toolbox, medkit, supply crate, fuel
canister, field lamp (feeds the light rig's fixtures: `lightRig.update(..., extra)`), coffee mug;
the starter kit is all six. `render/itemVisuals.js` (plain shapes, camera-relative), `ui/apps/inventory.js`
(I, or quick menu > Suit computer; pick a row to put it down 0.75 m ahead, stacked, at your feet if
facing a wall: `interior.spotInside`). F picks up what you look at within 2.6 m (before seats / doors).
Aim from `player.computeCamera` at the moment, not last frame's camera: a planet moves ~500 m per frame.
Verified: six items down in the Wayfarer in orbit, nav computer FTL hop + entry + landing on Moadeal:
every item 0 m moved in the ship frame, world round trip < 1 micrometre; the canister carried down
the ramp and put down on the ground stayed 26.387 m from the ship over 300 s of warp (2,507 km of
travel). Not yet tried: items in the carrier's bay through an FTL jump (same mechanism).

### Vehicles, landers, cargo, nested volumes (session 0f13fab4, trip verified in a test tab)
Dave: a cart for the bays; a single-seat lander, an Aliens-style dropship, a lifter with a big cargo
space; a hover-tank as cargo. The trip: cart into a container, seal it, clamp it to the lifter, fly
the carrier to a planet, land, open it, drive out. Also: drive out of a container in a lifter straight
onto the bay deck ("skipping the lifter"), and drive out of a bay / a hovering lifter and fall.
Design (world vs player state, see memory): volumes nest only through declared zones (snug ones check
fit, door-gated ones need the door open); clamps are attachments, not volumes, so leaving a container
re-homes up the chain (`Game.rehome`: container -> bay -> planet). Zone gravity 'host' = what the host
feels (`Ship.feltGravity`). Doors are world state (`v.doors[id]`), colliders swing with them
(`boxPenetration` hinge/angle). Siblings in a host collide (`contactsSiblings`), free craft collide
with any free host's colliders (`contactsVessels`). Ground vehicles: legs as wheels/pads
(`groundControl`, `wheelForce`). Types CART/CRATE/TANK/LIFTER/DROPSHIP/FIGHTER in vesselTypes.js,
models from `tools/blender/build_craft.py` -> assets/models/craft.glb; parked by `Game.parkCraft`;
test scenes "Cargo run: the cart / the lifter". Keys: F get in / doors, Y clamp, R ramp; quick menu
has container doors and "Climb into" for craft in the same stack.
Verified (seed FSPB-8DTW): cart drives up the ramp into the container (re-homes into its hold), F out
through the door, F at the panel shuts it; lifter (test autopilot via `v.auto` with its nav muted)
lands straddling it, Y clamps (4-deep chain, effMass 48.4 t), flies it to another pad; door + "Climb
into Mule" from the lifter seat, cart reverses out onto the bay deck skipping the lifter; Bastion FTL
to Prelglopri with the stack aboard; lifter nav out of the bay and down (no FTL: hops); Y releases,
F out, F opens, F into the cart, out onto the regolith; the stunt (lifter hovering at 700 m, cart off
the ramp: "Hull breach on impact at 32 m/s"); dropship releases the hover-tank in the bay.
Fixed on the way: container floor thinner than a sagging wheel (inner colliders: `type.inner`); audio /
camera shake / HUD divided by zero thrust for ground vehicles; feet <= 0.3 m ignored on terrain; one F
handled twice (out of a seat and straight back in); reach measured from the feet (now the eye);
items put down in basins at R; nav computer: settles on level ground near a site (`levelSpot`, also
avoiding flora), no-FTL craft hop instead of aligning for FTL; cargo / vehicles settle on rough ground
(`restsOn`); dropship legs 3.9 m and clamp 5 cm clear (the tank used to be released into its belly).
Hover-tank (Dave): pads are active (weight + spring to ride height 0.9 m, push 3 g, pull 0.6 g down
within 2.5 m: hugs crests), turns spin up over ~1 s, sideways drift dies in ~1.2 s. Controls still A/D
turn: Dave wants Battlezone II handling (mouse turns, A/D strafe).
Polish noted: the cart's steering wheel fills the view; vehicles show flight HUD items (FA, gear, FTL);
the dropship ramp can't reach the ground with the tall legs (kneeling gear); chase cam framing.

### Every ship walkable (session 0f13fab4, built and verified after the compaction)
Verified in a test tab: tank (F at the canopy side -> canopy lifts, cockpit; driver's seat flies, mouse
turns 25 deg, W 9 m in 2 s, D strafes right; aft through the doorway into the compartment; with the ramp
shut you stop at the back wall; the inside panel opens the ramp; down it onto the bay deck and back up);
fighter (canopy lifts in ~0.5 s getting in and out); Kestrel (carrier hatch -> salon; cockpit seat;
launch from the berth; landed on Moadeal at its rest height; out through the port airlock onto the
ground and "Climb into Kestrel · airlock" back in; hatch up into the Bastion); Cheyenne regression (up
and down the open ramp; shut ramp stops you). craft.glb / bastion.glb rebuilt, z-fight checks 0.
Fixed on the way:
- Rooms' open sides behind a door are open only while it is (`gate: { side: doorId }`, `openSides`):
  the tank compartment, the Cheyenne troop bay, the container hold (you walked out through closed ramps).
- Small craft's closed rooms meter exposure on their own lamps (`Game.inCabin`): the Kestrel was black.
- A craft leaving its host mid-frame (launch, out of a bay) now flies free for the rest of the frame's
  substeps (it sat out the frame: 15-30 m behind its carrier).
- Free craft's contacts with a host that was already stepped this substep use the host's position at
  the step's start (`v._stepT`, `contactsVessels(F, T, dt)`): in orbit the carrier was 15 m ahead along
  its track, so the Kestrel's tail hit the keel on launch and the stiff contact blew up (33 m/s
  "impact"). Kestrel launch drops 8.5 m (its roof was flush with the hull).
- `landShipAt(b, dir, heading, s)` (any craft): rest height from `restHeight` and leg footprint for
  non-shuttles (the yacht started 3.75 m underground and bounced onto a tree), clearing radius from the
  craft's size, the world clock restored after settling.
- Away from their berth, home craft (yacht, pods) are boarded from outside like any other craft.
- Model fixes: tank canopy / pad faces, crate posts / screen (z-fight), the Kestrel's step under the
  cockpit doorway (you saw space through it), port bench split around the airlock, airlock room 1 m
  into the salon (rooms must overlap by more than a body width).
- The lifter cradle clamp with the new tank and the low-g pull were not re-tried.

### Polish (queue F) and items through FTL (queue G), done; verified in a test tab
- Ground vehicles' HUD: no FA / HOLD / gear / FTL chips or attitude ladder / altitude tape / docking
  guides; "DRIVE · HOVER|WHEELS", km/h, ramp, PARKED / zone; flight data Speed, Heading (from the
  body's north), Ride (hover), Gravity, air, Hull; no orbit rows (`Hud.groundSpeed`). Ramp chips for
  door ramps (dropship, tank) too.
- Cart: driver's eye 1.22 m (was 1.05), the wheel lower / further and a rim with spokes (was a solid
  disc): only its top shows at the bottom of the view.
- Dropship console: two small displays, one per seat (one strip the console's width glowed too much).
- Chase cam: higher and further (R x 0.62 up, x 2.1 back), aimed ahead of the craft; catches up fast
  when it lags more than ~45 deg (it could swing out in front in a fast turn).
- Cargo craft landing: a craft carrying cargo searches meadows to 900 m and rings to 680 m, slope
  weighted x2.5 (`levelSpot`).
- Paint app (`src/ui/apps/paint.js`, quick menu > Suit computer > Paint): ships with a paint mask
  (`hullOf(v)`: the Blender-built ships; GlbCraftVisual keeps `this.hull`), part main / second /
  stripe, 18 colours, Factory colours; `v.livery` is world state, `setLivery` live. Verified by pad.
- Items through FTL: toolbox + medkit put down in the Bastion's bay, Bastion nav-computer FTL to
  Prelglopri: max drift 2 micrometres relative to the carrier the whole way.
- Not done: save / load (nothing persists across reloads: vessels, players, items, liveries, doors
  would all need saving); Fleet / nav for ground vehicles; the Bastion hovering low over heavy worlds.

### Travel compression (Dave's per-player time warp idea; done, verified in a test tab)
Dave: "perhaps just have their PHYSICS go faster, except for the orbital bodies". The clock stays one
(world state); when a player asks for more warp than it allows and only someone ELSE holds it
(`warpBlockers()` lists reasons with `who` / `v`), that player's ship alone travels faster:
`player.travelIndex` (a warp level), `Game.canCompress(p)` (aboard a root vessel coasting free in space,
out of air and well up, drive idle, nobody else aboard, no other player within 50 km),
`compressTravel(dtReal)` after the world's step moves the ship's rails anchor back (`railT0 -= extra`)
in `railSteps`-sized steps, stopping at air / the ground, then `syncTree` (everything aboard rides
along); `v._compress` keeps it coasting on rails (assist resting as in a warp) until the pilot thrusts
(`rootMode`, `railStep`). When nobody holds the clock any more it becomes the world warp. Keys , / .
step your own rate while compressing; HUD chip "TRAVEL ×50 · YOUR SHIP"; messages say why.
Verified: P2 on EVA (holds x4), P1 in the Wayfarer 1,500 km up asks x50: the ship advanced 12.5x the
world rate (50 / 4) along an unchanged orbit; W pauses it (off rails), coasting resumes it; P2 sitting
down released the clock and the world went x50 for both.

### Carrier sliding doors (queue E, done; verified in a test tab)
Star Trek style, world state. `CARRIER.slideDoors` (vesselTypes.js `slideDoor(d, rooms)`): per layout
doorway the passage axis, the plane between the two rooms' walls (the leaves close there and slide
into the wall), the opening along the wall, its height (all 56 are 2 m wide). State `v.doors[id] =
{open, target, hold}`; `Ship.updateSlideDoors(dt, walkers)` from `Game.simulate` with every player
walking aboard (within 4.5 m either side: open in ~0.3 s; closes 1.5 s after the last one leaves, at
walking-pace time). Passability: `RoomInterior.shut(r)` (a doorway room whose door is under 0.7 open
neither fits nor takes the slide-along-walls fallback). Visual: `BigShipVisual.buildDoors` (two
fixture-lit leaves + a cyan strip each, drawn with either room, hidden when fully open), `updateDoors`.
Verified: corridor -> Astrogation (opens 0.41 / 0.82 / 1.0 as you walk up, closes behind you).
Fixed on the way: corridor wall ribs every 4 m were built across doorways (a full-height post in the
middle of Astrogation's door): `build_carrier.py` ribs now skip doorways and windows (interior rebuilt,
z-fight 0, intrusions 0, 34.4k tris).

### Meadows (queue D, done; verified in a test tab)
Dave: "we could programmatically DESIGN the trees not to populate around optimal flat points".
`src/gen/flora.js`: every 320 m cell (3D grid over the surface, `MEADOW_CELL`) tries 7 seeded points,
keeps the flattest on the terrain smoothed to ~40 m features over 60 m both ways (`broadSlope`), and if
under 0.07 it is a meadow 35-80 m across (`meadowCell`, cached on the species object; kept for a share
of cells = `species.meadows`, from `meadowAmount`: 0.7-1.0 on living worlds, 0.5-0.8 barren).
`meadowAt(gen, dir, h, species)` 0..1 (1 inside 70% of the radius); `scatterFlora` scales trees by (1 -
m), shrubs (1 - 0.75 m), rocks (1 - 0.85 m), ground plants up (1 + 0.4 m). Deterministic: renderer and
FloraField agree. `meadowsNear(gen, species, dir, radius)` lists them; `NavComputer.levelSpot` scores
them alongside its ring search: from 5 test points near Moadeal's landing site every pick landed in a
meadow 40-260 m away (60-90 ms per search). Moadeal: ~4% of land is open meadow, one every ~500 m.
Seen from 45 m up: an open clearing ringed by forest. (A first try with a noise field gated by local
slope came out salt-and-pepper on hilly ground.)
Dave asked "Wait worlds are one big biome?": climate biomes exist (ground colour, density, desert,
snow, ice; the catalog lists them) but each world has ONE tree / shrub / ground-plant species and the
colour tint is random per plant, so walking around it reads as one biome. Offered: per-biome flora sets
(conifers boreal, broadleaf temperate, canopy rainforest, flat-tops savanna, spires / cacti desert,
tufts tundra) chosen in scatterFlora from temperature and moisture, colours by biome. Awaiting Dave.

### Pause screen with tabs and a planet catalog (queue C, done; verified in a test tab)
Dave: "when you hit Map/pause I want there to be a tabbed view like many games. And on another page, a
catalog of planets in the current system, with the ability to put in the seed of another system. The
catalog should have a small-sized picture, along with basic generation details like zone from the
star, biomes present, etc."
- `src/ui/pauseScreen.js` (`PauseScreen`, in main.js as `pause`, `window.pauseScreen`): tabs Map ·
  Planets · Settings (the old pause menu: sliders, players, share link, Test scenes as a sub-page,
  Change system) · Controls (keyboard + controller per mode, from `Hud.helpBody`). Esc / Start open it
  (last tab), player 1's M / View open the Map tab (M again or Esc closes), H while paused -> Controls,
  LB / RB switch tabs (padMenu), B / Resume close. While open the game is paused and #hud hidden; the
  opening title card is dismissed.
- Map tab: `MapView.openFull(p)` / `close()` / `full`; `Game.frame` draws only the map, full screen,
  while it's open full; a card for the focused world on the right (Target, In the catalog); pad: right
  stick turns, triggers zoom, D-pad left / right step worlds (`padUpdate(ps, dt, embedded)`).
- Planets tab: star line, the briefing's schematic (`drawSchematic` exported), a card per planet with its
  moons after it: a 96 px portrait, zone from the star (`zoneOf`: habitable zone and its edges, snow
  line; moons: their planet's), orbit + sunlight, day, temperatures, gravity + size, air (pressure, top
  two gases), seas, life, moons / rings, ESI; what covers it in chips (biomes, ocean, ice, plains...);
  Show on map / Target. Seed field: Look up (another system's catalog, generated on the spot), Random,
  Back to this system, Travel there (its briefing, then Launch).
- Portraits: `src/gen/portrait.js`: `terrainPortrait(gen, {size, atmo, overcast})` samples the
  generator's own surface (`sample` + `shade`), lights a disc, glints on seas, glows lava, tints the
  limb, covers greenhouse / titan worlds with their deck (`portraitLook(body)`); `terrainCover(gen)` is
  the cover from 1500 samples (`biomeName` exported from settlements.js); `giantPortrait(body)` bands +
  storms on the main thread. Worker job 'portrait' (another system's body comes with its `terrain`
  params, keyed 'seed:id'); ~20-30 ms per world. Cached per 'seed:id' on the pause screen.
- Fixed on the way: resuming a closed AudioContext when a new system replaces the game.

### Live viewscreen (queue B, done; verified in a test tab)
`type.viewscreen` (tank: { at, size, cam, pitch, fov, room: 'bay', res: 320 }); `Game.addScreen(v)` makes
an offscreen `EngineView` (`engine.makeOffscreenView(w, h, fov)`: its final tonemap pass writes linear
into an sRGB texture, `uEncode` 0) and a MeshBasicMaterial panel (colour x2.4, like the other screens)
on the craft's model, over the static glow face. `renderScreens(dt)` runs before the players' views,
only while a player stands in that room, every other frame: borrows the watcher's camera for a full
world pass (lighting, light rig, visuals dt 0, terrain LOD, sky, effects; `screenPass` keeps the meter
outdoor and the near cut off), its own exposure adaptation. Cost in the test tab ~0.5 ms CPU per frame
while watched. Shows the bay ahead of the tank's nose from the compartment.
Dave: "ALL ships must be walkable and have at least a basic interior" (the Cheyenne could only be
entered from outside); the hover-tank rides with the lifter (cradle / a box), not the dropship; pads
pull down only on light worlds ("it's fun to get a bit of air over a hill"); tank: Battlezone handling,
a cockpit with a canopy that lifts, two seats or a rear compartment with a viewscreen.
- `RoomInterior` now serves small craft too (`makeInterior`: any type with `rooms`): `ramps` (a door
  that, open, is a walkway: `rampAt`, `offRamp`, `boardable`), `entries` (F from outside at
  `outside` climbs in to `inside`; F at `inside` climbs out; `canopy` lifts an auto door; `whenFree`
  only when not docked), rooms with `exitTo` (walk out through an open side: put there), `homeHatch`
  (a docked craft's hatch up into its host). Walking up any landed craft's ramp boards it
  (`Player.boardByRamp`); seats in walk-in craft stand you up inside; open vehicles keep "Get in".
- Cheyenne: troop bay + doorway + cockpit (2 seats), ramp 117 deg to the ground, normal legs, no belly
  clamp (verified: up the ramp, to the seat, F, back out onto the Bastion's deck). Wing slab split (it
  crossed the bay). Lifter: flight deck + port hatch (verified both ways). Container: walkable hold
  (verified). Kestrel: cockpit / salon / cabin, hatch overhead to the carrier, port airlock when free
  (written, not built yet). Tank: redesigned wedge (cockpit 2 seats under a canopy, rear compartment,
  ramp, static viewscreen panel; mouse turns, A/D strafe) — written, not built yet. Fighter: canopy part
  that lifts (auto door). Next: build + test those, the live viewscreen (render-to-texture through the
  engine's pipeline), pods stay seat-only.
- Blender: `face`, `room_shell` (rooms seen from inside, with doorway holes and low walls) now in
  build_carrier.py; craft use `punch` for hatches; open hulls (dropship, tank) are wound by hand in the
  skin (recalculated normals turn open shells inward).

### Solid trees and boulders (session 0f13fab4, verified in a test tab)
Dave saw the tank pass through trees: "we want the worlds to feel physically real". `src/sim/floraField.js`
(per body, `floraOf(body)`): the same deterministic `scatterFlora` the renderer runs, computed on demand
per node (~2 ms) or ingested from the renderer's results; trunks as upright cylinders (radius from the
species' trunk proportions), rocks over 0.3 m as spheres, in a 16 m spatial hash; clearings shared via
`body.floraClearings` (planetTerrain uses the same array; `prune` on a new clearing). Vessels:
`Ship.floraContacts` (hull boxes vs trunks / rocks, rocks under feet and wheels); walker:
`Player.collideFlora` (round trunks, onto boulders). Verified: tank into a 0.8 m trunk at 11 m/s, stopped,
hull 71%; walking into a trunk stops at radius + 0.3 m.

### Two local players, split screen on two gamepads (session 0f13fab4 after the compaction; verified in a test tab)
Dave: "we need two player controllers. They must be able to be in separate planets, and only one can
own or occupy a vehicle at once ... how do we handle time warp? ... For now they can just be controlled
locally." (He linked it to the tank viewscreen: both are a second render of the world.)
- World vs player state: characters, vessels, `v.pilot` (who has a craft's controls), doors, items,
  the clock are world state; each `Player` also carries player state: `input`, `view` (an
  `EngineView`), `camMode`, `chaseQuat`, `target`, `route`, `ui` {hud, quick, suit, fleetApp,
  liftApp, inventoryApp, root, suitEl}, `ownShip`, `deathShown` / `respawnT`.
- `Game.players`, `Game.cur` (whose turn: their controls or view) + `setCur(p)` (also sets
  `engine.view`). `game.player / input / hud / quick / suit / camPos / camQuat / camMode / target /
  route` are getters for `cur || players[0]`, so old code works inside a player's turn. `screenHud`
  = player 1's HUD (loading cover, title card, help, restart card). `message()` goes to `cur`, or
  everyone outside a turn; `tell(v, text, kind, other)` to the players watching v (`focusOf(p)`);
  `aboardOf(v)`; `flashFor(v, ...)`.
- Frame: each player's pad poll + suit + quick menu + global keys (in their turn); simulate (each
  player's controls into the craft they fly, the world, each player's character); then
  `renderView(p, first, dt)` per player (camera, lighting, light rig, meter, visuals, world /
  terrain LOD, sky, effects, engine.render into their rect, their HUD). Animations advance in the
  first view only (dt 0 for the second; `ShipVisual` leg decay guarded).
- Engine: `EngineView` (camera, rect, its own HDR / depth / bloom / volume targets and eye
  adaptation, meterRef, flash, exposureBias, radialBlur, maxExposure); `engine.views`, `engine.view`,
  getters for the old fields (`engine.camera`, `flash`, ...; `adaptReset = true` resets all);
  `setViewCount(n)`, `layout` 'top-bottom' (default) | 'side-by-side', `viewRect`, the FOV setting is
  the full screen's vertical one and wide halves keep its horizontal field. The final tonemap draws
  into the view's rect (`setViewport`). The tank viewscreen can use another EngineView into a texture.
- Input: one `Input` per player (`kbm`, `padIndex`; player 1 keyboard + mouse + the first controller
  nobody holds); `Input.padsPressing('START', free)`, `Input.padIndices()`, `dispose()`.
- Joining (main.js): Start on a controller nobody uses, or pause menu "Add player 2" then Start on any
  controller (player 1's own: player 1 keeps keyboard and mouse); `joinP2(i)` / `leaveP2()`; pause menu
  shows the pad, Remove player 2, split top / bottom or side by side (setting `split`). Player 2 is
  re-added after a change of system. Each pad's router (`padRouterFor(i)`): their suit, quick menu, the
  map when it's theirs; menus are player 1's, anyone's Start pauses.
- Player 2 gets their own shuttle "Kittiwake" SV-28 (`game.ship2`), parked by `placeShipBeside` (beside
  player 1's on the ground / a free pad in the same bay / 60 m off in space / on the ground under a
  low-flying one) and is put beside player 1 (`regroup`). New starts regroup everyone.
- Vehicles: `v.pilot` replaces `pilotPresent` (kept as a getter / false-setter). Dave: "a specific
  pilot seat per vehicle, not controls for anyone seated anywhere": every craft's pilot seat is marked
  `pilot: true` in its seats (`pilotSeat(type)`; the carrier's command seat in layouts/bastion.js);
  only whoever sits there flies it (`sitDown` sets `v.pilot`, `releaseControls` clears it). Any other
  seat (co-pilot, gunner) rides along, even alone. A seat holds one player (`seatHolder`, `sitDown`
  returns false when taken). Riders: `Player.flying` false, `game.piloted` null, free look, PASSENGER
  chip, no ship keys, no nav computer. Prompts via `seatOffer` ("fly X", "ride along", "taken"). P
  (lastSeat) remembers pilot seats only.
- Shuttles are anyone's to bump into and board: `shuttlesOn(b)`, `rampSupportOf`, `collideShuttle`
  (was the home ship only). Summon (B) / P recall use your own ship; L floodlights any shuttle.
- Time warp: one clock (world state). Any player can change it; `warpBlocker` checks every player
  (EVA, in the air) and every piloted craft, naming the player. Dave's idea of per-player physics
  speed-up was considered: it works with body-centred frames for a lone ship but not for the sun / day
  or rails (analytic in world time); queued as "travel compression" for a ship far from other players.
- Loss: with someone still playing you're back beside them 3 s later (your shuttle parked by theirs);
  alone, player 1 gets the restart card as before.
- HUD: per-player root (`.hudView` clones, classes instead of ids), P1 / P2 tag, other players'
  markers (`drawPlayers`); suit screens per player (`.suitScreen` clones over their half); the map
  opens in its owner's view (`map.owner`, `render(dt, rect)`); audio follows player 1.
- Test kit: `TK.pads(n)` stubs controllers, `TK.pad(i).press / release / tap / stick`.
- Verified (stubbed pads, seed FSPB-8DTW): Start on pad 2 joins (split top / bottom, both HUDs, P1 / P2
  tags, P2 prompts in pad glyphs); Kittiwake parked 60 m off the Wayfarer in orbit / on a free pad of
  the starboard bay after startAboard; Cheyenne: co-pilot seat alone flies nothing, the pilot seat
  flies, P2's stick in the co-pilot seat moves nothing, P2's right stick looks around, X stands; P1's
  pad walks P1 only; P2 flew the Kittiwake by nav computer (FTL) to orbit of Nahasia while P1 walked
  the Bastion's bay at Moadeal, both views drawn (62 fps in the small pane); P1 asked x1000 with P2
  in orbit (allowed), P2 stepping out on EVA dropped it to x4 ("EVA in progress (Player 2)").
  Found and fixed on the way: an old `message()` later in the class overrode the new one.
- Also verified: P2's pad opens their quick menu (D-pad left), the map in their half (View; B closes),
  their suit's Fleet app over their half (D-pad moves); side by side; leave + rejoin (one view again,
  clones removed; on rejoin P2 and the Kittiwake come back to P1's bay, P2's inventory kept for them:
  `awayPlayers`); P2 on Nahasia's surface while P1 orbits Moadeal (terrain to level 15 in ~10 s);
  Kittiwake destroyed under P2: no restart card, P2 back beside P1 3 s later, Kittiwake rebuilt 60 m
  off the Wayfarer. The mode strip now wraps inside its view.

## Still queued

In order (session 0f13fab4):
A. Finish "every ship walkable": build craft.glb + bastion.glb, test the Kestrel, the redesigned tank
   (canopy, 2 seats, compartment, ramp, Battlezone controls), the fighter canopy (START HERE above).
B. Tank viewscreen showing outside: a hull camera rendered into a texture through the engine's own
   passes (sky, atmosphere, tone mapping), shown on a separate 'tank:viewscreen' part, only while
   someone is in the compartment (it costs a second scene render).
C. Map / pause becomes a tabbed screen like many games; one tab a catalog of the system's planets
   (small picture, generation details: zone from the star, biomes present, etc.), with a field to
   enter another system's seed. (Dave: next feature after vehicles.)
D. Meadows in the generator (Dave): flora leaves natural clearings on flat ground (in `scatterFlora`,
   shared by renderer and physics: deterministic, e.g. no trees where slope is tiny and a coarse
   patch hash says meadow), so landers find open flat spots. Destructible trees later (a lander
   flattening them): Dave "a bit much right now".
E. Carrier sliding doors (Star Trek style, open on approach): open state as world state on the vessel
   (`v.doors`, driven by any actor near), leaves as nodes in bastion.glb, animated by the visual.
F. Polish noted: the cart's steering wheel fills the view; vehicles still show flight HUD items (FA,
   gear, FTL); the dropship console Screen glow is too big / bright; chase-cam framing (it often shows
   the craft from the front); a stricter level-landing for cargo craft (hover and search wider);
   Fleet/nav for ground vehicles (none now); live liveries "Paint" app; the Bastion can't hover low
   over heavy worlds (belly 0.03 g), so "drive out of the bay and fall" only works from a lifter.
G. Items: save/load (nothing persists across reloads yet); items in the carrier through an FTL jump
   (same mechanism, untested).

0. Controller design (Dave is weighing it): rebinding screen (PAD_LAYOUT is already the single source,
   so a per-mode remap stored in settings would flow into the help diagram and the prompts), a held
   modifier layer, hold-vs-tap, maybe a radial quick menu for rare actions.
1. Nav computer on N (see the plan in git history of this file / below).
2. Keyboard control rework (W/S throttle, landing mode tied to gear, ramp B, stand Y).
3. Target registry list + 2D tactical page in the map.
4. Republish the artifact (v2 lacks everything since the fleet), when Dave is happy.
5. Better models with Blender MCP (see First steps) and more interior function: lifts and decks inside
   the carrier ("these are GREAT first drafts, but we want more").
6. Dave's original wishlist still open: an autopilot (now the nav computer), and his controls proposal
   (item 2).

Nav computer plan (from before): target via Tab/T/map, N flies the whole trip, any flight input hands
control back; HUD phase + ETA. Ship target: lift off, climb out (heat limiter), burn out of the mass
lock, FTL (drop 6 km matched), approach from above via waypoints (never through hulls), land on a free
pad / fly into the hangar, dock (the test "docking computer": `s.targetVel` relative to the target,
frame `vessel:<name>`, gain 0.3 capped 120 m/s, waypoint (0, 140, padZ) then (0, 32, padZ), then
lift -1 inside the zone until attached; hangar: line up outside the door, <= 22 m/s in, brake past
x=-95, descend). Planet target: FTL to its lock boundary, deorbit, heat-limited entry, land at the
reticle point (T) or the best surveyed site.

## Gotchas learned

- (0f13fab4) Coplanar faces z-fight whatever the depth format: cut cavities bigger than their rooms,
  stop window cuts at the wall plane, punch holes through skins (`punch`), check with check_zfight.py.
- (0f13fab4) Thin colliders push sagging wheels through: hosts get thick `inner` colliders for what
  is inside them. Point-contact friction never sticks: settle cargo / vehicles with `restsOn`.
- (0f13fab4) One key press can be read twice in a frame across modes; skip on-foot interaction in the
  frame you leave a seat. Aim from `player.computeCamera()` now, not last frame's camera.
- (0f13fab4) Ground vehicles have zero thrust limits: never divide by them (audio, shake, HUD).
- (0f13fab4) Blender: recalculated normals turn open shells inward (wind those by hand); a slab that
  spans a hull crosses its interior; EXACT booleans on multi-shell solids are risky (cut per piece).
- (0f13fab4) Releasing cargo overlapping another collider launches / destroys it: leave clearance.
- (0f13fab4) `groundHeight` is negative in basins; never clamp it at 0 for placing things.

- GLSL ES 3.0 reserved words (`patch`) silently kill a shader; `renderer.debug.onShaderError` now
  surfaces compile failures on screen.
- Stiff contact springs need <= 1/120 s steps; never integrate a piloted craft with a frame-sized step.
- Spacewalk state is inertial (km/s): integrate it with exactly the world's dt.
- First frames after a big ship first appears can be black while shaders compile; `spawnFleet` calls
  `renderer.compileAsync`.
- Lift trigger points must be within reach of the door the player walks to (2 m radius).
- Hidden-pane screenshots and timings are slower than real; the pane tab may still render.
