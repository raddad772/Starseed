# Starseed campaign implementation plan

## Latest requirements and checkpoint (8 October 2026)

See `notes/SYSTEM_AUTHORING.md` for implemented recipe formats, seed search, opening bundles and
cache limits. Galactic charts use only the cheap formation head. A 200-star chart measured 20.1 ms
cold and 0.62 ms cached in the owned browser fixture. Actual life/past-life history belongs to the
visited detail layer, not an invented certainty in the initial chart. Saves carry compact survey
records and authored inputs; full history arrays are disposable cache data.

Four default opening systems are shipped in gzip bundles totalling about 1.7 MiB. A serial worker
hydrates the opening systems and persists a bounded cache. Existing world-simulation snapshots
still have their own cache. This is **not seamless travel**: main.js still reconstructs Game and
the renderer and awaits startSim; the game still uses a loading cover while terrain/refinement
and visible resources become ready. Do not present system metadata readiness as terrain readiness.

For invisible jump/descent loading, the next performance milestone must:

- Retain the renderer/device and reusable fleet resources across system changes.
- Prepare whole-world snapshots, refinement/rivers and coarse render coverage for the destination
  before arrival, within one shared memory/worker budget. Prioritize the three story landing bodies.
- Keep distance-appropriate terrain resident in orbit, predict descent and prepare finer tiles,
  vegetation and landing collision ahead of the craft. Retain coarse coverage while finer tiles
  upload; do not block the frame on cache decoding, generation or GPU uploads.
- Persist expensive reusable products or ship selected compressed opening-world products after
  measuring their size. Do not eagerly simulate every planet in all 200 charted systems.
- Certify a jump, orbital approach and continuous surface descent with worldsim enabled, cold and
  warm caches, every fleet family, visible-detail captures and frame-time/streaming measurements.
  The current worldsim=0 fleet regression does not establish this result.

The latest plot in `STORY.md` is the source of truth for subsequent playable progression: three
interesting landed-body scans unlock the first site, one explored site's central record offers
three more candidates, two distinct recovered central records reveal out-of-plane black-sphere
leads. Present and former life both qualify. Later civilizations are a future branch. The founders'
FTL capability remains undecided; daughter safety and the absence of a rescue countdown remain fixed.

Add independent Authored/Randomized site variation. Randomized means persisted per-expedition
location, theme and layout; authored means versioned chosen inputs. It must not be tied to flight
or jetpack assistance. Guided markers appear after the required story evidence, while survey mode
uses narrowing instrument guidance. Both share the same canonical progression. Preserve old saves'
existing entrances/layouts; do not retroactively move explored sites when introducing this policy.

Implement the scan and site gates as idempotent saved events, with target IDs and measurements in
compact records. Distinguish a plotted candidate, observed evidence, a located entrance and a
recovered central record. Test repeated scans, reloads, multiplayer joins, two players scanning the
same body, optional fragment collection and alternate candidate visit order. Represent each black
sphere in star-relative three-dimensional coordinates (AU, with a defined system north), plus a
later local-flight target. An overhead map must show height and selection without requiring a
fly-through galaxy interface.

The authored/procedural foundation does not yet add those physical scan sites, gates, randomized
site settings or black-sphere objects. The helper `surveyTargets` currently ranks three solid
bodies for variety; terrain-safe scan locations still require world-simulation results.

Status: implementation started, 8 October 2026. Campaign records, event handling, JSON storage and single-system flight save/restore are implemented. The live game now exposes saves and the Story Log in the pause menu. First-run fleet setup and a playable flight tutorial with an interactive telemetry introduction are connected. The overhead cell catalogue, two-player fleet passage and return-state persistence are now connected. The fully staged mirror encounter remains pending. The existing renderer, flight guidance and megastructure prototype remain the foundation. Story treatment: [STORY.md](STORY.md). Save contract: [notes/SAVE_FORMAT.md](notes/SAVE_FORMAT.md).

The campaign follows an expedition studying an enormous spinning black hole. A nearby star system is enclosed by a perfect mirror that blocks entry. After years of investigation, a survey craft carrying the player characters' family members enters a temporary opening and disappears. An outgoing transmission provides the first lead. Players explore the surrounding systems to understand the opening and recover the missing people.

Build a complete, saveable route from New Expedition through the introduction, first interstellar journey, planetary survey and recovered lead. Extend that foundation into an open galaxy, with one consistent stellar catalogue behind the sky, maps and destinations.

## Agreed direction and proposed defaults

