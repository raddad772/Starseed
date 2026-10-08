# Starseed JSON campaign saves

Proposed format version 1, 8 October 2026. JSON is the authoritative portable campaign format. The accompanying [example](campaign-save.example.json) illustrates the contract; it is not yet a file that the current game can load. This specification supports the implementation milestones in [CAMPAIGN.md](../CAMPAIGN.md).

## Implemented save kinds

`campaign-record` stores rules, story events, discoveries and recovery with `world: null`, an unprovisioned fleet and no live players. It is useful for the isolated campaign fixture but cannot resume a flight. `single-system-flight` additionally stores a versioned live snapshot through `src/campaign/flight.js`. The illustrative multi-system example remains rejected; schema version alone does not identify a restorable game.

The flight snapshot stores vessel/player identities, exact simulation time, motion and reference frames, hull/thermal state, carried craft, inventory, doors/airlocks, lifts, turnover decks, FTL phase, navigation intent, survey entrances and per-expedition site progress. Renderer resources, input bindings, terrain arrays and generated meshes stay out of JSON. Restoring resets warp consent and pauses navigation until explicit replanning. Away player two retains their location and items. Underground explorers return to the entrance with saved mechanisms and recovery intact.

Validation covers bounded JSON size/depth, finite numbers, ordinary data objects, supported versions, quest references, journal sequencing, consistent recovery milestones, entity references, exclusive inventory ownership, seat occupancy and acyclic attachment graphs. Flight loads require matching system/world generator versions, simulation scale, epoch and vessel definition signatures. Layout migrations and old generator retention are not implemented; incompatible saves fail before the current game is replaced. Saves during crew incapacitation or moving-person rendezvous are currently rejected with an explanation.

Browser storage uses `starseed-campaigns`, storing current and previous JSON in a single transaction. Revision comparisons reject stale writes from another tab. Loading previous content is explicit; the next save compares against the current slot revision. Import creates an independent identity. Transaction completion determines success. Pause → Expedition activates saving/export for the current flight, then autosaves every 30 seconds while playing. The briefing can load existing slots. Save errors remain visible and allow manual export, including when browser storage is blocked. First activation copies only the current system's legacy progress into the expedition; originals remain untouched. New-game and tutorial checkpoints now request autosaves, including while paused; other world events still use the periodic save.

Validation: 44 focused CPU checks pass, including ten flight tests for nested frames, moving lifts, landed/orbital items, FTL, absent controllers, invalid imports, isolated site storage, concurrent requests and storage failures. Thirteen isolated browser checks previously verified campaign storage/UI. Nineteen new full-game WebGPU checks pass with two players, 34 vessels, 145,039-byte JSON, actual renderer reconstruction and the natural loading gate. That fixture disables world simulation to bound GPU work; full terrain-cache reconstruction and active underground restore still need dedicated native coverage. Multi-system travel and the fully staged mirror scene remain pending. New Expedition provisions a selected fleet once and connects its tutorial to this loader.

## Implemented galaxy extension (8 October 2026)

`single-system-flight` continues to mean one resident flight snapshot. It may now include optional `galaxy` version 1 with `currentSystemId`, `nextItemId` and `systems`. Old files without this extension still load; navigation initializes it on first use. The catalogue generator version is pinned separately. No stars are stored merely because they appear on the map.

`galaxy.systems` holds **unloaded** system deltas, keyed by canonical system address: `{seed, items, sites, siteStorage, navSites}`. Only surface/orbital items may be stored there; held and cabin items remain in `world.items`. The active system never has a duplicate cached record. Global item uniqueness, destination/seed identity, valid body references and the next-item high-water mark are validated on import/export. There is a bounded 512-unloaded-system limit in addition to the existing 10 MB / JSON-node limits. Encountering a limit fails the departure checkpoint rather than dropping old progress.

A fleet passage writes departure first, reconstructs a copied arrival snapshot, then commits arrival. The party regroups in destination orbit, with local orders cleared and the shared clock unchanged. No in-transit state is claimed or serialized yet. A renderer failure retains the departure; an arrival-write failure leaves the arrival available in memory for retry/export. The previous revision is the departure checkpoint after a successful journey.

The receiver anchor now pins a generated seed and eligible life-bearing body ID while retaining its original story address. Existing unvisited provisional receivers acquire the same pin on first navigation; already visited systems never reroll. Initial chart positions and cell summaries remain derived data, with no hundreds-of-megabytes star dump.

## Tutorial checkpoint

The introduction is now single-player. Older files may still contain an active P2 tutorial record; restore treats that person as away crew until completion/skip, preserving their placement and inventory. The next snapshot records them as inactive. Completed introductions restore normal multiplayer availability. No new schema version is required because the data remains losslessly representable.

