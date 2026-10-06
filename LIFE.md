# Life sim: the plan to act on

Started 2026-10-06 (session 39d69fa8). The world sim (WORLDSIM.md) already makes life's deep history
(`gen/worldsim/evolve.js`) and its map (`gen/worldsim/life.js`); this is what grows from there: the
plants you walk through, the animals you watch, and how many of each.

## Ground rules (Dave, keep to them)

- **No "No Man's Sky goof creatures that just sit around and do nothing."** Everything alive exists
  because its world produced it, and every animal is always doing something its body and its place
  make it do (a daily round, seasons, herds, flight, the hunt).
- **Varied, very alien, never random.** Each world's body plans are its own (alien symmetries, limb
  counts, skeletons), but each part from function and lineage: a world's life shares family traits.
- **History, not noise.** Every leap (a stage of life, a plant group, a trophic level, a body plan's
  radiation) is a chance per Myr on the history's clock, depending on the room it has (how much of
  the world is covered), energy (light, warmth, chemistry), radiation (the star, ozone, the magnetic
  field), oxygen, and the boost after an extinction; and catastrophes take things away again (the
  field dying, the air stripped, snowballs, impacts, floods of basalt).
- **The energy pyramid.** ~10x the energy at each trophic level below (Lindeman), from net primary
  productivity; each level fills if it has had time to evolve and its energy over the range it needs
  supports a viable population, up to predators of predators where life is rich; densities by body
  mass (Damuth, M^-0.75). The sea its own pyramid from plankton.
- **Plants:** grasses, ferns and trees, and the groups a world has set by its history (mats, mosses,
  ferns, seed plants, flowering plants and grasses), their forms by climate, gravity (tree height,
  taper) and wind. Leaf colour from the world's history and environment (pigments.js); tree size from
  gravity.
- **Pretty things:** flowers and their equivalents (coloured for their pollinators' eyes, blooming
  with the seasons, only where a lineage evolved them); BASIC insects as dots/sprites, not modelled.
