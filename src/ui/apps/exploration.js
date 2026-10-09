import { THEME } from '../screens/kit.js';
import { recordLocalSurvey } from '../../sim/exploration.js';

export class ExplorationApp {
  constructor(game, player) {
    this.game=game;this.player=player;this.w=780;this.h=570;this.title='Expedition';
  }
  setup(vessel, station) { this.v=vessel;this.station=station;this.message='';this.selected=null; }
  async survey() {
    if (this.busy) return;
    this.busy=true;const v=this.v;
    try {
      const record=await recordLocalSurvey(this.game,v);
      if(this.v===v){this.selected=record.bodyId;this.message=`${record.name} added to the expedition atlas.`;}
    } catch(error) {if(this.v===v)this.message=error.message;}
    finally {this.busy=false;}
  }
  draw(ui) {
    const v=this.v,g=this.game;
    if(v.dead || this.player.vessel!==v){this.player.ui.suit.close();return;}
    ui.rect(0,0,this.w,60,'rgba(79,214,230,0.06)');
    ui.text(this.station.label.toUpperCase(),24,35,{size:18,weight:700,color:THEME.target,maxW:520});
    ui.text(v.name,this.w-24,35,{size:14,align:'right',color:THEME.dim});
    if(this.station.kind==='garage'){this.drawGarage(ui);return;}
    const b=v.body;
    ui.text(`NEAR ${b?.data.name || 'DEEP SPACE'}`,24,94,{size:15,weight:700});
    ui.text(b?.data.label || 'Exploration vessel',24,117,{size:13,color:THEME.dim});
    if(ui.button('record-survey',24,138,350,58,this.busy?'Surveying…':'Record local world survey',
      {disabled:this.busy || !b?.solid,sub:'Record surveyed sites in your ship atlas'}))void this.survey();
    if(ui.button('system-map',394,138,362,58,'Open system map',{sub:'Explore worlds and select a target'})){
      this.player.ui.suit.close();if(!g.map.open || g.map.owner!==this.player)g.map.toggle(this.player);return;
    }
    const records=[...(v.explorationLog?.values() || [])];
    ui.text('EXPEDITION ATLAS',24,230,{size:12,weight:700,color:THEME.dim,spacing:2});
    if(!records.length)ui.text('Record your first survey to begin the family expedition atlas.',24,268,{size:14,color:THEME.dim,maxW:730});
    const hit=ui.list('worlds',24,244,345,228,records.length,62,(i,x,y,w,h,focus)=>{
      const r=records[i];ui.text(r.name,x+12,y+25,{size:16,color:focus?THEME.target:THEME.ink,maxW:w-24});
      ui.text(`${r.sites.length} surveyed sites · day ${r.day.toFixed(1)}`,x+12,y+46,{size:12,color:THEME.dim});
    });
    if(hit>=0)this.selected=records[hit].bodyId;
    const entry=records.find(r=>r.bodyId===this.selected)||records[records.length-1];
    if(entry){
      ui.text(entry.name,395,270,{size:22,weight:700,maxW:350});
      ui.text(entry.label,395,298,{size:14,color:THEME.dim,maxW:350});
      ui.text(`Surface gravity: ${Number.isFinite(entry.gravity)?(entry.gravity/9.81).toFixed(2)+' g':'unavailable'}`,395,332,{size:14});
      ui.text(`Surface pressure: ${entry.pressure.toFixed(2)} bar`,395,357,{size:14});
      ui.text(`Survey sites: ${entry.sites.length}`,395,382,{size:14});
      if(ui.button('target-world',395,405,360,54,'Set navigation target',{sub:'Plot your approach from the bridge or Fleet'})){
        const target=g.universe.bodies.find(b=>b.id===entry.bodyId);
        if(target){this.player.target=target;this.message=`Navigation target: ${entry.name}`;}
      }
    }
    ui.text(this.message,24,505,{size:14,color:THEME.ok,maxW:730});
    ui.text('Ship journal · shared by bridge, lab and family atlas · Backspace to close',24,546,{size:12,color:THEME.dim});
    ui.preferFocus('record-survey');
  }
  drawGarage(ui){
    const v=this.v,g=this.game,c=v.cargo;
    ui.text(c?`${c.name} · RESTRAINED`:'Restraint released / bay available',24,108,{size:21,weight:700});
    ui.text('Board the runabout beside its seats. Y releases its restraint; R operates this ramp.',24,146,{size:14,color:THEME.dim,maxW:730});
    const ramp=v.doors.ramp,open=ramp.target>.5;
    if(ui.button('ramp',24,180,350,66,open?'Close cargo ramp':'Lower cargo ramp',{sub:`Ramp ${Math.round(ramp.open*100)}% open`}))g.toggleRamp(v);
    if(ui.button('restraint',394,180,362,66,c?'Release runabout':'Secure aligned vehicle',{sub:c?'Vehicle remains inside the moving garage':'Line up over the floor restraint markings'}))g.toggleClamp(v);
    const a=v.airlocks['garage-lock'];
    ui.text('CABIN CONNECTION',24,296,{size:12,weight:700,color:THEME.dim,spacing:2});
    ui.text(`Garage airlock: ${a.phase} · ${a.pressure.toFixed(2)} bar`,24,326,{size:17});
    ui.text('The cabin is isolated by the two-door pressure lock.',24,359,{size:14,color:THEME.dim});
    ui.text('Use the marked side lane to reach the ramp while a vehicle occupies the bay.',24,401,{size:14,color:THEME.dim,maxW:730});
    ui.text('Backspace to close',24,546,{size:12,color:THEME.dim});ui.preferFocus('ramp');
  }
}
