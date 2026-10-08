import { surveyEnvironment } from './generatorHall.js';
import * as THREE from 'three';
import { bankRecovery } from './recovery.js';
import { generateUnderstructure,restoredProfile } from './layout.js';
import { UnderstructureSimulation } from './simulation.js';
import { buildScene } from './scene.js';
import { SurveyHUD } from './surveyHUD.js';
import { PlanetSurveySites } from './planetSites.js';

// A sector has a local metre-scale frame. Its world entrance remains body-fixed;
// player/ship objects and the universe clock never belong to the sector.
export function accessFrame(body, position, heading) {
  const up = position.clone().normalize();
  const forward = heading.clone().addScaledVector(up, -heading.dot(up)).normalize();
  const right = forward.clone().cross(up).normalize();
  const rotation = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(right, up, forward.negate()));
  return { position: up.multiplyScalar(body.R + body.groundHeight(up) + .06), rotation };
}
export function surveySaveKey(seed, bodyId, dir, profile = 'auto') {
  return `starseed.survey.v1.${encodeURIComponent(seed)}.${bodyId}.${dir.toArray().map(n => n.toFixed(6)).join(',')}.${profile}`;
}
function disposeScene(root) {
  const geometries = new Set(), materials = new Set(), textures = new Set();
  root.traverse(o => {
    if (o.geometry) geometries.add(o.geometry);
    for (const m of (Array.isArray(o.material) ? o.material : [o.material])) if (m) materials.add(m);
  });
  for (const m of materials) { for (const v of Object.values(m)) if (v?.isTexture) textures.add(v); m.dispose(); }
  for (const g of geometries) g.dispose();
  for (const t of textures) t.dispose();
  root.removeFromParent();
}
function marker() {
  const root = new THREE.Group();
  const metal = new THREE.MeshStandardMaterial({ color: 0x354e51, roughness: .65, metalness: .4 });
  const amber = new THREE.MeshStandardMaterial({ color: 0xd8b377, emissive: 0xd8b377, emissiveIntensity: 1 });
  const cyan = new THREE.MeshBasicMaterial({ color: 0x8bdace });
  const box = (w,h,d,x,y,z,m) => { const mesh = new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m); mesh.position.set(x,y,z); root.add(mesh); };
  box(1.5,.08,1.9,0,0,0,metal);
  for (let x=-.6;x<=.6;x+=.3) box(.03,.02,1.65,x,.055,0,amber);
  // Thin survey pennant marks the closed hatch from the landing craft.
  box(.06,3,.06,1.35,1.5,.8,metal); box(.7,.28,.025,1.65,2.8,.8,cyan);
  const c = document.createElement('canvas'); c.width=512;c.height=128;
  const ctx=c.getContext('2d');ctx.fillStyle='#aaf2df';ctx.font='bold 38px monospace';ctx.textAlign='center';ctx.fillText('SUBSURFACE ACCESS',256,53);ctx.font='24px monospace';ctx.fillText('SURVEY / 08',256,95);
  const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;
  const sign=new THREE.Mesh(new THREE.PlaneGeometry(3.2,.8),new THREE.MeshBasicMaterial({map:texture,transparent:true,side:THREE.DoubleSide,depthWrite:false}));sign.position.set(0,1.8,0);root.add(sign);
  return root;
}