New expeditions add optional `story.intro.tutorial` version 1: lesson phase, stable reference-vessel ID, measured starting offset, scan progress, simulation-time incident duration and correlated probe IDs. Existing saves without this field still load. Validation checks the phase, bounded/finite values, reference craft, assigned player craft and agreement with canonical story completion. Played and skipped outcomes use the same incident/bearing events; repeated application cannot duplicate the journal or fleet.

Controller bindings are transient. The solo player can skip immediately, and a missing controller retains its character through the existing away-player mechanism. New campaigns start with empty site ledgers rather than adopting sandbox progress. Survey marker discoveries use campaign-scoped string entries alongside the existing site protocol; assisted traversal derives from saved rules when entering a sector.

Campaign state may advance while IndexedDB writes the prior snapshot. Completion updates revision metadata without replacing newer story state, and another checkpoint save follows. Initial creation and explicit tutorial transitions save when the game reaches its ready state even if paused; ordinary periodic autosaves still require active play. The full tutorial/skip native fixtures exercise the UI and controller paths, while CPU tests check phase validation and concurrent save semantics.

## Storage model

Use one JSON document per campaign snapshot. Browser autosaves store that JSON and small slot metadata in a dedicated IndexedDB database. Manual Export downloads the same document as `campaign-name.starseed.json`; Import validates and stages it before offering the imported slot. JSON describes the data format, while IndexedDB supplies browser persistence and transactions. Ordinary browser code cannot silently overwrite an arbitrary file on the user's disk.

Keep a current autosave and at least one previous valid revision. Replace the current slot and rotate its previous revision in one transaction. Serialize a consistent end-of-tick snapshot, then perform asynchronous I/O. Coalesce save requests rather than overlapping writes. Save at quest transitions, travel departure/arrival, major pickups, site exit and periodically after changes. Treat page-close saving as best effort, never the sole persistence path.

If storage fails or quota is exhausted, keep the live campaign, retain the previous save and show a persistent Save Failed state with manual export. Do not report success just because serialization succeeded. Separate campaign deletion, generated-cache clearing and global display/control settings in the UI.

## What belongs in the document

| Section | Required responsibility |
| --- | --- |
| Identity | Format/schema version, campaign ID, label, revision, creation and save timestamps. |
| Generation | Galaxy seed, separate galaxy/system/world/content versions, simulation scale and reserved story anchor definitions. |
| Clock | Epoch and saved simulation seconds; default no offline catch-up. |
| Rules | Starting fleet family, exploration policy, puzzle assistance, site-presence policy and their versions. |
| Players | Persistent player IDs, character/relationship references, location/attachment, suit/inventory state, personal assists and tracked lead. Hardware/controller bindings stay outside the campaign. |
| Fleet | Stable vessel ID and type/content version, motion/reference frame, hull/thermal/equipment state, landing/docking/parent relationships, manifest and owned inventory. |
| Travel | Stable route and destination IDs, phase, departure state and progress needed to resume an interstellar leg. |
| Discoveries | Known systems and measurement quality, surveyed bodies, observations, return anchors and map notes. Unvisited procedurally derivable stars are omitted. |
| Story | Intro checkpoint and played/skipped status, facts, bounded meaningful events, quest steps and one-time effect IDs. |
| Sites | Entrance anchors, profile/layout version, mechanism progress, fragments, beacons and safe return state. |
| Recovery | Highest raw recovery per site. Credited total is derived with the recorded reward-policy version, not added again on load. |
| World changes | Persistent loose objects, cargo transfers, damage or other user changes not already owned by another section. |

Persist the input needed to reconstruct live state, not `JSON.stringify(game)`. Encode maps, sets, vectors and quaternions explicitly. Keep one authoritative owner for each inventory item and attachment; other sections refer to its ID. Persist all active vessel physics state needed for a continuous resume, including velocity, angular velocity, orientation, heat and FTL phase where applicable. Rebuild navigation guidance from its saved intent and current state; stale controller integrators and old burn commands are not replayed blindly.

The example is a compact two-player post-intro snapshot with a two-vessel demonstration manifest. The production fleet manifest must include every granted vessel, object and carried craft. Its IDs, coordinates and story-anchor seeds are illustrative, not validated generated destinations.

## What remains outside saves

Do not store every galaxy star, generated planet mesh, terrain chunk, shader, GPU object, render target, visibility result or cached world array in campaign JSON. The existing world-simulation IndexedDB database can continue storing typed-array caches separately. A save moved to another machine reconstructs missing generated data and may load more slowly the first time.

