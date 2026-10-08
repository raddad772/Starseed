// Shared advisory envelope and autopilot surface speed targets. No controls are written.
import * as THREE from 'three';
import { thrustAvailability } from './propulsion.js';
import { heatSafeSpeed,gasProperties } from './reentry.js';
const clamp=THREE.MathUtils.clamp;
const FINAL_DECEL=3;   // m/s2: the gentlest braking the final descent plans on

export function maneuverAuthority(s) {
  const belly=s.limits.belly>s.limits.main;
  return {belly, acceleration:.92*Math.max(s.limits.belly,s.limits.main)*thrustAvailability(s)/s.effMass,
    turn:Math.PI/Math.max(.01,Math.min(s.limits.rate.x,s.limits.rate.y))+4};
}
export function surfaceTargets(s,{up,range,height,targetHeight,verticalFeed=0}) {
    const b=s.body,r=s.pos.length(),authority=maneuverAuthority(s),a=authority.acceleration;
    const relative=s.surfaceVel(new THREE.Vector3()),vr=relative.dot(up);
    const horizontal=relative.clone().addScaledVector(up,-vr),speed=horizontal.length();
    const g=b.GM/r**2,net=Math.max(.05,a-g);
    const air=s.env.density>1e-7,aero=air&&s._lastAero?s._lastAero.clone().divideScalar(s.effMass):new THREE.Vector3();
    const brake=Math.max(.05,Math.sqrt(Math.max(0,a*a-g*g))*.35);
    // (closing on the site no slower than it can stop in: a level craft brakes by tipping its
    // lifters back, a few seconds' turn, not by turning round)
    let vh=Math.min(2500,Math.sqrt(2*brake*range)*.7,range/16);
    // Under orbital speed at this height: faster, the ground falls away beneath
    // the craft and holding it down takes thrust toward the ground.
    vh=Math.min(vh,.8*Math.sqrt(b.GM/r));
    // (the lifters push straight up from a level craft: down as fast as it can stop in, easing
    // in only over the last few metres, not over the last kilometre)
    let vv=clamp(verticalFeed+Math.sign(targetHeight-height)*Math.min(300,Math.sqrt(2*net*.3*Math.abs(targetHeight-height)),Math.abs(targetHeight-height)/1.8),-300,300);
    // (the last couple of kilometres down at a pace a crew rides easily: stopping in them at FINAL_DECEL)
    if(height<2000&&vv<0)vv=Math.max(vv,-Math.sqrt(2*FINAL_DECEL*Math.max(0,height-targetHeight))-2);
    const ahead=b.atm?b.atmosphereAt(Math.max(0,s.altitude+Math.min(0,vv)*20)):null;
    const heat=ahead?heatSafeSpeed(ahead.density,s.entry.radius,gasProperties(b.atm),s.entryProfile,ahead.temperature)*.8:Infinity;
    vh=Math.min(vh,heat);vv=clamp(vv,-Math.sqrt(Math.max(0,heat*heat-vh*vh)),Math.sqrt(Math.max(0,heat*heat-vh*vh)));
    // Stop descending if speed needs to come off before entering denser air.
    if(speed>heat*1.05)vv=Math.max(0,vv);
    if(s.altitude<(b.relief||0)*1.6+2200){
      const terrain=s.terrainAhead(relative,up,net*.4);
      vv=Math.max(vv,terrain.need);vh=Math.min(vh,terrain.vHmax);
    }
    if(height<250&&range<500){
      // Reserve time to level the landing gear; the last metres use the
      // existing contact/ground-guard controller and its weak reverse jets.
      const weak=Math.min(s.limits.main,s.limits.retro)*thrustAvailability(s)/s.effMass;
      vh=Math.min(vh,Math.sqrt(2*weak*.25*range),range*.06);
    }
    return {vh,vv,vr,horizontal,speed,g,net,brake,heat,a,aero,authority};
}
