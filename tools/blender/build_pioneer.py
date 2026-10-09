"""Deterministic Pioneer fleet assets. Author in game metres: X right, Y up, Z aft.
Run inside Blender; output directory comes from PIONEER_OUT (default /tmp/starseed-pioneer).
Owns only scenes named 'Pioneer - ...'. Existing fleet scenes are preserved.
"""
import bpy, math, json, os, hashlib
from pathlib import Path
from mathutils import Vector, Matrix

OUT=Path(os.environ.get('PIONEER_OUT','/tmp/starseed-pioneer'));OUT.mkdir(parents=True,exist_ok=True)
G=lambda p:Vector((p[0],-p[2],p[1]))
COLORS={'Hull':(.69,.67,.59), 'Metal':(.12,.15,.16), 'Wall':(.64,.63,.55), 'Floor':(.19,.22,.22), 'Ceiling':(.56,.57,.53), 'Fabric':(.27,.36,.34), 'Wood':(.34,.25,.17), 'Glass':(.075,.15,.19), 'Screen':(.12,.49,.53), 'LightPanel':(.95,.80,.57), 'EngineGlow':(.30,.56,.8), 'Hazard':(.68,.30,.095), 'Rubber':(.04,.045,.05), 'Radiator':(.12,.17,.19), 'Plant':(.16,.34,.15), 'HullSecondary':(.20,.24,.25), 'HullStripe':(.69,.31,.095)}
MATS={}
for name,c in COLORS.items():
 m=bpy.data.materials.get('Pioneer_'+name) or bpy.data.materials.new('Pioneer_'+name);m.use_nodes=True;m.diffuse_color=(*c,1);p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(*c,1);p.inputs['Metallic'].default_value=.35 if name in ['Hull','Metal'] else .05;p.inputs['Roughness'].default_value=.48 if name=='Hull' else .7
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
  self.key='pioneer_'+key;self.name=name
  sn='Pioneer - '+name;old=bpy.data.scenes.get(sn)
  if old:
   for o in list(old.objects):
    if o.get('asset_id')==self.key:bpy.data.objects.remove(o,do_unlink=True)
   bpy.data.scenes.remove(old)
  self.scene=bpy.data.scenes.new(sn);bpy.context.window.scene=self.scene;self.scene.unit_settings.system='METRIC';self.col=bpy.data.collections.new(sn+' / model');self.scene.collection.children.link(self.col);self.root=bpy.data.objects.new(self.key,None);self.col.objects.link(self.root);self.root['asset_id']=self.key;self.root['era']='Pioneer';self.root['crew_capacity']=crew;self.root['artificial_gravity']=False
  self.t={'key':self.key,'className':name+' — Pioneer '+{'caravan':'expedition carrier','anchor':'service tender','nomad':'family explorer','gantry':'cargo lifter','hopper':'surface lander','firefly':'survey scout','trail':'rover'}[key],'era':'Pioneer','fleetAsset':True,'model':'assets/models/pioneer/'+key+'.glb','template':self.key,'big':big,'seatOnly':not big,'ftl':bool(big),'interiorGravity':'natural','crewCapacity':crew,'mass':mass,'I':[mass*length*length/12,mass*length*length/12,mass*length*length/48],'thrust':{'main':.08 if big else .35,'retro':.03 if big else .15,'belly':.02 if big else 1.5,'down':.01 if big else .12,'lateral':.015 if big else .15},'alpha':[.025,.025,.04] if big else [.4,.4,.6],'rate':[.06,.06,.09] if big else [.3,.3,.5],'hullRating':50,'aero':{'cd':[length*2,length*4,length],'wing':0},'livery':{'main':'#b8b2a0','second':'#424c4e','stripe':'#b9682f'},'colliders':[],'solids':[],'rooms':[],'seats':[],'lights':[],'slideDoors':[],'doors':[],'parts':[],'zones':[],'airlocks':[],'engines':[],'entries':[],'probes':[],'hatches':[],'ports':[]}
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
  self.t.setdefault('help','Pioneer: no artificial gravity'+(' · J FTL' if self.t['ftl'] else ' · no FTL')+' · F seats/airlocks · R cycles back inside · Space/C translate in freefall · X brakes')
  # Controls are also exposed as Blender preview sliders, with export-rest poses left untouched.
  for part in self.t['parts']:
   ob=bpy.data.objects[part['node']];control='door_'+part['door'] if 'door' in part else part.get('channel','motion');self.root[control]=0.0;self.root.id_properties_ui(control).update(min=0,max=1)
   if 'slide' in part:
    slide=G(part['slide']);off=G(part.get('closedOffset',[0,0,0]));base=ob.location.copy()
    for ax in range(3):
     if not slide[ax] and not off[ax]:continue
     f=ob.driver_add('location',ax);f.driver.expression=f'{base[ax]+off[ax]:.6f}+v*{slide[ax]:.6f}';v=f.driver.variables.new();v.name='v';v.type='SINGLE_PROP';v.targets[0].id=self.root;v.targets[0].data_path='["'+control+'"]'
   elif 'axis' in part:
    # Wheel movement is continuous in-game; export retains its bind pose.
    pass
  self.root['gear']=1.0
  self.scene.frame_set(1);bpy.context.view_layer.update();self.root['game_manifest']=json.dumps(self.t)
  bpy.ops.object.select_all(action='DESELECT')
  for o in self.scene.objects:o.select_set(True)
  path=OUT/(self.key.removeprefix('pioneer_')+'.glb');kw=dict(filepath=str(path),export_format='GLB',use_selection=True,use_active_scene=True,export_yup=True,export_extras=True,export_animations=False,export_apply=True)
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

