## Flowing groundwater follow-up (2026-10-08)

Wet intrusions now have continuous downward streaks, ballistic impact droplets and
expanding pool ripples, with stronger cascades for aquifer breaches. Water starts at
the rock ceiling and reaches pools on the cavern floor. Fixed instance counts and
conservative current-frame bounds keep the effect bounded; this is visual flow,
not a fluid solver. Dry environments create no streams or effects.
Five focused CPU checks pass (flow direction/bounds, seed variation, lookout route,
and rendered clearance). The aquifer HALL-6 native fixture passes 13 checks including
animated matrices, native rendering, complete recovery and reload, with no errors.

## Wounded generator hall (2026-10-08)

The 128 × 164 × 100 m collection volume now contains six 67 m generator towers.
Exactly one survives, chosen by a separate seeded stream; its identity is stable across
visits, and all six positions occur. Slow failed-start envelopes drive its emission,
local light, sparse sparks and a sag in the maintenance supply. The hall supply follows elapsed survey time;
individual time-anomaly rooms retain their own machinery clock. No occlusion queries or prior-frame visibility.

Three environmental wounds vary by seed: tectonic shear, a cooled igneous intrusion,
or an aquifer breach. Native integration passes the planet's life, liquid-water and
vegetation-colour data. Aquifer seepage requires water; damp colonies require both life
and water. These are sparse visual mats, not simulated planetary flora or deep roots.
The standalone demo defaults to a wet living environment; `environment=barren` exercises
the dry, lifeless variant. Historical geological damage is not a live tectonic simulation.

The upper crossing has an optional 58 m service branch through a real opening in the
rear wall to an 18 m lookout. It has matching support/collision, open rail junctions,
later bracing through broken decks, an optional observation and persistent map discovery.
Beyond it is a 560 m wide, 900 m deep distribution chasm with actual layered geometry
and human-sized bays. The lookout is walkable; that distant extent remains scenery.
The original final-cache route, circuits, 125 raw units / 170 maximum credit, 200/500
milestones and immediate extraction after the 90-unit cache remain intact. Old saves
retain progress; the new lookout discovery defaults to unseen.

Validation: 42 CPU checks, including all 21 theme profiles, seed coverage, old data
recovery, ordinary walking to/from the lookout and raycast headroom against rendered
reactors/rock along each crossing. Native finite fixtures passed 12 checks each on
SUMP-07 (Weight/Light, generator 01, igneous) and HALL-6 (Pressure/Resonance, generator
05, aquifer), including reload, map, return, and changing core-light output, with no
JavaScript/WebGPU errors. The final lighting/material pass was rechecked on SUMP-07.
This pass did not run planetary workers or change the shared renderer/general physics.

## Decayed infrastructure and Golden Path recovery (2026-10-08)

The collection hall is now 100 m tall from sump bottom to ceiling, with crossings at
12, 26 and 42 m above its original deck. Walkable service stairs/galleries leave the
hall through real wall openings and bring the player back over earlier routes. The
local capsule uses continuous ramps under visible stair nosings. Only this landmark
has the repeated vertical route; the ordinary basements remain compact.

Low-gravity traversal follows broken service slabs on piers with fallen spans, exposed
bars and damaged rails. Hard-light crossings are emergency equipment replacing a lost
maintenance deck. Controls belong to pump/supply equipment. Six additional utility rooms
form a bypass loop with blind branches; large overhead pipes and solid corner machinery
leave navigable aisles. Some rooms have no reward or interaction. Existing service-grid
placement and themes retain their seeded streams.

Golden Path recovery rules:
- An automatic entry scan awards one unit once, with scanning/found/processing/find-more
  messages. Re-entry preserves it without replaying the award.
- Optional memory fragments award 1 or 3 raw units (site percentage points).
- The final upper backup cache awards **90 units** and enables surface return immediately.
  Completion does not require reaching 100% or collecting every side fragment.
- Within each site, raw units above 100 earn triple credit. Credit is capped at **170 per
  megastructure**. This layout offers 125 raw units, sufficient to reach the cap.
- Shared cumulative milestones are **200**, then **500** credited units. Excess is retained;
  further planetary megastructures remain valid sources at both stages. The first two
  decoded leads appear in field notes; destination/mission content beyond these journal
  leads is not implemented in this pass.
