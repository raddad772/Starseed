"""Deterministic Expedition fleet assets. Author in game metres: X right, Y up, Z aft.
Run inside Blender; output directory comes from EXPEDITION_OUT (default /tmp/starseed-expedition).
Owns only scenes named 'Expedition - ...'. Existing fleet scenes are preserved.
"""
import bpy, math, json, os, hashlib
from pathlib import Path
from mathutils import Vector, Matrix

OUT=Path(os.environ.get('EXPEDITION_OUT','/tmp/starseed-expedition'));OUT.mkdir(parents=True,exist_ok=True)
G=lambda p:Vector((p[0],-p[2],p[1]))
COLORS={'Hull':(.25,.39,.47), 'Metal':(.12,.15,.16), 'Wall':(.64,.63,.55), 'Floor':(.19,.22,.22), 'Ceiling':(.56,.57,.53), 'Fabric':(.27,.36,.34), 'Wood':(.34,.25,.17), 'Glass':(.075,.15,.19), 'Screen':(.12,.49,.53), 'LightPanel':(.95,.80,.57), 'EngineGlow':(.30,.56,.8), 'Hazard':(.68,.30,.095), 'Rubber':(.04,.045,.05), 'Radiator':(.12,.17,.19), 'Plant':(.16,.34,.15), 'HullSecondary':(.78,.75,.65), 'HullStripe':(.70,.47,.17)}
MATS={}
for name,c in COLORS.items():
 m=bpy.data.materials.get('Expedition_'+name) or bpy.data.materials.new('Expedition_'+name);m.use_nodes=True;m.diffuse_color=(*c,1);p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(*c,1);p.inputs['Metallic'].default_value=.35 if name in ['Hull','Metal'] else .05;p.inputs['Roughness'].default_value=.48 if name=='Hull' else .7
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