# Concrete hulls and connected, metre-scale compartments. Run after pioneer_builder.py.
SHIPS=[]
def tank_bundle(s,z0,z1,radius,r,n=4):
 m=s.mesh('propellant');bands=s.mesh('tank_straps',lod=1)
 for i in range(n):
  a=(i+.5)*math.tau/n;x=radius*math.cos(a);y=radius*math.sin(a)+1
  m.cyl((x,y,z0+1),(x,y,z1-1),r,'Hull',1,n=16,collision=True);m.cyl((x,y,z0),(x,y,z0+1),r*.60,'Hull',r1=r,n=16);m.cyl((x,y,z1-1),(x,y,z1),r,'Hull',r1=r*.6,n=16)
  for z in [z0+2,z1-2]:bands.cyl((x,y,z-.14),(x,y,z+.14),r+.05,'Metal',n=16,caps=False)
 m.finish();bands.finish()
def truss(s,z0,z1,width,height,step):
 m=s.mesh('load_spine')
 for x in [-width,width]:
  for y in [1-height,1+height]:m.beam((x,y,z0),(x,y,z1),.15)
 z=z0
 while z<z1:
  zz=min(z1,z+step)
  for x in [-width,width]:m.beam((x,1-height,z),(x,1+height,zz),.10);m.beam((x,1+height,z),(x,1-height,zz),.10)
  for y in [1-height,1+height]:m.beam((-width,y,z),(width,y,zz),.10)
  z=zz
 m.finish()
def bridge(s,z0,z1,w=2.6,id='bridge'):
 s.room(id,'Flight cabin',[-w,0,z0],[w,2.7,z1]);s.furniture(id,'bridge');s.seat(id,-min(.75,w-.52),0,z0+1.2,True);s.seat(id,min(.75,w-.52),0,z0+1.2)
 s.front_window(z0,-w+.25,w-.25,.95,1.25,room=id)
