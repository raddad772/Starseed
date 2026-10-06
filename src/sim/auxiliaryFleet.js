import * as THREE from 'three';
export function dockAuxiliaryFleet(g){
 const host=g.tender;if(!host)return;
 if(!g.tenderYacht)g.tenderYacht=g.addVessel('tender_yacht','Halyard family launch','TND-4471-Y');
 const y=g.tenderYacht;
 y.dead=false;y.hull=1;y.hatchKey='tender-yacht';y.home={host,hatch:[0,-6.8,-126.5]};
 y.dockAt(host,{name:'Family launch nest',kind:'berth',gravity:0,pressure:1},new THREE.Vector3(0,-13.3,-127),new THREE.Quaternion());y.gear=y.gearTarget=0;
 if(!g.neptuneRunabout)g.neptuneRunabout=g.addVessel('runabout','Neptune surface runabout','CV-01-Y-R');
 if(!g.tenderRunabout)g.tenderRunabout=g.addVessel('runabout','Tender surface runabout','TND-4471-Y-R');
 for(const [h,c] of [[g.yacht,g.neptuneRunabout],[y,g.tenderRunabout]]){c.dead=false;c.hull=1;g.clampCargo(h,c,false,true);}
}
