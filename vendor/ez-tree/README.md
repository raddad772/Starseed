# EZ-Tree (vendored)

Daniel Greenheck's procedural tree generator, MIT licensed (LICENSE here):
https://github.com/dgreenheck/ez-tree, npm `@dgreenheck/ez-tree` 1.1.0 (`src/lib`).

Changes for Starseed (no build step):
- imports given their `.js` extensions;
- `presets/` and `textures.js` not vendored: `tree.js` has stubs (no presets; no textures loaded),
  the game drawing the branches' and leaves' geometry with its own flora material
  (`src/render/floraRender.js`), its options set from each world (`src/gen/life/eztree.js`);
- `assets/`: the bark colour and normal maps (1k) and the leaf sprites only.

Textures: bark from Poly Haven (CC0) and TextureCan (CC0), see `assets/bark/SOURCES.md`.
