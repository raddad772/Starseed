# Underground megastructure prototype

Owner: Starseed Megastructures (Codex). Worktree: `starseed-megastructures`, branch
`codex/megastructures-webgpu`. Base: ba326f4. The 29 inherited fleet changes remain
untouched; their hashes are recorded in understructure-baseline.json.

Run `python3 tools/serve.py 8774`, then `/understructure.html?seed=SUMP-07`.
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

A seed chooses one or two themes; the entry panel can override that choice for testing.
Room-graph branches, chamber heights, phase periods/offsets/bands and threshold marks
vary deterministically. This is a small authored mechanism vocabulary with seeded
parameters, not unrestricted procedural puzzle synthesis.

- Weight: the Null Well locally cancels gravity. Fly to a charged cell, then put it in
  the matching socket at the entrance. Concrete floats; the cistern's water rises.
- Time: machinery moves forward, holds, then rewinds in a twelve-second cycle. The
  player, input and collected progress remain unaffected. Align a sweep with a broad
  visible band and press E. Misses have no penalty; the timing window is 2–2.8 seconds.
- Distance: link a marked frame, cross it, then reconnect the far terminal. The paired
  thresholds join two remote chambers, preserving relative motion direction. They
  work both ways. This uses opaque thresholds and immediate local transforms, not
  recursive see-through portal rendering.

## Controls and persistence

WASD walk/thrust; mouse, drag or arrows look; Shift faster; E interact; F hand light;
M map; J notes; B beacon; T surface return after retrieval; Escape pause.
In zero gravity, Space rises, C descends and R brakes. Drift persists without input.
The amber doorway is the gravity boundary; descend to its floor-level sill to leave.
The capsule tests chamber shell, ceiling and conservative floating-block envelopes.

Progress is saved per seed **and theme profile** in v2 browser storage. Loading starts
at surface access with recovered data/circuits/notes/map/beacons retained. A carried cell
is retained across reloads. v1 prototype saves remain in storage under their older keys.
Pause renders only a final changed frame; hidden tabs do not render. Active cap: 30 fps.
No camera visibility depends on previous-frame occlusion queries or results.

## Validation — 2026-10-08

`node --test tools/tests/understructure.test.mjs tools/tests/webgpu.test.mjs`: 15 passing.
Coverage includes 100 connected seeds, all six theme combinations on two seeds using
normal movement inputs, inaccessible repository before solving, data retrieval, lift
return, optional shortcut and re-entry, zero-g inertia/braking/shell/obstacles, local
clock reversal, bidirectional folded thresholds, cistern rails and saved partial progress.

`/tools/tests/understructure.html`: nine finite scenarios pass on weight/time and on
time/distance profiles with no JavaScript/WebGPU errors. The fixture traverses reservoir
loops, chambers and puzzles, exercises immediate camera turns, retrieves the record,
returns to the surface, and reloads the real page to verify persistence. It pauses on
completion. Actual Space/C/R controls were checked in the first chamber pass; actual
T keyboard input was checked after record retrieval in the final pass.
`?inspect=null` pauses at the first chamber; `?inspect=record` pauses after retrieval.

## Integration boundaries

Owned files: src/understructure/*, understructure.html, understructure tests and notes.
Other Codex owns renderer optimizations, stations, spacecraft/re-entry and general physics.
three-avbd is an evaluation candidate only, not an installed dependency.

Production planet integration remains separate: deterministic world site placement,
NearGround VolumeField carving (not just a heightfield hole), floraClearings and binding
these surfaces to world collision. Coordinate terrain edits with Claude's Rivers worker.
This prototype does not yet add orbital discovery, planetary hatch placement or endless
streaming. There is one accessible service level plus the view into the larger structure.
Railings block walking rather than allowing falls; decorative pipes have no rigid bodies.
