# The captain's yacht's walkable deck, its seats and its hull colliders, read
# from the refit model (the 'yacht' object and its parts, in its own frame:
# x starboard, y up, z aft; Blender (x, y, z) -> game (x, z, -y)). The main
# deck is rasterised: a cell is open where there's floor under it (the deck,
# or a step or platform up to 0.65 m above it: the cockpit's) and nothing
# within reach at knee, waist and head height above that (the sliding doors
# count as open), and it counts only if a body can get there from the transfer
# hub under the dorsal hatch; the rest becomes solid boxes inside one room,
# and the steps and platforms solid boxes you stand on. Writes src/sim/layouts/yacht.data.js. Run in Blender (MCP):
#   exec(open('/Users/dave/dev/starseed/tools/blender/yacht_layout.py').read()); build_yacht()

import bpy, bmesh, json, math
from mathutils import Vector
from mathutils.bvhtree import BVHTree

OUT = '/Users/dave/dev/starseed/src/sim/layouts/yacht.data.js'
CELL = 0.2          # m
DECK = -1.1         # the main deck's floor (the model's main_deck_floor_z)
HEAD = 2.0          # m above the deck a body needs clear
NEAR = 0.08         # m: closer than this to a surface is inside it
BODY = 0.3          # m: the walker's radius (a gap narrower than a body doesn't connect)
HUB = (0.0, -8.0)   # under the dorsal hatch
# parts that aren't in the way: what slides or swings open, what's overhead or outside
OPEN = ('airlock_inner', 'airlock_outer', 'garage_pressure_door', 'bay_door', 'dorsal_hatch', 'gear_', 'ramp_', 'roof', 'ceilings', 'glazing')


def _tree(objs, inv):
    bm = bmesh.new()
    for o in objs:
        b2 = bmesh.new(); b2.from_mesh(o.data); b2.transform(inv @ o.matrix_world)
        me = bpy.data.meshes.new('_yl'); b2.to_mesh(me); b2.free(); bm.from_mesh(me); bpy.data.meshes.remove(me)
    t = BVHTree.FromBMesh(bm); bm.free()
    return t


def _g2b(x, y, z):
    return Vector((x, -z, y))


def _merge(cells, nx, nz):
    # greedy rectangles over a set of (i, k)
    used, out = set(), []
    for i in range(nx):
        for k in range(nz):
            if (i, k) not in cells or (i, k) in used:
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


