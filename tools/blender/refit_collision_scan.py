import bpy, json, math, bmesh
from pathlib import Path
from mathutils import Matrix,Vector
from mathutils.bvhtree import BVHTree
STAGE=Path('/tmp/starseed-complete/established');STAGE.mkdir(exist_ok=True)

def tree(obs,inv=Matrix.Identity(4)):
 bm=bmesh.new()
 for o in obs:
  if o.type!='MESH' or not len(o.data.polygons):continue
  other=bmesh.new();other.from_mesh(o.data)
  decorative={i for i,m in enumerate(o.data.materials) if m and 'leaf' in m.name.lower()}
  if decorative:bmesh.ops.delete(other,geom=[f for f in other.faces if f.material_index in decorative],context='FACES')
  other.transform(inv@o.matrix_world);me=bpy.data.meshes.new('_refit_scan');other.to_mesh(me);other.free();bm.from_mesh(me);bpy.data.meshes.remove(me)
 out=BVHTree.FromBMesh(bm);bm.free();return out

def merge(cells):
 used=set();out=[]
 for i,k in sorted(cells):
  if (i,k) in used:continue
  kk=k
  while (i,kk+1) in cells and (i,kk+1) not in used:kk+=1
  ii=i
  while all((ii+1,z) in cells and (ii+1,z) not in used for z in range(k,kk+1)):ii+=1
  used.update((x,z) for x in range(i,ii+1) for z in range(k,kk+1));out.append((i,k,ii,kk))
 return out

def raster(obs,room,inv=Matrix.Identity(4),cell=.2,checkfloor=False):
 t=tree(obs,inv);lo,hi=room['min'],room['max'];nx=math.ceil((hi[0]-lo[0])/cell);nz=math.ceil((hi[2]-lo[2])/cell);blocked=set()
 for k in range(nz):
  z=lo[2]+(k+.5)*cell;intervals=[]
  for level in [.35,.95,1.65]:
   ray=Vector((lo[0]-2,-z,lo[1]+level));depth=0;start=None
   for _ in range(200):
    loc,n,face,dist=t.ray_cast(ray,Vector((1,0,0)),hi[0]+2-ray.x)
    if loc is None:break
    x=loc.x
    if n.x<-.1:
     if depth==0:start=x
     depth+=1
    elif n.x>.1:
     depth=max(0,depth-1)
     if depth==0 and start is not None:intervals.append((start,x));start=None
    ray=loc+Vector((.002,0,0))
    if ray.x>=hi[0]+2:break
   if start is not None:intervals.append((start,hi[0]))
  for i in range(nx):
   x=lo[0]+(i+.5)*cell
   if any(a-.015<x<b+.015 for a,b in intervals):blocked.add((i,k));continue
   if checkfloor:
    hit=t.ray_cast(Vector((x,-z,lo[1]+.08)),Vector((0,0,-1)),.35)
    if hit[0] is None:blocked.add((i,k))
 return [{'min':[round(lo[0]+i*cell,3),lo[1],round(lo[2]+k*cell,3)],'max':[round(min(hi[0],lo[0]+(ii+1)*cell),3),lo[1]+2.05,round(min(hi[2],lo[2]+(kk+1)*cell),3)],'room':room['id'],'kind':'furnishing'} for i,k,ii,kk in merge(blocked)]

