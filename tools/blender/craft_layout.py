# The small craft's hulls and decks, read from the refit models in the Craft
# scene (each template in its own frame: x starboard, y up, z aft; Blender
# (x, y, z) -> game (x, z, -y)):
#   - hull colliders: vertical rays through each template's meshes, solid
#     spans by depth counting, merged into boxes;
#   - a walk-in deck (the dropship's troop bay and cockpit): rasterised like
#     the yacht's (tools/blender/yacht_layout.py): open where there's floor (or
#     a step) under it and nothing within reach above, joined up from a start
#     point; the rest as solid boxes in one room, left open at a ramp's end;
#   - the fabric (seats, benches) as islands, to place seats by.
# Writes src/sim/layouts/craft.data.js. Run in Blender (MCP):
#   exec(open('/Users/dave/dev/starseed/tools/blender/craft_layout.py').read()); build_craft()

import bpy, bmesh, json, math
from mathutils import Vector
from mathutils.bvhtree import BVHTree

OUT = '/Users/dave/dev/starseed/src/sim/layouts/craft.data.js'
HULLS = ('dropship', 'lifter', 'tank', 'fighter', 'cart')
r2 = lambda v: round(v, 2)


def _parts(name, skip=()):
    o = bpy.data.objects[name]
    return o, [p for p in [o] + list(o.children_recursive) if p.type == 'MESH' and not any(s in p.name for s in skip)]


def _tree(objs, inv):
    bm = bmesh.new()
    for o in objs:
        b2 = bmesh.new(); b2.from_mesh(o.data); b2.transform(inv @ o.matrix_world)
        me = bpy.data.meshes.new('_cl'); b2.to_mesh(me); b2.free(); bm.from_mesh(me); bpy.data.meshes.remove(me)
    t = BVHTree.FromBMesh(bm); bm.free()
    return t


def _g2b(x, y, z):
    return Vector((x, -z, y))


def _merge(cells):
    used, out = set(), []
    for (i, k) in sorted(cells):
        if (i, k) in used:
            continue
        k1 = k
        while (i, k1 + 1) in cells and (i, k1 + 1) not in used:
            k1 += 1
        i1 = i
        while all((i1 + 1, kk) in cells and (i1 + 1, kk) not in used for kk in range(k, k1 + 1)):
            i1 += 1
        for ii in range(i, i1 + 1):
            for kk in range(k, k1 + 1):
                used.add((ii, kk))
        out.append((i, k, i1, k1))
    return out


def _bounds(objs, inv):
    pts = [(inv @ o.matrix_world) @ v.co for o in objs for v in o.data.vertices]
    g = [(p.x, p.z, -p.y) for p in pts]
    return [min(a[i] for a in g) for i in range(3)], [max(a[i] for a in g) for i in range(3)]


def hull_boxes(name, cell=0.5, q=0.5, skip=('preview', 'dock_')):
    o, objs = _parts(name, skip)
    inv = o.matrix_world.inverted()
    t = _tree(objs, inv)
    mn, mx = _bounds(objs, inv)
    nx, nz = int(math.ceil((mx[0] - mn[0]) / cell)), int(math.ceil((mx[2] - mn[2]) / cell))
    cols = {}
    for i in range(nx):
        for k in range(nz):
            x, z = mn[0] + (i + 0.5) * cell, mn[2] + (k + 0.5) * cell
            org, d, hits = _g2b(x, mx[1] + 1, z), Vector((0, 0, -1)), []
            for _ in range(40):
                loc, n, idx, dist = t.ray_cast(org, d)
                if loc is None: break
                hits.append((loc.z, n.z > 0)); org = loc + d * 0.005
            spans, depth, top = [], 0, None
            for zz, up in hits:
                if up:
                    if depth == 0: top = zz
                    depth += 1
                else:
                    depth = max(0, depth - 1)
                    if depth == 0 and top is not None: spans.append((zz, top)); top = None
            if top is not None and hits: spans.append((hits[-1][0], top))
            Q = lambda v: round(v / q) * q
            s = tuple((Q(a), Q(b)) for a, b in spans if b - a > 0.05)
            if s: cols[(i, k)] = s
    layers = {}
    for c, s in cols.items():
        for sp in s: layers.setdefault(sp, set()).add(c)
    out = []
    for (y0, y1), cells in sorted(layers.items()):
        for i, k, i1, k1 in _merge(cells):
            out.append([[r2(mn[0] + i * cell), r2(y0), r2(mn[2] + k * cell)], [r2(mn[0] + (i1 + 1) * cell), r2(y1), r2(mn[2] + (k1 + 1) * cell)]])
    return out