Give caches explicit limits and eviction. Cache pruning must support the versions referenced by loaded campaigns; the current world-cache rule that discards everything except the latest simulation version needs review. Changing a generator and deleting old caches cannot silently move a saved landing point or alter a previously recovered site.

Target a typical campaign file below 5 MB after 200 visited systems, then measure. Rich site records and long-lived object changes may exceed that; do not discard discoveries to meet the target. Archive/compress older journal detail or introduce optional region bundles later if measured growth requires it. JSON need not contain the hundreds of megabytes implied by a complete stellar catalogue.

## Coordinates and time

Galaxy anchors use a reference epoch, integer sector coordinates and physical parsec offsets, with the sector size saved in parsecs. Local object positions/velocities use the existing simulation's scaled metres and seconds. Save the scale and label units explicitly. Angular velocity is radians per simulation second; quaternions use `[x,y,z,w]`. Do not mix physical parsecs with local metres in one untagged position array.

A location references a system and an explicit frame: system inertial, body inertial, body fixed, vessel local or site local. Parent frames restore before dependents. Body IDs are stable addresses within a pinned system generator, not transient object pointers. Site-local saves also preserve the body-fixed entrance for returning to a rotating planet.

All players and systems resume at the saved campaign time. Wall-clock save timestamps are metadata. Reset warp requests to normal time on restore or player join; never restore implicit consent to high warp. A campaign loaded days later must not discover that the application advanced its ships through those days in the background. Existing date-based sandbox/test starts remain separate.

## Load and migration sequence

1. Parse into a temporary structure with bounded file and collection sizes. Validate the schema, finite numbers, enums, vector lengths and allowed text. Reject executable content and render imported text as text.
2. Check generation/content compatibility. Run explicit schema migrations on a copy. Retain the original document and provide a useful error for newer unsupported versions.
3. Validate all IDs and references: no duplicate entities, missing mandatory parents, attachment cycles, doubly owned items or impossible player attachments. Check site/quest/recovery consistency.
4. Reconstruct galaxy/story anchors and required resident systems at the saved epoch under the global worker budget. Instantiate vessel parents, then carried vessels and players. Restore site and object changes.
5. Hydrate story/quest snapshots without firing completed rewards. Derive Golden Path total from the highest-per-site ledger and recorded rules. Resume future events from a monotonic sequence.
6. Restore navigation intent and transit state, validate current safety, then release the paused reconstructed session. Commit the new current slot only when reconstruction succeeds. Failure leaves the old campaign usable.

Schema, generation, content and reward-policy versions are distinct. A schema migration changes representation; it must not quietly regenerate a different galaxy. Pin old generators where feasible. If a generator cannot be retained, require a tested migration that preserves discovered identities and anchors, or leave that save available to its compatible game version. A version number alone is not backward compatibility.

## Existing progress and multiplayer

The existing `starseed.settings` remains a local preference source. Current per-planet entrances, site progress and Golden Path localStorage records need a one-time import into a chosen campaign. Preserve originals and mark the migration complete only after the campaign transaction succeeds. Carry over the stored highest recovery without awarding it twice. Demo and test namespaces must never become campaign progress.

Scope new ledgers and saves to campaign ID. Two campaigns using the same galaxy seed share geography but have independent fleets, story and recovery. Existing legacy records do not identify a campaign, so the import UI must name the destination campaign rather than silently attach them to every new game.

Online shared instances are the intended multiplayer mode; split-screen is a local test harness, not the product's multiplayer requirement. Participants are trusted: remote player data updates the existing other-player controller/state path, with essentially no gameplay anti-cheat. Retain basic decoding, version and finite-value checks for reliable loading/replication. Shared story, fleet and discovery state need explicit ownership/merge rules and a save writer, without implying server-authoritative movement. Keep a departing player's character/state persistent and resume it on rejoin. The online transport and replication protocol remain to be implemented; portable JSON is the save format, not the wire protocol.

## Required validation

Round-trip saves in free flight, orbit, landed, docked, aboard a carrier, inside a site and during FTL/transit. Verify two players in the same and different systems, cargo ownership, current heat, reference-frame transforms and time. Test corrupted/truncated input, newer schemas, migration failure, unavailable storage, quota exhaustion and interrupted slot replacement. Check that loading or importing the same file twice never duplicates ships, rewards or site credit.

Compare played and skipped introduction states at their common departure checkpoint, allowing only presentation/lesson-history differences. Verify that cache deletion leaves campaign state intact, a fresh device reconstructs the same destinations and site entrances, and changing assistance never replaces an owned fleet. The example JSON is a documentation fixture until a loader and schema validator implement this contract.
