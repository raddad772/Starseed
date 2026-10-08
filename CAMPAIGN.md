# Starseed campaign implementation plan

Status: implementation started, 8 October 2026. Campaign records, event handling, JSON storage and reusable setup/Story Log views are implemented and tested in isolation. The live game is not yet connected to them. The existing renderer, flight guidance and megastructure prototype remain the foundation. Story treatment: [STORY.md](STORY.md). Save contract: [notes/SAVE_FORMAT.md](notes/SAVE_FORMAT.md).

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
| Multiplayer | The missing passengers can include several players' children | Shared expedition and story progress; personal controls, flight assists, map focus and tracked lead. Existing two-player local play is the first supported mode. |
| Saves | JSON for now | Versioned campaign JSON, transactional browser autosaves, manual export/import and a disposable generated-data cache. |

The daughter chooses to investigate and enter. This is a hopeful game and she will be fine: build toward reunion without a hidden rescue timer or penalties for side exploration. The shared passengers follow the same hopeful direction. The mirror's purpose, its relationship to the black hole and the means of reunion remain unwritten. The opening's communication purpose is initially the crew's interpretation of evidence.

The intended feel is hopeful space exploration, with a home you bring along. “Cozy exploration” is a useful design reference rather than a settled genre label. Familiar ships, a supportive crew, unhurried discoveries and forgiving assistance can provide comfort alongside enormous landscapes and demanding optional piloting. Give players time to linger, return home and prepare; do not use the family story to make those choices feel irresponsible.

## First implementation checkpoint

`src/campaign/state.js` creates independent campaign identities and handles the introductory incident, transmission destination, arrivals, site discovery and highest-per-site recovery. Repeated events cannot award the same progress twice. Played and skipped intro events reach the same canonical state; neither event pretends to have run a playable scene. Existing surveyed knowledge survives later discoveries. All twelve difficulty combinations select a starting fleet policy without spawning vessels.

`src/campaign/save.js` validates and round-trips portable **campaign records**, including schema/content versions, quest references, journal sequences, finite values and recovery milestones. Imports create a new campaign identity. `src/campaign/storage.js` stores current and previous JSON revisions transactionally in IndexedDB, rejects stale writers and supports explicit previous-revision restoration. This is persistence for the campaign record only: `saveKind: "campaign-record"`, `world: null`, no provisioned fleet or players. Full flight save/load, automatic save scheduling and legacy progress migration remain unimplemented.

The reusable `src/ui/expeditionSetup.js` and `src/ui/storyLog.js` views can be exercised at `tools/tests/campaign.html`. That development preview provides settings, journal/current leads/basics, JSON export and isolated browser storage checks. It starts no renderer or world workers and does not change existing game saves. These views are not yet wired into the game bootstrap or pause menu.

Validation: nine CPU tests pass, covering all settings, played/skipped state convergence, duplicate and invalid events, recovery after reload, time preservation and invalid imports. Thirteen real-browser checks pass for transaction aborts, concurrent writers, previous revisions, independent imported slots, safe text rendering and form choices. Milestones 1 and 2 remain in progress; the next step is the live vessel/player/item/site snapshot and restoration adapter, followed by bootstrap integration.

## Existing foundation and necessary changes

| Existing code | What can be reused | What the campaign still needs |
| --- | --- | --- |
| `src/main.js`, `src/game.js` | Briefing, world startup, players, live fleet and view orchestration | Campaign creation/restore. Current seed travel disposes the game and creates a fresh fleet; it is not a persistent interstellar journey. |
| `src/core/rng.js`, `src/gen/system.js`, `src/gen/star.js` | Independent seeded streams, system summaries, planetary formation and stellar properties | Stable galaxy/system addresses; spatially correlated stellar populations; wider stellar classes including remnants and massive stars. Current stars primarily cover 0.08–3 solar masses. |
| `src/render/sky.js`, native WebGPU passes | Star rendering, sky background, exposure and atmosphere integration | Replace unrelated decorative stars with catalogue objects; add disk, lensing, jets and mirror rendering. |
| `src/ui/map.js`, `src/ui/pauseScreen.js` | System orrery, selection and catalogue UI | Overhead galaxy map, knowledge states, routes, accessible depth cues and per-player ownership. |
| `src/sim/navComputer.js`, `orbitalRoutes.js`, `orbitalFlight.js`, `ftl.js` | Conventional transfers, launch windows, engine-limited guidance and local FTL | Interstellar route execution, preserved state on arrival, confidence/range checks and a defined galactic travel speed. |
| `src/sim/worldClock.js`, `warpConsent.js` | One simulation clock and unanimous high-warp consent | Campaign time restored from saves; no offline progression by default; consistent time across resident systems and transit. |
| `src/sim/eraFleets.js` and era fleet modules | Three fleet families and their physical handling | One-time campaign provisioning, saved vessel identities and return without respawning or healing the fleet. |
| `src/understructure/*` | Persistent entrances, walking, mechanisms, maps and Golden Path recovery | Campaign storage adapter, real survey discovery, difficulty policy and quest events. Coordinate these interfaces with the megastructure owner. |
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

Keep one megastructure per eligible solid life-bearing planet, at 100 percent presence while playtesting. Preserve the configurable roughly 1 percent future policy and record its campaign version. Any guaranteed story site remains an explicit exception, with no duplicate site on its planet.

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

A system transition saves a consistent checkpoint, acquires destination data under the worker budget, transfers existing vessels/occupants/cargo, and releases unused resources only after the handoff succeeds. Failure retains a recoverable departure/transit state. Support saving in transit. Remote multiplayer is a later transport layer; it is not implied by existing split-screen support.

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
| 6 | Playable introduction and skip convergence: proposed `src/campaign/intro.js` plus authored scene/beat data | Play or skip any checkpoint and reach the same canonical outcome. Controls remain responsive, recovery is fair, both players can participate, and reloading any beat cannot lose or duplicate the missing tender. |
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
