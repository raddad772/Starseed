import { createCampaign,applyCampaignEvent } from './state.js';
import { captureFlight } from './flight.js';
import { encodeCampaign,importCampaignCopy } from './save.js';
import { CampaignStorage } from './storage.js';
import { CampaignSiteStorage,bindSiteStorage } from './siteStorage.js';
import { prepareJourney } from './travel.js';
import { ensureGalaxy } from './galaxy.js';

function siteId(key){let hash=2166136261;for(const ch of key)hash=Math.imul(hash^ch.charCodeAt(0),16777619);let h2=0;for(const ch of key)h2=Math.imul(h2^ch.charCodeAt(0),65599);return `site/${(hash>>>0).toString(16)}-${(h2>>>0).toString(16)}`;}
export class FlightSaves {
  constructor({game,load,storage=new CampaignStorage(),onStatus=()=>{}}){this.onStatus=onStatus;this.game=game;this.loadGame=load;this.storage=storage;this.pending=null;this.status='Not saved yet';this.nextAuto=performance.now()+30000;}
  get status(){return this._status;}
  set status(message){this._status=message;this.onStatus(message);}
  activate(g){
    if(g.campaign)return g.campaign;
    const flight={horizon:'easy',expedition:'medium',pioneer:'hard'}[g.fleetEra]||'easy';
    g.campaign=createCampaign({seed:g.seed,label:`${g.system.star.name} expedition`.slice(0,120),rules:{flight},simulationSeconds:g.t});
    bindSiteStorage(g,CampaignSiteStorage.adopt(g.seed));g.campaign.legacyImports.push(`localStorage:${g.seed}`);return g.campaign;
  }
  snapshot(){
    const g=this.game();if(!g)throw Error('Start a flight first.');
    this.activate(g);
    let c=captureFlight(g,g.campaign);
    const systemId=c.galaxy?.currentSystemId||`system/${g.seed}`;
    // The site ledger is authoritative; bridge its high-water values into story events once.
    for(const [key,json] of Object.entries(c.world.siteStorage))if(key.startsWith('starseed.golden-path.')){
      const ledger=JSON.parse(json);
      for(const [site,rawUnits] of Object.entries(ledger.sites||{})){
        const id=siteId(site);
        c=applyCampaignEvent(c,{id:`found/${id}`,type:'site.discovered',siteId:id,systemId});
        c=applyCampaignEvent(c,{id:`recovery/${id}/${rawUnits}`,type:'site.recoveryRecorded',siteId:id,rawUnits});
      }
    }
    return c;
  }
  save(){
    if(this.loading)return Promise.reject(Error('Wait for the saved flight to finish loading.'));
    if(this.pending)return this.pending;
    const g=this.game();let snapshot;
    try{snapshot=this.snapshot();}catch(error){this.status=`Save failed: ${error.message}`;return Promise.reject(error);}
    this.checkpointQueued=false;const liveRecord=JSON.stringify(g.campaign);
    this.status='Saving…';
    this.pending=this.storage.save(snapshot).then(saved=>{if(this.game()===g)g.campaign=JSON.stringify(g.campaign)===liveRecord?saved:{...g.campaign,revision:saved.revision,savedAt:saved.savedAt};this.status=`Saved ${new Date(saved.savedAt).toLocaleTimeString()}`;return saved;},error=>{this.status=`Save failed: ${error.message}`;throw error;}).finally(()=>{this.pending=null;this.nextAuto=this.checkpointQueued?0:performance.now()+30000;});
    return this.pending;
  }
  exportJSON(){return encodeCampaign(this.snapshot());}
  travel(destinationId){
    if(this.loading)return Promise.reject(Error('Wait for the current journey or restore to finish.'));
    this.loading=(async()=>{
      if(this.pending)await this.pending;
      const game=this.game(),departure=ensureGalaxy(this.snapshot());
      // Check the entire operation before touching storage or the current runtime.
      const arrival=prepareJourney(departure,destinationId);
      this.status='Saving departure…';
      const saved=await this.storage.save(departure);game.campaign=saved;
      arrival.revision=saved.revision;arrival.savedAt=saved.savedAt;
      this.status='Rebuilding destination…';await this.loadGame(arrival,{travel:true});
      this.status='Saving arrival…';
      try {
        const landed=await this.storage.save(arrival);this.game().campaign=landed;
        this.status='Fleet arrived · expedition saved';this.checkpointQueued=false;
      }catch(error){this.status=`Save failed: Fleet arrived, but arrival was not saved. The departure is safe. ${error.message}`;throw error;}
      this.nextAuto=performance.now()+30000;
    })().catch(error=>{if(!this.status.startsWith('Save failed:'))this.status=`Journey stopped: ${error.message}`;throw error;}).finally(()=>{this.loading=null;});
    return this.loading;
  }
  load(id,previous=false){
    if(this.loading)return this.loading;
    this.loading=(async()=>{
      if(this.pending)await this.pending;
      const result=await this.storage.load(id,{previous});if(!result)throw Error('That save slot is unavailable.');
      if(result.campaign.saveKind!=='single-system-flight')throw Error('This slot contains a campaign record without a saved flight.');
      await this.loadGame(result.campaign);this.checkpointQueued=false;this.status=previous?'Previous revision loaded; save to keep this restoration.':'Saved flight restored';this.nextAuto=performance.now()+30000;
    })().finally(()=>{this.loading=null;});
    return this.loading;
  }
  async import(json){const c=importCampaignCopy(json);if(c.saveKind!=='single-system-flight')throw Error('Import a full flight save to resume play.');const saved=await this.storage.save(c);return saved;}
  checkpoint(){this.checkpointQueued=true;this.nextAuto=0;}
  tick(now){const g=this.game();if(g?.campaign&&g.launched&&g.state==='playing'&&(!g.paused||this.checkpointQueued)&&!this.pending&&!this.loading&&now>=this.nextAuto){this.nextAuto=now+30000;this.save().catch(()=>{});}}
}
