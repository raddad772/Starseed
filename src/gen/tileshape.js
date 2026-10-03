// The terrain tiles' shape (localsim.js runs them; worldsim/refine.js and the readers read them):
// a tile is MT x MT cells of its face's (u, v) square, simulated with MARGIN cells round it, of
// which KEEP (half) are kept: the overlap with its neighbours, where the ground cross-fades.
export const MT = 512;             // a tile's cells per side
export const MARGIN = 48;          // cells simulated round it
export const KEEP = MARGIN / 2;    // of which kept
export const TILE_VERSION = 25;
