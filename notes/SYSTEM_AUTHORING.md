# System authoring, chart outlines and preparation

Implemented 8 October 2026. This is the input/cache foundation, not seamless jump-to-surface travel.

## Three data layers

1. `summarizeSystem` runs only the star/disk/formation head: star properties, planet count, basic
   planet inputs, HZ candidates and a qualitative life-potential estimate. It does not build body
   histories, terrain, world simulations or life forms. Galaxy summaries have a bounded 256-entry
   cache. The first receiver comes from an offline-verified pool; opening the map never hunts
   through full system generations. In the browser fixture: 200 entries in 20.1 ms cold, 0.62 ms
   cached. These are local measurements, not a cross-hardware performance guarantee.
2. Detailed generated systems contain bodies, typed history series, derived properties and terrain
   parameters. A serial worker prepares the current system, receiver and two nearby systems.
   Runtime copies cannot mutate cached templates. The in-memory cache holds at most six records
   and 24 MiB of serialized-size estimates; IndexedDB holds at most eight and 32 MiB. Entries over
   8 MiB are usable but not retained. These estimates are not measured JS heap usage. Identity,
   recipe, generator/world/cache versions and distance scale enter the key; corrupt or unavailable
   caches fall back to generation. Body history query functions are restored after serialization.
3. Visits save compact body facts and surface-visit IDs in `discoveries.systems[id]`, independently
   of disposable caches. These record names/types, present or past life and notable features.
   They do not carry history arrays or unvisited systems' detailed facts. Galaxy's Survey record
   reads these records without regenerating the selected system.

`lifePotential` is an estimate, not confirmation. `lifeHistory` distinguishes present, past and
never-confirmed life using the existing evolution model's `lifeEver` and current stage. Formerly
inhabited solid planets now pass the megastructure eligibility predicate. A past habitable climate
alone does not qualify. Presence remains 100% for eligible planets during testing, one per planet.

## Procedural and authored inputs

Existing seed strings are unchanged. The full generated SOL, FSPB-8DTW and default receiver outputs
were checked against their prior hashes. `generateSystem` and `summarizeSystem` also accept a recipe:

```json
{
  "version": 1,
  "seed": "SOL",
  "star": {"name": "Our chosen star"},
  "planetOverrides": {"2": {"name": "Our chosen world", "spin": {"hours": 26, "tiltDegrees": 21}}}
}
```

Planet override indices are zero-based positions in the formation head, not body IDs. Moons are
appended after planets. Derived radius, gravity, climate, life, HZ and render parameters are rebuilt
through the same generator; arbitrary patches to those outputs are deliberately unsupported.
Use seed search to find a suitable natural biosphere. Renaming only preserves physical inputs.

