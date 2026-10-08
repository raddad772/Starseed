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
  Carry it into Light-Load Transit, jump across 0.22 G ledges to its elevated socket,
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
storage keys; the payload is version 3. The main-game adapter preserves old saved site
themes when expanding the theme pool and saves explicit themes for future loads.
Loading starts at surface access with recovered data/circuits/notes/map/beacons retained.
Carried cells, partial plate sequences, pressure settings and bridge stages also persist.
Recent route traces are per visit. v1 prototype saves remain under their older keys.
Pause renders only a final changed frame; hidden tabs do not render. Active cap: 30 fps.
No camera visibility depends on previous-frame occlusion queries or results.

## Validation — 2026-10-08

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
