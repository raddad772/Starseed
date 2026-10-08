// Assistance and structure by generation. Engine forces remain the hull's own
// ratings: an orbital tug does not acquire a lander's lift or atmospheric fans
// become rockets. OFF and ROT still leave translation to the pilot.
export const FLIGHT_HANDLING=Object.freeze({
 pioneer:Object.freeze({velocityTime:1.0,deckTime:.9,levelGain:.8,guardFraction:.7,lookAhead:1,touchdown:1.8,impactFree:3.5,impactBreak:22,impactDamage:.004}),
 expedition:Object.freeze({velocityTime:.7,deckTime:.6,levelGain:1.4,guardFraction:.5,lookAhead:1.25,touchdown:1.2,impactFree:4.5,impactBreak:28,impactDamage:.0028}),
 horizon:Object.freeze({velocityTime:.32,deckTime:.32,levelGain:2.4,guardFraction:.3,lookAhead:1.8,touchdown:.65,impactFree:7,impactBreak:45,impactDamage:.0012}),
});
const LEGACY=Object.freeze({...FLIGHT_HANDLING.expedition,impactFree:3.5,impactBreak:22,impactDamage:.004,lookAhead:1});
export function flightHandling(type) {
 return FLIGHT_HANDLING[(type.era||type.key?.split('_')[0]||'').toLowerCase()]||LEGACY;
}
