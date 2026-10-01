// Writes the carrier layout as JSON for the Blender build (tools/blender/build_carrier.py):
//   node tools/export-layout.mjs > tools/blender/out/bastion-layout.json
import { BASTION } from '../src/sim/layouts/bastion.js';
process.stdout.write(JSON.stringify(BASTION, null, 1));