export class SurfaceSurveys {
  constructor(game) {
    this.game=game; this.sites=[];
    this.planetSites=new PlanetSurveySites(game.seed);
    this.saveAll=()=>{for(const p of game.players)p.understructure?.save();};
    window.addEventListener('pagehide',this.saveAll);
  }
  addNear(player) {
    const b=player.body;
    const old=this.sites.find(s=>s.body.id===b.id);
    if(old)return old;
    const entrance=this.planetSites.get(b,()=>{
      const up=player.fPos.clone().normalize(), away=player.heading.clone().negate();
      const right=away.clone().cross(up).normalize();
      // First discovery: outside the craft, dry, and within a gentle height change.
      const height=b.groundHeight(up);
      for(const distance of [14,20,28])for(const angle of [0,.7,-.7,1.4,-1.4]) {
        const dir=player.fPos.clone().addScaledVector(away,distance*Math.cos(angle)).addScaledVector(right,distance*Math.sin(angle)).normalize();
        if(!b.isWaterAt(dir)&&Math.abs(b.groundHeight(dir)-height)<2)return {dir:dir.toArray(),heading:away.toArray()};
      }
      return null;
    });
    if(!entrance)return null;
    const frame=accessFrame(b,new THREE.Vector3(...entrance.dir),new THREE.Vector3(...entrance.heading)),dir=frame.position.clone().normalize();
    const saveKey=surveySaveKey(this.game.seed,b.id,dir);
    const site={body:b,frame,saveKey,seed:`${this.game.seed}-${b.id}-${dir.toArray().map(x=>Math.round(x*1e6)).join('-')}`,profile:'auto',marker:marker()};
    this.sites.push(site);this.game.engine.scene.add(site.marker);
    this.game.world.terrainOf(b.id)?.addClearing(dir.clone().multiplyScalar(b.R),6);
    return site;
  }
  nearest(p) {
    if(p.mode!=='surface'||p.understructure)return null;
    let best=null,distance=Infinity;
    for(const site of this.sites)if(site.body===p.body){const d=site.frame.position.distanceTo(p.fPos);if(d<distance){best=site;distance=d;}}
    return distance<120?{site:best,distance}:null;
  }
  interact(p,input) {
    const near=this.nearest(p);
    if(!near||near.distance>4||!p.grounded||!input.hit('KeyF'))return false;
    if(!this.game.engine.webgpu){this.game.message('Survey renderer is still preparing.');return true;}
    // The same site's progress has one writer, even with split-screen players.
    if(this.game.players.some(q=>q.understructure?.site===near.site)){this.game.message('This access lift is in use.');return true;}
    p.understructure=new SurveySession(this.game,p,near.site);return true;
  }
  prompt(p) {
    const near=this.nearest(p);
    if(near&&!p.prompt)p.prompt={key:near.distance<=4?'F':null,text:near.distance<=4?'Enter subsurface survey':'Subsurface access · '+Math.round(near.distance)+' m · cyan pennant'};
  }
  render(camPos) {
    for(const s of this.sites){s.marker.position.copy(s.frame.position).applyQuaternion(s.body.q).add(s.body.pos).sub(camPos);s.marker.quaternion.copy(s.body.q).multiply(s.frame.rotation);}
  }
  dispose() {
    window.removeEventListener('pagehide',this.saveAll);
    for(const p of this.game.players)p.understructure?.leave(false);
    for(const s of this.sites)disposeScene(s.marker);
    this.sites.length=0;
  }
}

