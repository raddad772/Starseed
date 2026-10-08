// Best-effort, bounded IndexedDB cache. Unavailable storage never prevents generation.
const DB='starseed-system-cache'+(typeof location!=='undefined'&&new URLSearchParams(location.search).has('surveyTest')?'-test':''), STORE='systems', META='metadata', LIMIT=32*1024*1024;
export function openSystemCache(){return new Promise(resolve=>{
  try{const r=indexedDB.open(DB,1);r.onupgradeneeded=()=>{r.result.createObjectStore(STORE);r.result.createObjectStore(META);};r.onsuccess=()=>resolve(r.result);r.onerror=()=>resolve(null);r.onblocked=()=>resolve(null);}catch{resolve(null);}
});}
export function readSystemCache(db,key){return new Promise(resolve=>{
  if(!db)return resolve(null);
  try{const q=db.transaction(STORE).objectStore(STORE).get(key);q.onsuccess=()=>resolve(q.result||null);q.onerror=()=>resolve(null);}catch{resolve(null);}
});}
export function writeSystemCache(db,record){return new Promise(resolve=>{
  if(!db||record.bytes>8*1024*1024)return resolve();
  try{
    const tx=db.transaction([STORE,META],'readwrite'),s=tx.objectStore(STORE),meta=tx.objectStore(META);
    s.put(record,record.key);meta.put({key:record.key,bytes:record.bytes,at:Date.now()},record.key);
    const q=meta.getAll();q.onsuccess=()=>{
      const entries=q.result.sort((a,b)=>b.at-a.at);let bytes=0;
      entries.forEach((r,i)=>{bytes+=r.bytes;if(i>=8||bytes>LIMIT){s.delete(r.key);meta.delete(r.key);}});
    };
    tx.oncomplete=tx.onerror=tx.onabort=()=>resolve();
  }catch{resolve();}
});}
