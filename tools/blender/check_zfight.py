# Z-fighting check for the Blender-built ships: finds faces that lie in the
# same plane, face the same way and overlap (no depth buffer can sort those).
# Run inside Blender after a build:
#   exec(open('/Users/dave/dev/starseed/tools/blender/check_zfight.py').read()); zfight()
# Prints the overlapping pairs grouped by object and material, biggest first,
# in ship coordinates (x starboard, y up, z aft). Pairs that look the same
# (same material, same paint) can't flicker visibly and are only counted.

import bpy
from collections import defaultdict
from mathutils import Vector

SKIP_MATS = {'Glass', 'ForceField'}   # (hidden in the game / drawn as its own effect)


def _ship(v):
    return (round(v.x, 2), round(v.z, 2), round(-v.y, 2))


def _clip(poly, a, b):
    """Sutherland-Hodgman: keep the part of poly left of the edge a->b"""
    out = []
    side = lambda p: (b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0])
    for i in range(len(poly)):
        p, q = poly[i], poly[(i + 1) % len(poly)]
        sp, sq = side(p), side(q)
        if sp >= 0:
            out.append(p)
        if (sp >= 0) != (sq >= 0):
            t = sp / (sp - sq)
            out.append((p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t))
    return out


def _area(poly):
    return 0.5 * sum(poly[i][0] * poly[(i + 1) % len(poly)][1] - poly[(i + 1) % len(poly)][0] * poly[i][1] for i in range(len(poly)))


def _ccw(poly):
    return poly if _area(poly) >= 0 else poly[::-1]


def zfight(objects=None, tol=0.005, min_area=0.02, show=12, same_look=False):
    objs = objects or [o for o in bpy.context.scene.objects if o.type == 'MESH' and o.visible_get()]
    buckets = defaultdict(list)
    for o in objs:
        mw = o.matrix_world
        me = o.data
        paint = me.color_attributes.get('paint')
        for f in me.polygons:
            m = o.material_slots[f.material_index].material if o.material_slots else None
            mname = m.name if m else '-'
            if mname in SKIP_MATS or f.area < 1e-4:
                continue
            pts = [mw @ me.vertices[i].co for i in f.vertices]
            n = (mw.to_3x3() @ f.normal).normalized()
            d = n.dot(pts[0])
            key = (round(n.x, 3), round(n.y, 3), round(n.z, 3), round(d / tol))
            look = (mname, tuple(round(c, 2) for c in paint.data[f.loop_start].color) if paint else None)
            buckets[key].append((o.name, mname, pts, n, look))
    hits = defaultdict(lambda: [0.0, None])
    for key, faces in buckets.items():
        # (neighbouring offset buckets too: planes a hair apart straddle a boundary)
        k2 = key[:3] + (key[3] + 1,)
        others = faces + buckets.get(k2, [])
        if len(others) < 2:
            continue
        n = faces[0][3]
        u = n.orthogonal().normalized()
        w = n.cross(u)
        flat = [(f, _ccw([(p.dot(u), p.dot(w)) for p in f[2]])) for f in others]
        for i in range(len(faces)):
            fa, pa = flat[i]
            ax = [p[0] for p in pa]; ay = [p[1] for p in pa]
            for j in range(i + 1, len(flat)):
                fb, pb = flat[j]
                if min(p[0] for p in pb) >= max(ax) or max(p[0] for p in pb) <= min(ax):
                    continue
                if min(p[1] for p in pb) >= max(ay) or max(p[1] for p in pb) <= min(ay):
                    continue
                inter = pa
                for k in range(len(pb)):
                    inter = _clip(inter, pb[k], pb[(k + 1) % len(pb)])
                    if len(inter) < 3:
                        break
                if len(inter) < 3:
                    continue
                a = abs(_area(inter))
                if a < 1e-3 or (not same_look and fa[4] == fb[4]):
                    continue
                g = tuple(sorted([(fa[0], fa[1]), (fb[0], fb[1])]))
                h = hits[g]
                h[0] += a
                if h[1] is None:
                    c = sum((p for p in fa[2]), Vector()) / len(fa[2])
                    h[1] = (_ship(c), _ship(n))
    rows = sorted(((a, g, at) for g, (a, at) in hits.items() if a >= min_area), key=lambda r: -r[0])
    print(f'z-fight check: {len(objs)} objects, {sum(len(f) for f in buckets.values())} faces, {len(rows)} overlapping pairs')
    for a, g, at in rows[:show]:
        print(f'  {a:9.2f} m2  {g[0][0]} [{g[0][1]}]  x  {g[1][0]} [{g[1][1]}]   e.g. at {at[0]} facing {at[1]}')
    return rows


def intrusions(layout_path='/Users/dave/dev/starseed/tools/blender/out/bastion-layout.json',
               shells=('exterior', 'glow:hull', 'navlights'), n=4, show=30):
    """Outside surfaces that cut through a room and face into it (so you'd see
    them from inside): rays from a grid of points in each room, along all six
    axes, past back faces, reporting a front face met inside the room."""
    import json
    L = json.load(open(layout_path))
    objs = [bpy.data.objects[s] for s in shells if s in bpy.data.objects]
    dirs = [(1, 0, 0), (-1, 0, 0), (0, 1, 0), (0, -1, 0), (0, 0, 1), (0, 0, -1)]
    found = defaultdict(lambda: [0, None])
    for r in L['rooms']:
        mn, mx = r['min'], r['max']
        inside = lambda p: all(mn[k] + 0.02 < p[k] < mx[k] - 0.02 for k in range(3))
        for i in range(n):
            for j in range(n):
                for k in range(n):
                    o = [mn[a] + (mx[a] - mn[a]) * (t + 0.5) / n for a, t in zip(range(3), (i, j, k))]
                    for d in dirs:
                        for ob in objs:
                            org = Vector((o[0], -o[2], o[1]))
                            dv = Vector((d[0], -d[2], d[1]))
                            for _ in range(8):
                                ok, loc, nrm, fi = ob.ray_cast(org, dv)
                                if not ok:
                                    break
                                p = _ship(loc)
                                if not inside(p):
                                    break
                                if nrm.dot(dv) < 0:   # facing the ray: drawn
                                    m = ob.material_slots[ob.data.polygons[fi].material_index].material
                                    g = found[(r['id'], ob.name, m.name if m else '-')]
                                    g[0] += 1
                                    g[1] = g[1] or p
                                    break
                                org = loc + dv * 0.01
    rows = sorted(((c, key, at) for key, (c, at) in found.items()), key=lambda x: -x[0])
    print(f'intrusion check: {len(L["rooms"])} rooms, {len(rows)} room/surface pairs')
    for c, (rid, ob, m), at in rows[:show]:
        print(f'  {c:4d} rays  room {rid}  <-  {ob} [{m}]  e.g. at {at}')
    return rows
