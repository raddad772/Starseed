"""A ship's outside, physically: its hull solid to anyone outside it (EVA, or walking by it landed),
open only where the ship is open. Shared by the fleet builders (build_horizon.py, build_expedition.py,
build_pioneer.py), imported beside them. Vessel frame: x starboard, y up, z aft.

A skin is one of a ship's hull meshes (s.hab): a lofted one (.stations: (z, half-width, low, high),
squircle sections (x/w)^4 + ((y-mid)/half)^4 = 1, linear between stations; .skin_x its x offset) is
taken exactly; any other is ray-cast through its polygons (closed, faces looking out).
"""
import math
from mathutils import Vector
from mathutils.bvhtree import BVHTree


def skin_section(m,z):
    # a lofted skin's section at z: (half-width, lower y, upper y), or None past its ends
    st=sorted(m.stations)
    if z<st[0][0] or z>st[-1][0]:return None
    for a,b in zip(st,st[1:]):
        if a[0]<=z<=b[0]:
            t=(z-a[0])/max(b[0]-a[0],1e-9);return tuple(a[i]+(b[i]-a[i])*t for i in (1,2,3))

def skin_span(m,x,z):
    # where a vertical line through a lofted skin at (x, z) is inside it: (low, high) or None
    sec=skin_section(m,z)
    if not sec:return None
    w,low,high=sec;u=abs(x-getattr(m,'skin_x',0))/w
    if u>=1:return None
    mid=(low+high)/2;half=(high-low)/2*(1-u**4)**.25;return (mid-half,mid+half)

def _mesh(m):
    # (a skin's polygons as a tree to ray-cast, and its extent)
    if getattr(m,'_bvh',None) is None:
        verts=[];faces=[]
        for pts,mat,paint in m.polys:faces.append(list(range(len(verts),len(verts)+len(pts))));verts.extend(Vector(p) for p in pts)
        m._bvh=BVHTree.FromPolygons(verts,faces)
        m._box=[[min(v[i] for v in verts) for i in range(3)],[max(v[i] for v in verts) for i in range(3)]]
    return m._bvh

def mesh_spans(m,x,z):
    # down a vertical line through a mesh skin: an up-facing surface enters it, a down-facing one leaves
    t=_mesh(m);lo,hi=m._box
    if not(lo[0]<=x<=hi[0] and lo[2]<=z<=hi[2]):return []
    # (a hair off the grid, so the line never runs down an edge)
    o=Vector((x+3.7e-4,hi[1]+5,z+5.3e-4));d=Vector((0,-1,0));spans=[];top=None
    for _ in range(64):
        loc,nrm,idx,dist=t.ray_cast(o,d)
        if loc is None:break
        if nrm.y>0 and top is None:top=loc.y
        elif nrm.y<0 and top is not None:spans.append((loc.y,top));top=None
        o=loc+d*.002
    return spans

def skin_spans(m,x,z):
    if hasattr(m,'stations'):
        sp=skin_span(m,x,z);return [sp] if sp else []
    return mesh_spans(m,x,z)

def skin_bounds(m):
    # (x0, x1, z0, z1)
    if hasattr(m,'stations'):
        xo=getattr(m,'skin_x',0);w=max(st[1] for st in m.stations)
        return (xo-w,xo+w,min(st[0] for st in m.stations),max(st[0] for st in m.stations))
    _mesh(m);lo,hi=m._box;return (lo[0],hi[0],lo[2],hi[2])

def inside_skins(skins,p):
    return any(a<p[1]<b for m in skins for a,b in skin_spans(m,p[0],p[2]))

def box_minus(box,cut):
    # a box less another: the pieces left (up to six), or the box itself where they don't meet
    lo,hi=box
    if any(lo[i]>=cut[1][i] or hi[i]<=cut[0][i] for i in range(3)):return [box]
    core=[list(lo),list(hi)];out=[]
    for i in range(3):
        if core[0][i]<cut[0][i]:p=[list(core[0]),list(core[1])];p[1][i]=cut[0][i];out.append(p);core[0][i]=cut[0][i]
        if core[1][i]>cut[1][i]:p=[list(core[0]),list(core[1])];p[0][i]=cut[1][i];out.append(p);core[1][i]=cut[1][i]
    return out