- **Seeing:** colour as banded spectra (~8 bands); each world's animals evolved to see its surface
  light (the star through its air or water) and their patterns (camouflage, warning, display) are made
  in that vision. Internal logic only: the player sees with human eyes ("we are humans exploring
  alien worlds").
- **Observation only for now:** animals never dangerous to the player.
- **Intelligence** is a separate sim later, alongside the creature models.
- **Procedural animation** for every animal: gaits from its body (limbs, their lengths, gravity:
  Froude scaling), feet on the real ground (IK), bob and sway, turning and resting from behaviour.
- Coarse populations and herds are world state (every client alike, on the world clock); the
  individuals near a player are spawned from that state and animated where they are
  (world-vs-player-state). Visible things collide (physically-real-worlds).

## What's there (2026-10-06)

- `evolve.js`: life's stages on an innovation clock (single cells .. land animals), each a hazard per
  Myr: warmth, light, radiation (surface dose from the star's XUV, ozone, the field's shield, the
  air; giant hosts' belts), oxygen, interior energy, the biosphere's fill, extinction boosts, per-world
  difficulty luck, and now the room each stage has (sea or land area, ice, the world's size). Losses:
  impacts, supervolcanoes, flood basalts, snowballs, heat, freezing, drying, a deadly sky on land
  (the field gone); sterilisation, with deep refugia. Records every event and extinction.
- `life.js`: productivity (Miami model x light x soil and water; the sea's by nutrients), structure
  (forest, open, fire-kept grassland, ferns/shrubs before grasses, tundra, desert), spread inland,
  realms (founding lineages per landmass), diversity.
- `pigments.js`: photosynthetic pigments by the star, foliage colour via CIE.
- `gen/life/biosphere.js`, `spectrum.js`, `ecology.js`, `creature.js` (phases 1-3, first cut): body
  plans, the land's ruling lineage through its eras, trophic levels and flight as leaps on the
  history's record, the light in bands and the eyes' window, the food web on the climate grid (Miami
  NPP, a tenth a level, a level read over its range, numbers a km2 from field metabolic rates), a
  species' body from plan, lineage, level, mass and gravity.
- `sim/fauna.js` (world state): a world's species, a few to a level, each suited to a country (the
  climate of a place its level lives: "temperate wet grasslands"); its herds, homes on a 512 m 3D
  lattice through the datum sphere (each cube's own hash, as many as the food web feeds), each grazing
  a spot and walking on to the next (an AR(1) wander about home, 100 s legs, at its walk or a trot),
  its animals milling round (a step to a spot of their own every 12 s, then grazing, a head up now and
  then) and filing after it on the move. Everyone who comes sees the same herds in the same places.
- `render/faunaRender.js` + `creatureRender.js` (phase 4, first cut): herds within ~1.4 km, each
  animal on the ground under it (its frame to the slope), its heading turning toward its motion, its
  gait from its speed (steps quicken then lengthen; two-bone IK), four instanced draws a species.
  Viewer state for now: flight from you within its flight distance (bigger flees sooner: Stankowich
  2008; hunters let you nearer), turning aside from water; a hunter's 12 s dash at a herd of the level
  under it within 90 m (the herd bolts), then 90 s before another; both drift back to the herd's path.
  Not yet: collisions with the walker, cliffs avoided, day and night, the sea's life, flyers.
- **Realms and their lines** (Dave: "identify islands and continents early on and give them branching
  trees and have a chance of cross-pollination"): world.js RealmTracker now keeps its family tree
  (each realm's parent and when it began: a split, new land colonised from the nearest realm across
  the water, the first landmasses from the sea's stock; the interchanges when landmasses meet), and
  the snapshot carries the realm map on the climate grid and the tree (an island the life map
  reached later hangs off the nearest tracked realm, from when life got there). SIM 66.
  `gen/life/lineage.js`: traits (size, legs, build, head, neck, tail, colours, pattern, crest) drift
  as Brownian motion down each branch from the ruling lineage's radiation (its era's start), so
  sister realms hold related animals and long-parted ones strange ones; a realm parted under 2 Myr
  holds its parent's very species (the same names); an interchange brings lines across (up to half a
  realm's species descended from the other's); the island rule (small grow, big shrink, the smaller
  the island). `sim/fauna.js` realmOf: a realm's species, so many to a level as its land holds
  (species-area), none of a level it can't keep 30 of (an island's hunters). SOL Earth: 44 realms,
  the big continent's six species, its fresh split's the same six, islands their own (crested,
  banded, plain...).
- **Flyers** (Dave: "don't forget birds"): `gen/life/flyer.js` (wings from the plan's front limbs, a
  radial plan's ring of flaps; span, beat and cruise from mass, gravity and air: Rayner, Pennycuick);
  each realm a small flyer or two in flocks (figure-eight circuits over their country, beating in
  bursts, gliding between, each a beat behind the next) and a big soarer where they've evolved
  (circling thermals 90-180 m up, drifting between them, banking). Drawn as two hinged panels a wing.
- The catalogue: Realms (how many, islands, interchanges) and Species (the four biggest realms, three
  walkers and a flyer each: role, mass, herd or flock, where it lives, the realm its line came from).
- **Grass** (Dave: "put some grass on that and it could be pretty"; first cut): `render/grassRender.js`,
  tufts within ~30 m (thick near, thinning off), as thick as the life map's cover and open share
  (grassland thick, forest floor thin; none on sand, beaches, ice, water, frozen or steep ground),
  grasses where evolve.js's plantGrade has them (fern fronds before), the world's pigment browning
  where it's dry, swaying. Needs: denser, finer blades; seasons; flowers (LIFE.md 5).
- **Places** (Dave: the catalogue's land by continents and islands with km2 and tags to search):
  `worldsim/places.js` in the sim worker (SIM 67): every landmass (continent, large island, island,
  islet; archipelagos), its game-scale area, latitudes, climate, country, coasts (beaches by sand,
  cliffs, reefs), heights, waters, volcanoes, life (realms), and tags; named (landmarks.js
  namePlaces); the catalogue lists a world's places with their animals, and "Find a place" searches
  the system's worlds by tags (searchPlaces: aliases, the most specific first); Go sets the target
  and the nav computer's landing site (a beach when the words ask for one).
- **Fire through the recent centuries** (Dave: "a relatively fine near-time sim for some things, like
  forest fires"; memory disturbance-sims-later): `gen/life/fire.js`, the land cut into ~8 km fire tiles
  (19 a face on SOL Earth), each run over 300 years on 32 m cells with a 1.5 km margin, in the terrain
  workers on demand (`sim/fireField.js` asks for the tiles near the camera). The regime from the
  snapshot: dry months (Gaussen: rain under twice the temperature) or the warm season's want of water
  (a boreal summer's), lightning from the warm season's storms, the plants' cover (grass, forest), no
  fire under ~15% oxygen. Each year a regional drought; strikes on a world-fixed 1 km lattice (tiles
  agree on them); fires burn in rounds for a span of their own (an exponential, longer the drier),
  each round a step's chance by fuel (grass back in a year or two, forest litter over decades), the
  year's dryness, wind (the latitude's) and slope, the head with the wind, flanks at half pace, back a
  third (egg-shaped burns); crowning in severe years replaces a stand. Seams between tiles wander
  (noise) so two histories meet along a wavy line. SOL Earth: savanna ~every 10-20 years, seasonal
  forest ~30-40, wet temperate and rainforest rarely (thousands). The grass reads it: none the year it
  burned, a green flush for a few years, thick where a crown fire opened a forest until its canopy
  closes (~35 years), thin under old forest. The ground shows it too (chunkbuilder.js, the finer
  chunks: this year's burn charred, last year's darkened, a green flush after; the workers keep their
  own fire tiles, the same fires as the main thread's: the terrain params' fireO2 and seed). The
  catalogue says how often each place burns. Not yet: the trees (foliage redo), floods and windthrow,
  intelligent species' warming.
- **A day's round** (sim/fauna.js dayClock, activeTime): each herd's path runs on its own active time,
  its kind's activity by the local solar hour at its home (grazers by day, most in the morning and the
  evening; hunters at dusk, through the night, at dawn), so a herd stays put through its rest and walks
  on where it was (world state: the world's spin and sun at the time); resting animals lie down (the
  body let down, the legs folding by the IK, the head down); flocks roost by night.
- **Flowers** (grassRender.js): where flowering plants have evolved (plantGrade 3+), heads on some tufts,
  thickest on open moist grassland and a burn's first years, coloured across the land animals' visual
  window (biosphere seeing: its ultraviolet shows to us as a pale violet, its near infrared a deep red)
  and white.
- **Trees, a placeholder** (`gen/life/tree.js`, `render/treeMesh.js`): the old flora's trees (placement,
  collisions, impostors kept) grown by branching in EZ-Tree's way, not EZ-Tree itself: forms from the
  plants' history (flora.js: seed trees as conifers with tree ferns among them, flowering trees as
  broadleaf crowns, now and then the world's own alien forms), trunks as wide as the solid field
  takes them, crowns of rounded leaf cards at their own tilts. Dave asked whether this is EZ-Tree: not
  yet; porting it (MIT, dgreenheck/ez-tree, its leaf and bark textures) waits on his OK to download it.
- `flora.js`/`floraRender.js`: the current scattered plants (to be redone: foliage-redo-later).
- The climate's months (monsoons, dry seasons), the seasons (snow, ice, river flow).

## Plan, in order

1. **Biosphere, world level** (`gen/life/biosphere.js`, from body data + history): plant groups and
   when each arose (mosses -> ferns -> seed plants -> flowering plants -> grasses, each a hazard per Myr
   on the history's clock with its room and energy, losable); the founding body plans (2-4, at the sea
   animals' arrival) and their radiations through the extinctions (which lineage dominates land, sea,
   air now); trophic levels and when each could arise; the surface light in bands and the visual
   window (`gen/life/spectrum.js`).
2. **Ecology map** (per climate cell, cached with the seasons): net primary productivity, the
   pyramid's energy per level and which levels stand (time, energy over range), densities by size
   class; herds' ranges and migrations from the seasons (the rain belt, the green-up, snow).
3. **Creatures from plan and niche**: body (size from the pyramid and gravity; limbs, gait; senses);
   patterns in their own vision (camouflage against their world's ground and plants, signals).
4. **Procedural animation and behaviour**: gait generator, IK, the daily round, herds/flocks, flight
   distance, predators stalking (observation only).
5. **Plants' geometry**: EZ-Tree (MIT, three.js) ported into the workers, deterministic, its
   parameters from the world; space colonization for crowns; L-systems for ferns, fronds and flowers;
   impostors far; GPU grass; insects as sprites.
6. **Banded spectra everywhere**: foliage, ground, creatures; human RGB via CIE.
7. **The catalogue's life** (Dave: "the catalogue to give species, where they're usually found, etc.
   Maybe just a few highlights"): per world a few highlight species (its dominant grazer, predator,
   flyer, a sea creature, notable plants and flowers): what it is, where it's usually found (biome,
   realm, season), how it lives (herds, night-active, migrates), its lineage in a line.
