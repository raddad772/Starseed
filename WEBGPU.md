# WebGPU deferred renderer: the plan

Decided by Dave, 2026-10-07: **replace the three.js WebGL forward renderer with a WebGPU deferred
renderer, written in JavaScript and WGSL, running in the browser.** Not native Vulkan. The native door
stays open through WebGPU itself (Dawn and wgpu run the same API and WGSL on Vulkan, Metal and D3D12).
Written by session 39d69fa8 as the handoff to Astra. Read HANDOFF.md and CLAUDE.md first: their rules
(testing, coordination, commits, determinism) hold here too.

## Implementation status (Codex, 2026-10-07)

The full migration is in progress. `?renderer=webgpu` is opt-in; WebGL remains the default until parity.

- Raw WebGPU terrain/near-volume G-buffer, reversed `depth32float`, shared physical lighting,
  scanned material arrays, seasons, frost, wetness, wind ripples and thermal emission are implemented.
- Atmosphere LUTs, sky view, cloud shadow, aerial/cloud march and composite now run on the raw device,
  followed by native luminance/adaptation, bloom and the existing AgX/ACES tone mapping.
- Existing GLSL equations are translated offline with pinned Naga 0.1.0 (`tools/shaders/`); checked-in
  WGSL runs directly in the browser. There is no runtime compiler or new browser dependency.
- Rocks, flora and impostors, grass, floes/bergs and standard PBR objects now write the G-buffer.
  Existing deformation, snow, alpha cutout and material equations are retained; metalness and grass
  self-shadowing feed the common lighting pass. Six material families pass finite GPU validation,
  including shared geometry and disposal. The wood comparison now contains matching trees and grass;
  native shadows are the next parity requirement. Multi-material vessels and bespoke patches remain.
- A temporary WebGL producer bridge still supplies scene/resource descriptions and reference captures.
  Its render-target recipes are reproduced on WebGPU, without WebGL pixel readbacks. Removing this
  bridge follows opaque/forward/shadow parity. Native geometry shadows, vessel-specific shader patches, liquids,
  space background, GPU culling, clustered lights, decals and GTAO are still pending.
- `tools/tests/webgpu.html` passes on the GPU: overlap/reversed depth, capture, resize and disposal.
  `node --test tools/tests/webgpu.test.mjs`: 4 passing tests, including std140 parameter packing.
  Generated shaders compile offline and on the browser device without validation errors.
- `tools/tests/webgpu-scenes.html` performs finite, same-camera comparisons with two workers. The wood
  comparison passes at 1280x960, with fixed incident-light exposure for both renderers. Terrain and
  atmosphere are visually comparable; native geometry shadows are still absent on WebGPU at this checkpoint.
  Measured drained totals were about 17–19 ms for this incomplete scene; this is **not a parity or
  performance claim**. Timestamp scopes may overlap on this adapter, so the tool also reports drained
  totals and flags implausible sums. Wood-near-tree, gorge and elevated parity runs remain required.
- Dave confirmed this is the only agent working on the computer and no coordination messages are needed.
  The finite GPU fixtures use the test server on port 8766.

## Why

1. **Other players' hardware.** The game is meant to be shared and explored by others. Desktop GPUs
   (NVIDIA, AMD, Intel) shade every fragment that passes early depth testing, at our full lighting cost.
2. **The log-depth fallback.** Where a browser lacks `EXT_clip_control`, the engine falls back to
   logarithmic depth written by every fragment shader (engine.js constructor), which turns early depth
   rejection off on every GPU. Measured below: lighting goes from 12 ms to 41 ms. WebGPU's 0..1 depth
   range makes reversed-Z standard: no player is ever on that fallback.
3. **Lighting consistency.** Terrain, near volume, rocks, trees and grass each light themselves in their
   own shader today. Where they meet they don't match: Dave's "two polygons meeting", a tree's foot on the
   ground, fixed by hand in e479992 (the bark's lowest band copies the ground's whole shading). One
   lighting pass over a G-buffer makes every surface lit by the same sums.
