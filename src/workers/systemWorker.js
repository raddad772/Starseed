import { decodeSystemPack } from '../gen/systemPack.js';
import { generateSystem } from '../gen/system.js';
import { systemCacheKey, systemRecord, validSystemRecord } from '../gen/systemCache.js';
import { openSystemCache, readSystemCache, writeSystemCache } from '../gen/systemDiskCache.js';
self.onmessage=async({data:{recipe}})=>{
  let db;
  try{
    db=await openSystemCache();
    let record=await readSystemCache(db,systemCacheKey(recipe)),source='disk';
    if(!validSystemRecord(recipe,record)){record=await bundled(recipe);source='bundle';}
    if(!validSystemRecord(recipe,record)){record=systemRecord(recipe,generateSystem(recipe));source='generated';}
    if(source!=='disk')await writeSystemCache(db,record);
    self.postMessage({record,source});
  }catch(error){self.postMessage({error:error.message});}finally{db?.close();}
};

async function bundled(recipe){
  try{
    const root=new URL('../../assets/systems/',import.meta.url),response=await fetch(new URL('index.json',root));
    if(!response.ok)return null;
    const index=await response.json(),file=index.version===1&&index.systems[systemCacheKey(recipe)];
    if(!/^[0-9a-f]{16}\.json\.gz$/.test(file))return null;
    const data=await fetch(new URL(file,root));if(!data.ok)return null;
    return decodeSystemPack(await new Response(data.body.pipeThrough(new DecompressionStream('gzip'))).text());
  }catch{return null;}
}