| Area | Direction | Initial implementation choice |
| --- | --- | --- |
| Setting | An extraordinary spinning black hole, luminous disk and immense relativistic jets; a separate mirrored star system nearby | A survey region around a massive galactic nucleus. This supersedes the earlier ordinary dwarf-galaxy suggestion. The wider galaxy remains accessible. |
| Scale | The black hole and jets are recognisable from multiple systems | Begin visual calibration near a fictional 60-billion-solar-mass black hole. Mass, spin, feeding rate, spectrum and distances are separate tuning parameters. |
| Navigation | Overhead map; freedom to leave the familiar region | Approximately 200 initially charted systems. This is a tuning target, not the total population or a travel boundary. |
| Flight | Easy, Medium and Hard; receive an appropriate fleet | Easy starts with Horizon, Medium with Expedition, Hard with Pioneer. Explain handling and equipment before selection. |
| Exploration | Easy reveals megastructure locations; Hard requires discovery | Label the choices Easy Guided and Hard Survey. Difficulty changes information, not whether a site exists. |
| Puzzles | Easier assistance, potentially including a working jetpack | Label the choices Easy Assisted and Hard Standard. Assisted traversal permits the jetpack where practical; mechanism requirements remain explicit. This needs a playtest before final tuning. |
| Introduction | Playable flight introduction with an option to skip | Both paths reach the same incident outcome, fleet entitlement, first lead and Story Log. |
| Multiplayer | The missing passengers can include several players' children | Online shared instances are the intended multiplayer mode. Split-screen is a local test harness. Trusted remote updates feed the existing other-player state/controller path; no substantial anti-cheat system is planned. |
| Saves | JSON for now | Versioned campaign JSON, transactional browser autosaves, manual export/import and a disposable generated-data cache. |

The daughter chooses to investigate and enter. This is a hopeful game and she will be fine: build toward reunion without a hidden rescue timer or penalties for side exploration. The shared passengers follow the same hopeful direction. The mirror's purpose, its relationship to the black hole and the means of reunion remain unwritten. The opening's communication purpose is initially the crew's interpretation of evidence.

The intended feel is hopeful space exploration, with a home you bring along. “Cozy exploration” is a useful design reference rather than a settled genre label. Familiar ships, a supportive crew, unhurried discoveries and forgiving assistance can provide comfort alongside enormous landscapes and demanding optional piloting. Give players time to linger, return home and prepare; do not use the family story to make those choices feel irresponsible.

## First implementation checkpoint

`src/campaign/state.js` creates independent campaign identities and handles the introductory incident, transmission destination, arrivals, site discovery and highest-per-site recovery. Repeated events cannot award the same progress twice. Played and skipped intro events reach the same canonical state; neither event pretends to have run a playable scene. Existing surveyed knowledge survives later discoveries. All twelve difficulty combinations select a starting fleet policy without spawning vessels.

`src/campaign/save.js` validates and round-trips portable **campaign records**, including schema/content versions, quest references, journal sequences, finite values and recovery milestones. Imports create a new campaign identity. `src/campaign/storage.js` stores current and previous JSON revisions transactionally in IndexedDB, rejects stale writers and supports explicit previous-revision restoration. Record-only files remain supported as `saveKind: "campaign-record"`, `world: null`, with no provisioned fleet or players. The new flight adapter also supports `saveKind: "single-system-flight"`; these are the files the live game can resume.

The reusable `src/ui/expeditionSetup.js` and `src/ui/storyLog.js` views can be exercised at `tools/tests/campaign.html`. That development preview provides settings, journal/current leads/basics, JSON export and isolated browser storage checks. It starts no renderer or world workers and does not change existing game saves. The Story Log is now available in the live Expedition pause page. The same setup view now drives New Expedition in the live game.

Validation: nine CPU tests pass, covering all settings, played/skipped state convergence, duplicate and invalid events, recovery after reload, time preservation and invalid imports. Thirteen real-browser checks pass for transaction aborts, concurrent writers, previous revisions, independent imported slots, safe text rendering and form choices. Milestones 1 and 2 remain in progress; the live-flight checkpoint below completes the first bootstrap/persistence connection.

## Live-flight checkpoint

Open **Pause → Expedition → Save current flight** to adopt the current fleet into an expedition. The briefing also provides **Saved flights**. Once activated, the expedition autosaves every 30 seconds of active play; the same page exports portable JSON, imports independent copies, loads slots or explicitly restores their previous revisions. The live Story Log shows recorded discoveries/recovery and available basics. It does not pretend the introduction has happened.