def deck(name, deck_y, start, ceiling, open_parts=(), cell=0.2, head=2.0, near=0.08, body=0.3, open_end=None, skip=('preview', 'dock_')):
    # open_end: (axis, value, u0, u1) - a ramp's end of the deck left without solids past `value`
    o, objs = _parts(name, skip)
    inv = o.matrix_world.inverted()
    t = _tree([p for p in objs if not any(s in p.name for s in open_parts)], inv)
    mn, mx = _bounds(objs, inv)
    x0, z0 = mn[0], mn[2]
    nx, nz = int(math.ceil((mx[0] - mn[0]) / cell)), int(math.ceil((mx[2] - mn[2]) / cell))
    X = lambda i: x0 + (i + 0.5) * cell
    Z = lambda k: z0 + (k + 0.5) * cell
    free, top = set(), {}
    for i in range(nx):
        for k in range(nz):
            x, z = X(i), Z(k)
            hit = t.ray_cast(_g2b(x, deck_y + 0.8, z), Vector((0, 0, -1)), 1.1)
            if hit[0] is None or hit[0].z < deck_y - 0.15 or hit[0].z > deck_y + 0.65 or hit[1].z < 0.7:
                continue
            f = deck_y if hit[0].z < deck_y + 0.1 else round(hit[0].z, 2)
            if t.ray_cast(_g2b(x, f + 0.05, z), Vector((0, 0, 1)), head)[0] is not None:
                continue
            if any(t.find_nearest(_g2b(x, f + h, z), near)[0] is not None for h in (0.3, 1.0, 1.7)):
                continue
            free.add((i, k))
            if f > deck_y: top[(i, k)] = f
    r = int(math.ceil(body / cell))
    fits = {c for c in free if all((c[0] + a, c[1] + b) in free for a in range(-r + 1, r) for b in range(-r + 1, r) if a * a + b * b <= r * r)}
    s0 = (int((start[0] - x0) / cell), int((start[1] - z0) / cell))
    s0 = min(fits, key=lambda c: (c[0] - s0[0]) ** 2 + (c[1] - s0[1]) ** 2)
    reach, stack = {s0}, [s0]
    while stack:
        i, k = stack.pop()
        for a, b in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            c = (i + a, k + b)
            if c in fits and c not in reach: reach.add(c); stack.append(c)
    walk = {c for c in free if any((c[0] + a, c[1] + b) in reach for a in range(-r, r + 1) for b in range(-r, r + 1))}
    ii = [c[0] for c in walk]; kk = [c[1] for c in walk]
    bi0, bi1, bk0, bk1 = min(ii) - 1, max(ii) + 1, min(kk) - 1, max(kk) + 1
    blocked = {(i, k) for i in range(bi0, bi1 + 1) for k in range(bk0, bk1 + 1) if (i, k) not in walk}
    if open_end:
        ax, v, u0, u1 = open_end
        def past(c):
            x, z = X(c[0]), Z(c[1])
            return (z > v and u0 <= x <= u1) if ax == 'z' else (x > v and u0 <= z <= u1)
        blocked = {c for c in blocked if not past(c)}
    hi = r2(deck_y + head + 0.2)
    solids = [[[r2(x0 + i * cell), deck_y, r2(z0 + k * cell)], [r2(x0 + (i1 + 1) * cell), hi, r2(z0 + (k1 + 1) * cell)]] for i, k, i1, k1 in _merge(blocked)]
    for h in sorted(set(top[c] for c in walk if c in top)):
        for i, k, i1, k1 in _merge({c for c in walk if top.get(c) == h}):
            solids.append([[r2(x0 + i * cell), deck_y, r2(z0 + k * cell)], [r2(x0 + (i1 + 1) * cell), h, r2(z0 + (k1 + 1) * cell)]])
    room = [[r2(x0 + bi0 * cell), deck_y, r2(z0 + bk0 * cell)], [r2(x0 + (bi1 + 1) * cell), ceiling, r2(z0 + (bk1 + 1) * cell)]]
    return room, solids


def islands(name, material, skip=('preview',)):
    o, objs = _parts(name, skip)
    inv = o.matrix_world.inverted()
    out = []
    for p in objs:
        if not p.data.materials: continue
        M = inv @ p.matrix_world
        bm = bmesh.new(); bm.from_mesh(p.data); bm.faces.ensure_lookup_table()
        faces = {f.index for f in bm.faces if p.data.materials[f.material_index].name == material}
        seen = set()
        for fi in faces:
            if fi in seen: continue
            stack, comp = [fi], []
            seen.add(fi)
            while stack:
                f = bm.faces[stack.pop()]; comp.append(f)
                for e in f.edges:
                    for g in e.link_faces:
                        if g.index in faces and g.index not in seen: seen.add(g.index); stack.append(g.index)
            pts = [M @ v.co for f in comp for v in f.verts]
            g = [(q.x, q.z, -q.y) for q in pts]
            out.append([[r2(min(a[i] for a in g)) for i in range(3)], [r2(max(a[i] for a in g)) for i in range(3)]])
        bm.free()
    return out


def build_craft():
    # (the lifter's cradle left out: the cargo it carries goes in there, held by the clamp; and
    # ramps: the game swings a slab of its own for each)
    hulls = {n: hull_boxes(n, skip=('preview', 'dock_', 'cradle', ':ramp')) for n in HULLS}
    ds_room, ds_solids = deck('dropship', -1.0, (0.0, 2.0), 2.6, open_parts=('ramp',), open_end=('z', 7.9, -3.8, 3.8))
    with open(OUT, 'w') as f:
        f.write('// Generated by tools/blender/craft_layout.py from the refit models: the small craft\'s hulls\n')
        f.write('// as boxes [min, max] in their own frames, and the dropship\'s walk-in deck (one room, what\n')
        f.write('// is in the way as solid boxes, the steps as boxes you stand on). Do not edit by hand.\n')
        f.write('export const CRAFT_HULLS = ' + json.dumps(hulls, separators=(',', ':')) + ';\n')
        f.write('export const DROPSHIP_DECK = ' + json.dumps(ds_room, separators=(',', ':')) + ';\n')
        f.write('export const DROPSHIP_SOLIDS = ' + json.dumps(ds_solids, separators=(',', ':')) + ';\n')
    return {'hulls': {n: len(b) for n, b in hulls.items()}, 'dropship room': ds_room, 'dropship solids': len(ds_solids),
            'dropship fabric': islands('dropship', 'Fabric'), 'tank fabric': islands('tank', 'Fabric')}
