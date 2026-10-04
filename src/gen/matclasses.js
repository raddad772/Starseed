// The ground's material classes: what the terrain shader dresses each part of the ground in, from the
// scanned surfaces of tools/build-materials.py (assets/materials). The world sim decides the ground's
// colour; a class gives it its structure (grain, cracks, pebbles, beds) and its gloss. A vertex holds
// each class's share (terrain.js shade writes them after its own mat slots; chunkbuilder.js packs them).
export const MAT_CLASSES = ['igneous', 'basalt', 'layered', 'carbonate', 'gravel', 'regolith', 'sand', 'crust', 'soil', 'cover', 'snow', 'ice'];
export const MC = Object.fromEntries(MAT_CLASSES.map((n, i) => [n, i]));
export const MAT_W0 = 8;                            // (the first class's slot in shade's mat array)
export const MAT_N = MAT_W0 + MAT_CLASSES.length;   // (mat's length for a caller wanting them)
// lithology.js's rocks (in its order) to classes: granite, basalt, andesite, sandstone, shale,
// limestone, chalk, alluvium, salt, regolith, ice, quartz sand, coral sand, black sand
export const LITH_CLASS = [MC.igneous, MC.basalt, MC.igneous, MC.layered, MC.layered, MC.carbonate, MC.carbonate,
  MC.gravel, MC.crust, MC.regolith, MC.ice, MC.sand, MC.sand, MC.sand];