- The ledger records each site's highest recovery and credits only increases, independent
  of pickup order. Reloading/re-entering cannot duplicate rewards. Per-site payloads are
  version 4; earlier completed sites retain extraction and receive their 90-unit record.
  Native campaign, standalone demo and test ledgers are separate local-storage namespaces.

Browser validation: gravity/light and pressure/resonance each pass **11 finite checks**,
with no JavaScript/WebGPU errors. Captures verify the upper view, enclosed stairs, pipe
gallery and broken deck; the entry popup visibly awards one unit. No planet workers
were run in this pass.

CPU validation: **38 tests pass**, including all 21 profiles on two seeds with normal
movement, repeated-height traversal and walking descent, optional empty-room routes,
solid machinery, startup scan persistence, 90-unit completion, triple excess/cap rules,
per-site deduplication and both cumulative milestones. Add
`tools/tests/understructure-recovery.test.mjs` to the command below.

## Main-game integration (2026-10-08)

The frozen prototype checkpoints are merged into main. Each solid life-bearing planet has at
most one megastructure. The planet-level spawn chance is **100% for playtesting**, controlled by
`MEGASTRUCTURE_CHANCE` in `src/understructure/planetSites.js`; use `0.01` later for roughly 1/100.
Barren worlds and moons are excluded. Presence is deterministic per system seed and planet ID.

Choose a surface start on a living planet. On its first suitable arrival, follow the cyan pennant
near the landing craft, then press **F** at the hatch. That entrance is saved and reused across
other landing sites and reloads; those visits do not generate another megastructure. Inside: **E** interacts, **F** toggles
the hand light, **M** opens the surveyed map, **J** opens notes, **B** places a beacon. Recover the
site record to unlock **T** return or the access lift. T can also leave before descending.
Progress is saved per site, and re-entry permits further exploration.

`integration.js` hosts the generator/simulation/scene on the game's existing WebGPU renderer.
The world entrance is body-fixed; the local sector is a scene transition, not a carved planetary
shaft. World time continues at normal speed, the fleet stays alive, and split-screen permits the
other player to remain outside. `understructure.html` remains an independent development demo.
`tools/tests/understructure-game.html` verifies the complete native main-game round trip.

# Underground megastructure prototype

Owner: Starseed Megastructures (Codex). Current worktree: `starseed-megastructure-themes`,
branch `codex/megastructure-themes`, based on integrated main checkpoint 76a4eb0.
The previous prototype worktree and its inherited fleet changes are frozen.

Run `python3 tools/serve.py 8776`, then `/understructure.html?seed=SUMP-07&theme=gravity-light`.
This is a playable local sector using the production raw WebGPU DeferredRenderer.
No WebGL fallback, renderer backend modifications or general physics replacement.

## Exploration loop

A 1.3 × 1.7 m hatch is nearly flush with the ground. Its express platform descends
240 m through eight marked strata in 4.2 seconds, continuously and with eased endpoints.
The service floor contains seeded basements, storm drains and looping utility corridors.
A 128 × 164 m reservoir has walkable crossing and perimeter catwalks. A tall observation
room overlooks actual structural geometry 1.6 km wide, 1.2 km long and 900 m deep.
The immense volume is a view beyond the glass, not an accessible walking area yet.

Recover the **site record**, a provisional data objective whose meaning remains open.
One or two local circuits unlock its repository at the far end of lower collection.
Retrieving the record unlocks T for instant surface return and restores the express lift.
You can remain underground or descend again. Six optional observations, the discovered
map and return beacons supplement the objective; they do not gate extraction.

## Coherent site themes and easy mechanisms

Six themes provide **21 profiles**: six singles and every pair. A seed chooses one or
two themes; the entry panel can override that choice for testing.
Room-graph branches, chamber heights, phase periods/offsets/bands and threshold marks
vary deterministically. This is a small authored mechanism vocabulary with seeded
parameters, not unrestricted procedural puzzle synthesis.

- Weight: retrieve a charged cell in the zero-g Null Well using its local field tether.
  Carry it into the fractured return gallery, jump across 0.22 G ledges to its elevated socket,
  then return along those ledges. The cistern has 1.6 G and rising water; ordinary
  rooms retain 1 G. Gravity changes at room boundaries; its direction remains down.
- Time: machinery moves forward, holds, then rewinds in a twelve-second cycle. The
  player, input and collected progress remain unaffected. Align a sweep with a broad
  visible band and press E. Misses have no penalty; the timing window is 2–2.8 seconds.
