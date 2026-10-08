# Graph-planned megastructures

Branch `claude/megastructure-graph` (worktree `/Users/dave/dev/starseed-megagraph`), started
2026-10-08 from Astra's `codex/landing-guide` (726de16). It replaces the megastructure layout,
which was hand-placed rooms at fixed coordinates, with a generator that plans the route first.
Astra's survey (`src/understructure/*.js` outside `plan/` and `site/`) is untouched and still
runs at `understructure.html`; the new one runs at `megasite.html`.

Play: `python3 tools/serve.py 8767 /Users/dave/dev/starseed-megagraph`, then
`http://localhost:8767/megasite.html?seed=SUMP-07` (seed field, Load, Random on the start panel).
Layout viewer: `/tools/megaplan.html#SEED` (3D plan; "built" shows the compiled geometry with a
cutaway slider). Tests: `node --test tools/tests/megaplan.test.mjs tools/tests/megasite-walk.test.mjs`
(needs `node_modules`, which is a symlink to the main checkout's).

## Why the structures are there (STORY.md)

Outposts of the galaxy's first species, built under worlds with present or past life to study
them across immense time: archive vaults, sampling shafts, generator halls, cisterns, heat
exchangers. The founders' own access shaft is sealed from outside. A later visitor tunnelled down
and broke in at an arbitrary point (often where a geological wound had cracked the shell): that
break-in is where you start, in their rough staging room. The way out is the founders' lift, which
answers once you hold the site record from the data core beside it.

## The planner (`src/understructure/plan/sitePlan.js`)

1. Two or three huge machine volumes are packed close (12-26 m gaps), with the founders' access
   shaft beside the last one and the data core beside the shaft.
2. The route is a sequence of crossings of those volumes on catwalks at rising heights, so the
   same hall is crossed again higher up; between two crossings of one hall there is always another
   space and a climb (zero-g well for 11 m or more, low-gravity decks below that).
3. Each stretch between crossings is a chain: the shortest way round everything in its height band
   (down the middle of gaps when they are wide, hugging hulls when not), a climb room where it
   fits, ordinary rooms, and a gallery or junction wherever a bare passage would run over ~28 m.
4. Every doorway gets a flat facet of its own on its room (checked as rooms are placed), so no
   doorway straddles a corner. Passages meeting a room never touch outside it.
5. Dead-end spurs off the route hold most finds. The route itself has no choices: not a maze.
6. Finds: the entry scan (1), the record (90), 33 single units; credit is min(raw, 100) + 3 x
   (raw - 100), capped at 170.
7. Three of six themes (`plan/themes.js`), each a gate on the route with its keys earlier:
   weight (unpowered door; cell in an earlier zero-g well), time (catwalk span that comes and
   goes), distance (collapsed passage; fold frames aligned at a terminal), light (catwalk gap; two
   relays light a bridge), pressure (valve to a reference), resonance (plates in a lit order).

## Compiling (`plan/compile.js`, `plan/solidMesh.js`)

Everything static is a convex solid: an oriented prism (convex polygon in u-v, extruded along w,
optionally tapered). The same list is drawn, collided with (triangle BVH) and meant for the
rigid-body solver as fixed hulls. Doorways are holes through thick walls built strip by strip, so
stacked doorways on one hall face all stay open. Halls get storey ledges with lamp rows, glowing
strips, roof hubs, a pit glow, machinery (drums with domes, cones, crowns), conduits, and rock
intrusions (always one in the first hall you reach).

## Playing (`src/understructure/site/`)

`SiteCollision` (capsule BVH, floor ray, gravity zones, plus gate blockers, floors and fold
portals), `SiteWalker` (momentum, jumps that keep their speed, low-g ballistics, zero-g floating,
gravity alerts, recovery after a fall of 6 m or more), `SiteMechanisms` (gates), `SiteGuide` +
`SiteCompass` (3D arrow in a glass sphere toward the next place or key), `SiteMap` (Metroid-style
outlines; corner map, M for the full one), `SiteSound` (room echo, hum, water, footsteps, suit
voice for alerts), `siteScene` (deferred WebGPU), `siteMain` (the page).

## Checks

162 seeds plan without overlaps, door failures or passages over 36 m; revisits come after a climb;
keys come before their gates; 98% of theme gates placed. A pilot walks the whole route with the real
walker on ~80% of seeds (its low-gravity jumping misses some rooms that are climbable); 12 seeds
are the regression set; a distance gate's fold is walked through.

## Not done yet

- Main game: put the site in the planet's own frame under the hatch (not a scene transition), so
  physics is continuous with the surface and ships; then three-avbd (vendored, `vendor/three-avbd`,
  smoke test `tools/avbd-smoke.html`) as the shared rigid-body world, with our own gravity per
  body (world gravity off) so zero-g rooms, ships and planets all work.
- Astra's decay details, waymarks and ceiling colonies (they read the old layout's walls).
- A phase indicator for time spans; fabric light bridges on the solver.
- The low-gravity pilot in the walk test.