def merge_equal(cells,nx,nz):
    # grid cells {(x, z)} grown into rectangles: [(x0, z0, x1, z1)]
    used=set();out=[]
    for x,z in sorted(cells):
        if (x,z) in used:continue
        z1=z
        while (x,z1+1) in cells and (x,z1+1) not in used:z1+=1
        x1=x
        while x1+1<nx and all((x1+1,k) in cells and (x1+1,k) not in used for k in range(z,z1+1)):x1+=1
        used.update((i,k) for i in range(x,x1+1) for k in range(z,z1+1));out.append((x,z,x1,z1))
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
    # The hull's own collision for anyone outside it: solid columns under the skins, hollow where the
    # ship is open to the outside (a hold behind its ramp, airlock passages, pads, hangars), merged into
    # boxes. exact: the open parts taken out of the merged boxes exactly (not cell by cell), and the
    # columns at a lofted skin's sides and ends trimmed to it (not half a cell proud), for coarse cells.
    bounds=[skin_bounds(m) for m in skins]
    x0=min(b[0] for b in bounds);x1=max(b[1] for b in bounds);z0=min(b[2] for b in bounds);z1=max(b[3] for b in bounds)
    nx=int(math.ceil((x1-x0)/step));nz=int(math.ceil((z1-z0)/step))
    spans={}
    for i in range(nx):
        x=x0+(i+.5)*step;xa=x-step/2;xb=x+step/2
        for k in range(nz):
            z=z0+(k+.5)*step;za=z-step/2;zb=z+step/2
            # (the skins over this column, overlaps joined; each with how far the cell is trimmed)
            col=[]
            for m in skins:
                for sp in skin_spans(m,x,z):
                    trim=(None,None,None,None)
                    if exact and hasattr(m,'stations'):
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
    rects=[(a,b,tr,r) for (a,b,tr),cells in spans.items() for r in merge_equal(cells,nx,nz)] if not exact else [(a,b,tr,r) for (n,tr),cells in spans.items() for a,b,r in merge_within(cells,nx,nz,tol)]
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

def exterior_physics(s,skins=None):
    # Every ship solid from outside, open only where it's open: a hold behind its ramp, its pads,
    # anything the ship marks open (s.open, a carrier's hangars), its flight deck's view slot, and
    # each airlock's outer door, reached by a lined passage out through the skin where the skin lies
    # beyond it. Before export, so the passages' cuts reach the skins.
    skins=[m for m in (s.hab if skins is None else skins) if m.polys]
    if not skins or 'hullColliders' in s.t:return
    bounds=[skin_bounds(m) for m in skins]
    far=max(max(abs(v) for v in b) for b in bounds)*2+50
    open_parts=list(getattr(s,'open',[]))
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
    if 'bridge' in s.rs:
        r=s.rs['bridge']['r'];open_parts.append(([r['min'][0]+.25,r['min'][1]+.9,r['min'][2]-far],[r['max'][0]-.25,r['min'][1]+2.6,r['min'][2]-.1]))
    def solid(p):return inside_skins(skins,p) and not any(all(lo[i]<=p[i]<=hi[i] for i in range(3)) for lo,hi in open_parts)
    span=max(b[3] for b in bounds)-min(b[2] for b in bounds)
    step=min(3,max(.4,span/90))
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
        # (open a grid step past the skin: the hull's boxes are a step wide, and one standing across
        # the mouth where the skin flares behind it stood off it in empty space)
        a,b=sorted([d['plane']-out*.3,d['plane']+out*(depth+.6+(step if depth>=.35 else 0))]);lo[ax]=a;hi[ax]=b;passages.append((lo,hi))
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
    s.t['hullColliders']=hull_colliders(s,skins,open_parts+passages,step,min(step/3,.25),exact=True,tol=min(1,step*.3))
    # (the skins and what's open in them, for the hull's tests: a lofted one's x offset and stations
    # (z, half-width, low, high); another's section rings, where it has them ([z, [[x, y], ...]]))
    s.t['skins']=[{'x':getattr(m,'skin_x',0),'stations':[list(st) for st in sorted(m.stations)]} if hasattr(m,'stations') else {'rings':[[z,[list(p) for p in ring]] for z,ring in m.rings]} for m in skins if hasattr(m,'stations') or hasattr(m,'rings')]
    s.t['hullOpen']=[{'min':[round(v,3) for v in lo],'max':[round(v,3) for v in hi]} for lo,hi in open_parts+passages]
    s.t['hullStep']=round(step,3)

