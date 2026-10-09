import {generateSystem} from '../src/gen/system.js';
import {simNFor,SIM_VERSION} from '../src/gen/worldsim/snapshot.js';
import {refineLevelN} from '../src/gen/localsim.js';
import {newRefine,putTile,toStorable,fromStorable} from '../src/gen/worldsim/refine.js';
import {MT,KEEP,TILE_VERSION} from '../src/gen/tileshape.js';
import {faceUVFromDir,chunkArcSize} from '../src/gen/cubesphere.js';
import {systemDetails,surveyTargets} from '../src/campaign/surveyCatalogue.js';
import {LEN_SCALE} from '../src/core/units.js';
import {measure,pack,unpack} from './cache-audit-codec.js';

const seed='RX-e60889908de3ebbf-6',system=generateSystem(seed),targets=surveyTargets(systemDetails(system)).map(t=>t.bodyId),MIB=2**20;
const solids=system.bodies.filter(b=>b.solid&&b.terrain),K=MT+2*KEEP;
const report={version:1,seed,star:system.star.name,simVersion:SIM_VERSION,tileVersion:TILE_VERSION,lengthScale:LEN_SCALE,started:null,stage:'Ready',bodies:[],manifest:solids.map(b=>({id:b.id,name:b.name,kind:b.kind,N:simNFor(b),refineL:refineLevelN(simNFor(b)),survey:targets.includes(b.id),renderedRadiusM:b.R,radiusM:b.radiusM,refinementArrayBytes:6*4**refineLevelN(simNFor(b))*K*K*5,globalFinestPyramidBytes:6*4**(refineLevelN(simNFor(b))+6)*K*K*7,maxMeshLevel:Math.max(2,Math.ceil(Math.log2(chunkArcSize(0,b.R)/32/.7)))}))};
let stop=false,worker=null,job=0,db=null,reuseCache=false;
const status=document.querySelector('#status'),details=document.querySelector('#report');
function show(message){report.progress=message;status.textContent=message;details.textContent=JSON.stringify(report,null,2);}
function rpc(worker,message,endType,visit=()=>{}){
  return new Promise((resolve,reject)=>{
    worker.onmessage=({data:m})=>{if(m.type==='log'){show(`${message.body}: ${m.msg}`);return;}if(m.type==='error'||m.error)reject(Error(m.message||m.error));else{visit(m);if(!endType||m.type===endType)resolve(m);}};
    worker.onerror=e=>reject(Error(e.message));worker.postMessage({...message,job:++job});
  });
}
function openDB(){return new Promise((resolve,reject)=>{const r=indexedDB.open('starseed-cache-audit',1);r.onupgradeneeded=()=>r.result.createObjectStore('payloads');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}
async function store(key,value){await new Promise((resolve,reject)=>{const tx=db.transaction('payloads','readwrite');tx.objectStore('payloads').put(value,key);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);});}
async function read(key){return new Promise((resolve,reject)=>{const r=db.transaction('payloads').objectStore('payloads').get(key);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}
async function record(label,value){
  const m=await measure(value);await store(`${seed}/${label}`,m.compressed);
  const t=performance.now();const disk=await read(`${seed}/${label}`);await disk.arrayBuffer();
  const {decoded,compressed,...stats}=m;stats.idbReadMs=performance.now()-t;return {stats,decoded};
}
function riverIndex(ref,N,R){const w=new Worker(new URL('../src/workers/riverIndexWorker.js',import.meta.url),{type:'module'});return rpc(w,{ref,N,R},null).then(m=>m.riv).finally(()=>w.terminate());}
async function cached(label){
  const blob=await read(`${seed}/${label}`);
  return blob?unpack(await new Response(blob.stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer()):null;
}
async function auditApproach(b,snap,ref,row,label=`${b.id}/descent`){
  const L=ref.L;
    const place=(snap.places?.places||[]).find(p=>p.at),dir=place?.at||[1,0,0],uv=faceUVFromDir(dir,{}),tiles=[],sets=new Map(),begin=performance.now();
    row.landing={place:place?.name||'Equatorial sample',dir,face:uv.face,levels:[]};
    for(let k=1;k<=3;k++){
      const level=L+2*k,n=1<<level,i=Math.min(n-1,Math.floor((uv.u+1)/2*n)),j=Math.min(n-1,Math.floor((uv.v+1)/2*n)),set=new Map();sets.set(level,set);
      for(let tj=Math.max(0,j-1);tj<=Math.min(n-1,j+1);tj++)for(let ti=Math.max(0,i-1);ti<=Math.min(n-1,i+1);ti++){
        show(`${b.name}: descent level ${k}/3 tile ${tiles.length+1}`);
        const parents=k===1?[]:[{face:uv.face,ti:ti>>2,tj:tj>>2,...sets.get(level-2).get(`${ti>>2},${tj>>2}`)}];
        const m=await rpc(worker,{type:'pyr',seed,body:b.id,L:level,face:uv.face,ti,tj,parents,refKey:`audit/${b.id}`,snap:tiles.length===0?snap:null,refine:tiles.length===0?{L,n:ref.n,K:ref.K,h:ref.h,rw:ref.rw,fl:ref.fl,rcv:ref.rcv,done:ref.done}:null,gpu:true},'ptile');
        const tile={h:m.h,rw:m.rw,fl:m.fl,rcv:m.rcv};set.set(`${ti},${tj}`,tile);tiles.push({L:level,face:uv.face,ti,tj,...tile});
      }
      row.landing.levels.push({level,tiles:set.size,approxCellM:Math.PI/2*b.R/(n*MT)});
    }
    row.phases.descentMs=performance.now()-begin;row.descent=(await record(label,tiles)).stats;row.landing.tiles=tiles.length;
    // Representative real worker-generated mesh sizes from orbit down to the surface.
    const terrain=new Worker(new URL('../src/workers/terrainWorker.js',import.meta.url),{type:'module'});
    try{
      terrain.postMessage({type:'bodies',bodies:[{id:b.id,terrain:{...b.terrain,snapshot:snap,refine:ref}}]});
      for(const tile of tiles)terrain.postMessage({type:'ptile',id:b.id,...tile,tile});
      row.meshes=[];const max=report.manifest.find(p=>p.id===b.id).maxMeshLevel;
      for(const level of [...new Set([0,4,8,max])]){
        const n=1<<level,ix=Math.min(n-1,Math.floor((uv.u+1)/2*n)),iy=Math.min(n-1,Math.floor((uv.v+1)/2*n)),t=performance.now();
        const mesh=await rpc(terrain,{type:'chunk',body:b.id,face:uv.face,level,ix,iy,N:32},'chunk');
        row.meshes.push({level,buildMs:performance.now()-t,rawBytes:pack(mesh).rawBytes,attributes:Object.fromEntries(Object.entries(mesh).filter(([,v])=>ArrayBuffer.isView(v)).map(([k,v])=>[k,v.byteLength]))});
      }
    }finally{terrain.terminate();}
}
async function auditBody(b){
  const t=performance.now(),N=simNFor(b),L=refineLevelN(N),row={id:b.id,name:b.name,N,L,phases:{}};report.current=row;
  show(`Simulating ${b.name} at N=${N}`);
  let snap=reuseCache?await cached(`${b.id}/snapshot`):null;row.reusedSnapshot=!!snap;
  if(!snap){snap=(await rpc(worker,{type:'sim',seed,body:b.id,N,myr:150,steps:40},'snapshot')).snap;}row.phases.simMs=performance.now()-t;
  const ss=await record(`${b.id}/snapshot`,snap);row.snapshot=ss.stats;
  if(!(ss.decoded.h instanceof Float32Array)||ss.decoded.h.length!==snap.h.length||ss.decoded.h[100]!==snap.h[100])throw Error('Snapshot round trip failed');
  const saved=reuseCache?await cached(`${b.id}/refine`):null,ref=saved?fromStorable(saved):newRefine(L),start=performance.now();let count=0;row.reusedRefinement=!!saved;
  if(!saved){
  for(let face=0;face<6;face++)for(let tj=0;tj<ref.n;tj++)for(let ti=0;ti<ref.n;ti++){
    show(`${b.name}: refinement ${++count}/${6*ref.n*ref.n}`);
    await rpc(worker,{type:'refine',seed,body:b.id,face,ti,tj,snap:count===1?snap:null,gpu:true},'refined',m=>{if(m.type==='tile')putTile(ref,m.tile);});
  }
  row.phases.refineMs=performance.now()-start;
  show(`${b.name}: indexing rivers`);const rt=performance.now();ref.riv=await riverIndex({L,n:ref.n,h:ref.h,rw:ref.rw,fl:ref.fl,rcv:ref.rcv},N,b.R);row.phases.riverIndexMs=performance.now()-rt;
  }
  const rs=await record(`${b.id}/refine`,toStorable(ref));row.refinement=rs.stats;
  row.rivers=pack(ref.riv).rawBytes;
  if(targets.includes(b.id))await auditApproach(b,snap,ref,row);
  row.totalMs=performance.now()-t;report.bodies.push(row);delete report.current;
  const tr=document.createElement('tr');for(const value of [b.name,row.snapshot.rawBytes/MIB,row.refinement.rawBytes/MIB,(row.descent?.rawBytes||0)/MIB,(row.snapshot.gzipBytes+row.refinement.gzipBytes+(row.descent?.gzipBytes||0))/MIB]){const td=document.createElement('td');td.textContent=typeof value==='number'?value.toFixed(2):value;tr.append(td);}document.querySelector('#rows').append(tr);
  await store('latest-report',structuredClone(report));
}
document.querySelector('#stop').onclick=()=>{stop=true;document.querySelector('#stop').disabled=true;show('Will stop after the current body; completed measurements are retained.');};
document.querySelector('#run').onclick=async()=>{
  document.querySelector('#run').disabled=true;document.querySelector('#inspect').disabled=true;document.querySelector('#stop').disabled=false;report.started=new Date().toISOString();report.stage='Running';
  try{
    db=await openDB();const previous=await read('latest-report');reuseCache=previous?.seed===seed&&previous?.simVersion===SIM_VERSION&&previous?.tileVersion===TILE_VERSION;if(reuseCache)report.bodies=previous.bodies;const mode=document.querySelector('#mode').value;
    const rank=b=>targets.includes(b.id)?targets.indexOf(b.id):100+b.id;const order=[...solids].sort((a,b)=>rank(a)-rank(b));
    for(const b of order){if(report.bodies.some(r=>r.id===b.id))continue;if(mode==='survey'&&!targets.includes(b.id))continue;worker=new Worker(new URL('../src/workers/worldsimWorker.js',import.meta.url),{type:'module'});try{await auditBody(b);}finally{worker.terminate();worker=null;}if(stop)break;}
    report.stage=stop?'Stopped':'Complete';report.finished=new Date().toISOString();show(`${report.stage}: ${report.bodies.length} bodies measured`);await store('latest-report',structuredClone(report));
  }catch(error){report.stage='Failed';report.error=error.stack||String(error);show(report.error);if(db)await store('latest-report',structuredClone(report));}
  finally{worker?.terminate();db?.close();document.querySelector('#stop').disabled=true;}
};
show('Ready');

// Optional second pass: compares lossless byte shuffling on already generated
// data. No new world simulation and no mutation of the production world cache.
document.querySelector('#inspect').onclick=async()=>{
  document.querySelector('#inspect').disabled=true;document.querySelector('#run').disabled=true;
  try{
    db=await openDB();const previous=await read('latest-report');
    if(!previous?.bodies?.length||previous.seed!==seed||previous.simVersion!==SIM_VERSION||previous.tileVersion!==TILE_VERSION)throw Error('Run a compatible cache measurement first');
    Object.assign(report,previous);report.stage='Inspecting';report.inspection=[];
    for(const row of report.bodies){
      const detail={id:row.id,name:row.name,variants:{}};let sourceSnapshot,sourceRefinement;
      for(const kind of ['snapshot','refine','descent']){
        const value=await cached(`${row.id}/${kind}`);if(!value)continue;
        show(`${row.name}: lossless compression of ${kind}`);if(kind==='snapshot')sourceSnapshot=value;if(kind==='refine')sourceRefinement=value;
        if(kind==='snapshot'){
          detail.snapshotFields=Object.fromEntries(Object.entries(value).filter(([,v])=>ArrayBuffer.isView(v)).map(([k,v])=>[k,v.byteLength]));
          let dry=0,min=Infinity,max=-Infinity;for(const h of value.h){if(h>0)dry++;min=Math.min(min,h);max=Math.max(max,h);}
          detail.surface={aboveDatumFraction:dry/value.h.length,minHeightM:min,maxHeightM:max,places:value.places?.places?.length||0,hasSea:value.sea};
        }
        if(kind==='descent'&&!report.gpuTileSample){
          const tile=value[0],w=new Worker(new URL('../src/workers/worldsimWorker.js',import.meta.url),{type:'module'});
          try{
            const m=await rpc(w,{type:'pyr',seed,body:row.id,L:tile.L,face:tile.face,ti:tile.ti,tj:tile.tj,parents:[],snap:sourceSnapshot,refine:sourceRefinement,refKey:'verify',gpu:true},'ptile');
            for(const name of ['h','rw','fl','rcv']){
              const a=new Uint8Array(tile[name].buffer),b=new Uint8Array(m[name].buffer);
              if(a.length!==b.length||a.some((v,i)=>v!==b[i]))throw Error(`Cached terrain differs after restore: ${name}`);
            }
            report.gpuTileSample={body:row.id,...m.ms,identicalAfterRestore:true};
          }finally{w.terminate();}
        }
        const m=await measure(value,{shuffle:true});
        const expected=new Uint8Array(await pack(value).blob.arrayBuffer()),actual=new Uint8Array(await pack(m.decoded).blob.arrayBuffer());
        if(expected.length!==actual.length||expected.some((v,i)=>v!==actual[i]))throw Error(`Lossless round trip failed: ${row.name} ${kind}`);
        const {decoded,compressed,...stats}=m;detail.variants[kind]={...stats,losslessVerified:true};
      }
      report.inspection.push(detail);await store('latest-report',structuredClone(report));
    }
    report.stage='Complete';show(`Complete: ${report.bodies.length} bodies, compression variants verified`);await store('latest-report',structuredClone(report));
  }catch(error){report.stage='Failed';report.error=error.stack||String(error);show(report.error);}
  finally{db?.close();document.querySelector('#inspect').disabled=false;}
};

document.querySelector('#land').onclick=async()=>{
  for(const id of ['land','inspect','run'])document.querySelector('#'+id).disabled=true;
  try{
    db=await openDB();Object.assign(report,await read('latest-report'));
    const b=solids.find(b=>b.id===5),snap=await cached('5/snapshot'),saved=await cached('5/refine');
    if(!snap?.places?.places?.length||!saved)throw Error('Generate the complete system first');
    const row={id:b.id,name:b.name,phases:{}};report.stage='Land approach';report.current=row;
    worker=new Worker(new URL('../src/workers/worldsimWorker.js',import.meta.url),{type:'module'});
    await auditApproach(b,snap,fromStorable(saved),row,'dry-land/descent');
    const tiles=await cached('dry-land/descent'),m=await measure(tiles,{shuffle:true});
    const expected=new Uint8Array(await pack(tiles).blob.arrayBuffer()),actual=new Uint8Array(await pack(m.decoded).blob.arrayBuffer());
    if(expected.length!==actual.length||expected.some((v,i)=>v!==actual[i]))throw Error('Dry-land cache round trip failed');
    const {decoded,compressed,...stats}=m;row.shuffled={...stats,losslessVerified:true};
    report.extraApproaches=[row];delete report.current;report.stage='Complete';show('Complete: additional dry-land approach measured');await store('latest-report',structuredClone(report));
  }catch(error){report.stage='Failed';report.error=error.stack||String(error);show(report.error);}
  finally{worker?.terminate();worker=null;db?.close();}
};