class Ship:
 def __init__(self,key,name,mass,crew,length,big=False):
  self.key='expedition_'+key;self.name=name
  sn='Expedition - '+name;old=bpy.data.scenes.get(sn)
  if old:
   for o in list(old.objects):
    if o.get('asset_id')==self.key:bpy.data.objects.remove(o,do_unlink=True)
   bpy.data.scenes.remove(old)
  self.scene=bpy.data.scenes.new(sn);bpy.context.window.scene=self.scene;self.scene.unit_settings.system='METRIC';self.col=bpy.data.collections.new(sn+' / model');self.scene.collection.children.link(self.col);self.root=bpy.data.objects.new(self.key,None);self.col.objects.link(self.root);self.root['asset_id']=self.key;self.root['era']='Expedition';self.root['crew_capacity']=crew;self.root['artificial_gravity']=False
  self.t={'key':self.key,'className':name+' — Expedition '+{'longreach':'carrier','crosscurrent':'service tender','hearth':'family explorer','porter':'cargo lifter','kestrel':'surface lander','moth':'survey scout','skimmer':'atmospheric scout'}[key],'era':'Expedition','fleetAsset':True,'model':'assets/models/expedition/'+key+'.glb','template':self.key,'big':big,'seatOnly':not big,'ftl':bool(big),'interiorGravity':'natural','crewCapacity':crew,'mass':mass,'I':[mass*length*length/12,mass*length*length/12,mass*length*length/48],'thrust':{'main':.08 if big else .35,'retro':.03 if big else .15,'belly':.02 if big else 1.5,'down':.01 if big else .12,'lateral':.015 if big else .15},'alpha':[.025,.025,.04] if big else [.4,.4,.6],'rate':[.06,.06,.09] if big else [.3,.3,.5],'hullRating':50,'aero':{'cd':[length*2,length*4,length],'wing':0},'livery':{'main':'#658c9e','second':'#d3ccaf','stripe':'#cda34e'},'colliders':[],'solids':[],'rooms':[],'seats':[],'lights':[],'slideDoors':[],'doors':[],'parts':[],'zones':[],'airlocks':[],'engines':[],'entries':[],'probes':[],'hatches':[],'ports':[]}
  self.rs={};self.builders=[];self.hab=[];self.cuts=[];self.serial=0
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
 def airlock(self,host,lo,hi,innerAxis,innerPlane,outerPlane,u,id='eva'):
  r=self.room(id,'EVA airlock',lo,hi,'airlock',airlock=id);ax=0 if innerAxis=='x' else 2;sign=1 if outerPlane>innerPlane else -1
  self.door(id+'-inner',host,id,innerAxis,innerPlane,u,1.1,2.15,id);self.door(id+'-outer',id,None,innerAxis,outerPlane,u,1.1,2.15,id)
  r['open']=[('+' if sign>0 else '-')+innerAxis];r['gate']={r['open'][0]:id+'-outer'}
  inside=[(lo[i]+hi[i])/2 for i in range(3)];inside[1]=lo[1];outside=inside.copy();outside[ax]=outerPlane+sign*.85
  panels=[]
  for role,plane,off in [('inner',innerPlane,-sign*.45),('outer',outerPlane,sign*.45)]:
   p=inside.copy();p[ax]=plane+off;p[1]+=1.2;p[2 if ax==0 else 0]=u+.70;panels.append({'side':role,'pos':p})
  mid=inside.copy();mid[1]+=1.2;mid[2 if ax==0 else 0]=u+.70
  panels.extend([{'side':'inner','pos':mid},{'side':'outer','pos':[mid[0],mid[1]+.32,mid[2]]}])
  self.t['airlocks'].append({'id':id,'inner':id+'-inner','outer':id+'-outer','room':id,'cycleSeconds':5,'panels':panels})
  self.t['entries'].append({'label':'EVA airlock','outside':outside,'inside':inside,'heading':[-sign,0,0] if ax==0 else [0,0,-sign],'airlock':id})
  m=self.mesh('lock_fittings_'+id,room=id);cx=(lo[0]+hi[0])/2;cz=(lo[2]+hi[2])/2
  for p in panels:m.box(p['pos'],[.15,.20,.12],'Screen')
  # shallow equipment lockers kept against the long side, clear of the door-to-door line
  if ax==0:m.box((cx,lo[1]+1.02,hi[2]-.22),(.62,2.04,.35),'Hull',1,solid=True)
  else:m.box((hi[0]-.23,lo[1]+1.02,cz),(.35,2.04,.62),'Hull',1,solid=True)
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
   m.finish()
   count=max(1,math.ceil((hi[2]-lo[2])/7))
   for i in range(count):
    self.t['lights'].append({'room':id,'pos':[(lo[0]+hi[0])/2,hi[1]-.20,lo[2]+(i+.5)*(hi[2]-lo[2])/count],'color':0xffe0b8,'intensity':18,'range':max(8,min(18,hi[2]-lo[2]+2))})
   lp=self.mesh('light_'+id,room=id);lp.box(((lo[0]+hi[0])/2,hi[1]-.025,(lo[2]+hi[2])/2),(.28,.04,min(2,hi[2]-lo[2]-.2)),'LightPanel');lp.finish()
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
  finish_dress(self)
  self.room_geometry();bpy.context.view_layer.update();obs=[o for o in self.scene.objects if o.type=='MESH'];pts=[o.matrix_world@v.co for o in obs for v in o.data.vertices];game=[(p.x,p.z,-p.y) for p in pts];lo=[min(p[i] for p in game) for i in range(3)];hi=[max(p[i] for p in game) for i in range(3)];self.t['bounds']=[lo,hi];self.t['size']=[hi[i]-lo[i] for i in range(3)];self.t['radius']=max(Vector(p).length for p in game)
  candidates=set()
  for bx in self.t['colliders']:
   for x in [bx['min'][0],bx['max'][0]]:
    for y in [bx['min'][1],bx['max'][1]]:
     for z in [bx['min'][2],bx['max'][2]]:candidates.add(tuple(round(v,3) for v in (x,y,z)))
  self.t['probes']=[list(p) for p in sorted(candidates)[::max(1,len(candidates)//100)]]
  self.t['probeK']=self.t['mass']*9.81/.12;self.t['probeC']=2*.7*math.sqrt(self.t['probeK']*self.t['mass']/4)
  self.t.setdefault('help','Expedition: no artificial gravity'+(' · J FTL' if self.t['ftl'] else ' · no FTL')+' · F seats/airlocks · R cycles back inside · Space/C translate in freefall · X brakes')
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
  self.scene.frame_set(1);bpy.context.view_layer.update();self.root['game_manifest']=json.dumps(self.t)
  bpy.ops.object.select_all(action='DESELECT')
  for o in self.scene.objects:o.select_set(True)
  path=OUT/(self.key.removeprefix('expedition_')+'.glb');kw=dict(filepath=str(path),export_format='GLB',use_selection=True,use_active_scene=True,export_yup=True,export_extras=True,export_animations=False,export_apply=True)
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

# Expedition B: shaped, serviced pressure hulls; no AG / armament; carriers and tenders use standard FTL.
SHIPS=[]
def capsule(s,name,stations,x=0):
 m=s.mesh(name);m.loft(stations)
 if x:m.polys=[([(p[0]+x,p[1],p[2]) for p in ps],mat,idx) for ps,mat,idx in m.polys]
 s.hab.append(m);return m

def lifting_hull(s,stations):
 # Twelve-point section: faceted belly keel, broad lower chine, crowned roof.
 m=s.mesh('lifting_body');rings=[]
 crowns={'Hearth':.65,'Kestrel':.8,'Moth':.65,'Skimmer':.40}
 for z,w,low,high in stations:
  h=high-low;c=crowns[s.name]
  if s.name=='Hearth' and -8<=z<=4.8:c=.32
  ring=[(0,low,z),(.7*w,low+.07*h,z),(w,low+.23*h,z),(.90*w,low+.57*h,z),(.69*w,high,z),(.34*w,high+c*.85,z),(0,high+c,z),(-.34*w,high+c*.85,z),(-.69*w,high,z),(-.90*w,low+.57*h,z),(-w,low+.23*h,z),(-.7*w,low+.07*h,z)]
  rings.append(ring)
 m.face(rings[0],'Hull',normal=(0,0,-1));m.face(rings[-1],'Hull',normal=(0,0,1))
 for n,(a,b) in enumerate(zip(rings,rings[1:])):
  for i in range(12):
   j=(i+1)%12;pts=[a[i],a[j],b[j],b[i]];center=(Vector(a[i])+Vector(a[j]))/2;center.y-=(stations[n][2]+stations[n][3])/2
   mat='Glass' if s.name in ['Moth','Skimmer'] and n<2 and i in range(3,9) else 'Hull'
   m.face(pts,mat,1 if i in [0,11] else 0,normal=(center.x,center.y,0))
 s.hab.append(m);return m

def fairing(s,name,stations,x=0,paint=0,collision=True):
 m=s.mesh(name);m.loft(stations,'Hull',paint,n=12)
 if x:m.polys=[([(p[0]+x,p[1],p[2]) for p in ps],mat,idx) for ps,mat,idx in m.polys]
 if collision:
  for a,b in zip(stations,stations[1:]):
   w=max(a[1],b[1]);s.t['colliders'].append({'min':[x-w,min(a[2],b[2]),a[0]],'max':[x+w,max(a[3],b[3]),b[0]]})
 m.finish();return m

def bridge(s,z0,z1,w=2.7):
 s.room('bridge','Flight cabin',[-w,0,z0],[w,2.8,z1],'bridge');s.furniture('bridge','bridge');s.seat('bridge',-min(.85,w-.55),0,z0+1.35,True);s.seat('bridge',min(.85,w-.55),0,z0+1.35)
 s.front_window(z0,-w+.3,w-.3,1.0,1.35,room='bridge')

def sleeping(s,id,n):
 r=s.rs[id]['r'];lo,hi=r['min'],r['max'];m=s.mesh('sleep_'+id,room=id)
 # Two-level sleep alcoves, individual reading lamps, tall personal lockers.
 for i in range(n):
  row=i//4;side=-1 if (i//2)%2==0 else 1;level=i%2;x=lo[0]+.9 if side<0 else hi[0]-.9;z=lo[2]+1.25+row*2.45;y=lo[1]+.45+level*1.02
  m.box((x,y,z),(.95,.18,2.1),'Fabric',solid=True);m.box((x,y+.12,z-.77),(.7,.12,.43),'Wall');m.box((x,y+.65,z-.92),(.1,.13,.1),'LightPanel');m.box((x,y+.15,z),(.95,.03,.07),'Hazard')
 m.box(((lo[0]+hi[0])/2,lo[1]+1.1,hi[2]-.25),(max(.6,hi[0]-lo[0]-2.8),2.2,.36),'Hull',1,solid=True);m.finish();r['berths']=n

def living(s,z0,z1,w,crew):
 bridge(s,z0,z0+5,3.2)
 s.room('passage','Axial freefall passage',[-1,0,z0+5],[1,2.8,z1],'corridor');s.door('bridge-passage','bridge','passage','z',z0+5,0,1.4)
 depth=(z1-z0-5)/4
 specs=[('port_berths','Port sleeping cabins','sleep',(crew+1)//2),('stbd_berths','Starboard sleeping cabins','sleep',crew//2),('mess','Galley / shared dining','galley',0),('wash','Washroom / laundry','hygiene',0),('lab','Survey laboratory','lab',0),('med','Medical / isolation','medical',0),('lounge','Reading / exercise / VR','lounge',0),('stores','Expedition support','engineering',0)]
 for i,(id,name,kind,n) in enumerate(specs):
  side=-1 if i%2==0 else 1;za=z0+5+(i//2)*depth;zb=za+depth;xa,xb=(-w,-1) if side<0 else (1,w)
  s.room(id,name,[xa,0,za],[xb,2.8,zb], 'quarters' if kind=='sleep' else 'mess' if kind=='galley' else kind)
  s.door('to-'+id,'passage',id,'x',side,(za+zb)/2,1.3)
  if kind=='sleep':sleeping(s,id,n)
  elif kind=='lounge':
   m=s.mesh('lounge',room=id);m.box((xa+.65,.55,za+1.8),(.8,1.1,2.4),'Fabric',solid=True);m.box((xb-.45,1.1,zb-1),(.5,2.2,1.3),'Hull',1,solid=True);m.box((xa+.2,1.4,zb-1.4),(.15,.8,1.1),'Screen');m.finish()
  else:s.furniture(id,kind)

def berth(s,id,x,z,w,length,y):
 m=s.mesh('cradle_'+id);m.box((x,y-.18,z),(w,.36,length),'Metal',collision=True)
 for xx in [x-w/2+.3,x+w/2-.3]:m.box((xx,y+.025,z),(.17,.05,length-.5),'Hazard')
 for zz in [z-length/2+.35,z+length/2-.35]:m.box((x,y+.025,zz),(w-.5,.05,.17),'Hazard')
 for xx in [x-w/2+.5,x+w/2-.5]:m.box((xx,y+.08,z),(.25,.08,.8),'LightPanel')
 m.finish();s.t['zones'].append({'name':id,'kind':'pad','min':[x-w/2,y,z-length/2],'max':[x+w/2,y+12,z+length/2],'gravity':'host','pressure':0,'pad':[x,y,z]})

def radiator(s,side,z0,z1,x0,x1,y,tilt=.35):
 m=s.mesh('radiator_'+str(s.serial));s.serial+=1
 # Inboard lower edge and lifted tip: purposeful wing-like thermal panels.
 a=(side*x0,y,z0);b=(side*x1,y+(x1-x0)*tilt,z0);c=(side*x1,y+(x1-x0)*tilt,z1);d=(side*x0,y,z1)
 m.face([a,b,c,d],'Radiator',normal=[0,1,0]);m.face([d,c,b,a],'Radiator',normal=[0,-1,0])
 for v,u in [(a,b),(b,c),(c,d),(d,a)]:m.beam(v,u,.09)
 for j in range(1,8):
  z=z0+(z1-z0)*j/8;m.beam((side*x0,y+.05,z),(side*x1,y+(x1-x0)*tilt+.05,z),.035)
 m.finish()

def axial_pods(s,x,y,z0,z1,r):
 for side in [-1,1]:
  m=s.mesh('drive_housing_'+str(side));m.cyl((side*x,y,z0),(side*x,y,z1-2*r),r,'Hull',1,n=12,collision=True);m.cyl((side*x,y,z0-r*.5),(side*x,y,z0),r*.65,'Hull',r1=r,n=12);m.finish();s.engine((side*x,y,z1-2*r),(side*x,y,z1),r*.8)

def jets(s,points,r=.3):
 for x,y,z in points:s.engine((x,y+.5,z),(x,y,z),r)

def sensors(s,x,y,z):
 m=s.mesh('survey_instruments',lod=1);m.beam((x,y,z),(x,y+1.0,z),.055);m.box((x,y+1,z),(.7,.45,.6),'Wall');m.cyl((x,y+1,z-.3),(x,y+1,z-.45),.2,'Screen',n=10);m.finish()

def ramp(s,room,z,w,f=0,h=3.4,id='ramp'):
 r=s.rs[room]['r'];r['open']=['+z'];r['gate']={'+z':id};s.hole(room,'+z',0,w,h)
 s.cuts.append(([-w/2,f-.03,z-.8],[w/2,f+h+.03,z+.8]));m=s.mesh('ramp_'+id);m.box((0,f+h/2,z+.07),(w,h,.14),'Hull',1)
 for i in range(1,9):m.box((0,f+h*i/9,z-.02),(w-.2,.08,.07),'Metal')
 m.finish(pivot=(0,f,z));s.t['parts'].append({'node':m.name,'door':id,'axis':[1,0,0],'angle':2.05})
 s.t['doors'].append({'id':id,'label':'Cargo ramp','ramp':True,'min':[-w/2,f,z],'max':[w/2,f+h,z+.14],'hinge':[f,z],'angle':2.05,'speed':.4,'panel':[w/2+.5,f+1.2,z+.5],'panelIn':[w/2-.6,f+1.2,z-1]})
 s.t.setdefault('ramps',[]).append({'door':id,'width':w,'hinge':[f,z],'length':h})
 s.t['solids'].append({'min':[-w/2,f,z-.06],'max':[w/2,f+h,z+.14],'door':id,'kind':'door'})

def garage_lock(s,host,garage,z0,z1):
 s.airlock(host,[-1.25,0,z0],[1.25,2.8,z1],'z',z0,z1,0,'garage-lock')
 a=s.t['airlocks'][-1];a['outerRoom']=garage;s.t['entries'][-1]['internal']=True
 d=s.t['slideDoors'][-1];d['rooms']=['garage-lock',garage];s.hole(garage,'-z',0,1.1,2.15)
 s.t['rooms'].append({'id':'garage-lock-link','name':'Garage pressure doorway','type':'door','min':[-.55,0,z1-.5],'max':[.55,2.15,z1+.5]})

# LONGREACH: a continuous dorsal keel, clustered bow pressure modules, four cradles.
s=Ship('longreach','Longreach',5_400_000,32,280,True)
living(s,-137,-79,11,32)
capsule(s,'central_pressure_bow',[(-140,4.2,-1.6,4.7),(-135,9,-3,7),(-123,10.2,-4.4,10),(-109,10.2,-4.8,12),(-95,9.7,-3.8,9),(-80,9,-3,7),(-73,6,-2,5)])
for x in [-8,8]:capsule(s,'bow_capsule_'+str(x),[(-132,5.5,-2.3,6),(-126,7,-3.6,7.2),(-117,7.6,-5.6,10.2),(-102,7.2,-4.1,8.2),(-93,7.4,-5,9.1),(-85,7,-3.6,7.2),(-78,4.5,-2,5)],x)
s.room('service','Dorsal service passage',[-1.2,0,-79],[1.2,2.8,100],'corridor');s.door('service-link','passage','service','z',-79,0,1.4)
capsule(s,'dorsal_keel',[(-79,4,-2,6),(-68,5.5,-2.5,7),(-57,5.8,-4.5,10.5),(-28,4.8,-2.5,7),(-12,5.8,-5,11.5),(12,4.8,-2.5,7.5),(33,5.8,-4.5,12),(53,5.5,-2.5,7),(72,5.8,-5,11),(96,5.5,-2.5,7),(109,4,-2,6)])
s.room('engineering','Main engineering',[-6.8,0,100],[6.8,2.8,117],'engineering');s.door('engineering-link','service','engineering','z',100,0,1.4);s.furniture('engineering','engineering')
capsule(s,'aft_machinery',[(92,10,-5,9),(101,13,-7.5,14),(111,13,-6,12),(120,13,-4,8)])
s.airlock('bridge',[-10.5,0,-136],[-3.2,2.8,-133],'x',-3.2,-10.5,-134.5,'bridge-eva')
for side in [-1,1]:
 for j,z in enumerate([-42,18]):
  id=('port' if side<0 else 'starboard')+'-'+str(j+1)
  berth(s,id,side*24,z,17,27,-2.5)
  lo,hi=sorted([side*1.2,side*14.8]);s.room('access-'+id,'Cradle service corridor',[lo,0,z-1.5],[hi,2.8,z+1.5],'corridor');s.door('gate-'+id,'service','access-'+id,'x',side*1.2,z,1.3)
  capsule(s,'covered_arm_'+id,[(z-1.6,abs(hi-lo)/2,-.3,3.2),(z+1.6,abs(hi-lo)/2,-.3,3.2)],(lo+hi)/2)
  a,b=sorted([side*14.8,side*17.8]);s.airlock('access-'+id,[a,0,z-1.5],[b,2.8,z+1.5],'x',side*14.8,side*17.8,z,id+'-lock')
  m=s.mesh('cradle_brace_'+id);m.beam((side*4,-1.5,z-8),(side*24,-2.9,z-8),.35);m.beam((side*4,-1.5,z+8),(side*24,-2.9,z+8),.35);m.finish()
 radiator(s,side,54,107,13,39,4,.42)
axial_pods(s,9,1.6,113,140,5.6);sensors(s,2.5,7,-102);s.t['thrust'].update(main=.10,retro=.035,belly=.025,lateral=.015)
SHIPS.append(s)

# CROSSCURRENT: two walkable pressure spines surrounding a genuinely empty center.
s=Ship('crosscurrent','Crosscurrent',1_300_000,16,140,True)
living(s,-68.8,-40,8.5,16)
capsule(s,'forward_pressure_cluster',[(-70,3.8,-1.5,4.5),(-66,11,-3,6),(-48,11,-3,6),(-40,22,-2,5),(-34,22,-2,5)])
s.room('forecross','Forward cross passage',[-19.2,0,-40],[19.2,2.8,-34],'corridor');s.door('forecross-link','passage','forecross','z',-40,0,1.4)
s.room('engineering','Aft engineering cross passage',[-19.2,0,43],[19.2,2.8,51],'engineering');capsule(s,'aft_engine_module',[(42,22,-4,7),(54,22,-4,7),(60,17,-3,6)])
for side in [-1,1]:
 id='port-spine' if side<0 else 'stbd-spine';x=side*18
 s.room(id,'Pressure spine / service access',[x-1.2,0,-34],[x+1.2,2.8,43],'corridor');s.door('forward-'+id,'forecross',id,'z',-34,x,1.4);s.door('aft-'+id,id,'engineering','z',43,x,1.4)
 capsule(s,id,[(-34,3.8,-2,5),(43,3.8,-2,5)],x)
 for j,z in enumerate([-21,20]):
  lo,hi=sorted([x-side*1.2,x-side*4.1]);s.airlock(id,[lo,0,z-1.5],[hi,2.8,z+1.5],'x',x-side*1.2,x-side*4.1,z,id+'-eva-'+str(j))
  berth(s,id+' cradle '+str(j+1),side*8,z,11.6,21,-2.8)
  m=s.mesh('service_collar_'+id+str(j));m.beam((x,-1,z),(side*8,-3.1,z),.20);m.finish()
 radiator(s,side,20,52,22,34,2,.4)
s.furniture('engineering','engineering')
s.airlock('bridge',[-11.5,0,-67.5],[-3.2,2.8,-64.5],'x',-3.2,-11.5,-66,'bridge-eva')
axial_pods(s,14,1.5,55,70,3.5);sensors(s,5,5.7,-54);s.t['thrust'].update(main=.12,belly=.045,lateral=.025)
SHIPS.append(s)

# HEARTH: seven berths, family commons, independent EVA lock, unpressurized garage.
s=Ship('hearth','Hearth',76_000,7,32)
lifting_hull(s,[(-16,4.9,-.65,3.8),(-14,6.6,-.9,4.45),(-11,9.3,-1.45,4.8),(-8,10,-1.6,4.3),(-4,10.4,-1.45,4.3),(4.8,10.4,-1.5,4.3),(7,10.4,-1.6,4.7),(10,9.5,-1.3,5.6),(13,7.5,-.85,4.7)])
bridge(s,-15.8,-11.7,3.1);s.room('passage','Family cabin passage',[-.9,0,-11.7],[.9,2.8,0],'corridor');s.door('flight-link','bridge','passage','z',-11.7,0,1.3)
for id,name,lo,hi,kind,n in [
 ('parents','Parents cabin',[-7,0,-11.7],[-.9,2.8,-6.1],'sleep',2),('kids','Five children / sleeping alcoves',[.9,0,-11.7],[7,2.8,-6.1],'sleep',5),
 ('commons','Galley / family dining',[-7,0,-6.1],[-.9,2.8,0],'galley',0),('wash','Shower / toilet',[.9,0,-6.1],[7,2.8,-3.0],'hygiene',0),('mechanical','Life support / mechanical bay',[.9,0,-3],[7,2.8,0],'engineering',0)]:
 s.room(id,name,lo,hi,'quarters' if kind=='sleep' else kind);s.door('to-'+id,'passage',id,'x',-.9 if lo[0]<0 else .9,(lo[2]+hi[2])/2,1.2)
 if kind=='sleep':sleeping(s,id,n)
 else:s.furniture(id,kind)
s.airlock('bridge',[-8.8,0,-15],[-3.1,2.8,-12],'x',-3.1,-8.8,-13.5,'bridge-eva')
s.room('garage','Belly rover garage',[-4.6,0,2.8],[4.6,4.5,12.8],'bay',vacuum=True);garage_lock(s,'passage','garage',0,2.8);ramp(s,'garage',12.8,8.2,0,4.3)
s.t['zones'].append({'name':'Rover garage','kind':'hold','min':[-4.5,.01,2.9],'max':[4.5,4.4,12.8],'gravity':'host','pressure':0,'door':'ramp','snug':True,'exitMargin':.8})
s.t['clamp']={'name':'Garage rover restraint','pos':[0,1.94,7.6],'reach':[1.2,.9,2],'fits':[8.4,4.3,7.2]}
berth(s,'Dorsal scout cradle',0,-1.2,11.4,13,5.0)
axial_pods(s,8.5,1.2,8,16,1.45);jets(s,[(x,-.8,z) for x in [-7,7] for z in [-8,8]],.48)
s.legs([(-7,-.6,-10),(7,-.6,-10),(-7,-.6,10),(7,-.6,10)],1.3)
s.t['thrust'].update(main=.32,belly=1.5,lateral=.06,retro=.09);s.t['aero'].update(cd=[35,120,28],wing=90);sensors(s,7.8,3.5,-4)
SHIPS.append(s)

# PORTER: four axial rocket pods pivot between horizontal burn and vertical lift.
s=Ship('porter','Porter',28_000,2,22)
s.habitat([(-11,2.5,-.15,3.8),(-9.5,3.2,-.6,4.6),(-7.5,3.7,-1.0,5.4),(-5,3.5,-.75,4.5),(-3.3,3.4,-.4,4.1)])
bridge(s,-10.8,-6.5,2.2);s.airlock('bridge',[-5,0,-10],[-2.2,2.8,-7],'x',-2.2,-5,-8.5)
s.room('crew','Two-person rest / service cabin',[-2.2,0,-6.5],[2.2,2.8,-3.5],'cabin',berths=2);s.door('crew-link','bridge','crew','z',-6.5,0,1.2)
m=s.mesh('camper_fittings',room='crew')
for y in [.48,1.5]:m.box((1.42,y,-5),(.85,.16,2.1),'Fabric',solid=True);m.box((1.42,y+.12,-5.75),(.65,.12,.45),'Wall');m.box((1.42,y+.12,-5),(.9,.04,.08),'Hazard')
m.box((-1.72,.48,-5.65),(.65,.96,1.0),'Hull',1,solid=True);m.box((-1.72,1.0,-5.65),(.68,.08,1.05),'Metal')
m.box((-1.45,.36,-4.15),(.56,.72,.68),'Wall',solid=True);m.box((-1.02,1.12,-4.22),(.06,2.24,1.0),'Fabric',solid=True);m.finish()
fairing(s,'arched_load_spine',[(-4.9,1.85,3.1,4.3),(-1,1.65,3.6,5.9),(2,1.5,4.1,6.5),(5,1.65,3.6,5.8),(8,2,3.1,5),(10.7,1.4,3.1,4.1)])
fairing(s,'aft_service_bustle',[(7.15,1.55,.0,3.5),(8.5,2.25,-.35,4.6),(9.7,2.25,-.2,4.1),(10.85,1.4,.2,3.3)],paint=1)
# Transverse trunnion axes pass through the nominal balanced pod centres.
# Swept arms remain inboard of the pod sweep; fixed bearings meet rotating sleeves.
m=s.mesh('spine_pod_yokes')
for anchor_z,z in [(-3.8,-5.9),(8.5,7.3)]:
 for side in [-1,1]:
  m.beam((0,4.05,anchor_z),(side*3.75,3.5,z),.21)
  m.beam((side*3.75,3.5,z),(side*6.08,1.5,z),.21)
  m.cyl((side*6.02,1.5,z),(side*6.36,1.5,z),.43,'Metal',n=12,collision=True)
  m.cyl((side*6.0,1.5,z),(side*6.07,1.5,z),.33,'Hull',2,n=12)
m.finish();s.t['vectorPods']={'rate':.65}
s.t['enginePivots']=[]
for side in [-1,1]:
 for j,z in enumerate([-5.9,7.3]):
  pivot=(side*7.2,1.5,z);m=s.mesh('rocket_pod_'+str(side)+'_'+str(j));m.cyl((pivot[0],1.5,z-2.4),(pivot[0],1.5,z+1.7),.83,'Hull',1,n=12,collision=False);m.cyl((pivot[0],1.5,z-2.85),(pivot[0],1.5,z-2.4),.5,'Hull',r1=.83,n=12);m.cyl((pivot[0],1.5,z+1.7),(pivot[0],1.5,z+2.7),.35,'Metal',r1=.75,n=16,caps=False);m.cyl((pivot[0],1.5,z+1.73),(pivot[0],1.5,z+1.78),.34,'EngineGlow',n=12);m.cyl((side*6.32,1.5,z),(side*6.78,1.5,z),.29,'Metal',n=12);m.finish(pivot=pivot,nominal_mass_center=list(pivot),mount_axis=[1,0,0]);s.t['parts'].append({'node':m.name,'channel':'podTilt','axis':[1,0,0],'angle':math.pi/2})
  s.t['engines'].append([pivot[0],1.5,z+2.7,.75]);s.t.setdefault('engineAxes',[]).append([0,0,1]);s.t['enginePivots'].append(list(pivot))
  # Static conservative rotational envelope, clear of the central side exit.
  s.t['colliders'].append({'min':[pivot[0]-.9,-1.4,z-2.90],'max':[pivot[0]+.9,4.4,z+2.90]})
s.legs([(-4.5,-.7,-6),(4.5,-.7,-6),(-4.5,-.7,8),(4.5,-.7,8)],2.3)
s.t['clamp']={'name':'Open sling / lateral departure','pos':[0,.02,.65],'reach':[1.5,1.2,2],'fits':[8.5,4.3,7.4]};s.t['thrust'].update(main=.65,belly=1.65,lateral=.1,retro=.08)
sensors(s,1.6,4.2,-7);SHIPS.append(s)

# KESTREL: rear cargo access and a real isolated flight cabin.
s=Ship('kestrel','Kestrel',32_000,4,18)
lifting_hull(s,[(-9,3.7,-.45,3.5),(-7,4.8,-.8,4.3),(-4.5,5.4,-1.0,4.5),(-2.1,5.2,-.85,4.1),(.7,5.5,-1.1,4.8),(3.4,5.7,-1.1,5.5),(5.8,5.2,-.9,5.3),(7.5,5.0,-.6,4.8)])
bridge(s,-8.8,-4.9,2.5);s.room('cabin','Crew / compact galley',[-2.5,0,-4.9],[2.5,2.8,-2.1]);s.door('crew-door','bridge','cabin','z',-4.9,0,1.3)
s.seat('cabin',-1.4,0,-4.0);s.seat('cabin',1.4,0,-4.0)
s.room('garage','Rear payload bay',[-3.5,0,.7],[3.5,4.35,7.4],'bay',vacuum=True);garage_lock(s,'cabin','garage',-2.1,.7);ramp(s,'garage',7.4,6.4,0,4.25)
s.airlock('bridge',[-5.3,0,-8.0],[-2.5,2.8,-5.0],'x',-2.5,-5.3,-6.5,'bridge-eva')
s.t['zones'].append({'name':'Cargo bay','kind':'hold','min':[-3.4,.01,.8],'max':[3.4,4.3,7.4],'gravity':'host','pressure':0,'door':'ramp','snug':True,'exitMargin':.8})
s.t['clamp']={'name':'Rover restraint','pos':[0,2.18,3.9],'reach':[1,.8,1.6],'fits':[4,4.2,5.8]}
m=s.mesh('stub_wings')
for side in [-1,1]:
 pts=[(side*3.5,.7,-1.8),(side*6.9,.7,.6),(side*6.4,.7,5.6),(side*3.5,.7,6.2)];m.face(pts,'Hull',normal=[0,1,0]);m.face([(x,y-.25,z) for x,y,z in reversed(pts)],'Hull',1,normal=[0,-1,0]);m.beam((side*3.5,.6,1),(side*6.4,.6,3),.18)
m.finish();axial_pods(s,5.6,1.1,-1.2,9,1.0);jets(s,[(x,-.7,z) for x in [-3.6,3.6] for z in [-4,4]],.43);s.legs([(-3.8,-.5,-5),(3.8,-.5,-5),(-3.8,-.5,5.4),(3.8,-.5,5.4)],1.1)
s.t['thrust'].update(main=.55,belly=1.7,lateral=.12,retro=.15);s.t['aero'].update(cd=[16,40,12],wing=40);SHIPS.append(s)

# MOTH: compact, wrap-glazed scientific shuttle with room to stand and suit up.
s=Ship('moth','Moth',8_800,2,11)
lifting_hull(s,[(-5.5,2.6,-.4,3.05),(-4.1,3.2,-.7,3.85),(-2.5,3.6,-.9,4.3),(-.4,3.3,-.85,3.75),(1.4,3.2,-.75,3.55),(2.6,3.1,-.65,3.9),(3.7,2.5,-.35,3.3)])
bridge(s,-5.3,.7,1.65);s.airlock('bridge',[-1.1,0,.7],[1.1,2.8,3.6],'z',.7,3.6,0)
# Side panes, separated by structural mullions, continue the front glazing.
for side in [-1,1]:
 lo,hi=sorted([side*1.45,side*3.5]);s.cuts.append(([lo,1.05,-4.2],[hi,2.45,-1.1]));s.rs['bridge'].setdefault('windows',[]).append(([lo,1.05,-4.2],[hi,2.45,-1.1]));m=s.mesh('side_glass_'+str(side));m.box((side*1.69,1.75,-2.65),(.025,1.4,3.1),'Glass');m.finish()
axial_pods(s,2.7,.75,2.5,5.5,.64);jets(s,[(x,-.5,z) for x in [-2.2,2.2] for z in [-2.7,2.8]],.24)
s.legs([(-2.3,-.4,-2.8),(2.3,-.4,-2.8),(-2.3,-.4,2.6),(2.3,-.4,2.6)],.8);sensors(s,2.4,3.0,-.4);s.t['thrust'].update(main=.35,belly=1.4,lateral=.1,retro=.12);s.t['aero'].update(cd=[6,16,5],wing=13);s.t['cargo']={'offset':[0,-1.3,0]};SHIPS.append(s)

# SKIMMER: atmosphere-only fans in short housings, a broad bottom-flared arrowhead.
s=Ship('skimmer','Skimmer',3_500,2,6.8)
lifting_hull(s,[(-3.4,1.8,-.2,2.6),(-2.4,2.65,-.45,2.72),(-.9,2.95,-.6,2.86),(.8,3.0,-.55,2.68),(2.1,2.65,-.4,2.65),(3.3,2.1,-.2,2.6)])
bridge(s,-3.2,.6,1.15);s.airlock('bridge',[-1.05,0,.6],[1.05,2.8,3.15],'z',.6,3.15,0)
for r in s.t['rooms']:
 if r['type']!='door':r['max'][1]=2.4
for side in [-1,1]:
 for j,z in enumerate([-1.65,1.65]):
  x=side*2.85;m=s.mesh('fan_housing_'+str(side)+'_'+str(j));m.cyl((x,.3,z),(x,.85,z),.83,'Hull',1,n=16,caps=False,collision=True);m.cyl((x,.35,z),(x,.8,z),.61,'Metal',n=16,caps=False);m.finish()
  m=s.mesh('fan_rotor_'+str(side)+'_'+str(j));m.cyl((x,.48,z),(x,.55,z),.16,'Metal',n=12)
  for a in range(6):
   th=a*math.tau/6;pts=[(x+rr*math.cos(th+off),.53,z+rr*math.sin(th+off)) for rr,off in [(.16,0),(.60,.1),(.60,.40),(.16,.35)]];m.face(pts,'Metal',normal=[0,1,0]);m.face(list(reversed(pts)),'Metal',normal=[0,-1,0])
  m.finish(pivot=(x,.53,z));s.t['parts'].append({'node':m.name,'channel':'fan','axis':[0,1,0],'direction':side*(-1 if j else 1)})
s.legs([(-2.1,-.3,-2.4),(2.1,-.3,-2.4),(-2.1,-.3,2.4),(2.1,-.3,2.4)],.55)
s.t['atmosphericThrust']={'referenceDensity':1.225};s.t['thrust'].update(main=.16,retro=.16,belly=1.55,down=0,lateral=.12);s.t['alpha']=[.5,.5,.6];s.t['aero'].update(cd=[4,9,4],wing=0);s.t['cargo']={'offset':[0,-.94,0]};s.t['help']='Atmosphere-only surface scout · fan thrust falls with air density · sealed cabin / EVA lock · no vacuum flight';m=s.mesh('flush_survey_camera');m.box((-1.5,2.4,-2.3),(.4,.3,.3),'Screen');m.finish();SHIPS.append(s)

for s in SHIPS:
 if s.t.get('ramps'):
  height=-(min(p[1] for p in s.t['legAttach'])-s.t['legLength']+.12)
  for ramp_spec in s.t['ramps']:
   angle=math.acos(-height/ramp_spec['length'])
   for d in s.t['doors']:
    if d['id']==ramp_spec['door']:d['angle']=angle
   for part in s.t['parts']:
    if part.get('door')==ramp_spec['door']:part['angle']=angle
 z0=s.rs['bridge']['r']['min'][2];x0,x1=s.rs['bridge']['r']['min'][0]+.3,s.rs['bridge']['r']['max'][0]-.3
 s.cuts.append(([x0,1.0,z0-4],[x1,2.35,z0+.5]))
 # Remove buried skin where pressure modules intersect occupied rooms.
 for r in s.t['rooms']:
  if r['type']!='door':s.cuts.append(([v-.015 for v in r['min']],[v+.015 for v in r['max']]))

# Distinct role-specific volumes above and below the pressure shells.
for s in SHIPS:
 if s.name=='Longreach':
  for side in [-1,1]:
   fairing(s,'aft_thermal_shoulder_'+str(side),[(91,1.8,6,8),(98,3.3,8,16),(108,3.0,9,17.5),(119,1.5,6.5,9)],side*8.5,1)
   fairing(s,'ventral_service_keel_'+str(side),[(-69,1,-2.5,-1),(-51,1.8,-7,-2),(-30,1.8,-6,-2),(-17,1,-3,-1)],side*2.9,1)
 elif s.name=='Hearth':
  for side in [-1,1]:
   fairing(s,'sculpted_side_shoulder_'+str(side),[(-10.7,.45,3.6,4.5),(-7.5,1.05,3.8,5.9),(-2,1.15,4.0,6.5),(3.5,1.1,3.9,5.7),(6.2,.5,3.8,4.9)],side*7.25,1)
   fairing(s,'belly_runner_'+str(side),[(-10,.35,-.8,-.5),(-7,.65,-1.65,-.8),(3,.65,-1.55,-.8),(8,.35,-1.0,-.6)],side*4.8,1)
 elif s.name=='Kestrel':
  for side in [-1,1]:
   fairing(s,'engine_shoulder_'+str(side),[(-1,.35,2.1,2.9),(1.5,.7,2.0,4.5),(5,.8,2,4.9),(7,.4,1.5,2.7)],side*5.8,1)
   fairing(s,'ventral_chine_'+str(side),[(-6,.25,-.7,-.45),(-3,.55,-1.25,-.7),(4,.6,-1.25,-.6),(6,.3,-.7,-.45)],side*2.6,1)
 elif s.name=='Moth':
  for side in [-1,1]:
   fairing(s,'scout_aft_ridge_'+str(side),[(.3,.25,2.8,3.2),(1.7,.45,2.9,4.8),(3.4,.3,2.4,3.4)],side*2.6,1)
   fairing(s,'ventral_sensor_cheek_'+str(side),[(-3,.18,-.5,-.3),(-1.5,.5,-1.05,-.5),(1.2,.4,-.9,-.4),(2.4,.18,-.5,-.25)],side*1.5,1)
 elif s.name=='Skimmer':
  # Scalloped body sockets leave the fan discs and their intake paths unobstructed.
  for side in [-1,1]:
   for z in [-1.65,1.65]:
    a,b=sorted([side*2.02,side*3.75]);s.cuts.append(([a,-.75,z-.79],[b,3.5,z+.79]))
    wall=s.mesh('fan_recess_backing_'+str(side)+'_'+str(z));wall.box((side*2.00,1.30,z),(.07,2.55,1.58),'Metal',collision=True)
    for zz in [z-.79,z+.79]:
     wall.face([(side*2.0,.05,zz),(side*2.72,.35,zz),(side*2.55,1.55,zz),(side*2.0,2.60,zz)],'Metal',normal=(0,0,-1 if zz<z else 1))
    wall.finish()
   fairing(s,'lower_skid_cheek_'+str(side),[(-2.7,.15,-.4,-.15),(-1.0,.33,-.68,-.3),(1.2,.34,-.65,-.3),(2.7,.15,-.4,-.15)],side*1.55,1)

# Glazing follows the sculpted scout skin, with the inner cabin pane retained.
for s in SHIPS:
 if s.name!='Moth':continue
 glass=s.mesh('flush_outer_side_glazing')
 for side in [-1,1]:
  a,b=sorted([side*1.44,side*3.8]);lo=[a,1.05,-4.2];hi=[b,2.45,-1.1]
  for hull in s.hab:
   for poly,mat,idx in hull.polys:
    q=poly
    for axis in range(3):
     if q:q=half(q,axis,lo[axis],True)
     if q:q=half(q,axis,hi[axis],False)
    if q:
     normal=(Vector(poly[1])-Vector(poly[0])).cross(Vector(poly[2])-Vector(poly[0])).normalized();glass.face([Vector(p)+normal*.02 for p in q],'Glass')
 glass.finish()

# Sparse service panels follow the actual skin rather than floating above the ship.
for s in SHIPS:
 for i,hull in enumerate(s.hab):
  m=s.mesh('service_panels_'+str(i),lod=1)
  for j,(poly,mat,idx) in enumerate(hull.polys):
   if mat!='Hull' or len(poly)!=4 or j%4:continue
   center=sum((Vector(p) for p in poly),Vector())/len(poly);normal=(Vector(poly[1])-Vector(poly[0])).cross(Vector(poly[2])-Vector(poly[0])).normalized()
   pts=[center+(Vector(p)-center)*.78+normal*.025 for p in poly];m.face(pts,'Hull',1 if j%5 else 2)
  # Cut pressure door and window openings through their decorative covers too.
  for lo,hi in s.cuts:m.cut(lo,hi)
  m.finish()
 s.t['help']=s.t.get('help','Expedition · natural gravity / freefall · F seats and airlocks · R cargo ramp / return to cabin · Y clamp · G gear')+(' · J FTL' if s.t['ftl'] else '')

TYPES={s.key:s.export() for s in SHIPS}
(OUT/'expedition.data.js').write_text('// Generated by tools/blender/build_expedition.py. Metres, X right, Y up, -Z forward.\nexport const EXPEDITION_TYPES = '+json.dumps(TYPES,separators=(',',':'))+';\n')
(OUT/'manifest.json').write_text(json.dumps(TYPES,indent=2))
old=bpy.data.scenes.get('Expedition - Fleet overview')
if old:bpy.data.scenes.remove(old)
sc=bpy.data.scenes.new('Expedition - Fleet overview');bpy.context.window.scene=sc;sc.unit_settings.system='METRIC'
for s,offset in zip(SHIPS,[(0,0,0),(105,0,-18),(157,0,-102),(186,0,-102),(207,0,-102),(229,0,-102),(244,0,-102)]):
 col=bpy.data.collections.new('Expedition overview / '+s.name);sc.collection.children.link(col);mapping={}
 for ob in s.scene.objects:
  c=ob.copy();col.objects.link(c);mapping[ob]=c;c.animation_data_clear()
 for ob,c in mapping.items():
  c.parent=mapping.get(ob.parent)
  if ob.parent is None:c.location+=G(offset)
for a in bpy.context.screen.areas:
 if a.type=='VIEW_3D':
  sp=a.spaces.active;sp.clip_end=10000;sp.shading.type='SOLID';sp.shading.color_type='MATERIAL';sp.region_3d.view_distance=420;sp.region_3d.view_location=G((70,0,-20));sp.region_3d.view_rotation=__import__('mathutils').Euler((math.radians(60),0,math.radians(25)),'XYZ').to_quaternion()
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'starseed-expedition.blend'),copy=True,compress=True)
print('EXPEDITION_DONE',json.dumps({k:{'size':v['size'],'rooms':len(v['rooms']),'crew':v['crewCapacity']} for k,v in TYPES.items()}))
