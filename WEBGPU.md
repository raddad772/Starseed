# WebGPU deferred renderer: the plan

Decided by Dave, 2026-10-07: **replace the three.js WebGL forward renderer with a WebGPU deferred
renderer, written in JavaScript and WGSL, running in the browser.** Not native Vulkan. The native door
stays open through WebGPU itself (Dawn and wgpu run the same API and WGSL on Vulkan, Metal and D3D12).
Written by session 39d69fa8 as the handoff to Astra. Read HANDOFF.md and CLAUDE.md first: their rules
(testing, coordination, commits, determinism) hold here too.

## Implementation status (Codex, 2026-10-07)

The renderer migration is implemented. **Normal startup uses raw WebGPU exclusively**, with reversed
Z on every supported device. Three remains the scene/math/geometry/material/glTF description library.
An unavailable or lost WebGPU device reports an error; it does not silently fall back to WebGL.

- The raw frame draws terrain and near volumes, eight opaque families, native shadow maps, shared
  physical lighting, clustered point/spot/fixture/hand lights, seven custom forward families and
  transparent PBR. Vessels retain paint masks, plate seams, interiors and canopy Fresnel. All existing
  atmosphere, clouds, liquids, falls/spray, stars/galaxy, giant/ring and post-processing paths are native.
- Fullscreen resource producers now record descriptions directly for WebGPU. Atmosphere CPU queries
  receive asynchronous LUT readbacks; there is no production WebGL context or pixel bridge. The map,
  split-screen canvas rectangles and offscreen viewscreens use the native device too.
- GLSL equations are translated offline with pinned `naga-wasi-cli@0.1.0` (`tools/shaders/`). Checked-in
  WGSL runs without a runtime compiler. std140 scalar/vec2 arrays have explicit 16-byte stride wrappers;
  this fixes the giant polar-color discrepancy. Scanned terrain keeps filtered snow/sand grain glints.
- Batched compute compacts vegetation and rock instances and writes indirect draw arguments, including
  shadow casters. Native trees select near/mid/impostor ranges on the GPU without CPU sorting/copying.
  Resident terrain chunks are GPU-frustum-culled; deterministic quadtree streaming remains on the CPU.
- `SurfaceDecal` (`webgpu/gbuffer-effects.js`) projects material color, roughness, wetness, metalness and
  emission into the G-buffer. It follows the containing scene transform. This is a rendering capability;
  generating animal trails, tyre tracks or other persistent world state remains simulation work.
- Rock/bark contacts blend with the underlying terrain G-buffer. Native shaders omit the old forced
  trunk-soil ring and matched-lighting band. Half-resolution GTAO with bilateral reconstruction attenuates
  indirect illumination only. Foreground vegetation/soil is darker than the old forward reference;
  this migration does not assert pixel-identical output.
- WebGL rendering lives in `tools/webgpu-reference.js`, imported only by `?webglReference=1` for tests.
  That mode gives both backends the same scene/camera and uses the old CPU tree LOD for comparison.
  Normal startup has GPU tree LOD. `?renderer=webgpu` is no longer necessary.

Validation and limits:

- `node --test tools/tests/webgpu.test.mjs`: 7 passing tests (reversed projection, frustum, normalized
  worker attributes, uniform packing, interleaved tree data, cached packing equivalence and overlapping timestamps).
- `tools/tests/webgpu.html`: finite device validation covers all opaque/forward pipelines, overlapping
  reversed depth, resize/disposal, shared geometry, cluster overflow with 70 lights and room exclusion,
  glass/viewscreens, decals, indirect-only GTAO, scalar-array ABI, instance and terrain indirect culling,
  tree LOD selection, map lines/meshes, and split-screen preservation.
- `tools/tests/webgpu-scenes.html`: finite two-worker scenes at 1280x960, same-camera fixed-exposure
  WebGL/native capture, native-only startup, whole-frame drained medians and culling on/off comparisons.
  Scenes include the wood, 150 m above it, gorge water, Saturn, a generated ringed world and a carrier.
  SOL's Saturn has no generated rings; the ring fixture uses existing Chinion in seed FSPB-8DTW.
  Native-only carrier startup completed at about 9.3 ms drained; the actual system-map smoke test drew
  its 22 bodies/orbits without a WebGL context or GPU validation error.
- Timings are local diagnostics, not a speedup claim. Timestamp scopes may overlap on this adapter;
  use drained totals, not sums. GL measurements drain with a correctly typed Float32 pixel readback.
  Candidate draw/triangle counts precede GPU rejection and are not visible-triangle counts.
- Final same-load drained medians (1280x960, native / GL / native): close tree **34.6 / 29.4 / 33.6 ms**;
  elevated **23.7 / 23.2 / 23.1 ms**; gorge **33.6 / 36.9 / 33.9 ms**. Native includes GTAO/contact work.
  Instance culling is approximately neutral here. At the close tree, on/off captures differ by at most
  one byte level, with no pixels changing by more than two. The gorge has one such pixel (maximum three).
- Coverage is on this Mac's in-app browser. Other browser/GPU combinations still require testing.
  TAA/motion vectors, screen-space contact shadows and reflections remain later features, as planned.
- Dave subsequently authorized coordination with the Starseed Megastructures chat; GPU measurement windows are announced there. Its local player/underground scene remains independently owned.

## Optimization checkpoint (Codex, 2026-10-08)

- Shader uniform layouts and vertex input schemas are decoded once. Unchanged packed uniform bytes
  retain their existing GPU buffer contents; texture bindings still update independently.