`src/campaign/{flight,session,siteStorage}.js` captures all vessels, active and away players, inventories, attachment/reference frames, hull damage, temperature, landing gear, doors, airlocks, moving lifts and turnover decks. It restores the exact saved simulation time, FTL phase and fleet identities without granting another starter fleet. Navigation intent waits for explicit re-engagement and replans from the restored state; warp consent resets. A missing second controller retains that person's location and inventory for rejoin.

Each expedition owns a portable site storage map. Initial activation copies legacy progress for the current system while retaining the originals; subsequent slot changes and imports use independent maps. Site recovery enters the campaign journal through idempotent high-water events. Saving underground retains site progress, then loading places the explorer at the surface entrance. Storage failure leaves the previous saved revision intact and offers JSON export; a blocked legacy localStorage store cannot prevent exporting the flight.

Validation: 44 focused CPU tests pass across campaign records, flight snapshots, survey persistence, orbital guidance and shared warp. The finite full-game native fixture `tools/tests/campaign-flight.html` passes 19 checks: 34 vessels and two players restore with damage, temperature, cargo/deck links and loose inventory; the renderer rebuilds, the normal loading gate completes, the next save revision succeeds and split-screen renders without WebGPU validation errors. Its JSON measured 145,039 bytes. That browser fixture uses two workers and `worldsim=0`; full world-simulation terrain reconstruction is implemented but not yet browser-certified.

Current limits: one resident star system; pinned generator versions and exact vessel definition signatures, with no layout migrations yet. Finish or cancel a moving-person rendezvous and recover incapacitated crew before saving. FTL state is retained, but drop out before resuming a saved navigation order. The existing Change System action still starts a sandbox fleet, so it is not campaign travel. The checkpoint below adds first-run provisioning, tutorial event saves and a playable/skip rehearsal. The later galaxy checkpoint below adds the catalogue, overhead map and a first persistent fleet passage. The fully staged mirror encounter remains a next step.

## New Expedition and tutorial checkpoint

**Current policy (8 October): the entire introduction is single-player.** Controller and Settings joining stay locked until completion or skip. New Expedition clears an existing second-player connection; older tutorial saves retain player two as away crew, with their ship, location and inventory preserved for rejoining afterwards. Skipping is immediate for the solo player. This supersedes the original shared-skip design.

A normal first visit opens New Expedition before creating a sandbox renderer or fleet. Choose the expedition name/seed, three independent difficulty settings, and Play or Skip. Explicit seed/test/era links retain the sandbox route; campaign URLs return to setup/saved flights on reload. New Expedition is also available from the briefing and Expedition pause page. Creating another expedition preserves the old save slot.

`src/campaign/newGame.js` provisions just the chosen era, carried craft and a survey reference once: Horizon/Neptune 3, Expedition/Hearth or Pioneer/Nomad. Player two uses an existing assigned craft. The tutorial starts on coasting orbits with ROT assistance; manual translation and opposite burns use the hull's actual engines. Optional rendezvous guidance helps with the same tasks. Ordinary practice accidents restore the training craft without story penalties. Completed campaigns use their own recovery path rather than assuming the legacy carrier's berths.

`src/campaign/{tutorial,intro}.js` implements targeting, 12 m relative movement, braking below 2 m/s, a stable two-second scan, the anomalous reading, the crossing/closed-surface dialogue and three probe observations. The mirror incident is currently presented as interactive survey telemetry, following live flight practice. The diagram is a signal reconstruction; it is **not** a rendered star-system enclosure or a physical aperture the player can fly through. The full scene in STORY.md still depends on the central visuals and galaxy model. Finishing or skipping records the same four journal entries and first receiver lead once. The receiver retains its stable story address; the galaxy checkpoint below pins a generated life-bearing destination and enables travel.

The saved tutorial checkpoint retains phase, partial scan and probe progress. The solo player can skip immediately; controller joining stays locked until the story checkpoint completes. Initial creation and story transitions request saves even while paused. A transition during an in-flight database write cannot be overwritten by the older snapshot, and queues the next revision.

Guided exploration shows existing entrance markers immediately; Survey hides them until an on-foot approach within 12 m, then remembers them per campaign. This is the first local discovery policy, not yet the planned orbital anomaly search. Assisted traversal enables bounded jetpack lift inside broken-platform chambers, respects walls/ceilings and retains circuit requirements. Standard traversal and all legacy sandbox behavior stay unchanged. Wider hints/timing adjustments and all-theme assisted-route certification remain pending.

