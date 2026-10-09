"""Deterministic Horizon fleet assets. Author in game metres: X right, Y up, Z aft.
Run inside Blender; output directory comes from EXPEDITION_OUT (default /tmp/starseed-horizon).
Owns only scenes named 'Horizon - ...'. Existing fleet scenes are preserved.
"""
import bpy, math, json, os, hashlib
from pathlib import Path
from mathutils import Vector, Matrix

OUT=Path(os.environ.get('EXPEDITION_OUT','/tmp/starseed-complete/horizon'));OUT.mkdir(parents=True,exist_ok=True)
G=lambda p:Vector((p[0],-p[2],p[1]))
COLORS={'Hull':(.77,.80,.76), 'Metal':(.12,.15,.16), 'Wall':(.64,.63,.55), 'Floor':(.19,.22,.22), 'Ceiling':(.56,.57,.53), 'Fabric':(.27,.36,.34), 'Wood':(.34,.25,.17), 'Glass':(.075,.15,.19), 'Screen':(.12,.49,.53), 'LightPanel':(.95,.80,.57), 'EngineGlow':(.30,.56,.8), 'Hazard':(.68,.30,.095), 'Rubber':(.04,.045,.05), 'Radiator':(.12,.17,.19), 'Plant':(.16,.34,.15), 'HullSecondary':(.17,.36,.39), 'HullStripe':(.76,.57,.28)}
MATS={}
for name,c in COLORS.items():
 m=bpy.data.materials.get('Horizon_'+name) or bpy.data.materials.new('Horizon_'+name);m.use_nodes=True;m.diffuse_color=(*c,1);p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(*c,1);p.inputs['Metallic'].default_value=.35 if name in ['Hull','Metal'] else .05;p.inputs['Roughness'].default_value=.48 if name=='Hull' else .7
 if name in ['Screen','LightPanel','EngineGlow']:p.inputs['Emission Color'].default_value=(*c,1);p.inputs['Emission Strength'].default_value=.5
 if name=='Glass':p.inputs['Alpha'].default_value=.23;p.inputs['Roughness'].default_value=.14
 m['semantic']='Hull' if name.startswith('Hull') else name;MATS[name]=m

def box_bounds(c,s):return [[c[i]-s[i]/2 for i in range(3)],[c[i]+s[i]/2 for i in range(3)]]
def half(poly,axis,v,positive):
 out=[]
 for a,b in zip(poly,poly[1:]+poly[:1]):
  da=(a[axis]-v)*(1 if positive else -1);db=(b[axis]-v)*(1 if positive else -1);ina=da>=-1e-7;inb=db>=-1e-7
  if ina:out.append(a)
  if ina!=inb:out.append(tuple(a[k]+da/(da-db)*(b[k]-a[k]) for k in range(3)))
 clean=[]
 for p in out:
  if not clean or (Vector(p)-Vector(clean[-1])).length>1e-6:clean.append(p)
 if len(clean)>1 and (Vector(clean[-1])-Vector(clean[0])).length<1e-6:clean.pop()
 return clean if len(clean)>=3 else []
def subtract(poly,lo,hi):
 if any(max(p[i] for p in poly)<lo[i]-1e-6 or min(p[i] for p in poly)>hi[i]+1e-6 for i in range(3)):return [poly]
 rem=poly;out=[]
 for a,v,pos in [(i,lo[i],True) for i in range(3)]+[(i,hi[i],False) for i in range(3)]:
  if not rem:break
  outside=half(rem,a,v,not pos)
  if outside:out.append(outside)
  rem=half(rem,a,v,pos)
 return out

class Mesh:
 def __init__(self,ship,name,room=None,lod=0):self.ship=ship;self.name=name;self.polys=[];self.room=room;self.lod=lod
 def face(self,pts,mat='Hull',paint=0,normal=None):
  pts=[tuple(p) for p in pts]
  if len(pts)<3:return
  n=(Vector(pts[1])-Vector(pts[0])).cross(Vector(pts[2])-Vector(pts[0]))
  if normal is not None and n.dot(Vector(normal))<0:pts.reverse()
  self.polys.append((pts,mat,paint))
 def box(self,c,s,mat='Hull',paint=0,collision=False,solid=False):
  lo,hi=box_bounds(c,s)
  for a in range(3):
   others=[i for i in range(3) if i!=a]
   for side in [-1,1]:
    pts=[]
    for u,v in [(0,0),(1,0),(1,1),(0,1)]:
     p=[0,0,0];p[a]=(lo if side<0 else hi)[a];p[others[0]]=(lo,hi)[u][others[0]];p[others[1]]=(lo,hi)[v][others[1]];pts.append(p)
    self.face(pts,mat,paint,[side if i==a else 0 for i in range(3)])
  b={'min':lo,'max':hi}
  if collision:self.ship.t['colliders'].append(b)
  if solid:self.ship.t['solids'].append(dict(b,room=self.room,kind='furniture'))
 def cyl(self,a,b,r,mat='Hull',paint=0,r1=None,n=12,caps=True,collision=False):
  a,b=Vector(a),Vector(b);axis=(b-a).normalized();u=axis.orthogonal().normalized();v=axis.cross(u);r1=r if r1 is None else r1
  rings=[[tuple(p+(u*math.cos(i*math.tau/n)+v*math.sin(i*math.tau/n))*rr) for i in range(n)] for p,rr in [(a,r),(b,r1)]]
  for i in range(n):self.face([rings[0][i],rings[0][(i+1)%n],rings[1][(i+1)%n],rings[1][i]],mat,paint,u*math.cos((i+.5)*math.tau/n)+v*math.sin((i+.5)*math.tau/n))
  if caps:self.face(rings[0],mat,paint,-axis);self.face(rings[1],mat,paint,axis)
  if collision:
   rr=max(r,r1);mn=[min(a[i],b[i])-rr*(math.sqrt(max(0,1-axis[i]**2))) for i in range(3)];mx=[max(a[i],b[i])+rr*(math.sqrt(max(0,1-axis[i]**2))) for i in range(3)];self.ship.t['colliders'].append({'min':mn,'max':mx})
 def beam(self,a,b,r=.12,mat='Metal'):self.cyl(a,b,r,mat,n=6,collision=True)
 def loft(self,stations,mat='Hull',paint=0,n=20,caps=True):
  # (z, half-width, lower-y, upper-y). Flats face up/down for serviceable decks.
  rings=[]
  for z,w,low,high in stations:rings.append([(w*math.copysign(abs(math.cos((i+.5)*math.tau/n))**.5,math.cos((i+.5)*math.tau/n)),(low+high)/2+(high-low)/2*math.copysign(abs(math.sin((i+.5)*math.tau/n))**.5,math.sin((i+.5)*math.tau/n)),z) for i in range(n)])
  if caps:self.face(rings[0],mat,paint,(0,0,-1));self.face(rings[-1],mat,paint,(0,0,1))
  for a,b in zip(rings,rings[1:]):
   for i in range(n):
    j=(i+1)%n;pts=[a[i],a[j],b[j],b[i]];self.face(pts,mat,paint,(math.cos((i+1)*math.tau/n),math.sin((i+1)*math.tau/n),0))
 def cut(self,lo,hi):self.polys=[(q,m,p) for poly,m,p in self.polys for q in subtract(poly,lo,hi)]
 def finish(self,parent=None,pivot=None,**props):
  vs=[];fs=[];mi=[];cols=[];names=list(MATS)
  for poly,mat,paint in self.polys:
   area=sum((Vector(poly[j])-Vector(poly[0])).cross(Vector(poly[j+1])-Vector(poly[0])).length/2 for j in range(1,len(poly)-1))
   if area<1e-9:continue
   fs.append(list(range(len(vs),len(vs)+len(poly))));vs.extend(G(Vector(p)-Vector(pivot or (0,0,0))) for p in poly);mi.append(names.index('HullSecondary' if mat=='Hull' and paint==1 else 'HullStripe' if mat=='Hull' and paint==2 else mat));mask=(0,1,0,.10) if paint==1 else (0,0,1,.08) if paint==2 else (1,0,0,.10)
   cols.extend([mask if mat=='Hull' else (0,0,0,0)]*len(poly))
  me=bpy.data.meshes.new(self.name);me.from_pydata(vs,[],fs);me.update()
  for n in names:me.materials.append(MATS[n])
  for p,i in zip(me.polygons,mi):p.material_index=i
  paint=me.color_attributes.new(name='paint',type='FLOAT_COLOR',domain='CORNER');paint.data.foreach_set('color',[x for c in cols for x in c]);me.color_attributes.active_color=paint
  uv=me.uv_layers.new(name='UVMap')
  for p in me.polygons:
   ax=max(range(3),key=lambda k:abs(p.normal[k]));xy=[k for k in range(3) if k!=ax]
   for li in p.loop_indices:v=me.vertices[me.loops[li].vertex_index].co;uv.data[li].uv=(v[xy[0]]/2,v[xy[1]]/2)
  ob=bpy.data.objects.new(self.name,me);self.ship.col.objects.link(ob);ob.parent=parent or self.ship.root
  if pivot:ob.location=G(pivot)
  ob['asset_id']=self.ship.key;ob['lod']=self.lod
  if self.room:ob['room_id']=self.room;ob['interior']=True
  for k,v in props.items():ob[k]=v
  return ob

"""Remove coincident rectangular wall surfaces without moving room boundaries."""

def _wall_rectangle(poly, material):
    if material != 'Wall':
        return None
    spans=[max(p[i] for p in poly)-min(p[i] for p in poly) for i in range(3)]
    flat=[i for i in range(3) if spans[i]<1e-5]
    if len(flat)!=1:
        return None
    axis=flat[0];u,v=[i for i in range(3) if i!=axis]
    area=sum(a[u]*b[v]-b[u]*a[v] for a,b in zip(poly,poly[1:]+poly[:1]))/2
    rect=(min(p[u] for p in poly),max(p[u] for p in poly),min(p[v] for p in poly),max(p[v] for p in poly))
    size=(rect[1]-rect[0])*(rect[3]-rect[2])
    if size<1e-9 or abs(abs(area)-size)>max(1e-6,size*1e-6):
        return None
    return axis,poly[0][axis],1 if area>0 else -1,rect

def _wall_subtract_rect(rect, cutter):
    x0,x1,y0,y1=rect;a0,a1,b0,b1=cutter
    a0=max(x0,a0);a1=min(x1,a1);b0=max(y0,b0);b1=min(y1,b1)
    if a1-a0<1e-6 or b1-b0<1e-6:
        return [rect]
    return [r for r in [(x0,a0,y0,y1),(a1,x1,y0,y1),(a0,a1,y0,b0),(a0,a1,b1,y1)]
            if r[1]-r[0]>1e-6 and r[3]-r[2]>1e-6]

def clean_shared_room_walls(meshes):
    """Meshes expose (convex polygon, material, metadata) tuples in .polys.

    Retain one owner for same-facing overlap; remove both opposite-facing
    contact surfaces. Subtraction preserves door holes and wall thickness.
    Nonrectangular faces and non-wall materials pass through unchanged.
    """
    groups={};records={};serial=0
    for mi,mesh in enumerate(meshes):
        for pi,(poly,material,metadata) in enumerate(mesh.polys):
            rec=_wall_rectangle(poly,material)
            if rec is None:continue
            axis,plane,sign,rect=rec
            key=(axis,round(plane,5));entry=(serial,sign,rect)
            groups.setdefault(key,[]).append(entry)
            records[(mi,pi)]=(key,entry,plane);serial+=1
    before=after=0.0;faces_after=0
    for mi,mesh in enumerate(meshes):
        result=[]
        for pi,(poly,material,metadata) in enumerate(mesh.polys):
            rec=records.get((mi,pi))
            if rec is None:
                result.append((poly,material,metadata));continue
            key,(index,sign,rect),plane=rec;axis=key[0]
            before+=(rect[1]-rect[0])*(rect[3]-rect[2]);pieces=[rect]
            for other,other_sign,cutter in groups[key]:
                if other==index or (other_sign==sign and other>index):continue
                pieces=[q for piece in pieces for q in _wall_subtract_rect(piece,cutter)]
                if not pieces:break
            u,v=[i for i in range(3) if i!=axis]
            for x0,x1,y0,y1 in pieces:
                points=[]
                for x,y in [(x0,y0),(x1,y0),(x1,y1),(x0,y1)]:
                    point=[0.0,0.0,0.0];point[axis]=plane;point[u]=x;point[v]=y;points.append(tuple(point))
                if sign<0:points.reverse()
                result.append((points,material,metadata));after+=(x1-x0)*(y1-y0);faces_after+=1
        mesh.polys=result
    return {'wall_faces_before':serial,'wall_faces_after':faces_after,'overlap_surface_area_removed':before-after}

