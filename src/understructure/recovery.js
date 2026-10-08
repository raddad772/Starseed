// One site percentage point is one raw data unit. Bonus depends on the total,
// never pickup order; a ledger stores each site's highest recovered value.
export const MYSTERY_MILESTONES=[200,500];
export const SITE_CREDIT_CAP=170;
export function mysteryProgress(total){const stage=MYSTERY_MILESTONES.filter(n=>total>=n).length;return {stage,next:MYSTERY_MILESTONES[stage]??null};}
export function creditedData(raw){raw=Math.max(0,Number(raw)||0);return Math.min(SITE_CREDIT_CAP,Math.min(100,raw)+Math.max(0,raw-100)*3);}
export function recoveryLedger(saved={}){
  const sites={};for(const [id,value] of Object.entries(saved?.sites||{}))if(Number.isFinite(value)&&value>=0)sites[id]=value;
  return {version:1,sites};
}
export function ledgerTotal(ledger){return Object.values(ledger.sites).reduce((sum,n)=>sum+creditedData(n),0);}
export function recordRecovery(saved,id,raw){const ledger=recoveryLedger(saved),before=ledgerTotal(ledger);ledger.sites[id]=Math.max(ledger.sites[id]||0,Math.max(0,Number(raw)||0));const total=ledgerTotal(ledger);return {ledger,total,gained:total-before,...mysteryProgress(total),newLead:mysteryProgress(total).stage>mysteryProgress(before).stage};}
export function bankRecovery(storage,key,id,raw){let saved={};try{saved=JSON.parse(storage.getItem(key)||'{}');}catch{}const result=recordRecovery(saved,id,raw);try{storage.setItem(key,JSON.stringify(result.ledger));}catch{}return result;}

export function mysteryEntries(total){return [
 {at:200,title:'Golden Path / lead 01: a shared index',text:'The fragments share an address space. These sites are parts of the same record, despite their separation. A repeated identifier translates as GOLDEN PATH. Further recovery may reconstruct what it points toward.'},
 {at:500,title:'Golden Path / lead 02: beyond the local record',text:'The index contains references to a deeper network. The planetary copies remain usable: more of this record can be reconstructed here, without following every branch of the network.'},
].filter(entry=>total>=entry.at);}