def build_yacht():
    Y = bpy.data.objects['yacht']
    inv = Y.matrix_world.inverted()
    parts = [Y] + [c for c in Y.children_recursive if c.type == 'MESH']
    solid = [o for o in parts if not any(s in o.name for s in OPEN) and 'hover_vehicle' not in o.name]
    t = _tree(solid + [bpy.data.objects['yacht:hover_vehicle']], inv)
    x0, x1, z0, z1 = -13.2, 13.2, -23.0, 25.4
    nx, nz = int((x1 - x0) / CELL), int((z1 - z0) / CELL)
    X = lambda i: x0 + (i + 0.5) * CELL
    Z = lambda k: z0 + (k + 0.5) * CELL
    free, top = set(), {}
    for i in range(nx):
        for k in range(nz):
            x, z = X(i), Z(k)
            hit = t.ray_cast(_g2b(x, DECK + 0.8, z), Vector((0, 0, -1)), 1.1)
            if hit[0] is None or hit[0].z < DECK - 0.15 or hit[0].z > DECK + 0.65 or hit[1].z < 0.7:
                continue                                   # no floor under it
            f = DECK if hit[0].z < DECK + 0.1 else round(hit[0].z, 2)
            up = t.ray_cast(_g2b(x, f + 0.05, z), Vector((0, 0, 1)), HEAD)
            if up[0] is not None:
                continue                                   # furniture, or inside a wall
            if any(t.find_nearest(_g2b(x, f + h, z), NEAR)[0] is not None for h in (0.3, 1.0, 1.7)):
                continue
            free.add((i, k))
            if f > DECK: top[(i, k)] = f
    # where a body fits (free for BODY around), joined up from the hub
    r = int(math.ceil(BODY / CELL))
    fits = {c for c in free if all((c[0] + a, c[1] + b) in free for a in range(-r + 1, r) for b in range(-r + 1, r) if a * a + b * b <= r * r)}
    start = (int((HUB[0] - x0) / CELL), int((HUB[1] - z0) / CELL))
    start = min(fits, key=lambda c: (c[0] - start[0]) ** 2 + (c[1] - start[1]) ** 2)
    reach, stack = {start}, [start]
    while stack:
        i, k = stack.pop()
        for a, b in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            c = (i + a, k + b)
            if c in fits and c not in reach:
                reach.add(c); stack.append(c)
    # the open floor: reachable centres and the body's width around them
    walk = {c for c in free if any((c[0] + a, c[1] + b) in reach for a in range(-r, r + 1) for b in range(-r, r + 1))}
    ii = [c[0] for c in walk]; kk = [c[1] for c in walk]
    bi0, bi1, bk0, bk1 = min(ii) - 1, max(ii) + 1, min(kk) - 1, max(kk) + 1
    blocked = {(i, k) for i in range(bi0, bi1 + 1) for k in range(bk0, bk1 + 1) if (i, k) not in walk}
    rects = _merge(blocked, nx + 2, nz + 2)
    r2 = lambda v: round(v, 2)
    solids = [[[r2(x0 + i * CELL), DECK, r2(z0 + k * CELL)], [r2(x0 + (i1 + 1) * CELL), r2(DECK + HEAD + 0.2), r2(z0 + (k1 + 1) * CELL)]] for i, k, i1, k1 in rects]
    # the steps and platforms you walk on: boxes up to their tops
    for h in sorted(set(top[c] for c in walk if c in top)):
        for i, k, i1, k1 in _merge({c for c in walk if top.get(c) == h}, nx + 2, nz + 2):
            solids.append([[r2(x0 + i * CELL), DECK, r2(z0 + k * CELL)], [r2(x0 + (i1 + 1) * CELL), h, r2(z0 + (k1 + 1) * CELL)]])
    room = [[r2(x0 + bi0 * CELL), DECK, r2(z0 + bk0 * CELL)], [r2(x0 + (bi1 + 1) * CELL), r2(DECK + 3.25), r2(z0 + (bk1 + 1) * CELL)]]
    # the flight seats: the cockpit's fabric, one island per seat
    ck = bpy.data.objects['yacht:cockpit']; M = inv @ ck.matrix_world
    bm = bmesh.new(); bm.from_mesh(ck.data); bm.faces.ensure_lookup_table()
    fab = [f for f in bm.faces if ck.data.materials[f.material_index].name == 'Fabric']
    pts = [(M @ f.calc_center_median()) for f in fab]
    bm.free()
    seats = []
    for side in (-1, 1):
        g = [(p.x, p.z, -p.y) for p in pts if p.x * side > 0]
        if g:
            seats.append([r2(sum(q[0] for q in g) / len(g)), DECK, r2(min(q[2] for q in g)), r2(max(q[2] for q in g)), r2(max(q[1] for q in g))])
    # the hull from outside: vertical rays through the shell, 1 m cells, spans rounded to 0.25 m
    hull = _tree([Y, bpy.data.objects['yacht:roof']], inv)
    cols = {}
    for i in range(27):
        for k in range(49):
            x, z = -13.0 + i, -22.5 + k
            o, d, hits = _g2b(x, 10, z), Vector((0, 0, -1)), []
            for _ in range(20):
                loc, n, idx, dist = hull.ray_cast(o, d)
                if loc is None: break
                hits.append(loc.z); o = loc + d * 0.01
            if len(hits) >= 2:
                q = lambda v: round(v * 4) / 4
                cols[(i, k)] = (q(min(hits)), q(max(hits)))
    hb = []
    for span in set(cols.values()):
        cells = {c for c, s in cols.items() if s == span}
        for i, k, i1, k1 in _merge(cells, 27, 49):
            hb.append([[-13.5 + i, span[0], -23.0 + k], [-12.5 + i1, span[1], -22.0 + k1]])
    with open(OUT, 'w') as f:
        f.write("// Generated by tools/blender/yacht_layout.py from the refit model: the captain's yacht's\n")
        f.write('// main deck (one room, what is in the way as solid boxes), its flight seats ([x, floor, z\n')
        f.write('// front, z back, top]) and its hull as boxes, in its own frame. Do not edit by hand.\n')
        f.write('export const YACHT_DECK = ' + json.dumps(room, separators=(',', ':')) + ';\n')
        f.write('export const YACHT_SOLIDS = ' + json.dumps(solids, separators=(',', ':')) + ';\n')
        f.write('export const YACHT_SEATS = ' + json.dumps(seats, separators=(',', ':')) + ';\n')
        f.write('export const YACHT_HULL = ' + json.dumps(hb, separators=(',', ':')) + ';\n')
    return {'free': len(free), 'reach': len(reach), 'walk': len(walk), 'solids': len(solids), 'seats': seats, 'room': room, 'hull boxes': len(hb)}