Validation: 49 focused CPU checks pass, including all three fleet families, checkpoint corruption, played/skip state convergence, the solo tutorial join gate, saving during asynchronous transitions, flagship approach/recovery, and assisted versus standard movement. The owned native fixture `tools/tests/campaign-intro.html` passes 21 full-tutorial checks with actual thrust/counter-thrust, blocked early joining, a solo mid-scan save/reload, four journal entries, multiplayer joining after completion and clean split-screen WebGPU validation. The completed medium-fleet snapshot is approximately 47 KB. Its separate setup-skip mode passes 12 checks for both other fleets, initial paused saving, preserving older slots, starting a solo tutorial from co-op and multiplayer unlocking after skipping. Native fixtures use two workers with world simulation disabled; full terrain reconstruction and the physical mirror scene are not certified by this pass.

## Galaxy chart and first fleet passage (8 October 2026)

**Anchor audit, 8 October:** the map and receiver selection are implemented, but physical mirror-system suitability is not yet validated. For the default region seed `FSPB-8DTW`, the origin is Brukrol (F6V), currently assigned a provisional chart position 24 pc from the central landmark. It inherits the chosen new-game seed; no tidal-stability, enclosure-radius or black-hole-view test selected it. The receiver is Legoazeaks (G9V), seed `RX-e60889908de3ebbf-6`, with life-bearing planet Tavont (body 9, microbial mats), 2.0549 pc / about 6.70 light-years from the origin. The actual `hasPlanetMegastructure` predicate returns true with current 100% tuning. The entrance is chosen lazily on a suitable surface arrival, so this audit does not certify a pinned, playable first entrance or a rendered mirror. Other region seeds derive their own receiver.

`src/campaign/galaxy.js` supplies deterministic cell addresses and 200 stars in the initial chart. Arrow controls query neighbouring cells; address lookup can chart distant cells. The map includes a central black-hole reference landmark, the original survey system, the first receiver, spectral types, parsec/light-year route distance and vertical position. Cheap `summarizeSystem` records match the destination generator; complete planets are not generated for every chart entry. Unvisited entries are omitted from saves. This is a static navigation scaffold, **not yet a calibrated galactic population, stellar-orbit model or sky renderer**. The nucleus position and 24 pc origin distance are provisional chart tuning.

`src/ui/galaxyMap.js` lives in Pause → Galaxy, alongside the local System orrery. The first receiver is selected after the introduction. A bounded seed search pins a real life-bearing planet; existing provisional receiver IDs remain stable. A known life-bearing preset is a fallback. The chart is shared by the party, with keyboard/controller destination selection and explicit cell addresses.

`src/campaign/travel.js` implements **Gather fleet & travel**. All active and away crew must be aboard; local FTL must be disengaged and destroyed vessels recovered. The action explicitly regroups every vessel at a safe destination orbit, retaining vessel IDs, carried craft, nested decks, crew, damage/heat, equipment and cabin inventory. Arrival roots are separated circular orbits within the selected body's sphere of influence. Local flight orders reset. Surface/orbital loose objects, survey entrances, site storage and remembered landing sites remain with their original system and return when revisited. Item IDs have a campaign-wide high-water mark.

Both active players must agree; P2 A agrees and B cancels. Changing route, runtime, crew or leaving the chart cancels the pending agreement. Departure commits before the runtime is replaced; arrival commits after reconstruction. A crash during loading retains departure. Reconstruction failure uses the existing in-memory rollback; arrival-write failure retains the arrived runtime, reports failure and keeps the durable departure revision. JSON export/import includes unloaded-system changes. Arrival advances the first investigation once.

This first passage is immediate and has no simulated duration or fuel charge. It is not a physical interstellar FTL controller, conventional journey, saved in-transit phase or shared time-warp implementation. There is still one resident system and the whole fleet travels together. Milestones 3 and 4 therefore remain partial; coherent populations, timed transit, separate-system co-op and physical central visuals remain open.

Validation: 50 focused CPU checks cover campaign/tutorial/save behavior, deterministic catalogue identity, outward/return preservation, malformed unloaded data, item uniqueness, storage failures, controller consent, all three fleet families' attachment and orbit safety, and WebGPU teardown. The finite native fixture `tools/tests/campaign-galaxy.html` passes 22 checks for a two-player medium-fleet outward trip, reload and return, including clean split-screen rendering. Its portable two-system save is approximately 48 KB. Browser checks use workers=2/worldsim=0; full terrain regeneration at interstellar arrival still needs native certification. The test exposed and fixed an expected pending GPU timing-readback cancellation during renderer disposal; live-device failures still report normally.

