# Starseed Infinite handoff (2026-10-01, session 68fc2903, updated by session 0f13fab4)

Dave is play-testing and giving feedback in short bursts. He rebooted after this was written.

## First steps for the new session

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

After a reboot: restart the dev server (`preview_start` with launch config `starseed`, or
`python3 tools/serve.py 8765` in ~/dev/starseed).

## Still queued

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

- GLSL ES 3.0 reserved words (`patch`) silently kill a shader; `renderer.debug.onShaderError` now
  surfaces compile failures on screen.
- Stiff contact springs need <= 1/120 s steps; never integrate a piloted craft with a frame-sized step.
- Spacewalk state is inertial (km/s): integrate it with exactly the world's dt.
- First frames after a big ship first appears can be black while shaders compile; `spawnFleet` calls
  `renderer.compileAsync`.
- Lift trigger points must be within reach of the door the player walks to (2 m radius).
- Hidden-pane screenshots and timings are slower than real; the pane tab may still render.
