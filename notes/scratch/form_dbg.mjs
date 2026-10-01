import { Rng } from '/Users/dave/dev/starseed/src/core/rng.js';
import * as dm from '/Users/dave/dev/starseed/src/core/dmath.js';
import { generateStar } from '/Users/dave/dev/starseed/src/gen/star.js';
const seed = process.argv[2] || 'SOL-0001';
const root = Rng.fromString(`starseed/v1/${seed}`);
const star = generateStar(root.fork('star'));
const r = root.fork('disk');
const disk = { sigma1: 11 * star.mass * dm.pow(10, star.metallicity) * r.lognormal(1, 0.5), snow: star.snowLine * r.range(0.85, 1.15), iceBoost: r.range(2.5, 4.0), pebbleBoost: r.lognormal(2.6, 0.35) };
console.log(disk);
const rng = root.fork('formation');
const p1Days = rng.logUniform(3.5, 90);
let a = dm.cbrt((p1Days / 365.25) ** 2 * star.mass);
const slots = [];
while (a < 32 && slots.length < 13) { slots.push(a); const ratio = Math.max(rng.lognormal(a > disk.snow ? 2.25 : 1.72, 0.2), 1.3); a *= dm.pow(ratio, 2/3); }
for (let i = 0; i < slots.length; i++) {
  const aAU = slots[i]; const aIn = i>0?slots[i-1]:aAU/1.4, aOut = i<slots.length-1?slots[i+1]:aAU*1.4;
  const beyond = aAU > disk.snow;
  const sigma = disk.sigma1 * dm.pow(aAU, -1.5) * (beyond ? disk.iceBoost * disk.pebbleBoost : 1);
  console.log(aAU.toFixed(3), 'width', ((aOut-aIn)/2).toFixed(3), 'sigma', sigma.toFixed(2), 'solid', (0.2355*aAU*(aOut-aIn)/2*sigma).toFixed(2));
}