## Existing foundation and necessary changes

| Existing code | What can be reused | What the campaign still needs |
| --- | --- | --- |
| `src/main.js`, `src/game.js` | Briefing, world startup, players, live fleet and view orchestration | First-run orchestration and persistent interstellar travel; single-system restore is implemented. Legacy sandbox seed travel starts a fresh fleet; campaign travel uses the Galaxy tab and restores the existing manifest. |
| `src/core/rng.js`, `src/gen/system.js`, `src/gen/star.js` | Independent seeded streams, system summaries, planetary formation and stellar properties | Stable galaxy/system addresses; spatially correlated stellar populations; wider stellar classes including remnants and massive stars. Current stars primarily cover 0.08–3 solar masses. |
| `src/render/sky.js`, native WebGPU passes | Star rendering, sky background, exposure and atmosphere integration | Replace unrelated decorative stars with catalogue objects; add disk, lensing, jets and mirror rendering. |
| `src/ui/map.js`, `src/ui/pauseScreen.js` | System orrery, selection and catalogue UI | The overhead galaxy map is connected. More detailed knowledge states, timed routes and separate-system ownership remain. |
| `src/sim/navComputer.js`, `orbitalRoutes.js`, `orbitalFlight.js`, `ftl.js` | Conventional transfers, launch windows, engine-limited guidance and local FTL | Interstellar route execution, preserved state on arrival, confidence/range checks and a defined galactic travel speed. |
| `src/sim/worldClock.js`, `warpConsent.js` | One simulation clock and unanimous high-warp consent | Campaign time restored from saves; no offline progression by default; consistent time across resident systems and transit. |
| `src/sim/eraFleets.js` and era fleet modules | Three fleet families and their physical handling | One-time campaign provisioning, saved vessel identities and return without respawning or healing the fleet. |
| `src/understructure/*` | Persistent entrances, walking, mechanisms, maps and Golden Path recovery | Real survey discovery and difficulty policy; the campaign storage adapter and recovery events are implemented. |
| `src/sim/worldSims.js` | IndexedDB cache of generated world arrays | Explicit cache limits, compatibility with pinned generation versions and clean separation from campaign saves. |

Existing in-progress fleet edits and the separate generator-hall work are independent. Do not replace them while adding campaign orchestration. New campaign modules should reduce the amount of new logic placed directly in `game.js`.

## World model and streaming

### Galaxy addresses and population

Give every system a stable address derived from galaxy seed, generation version, spatial cell and local index. Use structured string IDs, not a single 32-bit hash as the unique identity. Derive stars and their planetary system seeds independently so visiting or generating one sector never changes another.

Define the galaxy's stellar density, central concentration, disk or spheroid, gas/dust regions, age distributions and enrichment history before scattering individual systems. Nearby systems should inherit related formation conditions with local variation. Binary and multiple systems need stable member identities; a star count is not a system count. The first implementation may use single-star destination systems, but the address format must accommodate companions and remnants.

Reserve explicit story anchors for the black hole, mirrored system, expedition base, first receiver and required first survey site. Validate their orbits, travel routes and planetary suitability. Procedural generation must not strand the campaign because a necessary planet or mechanism failed to appear. Authored anchors are few and saved explicitly.

Generate nearby or requested cells on demand. A hierarchy of coarse regional bounds and luminosity summaries serves distant sky and map queries, including rare bright stars beyond the nearest cells. Do not enumerate every star at startup or invoke full planetary/world simulation merely to draw a star. Keep bounded memory and disk caches. Unresolved light may be an aggregate; every resolved selectable star must refer to a consistent catalogue object.

Pin generation and content versions in the save. A seed and version number only preserve a world if the corresponding generator remains available, or a tested migration preserves the relevant identities and anchors.

### Coordinates and dynamics

Use physical galactic coordinates in parsecs with a reference epoch. Keep sector coordinates and local offsets separate for precision. Local flight retains the existing scaled metre/second convention and a floating origin; explicit conversion functions connect the two. Never send galaxy-sized metre coordinates directly into float32 draw transforms.

Use analytic stellar trajectories in a smooth galaxy potential plus the central mass for the first model. Full star-by-star gravitational simulation is unnecessary. Validate central stellar orbits and tidal limits on their planetary systems. The mirrored enclosure must fit its host system's stable region unless a deliberate fictional support mechanism is established.

Retain conventional patched-conic flight in its valid regime. Define and expose the inner region where relativistic treatment or an explicit navigation exclusion is needed; a Newtonian trajectory through the event horizon must not be presented as accurate. Rendering can model relativistic light without claiming a complete general-relativistic spacecraft simulation.