- Instance-culling input stays in bounded GPU arenas. Upload generations invalidate it when instance
  attributes, counts, layouts or source buffers change. Every view/cascade still computes its own current
  frustum and LOD selection. No previous-frame visibility results or occlusion queries gate drawing.
- Ground-buffer copies run only for visible terrain/rock or terrain/bark contacts. Decals without
  contacts process directly; scenes with neither use the original G-buffer. GTAO quality/samples and
  all atmosphere, shadow, post and material equations are unchanged.
- Timings now cover render/compute families, including shadows, mip generation, atmosphere and bloom,
  with CPU stage and transfer counters. Overlapping GPU ranges are detected: their interval union is
  displayed, and per-pass attribution is explicitly marked unreliable instead of summing overlaps.
  Drained wall time remains the performance comparison; timing ranges omit transfers outside passes.
- `DeferredRenderer.setOptimizations(false)` is a diagnostic A/B switch, retaining the original packer
  and unconditional uploads/copies. `measureOptimizations` runs warmed baseline/optimized/baseline
  rounds, including advancing simulation and a small camera sweep in free-camera scenes.
- The finite GPU fixture passes after the changes, including mutable instance input, buffer growth,
  raw/processed material transitions with local lights and all prior regression scenarios. Seven CPU
  tests pass. Initial 1280x960 forest and carrier A/B images were byte-identical on this Mac;
  the final forest repeat differed at five of 1,228,800 pixels by more than two levels (maximum 12).
- Initial same-load medians: forest 34.0 / 31.3 / 33.7 ms; carrier 9.3 / 7.5 / 9.1 ms.
  The advancing simulation showed a noisier/smaller forest gain; carrier 9.7 / 8.3 / 9.6 ms.
  Final arena retention repeat: forest 37.5 / 31.4 / 37.7 ms, moving-camera simulation
  43.4 / 38.4 / 44.8 ms. Fixed-view source copies fell from 935 KB to 15 KB/frame.
  These are local measurements, not promises for other GPUs. Fine-grained GPU pass durations on this
  adapter remain unsuitable for attributing cost because the reported ranges overlap.

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

## Baseline measured before migration (2026-10-07, WebGL)

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

## Pre-migration renderer reference

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

**Implemented G-buffer (24 bytes of color per sample, plus depth):**

| target | format | contents |
|---|---|---|
| RT0 | rgba8unorm | albedo rgb, scan/baked AO |
| RT1 | rgba16float | octahedral normal xy, roughness, body index × 16 + material family |
| RT2 | rgba16float | emission rgb, cave visibility (negative self-shadow for grass/giants) |
| RT3 | rgba8unorm | translucency (terrain: filtered glint / 3), wetness, metalness, specular F0 |
| depth | depth32float | reversed-Z (`depthCompare: 'greater'`, cleared to 0) |

Opaque families: terrain 0, rock 1, flora 2, grass 3, standard PBR 4, interior 5, ice 6, giant 7.
Terrain color/normal/surface/depth are copied before objects for contact processing. Decals and contact
blending write a second G-buffer set. GTAO outputs indirect visibility separately. Motion vectors/TAA
are deferred; water and glass remain forward.

**What the lighting pass computes from position vs reads from the G-buffer:** today's terms in
terrainMaterial's land branch: `sunT` (cloud light x terrain shadow x sun shadow map x grass cover),
`skyE` (irradiance LUT), `skyK` (canopy `skyBlocked` x `trunkSky`), `canopyLit`, `uAmbientFloor`,
`moonLit`, `handLit`, `vOcc` (the near volume's overhang probe), `gAO` (the scan's AO). Position-based
(lighting pass): sun shadows, cloud light, terrain shadow, grass cover, canopy and trunks'/rocks' maps,
the atmosphere, the moon. Material-based (G-buffer): albedo, normal, roughness, AO (scan x overhang),
translucency, emission.

## Original implementation sequence (completed through step 5)

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
- Session override from Dave: this is the only agent doing work on the computer; do not message other
  sessions or delegate work. Earlier coordination directions are superseded for this migration.
- Commit good checkpoints as they land (own files only; others' uncommitted work is in the tree), push
  only when Dave asks, end commit messages with the Co-Authored-By line in CLAUDE.md.
- Dave's preferences: physically grounded, not band-aids; build the headline part first; he play-tests
  in short bursts and reacts to what he sees: send him screenshots of each milestone.

## Open questions (Dave)

- Which browser/GPU combinations to certify for launch. The implemented default requires WebGPU;
  WebGL is retained only as an explicit test reference.
- Antialiasing: TAA (needs motion vectors) or none.
- Does the renderer stay JavaScript for good, or move to C with the sims for a native build later?

## Shared-renderer local sectors (2026-10-08)

Megastructure surveys now use a dedicated local camera/view on the main game's DeferredRenderer.
Outdoor shadow overrides are scoped to engines with sunShadows; a local scene cannot inherit the
preceding planet's maps. Canvas clearing is separate from advancing the first outdoor view, so
split-screen can render a local P1 and outdoor P2 without freezing world effects or shadows.
Leaving releases the local render target and owned scene resources, preserving the device and
normal world view. The integrated browser fixture validates entry, record recovery, both returns,
saved progress and split-screen without WebGPU errors. No rendering-quality setting changed.
The non-planet scene-light block is now cached per view and released with that view. Previously
its fresh per-frame key retained a new GPU lighting buffer each frame. The finite integration
fixture asserts unchanged binding counts across 30 additional local frames and cleanup on exit.