# (what the GLB's own copy of the manifest leaves out: the hull's thousands of boxes are in the layout)
MANIFEST_SKIP=('hullColliders','hullOpen','skins','hullStep','lockPassages')

def bridge_side_glazing(s,half,y0,y1,reach=2.0):
    # Side windows for a flight deck whose walls stand close inside the skin (the pilot, sat by one,
    # saw a blank wall over a third of the view): each side's opening runs from the front glass (the
    # walls' corner taken out between) back past the seats as far as the skin stays near (no tunnel
    # to look down), and the skin outside it is glazed flush, on forward round the nose as far as
    # it's seen through the opening at a slant. Not where anything else (another room, a doorway)
    # lies between, nor where the deck has side glass already. Before exterior_physics and export,
    # so its cuts reach the room's walls and the skin.
    if 'bridge' not in s.rs or len(s.rs['bridge'].get('windows',[]))>1:return []
    r=s.rs['bridge']['r'];lo,hi=r['min'],r['max']
    # (a deck wide enough that its walls stand well clear of the seats sees ahead through its front)
    if hi[0]-lo[0]>5.01:return []
    skins=[m for m in s.hab if m.polys]
    za=lo[2];zmax=lo[2]+min(3.2,(hi[2]-lo[2])*.6);made=[]
    glass=s.mesh('bridge_side_glazing')
    for side in (-1,1):
        x=hi[0] if side>0 else lo[0]
        # (how far out the skin is beside the pane, along it: the most over its height)
        def depth(z):
            most=0
            for y in (y0+.05,(y0+y1)/2,y1-.05):
                d=0
                while d<=reach and inside_skins(skins,[x+side*(d+.02),y,z]):d+=.05
                most=max(most,d)
            return most
        zb=za;far=0
        while zb+.25<=zmax+1e-6:
            d=depth(zb+.25)
            if d>reach:break
            zb+=.25;far=max(far,d)
        if zb-za<.7:print('GLAZING',s.key,side,'none: the skin',round(depth(za+.25),2),'m out');continue
        far=max(far,depth(za))
        pane=([min(x-side*.1,x+side*.3),y0,za],[max(x-side*.1,x+side*.3),y1,zb])
        a,b=sorted([x-side*.32,x+side*(far+.4)]);outer=([a,y0,lo[2]-far-1.4],[b,y1,zb+.2])
        def meets(q,box):return all(q['min'][i]<box[1][i] and q['max'][i]>box[0][i] for i in range(3))
        by=[q['id'] for q in s.t['rooms'] if q['id']!='bridge' and q['type']!='exterior' and meets(q,([a,y0,za],[b,y1,zb]))]
        if by:print('GLAZING',s.key,side,'none: beside',by);continue
        print('GLAZING',s.key,side,round(zb-za,2),'m, skin',round(far,2),'m out')
        # (the corner: the front glass carried out to the wall to meet the pane)
        c0,c1=sorted([x-side*.32,x+side*.3])
        s.rs['bridge']['windows']+=[pane,([c0,y0,lo[2]-.3],[c1,y1,lo[2]+.3])];s.cuts.append(outer)
        # (one glass, the skin's: a pane in the wall too doubled the tint and banded the corner)
        for m in skins:
            for poly,mat,idx in m.polys:
                q=poly
                for ax in range(3):
                    if q:q=half(q,ax,outer[0][ax],True)
                    if q:q=half(q,ax,outer[1][ax],False)
                # (in the skin's own plane, cut from it: stood off it, its edges left a hairline)
                if q and len(q)>2:glass.face(q,'Glass')
        made.append(side)
    if made:glass.finish()
    return made