### Systems occupied by players

Introduce a campaign-level session manager with a map of resident systems. A system owns its ephemeris, local simulation and streamed assets; the campaign owns time, players, vessels, discoveries and quests. Keep occupied systems live and propagate suitable unoccupied vessel orbits analytically. Preserve surface locations and site state without simulating every empty room or planet each frame.

The first journey milestone can move a travelling party together. The complete campaign must also support one player remaining in a system while the other travels elsewhere. Share the existing renderer and a global worker budget rather than creating an unrestricted renderer/worker pool for every system. Two players in different planetary systems must still respect the total resource limit.

## First run and difficulty

New Expedition asks for flight difficulty, exploration difficulty and puzzle assistance, followed by Play Introduction or Skip Introduction. A seed and advanced tuning can live behind an optional panel. Continue and Import Save should be prominent on subsequent launches.

Flight difficulty selects the starting fleet family and initial assists. Pilots may change assists later within a hull's actual thrust and equipment limits. Changing assistance must not silently transform owned ships, duplicate the fleet or restore damage; a later fleet replacement is a separate explicit operation. All fleets need a viable interstellar transport option, including carried small craft without their own FTL drive.

Guided exploration reveals the eligible site's entrance from the planet's survey view as soon as that planet is selected/loaded. Survey exploration provides an orbital anomaly, then a narrowing surface search with readable instrument feedback. Avoid requiring a search of an entire unmarked globe. Both use the same saved entrance. Move new-site placement out of the current first-landing-near-player rule so orbital discovery can refer to a location that already exists; preserve legacy entrances exactly.

Keep one megastructure per eligible solid currently or formerly life-bearing planet, at 100 percent presence while playtesting. Preserve the configurable roughly 1 percent future policy and record its campaign version. Any guaranteed story site remains an explicit exception, with no duplicate site on its planet.

Assisted puzzles offer clearer hints, broader timing windows and jetpack traversal where compatible. Standard uses the intended gravity and equipment constraints. Separate movement gates from circuit gates: flying across a gap may be allowed, but it does not set a solved flag. Audit every room and exit under both modes, including ceiling escape, carrying objects, inaccessible objectives and recovery after falls. Keep fair recovery and avoid softlocks in either mode.

Exploration overlays and flight assists may be personal. Puzzle/traversal policy is shared campaign state. Apply a policy change at a stable boundary, such as leaving the active site, so a player is not stranded over a gap when assistance changes.

## Story state and quests

Use a small data-driven quest state machine. Definitions specify prerequisites, objectives, target IDs, completion events, consequences and Story Log entries. Mutable state records the active step, completed objectives, one-time rewards and tracked leads. Conditions read shared campaign state; UI panels do not independently award progress.

Domain events include `intro.completed`, `signal.bearingResolved`, `system.arrived`, `site.discovered`, `site.fragmentRecovered` and `goldenPath.milestoneReached`. Give one-time events stable IDs. Retrying an interaction, loading a save or having both players report the same discovery must not duplicate rewards or advance twice.

The Story Log has Current Leads, Expedition Record and Basics. Record facts separately from crew hypotheses. Store event IDs, subjects and compact evidence; render text from versioned content. Keep already-revealed entries available after a content update. A skipped introduction creates the incident summary and first lead, but does not falsely mark hands-on lessons as practised. Basics remain available at any time, with optional safe practice outside campaign progression.

Initial investigation sequence:

1. Investigate the outgoing transmission and identify its likely destination.
2. Plot and complete the first interstellar journey.
3. Survey the destination for infrastructure bearing a matching signal signature.
4. Locate and enter a megastructure, recover data, and return safely.
5. Gather records across additional sites to reconstruct the network's addressing and access behaviour.

Keep the current Golden Path rules: automatic entry scan worth 1 raw unit, optional 1/3-unit fragments, final cache worth 90, and extraction without requiring 100 percent recovery. Raw units above 100 receive triple credit, capped at 170 credited units per site. Shared cumulative milestones are 200 and 500 total, not 500 additional. Preserve per-site highest recovery, cross-site accumulation and replay protection. The existing two journal leads become quest evidence; the eventual entry protocol and ending remain future story work.

## Galaxy navigation and travel

Default to an orthographic overhead map with pan, zoom, search, selection and Plot Route. Offer optional tilt, selected-object height stems and a side projection. Distances and routes always use three dimensions. Show the black hole, jet axis, mirrored system, expedition base, visited paths, known systems and tracked leads without burying destinations under decorative detail.