export class SurveySession {
  constructor(game,player,site) {
    this.game=game;this.player=player;this.site=site;this.lastSave=0;this.wasUnderground=false;
    this.anchor={position:player.fPos.clone(),heading:player.heading.clone(),pitch:player.pitch};
    let saved={};try{saved=JSON.parse(localStorage.getItem(site.saveKey)||'{}');}catch{}
    this.plan=generateUnderstructure(site.seed,restoredProfile(site.seed,site.profile,saved),surveyEnvironment(site.body.data));
    this.sim=new UnderstructureSimulation(this.plan,saved);this.visual=buildScene(this.plan);
    for(const p of this.sim.beacons)this.visual.addBeacon(p);
    const camera=new THREE.PerspectiveCamera(73,1,.08,3200);camera.rotation.order='YXZ';
    this.view={camera,width:1,height:1,rect:{x:0,y:0,w:1,h:1},meterRef:.18,maxExposure:3,exposureBias:1.3};
    this.engine={scene:this.visual.scene,view:this.view,minExposure:.05,pixelRatio:game.engine.pixelRatio,time:0};
    this.hud=new SurveyHUD(player,this);
    this.ledgerKey=`starseed.golden-path.${new URLSearchParams(location.search).has('surveyTest')?'test':'campaign'}.v1`;this.syncData();
    player.ui.quick.close();player.ui.suit.close();
    if(game.map.open&&game.map.owner===player)game.map.toggle(player);
    game.setWarp(0);player.jetOn=false;player.prompt=null;player.ui.root.style.visibility='hidden';
  }
  syncData(){const result=bankRecovery(localStorage,this.ledgerKey,this.site.saveKey,this.sim.rawData);this.sim.campaignTotal=result.total;if(result.newLead)this.hud.toast('GOLDEN PATH · New lead reconstructed · open field notes');this.lastBankedData=this.sim.rawData;}
  save() {this.syncData();try{localStorage.setItem(this.site.saveKey,JSON.stringify(this.sim.save()));}catch{}}
  update(dt,input,mouse) {
    const sim=this.sim,pad=input.usingPad;
    if(input.hit('KeyM'))this.hud.toggle('map');
    if(input.hit('KeyJ')||input.hit('KeyN'))this.hud.toggle('notes');
    this.player.jetOn=false; // Sector locomotion never forwards suit-thrust commands.
    if(this.hud.panel){this.hud.mapView?.input(dt,input,mouse);return;}
    if(input.hit('KeyT')) {
      if(sim.pos[1]>-2&&!sim.moving){this.leave();return;}
      if(sim.teleport()){this.leave();return;}
      this.hud.toast('Surface return unlocks when the site record is recovered.');
    }
    if(input.hit('KeyE')||(pad&&input.hit('KeyF'))){this.hud.toast(sim.interact());this.save();}
    if(input.hit('KeyL')||(!pad&&input.hit('KeyF')))sim.flashlight=!sim.flashlight;
    if(input.hit('KeyB')||input.hit('KeyK')) {if(sim.beacon()){this.visual.addBeacon(sim.beacons.at(-1));this.save();}}
    sim.yaw-=mouse.dx;sim.pitch=THREE.MathUtils.clamp(sim.pitch-mouse.dy,-1.4,1.4);
    sim.step(dt,{forward:input.axis('KeyS','KeyW'),strafe:input.axis('KeyA','KeyD'),vertical:input.axis('KeyC','Space')-(pad&&input.down('KeyP')?1:0),brake:input.down('KeyR')||input.down('KeyX')||(pad&&input.down('KeyH')),turn:input.axis('ArrowRight','ArrowLeft'),look:input.axis('ArrowDown','ArrowUp'),fast:input.down('ShiftLeft')});
    if(sim.rawData!==this.lastBankedData)this.save();
    if(sim.pos[1]<-2)this.wasUnderground=true;
    if(this.wasUnderground&&sim.pos[1]>=-.01&&!sim.moving){this.leave();return;}
    this.lastSave+=dt;if(this.lastSave>10){this.lastSave=0;this.save();}
  }
  render(first,dt) {
    const {view,sim,player}=this;
    view.width=player.view.width;view.height=player.view.height;view.rect=player.view.rect;
    const c=view.camera;c.aspect=player.view.camera.aspect;c.fov=player.view.camera.fov;c.updateProjectionMatrix();
    c.position.set(sim.pos[0],sim.pos[1]+1.68,sim.pos[2]);c.rotation.set(sim.pitch,sim.yaw,0);c.updateMatrixWorld();
    this.visual.update(c,dt,sim.time,sim);this.engine.time=sim.time;this.engine.pixelRatio=this.game.engine.pixelRatio;
    this.game.engine.webgpu.render(this.engine,first);this.hud.update();
  }
  leave(restore=true) {
    this.save();const p=this.player;
    if(restore){p.placeOnSurface(this.site.body,this.anchor.position.clone().normalize(),this.anchor.heading);p.pitch=this.anchor.pitch;p.fade=1;}
    p.understructure=null;p.ui.root.style.visibility='';this.hud.dispose();
    this.game.engine.webgpu?.releaseView(this.view);disposeScene(this.visual.scene);
    this.game.engine.adaptReset=true;
    if(restore)p.ui.hud.message(this.sim.dataRecovered?'Site record secured · back at surface access':'Back at surface access','nav');
  }
}