def spine_hab(s,z0,z1,w,crew,spacing=7):
 # Wide forward cabin, narrow axial passage, rooms either side. Full-height doorways.
 bridge(s,z0,z0+5,min(w,3))
 s.room('passage','Axial handrail passage',[-.8,0,z0+5],[.8,2.7,z1],'corridor');s.door('bridge-passage','bridge','passage','z',z0+5,0)
 rows=[('berths_p','Port crew berths','berths',(crew+1)//2),('berths_s','Starboard crew berths','berths',crew//2),('galley','Galley / restrained mess','galley',0),('hygiene','Hygiene / water recovery','hygiene',0),('lab','Survey laboratory','lab',0),('medical','Medical / stores','medical',0)]
 depth=(z1-z0-5)/3
 for i,(id,name,kind,n) in enumerate(rows):
  side=-1 if i%2==0 else 1;za=z0+5+(i//2)*depth;zb=za+depth;xa,xb=(-w,-.8) if side<0 else (.8,w)
  s.room(id,name,[xa,0,za],[xb,2.7,zb]);s.door('to-'+id,'passage',id,'x',side*.8,(za+zb)/2,1.2);s.furniture(id,kind,n)
def berth(s,id,x,z,w=12,length=16,y=-3):
 m=s.mesh('berth_'+id);m.box((x,y-.25,z),(w,.5,length),'Metal',collision=True)
 for xx in [x-w/2+.3,x+w/2-.3]:m.box((xx,y+.015,z),(.16,.04,length-.5),'Hazard');m.box((xx,y+.12,z-length/2+.5),(.15,.18,.6),'LightPanel')
 for zz in [z-length/2+.3,z+length/2-.3]:m.box((x,y+.015,zz),(w-.5,.04,.16),'Hazard')
 m.finish();s.t['zones'].append({'name':id,'kind':'pad','min':[x-w/2,y,z-length/2],'max':[x+w/2,y+12,z+length/2],'gravity':'host','pressure':0,'pad':[x,y,z]})
def service(s,z0,z1):
 s.room('service','Pressurized service spine',[-1.1,0,z0],[1.1,2.7,z1],'corridor');s.door('service-forward','passage','service','z',z0,0)
 s.habitat([(z0,1.65,-.6,3.3),(z1,1.65,-.6,3.3)])
 s.room('engineering','Drive / life support maintenance',[-2.5,0,z1],[2.5,2.7,z1+5]);s.door('service-engine','service','engineering','z',z1,0);s.furniture('engineering','engineering');s.habitat([(z1,3.2,-1,4),(z1+5.2,3.2,-1,4)])
def rcs(s,points):
 m=s.mesh('rcs_clusters',lod=1)
 for x,y,z in points:
  m.box((x,y,z),(.45,.45,.6),'Metal')
  for sign in [-1,1]:m.cyl((x+sign*.2,y,z),(x+sign*.43,y,z),.10,'Metal',r1=.18,n=8,caps=False)
 m.finish()

s=Ship('caravan','Caravan',2_100_000,24,180,True)
s.habitat([(-90,4,-2,4.5),(-85,9,-4,7),(-78,10.2,-4,7),(-50,10.2,-4,7),(-44,7,-3,5)])
spine_hab(s,-89.8,-44,7.3,24)
s.room('service','Pressurized service spine',[-1.1,0,-44],[1.1,2.7,65],'corridor');s.door('spine-access','passage','service','z',-44,0)
s.habitat([(-44,1.7,-.7,3.4),(65,1.7,-.7,3.4)])
s.room('engineering','Engine servicing / life support',[-3,0,65],[3,2.7,72]);s.door('to-engine','service','engineering','z',65,0);s.furniture('engineering','engineering');s.habitat([(65,3.8,-1,4),(72,3.8,-1,4)])
s.airlock('lab',[-10.5,0,-50.5],[-7.3,2.7,-47.7],'x',-7.3,-10.5,-49.1)
truss(s,-43,77,5.5,4.5,10);tank_bundle(s,-8,68,10,3.7,6)
for side in [-1,1]:s.radiator(side,31,68,14,30,2);berth(s,'External berth '+('port' if side<0 else 'starboard'),side*15,-23,12,17,-4)
s.engine((0,1,77),(0,1,90),8.5);rcs(s,[(x,4,z) for x in [-8,8] for z in [-77,71]])
SHIPS.append(s)

s=Ship('anchor','Anchor',460_000,8,90,True)
s.habitat([(-45,3.4,-1.5,4.1),(-40,6.6,-2.5,5.5),(-23,6.6,-2.5,5.5)])
spine_hab(s,-44.8,-23,4.6,8);service(s,-23,25);s.airlock('lab',[-7.4,0,-27.2],[-4.6,2.7,-24.4],'x',-4.6,-7.4,-25.8)
truss(s,-22,34,3.8,3.7,6);tank_bundle(s,6,33,5.7,2.4,4)
for side in [-1,1]:
 s.radiator(side,10,30,8.5,16,5.0);berth(s,'Berth '+('port' if side<0 else 'starboard'),side*10,-9,11,16,-3.5)
 m=s.mesh('service_arm_'+str(side));m.beam((side*4,3,-14),(side*9,5,-9),.22);m.beam((side*9,5,-9),(side*11,4,-2),.18);m.box((side*11,4,-2),(.7,.7,.8),'Hazard');m.finish()
s.engine((0,1,34),(0,1,45),4.6);SHIPS.append(s)

s=Ship('nomad','Nomad',38_000,7,24)
s.habitat([(-12,2.2,-1.3,3.9),(-9.5,5.8,-2.4,5),(-1,5.8,-2.4,5),(1,3.6,-1.5,4.2)])
bridge(s,-11.8,-7.5,1.85);s.room('passage','Family cabin aisle',[-.65,0,-7.5],[.65,2.7,1],'corridor');s.door('flight-cabin','bridge','passage','z',-7.5,0,1.15)
for id,name,lo,hi,kind,n in [('parents','Parents / stores',[-3.9,0,-7.5],[-.65,2.7,-3.6],'berths',2),('kids','Five sleep berths',[.65,0,-7.5],[3.9,2.7,-3.6],'berths',5),('mess','Family mess',[-3.9,0,-3.6],[-.65,2.7,1],'galley',0),('head','Hygiene / water',[.65,0,-3.6],[3.9,2.7,-1.3],'hygiene',0),('mechanical','Service locker',[.65,0,-1.3],[3.9,2.7,1],'engineering',0)]:
 s.room(id,name,lo,hi);s.door('to-'+id,'passage',id,'x',-.65 if lo[0]<0 else .65,-4.65 if id=='kids' else (lo[2]+hi[2])/2,1.05);s.furniture(id,kind,n)
s.airlock('mess',[-6.5,0,-2.7],[-3.9,2.7,.2],'x',-3.9,-6.5,-1.25)
tank_bundle(s,1.6,8,2.6,1.25,4);truss(s,1,8.5,2.3,2.0,2.5);s.engine((0,1,8),(0,1,12),1.8)
for side in [-1,1]:s.radiator(side,3,8,3.8,7,2.7)
s.legs([(-4,-1.5,-7),(4,-1.5,-7),(-4,-1.5,5),(4,-1.5,5)],2.6)
s.t['clamp']={'name':'Outboard rover cradle','pos':[9.3,-1.3,-3.0],'reach':[1.3,1.1,1.5],'fits':[3.8,4.2,5.6]}
m=s.mesh('rover_cradle')
for z in [-6.0,.4]:m.beam((3.6,-1.4,z),(10.9,-3.42,z),.13)
m.box((9.3,-3.50,-2.8),(3.8,.12,6.8),'Metal',collision=True);m.finish()
s.t['thrust'].update(main=.18,belly=1.3,lateral=.035,retro=.05)
SHIPS.append(s)

s=Ship('gantry','Gantry',16_000,2,18)
s.habitat([(-9,2.1,.1,5.2),(-7,2.5,.1,5.2),(-3.5,2.5,.1,5.2)])
bridge(s,-8.8,-5,1.65);s.airlock('bridge',[-1.1,0,-5],[1.1,2.7,-2.5],'z',-5,-2.5,0)
# Elevated spine leaves a wide cargo aperture below; pod exhausts follow their long axes.
m=s.mesh('cargo_frame');m.box((0,4,2),(2.4,.7,12),'Hull',1,collision=True)
for x in [-4.2,4.2]:
 m.beam((x,2,-5),(x,2,7),.20)
 for z in [-4.7,6.2]:m.beam((0,4,z),(x,2,z),.24);m.box((x,2,z),(1.4,1.6,3.8),'Hull',1,collision=True);m.box((x,2.85,z),(.9,.08,2),'Hazard');s.engine((x,2,z+1.2),(x,2,z+2.3),.66)
 m.beam((x,2,-5),(x,-.4,-5),.14);m.beam((x,2,7),(x,-.4,7),.14)
m.finish();s.legs([(-4.2,-.4,-5),(4.2,-.4,-5),(-4.2,-.4,7),(4.2,-.4,7)],1.3)
s.t['clamp']={'name':'Open cargo cradle','pos':[0,1.1,1.9],'reach':[2.0,1.3,2.5],'fits':[7,4.5,10]};s.t['thrust'].update(main=.25,belly=1.6,lateral=.1)
# Separate belly jets make the thrust budget explicit; axial pods remain the main drives.
for x in [-4.2,4.2]:
 for z in [-4.7,6.2]:s.engine((x,1.5,z),(x,.7,z),.5)
SHIPS.append(s)

s=Ship('hopper','Hopper',24_000,4,13)
s.habitat([(-3.4,1.7,-1,5.5),(-2.5,3.6,-1,6.2),(2.5,3.6,-1,6.2),(3.4,1.8,-1,5.5)])
bridge(s,-3.2,.4,1.5);s.room('cabin','Passenger / stores cabin',[-1.5,0,.4],[1.5,2.7,2.5]);s.door('cabin-door','bridge','cabin','z',.4,0)
s.seat('cabin',-.7,0,1.3);s.seat('cabin',.7,0,1.3);s.airlock('cabin',[-1.1,0,2.5],[1.1,2.7,5.1],'z',2.5,5.1,0)
m=s.mesh('upper_tanks');m.cyl((0,4.1,0),(0,8.2,0),2.4,'Hull',n=16,collision=True);m.cyl((0,8.2,0),(0,9.0,0),2.4,'Hull',r1=.8,n=16);m.finish()
s.legs([(-4,-.5,-2.5),(4,-.5,-2.5),(-4,-.5,2.5),(4,-.5,2.5)],1.7)
for x in [-2.1,2.1]:s.engine((x,.4,0),(x,-1.2,0),.8)
s.engine((0,1.5,3.0),(0,1.5,4.3),.45);s.t['thrust'].update(main=.08,belly=1.6,lateral=.06,retro=.04)
# Fixed grated stairs from the rear lock to the landing surface, clear of the engine axes.
m=s.mesh('boarding_steps')
for i in range(6):m.box((0,-.30*(i+1),5.2+.38*i),(1.2,.1,.42),'Metal',collision=True)
for x in [-.68,.68]:m.beam((x,.9,5.1),(x,-.9,7.3),.04,'Hazard')
m.finish();SHIPS.append(s)

s=Ship('firefly','Firefly',4_800,2,8)
s.habitat([(-4,1.15,-.5,3.2),(-3.2,2.1,-.7,3.4),(1.0,2.1,-.7,3.4),(1.8,1.5,-.5,3)])
bridge(s,-3.8,1.0,1.15);s.airlock('bridge',[-3.6,0,-.8],[-1.15,2.7,1.0],'x',-1.15,-3.6,.1)
m=s.mesh('drive_pack');m.box((0,1.1,2.2),(2.5,2.4,1.0),'Metal',collision=True)
for x in [-1.5,1.5]:m.cyl((x,1.1,1.4),(x,1.1,3.2),.50,'Hull',1,collision=True)
m.beam((.9,2.5,.5),(.9,3.9,.5),.05);m.cyl((.9,3.9,.5),(.9,3.9,.25),.48,'Wall',r1=.16,n=12);m.finish();s.engine((0,1.1,2.8),(0,1.1,4.1),.65)
s.t['thrust'].update(main=.18,belly=.20,lateral=.035,retro=.06);s.t['aero']['cd']=[3,6,2];s.t['help']='Orbital survey scout · EVA boarding · restrained burn couches · no atmospheric lift'
s.legs([(-1.3,-.5,-2),(1.3,-.5,-2),(-1.3,-.5,2),(1.3,-.5,2)],.7)
s.t['cargo']={'offset':[0,-1.2,0]};SHIPS.append(s)

s=Ship('trail','Trail',2_300,2,5)
s.habitat([(-2.5,1.25,-.30,2.9),(-1.7,1.5,-.4,3.0),(2.45,1.5,-.4,3.0)])
bridge(s,-2.35,.10,1.0);s.airlock('bridge',[-1.0,0,.10],[1,2.7,2.4],'z',.10,2.4,0)
m=s.mesh('chassis');m.box((0,-.35,0),(2.25,.45,4.6),'Metal',collision=True);m.finish()
for side in [-1,1]:
 for j,z in enumerate([-1.65,0,1.65]):
  p=(side*1.52,-.55,z);m=s.mesh('wheel_'+str(side)+'_'+str(j));m.cyl((side*.9,-.55,z),(side*1.6,-.55,z),.08,'Metal',n=8);m.cyl((side*1.31,-.55,z),(side*1.78,-.55,z),.5,'Rubber',n=16);m.cyl((side*1.78,-.55,z),(side*1.80,-.55,z),.26,'Metal',n=12);m.finish(pivot=p);s.t['parts'].append({'node':m.name,'channel':'wheel','axis':[1,0,0],'radius':.5,'steer':j==0})
s.legs([(-1.52,-.55,-1.65),(1.52,-.55,-1.65),(-1.52,-.55,1.65),(1.52,-.55,1.65)],.5,mounts=False)
# Tire contacts use the existing four-corner suspension, centre wheels are visual bogies.
for o in list(s.scene.objects):
 if ':gear_' in o.name:bpy.data.objects.remove(o,do_unlink=True)
s.t['parts']=[p for p in s.t['parts'] if p.get('channel')!='gear'];s.t['thrust']={k:0 for k in s.t['thrust']};s.t['alpha']=[0,0,0];s.t['ground']={'kind':'wheels','drive':.22,'vmax':12,'yawRate':.55,'yawAccel':.7,'steer':.48,'grip':1.0,'feel':1.0,'push':3.0};s.t['cargo']={'offset':[0,-1.05,0]};s.t['gearFixed']=True;s.t['help']='Six-wheel surface rover · four contact suspension · sealed two-person cabin / EVA lock · no flight'
SHIPS.append(s)

# External inspection covers, painted pressure-vessel bands and registration plates.
for s in SHIPS:
 for hi,hull in enumerate(s.hab):
  # Surface patches taken from existing loft faces remain flush with their angled skin.
  skin=s.mesh('inspection_panels_'+str(hi),lod=1)
  for j,(poly,mat,paint) in enumerate(hull.polys):
   if len(poly)!=4 or j%5!=0:continue
   center=sum((Vector(p) for p in poly),Vector())/len(poly)
   pts=[center+(Vector(p)-center)*.70 for p in poly]
   normal=(Vector(poly[1])-Vector(poly[0])).cross(Vector(poly[2])-Vector(poly[0])).normalized()
   skin.face([p+normal*.035 for p in pts],'Hull',1 if j%3 else 2)
  skin.finish()
 # Registration is true vector geometry, not a packed image texture.
 bpy.context.window.scene=s.scene
 c=bpy.data.curves.new(s.key+'_registration','FONT');c.body=s.name.upper()+'  /  PIONEER';c.size=max(.18,min(1.2,s.t['radius']/20)) if 'radius' in s.t else (.65 if s.t['big'] else .22);c.extrude=.001;c.align_x='CENTER';c.materials.append(MATS['Hazard'])
 o=bpy.data.objects.new(s.key+':registration',c);s.col.objects.link(o);o.parent=s.root;o['asset_id']=s.key;o['lod']=1
 room=s.rs['bridge']['r'];o.location=G((0,room['max'][1]+.1,(room['min'][2]+room['max'][2])/2));o.rotation_euler=(0,0,0)
 bpy.ops.object.select_all(action='DESELECT');o.select_set(True);bpy.context.view_layer.objects.active=o;bpy.ops.object.convert(target='MESH')

TYPES={}
for s in SHIPS:TYPES[s.key]=s.export()
(OUT/'pioneer.data.js').write_text('// Generated by tools/blender/build_pioneer.py. Metres; +X right, +Y up, -Z forward.\nexport const PIONEER_TYPES = '+json.dumps(TYPES,separators=(',',':'))+';\n')
(OUT/'manifest.json').write_text(json.dumps(TYPES,indent=2))
# A separate linked-object overview keeps every craft at real scale without changing exports.
old=bpy.data.scenes.get('Pioneer - Fleet overview')
if old:bpy.data.scenes.remove(old)
sc=bpy.data.scenes.new('Pioneer - Fleet overview');bpy.context.window.scene=sc;sc.unit_settings.system='METRIC'
for s,offset in zip(SHIPS,[(0,0,0),(70,0,-15),(100,0,-65),(122,0,-65),(145,0,-65),(165,0,-65),(185,0,-65)]):
 col=bpy.data.collections.new('Overview / '+s.name);sc.collection.children.link(col);mapping={}
 for ob in s.scene.objects:
  copy=ob.copy();col.objects.link(copy);mapping[ob]=copy
 for ob,copy in mapping.items():
  copy.parent=mapping.get(ob.parent);copy.animation_data_clear()
  if ob.parent is None:copy.location+=G(offset)
for area in bpy.context.screen.areas:
 if area.type=='VIEW_3D':
  area.spaces.active.clip_end=10000;area.spaces.active.region_3d.view_distance=310;area.spaces.active.region_3d.view_location=G((45,0,0));area.spaces.active.region_3d.view_rotation=__import__('mathutils').Euler((math.radians(60),0,math.radians(25)),'XYZ').to_quaternion();area.spaces.active.shading.type='MATERIAL'
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'starseed-pioneer.blend'),copy=True,compress=True)
print('PIONEER_DONE',json.dumps({k:{'size':[round(v,2) for v in t['size']],'rooms':len(t['rooms']),'seats':len(t['seats']),'mass':t['mass']} for k,t in TYPES.items()}))