Knowledge states are detected, charted and surveyed. Detection may provide a bearing and uncertain range; charting provides useful position/motion estimates; surveying adds system and planetary information. The renderer knowing a star's coordinates does not automatically grant that knowledge to the player. Instrument scans and observations improve the catalogue. Unknown routes remain investigable rather than being forbidden by a mission gate.

Record departure fixes, route segments and return anchors automatically. Show uncertainty and hazards before departure. Ordinary exploration should permit retracing a route; severe navigation loss requires an explicit risk or authored incident. A bright black hole supplies a bearing but does not by itself determine a full three-dimensional position.

Separate the interstellar leg from the existing local FTL controller. Its current 100c cap is in local game units; decide physical galactic speed, distance conversion and real travel duration together. A proposed pacing target is a few minutes at normal time for an ordinary neighbouring charted hop. Validate that target across all fleet families before locking a drive curve. Never achieve it by secretly advancing only one player's clock.

Preserve the existing conventional orbital route option and local FTL approach/departure. Long conventional journeys remain possible and honestly report their duration. Higher time warp requires every active player to opt in; either can cancel, and a player's surface activity, burn or encounter can constrain the shared rate. Arrival uses actual moving-system reference frames and safe approach state, not a destructive call to the current seed-change bootstrap.

A system transition saves a consistent checkpoint, acquires destination data under the worker budget, transfers existing vessels/occupants/cargo, and releases unused resources only after the handoff succeeds. Failure retains a recoverable departure/transit state. Support saving in transit. Online multiplayer is a required product feature. Split-screen is only the development/test harness for the shared player-state path. Remote peers in an instance send their own updates into the existing other-player controller/state path. Keep gameplay data trusted, with basic message decoding/version/finite-value checks to avoid broken state, rather than an anti-cheat or server-authoritative movement architecture. The transport itself is not implemented yet; current journey tests exercise the local harness.

## Black hole jets and mirror

Render a spinning black hole using a bounded, testable lensing approximation or precomputed transfer data, with a luminous disk, asymmetric brightness and exposure control. Model the jets as extended world-space emitting volumes with knots and fading outer structures. Viewing angle affects their projected length and brightness; they are not a fixed sky decal. Include their occultation by planets and the sphere, atmospheric attenuation, reflections and an explicit policy for secondary illumination and heat.

Use one luminosity/spectrum model for reported radiation, environmental effects and rendered light, with documented display tone mapping. A highly luminous active quasar cannot illuminate nearby worlds like an ordinary faint sky ornament while their climate ignores the energy. Calibrate a scenario with the intended view and compatible worlds; protected interiors, quieter feeding and more distant living worlds are distinct design options. Avoid jet interiors for routine routes. Ship displays may reveal additional spectral detail, but mark an enhanced view as such.

The mirror blocks incoming matter and electromagnetic probing in the story. Its gravity remains measurable. Exterior reflection should show the actual disk, jets and stars from the observer's location, including curvature and occlusion. Use analytic distant-source reflection for galactic features plus a bounded method for nearby craft. An opening is a local exception with explicit visual, collision and story state. Do not render or reveal the entire enclosed system just to stage the introductory aperture.

At a distance of 10 light-years, the shadow of a fictional non-spinning 60-billion-solar-mass hole is roughly 0.56 degrees across; at 50 light-years it is about 0.11 degrees. These are reference calculations for the shadow only. A spinning solution changes its shape and the surrounding disk and jets extend much farther. Exact dimensions, optical jet brightness and radiation remain calibration inputs, not claims about the observed TON 618.

Large jets show different emission ages along their length. Avoid visibly sending a disturbance across thousands of light-years in seconds. The recorded communication is an electromagnetic signal travelling at light speed; a ship using FTL may arrive at the proposed receiver before that particular pulse. The first investigation can examine older matching records, so progression need not pretend the new message arrived instantaneously.

## Ordered implementation milestones

Each milestone ends with a scoped working commit. Add the smallest necessary tests at the state/physics boundaries and finite browser checks for the user flows. These are completion conditions, not calendar estimates.

