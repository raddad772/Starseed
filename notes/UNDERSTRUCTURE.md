# Underground megastructure prototype

Owner: Starseed Megastructures (Codex). Worktree: `starseed-megastructures`, branch
`codex/megastructures-webgpu`. Fresh base: ba326f4, with the existing uncommitted fleet
changes copied; their hashes are in understructure-baseline.json. Earlier draft remains
in the separate starseed-understructure worktree.

Run `python3 tools/serve.py 8774`, then `/understructure.html?seed=SUMP-07`.
This playable local sector consumes the production raw WebGPU DeferredRenderer, clustered
lights and GTAO. It does not create a WebGL renderer. Physics is only a local kinematic
walker and lift, kept in simulation.js; it does not replace vessel/general physics.

WASD walk, mouse/drag/arrow keys look, Shift faster, E hatch/lift/survey, F light,
M map, J journal, B return beacon. Pause stops rendering after the final frame; hidden tabs
stop rendering entirely. Active rendering is capped at 30 fps for shared-machine work.

The seeded graph guarantees access to every basement, adds return circuits, and connects
to a reservoir 164 x 128 m with water 25 m below the walkways. Surface access is a single
4 m hatch cut into the terrain mesh. The lift travels continuously 28 m, and can return.
Map discovery, three observations and beacons persist per seed. These observations make
an initial survey loop, not a complete progression system.

Rendering constraint from Dave: no CPU occlusion queries or visibility decisions based
on previous-frame results. Keep current-frame frustum culling/conservative visibility.
Fast turns must never wait a frame for hidden geometry to return.

Integration ownership: src/understructure/*, understructure.html and corresponding tests.
Coordinate renderer backend changes with Starseed WebGPU; coordinate general physics,
space stations, spacecraft and re-entry with the chat Dave assigns to those systems.
three-avbd is a candidate only (https://github.com/sbobyn/three-avbd), not a dependency.
Its direct GPUDevice API and GPU body buffers merit evaluation by the physics owner;
CPU readback must not become a dependency of rendering or player interaction each frame.

Planet integration remains separate: add a deterministic site to world state, carve the
NearGround VolumeField (not merely heightfield), clear flora using body.floraClearings,
and bind these surfaces into the existing player/world collision query. Coordinate
terrain edits with Claude's Rivers in canyons generation. No production planet is carved
by this local prototype, and there is no orbital discovery hook yet.

Validation (2026-10-07): `node --test tools/tests/understructure.test.mjs tools/tests/webgpu.test.mjs` passes all 13 tests. The finite browser fixture at `/tools/tests/understructure.html` passes seven scenario checks with no JS/WebGPU validation errors, and stops rendering after completion. Coverage includes a connected route to every room across 100 seeds, shaft descent/return, collision and catwalk edges, survey persistence, five immediate camera turns, every reservoir loop, the full survey-and-return walk across five seeds, and actual page reload restoring the completed survey. Structural column footprints are checked against every catwalk. Manual keyboard walking, hatch opening and lift descent also verified. Normal mouse capture is unavailable in the in-app browser; drag-to-look and arrow keys are supported fallbacks.

Prototype limits: one underground walking level plus the deep reservoir; railings block walking rather than allowing falls; decorative pipes have no separate rigid-body collision. This is an exploration slice, not a completed endless generator.

Completion audit: the requested playable procedural mockup is verified in the refreshed worktree. Deterministic rooms and branch/loop routes are generated from the editable site seed. The surface has only a hatch and utility cabinet; the service deck, drains and reservoir are buried. Normal controls support a continuous surface-to-underground-to-surface route with no loading transition. The finite browser fixture now reaches all three observations and returns by walking, without assigning player positions, then reloads the actual page to verify persistence. WebGPU rendering and current-camera frustum culling are unchanged. The 29 inherited fleet files still match their saved hashes. General physics has not been replaced; the three-avbd candidate and ownership notes were sent to the other Codex chat.
