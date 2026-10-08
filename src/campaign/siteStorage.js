// The site's existing key/value protocol, scoped to one portable expedition.
export class CampaignSiteStorage {
  constructor(entries={}) { this.entries=new Map(Object.entries(entries)); }
  getItem(key){return this.entries.get(key)??null;}
  setItem(key,value){this.entries.set(key,String(value));}
  snapshot(){return Object.fromEntries(this.entries);}
  static adopt(seed,storage){
    // A blocked browser store must not prevent a portable file export.
    if(storage===undefined){try{storage=globalThis.localStorage;}catch{storage=null;}}
    const entries={},encoded=encodeURIComponent(seed),prefixes=[`starseed.survey.v1.${encoded}.`,`starseed.survey.planet.v1.${encoded}.`];
    try{if(storage)for(let i=0;i<storage.length;i++){const key=storage.key(i);if(typeof key==='string'&&prefixes.some(p=>key.startsWith(p))){const value=storage.getItem(key);if(value!==null)entries[key]=value;}}}catch{}
    const key='starseed.golden-path.campaign.v1';
    try{const old=JSON.parse(storage?.getItem(key)||'{}'),sites=Object.fromEntries(Object.entries(old.sites||{}).filter(([id])=>id.startsWith(prefixes[0])));entries[key]=JSON.stringify({version:1,sites});}catch{}
    return new CampaignSiteStorage(entries);
  }
}
export function bindSiteStorage(game,storage){
  game.campaignStorage=storage;game.surfaceSurveys.planetSites.storage=storage;
  for(const p of game.players)if(p.understructure)p.understructure.storage=storage;
}