A recipe may set star mass (solar masses), age (Gyr), metallicity, name and catalogue label. Either
supply sparse `planetOverrides`, or replace the entire planet list with `planets`. Each explicit
planet needs `aAU`, `massEarth` and `comp`: iron + rock + water sum to one; envelope is a separate
mass fraction. Optional `orbit` fields are e/i/Om/w/M0 in radians except eccentricity; optional
`spin` supplies hours/tiltDegrees/retrograde. Optional `moons` replaces that planet's satellite list
(`[]` means none); each uses aKm/massEarth/comp, optional e/i/tidalHeating/name. Omitted moons stay
procedural (or SOL's known inputs). `startPlanet` selects a zero-based planet.

`content/systems/handmade-example.json` is a complete three-planet example. It is illustrative,
not a certified story landing location. The schema rejects unknown inputs and bounds authoring
ranges. Runtime checks reject reversed planet order, a planet orbit inside the star, and authored
moons outside their safe orbital region. This is not an N-body stability certification.

Authored recipes receive a deterministic `D-…` world identity. Local terrain/survey caches cannot
collide with another recipe using the same random base seed. World saves and cached local deltas
carry the compact recipe. Old seed-only saves still load. A changed recipe changes identity and
cannot silently replace the occupied or visited world in an existing save.

## Put a system at a chosen location

`src/campaign/systemPlacements.js` exports `OPENING_PLACEMENTS`, keyed by region seed. New campaigns
copy that region's entries to `generation.systemPlacements`; existing campaigns keep their copy.
For example, this entry pins a searched procedural seed while leaving every other address generated:

```js
export const OPENING_PLACEMENTS = {
  'FSPB-8DTW': {
    '1:0:2': {
      definition: { version: 1, seed: 'STORY-0' },
      position: [30, 2, 4],
      label: 'Former-life survey candidate'
    }
  }
};
```

Replace `definition` with a full authored recipe to hand-build that star system. Positions are
parsecs from the central landmark; omitting position keeps the address's deterministic position.
Address `0:0:0` is the mirror host; `0:0:1` is the first receiver. Neither the physical enclosure nor
its black-hole proximity constraints are modeled by this placement facility. A custom receiver
must be certified for life/past life, three landable bodies and safe landing sites before shipping.
The default pool is checked for a current-life planet and three solid bodies by the tests; terrain
safety and physical scan objects remain pending.

This is developer-facing JSON/JS authoring, not an in-game editor. Stable map IDs are independent
of chosen generation seeds. Duplicate identities in authored placements are rejected.

## Offline seed search

Use a functioning Node runtime from the repo root:

```sh
node tools/find-system.mjs --prefix STORY --start 0 --limit 1000 --spectral GK --life either --minSolid 3 --address 1:0:2 --position 30,2,4 --out work/placement.json
```

The JSON output is ready to insert beneath a region key in `OPENING_PLACEMENTS`. Stderr reports the
chosen eligible planet and three varied landable-body candidates. `--life` accepts present, past,
either or any. The search is bounded, resumable by index, and runs outside gameplay. A no-match
result has exit status 1 and reports where to resume. Cheap spectral/planet filters precede detailed
confirmation. In particular, searching for former life never excludes worlds just because they
are outside today's HZ. A verified example is STORY-0: former-life planets plus a volcanic moon.

## Build and reuse opening bundles

```sh
node tools/prepare-systems.mjs FSPB-8DTW assets/systems
```

The shipped index contains the default origin, receiver and two nearby systems, about 1.68 MiB
compressed in total. The lossless JSON codec preserves typed arrays and infinities. At runtime the
worker tries IndexedDB, then a matching shipped bundle, then regeneration. Other region seeds and
other distance scales work without matching bundles. Rebuild after changing input content or a
relevant generator version. Keep the index and all referenced bundle files together when deploying.
Old unreferenced bundle files can be removed deliberately after rebuilding; the tool does not delete
unrelated files. New source generators still need the usual version bump for persisted caches.

The owned browser fixture prepared all four opening systems in about 300 ms and restored a single
receiver from disk in about 61 ms. Parsing, validating and copying data still have a cost; these
numbers are not terrain or travel timings. The background preparation promise exposes failures
without mutating game state; travel retries preparation before changing the saved departure.

## What remains for invisible loading

`main.js` still disposes/recreates the renderer on travel and waits for `startSim` at arrival.
`Game.beginLoading` holds play until visible terrain is ready. WorldSim snapshots/refinement have
an existing independent disk cache, but are not included in these opening bundles. GPU resources,
terrain tiles, vegetation and surface collision must be prepared/streamed with their own budgets.
Keep the renderer alive, prepare the chosen story bodies ahead of arrival, retain coarse visible
coverage and predict descent before claiming a seamless result. Validate with worldsim enabled;
the current finite fleet-passage fixture uses worldsim=0.

Validation for this checkpoint: 64 CPU checks (campaign, recipes/cache, renderer and planetary-site eligibility), nine finite
browser cache checks, and 22 live fleet passage/reload/return checks. The cache fixture verifies
worker transport, typed histories, runtime isolation, disk reuse, corrupted-cache recovery and
authored inputs. No online transport or new scan-to-site quest gates are introduced here.