4. **The roadmap.** Landing lights, vehicle headlights, structure lights, campfires, forest-fire and lava
   glow (many local lights; today each light type is hand-added to every material: the hand light is in
   four materials' shaders); muddy soil, animal trails, puddles, tyre tracks, footprints (decals into the G-buffer, lit
   with everything else); procedural flowers (dense alpha-tested geometry, shaded once a pixel); built
   structures with interiors (lights, AO, contact shadows, grime). Screen-space AO, contact shadows and
   reflections for wet ground need a G-buffer to be applied correctly (AO to the sky's light only).
5. **Compute.** GPU culling and indirect draws for grass, trees, rocks and shadow casters: the shadow
   maps cost 24 ms and the scene draws 4.2 M triangles (below), mostly CPU-placed instances.

Why not native Vulkan (Dave asked): no native Vulkan on Mac (MoltenVK only), Xbox is D3D12, it would be a
rewrite of everything (UI, input, audio, loaders, workers, ships, the test tooling), it loses the
shareable link, and it breaks the agents' test loop (a test tab, JS in the page, pixels read back). What
native would buy (CPU speed and threads, ray tracing, mesh shaders, bindless, tooling, consoles) is worth
revisiting when there's a concrete need; the hot sim code is already moving to C for WASM (memory
"c-for-wasm"), which builds natively unchanged, and a WebGPU renderer ports to Dawn natively.

## Measured (2026-10-07, the current WebGL renderer)

In the wood at 18.66N 59.63W (`?seed=SOL&workers=2&date=2026-10-06T23:08`, the nearest tree more than
15 m from the spawn, 3 m from it at eye level), 2048x1536, the test tab, Dave's Mac (Chrome):

| | reversed-Z (Dave's Chrome) | log depth (`?logdepth=1`) |
|---|---|---|
| opaque scene, GPU | 26 ms | 57-63 ms |
| of it lighting (scene minus "flat") | 11.9 ms (45%) | 40.8 ms |
| scene with lighting stripped | 14.4 ms | 19 ms |
| fragments shaded a covered pixel | 1.89 (meadow view 1.7) | ~6.5 (none rejected before shading) |

The frame, each pass timed with the GPU drained before and after (so each includes its CPU submit; the
whole is longer than a real overlapped frame): shadow maps 23.6, opaque scene 30.3, water 1.6, sky 1.0,
air and clouds 6.9, composite 1.3, soft particles 0.4, transparent 1.0, post 1.9; total ~76 ms. 599
draws, 4.2 M triangles in the scene.

Reading: deferred's lighting saving here is ~5.6 ms gross on reversed-Z (~4 net of the G-buffer's
traffic, not measured), ~35 ms on log depth. The shadow maps (23.6) and the air and cloud march (6.9 on
foot, ~22 from 150 m up, HANDOFF item 16) are untouched by deferred; GPU culling attacks the first.

Method and tool: **tools/gpu-measure.js** (load it in a test tab: `_M.passes()`, `_M.lighting(label)`).
Hold the new renderer to the same numbers in the same views. Notes: `gl.finish` doesn't wait in Chrome;
drain by a sync 1x1 readback. The GPU's speed varies between loads (the same wood 30 ms one load, 59 the
next): compare A and B inside one load. Timer queries read bogus (~150 ms a pass) in WebGL; WebGPU's
`timestamp-query` should be tried (Chrome quantizes it).

## The renderer today (what's to be replaced)

~12,000 lines in `src/render/` (36 modules). The largest:

| module | lines | what |
|---|---|---|
| atmosphere.js | 1336 | Hillaire 2020 atmosphere: transmittance, multiple scattering, sky-view, irradiance LUTs; the aerial perspective; the true-size marches (sky pixels at real heights) |
| terrainMaterial.js | 901 | the ground's shader: albedo from vertex colour + scanned materials, snow/frost/seasons, water surfaces (sea, lakes, rivers: `liquidSurface`), falls' sheets, foam, ice, wetness, the trunks' soil ring; and the river ribbons' variant (`#define RIBBON`) |
| floraRender.js | 870 | instanced plants and trees (EZ-Tree, grown trees, far impostors), per-instance tree LOD views, seating on the ground (`seatInstances`), the bark's soiled foot matched to the ground's shading |
| engine.js | 802 | camera-relative scene, HDR pipeline, the passes (below), exposure adaptation, bloom, AgX/ACES tone curve |
| sunShadows.js | 766 | the shadow atlas: two sun cascades (0..120 m, 120 m..1.2 km), two sky maps (canopy from overhead, softened, rings), the grass cover map, the trunks' and rocks' sky-occlusion maps |
| planetTerrain.js | 718 | quadtree LOD chunks for one body, their meshes, river ribbons, falls, re-seating flora/rocks when the ground changes or the near field is ready |
| grassRender.js | 578 | GPU-shaped grass blades (patches, three's MeshStandardMaterial + onBeforeCompile), tiles near (to 22 m) and far (to ~160 m) |
| liquid.js | 522 | open liquids' optics (water, methane, lava...) |
| volume.js | 508 | the air and cloud shell ray march (half resolution, two outputs: in-scatter, transmittance) |
| world.js | 465 | per-body render items, shared uniforms, per-frame camera-relative placement |
| falls.js | 290 | falls' spray and mist particles (soft pass) |
| rockRender.js | 283 | the ground's rocks: one icosphere cut per rock in the vertex shader, scanned material |
| materials.js | 270 | scanned materials (two 2D texture arrays, `matGround`, `matSurf`) |

Also: sky.js (galactic background cubemap), giant.js (gas giants, rings), cloudShadow.js, terrainShadow.js
(the ground's shadow on itself, marched through a coarse height cube), moonlight.js, season.js, ships
(shipModel, shipVisual, bigShips, bigShipVisual, glbShip, fleetVisual, lightRig), fauna/creatureRender,
floe/bergRender, itemVisuals, ezTrees, treeMesh, noise3d, workerPool, glsl.js.

**The frame (engine.js `_render`):**
0. shadow maps (sunShadows.render: sun cascades every frame (the far one every other, reprojected), sky
   maps in turn, grass cover map, trunks'/rocks' maps)
1. opaque scene into the HDR target (half float) with a depth texture
1b. rivers' water (ribbons): copies of the image and depth, then the ribbons drawn over the image,
   reading the copy (refraction, depth) — the ground under the water is lit, then drawn over
2. background (sky cube) where nothing was drawn
3. atmospheres: aerial perspective / the air and cloud march (half resolution, MRT), composite
3a. soft particles (falls' spray and mist) by hand against the scene's depth
3b. transparent effects (plumes etc.), depth tested
4. post: exposure (adapted luminance, a 1x1 readback polled), bloom, tone curve (AgX, saturation), vignette

**Conventions to keep:**
- Positions are camera-relative (floating origin) in the GPU; the body's centre is `uCenter`
  (camera-relative), its turn `uToFixed`. Planet scale: R ~100 km for an England-sized Earth (memory
  "true-scale-worlds").
- Detail textures read in planet-fixed coordinates wrapped by `DETAIL_PERIOD` (4096 m): the chunk's
  origin modulo it (`uOriginMod`) plus the chunk-local position, so f32 holds millimetres. The scanned
  materials' `matGround` reads the same place in the same period (a tree's foot reads it too).
- HDR in physical units (the sun's illuminance etc.), a pre-exposure gain by the light level
  (world.js `lightGain`), exposure adapted from a luminance target.
- Worker output is renderer-agnostic: chunks (gen/chunkbuilder.js `buildChunk`: position, morph,
  normal, morph normal, colour, morph colour, mat, ext, liquid, flow, class weights (12 classes in three
  vec4s), falls, ribbons), near-volume chunks (gen/volume.js), flora instances (stride 8 per kind),
  rocks (gen/rocks.js, ROCK_STRIDE 14), all typed arrays sent as transferables. These feed GPU buffers
  directly.
- three.js is used outside the renderer as a maths library (Vector3, Quaternion, Matrix4: 18 sim
  modules, 6 UI) and for glTF loading (ships). Keep those; drop only its renderer.
- Determinism: worlds are deterministic and must not change once built (memories
  "worlds-dont-change", "simulated-worlds"). The renderer reads world state; it never decides it.
- There's already WebGPU in the project: `src/gpu/itileGPU.js` (the integer tile sim's compute passes,
  bit-identical to the JS reference). The sims' devices live in workers; the renderer gets its own.

## Target architecture

**Passes:**
1. GPU culling (compute): frustum + distance + LOD for grass patches, trees, plants, rocks, chunks;
   writes indirect draw args (and the shadow casters' lists per cascade).
2. Shadow maps (indirect draws): sun cascades; the sky maps; the cover, trunks' and rocks' maps.
3. G-buffer (opaque): terrain chunks, near volume, rocks, flora (alpha-tested leaves), grass, flowers,
   fauna, floes and bergs, ships (glTF PBR), items, structures.
4. Decals: mud, trails, puddles (wetness), tracks, scorch, grime; and the intersection blend (a rock's
   or a trunk's foot into the ground's G-buffer values beneath it: the seam problem solved once).
5. Screen-space: AO (GTAO, to the sky's light only), contact shadows (later).
6. Lighting (fullscreen or compute): the sun (cascades, cloud light, terrain shadow, grass cover), the
   sky (irradiance LUT, canopy sky maps, trunks'/rocks' maps), canopy light, the moon(s), the ambient
   floor, thermal glow; local lights clustered (hand light, landing lights, fires...).
7. Forward: liquids (sea, lakes, rivers, falls' sheets: refraction reads the lit opaque image and the
   G-buffer depth), spray and mist, glass, plumes.
8. Background sky, then the air and cloud march (compute or fullscreen), composite.
9. Post: exposure, bloom, tone curve. (Antialiasing: none today, `antialias: false`; TAA wants motion
   vectors from the G-buffer pass.)

**G-buffer (proposal; WebGPU's default `maxColorAttachmentBytesPerSample` is 32):**

| target | format | contents |
|---|---|---|
| RT0 | rgba8unorm | albedo rgb, ambient occlusion (scan AO x cave/overhang occlusion x baked) |
| RT1 | rgba16float | normal (octahedral, 2), roughness, material flags / lighting model |
| RT2 | rgba8unorm | translucency (leaves, grass), wetness, snow, specular F0 |
| RT3 | rgba16float | emission (lava, thermal glow, lit windows) added straight into the lit image |
| RT4 | rg16float | motion vectors (TAA, later) |
| depth | depth32float | reversed-Z (`depthCompare: 'greater'`, cleared to 0) |

4 + 8 + 4 + 8 + 4 = 28 bytes. Lighting models needed: rough dielectric (ground, rock, bark), foliage
(translucent, two-sided), grass (two-sided, self-shadowed sward), snow, metal (hulls). Water stays
forward.

**What the lighting pass computes from position vs reads from the G-buffer:** today's terms in
terrainMaterial's land branch: `sunT` (cloud light x terrain shadow x sun shadow map x grass cover),
`skyE` (irradiance LUT), `skyK` (canopy `skyBlocked` x `trunkSky`), `canopyLit`, `uAmbientFloor`,
`moonLit`, `handLit`, `vOcc` (the near volume's overhang probe), `gAO` (the scan's AO). Position-based
(lighting pass): sun shadows, cloud light, terrain shadow, grass cover, canopy and trunks'/rocks' maps,
the atmosphere, the moon. Material-based (G-buffer): albedo, normal, roughness, AO (scan x overhang),
translucency, emission.

## Plan (each step leaves the game working)

0. **Spike.** A WebGPU canvas behind `?renderer=webgpu`, the WebGL renderer the default meanwhile. Draw
   the heightfield chunks from the same worker data with plain albedo and the sun, same camera. A
   side-by-side screenshot tool (WebGL and WebGPU frames of one view) and tools/gpu-measure.js's numbers
   for both. Decide here: raw WebGPU (recommended: our own WGSL, our own passes) vs three.js's
   WebGPURenderer/TSL (it can't take our GLSL ShaderMaterials; its node system would constrain the
   G-buffer design).
1. **Core and terrain.** Device, frame graph, camera (reversed-Z), chunk buffers, the G-buffer, the
   lighting pass with sun shadows and the sky; terrain and the near volume ported (terrainMaterial.js's
   land branch is the largest single port). Parity screenshots in three views: the wood, the 3.06N gorge
   (tools/views/gorge.js places the player there; tools/views/wood.js the wood; HANDOFF item 13 has
   the gorge's story), and from 150 m up.
2. **All opaque materials:** rocks, flora (EZ-Tree bark, alpha-tested leaves, impostors), grass, fauna,
   floes, bergs, ships (glTF), items.
3. **Forward and the sky:** liquids, falls, spray and mist, background, the air and cloud march, post.
   Parity with the WebGL renderer everywhere; then remove the WebGL path and three's renderer.
4. **GPU-driven:** compute culling and indirect draws for grass, trees, rocks and the shadow casters
   (targets: the shadow maps' 24 ms, CPU submit). Measure before and after.
5. **New capabilities:** clustered local lights (the hand light first, then landing lights), decals
   (Dave's muddy paths and wallows: HANDOFF item 4), the intersection blend (retire the bark's
   matched band and the trunks' forced soil ring, floraRender.js / terrainMaterial.js), GTAO.

## Porting notes

- **WGSL's uniformity rule:** `textureSample` (implicit derivatives) only in uniform control flow. Our
  GLSL samples inside branches everywhere (snow, sand ripples, falls, the seam). Use `textureSampleGrad`
  with derivatives taken up front (terrainMaterial already does this for the scans: `dpx`, `dpy`), or
  `textureSampleLevel`.
- No implicit conversions (`f32(i)`), `select` for vector ternaries, f32 only (`shader-f16` optional),
  no `discard` after derivatives in some drivers' eyes (check), arrays of textures via
  `texture_2d_array`.
- Limits to request: `maxStorageBufferBindingSize` (instances, chunk data), `maxColorAttachmentBytesPerSample`
  (32 default), `maxTextureArrayLayers` (scans), `maxBindGroups`.
- Readbacks are async (`mapAsync`): exposure's luminance already reads through a polled fence
  (engine.js, 4d5d501), so the design fits. Screenshots for tests: a WebGPU canvas's `toDataURL` only
  has the frame while it's current; copy the texture to a buffer and map it instead.
- The shadow atlas mixes uses (cascades, sky maps, additive cover/trunks/rocks): in WebGPU split it into
  textures by format (depth for cascades, r16float/r32float for the additive maps).
- Browser support (verify before relying on it): WebGPU in Chrome and Edge; Safari and Firefox status
  to be checked; decide whether the WebGL renderer stays as a fallback and for how long (Dave).

## Constraints from the project

- Test only in your own in-app-browser tab with `?workers=2` on the test server (launch config
  `starseed-test`, port 8766), never in Dave's tab. With the in-app pane hidden the page's canvas is 0x0
  (`resize_window` to a custom size gives it one) and timers throttle to ~1 s: yield through a
  MessageChannel in drain loops, grab frames right after `game.frame` (canvas or texture copy) and post
  them to the scratchpad's shot server (port 8799).
- Coordinate GPU/CPU-heavy work: message the "XBox Work on Mac" session before and after browser test
  rounds; on its timing-window request close the tab, stop the server, reply "holding", wait for "XBox
  Work done". Codex works on an underground-megastructure mockup in its own worktree
  (`/Users/dave/Documents/Codex/2026-10-01/br/worktrees/starseed-understructure`) and coordinates through
  `/tmp/starseed-megastructure-coordination.md`.
- Commit good checkpoints as they land (own files only; others' uncommitted work is in the tree), push
  only when Dave asks, end commit messages with the Co-Authored-By line in CLAUDE.md.
- Dave's preferences: physically grounded, not band-aids; build the headline part first; he play-tests
  in short bursts and reacts to what he sees: send him screenshots of each milestone.

## Open questions (Dave)

- Which browsers to support at launch; keep WebGL as a fallback during the port, and after?
- Antialiasing: TAA (needs motion vectors) or none.
- Does the renderer stay JavaScript for good, or move to C with the sims for a native build later?
