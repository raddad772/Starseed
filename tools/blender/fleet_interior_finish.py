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