| Order | Deliverable and main modules | Completion condition |
| --- | --- | --- |
| 1 | Campaign identity, clock, storage and fleet adapters: proposed `src/campaign/{state,save,migrations}.js`; connect existing bootstrap, items and vessel hierarchy | Create, export, import and restore the current one-system game with two players, docking/cargo and site progress. Reload resumes the saved time. Invalid imports leave the current campaign intact. |
| 2 | First-run settings, quest reducer and Story Log: proposed `src/campaign/{difficulty,quests,events}.js`, `src/ui/{expeditionSetup,storyLog}.js` | All difficulty combinations create one fleet. A provisional skipped-intro start supplies a readable log and first lead. Repeated event delivery cannot duplicate progress. |
| 3 | Galaxy hierarchy, stable IDs and reserved story anchors: proposed `src/gen/galaxy.js`, `src/campaign/catalogue.js` | Random access and different query orders return identical systems. Adjacent regions are coherent. A cold start queries bounded data without generating the whole galaxy. Story anchors pass reachability and suitability checks. |
| 4 | Overhead map and persistent interstellar travel: proposed `src/ui/galaxyMap.js`, `src/sim/{systemSessions,galacticRoutes}.js` | Plot, depart, arrive and return with the same fleet and inventory. Restore during transit. Then demonstrate two players in different systems sharing time, resources and story state. |
| 5 | Catalogue sky, central object, jets and mirror: extend native sky/render passes with dedicated modules | Map/sky/destination identities agree from multiple systems. Camera-relative precision, reflected landmarks and calibrated brightness work in one and two views with bounded GPU resources. |
| 6 | Playable introduction and skip convergence: proposed `src/campaign/intro.js` plus authored scene/beat data | Play or skip any checkpoint and reach the same canonical outcome. Controls remain responsive, recovery is fair, the introduction stays single-player and multiplayer unlocks after it, and reloading any beat cannot lose or duplicate the missing tender. |
| 7 | Guided/survey discovery, assisted/standard traversal and Golden Path quest integration | The same site exists in both discovery modes; all 21 current theme profiles remain completable in both traversal modes. First receiver through 200/500-unit leads works with saves, return visits and co-op. Include newly added hall content as its owner lands it. |
| 8 | End-to-end persistence, performance and usability pass | New campaign to first recovered lead works in all flight families. Verify reload/skip, separate-system co-op, cache eviction, older save migration, input ownership, keyboard/controller access and browser failure recovery. |

Milestone 6 depends on the map/travel and central visual foundations, but the story/log content and a simple scripted rehearsal can be prepared in milestone 2. The first complete playable campaign segment ends after milestone 7; later rescue chapters do not need to be written to validate this loop.

## Performance and acceptance checks

Provisional budgets: initial chart roughly 200 systems; typical campaign JSON under 5 MB through 200 visited systems; user-visible generated-cache default around 256 MB with adjustable cap and eviction. These are targets to measure, not current results or limits on exploration. Save growth should follow actual discoveries and modifications, not the total generated population. A cache miss can cost regeneration time but must not erase progress.

Record cold/warm startup, save size, map response, frame time and memory at the existing two-worker test configuration. Compare the same scenes before and after central effects in one and two views. Avoid an unmeasured promise that millions of stars or two resident planetary systems are free. Keep distant catalogue queries and rendering independent of expensive terrain simulation.

Required coverage includes deterministic generation, version compatibility, JSON round trips, atomic slot replacement, invalid references, interrupted travel, finite numeric state, fleet ownership/cargo restoration, story event idempotence, played/skipped equivalence, 3D route lengths, catalogue/sky agreement, settings changes, site persistence and shared warp cancellation. Browser checks use owned tabs only and finite workloads coordinated with the megastructure chat.

## Decisions to settle during implementation

Choose the black hole's mass/spin, disk luminosity/spectrum, jet optical emission and sphere orbit together after a visual/physical prototype. Choose the playable introduction's duration after a flight rehearsal. Keep character names, ages and exact relationships provisional. Tune interstellar pace, scan duration, default assisted traversal and initial catalogue size through the first end-to-end loop. The daughter will be fine; the sphere's mechanism, destination of its transmission and means of safe reunion remain to be authored.

## Scientific references

NASA's [black hole size comparison](https://www.nasa.gov/universe/nasa-animation-sizes-up-the-universes-biggest-black-holes/) provides the TON 618 scale inspiration. The [shadow study](https://arxiv.org/abs/1910.02957) supports the non-spinning reference calculation. NASA's [active galactic nuclei overview](https://science.nasa.gov/mission/webb/science-overview/science-explainers/what-are-active-galactic-nuclei/) explains jet extent and viewing-angle effects; [M87 observations](https://www.nasa.gov/image-article/famous-black-hole-has-jet-pushing-cosmic-speed-limit/) show knots and emission at optical, radio and X-ray wavelengths. These support the visual/physical starting point; the mirror, passage and FTL are fictional.