class Ship:
 def __init__(self,key,name,mass,crew,length,big=False):
  self.key='horizon_'+key;self.name=name
  sn='Horizon - '+name;old=bpy.data.scenes.get(sn)
  if old:
   for o in list(old.objects):
    if o.get('asset_id')==self.key:bpy.data.objects.remove(o,do_unlink=True)
   bpy.data.scenes.remove(old)
  self.scene=bpy.data.scenes.new(sn);bpy.context.window.scene=self.scene;self.scene.unit_settings.system='METRIC';self.col=bpy.data.collections.new(sn+' / model');self.scene.collection.children.link(self.col);self.root=bpy.data.objects.new(self.key,None);self.col.objects.link(self.root);self.root['asset_id']=self.key;self.root['era']='Horizon';self.root['crew_capacity']=crew;self.root['artificial_gravity']=False
  self.t={'key':self.key,'className':name+' — Horizon '+{'meridian':'carrier','confluence':'exploration tender','neptune3':'family explorer','cradle':'cargo lifter','shorebird':'landing shuttle','lark':'survey scout','drift':'hover scout'}[key],'era':'Horizon','fleetAsset':True,'model':'assets/models/horizon/'+key+'.glb','template':self.key,'big':big,'seatOnly':not big,'ftl':False,'interiorGravity':'natural','crewCapacity':crew,'mass':mass,'I':[mass*length*length/12,mass*length*length/12,mass*length*length/48],'thrust':{'main':.08 if big else .35,'retro':.03 if big else .15,'belly':.02 if big else 1.5,'down':.01 if big else .12,'lateral':.015 if big else .15},'alpha':[.025,.025,.04] if big else [.4,.4,.6],'rate':[.06,.06,.09] if big else [.3,.3,.5],'hullRating':50,'aero':{'cd':[length*2,length*4,length],'wing':0},'livery':{'main':'#c6cdca','second':'#315e62','stripe':'#c3954d'},'colliders':[],'solids':[],'rooms':[],'seats':[],'lights':[],'slideDoors':[],'doors':[],'parts':[],'zones':[],'airlocks':[],'engines':[],'entries':[],'probes':[],'hatches':[],'ports':[]}
  self.rs={};self.builders=[];self.hab=[];self.cuts=[];self.open=[];self.serial=0
 def mesh(self,name,room=None,lod=0):
  b=Mesh(self,self.key+':'+name,room,lod);self.builders.append(b);return b
 def room(self,id,name,lo,hi,kind='cabin',**extra):
  r={'id':id,'name':name,'min':list(lo),'max':list(hi),'type':kind,**extra};self.t['rooms'].append(r);self.rs[id]={'r':r,'holes':{}};return r
 def hole(self,id,side,u,w,h=2.2):self.rs[id]['holes'].setdefault(side,[]).append((u-w/2,u+w/2,h))
 def door(self,id,a,b,axis,plane,u,width=1.2,height=2.2,airlock=None):
  f=self.rs[a]['r']['min'][1];ax=0 if axis=='x' else 2;ua=2 if ax==0 else 0;sa='+'+axis if self.rs[a]['r']['min'][ax]<plane else '-'+axis
  self.hole(a,sa,u,width,height)
  if b:self.hole(b,('-' if sa[0]=='+' else '+')+axis,u,width,height)
  lo=[0,f,0];hi=[0,f+height,0];lo[ax]=plane-.5;hi[ax]=plane+.5;lo[ua]=u-width/2;hi[ua]=u+width/2
  cutlo=lo.copy();cuthi=hi.copy();cutlo[ax]=plane-.6;cuthi[ax]=plane+.6;self.cuts.append((cutlo,cuthi))
  if b:self.t['rooms'].append({'id':id,'name':'Pressure doorway' if airlock else 'Passage','type':'door','min':lo,'max':hi})
  d={'id':id,'axis':axis,'plane':plane,'u0':u-width/2,'u1':u+width/2,'y0':f,'y1':f+height,'rooms':[a,b or a]}
  if airlock:d['airlock']=airlock
  self.t['slideDoors'].append(d);slab_lo=lo.copy();slab_hi=hi.copy();slab_lo[ax]=plane-.065;slab_hi[ax]=plane+.065;self.t['solids'].append({'min':slab_lo,'max':slab_hi,'door':id,'kind':'door'})
  for side in [-1,1]:
   c=[0,f+height/2,0];sz=[0,height,0];c[ax]=plane-.14;c[ua]=u+side*width/4;sz[ax]=.09;sz[ua]=width/2-.015
   m=self.mesh('door_'+id+'_'+str(side),room=a);m.box(c,sz,'Hull',1);m.box([c[0],f+1.3,c[2]],[.12,.06,max(.07,sz[2]*.6)] if axis=='x' else [sz[0]*.6,.06,.12],'Screen');slide=[0,0,0];slide[ua]=side*(width/2+.04);self.t['parts'].append({'node':m.name,'door':id,'slide':slide});m.finish()
 def airlock(self,host,lo,hi,innerAxis,innerPlane,outerPlane,u,id='eva',door=(1.1,2.15)):
  r=self.room(id,'EVA airlock',lo,hi,'airlock',airlock=id);ax=0 if innerAxis=='x' else 2;sign=1 if outerPlane>innerPlane else -1
  self.door(id+'-inner',host,id,innerAxis,innerPlane,u,door[0],door[1],id);self.door(id+'-outer',id,None,innerAxis,outerPlane,u,door[0],door[1],id)
  r['open']=[('+' if sign>0 else '-')+innerAxis];r['gate']={r['open'][0]:id+'-outer'}
  inside=[(lo[i]+hi[i])/2 for i in range(3)];inside[1]=lo[1];outside=inside.copy();outside[ax]=outerPlane+sign*.85
  # (its panels beside the doorway, clear of a wide door's opening)
  panels=[];po=max(.70,door[0]/2+.15)
  for role,plane,off in [('inner',innerPlane,-sign*.45),('outer',outerPlane,sign*.45)]:
   p=inside.copy();p[ax]=plane+off;p[1]+=1.2;p[2 if ax==0 else 0]=u+po;panels.append({'side':role,'pos':p})
  mid=inside.copy();mid[1]+=1.2;mid[2 if ax==0 else 0]=u+po
  panels.extend([{'side':'inner','pos':mid},{'side':'outer','pos':[mid[0],mid[1]+.32,mid[2]]}])
  self.t['airlocks'].append({'id':id,'inner':id+'-inner','outer':id+'-outer','room':id,'cycleSeconds':5,'panels':panels})
  self.t['entries'].append({'label':'EVA airlock','outside':outside,'inside':inside,'heading':[-sign,0,0] if ax==0 else [0,0,-sign],'airlock':id})
  m=self.mesh('lock_fittings_'+id,room=id);cx=(lo[0]+hi[0])/2;cz=(lo[2]+hi[2])/2
  for p in panels:m.box(p['pos'],[.15,.20,.12],'Screen')
  # shallow equipment lockers kept against the long side, clear of the door-to-door line (and of
  # the panels: across the room from them where they'd meet, or none where neither side has room)
  ua=2 if ax==0 else 0;inset=.22 if ax==0 else .23
  at=hi[ua]-inset if hi[ua]-inset-.175>u+po+.06 else lo[ua]+inset if lo[ua]+inset+.175<u-door[0]/2-.02 else None
  if at is not None and ax==0:m.box((cx,lo[1]+1.02,at),(.62,2.04,.35),'Hull',1,solid=True)
  elif at is not None:m.box((at,lo[1]+1.02,cz),(.35,2.04,.62),'Hull',1,solid=True)
  m.finish()
  mn=lo.copy();mx=hi.copy();mn[ax]=min(innerPlane,outerPlane)-.3;mx[ax]=max(innerPlane,outerPlane)+.3;mn[1]-=.02;mx[1]=lo[1]+2.2;self.cuts.append((mn,mx))
 def seat(self,room,x,f,z,pilot=False):
  m=self.mesh('seat_'+str(len(self.t['seats'])),room=room);m.box((x,f+.20,z),(.54,.4,.60),'Metal',solid=True);m.box((x,f+.49,z),(.65,.18,.67),'Fabric');m.box((x,f+.94,z+.31),(.66,.97,.14),'Fabric')
  for dx in [-.38,.38]:m.box((x+dx,f+.72,z),(.10,.11,.62),'Hull',1)
  # obvious lap and shoulder restraints, needed during burns
  m.box((x,f+.60,z),(.60,.035,.07),'Hazard');m.box((x-.15,f+1.02,z+.21),(.06,.68,.035),'Hazard');m.box((x+.15,f+1.02,z+.21),(.06,.68,.035),'Hazard');m.finish()
  self.t['seats'].append({'pilot':pilot,'pos':[x,f,z],'eye':[x,f+1.34,z-.15],'stand':[x,f,z+1.05],'heading':[0,0,-1],'label':'Pilot burn couch' if pilot else 'Restrained crew seat','room':room})
 def furniture(self,id,kind,count=0):
  r=self.rs[id]['r'];lo,hi=r['min'],r['max'];x0,y,z0=lo;x1,_,z1=hi;cx=(x0+x1)/2;cz=(z0+z1)/2;m=self.mesh('furnishings_'+id,room=id)
  if kind=='berths':
   for i in range(count):
    side=-1 if (i//3)%2==0 else 1;x=x0+.55 if side<0 else x1-.55;zz=z0+1.25+(i//6)*2.3;yy=y+.5+(i%3)*.65;m.box((x,yy,zz),(.85,.18,2.04),'Fabric',solid=True);m.box((x,yy+.1,zz+.77),(.62,.1,.35),'Wall');m.box((x,yy+.11,zz),(.91,.04,.09),'Hazard')
   m.box((cx,y+1.05,z1-.35),(max(.6,x1-x0-2.3),2.1,.48),'Hull',1,solid=True)
  elif kind=='galley':
   m.box((cx,y+.47,z0+.4),(max(1.2,x1-x0-1),.94,.65),'Hull',1,solid=True);m.box((cx,y+.97,z0+.42),(max(1.2,x1-x0-1),.07,.7),'Metal');m.box((x0+.43,y+1.15,z1-.8),(.55,2.3,1.2),'Hull',1,solid=True)
   m.box((cx,y+.78,cz),(max(.9,(x1-x0)*.40),.09,1.6),'Wood',solid=True)
   for z in [cz-.5,cz+.5]:m.box((cx-.85,y+.48,z),(.43,.5,.45),'Fabric',solid=True)
  elif kind=='hygiene':
   m.box((x0+.65,y+.32,z0+.6),(.54,.64,.68),'Wall',solid=True);m.box((x0+.65,y+.70,z0+.37),(.55,.7,.23),'Wall');m.box((x1-.4,y+.83,z0+.7),(.58,.12,.72),'Wall',solid=True);m.box((x1-.62,y+.05,z1-.65),(1.05,.10,1.05),'Metal');m.box((cx,y+1.2,z1-.18),(.85,2.4,.25),'Hull',1,solid=True)
  elif kind in ['lab','medical','engineering']:
   if '-z' in self.rs[id]['holes']:m.box((x1-.55,y+.85,cz),(.8,.13,max(1.1,z1-z0-1.2)),'Wall',solid=True)
   else:m.box((cx,y+.85,z0+.55),(max(1.1,x1-x0-1.2),.13,.8),'Wall',solid=True)
   for z in [z0+.7,z1-.7]:m.box((x1-.48 if x0>0 else x0+.48,y+1.05,z),(.65,2.1,.8),'Hull',1,solid=True)
   if kind=='medical':m.box((cx,y+.62,cz),(.80,.22,2.0),'Fabric',solid=True)
   else:m.box((x1-.40,y+1.40,cz),(.13,.7,1.2),'Screen')
  elif kind=='bridge':
   for side in [-1,1]:m.box((cx+side*(x1-x0)*.3,y+.73,z0+.6),((x1-x0)*.23,.12,.5),'Metal',solid=True);m.box((cx+side*(x1-x0)*.3,y+.81,z0+.6),((x1-x0)*.19,.03,.36),'Screen')
  m.finish()
 def habitat(self,stations):
  m=self.mesh('pressure_hull_'+str(len(self.hab)));m.loft(stations);self.hab.append(m)
  # Narrow raised seam bands make the pressure vessel read as assembled sections.
  d=self.mesh('habitat_seams_'+str(len(self.hab)),lod=1)
  for z,w,low,high in stations[1:-1]:d.loft([(z-.09,w+.035,low-.035,high+.035),(z+.09,w+.035,low-.035,high+.035)],'Hull',1,caps=False)
  d.finish();return m
 def front_window(self,z,x0,x1,f,h=1.15,room=None):
  if room:self.rs[room].setdefault('windows',[]).append(([x0,f,z-.5],[x1,f+h,z+.5]))
  self.cuts.append(([x0,f,z-.5],[x1,f+h,z+.5]));m=self.mesh('window_'+str(self.serial));self.serial+=1;m.box(((x0+x1)/2,f+h/2,z-.02),(x1-x0,.0+ h,.035),'Glass');m.finish()
 def room_geometry(self):
  room_meshes=[]
  for id,item in self.rs.items():
   r=item['r'];lo,hi=r['min'],r['max'];m=self.mesh('room_'+id,room=id)
   m.box(((lo[0]+hi[0])/2,lo[1]-.075,(lo[2]+hi[2])/2),(hi[0]-lo[0],.15,hi[2]-lo[2]),'Floor',collision=True)
   roof=self.mesh('ceiling_'+id,room=id);roof.box(((lo[0]+hi[0])/2,hi[1]+.04,(lo[2]+hi[2])/2),(hi[0]-lo[0],.08,hi[2]-lo[2]),'Ceiling',collision=True);roof.finish(ceiling=True)
   for axis in [0,2]:
    ua=2 if axis==0 else 0
    for sg in [-1,1]:
     side=('-' if sg<0 else '+')+('x' if axis==0 else 'z');plane=(lo if sg<0 else hi)[axis]
     if side in r.get('shellOpen',[]):continue
     holes=item['holes'].get(side,[]);us=sorted(set([lo[ua],hi[ua]]+[v for a,b,h in holes for v in [max(lo[ua],a),min(hi[ua],b)]]))
     for a,b in zip(us,us[1:]):
      if b-a<1e-5:continue
      floor=max([lo[1]+h for aa,bb,h in holes if aa-1e-5<(a+b)/2<bb+1e-5] or [lo[1]])
      if floor>=hi[1]-.01:continue
      c=[0,(floor+hi[1])/2,0];sz=[0,hi[1]-floor,0];c[axis]=plane;c[ua]=(a+b)/2;sz[axis]=.10;sz[ua]=b-a;m.box(c,sz,'Wall',collision=True,solid=True)
   # Repeated rails and floor loops support freefall movement and restrained work.
   hand=self.mesh('handholds_'+id,room=id,lod=1)
   for zz in [lo[2]+.65+i*1.0 for i in range(max(1,int(hi[2]-lo[2]-1)))]:
    for xx,side in [(lo[0]+.13,'-x'),(hi[0]-.13,'+x')]:
     if not any(a-.2<zz<b+.2 for a,b,h in item['holes'].get(side,[])):hand.box((xx,lo[1]+1.25,zz),(.065,.065,.38),'Hazard')
   hand.finish()
   for mn,mx in item.get('windows',[]):
    m.cut(mn,mx)
   room_meshes.append(m)
   count=max(1,math.ceil((hi[2]-lo[2])/7))
   for i in range(count):
    self.t['lights'].append({'room':id,'pos':[(lo[0]+hi[0])/2,hi[1]-.20,lo[2]+(i+.5)*(hi[2]-lo[2])/count],'color':0xffe0b8,'intensity':18,'range':max(8,min(18,hi[2]-lo[2]+2))})
   lp=self.mesh('light_'+id,room=id);lp.box(((lo[0]+hi[0])/2,hi[1]-.025,(lo[2]+hi[2])/2),(.28,.04,min(2,hi[2]-lo[2]-.2)),'LightPanel');lp.finish()
  clean_shared_room_walls(room_meshes)
  for m in room_meshes:m.finish()
  for m in self.hab:
   for lo,hi in self.cuts:m.cut(lo,hi)
   m.finish()
 def legs(self,points,length,mounts=True):
  self.t.update(legs=True,legLength=length,legAttach=[list(p) for p in points]);self.t['legK']=self.t['mass']*9.81/(4*.12);self.t['legC']=2*.8*math.sqrt(self.t['legK']*self.t['mass']/4)
  if mounts:
   support=self.mesh('gear_mounts')
   for p in points:support.beam((p[0]*.65,p[1]+1,p[2]*.85),p,.13)
   support.finish()
  for i,p in enumerate(points):
   m=self.mesh('gear_'+str(i));m.cyl((p[0],p[1]+.10,p[2]),(p[0],p[1]-length+.06,p[2]),.09,'Metal',n=8);m.box((p[0],p[1]-length,p[2]),(.6,.18,.85),'Hull',1);m.finish(pivot=p);self.t['parts'].append({'node':m.name,'channel':'gear','slide':[0,-length*.8,0],'closedOffset':[0,length*.8,0]})
 def engine(self,a,b,r,vertical=False):
  m=self.mesh('engine_'+str(len(self.t['engines'])));m.cyl(a,b,r*.37,'Metal',r1=r,n=20,caps=False,collision=True);axis=(Vector(b)-Vector(a)).normalized();p=Vector(a)+axis*.08;m.cyl(p-axis*.04,p,r*.34,'EngineGlow',n=16);m.finish();self.t['engines'].append([*b,r]);self.t.setdefault('engineAxes',[]).append(list(axis))
 def radiator(self,side,z0,z1,x0,x1,y):
  m=self.mesh('radiator_'+str(self.serial));self.serial+=1;a,b=sorted([side*x0,side*x1]);m.box(((a+b)/2,y,(z0+z1)/2),(b-a,.10,z1-z0),'Radiator',collision=True)
  d=self.mesh('radiator_cells_'+str(self.serial),lod=1)
  for x in [a+i*(b-a)/6 for i in range(7)]:d.box((x,y+.08,(z0+z1)/2),(.045,.08,z1-z0),'Metal')
  for z in [z0+i*(z1-z0)/8 for i in range(9)]:d.box(((a+b)/2,y+.08,z),(b-a,.08,.045),'Metal')
  d.finish();m.finish()
 def export(self):
  bpy.context.window.scene=self.scene
  self.room_geometry();bpy.context.view_layer.update();obs=[o for o in self.scene.objects if o.type=='MESH'];pts=[o.matrix_world@v.co for o in obs for v in o.data.vertices];game=[(p.x,p.z,-p.y) for p in pts];lo=[min(p[i] for p in game) for i in range(3)];hi=[max(p[i] for p in game) for i in range(3)];self.t['bounds']=[lo,hi];self.t['size']=[hi[i]-lo[i] for i in range(3)];self.t['radius']=max(Vector(p).length for p in game)
  candidates=set()
  for bx in self.t['colliders']:
   for x in [bx['min'][0],bx['max'][0]]:
    for y in [bx['min'][1],bx['max'][1]]:
     for z in [bx['min'][2],bx['max'][2]]:candidates.add(tuple(round(v,3) for v in (x,y,z)))
  self.t['probes']=[list(p) for p in sorted(candidates)[::max(1,len(candidates)//100)]]
  self.t['probeK']=self.t['mass']*9.81/.12;self.t['probeC']=2*.7*math.sqrt(self.t['probeK']*self.t['mass']/4)
  self.t.setdefault('help','Horizon: no artificial gravity or FTL · F seats/airlocks · R cycles back inside · Space/C translate in freefall · X brakes')
  # Controls are also exposed as Blender preview sliders, with export-rest poses left untouched.
  for part in self.t['parts']:
   ob=bpy.data.objects[part['node']];control='door_'+part['door'] if 'door' in part else part.get('channel','motion');self.root[control]=0.0;self.root.id_properties_ui(control).update(min=0,max=1)
   if 'slide' in part:
    slide=G(part['slide']);off=G(part.get('closedOffset',[0,0,0]));base=ob.location.copy()
    for ax in range(3):
     if not slide[ax] and not off[ax]:continue
     f=ob.driver_add('location',ax);f.driver.expression=f'{base[ax]+off[ax]:.6f}+v*{slide[ax]:.6f}';v=f.driver.variables.new();v.name='v';v.type='SINGLE_PROP';v.targets[0].id=self.root;v.targets[0].data_path='["'+control+'"]'
   elif 'axis' in part and (part.get('door') or part.get('channel')=='podTilt'):
    ob.rotation_mode='AXIS_ANGLE';axis=G(part['axis']);ob.rotation_axis_angle=(0,*axis)
    f=ob.driver_add('rotation_axis_angle',0);f.driver.expression='v*'+str(part.get('angle',math.pi/2));var=f.driver.variables.new();var.name='v';var.type='SINGLE_PROP';var.targets[0].id=self.root;var.targets[0].data_path='["'+control+'"]'
  self.root['gear']=1.0
  # Refresh dependency bindings after assigning every custom-property target.
  for ob in self.scene.objects:
   if ob.animation_data:
    for curve in ob.animation_data.drivers:
     expression=curve.driver.expression;curve.driver.expression=expression+'+0';curve.driver.expression=expression
  self.root.update_tag()
  self.scene.frame_set(1);bpy.context.view_layer.update();self.root['game_manifest']=json.dumps({k:v for k,v in self.t.items() if k not in ('hullColliders','hullOpen','skins','hullStep','lockPassages')})
  bpy.ops.object.select_all(action='DESELECT')
  for o in self.scene.objects:o.select_set(True)
  path=OUT/(self.key.removeprefix('horizon_')+'.glb');kw=dict(filepath=str(path),export_format='GLB',use_selection=True,use_active_scene=True,export_yup=True,export_extras=True,export_animations=False,export_apply=True)
  props=bpy.ops.export_scene.gltf.get_rna_type().properties
  if 'export_vertex_color' in props:kw['export_vertex_color']='ACTIVE'
  if 'export_all_vertex_colors' in props:kw['export_all_vertex_colors']=False
  bpy.ops.export_scene.gltf(**kw)
  (OUT/(self.key+'.json')).write_text(json.dumps(self.t,indent=2));return self.t

"""Reusable interior finishing pass. Uses the fleet builder's Mesh, G and MATS.
Adds fixture geometry and readable wayfinding while preserving structural rooms.
"""

def finish_label(s, text, pos, right=(1,0,0), up=(0,1,0), size=.12, width=2.0, room=None):
    curve=bpy.data.curves.new(s.key+':label','FONT');curve.body=text;curve.size=size;curve.align_x='CENTER';curve.align_y='CENTER';curve.space_character=1.08;curve.extrude=.0007;curve.resolution_u=2
    curve.materials.append(MATS['LightPanel']);o=bpy.data.objects.new(s.key+':finish_label_'+str(s.finish_serial),curve);s.finish_serial+=1;s.col.objects.link(o);o.parent=s.root;o.location=G(pos)
    a,b=G(right).normalized(),G(up).normalized();o.rotation_euler=Matrix((a,b,a.cross(b))).transposed().to_euler();o['asset_id']=s.key;o['interior']=True;o['lod']=1;o['finish_pass']='interiors-v1'
    if room:o['room_id']=room
    bpy.context.view_layer.update()
    if o.dimensions.length and curve.body:curve.size*=min(1,width/(len(text)*size*.65))
    bpy.ops.object.select_all(action='DESELECT');o.select_set(True);bpy.context.view_layer.objects.active=o;bpy.ops.object.convert(target='MESH')
    return o

def finish_screen(m,c,w=.56,h=.34):
    # Screen faces aft (+Z): real raised frame, inset face and a sparse instrument display.
    x,y,z=c;m.box((x,y,z),(w+.055,h+.055,.035),'Metal');m.box((x,y,z+.02),(w,h,.012),'Screen')
    for j,frac in enumerate([.66,.88,.47]):
        m.box((x-w*(1-frac)/2+.015,y+h*.25-j*h*.24,z+.028),(w*frac-.03,.014,.006),'LightPanel')
    m.box((x+w*.33,y-h*.36,z+.03),(w*.18,.018,.006),'Hazard')

def finish_dress(s):
    bpy.context.window.scene=s.scene
    if s.t.get('interiorFinish')=='furnished-v1':return
    s.finish_serial=0;new_objects=set(s.scene.objects);s.t['fixtures']=[]
    for r in s.t['rooms']:
        if r.get('type') in ['door','exterior'] or r.get('capture'):continue
        id=r['id'];lo,hi=r['min'],r['max'];cx=(lo[0]+hi[0])/2;cz=(lo[2]+hi[2])/2;w=hi[0]-lo[0];d=hi[2]-lo[2];floor=lo[1];ceiling=hi[1];h=ceiling-floor
        m=s.mesh('finish_'+id,room=id,lod=1)
        # Recessed perimeter strips and high ventilation grilles leave all doors/aisles clear.
        for x in [lo[0]+.07,hi[0]-.07]:
            m.box((x,ceiling-.12,cz),(.025,.045,max(.1,d-.25)),'Metal')
            if d<25:m.box((x,ceiling-.085,cz),(.022,.025,max(.1,d-.5)),'LightPanel')
        for z in [lo[2]+.075,hi[2]-.075]:
            m.box((cx,ceiling-.15,z),(max(.15,w-.25),.038,.018),'Metal')
        # Ceiling-mounted air return and access plate, small even in a long corridor.
        m.box((cx,ceiling-.04,cz),(min(.60,w*.35),.05,min(1.0,d*.35)),'Metal')
        for j in range(5):m.box((cx-.2+j*.1,ceiling-.07,cz),(.018,.012,min(.75,d*.28)),'Wall')
        for side,x in [(-1,lo[0]+.075),(1,hi[0]-.075)]:
            for z in [lo[2]+.25,hi[2]-.25]:
                if d>1 and w>1:m.box((x,ceiling-.36,z),(.032,.11,.055),'Hazard')
        name=r.get('name',id);kind=r.get('type','')
        if id=='bridge':
            # Small instrument surfaces on the existing forward consoles; keep sight lines open.
            for seat in [x for x in s.t['seats'] if x.get('room')==id]:
                x=seat['pos'][0];z=lo[2]+.54
                finish_screen(m,(x,floor+.88,z),min(.50,w*.20),.18)
                for dx in [-.15,0,.15]:m.cyl((x+dx,floor+.795,z+.19),(x+dx,floor+.813,z+.19),.025,'Metal',n=8)
            m.box((cx,ceiling-.28,lo[2]+.16),(min(1.4,w-.4),.14,.12),'Metal')
            finish_label(s,s.name.upper(),(cx,ceiling-.27,lo[2]+.23),size=.105,width=min(1.2,w-.5),room=id)
            s.t['fixtures'].append({'id':id+'-nav','room':id,'kind':'navigation','label':'Navigation and survey console'})
        if kind=='corridor':
            # Distance/route markings are flush; early ships retain handrail circulation.
            count=max(1,int(d/16))
            for i in range(count):
                z=lo[2]+(i+.5)*d/count
                m.box((cx,floor+.007,z),(min(.46,w*.3),.009,.025),'Hazard')
                for side in [-1,1]:
                    m.box((cx+side*min(.16,w*.10),floor+.008,z+.12),(.018,.01,.12),'Hazard')
            if d>8:finish_label(s,'FLIGHT  /  EVA  /  ENGINEERING',(cx,ceiling-.32,hi[2]-.07),right=(-1,0,0),size=.095,width=max(.8,min(w-.2,2.4)),room=id)
        if kind=='airlock' or 'lock' in id or id=='eva':
            # A shallow supply panel at the rear corner: tether reels, patch packs, restraints.
            x=hi[0]-.21;z=hi[2]-.18
            m.box((x,floor+1.35,z),(.20,.85,.075),'Metal')
            for y in [.98,1.27,1.57]:
                m.cyl((x,floor+y,z+.055),(x,floor+y,z+.11),.065,'Hazard',n=10)
            m.box((lo[0]+.20,floor+1.95,hi[2]-.10),(.21,.30,.10),'Fabric')
            s.t['fixtures'].append({'id':id+'-suits','room':id,'kind':'eva','label':'Tethers, suit patches and emergency supplies'})
        if any(a in id for a in ['berth','parent','kids']) or kind=='quarters':
            # Dress each actual mattress instead of assuming a bed layout.
            beds=[b for b in s.t['solids'] if b.get('room')==id and b.get('kind')=='furniture' and 1.8<b['max'][2]-b['min'][2]<2.3 and .09<b['max'][1]-b['min'][1]<.30]
            for n,b in enumerate(beds):
                x=(b['min'][0]+b['max'][0])/2;y=b['max'][1];z=(b['min'][2]+b['max'][2])/2;bw=b['max'][0]-b['min'][0]
                m.box((x,y+.025,z+.18),(bw*.92,.045,1.48),'Fabric');m.box((x,y+.052,z+.62),(bw*.94,.011,.10),'Wall')
                for side in [-1,1]:m.box((x+side*bw*.35,y+.061,z+.30),(.045,.012,1.24),'Hazard')
                m.box((x,y+.14,z-.69),(bw*.69,.045,.26),'Wall')
            s.t['fixtures'].append({'id':id+'-berths','room':id,'kind':'rest','label':name,'count':len(beds)})
        if id in ['galley','mess','commons'] or kind in ['galley','mess']:
            # Appliances and wet area sit on the actual existing worktop.
            tops=[b for b in s.t['solids'] if b.get('room')==id and b['max'][2]-b['min'][2]<1 and .8<b['max'][1]-floor<1.1 and b['max'][0]-b['min'][0]>1]
            if tops:
                b=tops[0];x=(b['min'][0]+b['max'][0])/2;z=(b['min'][2]+b['max'][2])/2;y=floor+1.02
                m.box((x-.26,y,z),(.44,.018,.38),'Metal');m.box((x-.26,y+.012,z),(.36,.013,.29),'Rubber')
                m.cyl((x-.26,y,z-.19),(x-.26,y+.26,z-.19),.018,'Metal',n=8);m.cyl((x-.26,y+.26,z-.19),(x-.26,y+.26,z-.06),.018,'Metal',n=8)
                m.box((x+.31,y+.12,z),(.30,.23,.27),'Wall');finish_screen(m,(x+.31,y+.14,z+.14),.19,.10)
                for i in range(3):m.cyl((x+.68+i*.12,y,z),(x+.68+i*.12,y+.14,z),.044,'Metal',n=10)
            s.t['fixtures'].append({'id':id+'-food','room':id,'kind':'galley','label':'Food preparation and water dispenser'})
        if id in ['hygiene','wash','head'] or kind=='hygiene':
            # Towel rail, hygiene packs and grab handles above the existing basin/toilet.
            x=lo[0]+.65;z=lo[2]+.60
            m.cyl((x,floor+.705,z+.05),(x,floor+.735,z+.05),.235,'Rubber',r1=.215,n=14,caps=False)
            m.box((hi[0]-.20,floor+1.55,lo[2]+.70),(.08,.64,.48),'Glass')
            m.box((cx,ceiling-.53,hi[2]-.32),(.55,.07,.06),'Metal');m.box((cx,ceiling-.72,hi[2]-.30),(.34,.38,.018),'Fabric')
            s.t['fixtures'].append({'id':id+'-hygiene','room':id,'kind':'hygiene','label':'Toilet, wash station and water recovery'})
        if id in ['lab','medical','med','mechanical','engineering','stores'] or kind in ['lab','medical','engineering']:
            # Equipment rests on an existing bench, never in a doorway or the central aisle.
            tops=[b for b in s.t['solids'] if b.get('room')==id and .07<b['max'][1]-b['min'][1]<.20 and .65<b['max'][1]-floor<1.1]
            if tops:
                b=tops[0];x=(b['min'][0]+b['max'][0])/2;z=(b['min'][2]+b['max'][2])/2;y=b['max'][1];bw=b['max'][0]-b['min'][0]
                finish_screen(m,(x,y+.28,z-.10),min(.56,bw*.75),.30)
                if id=='lab' or kind=='lab':
                    m.cyl((x-.22,y,z+.15),(x-.22,y+.25,z+.15),.055,'Metal',n=10);m.box((x+.18,y+.055,z+.13),(.22,.11,.25),'Wall')
                    for i in range(3):m.cyl((x-.12+i*.10,y,z+.23),(x-.12+i*.10,y+.15,z+.23),.025,'Glass',n=8)
                elif id in ['med','medical'] or kind=='medical':
                    m.box((x,y+.04,z+.19),(.35,.065,.20),'Wall');m.box((x,y+.078,z+.19),(.16,.008,.035),'Hazard');m.box((x,y+.079,z+.19),(.035,.008,.13),'Hazard')
                else:
                    for i in range(3):m.box((x-.18+i*.18,y+.015,z+.18),(.035,.025,.22),'Metal')
            s.t['fixtures'].append({'id':id+'-equipment','room':id,'kind':kind if kind!='cabin' else id,'label':name})
        if id in ['lounge','commons'] or kind=='lounge':
            # Wall-mounted media panel with foldaway immersion headset brackets.
            finish_screen(m,(cx,floor+1.65,hi[2]-.07),min(1.6,w*.45),.58)
            s.t['fixtures'].append({'id':id+'-media','room':id,'kind':'recreation','label':'Media and immersion station'})
        if kind=='bay' or id=='garage':
            for x in [lo[0]+.17,hi[0]-.17]:
                for z in [lo[2]+.8,hi[2]-.8]:
                    m.cyl((x,floor+.007,z),(x,floor+.032,z),.09,'Metal',n=12,caps=False)
            finish_label(s,'KEEP RAMP CLEAR',(cx,floor+.025,hi[2]-1.0),up=(0,0,-1),size=.25,width=w*.7,room=id)
            s.t['fixtures'].append({'id':id+'-cargo','room':id,'kind':'cargo','label':'Tie-downs, service points and ramp access'})
        # Name board over the doorway, readable from within the compartment.
        doors=[q for q in s.t.get('slideDoors',[]) if id in q.get('rooms',[]) and q['y1']<ceiling-.16]
        for door in doors[:2]:
            ax=0 if door['axis']=='x' else 2;u=(door['u0']+door['u1'])/2;sg=1 if (lo[ax]+hi[ax])/2>door['plane'] else -1
            pos=[0,ceiling-.30,0];pos[ax]=door['plane']+sg*.072;pos[2 if ax==0 else 0]=u
            right=(0,0,-sg) if ax==0 else (sg,0,0)
            finish_label(s,name.upper()[:36],pos,right=right,size=.12,width=max(.9,door['u1']-door['u0']),room=id)
        obj=m.finish();obj['finish_pass']='interiors-v1'
    for ob in set(s.scene.objects)-new_objects:ob['finish_pass']='interiors-v1'
    s.t['interiorFinish']='furnished-v1';s.t['interiorFeatures']=['wayfinding','finished-fixtures','ventilation','emergency-supplies','restrained-seating']
    s.root['interior_finish']='Furnished, labeled, serviceable exploration interiors'

# A dedicated below-deck guideway keeps fast transit clear of inhabited rooms.
def add_transit(s,stations,edges):
 nodes={};sts=[];carhalf=[1.35,1.4];height=2.5
 for id,label,host,ax,plane,u,lo,hi,pos,end in stations:
  s.room('transit-lobby-'+id,label+' transit lobby',lo,hi,'corridor');s.door('transit-link-'+id,host,'transit-lobby-'+id,ax,plane,u,1.7,2.2)
  nodes[id]=pos;nodes[id+'-low']=[pos[0],-8,pos[2]]
  door=[pos[0],pos[1],pos[2]+end*1.45];s.hole('transit-lobby-'+id,('-' if end>0 else '+')+'z',pos[0],1.5,2.2)
  panel=[door[0]+1.0,door[1],door[2]+end*.8]
  sts.append(dict(id=id,label=label,about=label,node=id,end=end,axis='z',door=door,panel=panel,landing='transit-lobby-'+id,deck=0))
  s.t['rooms'].append(dict(id='tl-'+id,name='Transit threshold',type='door',min=[door[0]-.75,door[1],door[2]-1],max=[door[0]+.75,door[1]+2.2,door[2]+1],turbolift=id))
  s.t['solids'].append(dict(min=[pos[0]-1.35,pos[1],pos[2]-1.4],max=[pos[0]+1.35,pos[1]+2.5,pos[2]+1.4],shaft=id,ride=True,kind='shaft'))
  for side in [-1,1]:
   m=s.mesh('transit_station_'+id+'_'+str(side));m.box((door[0]+side*.375,door[1]+1.1,door[2]),(.74,2.2,.085),'Hull',1);m.finish();s.t['parts'].append(dict(node=m.name,channel='turboliftLanding',station=id,slide=[side*.8,0,0]))
  # Fair the small lobby into the host's pressure vessel.
  m=s.mesh('transit_lobby_shell_'+id);m.loft([(lo[2]-.1,(hi[0]-lo[0])/2+.2,lo[1]-.3,hi[1]+.3),(hi[2]+.1,(hi[0]-lo[0])/2+.2,lo[1]-.3,hi[1]+.3)],'Hull');cx=(lo[0]+hi[0])/2;m.polys=[([(p[0]+cx,p[1],p[2]) for p in ps],ma,ix) for ps,ma,ix in m.polys];s.hab.append(m)
 network=[[st['id'],st['id']+'-low'] for st in sts]
 for name,pos in edges['nodes'].items():nodes[name]=pos
 network+=edges['edges']
 # Union of rectangular guideway volumes. Subtract every crossing before finishing walls.
 boxes=[]
 for a,b in network:
  pa,pb=nodes[a],nodes[b];lo=[min(pa[i],pb[i])-[1.60,.20,1.65][i] for i in range(3)];hi=[max(pa[i],pb[i])+[1.60,2.85,1.65][i] for i in range(3)];boxes.append((lo,hi))
 guide=s.mesh('transit_guideway');holes=[]
 for st in sts:
  d=st['door'];holes.append(([d[0]-.8,d[1]-.02,d[2]-1.3],[d[0]+.8,d[1]+2.2,d[2]+1.3]))
 for idx,(lo,hi) in enumerate(boxes):
  temp=s.mesh('_transit_segment_'+str(idx));temp.box([(lo[i]+hi[i])/2 for i in range(3)],[hi[i]-lo[i] for i in range(3)],'Metal')
  for poly,mat,paint in temp.polys:
   rem=[poly]
   for j,(a,b) in enumerate(boxes):
    if j==idx:continue
    rem=[q for p in rem for q in subtract(p,[v-.001 for v in a],[v+.001 for v in b])]
   for a,b in holes:rem=[q for p in rem for q in subtract(p,a,b)]
   guide.polys += [(p,mat,paint) for p in rem]
  s.t['colliders'].append(dict(min=lo,max=hi))
 guide.finish()
 # Local car geometry and paired doors. The runtime supplies its guideway position.
 car=bpy.data.objects.new(s.key+':transit_car',None);s.col.objects.link(car);car.parent=s.root;car.location=G(nodes[sts[0]['id']]);car['asset_id']=s.key;car['interior']=True
 m=s.mesh('transit_car_cabin');m.box((0,-.06,0),(2.7,.12,2.8),'Floor');m.box((0,2.55,0),(2.7,.10,2.8),'Ceiling')
 for x in [-1.4,1.4]:m.box((x,1.25,0),(.1,2.5,2.8),'Wall');m.box((x*.91,1.0,0),(.06,.06,2.2),'Metal')
 m.box((1.31,1.3,.1),(.04,.5,.4),'Screen');m.box((0,2.49,0),(.5,.03,1.7),'LightPanel');m.finish(parent=car)
 for end in [-1,1]:
  for side in [-1,1]:
   m=s.mesh('transit_car_door_'+str(end)+'_'+str(side));m.box((side*.37,1.1,end*1.4),(.73,2.2,.07),'Hull',1);m.finish(parent=car);s.t['parts'].append(dict(node=m.name,channel='turboliftCarDoor',axisName='z',end=end,slide=[side*.8,0,0]))
 s.t['parts'].append(dict(node=car.name,channel='turboliftCar'))
 s.t['turbolift']=dict(label='Ship transit',car=dict(half=carhalf,height=height,door=1.5,leaf=.8),nodes=nodes,edges=network,stations=sts,start=sts[0]['id'],switches={k:dict(name=k,axis=0,vertical=True) for k in nodes},run=dict(h=[35,3],v=[5,1.5]),switchTime=1,doorTime=1.2,dwell=7)

# Horizon: spacious civilian field-drive exploration ships, artificial gravity.
SHIPS=[]
# (pressure doors a suited crew passes in comfort, where the airlock has the room; Neptune 3's size)
WIDE_LOCK=(1.8,2.5)

def skin(s,name,stations,x=0,paint=0):
 m=s.mesh(name);m.loft(stations,'Hull',paint,n=24);m.stations=stations;m.skin_x=x
 if x:m.polys=[([(p[0]+x,p[1],p[2]) for p in ps],mat,idx) for ps,mat,idx in m.polys]
 s.hab.append(m);return m

def pod(s,x,y,z0,z1,r):
 m=s.mesh('field_drive_'+str(s.serial));s.serial+=1
 m.cyl((x,y,z0+r),(x,y,z1-r),r,'Hull',1,n=16,collision=True)
 m.cyl((x,y,z0),(x,y,z0+r),r*.35,'Hull',r1=r,n=16)
 m.cyl((x,y,z1-r),(x,y,z1),r,'Hull',r1=r*.65,n=16)
 m.cyl((x,y,z1+.01),(x,y,z1+.05),r*.50,'EngineGlow',n=16);m.finish()
 s.t['engines'].append([x,y,z1+.05,r*.50]);s.t.setdefault('engineAxes',[]).append([0,0,1])

def cabin(s,id,name,lo,hi,kind='cabin'):
 return s.room(id,name,lo,hi,kind)

def bridge(s,z0,z1,w=3.5,f=0):
 cabin(s,'bridge','Flight deck',[-w,f,z0],[w,f+3.2,z1],'bridge');s.furniture('bridge','bridge');s.seat('bridge',-.85,f,z0+1.5,True);s.seat('bridge',.85,f,z0+1.5)
 s.front_window(z0,-w+.25,w-.25,f+.9,1.7,room='bridge')

def berth_bed(s,room,x,z,f=0,width=1.1):
 m=s.mesh('bed_'+str(s.serial),room=room);s.serial+=1
 m.box((x,f+.36,z),(width,.42,2.15),'Hull',1,solid=True);m.box((x,f+.63,z),(width,.20,2.10),'Fabric',solid=True);m.box((x,f+.80,z-.76),(width*.70,.15,.42),'Wall');m.box((x,f+.75,z+.55),(width,.04,.13),'Wall');m.box((x-width*.43,f+1.20,z-.97),(.11,.12,.07),'LightPanel');m.finish()

def suite(s,id,name,lo,hi,berths=2,parents=False):
 cabin(s,id,name,lo,hi,'quarters',) # private cabin with low service divider
 x0,f,z0=lo;x1,_,z1=hi;cx=(x0+x1)/2
 for i in range(berths):
  x=x0+1.1+i*1.55 if not parents else cx;z=z0+1.5
  berth_bed(s,id,x,z,f,1.85 if parents else 1.12)
  if parents:break
 m=s.mesh('suite_fixtures_'+id,room=id)
 m.box((x1-.4,f+1.05,z1-.8),(.65,2.1,1.2),'Wall',solid=True);m.box((x0+.75,f+.75,z1-.4),(1.1,.09,.6),'Wood',solid=True)
 m.box((x0+.75,f+.42,z1-1.0),(.55,.5,.55),'Fabric',solid=True);m.box((x0+.75,f+1.05,z1-.3),(.5,.34,.055),'Screen')
 # Compact private hygiene area in the rear corner, separated from the sleeping area.
 if x1-x0>6 and z1-z0>7:
  m.box((x1-1.45,f+.31,z1-1.25),(.55,.62,.68),'Wall',solid=True)
  m.box((x1-2.1,f+1.1,z1-1.5),(.08,2.2,2.6),'Wall',solid=True)
  m.box((x1-1.1,f+.80,z1-.32),(.75,.12,.45),'Wall',solid=True)
 m.finish();s.rs[id]['r']['berths']=berths

def galley(s,room):
 s.furniture(room,'galley')
 r=s.rs[room]['r'];lo,hi=r['min'],r['max'];m=s.mesh('dining_'+room,room=room);n=0
 # Family/group tables off the center crossing aisle, with usable passenger seats.
 for z in [lo[2]+3.5,hi[2]-2.4]:
  if abs(z-(lo[2]+hi[2])/2)<1.7:continue
  cx=(lo[0]+hi[0])/2;m.box((cx,lo[1]+.76,z),(1.0,.10,1.7),'Wood',solid=True)
  for side in [-1,1]:
   for zz in [z-.50,z+.50]:
    x=cx+side*.95;m.box((x,lo[1]+.42,zz),(.52,.55,.53),'Fabric',solid=True);n+=1
 m.finish();s.rs[room]['r']['diningPlaces']=n+2

def spine_living(s,z0,z1,w,crew):
 bridge(s,z0,z0+8,5)
 cabin(s,'passage','Residential promenade',[-2,0,z0+8],[2,3.2,z1],'corridor');s.door('bridge-link','bridge','passage','z',z0+8,0,2)
 rows=crew//4;depth=9
 for i in range(rows):
  za=z0+8+i*depth
  for side in [-1,1]:
   id=('port-' if side<0 else 'stbd-')+str(i+1);xa,xb=(-w,-2) if side<0 else (2,w)
   suite(s,id,('Port' if side<0 else 'Starboard')+' cabin '+str(i+1),[xa,0,za],[xb,3.2,za+depth],2)
   s.door('door-'+id,'passage',id,'x',side*2,za+depth/2,1.4)
 start=z0+8+rows*depth
 specs=[('commons','Community dining and galley','galley'),('medical','Medical and recovery','medical'),('lab','Planetary science laboratory','lab'),('workshop','Fabrication and mechanical support','engineering'),('lounge','Observation and immersion lounge','lounge'),('fitness','Exercise and wellbeing','lounge')]
 dep=(z1-start)/3
 for i,(id,name,kind) in enumerate(specs):
  side=-1 if i%2==0 else 1;xa,xb=(-w,-2) if side<0 else (2,w);za=start+(i//2)*dep
  cabin(s,id,name,[xa,0,za],[xb,3.2,za+dep],kind);s.door('door-'+id,'passage',id,'x',side*2,za+dep/2,1.6)
  if kind=='galley':galley(s,id)
  elif kind=='lounge':
   m=s.mesh('lounge_'+id,room=id)
   for z in [za+2.2,za+dep-2.2]:
    m.box(((xa+xb)/2,.5,z),(3.5,1,1.0),'Fabric',solid=True)
   m.box((xa+.35,1.4,za+dep/2),(.1,1.0,2),'Screen');m.finish()
  else:s.furniture(id,kind)
 s.airlock('bridge',[-10,0,z0+1],[-5,3.2,z0+5],'x',-5,-10,z0+3,'bridge-eva',door=WIDE_LOCK)

def pad(s,id,x,z,w,d,y=0):
 m=s.mesh('pad_'+id);m.box((x,y-.20,z),(w,.4,d),'Metal',collision=True)
 for xx in [x-w/2+.6,x+w/2-.6]:m.box((xx,y+.014,z),(.25,.026,d-1.2),'Hazard')
 for zz in [z-d/2+.6,z+d/2-.6]:m.box((x,y+.014,zz),(w-1.2,.026,.25),'Hazard')
 m.finish();s.t['rooms'].append({'id':'pad-'+id,'name':id,'type':'exterior','min':[x-w/2,y,z-d/2],'max':[x+w/2,y+max(12,w*.30),z+d/2],'vacuum':True,'capture':True,'open':['-x','+x','-z','+z','+y']});s.t['zones'].append({'name':id,'kind':'pad','min':[x-w/2,y,z-d/2],'max':[x+w/2,y+max(12,w*.30),z+d/2],'gravity':9.81,'pressure':0,'pad':[x,y,z]})

def cargo_ramp(s,room,z,w,h):
 s.rs[room]['r']['open']=['+z'];s.rs[room]['r']['gate']={'+z':'ramp'};s.hole(room,'+z',0,w,h)
 s.cuts.append(([-w/2,-.03,z-.8],[w/2,h+.03,z+.8]))
 m=s.mesh('cargo_ramp');m.box((0,h/2,z+.07),(w,h,.14),'Hull',1)
 for i in range(1,10):m.box((0,h*i/10,z-.02),(w-.25,.07,.06),'Metal')
 m.finish(pivot=(0,0,z));a=math.acos(-1.2/h)
 s.t['parts'].append({'node':m.name,'door':'ramp','axis':[1,0,0],'angle':a})
 s.t['doors'].append({'id':'ramp','label':'Cargo ramp','ramp':True,'min':[-w/2,0,z],'max':[w/2,h,z+.14],'hinge':[0,z],'angle':a,'speed':.45,'panel':[w/2+.35,1.2,z+.5],'panelIn':[w/2-.5,1.2,z-1]})
 s.t['ramps']=[{'door':'ramp','width':w,'hinge':[0,z],'length':h}];s.t['solids'].append({'min':[-w/2,0,z-.06],'max':[w/2,h,z+.14],'door':'ramp','kind':'door'})

def garage_lock(s,host,garage,z0,z1,half_width=1.3,door=(1.1,2.15)):
 s.airlock(host,[-half_width,0,z0],[half_width,3.2,z1],'z',z0,z1,0,'garage-lock',door=door);s.t['airlocks'][-1]['outerRoom']=garage;s.t['entries'][-1]['internal']=True;s.t['slideDoors'][-1]['rooms']=['garage-lock',garage];s.hole(garage,'-z',0,door[0],door[1]);s.t['rooms'].append({'id':'garage-link','name':'Garage doorway','type':'door','min':[-door[0]/2,0,z1-.5],'max':[door[0]/2,door[1],z1+.5]})

# MERIDIAN: inhabited crescent bow, twin service keels, sheltered lateral hangars.
s=Ship('meridian','Meridian',380_000_000,48,1500,True)
spine_living(s,-710,-530,14,48)
skin(s,'inhabited_crescent',[(-750,24,-9,8),(-715,72,-14,15),(-670,135,-18,22),(-610,166,-16,21),(-555,135,-12,16),(-520,42,-7,9)])
for side in [-1,1]:skin(s,'crescent_tip_'+str(side),[(-650,30,-10,12),(-580,58,-12,16),(-465,53,-10,18),(-390,18,-5,9)],side*126,1)
cabin(s,'service','Central exploration spine',[-3,0,-530],[3,3.2,590],'corridor');s.door('spine-link','passage','service','z',-530,0,2)
skin(s,'central_spine',[(-565,42,-12,17),(-405,61,-22,33),(-180,52,-24,35),(245,48,-22,33),(520,56,-19,27),(650,32,-10,15)])
cabin(s,'engineering','Main drive engineering',[-16,0,590],[16,5,640],'engineering');s.door('drive-link','service','engineering','z',590,0,2);s.furniture('engineering','engineering')
skin(s,'drive_hull',[(515,55,-16,23),(640,80,-18,22),(705,65,-13,16),(750,20,-8,8)])
for side in [-1,1]:
 x=side*140;za,zb=-230,260
 pad(s,('Port' if side<0 else 'Starboard')+' sheltered hangar',x,15,90,490,0)
 m=s.mesh('sheltered_hangar_'+str(side));m.box((x,38,15),(90,3,490),'Hull',1,collision=True)
 for xx in [x-45,x+45]:m.box((xx,18,15),(3,40,490),'Hull',collision=True)
 m.box((x,18,260),(90,40,3),'Hull',collision=True);m.finish()
 lo,hi=sorted([side*3,side*92]);cabin(s,'hangar-access-'+str(side),'Hangar service gallery',[lo,0,20],[hi,3.2,26],'corridor');s.door('hangar-spine-'+str(side),'service','hangar-access-'+str(side),'x',side*3,23,1.8)
 skin(s,'hangar_link_'+str(side),[(19,(hi-lo)/2,-.6,4.2),(27,(hi-lo)/2,-.6,4.2)],(lo+hi)/2)
 a,b=sorted([side*92,side*96]);s.airlock('hangar-access-'+str(side),[a,0,20],[b,3.2,26],'x',side*92,side*96,23,'hangar-lock-'+str(side),door=WIDE_LOCK)
 # Swept shoulders carry hangar loads into the central hull; the court remains open.
 skin(s,'structural_shoulder_'+str(side),[(-600,26,-8,13),(-450,45,-17,28),(-180,48,-18,30),(240,48,-18,30),(490,40,-15,23),(680,18,-7,12)],side*80)
 skin(s,'hangar_fairing_'+str(side),[(-275,32,-3,32),(-230,49,-5,44),(195,52,-7,46),(285,35,-4,36),(320,12,-1,16)],x,1)
 s.cuts.append(([x-43.4,-.1,-300],[x+43.4,36.4,258.4]));s.open.append(([x-43.4,-.1,-300],[x+43.4,36.4,258.4]))
 # Rim bands and luminous navigation stripes emphasize the layered civilian hull.
 trim=s.mesh('hangar_rim_'+str(side),lod=1)
 for xx in [x-43,x+43]:
  trim.box((xx,39.6,20),(.7,.12,430),'Hull',2)
  trim.box((xx,39.7,-190),(.5,.08,18),'LightPanel')
 trim.finish()
 pod(s,side*60,2,610,750,14)
 s.t['zones'][-1]['pressure']=0
add_transit(s,[
 ('forward','Bridge and residences','service','x',3,-520,[3,0,-523],[9.5,3.2,-517.45],[8,0,-516],-1),
 ('engineering','Engineering','engineering','z',640,8,[6.5,0,640],[9.5,3.2,642.55],[8,0,644],-1),
 ('port','Port hangar','hangar-access--1','z',20,-88,[-89.5,0,17.45],[-86.5,3.2,20],[-88,0,16],1),
 ('starboard','Starboard hangar','hangar-access-1','z',20,88,[86.5,0,17.45],[89.5,3.2,20],[88,0,16],1),
],{'nodes':{'junction':[8,-8,16]},'edges':[['forward-low','junction'],['junction','engineering-low'],['junction','port-low'],['junction','starboard-low']]})
s.t['thrust'].update(main=.40,belly=.15,lateral=.10,retro=.12);SHIPS.append(s)

# CONFLUENCE: horseshoe service tender with an unobstructed visiting-craft court.
s=Ship('confluence','Confluence',18_000_000,24,420,True)
spine_living(s,-199,-88,13,24)
skin(s,'forward_habitat',[(-210,15,-5,9),(-195,40,-10,14),(-157,62,-13,18),(-110,65,-10,14),(-80,58,-7,10)])
cabin(s,'forecross','Forward visitor gallery',[-50,0,-88],[50,3.2,-80],'corridor');s.door('forecross-link','passage','forecross','z',-88,0,2)
cabin(s,'engineering','Aft service center',[-50,0,150],[50,3.2,175],'engineering');skin(s,'aft_service',[(145,58,-7,10),(175,65,-10,14),(200,45,-5,8)])
for side in [-1,1]:
 x=side*48;id='spine-'+str(side);cabin(s,id,'Pressurized visitor promenade',[x-2.2,0,-80],[x+2.2,3.2,150],'corridor');s.door('forward-'+id,'forecross',id,'z',-80,x,1.8);s.door('aft-'+id,id,'engineering','z',150,x,1.8)
 skin(s,id,[(-80,9,-5,8),(60,10,-6,10),(150,9,-5,8)],x)
 for j,z in enumerate([-34,64]):
  a,b=sorted([x-side*2.2,x-side*10]);s.airlock(id,[a,0,z-2],[b,3.2,z+2],'x',x-side*2.2,x-side*10,z,id+'-eva-'+str(j),door=WIDE_LOCK);pad(s,id+' berth '+str(j+1),side*20,z,34,80,0)
 pod(s,side*30,2,174,210,5)
s.furniture('engineering','engineering')
pad(s,'Dorsal visitor terrace',0,-133,70,85,19)
add_transit(s,[
 ('forward','Bridge and homes','forecross','z',-80,0,[-1.5,0,-80],[1.5,3.2,-78.45],[0,0,-77],-1),
 ('engineering','Engineering','engineering','z',150,0,[-1.5,0,148.45],[1.5,3.2,150],[0,0,147],1),
 ('port','Port visitor promenade','spine--1','x',-50.2,8,[-57.5,0,5.4],[-50.2,3.2,10.55],[-56,0,12],-1),
 ('starboard','Starboard visitor promenade','spine-1','x',50.2,8,[50.2,0,5.4],[57.5,3.2,10.55],[56,0,12],-1),
],{'nodes':{'junction':[0,-8,12]},'edges':[['forward-low','junction'],['junction','engineering-low'],['junction','port-low'],['junction','starboard-low']]})
s.t['thrust'].update(main=1.8,belly=1.2,lateral=.5,retro=.6);SHIPS.append(s)

"""Neptune 3: family-scale furniture, structural lining and exploration stations."""

def n3_screen(m,c,w,h,forward=1):
    start=len(m.polys);finish_screen(m,c,w,h)
    if forward<0:
        m.polys[start:]=[([(2*c[0]-p[0],p[1],2*c[2]-p[2]) for p in poly],mat,paint) for poly,mat,paint in m.polys[start:]]

def n3_chair(s,room,x,z,heading,label):
    m=s.mesh('n3_seat_'+str(len(s.t['seats'])),room=room)
    m.box((0,.25,0),(.46,.5,.48),'Metal')
    m.box((0,.52,0),(.66,.15,.66),'Fabric')
    m.box((0,.94,.28),(.66,.78,.12),'Fabric')
    for side in [-1,1]:m.box((side*.36,.73,0),(.07,.09,.56),'Wood')
    angle=math.atan2(-heading[0],-heading[2]);ca,sa=math.cos(angle),math.sin(angle)
    def point(p):return (x+p[0]*ca+p[2]*sa,p[1],z-p[0]*sa+p[2]*ca)
    m.polys=[([point(p) for p in pts],mat,paint) for pts,mat,paint in m.polys];m.finish()
    s.t['solids'].append({'min':[x-.35,.02,z-.35],'max':[x+.35,1.35,z+.35],'room':room,'kind':'furniture'})
    s.t['seats'].append({'pos':[x,0,z],'eye':[x,1.35,z],'stand':[x-heading[0]*.85,0,z-heading[2]*.85],'heading':heading,'label':label,'room':room})

def n3_window(s,room,side,z,width=2.7):
    from mathutils.geometry import intersect_ray_tri
    inner=side*11;bottom=.95;top=2.45;a=z-width/2;b=z+width/2
    cutlo=[-22 if side<0 else 10.8,bottom,a];cuthi=[-10.8 if side<0 else 22,top,b]
    s.rs[room].setdefault('windows',[]).append((cutlo,cuthi));s.cuts.append((cutlo,cuthi))
    inner_pts=[(inner,bottom,a),(inner,bottom,b),(inner,top,b),(inner,top,a)]
    outer=[]
    for p in inner_pts:
        start=Vector(p);direction=Vector((side,0,0));hits=[]
        for poly,mat,paint in s.hab[0].polys:
            for i in range(1,len(poly)-1):
                q=intersect_ray_tri(Vector(poly[0]),Vector(poly[i]),Vector(poly[i+1]),direction,start)
                if q is not None and (q-start).dot(direction)>0:hits.append(q)
        assert hits,(room,p)
        q=min(hits,key=lambda q:(q-start).length);q.x+=side*.014;outer.append(tuple(q))
    m=s.mesh('n3_window_reveal_'+room,room=room)
    for i in range(4):m.face([inner_pts[i],inner_pts[(i+1)%4],outer[(i+1)%4],outer[i]],'Wall')
    # Transparent hull glazing; the deeper sill reads as part of the pressure shell.
    m.face(outer,'Glass',normal=(side,0,0))
    for zz in [a-.035,b+.035]:m.box((inner-side*.065,(bottom+top)/2,zz),(.08,top-bottom+.15,.07),'Metal')
    for yy in [bottom-.035,top+.035]:m.box((inner-side*.065,yy,z),(.08,.07,width+.12),'Metal')
    m.box((inner-side*.13,bottom-.06,z),(.26,.09,width+.14),'Wood');m.finish()

"""Neptune 3 develops the approved Neptune 2 radial interior, using its saved mesh basis."""

# the bow rooms' outer walls (x, inside the hull's 13.7 m there) and the airlocks' doors (width, height)
N3_BOW_X=13.25
N3_LOCK_DOOR=(1.8,2.5)
# the flight deck moved forward into the nose (m), and how far aft its canopy reaches (z)
N3_COCKPIT_FORWARD=-2.45
N3_CANOPY_AFT=-22.6

def n3_from2(p):
    x,y,z=p;sx=1.14-.11*max(0,min(1,(z-12.3)/12.7))
    return (x*sx,y+1.1,z*1.08-2)

def n3_room(s,id,name,lo,hi,kind='cabin',**kw):
    return s.room(id,name,lo,hi,kind,**kw)

def n3_lineage_rooms(s):
    n3_room(s,'bridge','Raised flight deck',[-2.964,.6,-26.0],[2.964,3.25,-19.28],'bridge')
    n3_room(s,'commons','Circular family lounge',[-5.928,0,-19.28],[5.928,3.25,-2.378],'lounge',diningPlaces=8)
    n3_room(s,'galley','Bow kitchen and pantry',[-8.7,0,-16.6],[-5.928,3.25,-10.802],'galley')
    n3_room(s,'guest','Guest bedroom',[-12.1,0,-16.6],[-8.7,3.25,-10.802],'quarters',berths=1)
    n3_room(s,'dining','Bow dining alcove',[5.928,0,-19.28],[N3_BOW_X,3.25,-10.802],'lounge')
    n3_room(s,'parents','Parents suite',[-15.8,0,-10.802],[-5.928,3.25,-2.378],'quarters',berths=2)
    n3_room(s,'kids-a','Three-person cabin',[5.928,0,-10.802],[15.8,3.25,-6.62],'quarters',berths=3)
    n3_room(s,'kids-b','Two-person cabin',[5.928,0,-6.62],[15.8,3.25,-2.378],'quarters',berths=2)
    n3_room(s,'wash','Washrooms and laundry',[-9.576,0,-2.378],[-1.938,3.25,4.804],'hygiene')
    n3_room(s,'suits','EVA dressing room',[-9.348,0,4.804],[-1.938,3.25,11.23],'cabin')
    n3_room(s,'mechanical','Survey and mechanical bay',[1.938,0,-2.378],[12.312,3.25,11.23],'engineering')
    n3_room(s,'passage','Aft service passage',[-1.938,0,-2.378],[1.938,3.25,8.284],'corridor')
    n3_room(s,'garage','Runabout garage',[-5.05,0,11.284],[5.05,5,25],'bay',vacuum=True)
    for side in [-1,1]:
        lo,hi=sorted([side*5.68,side*10.0])
        n3_room(s,'engine-'+('port' if side<0 else 'starboard'),'Drive service bay',[lo,0,12.04],[hi,3.25,24.7],'engineering')
    s.t['openConnections']=[['bridge','commons'],['commons','galley'],['commons','dining'],['commons','passage']]
    for id,a,b,axis,plane,u,w in [
        ('door-guest','galley','guest','x',-8.7,-12.05,1.3),
        ('door-parents','commons','parents','x',-5.928,-9.02,1.368),
        ('door-kids-a','commons','kids-a','x',5.928,-9.02,1.368),
        ('door-kids-b','commons','kids-b','x',5.928,-4.65,1.368),
        ('door-wash','passage','wash','x',-1.938,.916,1.368),
        ('door-suits','passage','suits','x',-1.938,6.856,1.368),
        ('door-mechanical','passage','mechanical','x',1.938,5.236,1.482),
        ('door-engine-port','garage','engine-port','x',-5.38,15.604,1.512),
        ('door-engine-starboard','garage','engine-starboard','x',5.38,15.604,1.512),
    ]:s.door(id,a,b,axis,plane,u,w,2.3)
    s.airlock('commons',[-N3_BOW_X,0,-19.28],[-5.928,3.25,-16.6],'x',-5.928,-N3_BOW_X,-17.85,'bridge-eva',door=N3_LOCK_DOOR)
    s.airlock('suits',[-15.05,0,5.128],[-9.348,3.25,8.8],'x',-9.348,-15.05,7.018,'suit-eva',door=N3_LOCK_DOOR)
    for d in s.t['slideDoors']:
        if d['id'] in ['bridge-eva-outer','suit-eva-outer']:s.cuts.append(([-22,0,d['u0']],[d['plane']+.2,d['y1']+.15,d['u1']]))
    garage_lock(s,'passage','garage',8.284,11.284,half_width=1.938)
    cargo_ramp(s,'garage',25,9.7,4.8)
    s.t['zones'].append({'name':'Runabout garage','kind':'hold','min':[-4.9,.01,11.384],'max':[4.9,4.7,25],'gravity':9.81,'pressure':0,'door':'ramp','snug':True,'exitMargin':1,'groundSpeedLimit':3})
    s.t['clamp']={'name':'Rover restraint','pos':[0,1.8,18.9],'reach':[1.5,1.2,2.5],'fits':[9.5,4.5,10],'positionsByType':{'runabout':[0,.65,18.9]}}

def n3_merge(cells,nx,nz):
    used=set();out=[]
    for x,z in sorted(cells):
        if (x,z) in used:continue
        z1=z
        while (x,z1+1) in cells and (x,z1+1) not in used:z1+=1
        x1=x
        while x1+1<nx and all((x1+1,k) in cells and (x1+1,k) not in used for k in range(z,z1+1)):x1+=1
        used.update((i,k) for i in range(x,x1+1) for k in range(z,z1+1));out.append((x,z,x1,z1))
    return out

def n3_lineage_collision(s):
    from mathutils.bvhtree import BVHTree
    wall_meshes=[m for m in s.builders if m.room and any(mat=='Wall' for _,mat,_ in m.polys)]
    s.t['wallCleanup']=clean_shared_room_walls(wall_meshes)
    for m in wall_meshes:
        original=s.scene.objects.get(m.name)
        assert original,m.name
        replacement=m.finish();original.data=replacement.data;bpy.data.objects.remove(replacement,do_unlink=True)
    bpy.context.view_layer.update()
    verts=[];faces=[];floorverts=[];floorfaces=[]
    for o in s.scene.objects:
        if o.type!='MESH' or not o.get('interior') or o.get('ceiling') or ':door_' in o.name or ':finish_label_' in o.name:continue
        base=len(verts);verts.extend(o.matrix_world@v.co for v in o.data.vertices)
        for p in o.data.polygons:
            faces.append([base+i for i in p.vertices])
            mat=o.data.materials[p.material_index]
            if mat.get('semantic')=='Floor' and p.normal.z>.7:
                j=len(floorverts);floorverts.extend(o.matrix_world@o.data.vertices[i].co for i in p.vertices);floorfaces.append(list(range(j,len(floorverts))))
    tree=BVHTree.FromPolygons(verts,faces);floor=BVHTree.FromPolygons(floorverts,floorfaces)
    cell=.15;x0=-17.1;z0=-26.55;nx=228;nz=344;blocked=set();physical=set();levels={};walk=set()
    for i in range(nx):
        for k in range(nz):
            x=x0+(i+.5)*cell;z=z0+(k+.5)*cell
            hit=floor.ray_cast(G((x,.85,z)),Vector((0,0,-1)),1.1)
            if hit[0] is None:
                is_exit=(abs(x)<4.85 and z>24.6) or any(x<d['plane']+.01 and d['u0']<=z<=d['u1'] for d in s.t['slideDoors'] if d['id'] in ['bridge-eva-outer','suit-eva-outer'])
                if not is_exit:blocked.add((i,k))
                continue
            f=round(hit[0].z,3);levels.setdefault(f,set()).add((i,k))
            up=tree.ray_cast(G((x,f+.06,z)),Vector((0,0,1)),1.95)
            if up[0] is not None or any(tree.find_nearest(G((x,f+h,z)),.045)[0] is not None for h in [.3,1.0,1.7]):
                blocked.add((i,k));physical.add((i,k))
            else:walk.add((i,k))
    for cells,physical_box in [(blocked,False),(physical,True)]:
        for a,b,c,d in n3_merge(cells,nx,nz):
            box={'min':[round(x0+a*cell,4),0,round(z0+b*cell,4)],'max':[round(x0+(c+1)*cell,4),2.9,round(z0+(d+1)*cell,4)]}
            if physical_box:s.t['colliders'].append(box)
            else:s.t['solids'].append(dict(box,kind='architecture'))
    for f,cells in levels.items():
        for a,b,c,d in n3_merge(cells,nx,nz):
            box={'min':[round(x0+a*cell,4),f-.15,round(z0+b*cell,4)],'max':[round(x0+(c+1)*cell,4),f,round(z0+(d+1)*cell,4)]}
            s.t['colliders'].append(box)
            if f>.05:s.t['solids'].append(dict(box,kind='step'))
    s.t['layoutBasis']={'ship':'Neptune 2','source':'neptune2-interior-basis.json','hubCenter':[0,0,-10.64],'circulationRadii':[3.1*1.08,4.4*1.14],'walkCell':cell,'freeCells':len(walk)}
    for m in s.hab:
        for lo,hi in s.cuts:m.cut(lo,hi)
        m.finish()

def n3_lineage_window(s,room,side,z,width=2.7):
    from mathutils.geometry import intersect_ray_tri
    inner=side*15.8;bottom=.95;top=2.45;a=z-width/2;b=z+width/2
    cutlo=[-22 if side<0 else 15.65,bottom,a];cuthi=[-15.65 if side<0 else 22,top,b]
    s.rs[room].setdefault('windows',[]).append((cutlo,cuthi));s.cuts.append((cutlo,cuthi))
    inner_pts=[(inner,bottom,a),(inner,bottom,b),(inner,top,b),(inner,top,a)]
    outer=[]
    for p in inner_pts:
        start=Vector(p);direction=Vector((side,0,0));hits=[]
        for poly,mat,paint in s.hab[0].polys:
            for i in range(1,len(poly)-1):
                q=intersect_ray_tri(Vector(poly[0]),Vector(poly[i]),Vector(poly[i+1]),direction,start)
                if q is not None and (q-start).dot(direction)>0:hits.append(q)
        assert hits,(room,p)
        q=min(hits,key=lambda q:(q-start).length);q.x+=side*.014;outer.append(tuple(q))
    m=s.mesh('n3_window_reveal_'+room,room=room)
    for i in range(4):m.face([inner_pts[i],inner_pts[(i+1)%4],outer[(i+1)%4],outer[i]],'Wall')
    # Transparent hull glazing; the deeper sill reads as part of the pressure shell.
    m.face(outer,'Glass',normal=(side,0,0))
    for zz in [a-.035,b+.035]:m.box((inner-side*.065,(bottom+top)/2,zz),(.08,top-bottom+.15,.07),'Metal')
    for yy in [bottom-.035,top+.035]:m.box((inner-side*.065,yy,z),(.08,.07,width+.12),'Metal')
    m.box((inner-side*.13,bottom-.06,z),(.26,.09,width+.14),'Wood');m.finish()



def n3_expand_cabin_wall(pts):
    # Move the three original cabin outer walls into the old service voids.
    if all(-10.87<=z<=-2.31 and abs(x)>=5.85 for x,y,z in pts):
        return [((1 if x>0 else -1)*(15.8+min(.057,abs(x)-12.54)) if abs(x)>12.45 else x,y,z) for x,y,z in pts]
    return pts

def n3_accommodation_geometry(s):
    # Original cabin floors are replaced, so their widened decks share only edges.
    floors=s.mesh('accommodation_floors',room='commons');ceil=s.mesh('accommodation_ceilings',room='commons')
    for id in ['parents','kids-a','kids-b']:
        lo,hi=s.rs[id]['r']['min'],s.rs[id]['r']['max']
        c=((lo[0]+hi[0])/2,-.075,(lo[2]+hi[2])/2);sz=(hi[0]-lo[0],.15,hi[2]-lo[2]);floors.box(c,sz,'Floor')
        ceil.box((c[0],3.29,c[2]),(sz[0],.08,sz[2]),'Ceiling')
    floors.finish();ceil.finish(ceiling=True)
    # Guest cabin: use the spare galley-side area, with a door into shared circulation.
    m=s.mesh('guest_cabin_walls',room='guest');r=s.rs['guest']['r'];lo,hi=r['min'],r['max']
    for axis in [0,2]:
        ua=2 if axis==0 else 0
        for sign in [-1,1]:
            if axis==2:continue # Existing front vestibule / parents bulkheads bound both ends.
            side=('-' if sign<0 else '+')+('x' if axis==0 else 'z');plane=(lo if sign<0 else hi)[axis]
            cuts=s.rs['guest']['holes'].get(side,[]);edges=sorted(set([lo[ua],hi[ua]]+[v for a,b,h in cuts for v in [a,b]]))
            for a,b in zip(edges,edges[1:]):
                low=max([h for aa,bb,h in cuts if aa<(a+b)/2<bb]or[0]);c=[0,(low+hi[1])/2,0];sz=[0,hi[1]-low,0];c[axis]=plane;c[ua]=(a+b)/2;sz[axis]=.10;sz[ua]=b-a;m.box(c,sz,'Wall')
    m.finish()
    c=s.mesh('guest_ceiling',room='guest');c.box(((lo[0]+hi[0])/2,3.29,(lo[2]+hi[2])/2),(hi[0]-lo[0],.08,hi[2]-lo[2]),'Ceiling');c.finish(ceiling=True)
    # Guest storage and desk; keep the door approach and bed access open.
    m=s.mesh('guest_storage',room='guest')
    m.box((-9.35,1.12,-11.2),(.70,2.24,.35),'Wood')
    m.box((-10.95,.76,-11.28),(1.35,.10,.65),'Wood');n3_screen(m,(-10.95,1.08,-11.31),.64,.4,-1)
    m.finish();n3_chair(s,'guest',-10.95,-12.25,[0,0,1],'Guest study chair')
    # Widened family cabins gain usable sitting/dressing areas, not empty wall cavities.
    m=s.mesh('expanded_cabin_storage',room='commons')
    for x,z in [(-15.15,-3.3),(15.15,-7.1),(15.15,-5.95)]:m.box((x,1.13,z),(.70,2.26,1.0),'Wood')
    m.box((-13.4,.76,-9.95),(1.7,.10,.65),'Wood');n3_screen(m,(-13.4,1.06,-9.95),.8,.43)
    m.finish();n3_chair(s,'parents',-13.4,-9.0,[0,0,-1],'Parents window desk')
    n3_chair(s,'kids-a',14.3,-8.5,[0,0,1],'Children’s reading chair')
    n3_chair(s,'kids-b',14.3,-3.8,[0,0,-1],'Children’s reading chair')
    # The lounge keeps a clear center between its curved couches.
    m=s.mesh('lounge_low_table',room='commons');m.box((0,.45,-10.64),(1.35,.10,1.1),'Wood');m.box((0,.21,-10.64),(.55,.42,.55),'Metal');m.finish()
    # A real outboard collar surrounds the working forward pressure lock.
    m=s.mesh('forward_docking_collar')
    cx=-N3_BOW_X-.02;dw,dh=N3_LOCK_DOOR
    for z in [-17.85-dw/2-.12,-17.85+dw/2+.12]:m.box((cx,dh/2-.05,z),(.30,dh+.3,.20),'Metal')
    for y in [-.1,dh+.12]:m.box((cx,y,-17.85),(.30,.20,dw+.4),'Metal')
    for z in [-17.85-dw/2-.1,-17.85+dw/2+.1]:m.box((cx-.175,dh/2-.05,z),(.035,dh,.07),'Hazard')
    m.finish()
    m=s.mesh('forward_docking_fittings',room='bridge-eva')
    m.box((-12.8,.48,-16.96),(1.3,.18,.55),'Fabric');m.box((-12.8,.22,-16.96),(.9,.40,.4),'Metal')
    m.box((-8.25,1.23,-19.13),(1.2,.78,.08),'Metal');n3_screen(m,(-8.25,1.23,-19.065),1.03,.59)
    m.finish()
    s.rs['bridge-eva']['r']['name']='Forward docking / EVA vestibule'
    for e in s.t['entries']:
        if e.get('airlock')=='bridge-eva':e['label']='Forward docking / EVA collar'
    s.t['ports']=[{'id':'forward-dock','label':'Forward docking collar','room':'bridge-eva','pos':[-N3_BOW_X-.17,1.25,-17.85],'normal':[-1,0,0],'up':[0,1,0],'aperture':list(N3_LOCK_DOOR),'airlock':'bridge-eva','innerDoor':'bridge-eva-inner','outerDoor':'bridge-eva-outer','role':'Pressure transfer interface; berth partner supplied by host'}]
    s.t['accommodation']={'family':7,'guests':1,'bedrooms':4,'enlargedCabinWidth':9.872,'dockingRoom':'bridge-eva','loungeCore':'open'}

def n3_hull_half(stations,z):
    st=sorted(stations)
    for a,b in zip(st,st[1:]):
        if a[0]<=z<=b[0]:t=(z-a[0])/max(b[0]-a[0],1e-9);return a[1]+(b[1]-a[1])*t
    return st[0][1] if z<st[0][0] else st[-1][1]

def skin_section(m,z):
    # a lofted skin's section at z: (half-width, lower y, upper y), or None past its ends
    st=sorted(m.stations)
    if z<st[0][0] or z>st[-1][0]:return None
    for a,b in zip(st,st[1:]):
        if a[0]<=z<=b[0]:
            t=(z-a[0])/max(b[0]-a[0],1e-9);return tuple(a[i]+(b[i]-a[i])*t for i in (1,2,3))

def skin_span(m,x,z):
    # where a vertical line through the skin at (x, z) is inside it: (low, high) or None
    # (its sections are squircles, (x/w)^4 + ((y-mid)/half)^4 = 1, linear between stations)
    sec=skin_section(m,z)
    if not sec:return None
    w,low,high=sec;u=abs(x-getattr(m,'skin_x',0))/w
    if u>=1:return None
    mid=(low+high)/2;half=(high-low)/2*(1-u**4)**.25;return (mid-half,mid+half)

def inside_skins(skins,p):
    for m in skins:
        sp=skin_span(m,p[0],p[2])
        if sp and sp[0]<p[1]<sp[1]:return True
    return False

def box_minus(box,cut):
    # a box less another: the pieces left (up to six), or the box itself where they don't meet
    lo,hi=box
    if any(lo[i]>=cut[1][i] or hi[i]<=cut[0][i] for i in range(3)):return [box]
    core=[list(lo),list(hi)];out=[]
    for i in range(3):
        if core[0][i]<cut[0][i]:p=[list(core[0]),list(core[1])];p[1][i]=cut[0][i];out.append(p);core[0][i]=cut[0][i]
        if core[1][i]>cut[1][i]:p=[list(core[0]),list(core[1])];p[0][i]=cut[1][i];out.append(p);core[1][i]=cut[1][i]
    return out

def merge_within(cells,nx,nz,tol):
    # cells {(x, z): (low, high)} grown into rectangles whose lows and highs each stay within tol,
    # each taken at its smallest (inside the skin): [(low, high, (x0, z0, x1, z1))]
    used=set();out=[]
    for x,z in sorted(cells):
        if (x,z) in used:continue
        a0=a1=cells[(x,z)][0];b0=b1=cells[(x,z)][1]
        def fits(c):
            if c not in cells or c in used:return None
            a,b=cells[c];na0,na1,nb0,nb1=min(a0,a),max(a1,a),min(b0,b),max(b1,b)
            return (na0,na1,nb0,nb1) if na1-na0<=tol and nb1-nb0<=tol else None
        z1=z
        while True:
            f=fits((x,z1+1))
            if not f:break
            a0,a1,b0,b1=f;z1+=1
        x1=x
        while x1+1<nx:
            acc=(a0,a1,b0,b1);ok=True
            for k in range(z,z1+1):
                c=(x1+1,k)
                if c not in cells or c in used:ok=False;break
                a,b=cells[c];acc=(min(acc[0],a),max(acc[1],a),min(acc[2],b),max(acc[3],b))
                if acc[1]-acc[0]>tol or acc[3]-acc[2]>tol:ok=False;break
            if not ok:break
            a0,a1,b0,b1=acc;x1+=1
        used.update((i,k) for i in range(x,x1+1) for k in range(z,z1+1));out.append((a1,b0,(x,z,x1,z1)))
    return out

def hull_colliders(s,skins,cuts,step=.6,q=.2,exact=False,tol=0):
    # The hull's own collision for anyone outside it (EVA): solid columns under the lofted skins,
    # hollow where the ship is open to the outside (a hold behind its ramp, airlock passages, pads,
    # hangars), merged into boxes. Vessel frame: x starboard, y up, z aft. exact: the open parts
    # taken out of the merged boxes exactly (not cell by cell), and the columns at a skin's sides and
    # ends trimmed to it (not half a cell proud), for coarse cells on a big ship's hull.
    x0=min(getattr(m,'skin_x',0)-max(w for _,w,_,_ in m.stations) for m in skins)
    x1=max(getattr(m,'skin_x',0)+max(w for _,w,_,_ in m.stations) for m in skins)
    z0=min(min(st[0] for st in m.stations) for m in skins);z1=max(max(st[0] for st in m.stations) for m in skins)
    nx=int(math.ceil((x1-x0)/step));nz=int(math.ceil((z1-z0)/step))
    spans={}
    for i in range(nx):
        x=x0+(i+.5)*step;xa=x-step/2;xb=x+step/2
        for k in range(nz):
            z=z0+(k+.5)*step;za=z-step/2;zb=z+step/2
            # (the skins over this column, overlaps joined; each with how far the cell is trimmed)
            col=[]
            for m in skins:
                sp=skin_span(m,x,z)
                if not sp:continue
                trim=(None,None,None,None)
                if exact:
                    w=skin_section(m,z)[0];xo=getattr(m,'skin_x',0);st=sorted(m.stations)
                    trim=tuple(round(v/q)*q if c else None for v,c in [(xo-w,xo-w>xa),(xo+w,xo+w<xb),(st[0][0],st[0][0]>za),(st[-1][0],st[-1][0]<zb)])
                col.append((round(sp[0]/q)*q,round(sp[1]/q)*q,trim))
            col.sort(key=lambda c:(c[0],c[1]))
            # (joined skins trimmed only where both are, to the wider)
            union=lambda s1,s2:tuple(None if u is None or v is None else (min(u,v) if n%2==0 else max(u,v)) for n,(u,v) in enumerate(zip(s1,s2)))
            joined=[]
            for a,b,tr in col:
                if joined and a<=joined[-1][1]:joined[-1]=(joined[-1][0],max(joined[-1][1],b),union(joined[-1][2],tr))
                else:joined.append((a,b,tr))
            col=joined
            # (the open parts cut out of the column)
            if not exact:
                for lo,hi in cuts:
                    if not(lo[0]<=x<=hi[0] and lo[2]<=z<=hi[2]):continue
                    out=[]
                    for a,b,tr in col:
                        if b<=lo[1] or a>=hi[1]:out.append((a,b,tr));continue
                        if a<lo[1]:out.append((a,lo[1],tr))
                        if b>hi[1]:out.append((hi[1],b,tr))
                    col=out
            col=[c for c in col if c[1]-c[0]>1e-3]
            for n,(a,b,tr) in enumerate(col):
                if exact:spans.setdefault((n,tr),{})[(i,k)]=(a,b)
                else:spans.setdefault((a,b,tr),set()).add((i,k))
    boxes=[]
    rects=[(a,b,tr,r) for (a,b,tr),cells in spans.items() for r in n3_merge(cells,nx,nz)] if not exact else [(a,b,tr,r) for (n,tr),cells in spans.items() for a,b,r in merge_within(cells,nx,nz,tol)]
    for a,b,tr,(ia,ka,ib,kb) in rects:
            lo=[x0+ia*step,a,z0+ka*step];hi=[x0+(ib+1)*step,b,z0+(kb+1)*step]
            if tr[0] is not None:lo[0]=max(lo[0],tr[0])
            if tr[1] is not None:hi[0]=min(hi[0],tr[1])
            if tr[2] is not None:lo[2]=max(lo[2],tr[2])
            if tr[3] is not None:hi[2]=min(hi[2],tr[3])
            if all(hi[n]-lo[n]>1e-3 for n in range(3)):boxes.append((lo,hi))
    if exact:
        for cut in cuts:boxes=[p for bx in boxes for p in box_minus(bx,cut)]
    return [{'min':[round(v,3) for v in lo],'max':[round(v,3) for v in hi]} for lo,hi in boxes if all(hi[n]-lo[n]>1e-3 for n in range(3))]

def exterior_physics(s):
    # Every ship solid from outside, open only where it's open: a hold behind its ramp, its pads,
    # anything the ship marks open (s.open, a carrier's hangars), its flight deck's view slot, and
    # each airlock's outer door, reached by a lined passage out through the skin where the skin lies
    # beyond it. Before export, so the passages' cuts reach the skins.
    skins=[m for m in s.hab if hasattr(m,'stations')]
    if not skins or 'hullColliders' in s.t:return
    far=max(abs(v) for m in skins for st in m.stations for v in st)*2+50
    open_parts=list(s.open)
    # (a hold behind its ramp, out through the skin; the ramp's own slab closes it)
    for r in s.t['rooms']:
        for side,door in (r.get('gate') or {}).items():
            if not any(dd['id']==door and dd.get('ramp') for dd in s.t['doors']):continue
            ax={'x':0,'z':2}[side[1]];lo=list(r['min']);hi=list(r['max'])
            if side[0]=='+':hi[ax]=far
            else:lo[ax]=-far
            open_parts.append((lo,hi))
    for r in s.t['rooms']:
        if r['type']=='exterior':open_parts.append((r['min'],r['max']))
    # (the flight deck's forward view, its slot through the skin to the glass)
    r=s.rs['bridge']['r'];open_parts.append(([r['min'][0]+.25,r['min'][1]+.9,r['min'][2]-far],[r['max'][0]-.25,r['min'][1]+2.6,r['min'][2]-.1]))
    def solid(p):return inside_skins(skins,p) and not any(all(lo[i]<=p[i]<=hi[i] for i in range(3)) for lo,hi in open_parts)
    lining=s.mesh('lock_passages');passages=[]
    for e in s.t['entries']:
        if not e.get('airlock') or e.get('internal'):continue
        d=next(d for d in s.t['slideDoors'] if d['id']==e['airlock']+'-outer')
        ax=0 if d['axis']=='x' else 2;ua=2-ax;out=-e['heading'][ax];u0,u1,y0,y1=d['u0'],d['u1'],d['y0'],d['y1']
        def at(t,u,y):p=[0,y,0];p[ax]=d['plane']+out*t;p[ua]=u;return p
        # (how far out the skin goes over the door's whole opening)
        depth=0
        for n in range(1,int(far/.05)):
            t=n*.05
            if any(solid(at(t,u,y)) for u in (u0,(u0+u1)/2,u1) for y in (y0+.05,(y0+y1)/2,y1+.1)):depth=t
            elif t>depth+1:break
        lo=[0,y0-.4,0];hi=[0,y1+.3,0];lo[ua]=u0-.15;hi[ua]=u1+.15
        a,b=sorted([d['plane']-out*.3,d['plane']+out*(depth+.6)]);lo[ax]=a;hi[ax]=b;passages.append((lo,hi))
        s.t.setdefault('lockPassages',[]).append({'airlock':e['airlock'],'depth':round(depth,2)})
        if depth<.35:continue
        # (the passage: walls, floor and ceiling from the door out through the skin, lit, its skin
        # cut to its opening)
        a,b=sorted([d['plane'],d['plane']+out*(depth+.15)]);c=(a+b)/2;L=b-a
        def box(cu,cy,su,sy,mat):
            cc=[0,cy,0];cc[ax]=c;cc[ua]=cu;sz=[0,sy,0];sz[ax]=L;sz[ua]=su;lining.box(cc,sz,mat,collision=True)
        for u in (u0-.05,u1+.05):box(u,(y0+y1+.15)/2,.1,y1+.25-y0,'Wall')
        box((u0+u1)/2,y1+.2,u1-u0+.2,.1,'Ceiling');box((u0+u1)/2,y0-.05,u1-u0+.2,.1,'Floor')
        n=max(1,int(L/4))
        for i in range(n):
            cc=[0,y1+.14,0];cc[ax]=a+(i+.5)*L/n;cc[ua]=(u0+u1)/2;sz=[0,.03,0];sz[ax]=min(1.2,L/n*.6);sz[ua]=.24;lining.box(cc,sz,'LightPanel')
        clo=[0,y0-.05,0];chi=[0,y1+.2,0];clo[ua]=u0-.05;chi[ua]=u1+.05;a2,b2=sorted([d['plane']-out*.05,d['plane']+out*(depth+.4)]);clo[ax]=a2;chi[ax]=b2;s.cuts.append((clo,chi))
    if lining.polys:lining.finish()
    span=max(max(st[0] for st in m.stations) for m in skins)-min(min(st[0] for st in m.stations) for m in skins)
    step=min(3,max(.4,span/90))
    s.t['hullColliders']=hull_colliders(s,skins,open_parts+passages,step,min(step/3,.25),exact=True,tol=min(1,step*.3))
    # (the skins and what's open in them, for the hull's tests: x offset, stations (z, half-width, low, high))
    s.t['skins']=[{'x':getattr(m,'skin_x',0),'stations':[list(st) for st in sorted(m.stations)]} for m in skins]
    s.t['hullOpen']=[{'min':[round(v,3) for v in lo],'max':[round(v,3) for v in hi]} for lo,hi in open_parts+passages]
    s.t['hullStep']=round(step,3)

def finish_neptune3(s):
    s.finish_serial=0;s.t['fixtures']=[];s.t['stations']=[];s.t['walkTargets']=[]
    def target(id,room,pos):s.t['walkTargets'].append({'id':id,'room':room,'pos':list(pos)})
    def actual_room(p):
        return next((r['id'] for r in s.t['rooms'] if r['type'] not in ['door','exterior'] and all(r['min'][i]-.01<=p[i]<=r['max'][i]+.01 for i in range(3))),'commons')
    def station(id,room,kind,name,pos):
        s.t['stations'].append({'id':id,'room':room,'kind':kind,'label':name,'pos':list(pos),'reach':1.15});target(id,room,pos)
    for args in [('parents',-1,-7.0,3.1),('kids-a',1,-8.8,2.3),('kids-b',1,-4.5,2.2)]:n3_lineage_window(s,*args)
    basis=json.loads(Path(os.environ.get('NEPTUNE2_BASIS',str(Path(globals().get('__file__','/Users/dave/dev/starseed/tools/blender/build_horizon.py')).with_name('neptune2-interior-basis.json')))).read_text())
    mapping={'deck':'commons','partitions':'commons','ceilings':'commons','family_commons':'commons','hub_lounge':'commons','washrooms':'wash','suit_prep':'suits','mechanical':'mechanical','engine_bays':'garage','cockpit':'bridge','garage_fittings':'garage'}
    for record in basis['objects']:
        name=record['name']
        if name=='berths':continue
        m=s.mesh('neptune2_'+name,room=mapping[name])
        for face in record['faces']:
            pts=[n3_from2(record['vertices'][i]) for i in face['vertices']];mat=face['material'];mat={'Console':'Metal','Trim':'Metal'}.get(mat,mat)
            if name=='partitions' and all(abs(x)<2 and -12.3<z<-9.0 for x,y,z in pts):continue
            if name=='partitions':pts=n3_expand_cabin_wall(pts)
            if name=='ceilings' and all(abs(x)>5.8 and -10.87<=z<=-2.3 for x,y,z in pts):continue
            # Let the bridge airlock occupy the unused forward port corner; slide the galley back one metre.
            if name=='family_commons' and sum(p[0] for p in pts)/len(pts)<-5.5:pts=[(x,y,z+1.0) for x,y,z in pts]
            if name=='family_commons' and all(p[0]<-6.6 and -10.5<p[2]<-8.5 for p in [record['vertices'][i] for i in face['vertices']]):pts=[(x+1.7,y,-12.45+(z+11.26)*.38) for x,y,z in pts]
            if name=='washrooms' and max(p[1] for p in pts)<.111 and min(p[1] for p in pts)>=0:mat='Floor'
            if name=='garage_fittings' and sum(p[2] for p in pts)/len(pts)>20 and max(abs(p[0]) for p in pts)>3:
                pts=[((1 if old[0]>0 else -1)*4.65+(old[0]-(3.8 if old[0]>0 else -3.8))*.62,q[1],q[2]) for old,q in zip([record['vertices'][i] for i in face['vertices']],pts)]
            # The flight deck sits forward in the nose, under the canopy.
            # (its steps down to the lounge stay where they were; the deck between is filled below)
            if name=='cockpit' and sum(p[2] for p in pts)/len(pts)<-19.0:pts=[(x,y,z+N3_COCKPIT_FORWARD) for x,y,z in pts]
            m.face(pts,mat)
        if name=='partitions':
            for r in s.rs.values():
                for lo,hi in r.get('windows',[]):m.cut(lo,hi)
        if name in ['partitions','ceilings']:
            for id in ['bridge-eva-inner','bridge-eva-outer','door-kids-b']:
                door=next(d for d in s.t['slideDoors'] if d['id']==id);ax=0 if door['axis']=='x' else 2;ua=2 if ax==0 else 0;lo=[-50,0,-50];hi=[50,door['y1']+.15,50];lo[ax]=door['plane']-.25;hi[ax]=door['plane']+.25;lo[ua]=door['u0'];hi[ua]=door['u1'];m.cut(lo,hi)
        if name=='deck':
            for id in ['bridge-eva','suit-eva','parents','kids-a','kids-b']:
                r=s.rs[id]['r'];m.cut([r['min'][0],-.5,r['min'][2]],[r['max'][0],.1,r['max'][2]])
        if name=='partitions':s.lineage_partitions=m
        m.finish(ceiling=name=='ceilings')
    # New partitions only where the later model adds privacy or pressure isolation.
    m=s.mesh('lineage_new_bulkheads',room='commons')
    r=s.rs['suit-eva']['r'];lo,hi=r['min'],r['max'];m.box(((lo[0]+hi[0])/2,-.075,(lo[2]+hi[2])/2),(hi[0]-lo[0],.15,hi[2]-lo[2]),'Floor')
    m.box((10.864,1.625,-6.62),(9.872,3.25,.10),'Wall')
    for id in ['bridge-eva','garage-lock']:
        r=s.rs[id]['r'];lo,hi=r['min'],r['max']
        m.box(((lo[0]+hi[0])/2,-.075,(lo[2]+hi[2])/2),(hi[0]-lo[0],.15,hi[2]-lo[2]),'Floor') if id=='bridge-eva' else None
        for axis in [0,2]:
            ua=2 if axis==0 else 0
            for sign in [-1,1]:
                side=('-' if sign<0 else '+')+('x' if axis==0 else 'z');plane=(lo if sign<0 else hi)[axis]
                if id=='garage-lock' and (axis==0 or sign>0):continue
                cuts=s.rs[id]['holes'].get(side,[]);edges=sorted(set([lo[ua],hi[ua]]+[u for a,b,h in cuts for u in [a,b]]))
                for a,b in zip(edges,edges[1:]):
                    low=max([h for aa,bb,h in cuts if aa<(a+b)/2<bb]or[0]);c=[0,(low+hi[1])/2,0];sz=[0,hi[1]-low,0];c[axis]=plane;c[ua]=(a+b)/2;sz[axis]=.1;sz[ua]=b-a;m.box(c,sz,'Wall')
    m.finish()
    # The suit airlock's outer bulkhead, round its door; and both outer doors' passages out through
    # the skin, lined (the hull's void showed through them)
    m=s.mesh('n3_lock_passages',room='suit-eva')
    for d in s.t['slideDoors']:
        if d['id'] not in ['bridge-eva-outer','suit-eva-outer']:continue
        r=s.rs[d['rooms'][0]]['r'];x=d['plane'];u0,u1,y1=d['u0'],d['u1'],d['y1']
        if d['id']=='suit-eva-outer':
            for a,b in [(r['min'][2],u0),(u1,r['max'][2])]:m.box((x,r['max'][1]/2,(a+b)/2),(.1,r['max'][1],b-a),'Wall')
            m.box((x,(y1+r['max'][1])/2,(u0+u1)/2),(.1,r['max'][1]-y1,u1-u0),'Wall')
        skin_x=-n3_hull_half(s.hab[0].stations,(u0+u1)/2)-.2
        depth=x-skin_x;cx=(x+skin_x)/2
        for z in [u0-.05,u1+.05]:m.box((cx,(y1+.15)/2,z),(depth,y1+.15,.1),'Wall')
        m.box((cx,y1+.2,(u0+u1)/2),(depth,.1,u1-u0+.2),'Ceiling');m.box((cx,-.05,(u0+u1)/2),(depth,.1,u1-u0+.2),'Floor')
    m.finish()
    # Replace the old stacked bunks with five full-size single beds, in two cabins.
    for room,spots in [('parents',[(-9.0,-6.6,1.9)]),('kids-a',[(7.2,-9.45,1.05),(9.4,-9.45,1.05),(11.6,-9.45,1.05)]),('kids-b',[(7.6,-3.8,1.1),(10.7,-3.8,1.1)])]:
        m=s.mesh('lineage_bed_storage_'+room,room=room)
        for x,z,w in spots:
            berth_bed(s,room,x,z,width=w);m.box((x,1.0,z-1.14),(w+.13,.9,.08),'Fabric')
            target(room+'-bed-'+str(x),room,[x+1.1 if x<9 else x-1.1,0,z] if room=='kids-b' else [x,0,z+1.65])
        if room=='parents':
            m.box((-11.6,1.15,-3.2),(1.1,2.3,.7),'Wood');m.box((-7.2,.74,-3.2),(1.4,.10,.7),'Wood');n3_screen(m,(-7.2,1.04,-3.22),.64,.38,-1);n3_chair(s,room,-7.2,-4.15,[0,0,1],'Study chair')
        else:
            z=-6.97 if room=='kids-a' else -6.23
            m.box((11.95,1.12,z),(.9,2.24,.6),'Wood')
            m.box((7.2,.76,z),(1.8,.10,.65),'Wood');n3_screen(m,(7.2,1.06,z),.72,.4,1 if room=='kids-b' else -1)
        m.finish()
    n3_accommodation_geometry(s)
    berth_bed(s,'guest',-10.4,-14.8,width=1.1)
    target('guest-bed','guest',[-10.4,0,-13.15])
    for id,room,pos in [('parents-window','parents',[-14.8,0,-6]),('kids-a-window','kids-a',[13.4,0,-9.4]),('kids-b-window','kids-b',[13.4,0,-3.4]),('docking-vestibule','bridge-eva',[-11.6,0,-17.85]),('lounge-center-fore','commons',[0,0,-12])]:target(id,room,pos)
    # Seats on the inherited seven-place dinette and the curved hub benches are usable.
    dining=[(3.65,11.45,(0,0,-1)),(4.5,11.45,(0,0,-1)),(5.35,11.45,(0,0,-1)),(2.95,12.55,(1,0,0)),(2.95,13.55,(1,0,0)),(6.05,12.55,(-1,0,0)),(6.05,13.55,(-1,0,0))]
    for x,z,heading in dining:
        pos=n3_from2((x,-1.1,-z));stand=[pos[0]-heading[0]*.85,0,pos[2]-heading[2]*.85]
        s.t['seats'].append({'pos':pos,'eye':[pos[0],1.34,pos[2]],'stand':stand,'heading':heading,'label':'Family dining seat','room':actual_room(pos)})
    for side in [-1,1]:
        for z in [-11.05,-10.1]:
            x=side*2.68;s.t['seats'].append({'pos':[x,0,z],'eye':[x,1.34,z],'stand':[side*3.65,0,z],'heading':[-side,0,0],'label':'Hub lounge seat','room':'commons'})
    n3_chair(s,'commons',5.13,-17.55,[0,0,1],'Guest dining seat')
    # Existing cockpit geometry, correctly placed at its raised floor.
    for side in [-1,1]:
        x=side*1.425;z=-21.764+N3_COCKPIT_FORWARD;s.t['seats'].insert(0 if side<0 else 1,{'pilot':side<0,'pos':[x,.6,z],'eye':[x,1.86,z-.15],'stand':[x,.6,z+1.05],'heading':[0,0,-1],'label':'Pilot seat' if side<0 else 'Co-pilot seat','room':'bridge'})
    # (the deck's floor carried back to the lounge where the cockpit moved forward)
    m=s.mesh('n3_flight_deck_floor',room='bridge');m.box((0,.525,-21.1),(5.928,.15,4.4),'Floor');m.finish()
    # Family planning table, sample analysis and garage controls keep the playable refit.
    m=s.mesh('lineage_exploration_stations',room='commons')
    for x,z,room in [(0,-5.1,'commons'),(3.65,2.6,'mechanical'),(4.2,12.6,'garage'),(2.05,-19.95,'bridge')]:
        f=.6 if room=='bridge' else 0;m.box((x,f+.48,z),(1.25,.96,.58),'Wood');n3_screen(m,(x,f+1.23,z),.92,.47,-1 if room=='bridge' else 1)
    m.finish()
    station('family-atlas','commons','atlas','Family expedition atlas',[0,0,-4.1])
    station('survey-lab','mechanical','survey','Survey analysis bench',[3.65,0,3.6])
    station('garage-control','garage','garage','Runabout bay controls',[3.8,0,13.6])
    station('bridge-survey','bridge','survey','Exploration console',[2.05,.6,-20.75])
    for id,room,p in [('galley','commons',[-4.95,0,-14.3]),('wash-basins','wash',[-3.4,0,-.1]),('toilet','wash',[-6.55,0,.65]),('shower','wash',[-3.55,0,2.2]),('suit-racks','suits',[-5.0,0,9.4]),('runabout-boarding','garage',[-1.9,0,18.9]),('ramp-exit','garage',[-3.7,0,24]),('ring-port','commons',[-4.0,0,-10.64]),('ring-starboard','commons',[4.0,0,-10.64]),('ring-aft','commons',[0,0,-7.0]),('ring-forward','commons',[0,0,-15.0]),('engine-port','engine-port',[-6.35,0,15.6]),('engine-starboard','engine-starboard',[6.35,0,15.6])]:target(id,room,p)
    # Lighting and shallow trim retain the circular hub rather than creating box-room ceilings.
    m=s.mesh('lineage_hub_trim',room='commons')
    for i in range(48):
        a=i*math.tau/48;b=(i+1)*math.tau/48
        m.face([(r*math.cos(q),.02,-10.64+r*math.sin(q)) for r,q in [(4.92,a),(4.96,a),(4.96,b),(4.92,b)]],'LightPanel')
    m.finish()
    for r in s.t['rooms']:
        if r['type'] in ['door','exterior']:continue
        lo,hi=r['min'],r['max'];s.t['lights'].append({'room':r['id'],'pos':[(lo[0]+hi[0])/2,hi[1]-.2,(lo[2]+hi[2])/2],'color':0xffe0c4,'intensity':14,'range':14})
    s.t['interiorFinish']='neptune2-accommodation-v2';s.t['interiorFeatures']=['neptune2-radial-plan','open-circular-lounge','curved-lounge','eight-berths-four-bedrooms','five-single-child-beds','seven-dining-seats','survey-stations','three-airlocks','forward-docking-vestibule','runabout-bay-controls']
    s.t['help']='Neptune 3 · Neptune 2 family layout · F seats / airlocks / exploration consoles · R ramp · Y runabout restraint'
    s.root['interior_finish']='Neptune 2 layout / enlarged family cabins, guest bedroom, forward docking / 2026-10-06'
    # A wraparound canopy: the hull over the flight deck's front in glass, following the skin, from
    # just over the consoles up and round the nose (the old letterbox window sat 6 m ahead of the pilot)
    canopy=([-10,1.35,-28.2],[10,7,N3_CANOPY_AFT])
    glass=s.mesh('n3_canopy',room='bridge')
    for poly,mat,paint in s.hab[0].polys:
        inside=poly
        for a in range(3):
            if inside:inside=half(inside,a,canopy[0][a],True)
            if inside:inside=half(inside,a,canopy[1][a],False)
        if inside:glass.face(inside,'Glass')
    glass.finish()
    s.rs['bridge'].setdefault('windows',[]).append(canopy);s.cuts.append(canopy)
    # Continuous inner pressure-shell lining: the exterior is deliberately single-sided.
    liner=s.mesh('lineage_inner_shell')
    for poly,mat,paint in s.hab[0].polys:
        liner.face(list(reversed([(x*.995,y-.10 if y>0 else y+.10,z*.998) for x,y,z in poly])),'Ceiling')
    for r in s.rs.values():
        for lo,hi in r.get('windows',[]):liner.cut(lo,hi)
    liner.cut(*canopy)
    for d in s.t['slideDoors']:
        if d['id'] in ['bridge-eva-outer','suit-eva-outer']:liner.cut([-22,0,d['u0']],[d['plane']+.2,d['y1']+.15,d['u1']])
    exit_cut=([-4.85,-.04,24.8],[4.85,4.85,30]);s.cuts.append(exit_cut);liner.cut(*exit_cut)
    liner.finish(interior=True,ceiling=True)
    # EVA's hull: solid but for the garage behind its ramp and the airlocks' outer recesses
    garage=s.rs['garage']['r'];open_parts=[exit_cut,([garage['min'][0],garage['min'][1],garage['min'][2]],[garage['max'][0],garage['max'][1],30])]
    for d in s.t['slideDoors']:
        if d['id'] in ['bridge-eva-outer','suit-eva-outer']:
            open_parts.append(([-22,-.4,d['u0']-.15],[d['plane']+.3,d['y1']+.3,d['u1']+.15]))
    s.t['hullColliders']=hull_colliders(s,[s.hab[0]],open_parts)
    s.t['skins']=[{'x':0,'stations':[list(st) for st in sorted(s.hab[0].stations)]}];s.t['hullStep']=.6
    s.t['hullOpen']=[{'min':[round(v,3) for v in lo],'max':[round(v,3) for v in hi]} for lo,hi in open_parts]
    # These shared architectural meshes span several rooms; do not cull them as a single room's furniture.
    for suffix in ['neptune2_deck','neptune2_partitions','neptune2_ceilings','lineage_new_bulkheads','lineage_exploration_stations','accommodation_floors','accommodation_ceilings','expanded_cabin_storage']:
        ob=s.scene.objects.get(s.key+':'+suffix)
        if ob and 'room_id' in ob:del ob['room_id']
    s.room_geometry=lambda:n3_lineage_collision(s)

# NEPTUNE 3: develops the approved Neptune 2 circular family layout.
s=Ship('neptune3','Neptune 3',145_000,8,56)
skin(s,'oval_family_hull',[(-28,4,-1,3.6),(-24,9,-1.6,5),(-18,15,-2.2,6.3),(-8,17,-2.5,6.5),(12,16,-2,6.3),(23,12,-1.5,5.4),(27,8,-1,4.8)])
n3_lineage_rooms(s)
pad(s,'Dorsal scout terrace',0,-1,15,18,6.8)
for side in [-1,1]:pod(s,side*12,1.4,15,28,1.8)
s.legs([(-10,-.4,-19),(10,-.4,-19),(-10,-.4,20),(10,-.4,20)],2.35)
s.t['thrust'].update(main=4,belly=2.5,retro=1.2,lateral=1);SHIPS.append(s)

# CRADLE: high arch, two-person camper, open lateral cargo path, recessed field pods.
s=Ship('cradle','Cradle',44_000,2,30)
skin(s,'forward_cabin',[(-15,3,-.7,4),(-12,4.8,-1,5.8),(-8,5,-.6,5.1),(-4.5,4,-.3,4.6)])
bridge(s,-14.2,-9.1,2.7);cabin(s,'crew','Two-person living cabin',[-2.7,0,-9.1],[2.7,3.2,-4.8],'cabin');s.door('crew-door','bridge','crew','z',-9.1,0,1.4)
berth_bed(s,'crew',1.75,-7.1,0,.85);berth_bed(s,'crew',1.75,-7.1,1.1,.85)
m=s.mesh('camper_services',room='crew');m.box((-2.3,.48,-8.3),(.55,.96,1),'Wall',solid=True);m.box((-1.9,.35,-5.5),(.55,.70,.65),'Wall',solid=True);m.box((-1.45,1.2,-5.5),(.06,2.4,1.25),'Wall',solid=True);m.finish()
s.airlock('bridge',[-5.3,0,-13.7],[-2.7,3.2,-10.5],'x',-2.7,-5.3,-12.1,door=(1.6,2.4))
skin(s,'arched_service_spine',[(-5,2,3.4,5.1),(-1,1.8,5.3,7.5),(6,1.8,5.5,7.9),(11,2.0,3.5,6),(14.5,2.1,3.2,4.5)])
skin(s,'aft_mechanical_hull',[(10,2,.2,4.5),(13,3,-.4,5.2),(15,2,.2,4)])
m=s.mesh('pod_supports')
for side in [-1,1]:
 for z in [-8.2,11.6]:
  m.beam((side*2,3.5,z),(side*7.6,1.7,z),.26);pod(s,side*8,1.7,z-3.1,z+3.1,.9)
m.finish();s.legs([(-4.8,-.2,-10),(4.8,-.2,-10),(-4.8,-.2,12),(4.8,-.2,12)],1.0)
s.t['clamp']={'name':'Open carrier sling','pos':[0,.6,2.2],'reach':[1.6,1.3,2.4],'fits':[11,4.8,10.5]};s.t['thrust'].update(main=4,belly=3.5,retro=1,lateral=1.5);SHIPS.append(s)

# SHOREBIRD: passenger lander with separated flight cabin, cargo bay and broad ramp.
s=Ship('shorebird','Shorebird',56_000,6,25)
skin(s,'civilian_lifting_body',[(-12.5,2.3,-.5,3.8),(-10,5,-.9,4.6),(-6,7,-1.1,5),(-1,8,-1.3,5.5),(6,8,-1.1,5.4),(10.5,6,-.7,4.8)])
bridge(s,-11.8,-7.2,3);cabin(s,'cabin','Four-place passenger cabin',[-3.2,0,-7.2],[3.2,3.2,-2.7],'cabin');s.door('cabin-door','bridge','cabin','z',-7.2,0,1.4)
for x in [-1.9,1.9]:
 for z in [-6,-4.3]:s.seat('cabin',x,0,z)
s.airlock('bridge',[-6,0,-11],[-3,3.2,-7.8],'x',-3,-6,-9.4,'bridge-eva',door=(1.6,2.4))
cabin(s,'garage','Surface operations bay',[-4.8,0,.3],[4.8,4.8,10],'bay');garage_lock(s,'cabin','garage',-2.7,.3,door=(1.6,2.4));cargo_ramp(s,'garage',10,8.5,4.7)
s.t['clamp']={'name':'Exploration vehicle restraint','pos':[0,1.8,5],'reach':[1.2,1,2],'fits':[8.5,4.6,8.8]};s.t['zones'].append({'name':'Vehicle bay','kind':'hold','min':[-4.6,.01,.4],'max':[4.6,4.65,10],'gravity':9.81,'pressure':0,'door':'ramp','snug':True})
for side in [-1,1]:pod(s,side*7,1.3,1,12.5,1.1)
s.legs([(-5,-.2,-8),(5,-.2,-8),(-5,-.2,8),(5,-.2,8)],1.30,mounts=False);s.t['thrust'].update(main=5,belly=4,lateral=1.5,retro=1.5);SHIPS.append(s)

# LARK: two-person survey launch with cabin access, short-range supplies and sensor fins.
s=Ship('lark','Lark',13_000,2,14)
skin(s,'survey_hull',[(-7,1.8,-.4,3),(-5.5,3.4,-.7,4.1),(-2,4.0,-.8,4.5),(3,3.8,-.8,4.2),(5.5,2.3,-.4,3.4)])
bridge(s,-6.5,1.8,2.0);s.airlock('bridge',[-1.25,0,1.8],[1.25,3.2,5.0],'z',1.8,5,0,door=(1.6,2.4))
for side in [-1,1]:
 pod(s,side*3.4,.6,3,7,.65)
 m=s.mesh('sensor_fin_'+str(side));m.face([(side*3,1,-1),(side*4.8,1.2,.5),(side*4.5,1.2,2.8),(side*3,1,3)],'Hull',1,normal=(0,1,0));m.face([(side*3,.9,3),(side*4.5,1.1,2.8),(side*4.8,1.1,.5),(side*3,.9,-1)],'Hull',normal=(0,-1,0));m.box((side*4.4,1.22,1.5),(.35,.10,1),'Screen');m.finish()
s.legs([(-2.7,-.3,-4),(2.7,-.3,-4),(-2.7,-.3,4),(2.7,-.3,4)],.8);s.t['thrust'].update(main=5,belly=3,retro=2,lateral=2);SHIPS.append(s)

# DRIFT: broad lower chine, continuous canopy, short aft field pods; no armament.
s=Ship('drift','Drift',5_000,2,7.8)
skin(s,'arrowhead_scout',[(-3.9,1.15,-.35,2.7),(-2.9,2.7,-.6,3.2),(-.8,3.15,-.7,3.5),(1.9,3.4,-.6,3.35),(3.6,2.9,-.3,3.0)])
bridge(s,-3.6,.5,1.3);s.airlock('bridge',[-1.15,0,.5],[1.15,2.65,3.4],'z',.5,3.4,0,door=(1.4,2.2))
for r in s.t['rooms']:
 if r['type']!='door':r['max'][1]=2.65
for side in [-1,1]:pod(s,side*3.5,.50,.2,3.9,.48)
s.legs([(-2.6,-.25,-2.3),(2.6,-.25,-2.3),(-2.6,-.25,2.7),(2.6,-.25,2.7)],.60);s.t['cargo']={'offset':[0,-.85,0]};s.t['thrust'].update(main=1.2,belly=2,retro=.8,lateral=.8);SHIPS.append(s)

for s in SHIPS:
 if s.t.get('ramps'):
  ground=-(min(p[1] for p in s.t['legAttach'])-s.t['legLength']+.12)
  for ramp in s.t['ramps']:
   angle=math.acos(-ground/ramp['length'])
   for door in s.t['doors']:
    if door['id']==ramp['door']:door['angle']=angle
   for part in s.t['parts']:
    if part.get('door')==ramp['door']:part['angle']=angle
 s.t['era']='Horizon';s.t['ftl']=True;s.t['interiorGravity']='artificial';s.t['combatEnabled']=False;s.t['help']='Horizon exploration fleet · artificial gravity · F seats and airlocks · R ramps · Y cargo clamp'
 s.root['era']='Horizon';s.root['artificial_gravity']=True
 z0=s.rs['bridge']['r']['min'][2];r=s.rs['bridge']['r'];s.cuts.append(([r['min'][0]+.25,r['min'][1]+.9,z0-2000],[r['max'][0]-.25,r['min'][1]+2.6,z0+.5]))
 for room in s.t['rooms']:
  if room['type'] not in ['door','exterior']:s.cuts.append(([v-.015 for v in room['min']],[v+.015 for v in room['max']]))
 if s.key=='horizon_neptune3':finish_neptune3(s)
 else:finish_dress(s)
 exterior_physics(s)
TYPES={s.key:s.export() for s in SHIPS}
(OUT/'manifest.json').write_text(json.dumps(TYPES,indent=2));(OUT/'horizon.data.js').write_text('// Generated Horizon fleet. Metres, X right, Y up, -Z forward.\nexport const HORIZON_TYPES = '+json.dumps(TYPES,separators=(',',':'))+';\n')
bpy.ops.wm.save_as_mainfile(filepath=str(OUT.parent/'starseed-complete.blend'),copy=True,compress=True)
print('HORIZON_DONE',json.dumps({k:{'size':t['size'],'rooms':len(t['rooms']),'crew':t['crewCapacity']} for k,t in TYPES.items()}))
