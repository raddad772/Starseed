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
