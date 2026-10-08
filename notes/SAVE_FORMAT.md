# Starseed JSON campaign saves

Proposed format version 1, 8 October 2026. JSON is the authoritative portable campaign format. The accompanying [example](campaign-save.example.json) illustrates the contract; it is not yet a file that the current game can load. This specification supports the implementation milestones in [CAMPAIGN.md](../CAMPAIGN.md).

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

One authoritative local campaign handles both players' events and saves. Both see the same story, fleet and discovered facts; each can track a different lead. Keep a departing player's character/state persistent and resume it on rejoin under a safe placement policy. Network multiplayer, if added later, needs an authority and replication protocol; portable JSON is not that protocol.

## Required validation

Round-trip saves in free flight, orbit, landed, docked, aboard a carrier, inside a site and during FTL/transit. Verify two players in the same and different systems, cargo ownership, current heat, reference-frame transforms and time. Test corrupted/truncated input, newer schemas, migration failure, unavailable storage, quota exhaustion and interrupted slot replacement. Check that loading or importing the same file twice never duplicates ships, rewards or site credit.

Compare played and skipped introduction states at their common departure checkpoint, allowing only presentation/lesson-history differences. Verify that cache deletion leaves campaign state intact, a fresh device reconstructs the same destinations and site entrances, and changing assistance never replaces an owned fleet. The example JSON is a documentation fixture until a loader and schema validator implement this contract.