- Distance: link a marked frame, cross it, then reconnect the far terminal. The paired
  thresholds join two remote chambers, preserving relative motion direction. They
  work both ways. This uses opaque thresholds and immediate local transforms, not
  recursive see-through portal rendering.
- Light: activate two hard-light bridge relays and cross to the far terminal. Bridges
  latch permanently, including across saves; this is not a timed disappearing path.
- Pressure: cycle a cistern valve to match a visible reference gauge. This is a local
  circuit puzzle, not a gas simulation or suit-oxygen timer.
- Resonance: press three plates in the displayed order. The next plate stays visible;
  an incorrect choice keeps progress. Pulses are visual; audio is not implemented.

## Controls and persistence

WASD walk/thrust; mouse, drag or arrows look; Shift faster; E interact; F hand light;
M map; J notes; B beacon; T surface return after retrieval; Escape pause.
The jetpack is offline throughout the survey. In the platform rooms, Space triggers
a ballistic jump; holding it cannot fly or repeatedly jump. Missed jumps recover to
the last safe ledge without losing inventory or puzzle progress. In zero gravity,
the chamber field tether uses Space to rise, C to descend and R to brake. Drift
persists without input; this is chamber locomotion rather than suit propulsion.
The amber doorway is the gravity boundary; descend to its floor-level sill to leave.
The capsule tests chamber shell, ceiling and conservative floating-block envelopes.

The shared 3D survey map reveals discovered room volumes, real elevations, the access
shaft, raised paths, bridge states, known folded links, objectives, beacons and the recent
route. Drag to orbit, Shift/right-drag to pan, wheel or +/− to zoom, arrows to tilt/rotate.
Fit, Top and level filters help separate overlapping geometry; click a room or marker
to inspect it. Integrated gamepad look rotates the map. It uses a Canvas2D projection
of 3D geometry, without allocating a second GPU renderer.

Standalone progress remains keyed per seed **and theme profile** under the existing v2
storage keys; the payload is version 4. The main-game adapter preserves old saved site
themes when expanding the theme pool and saves explicit themes for future loads.
Loading starts at surface access with recovered data/circuits/notes/map/beacons retained.
Carried cells, partial plate sequences, pressure settings and bridge stages also persist.
Recent route traces are per visit. v1 prototype saves remain under their older keys.
Pause renders only a final changed frame; hidden tabs do not render. Active cap: 30 fps.
No camera visibility depends on previous-frame occlusion queries or results.

## Validation — 2026-10-08

Latest architecture and recovery pass: a triangular manifold, pentagonal exchange and
hexagonal distribution well connect through a walking loop of oblique service passages.
The well is 45 m tall (18 m below its deck and 27 m above), with two bridges crossing at
roughly 65 degrees. Seeded polygon plans drive both collision and visible geometry;
floor clipping removes coincident faces and wall openings follow the actual passages.
The discovery map shows these real polygons and saves `sectorsSeen`. The earlier tiled
basements remain as a contrasting part of the complex; this is not a conversion of every
room to arbitrary polygons.

One-unit data finds now belong to low, four-wheeled maintenance crawlers with loose
covers, cable spools, a weak scanner and occasional actuator movement. They are solid,
non-humanoid props; they do not roam or fight. The starter crawler still automatically
triggers the first Golden Path scan. Other logs use E to recover; animation settles after
recovery. Reward IDs and values are unchanged, preserving existing saves and site caps.

Current verification: **47 passing CPU tests**, including the four new polygon/crawler
tests and generator/recovery suites. The polygon tests walk the whole loop across six
seeds, check floor overlap, ray-test visible geometry for headroom along the route, and
check crawler collision, recovery and motion. The native gravity/light fixture passes
**14 checks**, including the complete loop, crawler recovery, flowing groundwater,
map and actual page reload, with no game JavaScript or WebGPU errors. Final render
captures are in the parent task's `outputs/megastructure-oblique/` directory.

```sh
node --test tools/tests/understructure-oblique.test.mjs tools/tests/understructure-generators.test.mjs tools/tests/understructure-recovery.test.mjs tools/tests/understructure-themes.test.mjs tools/tests/understructure-integration.test.mjs tools/tests/understructure-planet-sites.test.mjs tools/tests/understructure.test.mjs tools/tests/webgpu.test.mjs
```

Earlier validation milestones:

```sh
node --test tools/tests/understructure.test.mjs tools/tests/understructure-themes.test.mjs tools/tests/understructure-integration.test.mjs tools/tests/understructure-planet-sites.test.mjs tools/tests/webgpu.test.mjs
```

