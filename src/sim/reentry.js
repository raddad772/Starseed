// Entry estimates in SI units. The blunt-body model follows Sutton–Graves:
// https://ntrs.nasa.gov/citations/19720003329
// q = k sqrt(rho/Rn) V^3; the Earth-air coefficient is a screening approximation
// for other mixtures unless the atmosphere supplies entryHeatingCoefficient.
// Geometry is a hull-bounds ellipsoid, not CFD; cooling/TPS values are game design.
const SIGMA=5.670374419e-8, GAS_R=8.314462618, AIR_K=1.7415e-4;
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const hulls=new WeakMap(), gases=new WeakMap();

export const ENTRY_TIERS=Object.freeze({
 pioneer:Object.freeze({name:'Pioneer',heatCapacity:18000,emissivity:0.85,cooling:0,limit:1750,safe:1500,damageRate:0.10}),
 expedition:Object.freeze({name:'Expedition',heatCapacity:25000,emissivity:0.88,cooling:90000,limit:2100,safe:1750,damageRate:0.06}),
 horizon:Object.freeze({name:'Horizon',heatCapacity:42000,emissivity:0.92,cooling:650000,limit:2750,safe:2250,damageRate:0.025}),
});
export function entryTier(type){
 const era=(type.era||type.key?.split('_')[0]||'').toLowerCase();
 return ENTRY_TIERS[era]||ENTRY_TIERS.expedition;
}
export function hullEnvelope(type){
 let h=hulls.get(type);if(h)return h;
 let min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];
 const include=p=>{for(let i=0;i<3;i++){min[i]=Math.min(min[i],p[i]);max[i]=Math.max(max[i],p[i]);}};
 if(type.bounds){include(type.bounds[0]);include(type.bounds[1]);}
 else if(type.size){include(type.size.map(v=>-v/2));include(type.size.map(v=>v/2));}
 else{for(const b of type.hullBoxes||type.colliders||[]){include(b.min);include(b.max);}for(const p of type.probes||[])include(p);}
 if(!min.every(Number.isFinite)){const r=type.radius||1;min=[-r,-r,-r];max=[r,r,r];}
 const size=max.map((v,i)=>Math.max(0.2,v-min[i]));
 h={min,max,size,center:max.map((v,i)=>(v+min[i])/2),semi:size.map(v=>v/2)};hulls.set(type,h);return h;
}
export function gasProperties(atmosphere){
 if(!atmosphere)return {gamma:1.4,cp:1005,molarMass:0.02897,heatingCoefficient:AIR_K};
 let gas=gases.get(atmosphere);if(gas)return gas;
 // Cold/freestream ideal-gas heat capacities by molecular degrees of freedom.
 // Dissociation and shock chemistry are deliberately outside this model.
 const cv={He:1.5,Ne:1.5,Ar:1.5,H2:2.5,N2:2.5,O2:2.5,CO:2.5,CO2:3.5,H2O:3,CH4:3.5,NH3:3.5,SO2:3.5};
 let total=0,capacity=0;for(const [name,f] of Object.entries(atmosphere.comp||{})){if(f>0){total+=f;capacity+=f*(cv[name]||2.5);}}
 const gamma=1+1/(total?capacity/total:2.5),molarMass=Math.max(0.002,(atmosphere.mu||28.97)/1000);
 gas={gamma,molarMass,cp:GAS_R/molarMass*gamma/(gamma-1),heatingCoefficient:atmosphere.entryHeatingCoefficient||AIR_K};gases.set(atmosphere,gas);return gas;
}
export function entryGeometry(type,direction){
 const [a,b,c]=hullEnvelope(type).semi;
 const length=Math.hypot(direction.x,direction.y,direction.z)||1;
 const x=direction.x/length,y=direction.y/length,z=direction.z/length;
 // Geometric mean of the two principal curvature radii at the windward
 // ellipsoid support point: abc / (a²nx² + b²ny² + c²nz²).
 const radius=type.aero?.noseRadius||a*b*c/Math.max(1e-9,a*a*x*x+b*b*y*y+c*c*z*z);
 const projectedArea=Math.PI*a*b*c*Math.hypot(x/a,y/b,z/c);
 return {radius:clamp(radius,0.1,Math.max(a,b,c)*4),projectedArea};
}
export function stagnationHeat(density,speed,radius,gas,ambient=290,wall=ambient){
 if(!(density>0&&speed>0))return 0;
 const kinetic=0.5*speed*speed;
 const hotWall=clamp(1-gas.cp*Math.max(0,wall-ambient)/kinetic,0,1);
 const continuum=gas.heatingCoefficient*Math.sqrt(density/Math.max(0.1,radius))*speed**3;
 // In thin gas there cannot be more convective heating than the incoming
 // kinetic-energy flux. This bridges toward free-molecular entry conservatively.
 return Math.min(continuum,density*speed*kinetic)*hotWall;
}
export function coolingFlux(temperature,profile){return profile.cooling*clamp((temperature-500)/800,0,1);}
export function radiatedFlux(temperature,ambient,profile){return profile.emissivity*SIGMA*(temperature**4-ambient**4);}
export function heatSafeSpeed(density,radius,gas,profile,ambient=290){
 if(!(density>0))return Infinity;
 const flux=Math.max(0,radiatedFlux(profile.safe,ambient,profile)+coolingFlux(profile.safe,profile));
 return Math.cbrt(flux/(gas.heatingCoefficient*Math.sqrt(density/Math.max(0.1,radius))));
}
export function integrateHullTemperature(temperature,ambient,heatFlux,profile,dt,density=0){
 if(!(dt>0))return temperature;
 const old=Math.max(3,temperature),air=Math.max(3,ambient),input=Math.max(0,heatFlux),h=8*Math.sqrt(Math.max(0,density));
 const step=dt/profile.heatCapacity;
 const residual=T=>T-old+step*(radiatedFlux(T,air,profile)+h*(T-air)+coolingFlux(T,profile)-input);
 // A monotone implicit energy balance stays stable through time warp and
 // cannot overshoot the heating/cooling equilibrium, unlike explicit T^4.
 let lo=3,hi=Math.max(old,air,(air**4+input/(profile.emissivity*SIGMA))**0.25);
 for(let i=0;i<24;i++){const mid=(lo+hi)*0.5;if(residual(mid)>0)hi=mid;else lo=mid;}
 return (lo+hi)*0.5;
}
