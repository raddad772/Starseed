import * as THREE from 'three';
import { Rng } from '../core/rng.js';

// A later expedition's modest works end at a crude hole in alien structure.
// Props sit outside the walking line and share bounds with the collision plan.
export function buildStaging(plan,{box,cylinder,pipe,lamp,addGeometry}){
 const y=plan.deck,rng=Rng.fromString(plan.seed).fork('abandoned-excavation');
 for(const z of [-3,-6,-9]){for(const x of [-6.7,6.7])box(x,y+2.45,z,.22,4.9,.28,'rust');box(0,y+4.75,z,13.5,.24,.28,'rust');}
 for(const o of plan.utility.equipment){const [a,b,c,d,lo,hi]=o.bounds;box((a+b)/2,(lo+hi)/2,(c+d)/2,b-a,hi-lo,d-c,'metal');for(const z of [c+.12,d-.12])box((a+b)/2,hi+.035,z,b-a,.07,.09,'rust');}
 // Dismantled coring assembly, with the drill axis aimed at the breach.
 cylinder([4.7,y+1.1,-5],[4.7,y+1.1,-8],.5,'metal',10);
 for(const z of [-5.2,-5.8,-6.4,-7,-7.6])cylinder([4.7,y+1.1,z],[4.7,y+1.1,z-.09],.58,'rust',10);
 pipe([[-5,y+.16,-4],[-3.1,y+.16,-7],[-1.6,y+.16,-9],[-1.6,y+.16,-15]],.04,'dark');
 const sections=[-9.8,-11.2,-12.8,-14.4,-16,-17.5].map(z=>[[-2,0],[-1.96,2.8],[-1.25,3.84],[1.24,3.83],[1.95,2.83],[2,0]].map(([x,h])=>[x+rng.range(-.1,.1),y+h+(h?rng.range(-.12,.08):0),z]));
 const verts=[];for(let i=1;i<sections.length;i++)for(let j=0;j<5;j++){const a=sections[i-1][j],b=sections[i-1][j+1],c=sections[i][j],d=sections[i][j+1];verts.push(...a,...c,...b,...b,...c,...d);}
 const lining=new THREE.BufferGeometry();lining.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));lining.computeVertexNormals();addGeometry(lining,'rock');
 for(const z of [-11,-13.7,-16]){box(0,y+3.55,z,3.6,.18,.24,'rust');for(const x of [-1.75,1.75])box(x,y+1.7,z,.16,3.4,.2,'rust');}
 // Broken perimeter of the final cut: exposed reinforcement and chips, no cap.
 for(const x of [-2.05,2.05])for(let h=.35;h<3.8;h+=.65){const g=new THREE.IcosahedronGeometry(.34,0);g.scale(.6,1,1);g.translate(x,y+h,-17);addGeometry(g,'concrete');cylinder([x,y+h,-17.4],[x*.86,y+h+.12,-16.75],.025,'rust');}
 lamp(-3,y+4.4,-5,'amber',110);lamp(1.3,y+3.55,-13,'amber',50);
}