**32 passing.** Coverage includes 100 connected seeds, all 21 theme profiles on two seeds
using normal movement inputs, repository gating, retrieval and both returns, zero-g
inertia/braking, room gravity, ballistic jumping, fall recovery, bridge collision and
persistence, forgiving pressure/sequence circuits, folds/time, discovery-limited map
geometry/projection/levels, old integrated saves, planet site rules and renderer checks.

`/tools/tests/understructure.html?theme=gravity-light` and `?theme=pressure-resonance` each
pass ten finite browser checks without JavaScript/WebGPU errors. These exercise the
lift, catwalks, puzzle routes, 3D map orbit/zoom/filtering, retrieval, shortcut and actual
page reload. The fixture pauses on completion. Actual Space input was also checked:
a ballistic low-gravity jump rises and lands without enabling the pack. Actual M,
map level selection and arrow rotation were checked through the browser UI.
`?inspect=null`, `?inspect=jump`, `?inspect=map` and `?inspect=record` pause at useful stops.

`/tools/tests/understructure-game.html` passes the native gravity/light round trip:
physical hatch, shared renderer, both circuits, retrieval, shortcut and lift returns,
saved re-entry, split-screen with the other player outside, bounded lighting resources,
and normal world time. Return anchor error was zero. Finite tests used two workers;
no sustained GPU benchmark was run.

## Ambient sound and material decay — 2026-10-08

SurveySound synthesizes low ventilation, structural rumble, the surviving generator's
restart cycle, local water flow, the express lift, and sparse drips/metal strain. Water
ambience and runoff dressing require a wet planet; the cistern valve stops its local
flow sound. No downloaded sound assets, music, combat cues or jump scares are used.

Footsteps follow supported walking distance. Concrete, soil and exposed metal have
different filtering; airborne/zero-g motion, standing still, folds and teleports do not
create steps. The visible room dimensions set a bounded Sabine-style reverberation
estimate and early reflection delay. Small passages have short tails; the large well
and collection hall ring longer. Exposed bridges now use the matching worn metal
surface. This is a room acoustics approximation, not a wave or ray simulation.

Audio starts on a user gesture. The standalone owns its context; the integrated survey
borrows the game's context/master and follows player one's audio perspective in split
screen. Flight/wind loops fade away while that player is inside. The Sound on/off button
persists the local preference. Pause/hidden pages silence the graph, and leaving releases
its voices without closing the game's context. Five continuous voices, at most eight
one-shots, and five cached reverberation buffers bound resource use.

Separate seed streams generate albedo, normal and roughness maps for cracked concrete,
scuffed floors, chipped paint and pitted rust. Wall-foot grime, wet tide marks, rusty
runoff, mineral residue and small spalled chips follow actual wall segments, including
oblique door openings. Wet runoff is absent on dry planets. Wear doesn't move walls,
change puzzles or create new walking obstructions. Existing geology and native growth
remain separate additions. No renderer changes or previous-frame visibility queries.

Validation: 52 CPU checks pass, including deterministic materials, bounded geometry,
wet/dry dressing, floor-dependent acoustics, sound attenuation and footstep gating.
`tools/tests/understructure-audio.html` renders finite offline audio and compares short
and long tails, sample bounds and exact mute silence; its live button checks gesture
unlock, shared-context ownership, bounded voices, pause and teardown without playing
through the speakers. The two audition buttons play the rendered comparison footsteps. The native gravity/light
fixture passes all 14 route, map, recovery and reload checks with no JavaScript/WebGPU
errors. Captures verified faded wall-foot stains, fine fractures and oxidized fittings;
wall stains feather into matching world-space concrete instead of opaque decal edges.

## Integration boundaries

Owned files: src/understructure/*, understructure.html, understructure tests and notes.
Other Codex owns renderer optimizations, stations, spacecraft/re-entry and general physics.
three-avbd is an evaluation candidate only, not an installed dependency.

Planetary hatch placement and the scene-transition adapter are integrated. Actual
NearGround VolumeField carving, orbital discovery and endless interior streaming remain
future work; coordinate terrain changes with Claude's Rivers worker. There is one main
service level with raised platform routes, plus the view into the larger structure.
Ordinary catwalk railings contain walking; platform rooms allow recoverable falls.
Decorative pipes have no rigid bodies. No renderer or general player-physics code changed.
