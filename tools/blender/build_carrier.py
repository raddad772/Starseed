# Builds the Bastion-class carrier in Blender from its layout, the same data
# the game walks and collides with (src/sim/layouts/bastion.js, exported by
# tools/export-layout.mjs to tools/blender/out/bastion-layout.json).
#
# In Blender's Python (the MCP add-on runs this):
#   exec(open('/Users/dave/dev/starseed/tools/blender/build_carrier.py').read())
#   build('all')            # or 'materials', 'exterior', 'interior', 'craft', 'export'
#
# Everything goes into its own scene, "Bastion", so nothing else is touched.
# Ship frame -> Blender: (x stbd, y up, z aft) -> (x, -z, y); the glTF export
# (+Y up) maps it back, so the .glb is in ship coordinates.
#
# Objects: "exterior" (the hull, one mesh; vertex colour "paint" is the livery
# mask: R main colour, G second colour, B stripes, A grime), "glow:<room>"
# (lit window panes, hidden by the game when you're in that room),
# "forcefield:<bay>", "room:<id>" (one per room: walls with door / window /
# opening holes, floor, ceiling, light panels, furniture), "eng-hall",
# "yacht", "pod". Materials are named for the game (it swaps in its own).

import bpy, bmesh, json, math, random
from mathutils import Vector

ROOT = '/Users/dave/dev/starseed'
LAYOUT = ROOT + '/tools/blender/out/bastion-layout.json'
OUT_GLB = ROOT + '/assets/models/bastion.glb'
OUT_BLEND = ROOT + '/assets/blender/bastion.blend'

L = json.load(open(LAYOUT))
RNG = random.Random(304)


def G(x, y, z):
    return Vector((x, -z, y))


# ------------------------------------------------------------------ scene

def scene():
    sc = bpy.data.scenes.get('Bastion') or bpy.data.scenes.new('Bastion')
    for w in bpy.context.window_manager.windows:
        w.scene = sc
    return sc


def collection(name):
    sc = scene()
    col = bpy.data.collections.get(name)
    if not col:
        col = bpy.data.collections.new(name)
        sc.collection.children.link(col)
    return col


def clear_collection(name):
    col = bpy.data.collections.get(name)
    if not col:
        return
    for o in list(col.objects):
        me = o.data if o.type == 'MESH' else None
        bpy.data.objects.remove(o, do_unlink=True)
        if me and me.users == 0:
            bpy.data.meshes.remove(me)


# ------------------------------------------------------------------ materials

MATS = {
    # name: (base RGB, metallic, roughness, emission RGB or None, emission strength, alpha)
    'Hull': ((0.42, 0.44, 0.46), 0.55, 0.45, None, 0, 1),
    'Metal': ((0.12, 0.13, 0.14), 0.8, 0.35, None, 0, 1),
    'WindowGlow': ((0.9, 0.8, 0.6), 0, 0.3, (1.0, 0.82, 0.55), 4, 1),
    'EngineGlow': ((0.5, 0.7, 1.0), 0, 0.3, (0.45, 0.7, 1.0), 12, 1),
    'NavRed': ((1, 0.1, 0.1), 0, 0.3, (1, 0.08, 0.05), 10, 1),
    'NavGreen': ((0.1, 1, 0.2), 0, 0.3, (0.1, 1, 0.25), 10, 1),
    'NavWhite': ((1, 1, 1), 0, 0.3, (1, 1, 1), 10, 1),
    'ForceField': ((0.3, 0.85, 0.95), 0, 0.1, (0.3, 0.8, 0.9), 1.5, 0.15),
    'Wall': ((0.62, 0.64, 0.66), 0.1, 0.6, None, 0, 1),
    'Floor': ((0.2, 0.21, 0.22), 0.2, 0.7, None, 0, 1),
    'Ceiling': ((0.5, 0.52, 0.54), 0.1, 0.7, None, 0, 1),
    'Trim': ((0.3, 0.32, 0.34), 0.5, 0.4, None, 0, 1),
    'Grate': ((0.25, 0.26, 0.27), 0.7, 0.5, None, 0, 1),
    'Hazard': ((0.85, 0.65, 0.1), 0.1, 0.6, None, 0, 1),
    'Console': ((0.14, 0.15, 0.16), 0.4, 0.4, None, 0, 1),
    'Screen': ((0.2, 0.7, 0.8), 0, 0.2, (0.25, 0.8, 0.95), 3, 1),
    'LightPanel': ((1, 0.95, 0.85), 0, 0.3, (1, 0.93, 0.8), 6, 1),
    'Glass': ((0.6, 0.75, 0.85), 0, 0.05, None, 0, 0.12),
    'Fabric': ((0.22, 0.3, 0.42), 0, 0.9, None, 0, 1),
    'Wood': ((0.4, 0.28, 0.18), 0, 0.6, None, 0, 1),
    'Plant': ((0.18, 0.45, 0.16), 0, 0.8, None, 0, 1),
    'Crate': ((0.36, 0.38, 0.26), 0.2, 0.7, None, 0, 1),
    'Holo': ((0.2, 0.7, 0.9), 0, 0.2, (0.3, 0.85, 1.0), 5, 0.6),
    'Core': ((0.3, 0.5, 1.0), 0, 0.2, (0.35, 0.55, 1.0), 15, 1),
}


def mat(name):
    m = bpy.data.materials.get(name)
    base, metal, rough, emis, estr, alpha = MATS[name]
    if m:
        m.diffuse_color = (*(emis or base), max(alpha, 0.3))
        return m
    m = bpy.data.materials.new(name)
    m.diffuse_color = (*(emis or base), max(alpha, 0.3))  # (the solid viewport's colour)
    m.use_nodes = True
    nt = m.node_tree
    p = next(n for n in nt.nodes if n.type == 'BSDF_PRINCIPLED')
    p.inputs['Base Color'].default_value = (*base, 1)
    p.inputs['Metallic'].default_value = metal
    p.inputs['Roughness'].default_value = rough
    if emis:
        p.inputs['Emission Color'].default_value = (*emis, 1)
        p.inputs['Emission Strength'].default_value = estr
    if alpha < 1:
        p.inputs['Alpha'].default_value = alpha
        try:
            m.surface_render_method = 'BLENDED'
        except Exception:
            pass
    if name == 'Hull':
        # the livery preview: three paint colours mixed by the vertex mask
        attr = nt.nodes.new('ShaderNodeAttribute')
        attr.attribute_name = 'paint'
        sep = nt.nodes.new('ShaderNodeSeparateColor')
        nt.links.new(attr.outputs['Color'], sep.inputs['Color'])
        c1 = (0.42, 0.44, 0.46, 1)   # main: gunmetal
        c2 = (0.22, 0.23, 0.25, 1)   # second: dark grey
        c3 = (0.55, 0.12, 0.08, 1)   # stripes: deep red
        mix1 = nt.nodes.new('ShaderNodeMix'); mix1.data_type = 'RGBA'
        mix1.inputs['A'].default_value = c1; mix1.inputs['B'].default_value = c2
        nt.links.new(sep.outputs['Green'], mix1.inputs['Factor'])
        mix2 = nt.nodes.new('ShaderNodeMix'); mix2.data_type = 'RGBA'
        nt.links.new(mix1.outputs['Result'], mix2.inputs['A'])
        mix2.inputs['B'].default_value = c3
        nt.links.new(sep.outputs['Blue'], mix2.inputs['Factor'])
        grime = nt.nodes.new('ShaderNodeMix'); grime.data_type = 'RGBA'; grime.blend_type = 'MULTIPLY'
        nt.links.new(mix2.outputs['Result'], grime.inputs['A'])
        grime.inputs['B'].default_value = (0.55, 0.53, 0.5, 1)
        nt.links.new(attr.outputs['Alpha'], grime.inputs['Factor'])
        nt.links.new(grime.outputs['Result'], p.inputs['Base Color'])
    return m


# ------------------------------------------------------------------ mesh builder

PAINT_MAIN = (1, 0, 0, 0)
PAINT_SECOND = (0, 1, 0, 0)
PAINT_STRIPE = (0, 0, 1, 0)
NOPAINT = (0, 0, 0, 0)

# the flight bay pods' outer top edge: a slope this wide (in from the side)
# and tall (down from the roof), out to the ridge along their outer faces
POD_RIDGE = (5, 12)


class MB:
    """Accumulates quads / polygons in ship coordinates, with a material and a
    paint-mask colour per face; makes one Blender object."""

    def __init__(self, name):
        self.name = name
        self.verts, self.faces, self.fmat, self.fcol = [], [], [], []
        self.mats = []

    def mi(self, m):
        if m not in self.mats:
            self.mats.append(m)
        return self.mats.index(m)

    def poly(self, pts, m, col=NOPAINT, grime=0.0):
        """pts: ship-frame points, counter-clockwise seen from the side the face faces"""
        base = len(self.verts)
        for p in pts:
            self.verts.append(G(*p))
        self.faces.append(list(range(base, base + len(pts))))
        self.fmat.append(self.mi(m))
        self.fcol.append((col[0], col[1], col[2], max(col[3], grime)))

    def quad(self, a, b, c, d, m, col=NOPAINT, flip=False, grime=0.0):
        self.poly([a, d, c, b] if flip else [a, b, c, d], m, col, grime)

    def box(self, mn, mx, m, col=NOPAINT, inward=False, skip=(), grime=0.0):
        x0, y0, z0 = mn
        x1, y1, z1 = mx
        F = {
            '-x': [(x0, y0, z0), (x0, y0, z1), (x0, y1, z1), (x0, y1, z0)],
            '+x': [(x1, y0, z1), (x1, y0, z0), (x1, y1, z0), (x1, y1, z1)],
            '-y': [(x0, y0, z0), (x1, y0, z0), (x1, y0, z1), (x0, y0, z1)],
            '+y': [(x0, y1, z1), (x1, y1, z1), (x1, y1, z0), (x0, y1, z0)],
            '-z': [(x1, y0, z0), (x0, y0, z0), (x0, y1, z0), (x1, y1, z0)],
            '+z': [(x0, y0, z1), (x1, y0, z1), (x1, y1, z1), (x0, y1, z1)],
        }
        for k, pts in F.items():
            if k in skip:
                continue
            self.poly(list(reversed(pts)) if inward else pts, m, col, grime)

    def cylinder(self, c0, c1, r, seg, m, col=NOPAINT, caps=(True, True), r1=None, cap_mat=None):
        """a cylinder (or a cone frustum with r1) between ship points c0 and c1"""
        a = Vector(c0)
        b = Vector(c1)
        ax = (b - a).normalized()
        u = ax.orthogonal().normalized()
        v = ax.cross(u)
        r1 = r if r1 is None else r1
        ring0 = [a + (u * math.cos(t) + v * math.sin(t)) * r for t in [i / seg * math.tau for i in range(seg)]]
        ring1 = [b + (u * math.cos(t) + v * math.sin(t)) * r1 for t in [i / seg * math.tau for i in range(seg)]]
        for i in range(seg):
            j = (i + 1) % seg
            self.poly([tuple(ring0[i]), tuple(ring0[j]), tuple(ring1[j]), tuple(ring1[i])], m, col)
        if caps[0]:
            self.poly([tuple(p) for p in reversed(ring0)], cap_mat or m, col)
        if caps[1]:
            self.poly([tuple(p) for p in ring1], cap_mat or m, col)

    def make(self, coll, recalc=False):
        me = bpy.data.meshes.new(self.name)
        me.from_pydata([tuple(v) for v in self.verts], [], self.faces)
        me.update()
        for m in self.mats:
            me.materials.append(mat(m))
        me.polygons.foreach_set('material_index', self.fmat)
        ca = me.color_attributes.new(name='paint', type='FLOAT_COLOR', domain='CORNER')
        cols = []
        for f, c in zip(self.faces, self.fcol):
            for _ in f:
                cols.extend(c)
        ca.data.foreach_set('color', cols)
        me.color_attributes.active_color = ca
        try:
            me.color_attributes.render_color_index = me.color_attributes.active_color_index
        except Exception:
            pass
        if recalc:
            bm = bmesh.new()
            bm.from_mesh(me)
            bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=0.001)
            bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
            bm.to_mesh(me)
            bm.free()
        me.update()
        ob = bpy.data.objects.get(self.name)
        if ob:
            old = ob.data
            ob.data = me
            if old.users == 0:
                bpy.data.meshes.remove(old)
        else:
            ob = bpy.data.objects.new(self.name, me)
        if ob.name not in coll.objects:
            coll.objects.link(ob)
        return ob


def chamfer_ring(z, hw, y0, y1, c):
    """an octagonal section (a rectangle with chamfered corners) at ship z,
    counter-clockwise seen from the bow"""
    return [(hw - c, y1, z), (-hw + c, y1, z), (-hw, y1 - c, z), (-hw, y0 + c, z),
            (-hw + c, y0, z), (hw - c, y0, z), (hw, y0 + c, z), (hw, y1 - c, z)]


def loft(mb, rings, m, col, cap_front=True, cap_back=True, grime=0.0, cols=None):
    """quads between successive rings (same vertex count), bow to stern"""
    n = len(rings[0])
    for k in range(len(rings) - 1):
        A, B = rings[k], rings[k + 1]
        for i in range(n):
            j = (i + 1) % n
            c = cols[k] if cols else col
            mb.poly([A[i], B[i], B[j], A[j]], m, c, grime=RNG.random() * grime)
    if cap_front:
        mb.poly(list(reversed(rings[0])), m, col)
    if cap_back:
        mb.poly(rings[-1], m, col)


def apply_boolean(ob, cutters, op='DIFFERENCE'):
    """cut ob with temporary box objects (min, max in ship frame), then remove them"""
    coll = ob.users_collection[0]
    made = []
    for i, (mn, mx) in enumerate(cutters):
        mb = MB(f'_cut_{ob.name}_{i}')
        mb.box(mn, mx, 'Metal')
        c = mb.make(coll, recalc=True)
        c.display_type = 'WIRE'
        made.append(c)
        mod = ob.modifiers.new(f'cut{i}', 'BOOLEAN')
        mod.operation = op
        mod.object = c
        try:
            mod.solver = 'EXACT'
        except Exception:
            pass
    with bpy.context.temp_override(object=ob, active_object=ob, selected_objects=[ob], selected_editable_objects=[ob]):
        for mod in list(ob.modifiers):
            bpy.ops.object.modifier_apply(modifier=mod.name)
    for c in made:
        me = c.data
        bpy.data.objects.remove(c, do_unlink=True)
        bpy.data.meshes.remove(me)


def face(mb, pts, n, m, col=NOPAINT, grime=0.0):
    """a polygon (ship points) wound to face along n"""
    c = [Vector(p) for p in pts]
    if (c[1] - c[0]).cross(c[2] - c[1]).dot(Vector(n)) < 0:
        pts = list(reversed(pts))
    mb.poly(pts, m, col, grime)


def room_shell(mb, mn, mx, open_sides=(), holes=None, low=None):
    """a small craft's room seen from inside: floor, ceiling, walls (facing in).
    holes: {side: [(u0, u1, v0, v1)]} doorways cut in a wall (u along the wall:
    z for x walls, x for z walls; v height); low: {side: top} walls only that high"""
    x0, y0, z0 = mn
    x1, y1, z1 = mx
    holes = holes or {}
    low = low or {}
    face(mb, [(x0, y0, z0), (x1, y0, z0), (x1, y0, z1), (x0, y0, z1)], (0, 1, 0), 'Floor')
    if '+y' not in open_sides:
        face(mb, [(x0, y1, z0), (x1, y1, z0), (x1, y1, z1), (x0, y1, z1)], (0, -1, 0), 'Ceiling')
    walls = {'-x': (x0, (1, 0, 0)), '+x': (x1, (-1, 0, 0)), '-z': (z0, (0, 0, 1)), '+z': (z1, (0, 0, -1))}
    for side, (w, n) in walls.items():
        if side in open_sides:
            continue
        top = low.get(side, y1)
        along = (z0, z1) if side in ('-x', '+x') else (x0, x1)
        for (a, b, v0, v1) in rect_minus(along[0], along[1], y0, top, holes.get(side, [])):
            if side in ('-x', '+x'):
                face(mb, [(w, v0, a), (w, v0, b), (w, v1, b), (w, v1, a)], n, 'Wall')
            else:
                face(mb, [(a, v0, w), (b, v0, w), (b, v1, w), (a, v1, w)], n, 'Wall')


def punch(ob, boxes, eps=1e-3):
    """holes through ob's skin where the boxes cross it, with no cavity faces:
    a room drawn inside the hull is its own inside, and a cavity's walls would
    show inside every other room the box passes through"""
    apply_boolean(ob, boxes)
    import bmesh
    bm = bmesh.new()
    bm.from_mesh(ob.data)
    def on_box(f, mn, mx):
        # every corner within the box, all of them on one of its six planes
        pts = [(v.co.x, v.co.z, -v.co.y) for v in f.verts]   # (blender -> ship)
        if any(p[k] < mn[k] - eps or p[k] > mx[k] + eps for p in pts for k in range(3)):
            return False
        return any(all(abs(p[k] - b[k]) < eps for p in pts) for k in range(3) for b in (mn, mx))
    dead = [f for f in bm.faces if any(on_box(f, mn, mx) for (mn, mx) in boxes)]
    bmesh.ops.delete(bm, geom=dead, context='FACES')
    bm.to_mesh(ob.data)
    bm.free()
    ob.data.update()
    return len(dead)


# ------------------------------------------------------------------ exterior

def plate(mb, corners, n, depth, m, col, grime=0.0):
    """a raised panel: four ship points on a surface, lifted depth along its
    outward normal n, with sides (orientation sorted out here)"""
    c = [Vector(p) for p in corners]
    nn = Vector(n).normalized()
    if (c[1] - c[0]).cross(c[2] - c[1]).dot(nn) < 0:
        c = c[::-1]
    t = [p + nn * depth for p in c]
    mb.poly([tuple(p) for p in t], m, col, grime)
    for i in range(4):
        j = (i + 1) % 4
        mb.poly([tuple(c[i]), tuple(c[j]), tuple(t[j]), tuple(t[i])], m, col, grime)


def hex_ring(z, top, shoulder, bottom, inset=0.0):
    """the hull section at ship z: top corners, shoulders, bottom corners
    (each [half width, y]); counter-clockwise from the top right"""
    (tw, ty), (sw, sy), (bw, by) = top, shoulder, bottom
    return [(tw - inset, ty - inset, z), (-tw + inset, ty - inset, z), (-sw + inset, sy, z),
            (-bw + inset, by + inset, z), (bw - inset, by + inset, z), (sw - inset, sy, z)]


def scaled(sec, k, dy=0.0):
    (tw, ty), (sw, sy), (bw, by) = sec
    return ((tw * k, ty * k + dy), (sw * k, sy * k + dy), (bw * k, by * k + dy))


def build_exterior():
    coll = collection('Bastion exterior')
    clear_collection('Bastion exterior')
    H = L['hull']
    core = H['core']
    zf, za = core['min'][2], core['max'][2]
    S = H['section']
    sec = (S['top'], S['shoulder'], S['bottom'])

    # the central hull: one loft from the prow's chisel tip to the stern
    mb = MB('exterior')
    rings = [
        hex_ring(H['prow']['tip'], (5, 9), (14, 0), (10, -9)),
        hex_ring(-410, (14, 18), (28, 6), (24, -15)),
        hex_ring(-350, (26, 28), (46, 13), (40, -22)),
        hex_ring(zf, *sec),
        hex_ring(za - 24, *sec),
        hex_ring(za, *sec, inset=5),
    ]
    loft(mb, rings, 'Hull', PAINT_MAIN, grime=0.25)

    # the island: the bridge superstructure, its front leaning forward (its
    # own piece, sunk half a metre into the deck: touching faces upset booleans)
    im = MB('_island')
    isl = H['island']
    iy0, iy1 = isl['min'][1] - 0.5, isl['max'][1]
    iz0, iz1 = isl['min'][2], isl['max'][2]
    lean = isl['frontLean']
    bw, sw, sy, tw = isl['max'][0], isl['shoulder'][0], isl['shoulder'][1], isl['top']
    def isec(z, zt):
        # base corners at z, shoulders between, top corners at zt (the lean)
        zs = z + (zt - z) * (sy - iy0) / (iy1 - iy0)
        return [(tw, iy1, zt), (-tw, iy1, zt), (-sw, sy, zs), (-bw, iy0, z), (bw, iy0, z), (sw, sy, zs)]
    loft(im, [isec(iz0 + lean, iz0), isec(iz1, iz1)], 'Hull', PAINT_SECOND, grime=0.2)
    # the dorsal spine running aft from the island
    spm = MB('_spine')
    sp = H['spine']
    spw, sph = sp['max'][0], sp['max'][1]
    def ssec(z, zt=None):
        zt = z if zt is None else zt
        return [(spw - 5, sph, zt), (-spw + 5, sph, zt), (-spw, sp['min'][1] - 0.5, z), (spw, sp['min'][1] - 0.5, z)]
    # (clear of the island, so the island lounge looks aft over the deck to its nose)
    loft(spm, [ssec(sp['min'][2], sp['min'][2] + 12), ssec(sp['max'][2])], 'Hull', PAINT_SECOND, grime=0.2)

    # flight bay pods (hollowed by a boolean): roofs below the main deck, the
    # outer faces a chevron (sloping out to a ridge, then back in below it),
    # steep enough at the top that the bay's corner stays inside the skin
    P = H['pods']
    pods = []
    py0, py1 = P['y']
    pz0, pz1 = P['z']
    # Every cavity is cut a little bigger than the room drawn inside it, so the
    # room's own floor, walls and ceiling are always in front of the hull's cut
    # faces (coplanar faces z-fight however good the depth buffer is).
    room_cut = lambda r, m=0.25: ([r['min'][0] - m, r['min'][1] - m, r['min'][2] - m], [r['max'][0] + m, r['max'][1] + m, r['max'][2] + m])
    passages = [r for r in L['rooms'] if r['id'].startswith('cross-') or r['id'] in ('gallery-p', 'gallery-s')]
    for s in (-1, 1):
        pm = MB(f'_pod{s}')
        xi, xo = s * P['x'][0], s * P['x'][1]
        def psec(z):
            return [(xi, py1, z), (xo - s * POD_RIDGE[0], py1, z), (xo, py1 - POD_RIDGE[1], z), (xo - s * 5, py0, z), (xi, py0, z)]
        loft(pm, [psec(pz0), psec(pz1)], 'Hull', PAINT_MAIN, grime=0.25)
        ob = pm.make(coll, recalc=True)
        bay = next(r for r in L['rooms'] if r['type'] == 'bay' and (r['min'][0] > 0) == (s > 0))
        mn, mx = room_cut(bay, 0.5)
        pod_cuts = [([mn[0], mn[1], bay['min'][2] - 2], mx)]   # (out through the mouth)
        # the bay passages (they cross both pods) and this side's bay control
        # room through the inner wall, and the control room's window on into the bay
        gal = next(r for r in passages if r['id'] == ('gallery-s' if s > 0 else 'gallery-p'))
        pod_cuts += [room_cut(r) for r in passages if r['id'].startswith('cross-')] + [room_cut(gal)]
        xw = gal['max'][0] if s > 0 else gal['min'][0]
        for w in L['windows']:
            if w['room'] == gal['id']:
                pod_cuts.append(([min(xw - s * 0.5, xw + s * 1.5), w['y0'], w['u0']], [max(xw - s * 0.5, xw + s * 1.5), w['y1'], w['u1']]))
        apply_boolean(ob, pod_cuts)
        pods.append(ob)

    ext = mb.make(coll, recalc=True)
    island = im.make(coll, recalc=True)
    spine = spm.make(coll, recalc=True)
    # the yacht's recess, the bay passages, and the windows, each cut through
    # its own piece's skin; a window's cut stops at the room's wall (its far
    # face then faces out, away from the room, so it never shows inside)
    cuts = {ext.name: [(L['yacht']['recess']['min'], L['yacht']['recess']['max'])], island.name: []}
    for w in L['windows']:
        r = next(r for r in L['rooms'] if r['id'] == w['room'])
        if r['id'] in ('gallery-p', 'gallery-s', 'eng-control'):
            continue  # (they look into the bays / the engine hall)
        wall = w['wall']
        if wall in ('-x', '+x'):
            x = r['min'][0] if wall == '-x' else r['max'][0]
            c = ([x - 8, w['y0'], w['u0']], [x, w['y1'], w['u1']]) if wall == '-x' else ([x, w['y0'], w['u0']], [x + 8, w['y1'], w['u1']])
        else:
            z = r['min'][2] if wall == '-z' else r['max'][2]
            c = ([w['u0'], w['y0'], z - 8], [w['u1'], w['y1'], z]) if wall == '-z' else ([w['u0'], w['y0'], z], [w['u1'], w['y1'], z + 8])
        cuts[island.name if r['deck'] <= 2 else ext.name].append(c)
    apply_boolean(ext, cuts[ext.name])
    apply_boolean(island, cuts[island.name])
    punch(ext, [room_cut(r) for r in passages])
    parts = [ext, island, spine] + pods
    with bpy.context.temp_override(active_object=ext, selected_editable_objects=parts, selected_objects=parts):
        bpy.ops.object.join()

    # details: engines, keel, stripes, plating, hatches, turrets, mast
    d = MB('_details')
    E = H['engines']
    blk = E['block']
    d.box(blk['min'], [blk['max'][0], blk['max'][1], blk['max'][2] + 0.6], 'Hull', PAINT_SECOND, grime=0.3)  # (proud of the stern face: flush would z-fight)
    for x in E['xs']:
        for y in E['ys']:
            d.cylinder((x, y, E['z'][0]), (x, y, E['z'][1]), E['radius'], 20, 'Metal', caps=(False, False), r1=E['radius'] * 1.15)
            d.cylinder((x, y, E['z'][0] - 6), (x, y, E['z'][0]), E['radius'] + 1.5, 20, 'Hull', PAINT_SECOND, caps=(False, False))
            d.cylinder((x, y, E['z'][1] - 6), (x, y, E['z'][1] - 5.8), E['radius'] * 0.85, 20, 'EngineGlow', caps=(False, True))
    pe = H['podEngines']
    for s in (-1, 1):
        a, b = sorted((s * pe['x'][0], s * pe['x'][1]))
        d.box([a, pe['y'][0], pe['z'][0]], [b, pe['y'][1], pe['z'][1]], 'Hull', PAINT_SECOND, grime=0.3)
        for dx in (-8, 8):
            cx = s * (pe['x'][0] + pe['x'][1]) / 2 + dx
            cy = (pe['y'][0] + pe['y'][1]) / 2
            d.cylinder((cx, cy, pe['z'][1]), (cx, cy, pe['z'][1] + 8), 5, 14, 'Metal', caps=(False, False), r1=6)
            d.cylinder((cx, cy, pe['z'][1] + 6), (cx, cy, pe['z'][1] + 6.2), 4.4, 14, 'EngineGlow', caps=(False, True))
    k = H['keel']
    d.box(k['min'], k['max'], 'Hull', PAINT_SECOND, grime=0.3)
    # stripes: along the island flanks, the spine and the pods' sloping outer faces
    for s in (-1, 1):
        # island flank (between base and shoulder)
        y0s, y1s = 39, 41
        xa = s * (bw - (bw - sw) * (y0s - iy0) / (sy - iy0) + 0.15)
        xb = s * (bw - (bw - sw) * (y1s - iy0) / (sy - iy0) + 0.15)
        d.poly([(xa, y0s, iz0 + lean), (xa, y0s, iz1), (xb, y1s, iz1), (xb, y1s, iz0 + lean)][::(1 if s < 0 else -1)], 'Hull', PAINT_STRIPE)
        # pod: a band on the vertical lower outer face
        xo = s * (P['x'][1] - 2.5)
        d.poly([(xo + s * 0.4, 4, pz0 + 6), (xo + s * 0.4, 4, pz1 - 6), (xo + s * 1.0, 8, pz1 - 6), (xo + s * 1.0, 8, pz0 + 6)][::(1 if s < 0 else -1)], 'Hull', PAINT_STRIPE)
    # ordered plating on the dorsal deck: bands of panels with seams between
    top_y = S['top'][1]
    for z in range(-270, 400, 22):
        for (xa_, xb_) in ((-36, -18), (-17, 0), (1, 18), (19, 36)):
            if abs((xa_ + xb_) / 2) < 31 and -305 < z < -95:
                continue  # (the island)
            if abs((xa_ + xb_) / 2) < 17 and -100 < z < 382:
                continue  # (the spine)
            h_ = 0.35 + RNG.random() * 0.5
            d.box([xa_, top_y, z], [xb_, top_y + h_, z + 20], 'Hull', PAINT_SECOND if RNG.random() < 0.3 else PAINT_MAIN, skip=('-y',), grime=RNG.uniform(0, 0.45))
    # plating on the hull's sloping sides (below the cabin windows, and above
    # the shoulders) and its flat underside
    (tw_, ty_), (sw_, sy_), (bw_, by_) = sec
    lo_n = Vector((sy_ - by_, -(sw_ - bw_), 0)).normalized()   # starboard lower side
    up_n = Vector((ty_ - sy_, sw_ - tw_, 0)).normalized()      # starboard upper side
    x_lo = lambda y: bw_ + (y - by_) * (sw_ - bw_) / (sy_ - by_)
    x_up = lambda y: sw_ + (y - sy_) * (tw_ - sw_) / (ty_ - sy_)
    pods_z = (P['z'][0], P['z'][1])
    for z in range(-270, 400, 24):
        for sgn in (-1, 1):
            bands = [(-24, -8)]
            if not (pods_z[0] - 4 < z < pods_z[1]):
                bands.append((-6, 11))
            for (ya, yb) in bands:
                cs = [(sgn * x_lo(ya), ya, z), (sgn * x_lo(ya), ya, z + 20), (sgn * x_lo(yb), yb, z + 20), (sgn * x_lo(yb), yb, z)]
                plate(d, cs, (sgn * lo_n.x, lo_n.y, 0), 0.35 + RNG.random() * 0.3, 'Hull', PAINT_MAIN, RNG.uniform(0, 0.4))
            ya, yb = 21, 33
            cs = [(sgn * x_up(ya), ya, z), (sgn * x_up(ya), ya, z + 20), (sgn * x_up(yb), yb, z + 20), (sgn * x_up(yb), yb, z)]
            plate(d, cs, (sgn * up_n.x, up_n.y, 0), 0.3 + RNG.random() * 0.3, 'Hull', PAINT_SECOND if RNG.random() < 0.3 else PAINT_MAIN, RNG.uniform(0, 0.4))
        for (xa_, xb_) in ((-44, -24), (-22, -2), (2, 22), (24, 44)):
            if abs((xa_ + xb_) / 2) < 18 and -205 < z < 105:
                continue  # (the keel)
            if abs((xa_ + xb_) / 2) < 14 and -256 < z < -198:
                continue  # (the yacht's recess)
            plate(d, [(xa_, by_, z), (xb_, by_, z), (xb_, by_, z + 20), (xa_, by_, z + 20)], (0, -1, 0), 0.4, 'Hull', PAINT_MAIN, RNG.uniform(0, 0.5))
    # a ridge down the prow's back
    prow_top = [(-450, 9), (-410, 18), (-350, 28), (-280, 36)]
    for (z0_, y0_), (z1_, y1_) in zip(prow_top, prow_top[1:]):
        n_ = Vector((0, z1_ - z0_, -(y1_ - y0_))).normalized()
        plate(d, [(-3, y0_, z0_), (3, y0_, z0_), (3, y1_, z1_), (-3, y1_, z1_)], n_, 1.2, 'Hull', PAINT_SECOND, 0.2)
    # plates on the pods' sloping outer roofs
    for sgn in (-1, 1):
        xo_ = sgn * P['x'][1]
        rw, rh = POD_RIDGE
        n_ = Vector((sgn * rh, rw, 0)).normalized()
        for z in range(int(P['z'][0]) + 10, int(P['z'][1]) - 20, 26):
            a_ = (xo_ - sgn * rw * 0.92, py1 - rh * 0.08, z)
            b_ = (xo_ - sgn * rw * 0.08, py1 - rh * 0.92, z)
            plate(d, [a_, (a_[0], a_[1], z + 22), (b_[0], b_[1], z + 22), b_], n_, 0.35, 'Hull', PAINT_SECOND, RNG.uniform(0, 0.4))
    # a raised cap over the bridge
    cap = MB('_cap')
    def csec(z, zt):
        return [(13, 55, zt), (-13, 55, zt), (-17, 49.5, z), (17, 49.5, z)]
    loft(cap, [csec(-296, -300 + 2), csec(-258, -258)], 'Hull', PAINT_SECOND, grime=0.2)
    capob = cap.make(coll, recalc=True)
    # missile hatches in a grid on each pod roof
    for s in (-1, 1):
        for z in range(-120, 300, 14):
            for x in (80, 92, 104):
                d.box([s * x - 4 if s > 0 else s * x - 4, py1, z], [s * x + 4, py1 + 0.4, z + 8], 'Hull', PAINT_SECOND, skip=('-y',), grime=RNG.uniform(0, 0.3))
    # radiator fins along the spine
    for z in range(-60, 360, 30):
        for s in (-1, 1):
            x = s * spw
            d.box([min(x, x + s * 9), sph - 4, z], [max(x, x + s * 9), sph - 3.4, z + 18], 'Metal')
    # railgun turrets on the dorsal deck and the pod roofs
    for (x, z) in [(-28, -250), (28, -250), (-28, 200), (28, 200), (-100, -40), (100, -40), (-100, 180), (100, 180)]:
        top = py1 if abs(x) > 60 else top_y
        d.cylinder((x, top, z), (x, top + 3, z), 6, 12, 'Hull', PAINT_SECOND)
        d.box([x - 4, top + 3, z - 4], [x + 4, top + 6, z + 3], 'Hull', PAINT_SECOND)
        for dx in (-1.5, 1.5):
            d.box([x + dx - 0.6, top + 4, z - 18], [x + dx + 0.6, top + 5.2, z - 4], 'Metal')
    # sensor mast and dish atop the island
    d.cylinder((0, iy1, -150), (0, iy1 + 12, -150), 1.2, 8, 'Metal')
    d.cylinder((0, iy1 + 12, -150), (0, iy1 + 13, -150), 7, 16, 'Hull', PAINT_SECOND, r1=8.5)
    # bay mouth frames: round the cut, just clear of the bay's own floor, walls
    # and ceiling (they hide the half-metre between those and the cut)
    for r in (r for r in L['rooms'] if r['type'] == 'bay'):
        x0_, x1_, y1_ = r['min'][0], r['max'][0], r['max'][1]
        fz0, fz1 = pz0 - 3, pz0
        d.box([x0_ - 1.2, -1.2, fz0], [x1_ + 1.2, 0.4, fz1], 'Metal')
        d.box([x0_ - 1.2, y1_ - 0.4, fz0], [x1_ + 1.2, y1_ + 1.2, fz1], 'Metal')
        d.box([x0_ - 1.2, 0.4, fz0], [x0_ - 0.2, y1_ - 0.4, fz1], 'Metal')
        d.box([x1_ + 0.2, 0.4, fz0], [x1_ + 1.2, y1_ - 0.4, fz1], 'Metal')
    # sleeves where the bay passages and bay control rooms cross the gap
    # between the main hull and the pods (open-ended: from inside a room
    # you'd see an end cap)
    for r in passages:
        m_ = 0.75
        for s in (-1, 1):
            if not r['id'].startswith('cross-') and (r['max'][0] > 0) != (s > 0):
                continue
            xa_, xb_ = sorted((s * (P['x'][0] - 4.5), s * (P['x'][0] + 1)))
            d.box([xa_, r['min'][1] - m_, r['min'][2] - m_], [xb_, r['max'][1] + m_, r['max'][2] + m_], 'Hull', PAINT_SECOND, skip=('-x', '+x'), grime=0.3)
    ob = d.make(coll)
    ext = bpy.data.objects['exterior']
    with bpy.context.temp_override(active_object=ext, selected_editable_objects=[ext, ob, capob], selected_objects=[ext, ob, capob]):
        bpy.ops.object.join()

    # navigation lights and window glows (separate: the game lights / hides them)
    n = MB('navlights')
    n.box([-58, 17, -278], [-56, 19, -274], 'NavRed')
    n.box([56, 17, -278], [58, 19, -274], 'NavGreen')
    n.box([-142, 13, 320], [-140, 15, 324], 'NavRed')
    n.box([140, 13, 320], [142, 15, 324], 'NavGreen')
    n.box([-1, iy1 + 13, -151], [1, iy1 + 15, -149], 'NavWhite')
    n.make(coll)
    glows = {}
    for w in L['windows']:
        r = next(r for r in L['rooms'] if r['id'] == w['room'])
        if r['id'] in ('gallery-p', 'gallery-s', 'eng-control'):
            continue
        mbw = glows.setdefault(r['id'], MB(f'glow:{r["id"]}'))  # (one object per room, all its windows)
        if w['wall'] in ('-x', '+x'):
            s = -1 if w['wall'] == '-x' else 1
            x = s * (59.4 if r['deck'] == 3 else 29.0)
            mbw.quad((x, w['y0'], w['u0']), (x, w['y0'], w['u1']), (x, w['y1'], w['u1']), (x, w['y1'], w['u0']), 'WindowGlow', flip=s > 0)
        else:
            s = -1 if w['wall'] == '-z' else 1
            zz = (iz0 + lean * (iy1 - (w['y0'] + w['y1']) / 2) / (iy1 - iy0) - 0.4) if s < 0 else iz1 + 0.2
            mbw.quad((w['u1'], w['y0'], zz), (w['u0'], w['y0'], zz), (w['u0'], w['y1'], zz), (w['u1'], w['y1'], zz), 'WindowGlow', flip=s > 0)
    for mbw in glows.values():
        mbw.make(coll)
    # decorative lit cabin-window rows along the habitation deck
    cw = MB('glow:hull')
    for s in (-1, 1):
        for z in range(-210, 70, 6):
            if any(g['min'][2] - 3 < z < g['max'][2] + 0.5 and g['min'][1] < 14 < g['max'][1] for g in passages):
                continue  # (a bay control room comes through the hull here)
            x = s * 59.6
            cw.quad((x, 13.5, z), (x, 13.5, z + 2.5), (x, 15, z + 2.5), (x, 15, z), 'WindowGlow', flip=s > 0)
    cw.make(coll)
    # force fields across the bay mouths
    for b_ in L['bays']:
        fm = MB(f'forcefield:{b_["name"].split()[0].lower()}')
        r = next(r for r in L['rooms'] if r['type'] == 'bay' and (r['min'][0] > 0) == (b_['side'] > 0))
        a, b, y1_ = r['min'][0], r['max'][0], r['max'][1]   # (the whole opening the bay's room shows)
        z = pz0
        fm.quad((b, 0, z), (a, 0, z), (a, y1_, z), (b, y1_, z), 'ForceField')
        fm.make(coll)
    return ext


# ------------------------------------------------------------------ interiors

ROOMS = {r['id']: r for r in L['rooms']}


def rect_minus(u0, u1, v0, v1, holes):
    """a wall rectangle minus hole rectangles -> rectangles (a sweep over u)"""
    xs = sorted({u0, u1, *[h[0] for h in holes if u0 < h[0] < u1], *[h[1] for h in holes if u0 < h[1] < u1]})
    out = []
    for a, b in zip(xs, xs[1:]):
        if b - a < 1e-6:
            continue
        cuts = sorted((max(v0, h[2]), min(v1, h[3])) for h in holes if h[0] <= a + 1e-6 and h[1] >= b - 1e-6 and h[3] > v0 and h[2] < v1)
        v = v0
        for c0, c1 in cuts:
            if c0 > v + 1e-6:
                out.append((a, b, v, c0))
            v = max(v, c1)
        if v1 > v + 1e-6:
            out.append((a, b, v, v1))
    return out


def wall_holes(r, wall):
    """holes in one wall of room r: doors, windows, overlapping rooms, open sides"""
    holes = []
    axis = 0 if wall in ('-x', '+x') else 2
    plane = r['min'][axis] if wall[0] == '-' else r['max'][axis]
    ua = 2 if axis == 0 else 0
    if wall in (r.get('open') or []):
        return None  # the whole wall is open
    def crossing(b):
        return b['min'][axis] - 0.01 <= plane <= b['max'][axis] + 0.01
    for d in L['doors']:
        if r['id'] in d['rooms'] and crossing(d):
            holes.append((d['min'][ua], d['max'][ua], d['min'][1], d['max'][1]))
    for o in L['rooms']:
        if o is r or abs(o['min'][1] - r['min'][1]) > 0.7:
            continue
        if not crossing(o):
            continue
        # o reaches through this wall plane and overlaps r's footprint along the wall
        lo = max(o['min'][ua], r['min'][ua]); hi = min(o['max'][ua], r['max'][ua])
        if hi - lo < 0.05:
            continue
        # it must actually overlap r (not just touch the plane from outside)
        inside = o['min'][axis] < r['max'][axis] - 0.01 and o['max'][axis] > r['min'][axis] + 0.01
        if not inside:
            continue
        holes.append((lo, hi, max(o['min'][1], r['min'][1]), min(o['max'][1], r['max'][1])))
    for w in L['windows']:
        if w['room'] == r['id'] and w['wall'] == wall:
            holes.append((w['u0'], w['u1'], w['y0'], w['y1']))
    return holes


FLOOR_MAT = {'catwalk': 'Grate', 'bay': 'Floor'}


def build_room(coll, r):
    mb = MB(f'room:{r["id"]}')
    x0, y0, z0 = r['min']
    x1, y1, z1 = r['max']
    t = r['type']
    fm = FLOOR_MAT.get(t, 'Floor')
    # floor (faces up) and ceiling (faces down); catwalks have no ceiling
    if t == 'catwalk':
        # (where a catwalk runs into a room, that room's floor is the floor)
        holes = [(o['min'][0], o['max'][0], o['min'][2], o['max'][2]) for o in L['rooms']
                 if o is not r and o['type'] not in ('catwalk', 'door') and abs(o['min'][1] - y0) < 0.05
                 and o['min'][0] < x1 and o['max'][0] > x0 and o['min'][2] < z1 and o['max'][2] > z0]
        for (a, b, v0, v1) in rect_minus(x0, x1, z0, z1, holes):
            mb.quad((a, y0, v1), (b, y0, v1), (b, y0, v0), (a, y0, v0), fm)
    else:
        mb.quad((x0, y0, z1), (x1, y0, z1), (x1, y0, z0), (x0, y0, z0), fm)
    if t != 'catwalk':
        mb.quad((x0, y1, z0), (x1, y1, z0), (x1, y1, z1), (x0, y1, z1), 'Ceiling')
    # walls, facing inward, with their holes
    if t != 'catwalk':
        for wall in ('-x', '+x', '-z', '+z'):
            holes = wall_holes(r, wall)
            if holes is None:
                continue
            if wall in ('-x', '+x'):
                x = x0 if wall == '-x' else x1
                for (a, b, v0, v1) in rect_minus(z0, z1, y0, y1, holes):
                    pts = [(x, v0, a), (x, v0, b), (x, v1, b), (x, v1, a)]
                    mb.poly(list(reversed(pts)) if wall == '-x' else pts, 'Wall')  # (facing into the room)
                for (a, b, v0, v1) in holes:  # frames round the openings
                    if b - a < 0.05:
                        continue
                    inn = 0.3 if wall == '-x' else -0.3
                    out = -0.01 if inn > 0 else 0.01
                    # (a centimetre off every plane a neighbour might have a wall
                    # in: back from the opening's edge, and through this wall's
                    # plane; flush, the frame would z-fight that wall)
                    sk = ('-y',) if v0 <= y0 else ()   # (its underside is on the floor)
                    mb.box([min(x + out, x + inn), max(v0, y0), max(a, z0) - 0.15], [max(x + out, x + inn), min(v1, y1), max(a, z0) - 0.01], 'Trim', skip=sk)
                    mb.box([min(x + out, x + inn), max(v0, y0), min(b, z1) + 0.01], [max(x + out, x + inn), min(v1, y1), min(b, z1) + 0.15], 'Trim', skip=sk)
            else:
                z = z0 if wall == '-z' else z1
                for (a, b, v0, v1) in rect_minus(x0, x1, y0, y1, holes):
                    pts = [(b, v0, z), (a, v0, z), (a, v1, z), (b, v1, z)]
                    mb.poly(list(reversed(pts)) if wall == '-z' else pts, 'Wall')
                for (a, b, v0, v1) in holes:
                    if b - a < 0.05:
                        continue
                    inn = 0.3 if wall == '-z' else -0.3
                    out = -0.01 if inn > 0 else 0.01
                    sk = ('-y',) if v0 <= y0 else ()
                    mb.box([max(a, x0) - 0.15, max(v0, y0), min(z + out, z + inn)], [max(a, x0) - 0.01, min(v1, y1), max(z + out, z + inn)], 'Trim', skip=sk)
                    mb.box([min(b, x1) + 0.01, max(v0, y0), min(z + out, z + inn)], [min(b, x1) + 0.15, min(v1, y1), max(z + out, z + inn)], 'Trim', skip=sk)
        # glass in the windows
        for w in L['windows']:
            if w['room'] != r['id']:
                continue
            if w['wall'] in ('-x', '+x'):
                x = x0 - 0.05 if w['wall'] == '-x' else x1 + 0.05
                mb.quad((x, w['y0'], w['u0']), (x, w['y0'], w['u1']), (x, w['y1'], w['u1']), (x, w['y1'], w['u0']), 'Glass', flip=w['wall'] == '+x')
            else:
                z = z0 - 0.05 if w['wall'] == '-z' else z1 + 0.05
                mb.quad((w['u1'], w['y0'], z), (w['u0'], w['y0'], z), (w['u0'], w['y1'], z), (w['u1'], w['y1'], z), 'Glass', flip=w['wall'] == '+z')
        # wainscot trim along the walls
        for (a, b, z) in ((x0, x1, z0 + 0.02), (x0, x1, z1 - 0.02)):
            pass
    else:
        # catwalk railings along the long sides
        long_z = (z1 - z0) >= (x1 - x0)
        if long_z:
            for x in (x0, x1 - 0.08):
                mb.box([x, y0 + 1.0, z0], [x + 0.08, y0 + 1.1, z1], 'Metal')
                for z in frange(z0, z1, 2.0):
                    mb.box([x, y0, z], [x + 0.08, y0 + 1.0, z + 0.08], 'Metal')
        else:
            for z in (z0, z1 - 0.08):
                mb.box([x0, y0 + 1.0, z], [x1, y0 + 1.1, z + 0.08], 'Metal')
                for x in frange(x0, x1, 2.0):
                    mb.box([x, y0, z], [x + 0.08, y0 + 1.0, z + 0.08], 'Metal')
        mb.box([x0, y0 - 0.25, z0], [x1, y0, z1], 'Grate', skip=('+y',))
    # ceiling light panels
    for l in L['lights']:
        if l['room'] != r['id'] or t == 'catwalk':
            continue
        lx, ly, lz = l['pos']
        s = 3.0 if t == 'bay' else 0.6
        mb.quad((lx - s, y1 - 0.02, lz - s * 2), (lx + s, y1 - 0.02, lz - s * 2), (lx + s, y1 - 0.02, lz + s * 2), (lx - s, y1 - 0.02, lz + s * 2), 'LightPanel')
    furnish(mb, r)
    for so in L['solids']:
        if so.get('room') == r['id']:
            solid(mb, so)
    return mb.make(coll)


def frange(a, b, step):
    v = a
    while v <= b + 1e-6:
        yield v
        v += step


def solid(mb, s):
    mn, mx, k = s['min'], s['max'], s['kind']
    if k == 'console':
        mb.box(mn, mx, 'Console', skip=('-y',))   # (on the floor: its underside never shows)
        mb.box([mn[0] + 0.1, mx[1], mn[2] + 0.1], [mx[0] - 0.1, mx[1] + 0.02, mx[2] - 0.1], 'Screen', skip=('-y',))
    elif k == 'holotable':
        mb.box(mn, mx, 'Console')
        mb.box([mn[0] + 0.3, mx[1], mn[2] + 0.3], [mx[0] - 0.3, mx[1] + 1.6, mx[2] - 0.3], 'Holo')
    elif k in ('table', 'desk', 'counter'):
        mb.box([mn[0], mx[1] - 0.08, mn[2]], [mx[0], mx[1], mx[2]], 'Wood' if k != 'counter' else 'Trim')
        mb.box([(mn[0] + mx[0]) / 2 - 0.2, mn[1], (mn[2] + mx[2]) / 2 - 0.2], [(mn[0] + mx[0]) / 2 + 0.2, mx[1] - 0.08, (mn[2] + mx[2]) / 2 + 0.2], 'Metal')
    elif k == 'bed':
        mb.box(mn, [mx[0], mx[1] - 0.2, mx[2]], 'Metal')
        mb.box([mn[0], mx[1] - 0.2, mn[2]], mx, 'Fabric')
    elif k == 'planter':
        mb.box(mn, mx, 'Trim')
        mb.box([mn[0] + 0.2, mx[1], mn[2] + 0.2], [mx[0] - 0.2, mx[1] + 0.9, mx[2] - 0.2], 'Plant')
    elif k == 'crates':
        mb.box(mn, mx, 'Crate')
    elif k == 'bench':
        mb.box(mn, mx, 'Metal')
    else:
        mb.box(mn, mx, 'Trim')


def furnish(mb, r):
    """the furniture a room type has beyond the layout's walk-around solids"""
    x0, y0, z0 = r['min']
    x1, y1, z1 = r['max']
    t = r['type']
    cx, cz = (x0 + x1) / 2, (z0 + z1) / 2
    if t == 'cabin':
        out = x1 if abs(x1) > abs(x0) else x0  # the end away from the spine
        s = 1 if out > 0 else -1
        bx = out - s * 2.2
        mb.box([min(bx, out - s * 0.1), y0, z0 + 0.3], [max(bx, out - s * 0.1), y0 + 0.6, z0 + 2.3], 'Fabric')          # bunk
        mb.box([min(bx, out - s * 0.1), y0 + 1.6, z0 + 0.3], [max(bx, out - s * 0.1), y0 + 1.8, z0 + 2.3], 'Fabric')    # upper bunk
        mb.box([min(out - s * 1.2, out - s * 0.1), y0, z1 - 1.0], [max(out - s * 1.2, out - s * 0.1), y0 + 2.2, z1 - 0.2], 'Trim')  # locker
        mb.box([min(cx - 0.8, cx + 0.8), y0 + 0.75, z1 - 1.0], [max(cx - 0.8, cx + 0.8), y0 + 0.8, z1 - 0.3], 'Wood')  # desk
    elif t == 'bridge':
        mb.box([-1, y0, -284], [1, y0 + 0.5, -280], 'Console')        # command chair base
        mb.box([-0.7, y0 + 0.5, -283], [0.7, y0 + 1.6, -281.2], 'Fabric')
        mb.box([-4, y0, -292], [4, y0 + 0.9, -290], 'Console')         # helm
        mb.box([-3.6, y0 + 0.9, -291.8], [3.6, y0 + 0.92, -290.2], 'Screen', skip=('-y',))
        mb.box([x0, y0, z1 - 6], [x1, y0 + 0.4, z1], 'Trim')           # raised aft platform
    elif t == 'corridor':
        # wall ribs every 4 m, none across a doorway or a window
        long_z = (z1 - z0) >= (x1 - x0)
        def clear(wall, u0, u1):
            return not any(h[0] < u1 + 0.2 and h[1] > u0 - 0.2 for h in (wall_holes(r, wall) or []))
        if long_z:
            for z in frange(z0 + 2, z1 - 2, 4.0):
                for x, wall in ((x0, '-x'), (x1 - 0.15, '+x')):
                    if clear(wall, z, z + 0.3):
                        mb.box([x, y0, z], [x + 0.15, y1, z + 0.3], 'Trim')
        else:
            for x in frange(x0 + 2, x1 - 2, 4.0):
                for z, wall in ((z0, '-z'), (z1 - 0.15, '+z')):
                    if clear(wall, x, x + 0.3):
                        mb.box([x, y0, z], [x + 0.3, y1, z + 0.15], 'Trim')
    elif t == 'lobby':
        # lift doors in the outboard wall at the stop
        for lf in L['lifts']:
            if abs(lf['z'] - cz) < 7 and x0 < lf['x'] < x1:
                mb.box([x1 - 0.2, y0, lf['z'] - 1.5], [x1, y0 + 2.8, lf['z'] + 1.5], 'Metal')
                mb.box([x1 - 0.25, y0 + 2.9, lf['z'] - 0.3], [x1 - 0.2, y0 + 3.2, lf['z'] + 0.3], 'Screen')
    elif t == 'bay':
        s = -1 if x0 < 0 else 1
        for b_ in L['bays']:
            if b_['side'] != s:
                continue
            for p in b_['pads']:
                px, _, pz = p
                mb.box([px - 15, y0, pz - 20], [px + 15, y0 + 0.05, pz + 20], 'Trim')
                for (a, b) in ((pz - 20, pz - 19.2), (pz + 19.2, pz + 20)):
                    mb.box([px - 15, y0 + 0.05, a], [px + 15, y0 + 0.07, b], 'Hazard')
            # catwalk along the inner wall and two overhead gantries
            inner = x1 if s < 0 else x0
            cw0, cw1 = sorted((inner, inner + s * 3))
            for h in (10, 18):
                mb.box([cw0, y0 + h - 0.3, z0], [cw1, y0 + h, z1], 'Grate')
                rx = inner + s * 3
                mb.box([min(rx, rx + s * 0.08), y0 + h, z0], [max(rx, rx + s * 0.08), y0 + h + 1.1, z1], 'Metal')
            for gz in (40, 200):
                mb.box([x0, y1 - 3, gz - 1.5], [x1, y1 - 1.5, gz + 1.5], 'Metal')
                mb.box([cx - 4, y1 - 5, gz - 2.5], [cx + 4, y1 - 3, gz + 2.5], 'Hazard')
    elif t == 'mess':
        pass  # tables and counter are solids
    elif t == 'hydroponics':
        mb.box([x0, y1 - 0.5, z0], [x1, y1 - 0.3, z1], 'LightPanel', skip=('+y',))
    elif t == 'lifesupport':
        for i, z in enumerate(frange(z0 + 6, z1 - 6, 12.0)):
            mb.cylinder((cx + 6, y0, z), (cx + 6, y1 - 1, z), 2.5, 12, 'Metal')
            mb.cylinder((cx - 8, y0, z), (cx - 8, y1 - 2, z), 1.6, 10, 'Trim')
    elif t == 'reactor':
        mb.cylinder((cx, y0, cz), (cx, y1 - 0.5, cz), 6, 20, 'Metal')
        mb.cylinder((cx, y0 + 2, cz), (cx, y0 + 2.4, cz), 6.3, 20, 'Core', caps=(False, False))
    elif t == 'astrogation':
        mb.box([x0, y1 - 0.4, z0], [x1, y1, z1], 'Console', skip=('+y',))
    elif t == 'medical':
        mb.box([x1 - 1, y0, z0 + 2], [x1 - 0.2, y0 + 2.2, z1 - 2], 'Trim')
    elif t == 'recreation':
        for i in range(3):
            mb.box([x0 + 2 + i * 6, y0, z0 + 3], [x0 + 4 + i * 6, y0 + 1.2, z0 + 6], 'Metal')
    elif t in ('armory', 'lockers'):
        for z in frange(z0 + 1, z1 - 2, 2.5):
            mb.box([x1 - 0.7, y0, z], [x1 - 0.1, y0 + 2.2, z + 2], 'Metal')
    elif t == 'workshop':
        mb.box([x1 - 4, y0, z0 + 10], [x1 - 1, y0 + 2.5, z0 + 16], 'Console')
    elif t == 'cargo':
        mb.box([x0 + 3, y0 - 0.02, z0 + 10], [x1 - 3, y0 + 0.02, z1 - 10], 'Hazard')
    elif t == 'yachtdock':
        h = L['yacht']['hatch']
        mb.box([h[0] - 1.5, y0, h[2] - 1.5], [h[0] + 1.5, y0 + 0.08, h[2] + 1.5], 'Hazard')
        mb.box([h[0] - 1.2, y0 + 0.08, h[2] - 1.2], [h[0] + 1.2, y0 + 0.1, h[2] + 1.2], 'Metal')
    elif t == 'podstation':
        for p in L['pods']:
            hx, hy, hz = p['hatch']
            if x0 - 0.1 <= hx <= x1 + 0.1 and z0 <= hz <= z1 and abs(hy - y0) < 0.5:
                s = 1 if hx > 0 else -1
                xw = x1 if s > 0 else x0
                mb.cylinder((xw - s * 0.1, y0 + 1.4, hz), (xw - s * 0.3, y0 + 1.4, hz), 1.1, 12, 'Hazard', caps=(True, False))
                mb.cylinder((xw - s * 0.3, y0 + 1.4, hz), (xw - s * 0.35, y0 + 1.4, hz), 0.95, 12, 'Metal')


def build_engine_hall(coll):
    mb = MB('eng-hall')
    h = L['engineHall']
    mb.box(h['min'], h['max'], 'Wall', inward=True)
    c = L['ftlCore']
    cx, cz = c['center']
    mb.cylinder((cx, c['y0'], cz), (cx, c['y1'], cz), c['radius'], 24, 'Metal')
    for y in range(int(c['y0']) + 4, int(c['y1']), 6):
        mb.cylinder((cx, y, cz), (cx, y + 1.2, cz), c['radius'] + 0.3, 24, 'Core', caps=(False, False))
    for (x, z) in ((-30, 280), (30, 280), (-30, 325), (30, 325)):
        mb.cylinder((x, h['min'][1], z), (x, h['max'][1], z), 1.5, 10, 'Trim')
    for l in L['lights']:
        if l['room'].startswith('eng-'):
            pass
    for y in (-18, 6, 20):
        mb.box([h['min'][0] + 0.1, y, 262.2], [h['min'][0] + 0.3, y + 0.6, 339.8], 'LightPanel')
        mb.box([h['max'][0] - 0.3, y, 262.2], [h['max'][0] - 0.1, y + 0.6, 339.8], 'LightPanel')
    return mb.make(coll)


def build_interior():
    coll = collection('Bastion interior')
    clear_collection('Bastion interior')
    for r in L['rooms']:
        build_room(coll, r)
    build_engine_hall(coll)


# ------------------------------------------------------------------ the yacht and the escape pod

def build_craft():
    coll = collection('Bastion craft')
    clear_collection('Bastion craft')
    Y = L['yacht']
    bw, bh, bl = Y['size']
    mb = MB('yacht')
    hl = bl / 2
    # a sleek wedge: its top (in the carrier's recess) flat, its belly keel-like
    def sec(z, w, yb, yt, c):
        return chamfer_ring(z, w, yb, yt, c)
    rings = [sec(-hl, 2.5, -1.5, 1.0, 0.8), sec(-hl + 10, 7, -3.5, 3.2, 2), sec(-2, bw / 2, -4.5, 4.5, 3), sec(hl - 6, bw / 2, -4, 4.5, 3), sec(hl, bw / 2 - 2, -3, 3.5, 2.5)]
    loft(mb, rings, 'Hull', PAINT_MAIN, grime=0.15)
    for x in (-5, 5):
        mb.cylinder((x, 0, hl), (x, 0, hl + 3), 2.2, 12, 'Metal', caps=(False, False), r1=2.6)
    yo = mb.make(coll, recalc=True)
    punch(yo, [([-9.6, -2.5, -1.0], [-5.4, 0.2, 1.0])])  # the port airlock
    # its skin (wound by hand: glows, stripes) and its rooms (see YACHT.rooms in vesselTypes.js)
    k = MB('_yacht_skin')
    face(k, [(-3.5, 3.8, -hl + 12), (3.5, 3.8, -hl + 12), (5, 4.6, -hl + 20), (-5, 4.6, -hl + 20)], (0, 1, -0.3), 'WindowGlow')  # canopy
    for x in (-5, 5):
        face(k, [(x + 1.9 * math.cos(a), 1.9 * math.sin(a), hl + 2) for a in [i / 12 * math.tau for i in range(12)]], (0, 0, 1), 'EngineGlow')
    for s in (-1, 1):
        face(k, [(s * (bw / 2 + 0.05), 0.5, -6), (s * (bw / 2 + 0.05), 0.5, hl - 8), (s * (bw / 2 + 0.05), 1.3, hl - 8), (s * (bw / 2 + 0.05), 1.3, -6)], (s, 0, 0), 'Hull', PAINT_STRIPE)
    room_shell(k, (-3.2, -2.0, -15.5), (3.2, 1.9, -8.5), holes={'+z': [(-1, 1, -2.0, 1.5)]}, low={'-z': -1.0, '-x': -0.2, '+x': -0.2})
    # (the doorway forward starts at the cockpit's floor, half a metre up: the wall below it is the step)
    room_shell(k, (-6, -2.5, -8.5), (6, 2.6, 9.5), holes={'-z': [(-1, 1, -2.0, 1.5)], '+z': [(-1, 1, -2.5, 1.5)], '-x': [(-1.0, 1.0, -2.5, 0.2)]})
    room_shell(k, (-6, -2.5, 9.5), (6, 2.6, 17.5), holes={'-z': [(-1, 1, -2.5, 1.5)]})
    face(k, [(-9.2, -2.5, -1.0), (-6, -2.5, -1.0), (-6, -2.5, 1.0), (-9.2, -2.5, 1.0)], (0, 1, 0), 'Floor')  # the airlock
    for zz, n in ((-1.0, (0, 0, 1)), (1.0, (0, 0, -1))):
        face(k, [(-9.2, -2.5, zz), (-6, -2.5, zz), (-6, 0.2, zz), (-9.2, 0.2, zz)], n, 'Wall')
    face(k, [(-9.2, 0.2, -1.0), (-6, 0.2, -1.0), (-6, 0.2, 1.0), (-9.2, 0.2, 1.0)], (0, -1, 0), 'Ceiling')
    k.box([-2.8, -2.0, -15.5], [2.8, -1.0, -14.8], 'Console')
    face(k, [(-2.6, -0.98, -15.45), (2.6, -0.98, -15.45), (2.6, -0.98, -14.85), (-2.6, -0.98, -14.85)], (0, 1, 0), 'Screen')
    k.box([-0.35, -2.0, -13.7], [0.35, -1.5, -13.1], 'Fabric')
    k.box([-0.35, -1.5, -13.1], [0.35, -0.6, -12.95], 'Fabric')
    # benches along both walls (the port one in two, either side of the airlock's doorway)
    for sx in (-1, 1):
        for (z0, z1) in (((-6, -1.4), (1.4, 4)) if sx < 0 else ((-6, 4),)):
            k.box([min(sx * 4.6, sx * 5.9), -2.5, z0], [max(sx * 4.6, sx * 5.9), -1.9, z1], 'Fabric')
            k.box([min(sx * 5.6, sx * 5.95), -1.9, z0], [max(sx * 5.6, sx * 5.95), -0.9, z1], 'Fabric')
    k.box([-1.2, -1.85, -1.5], [1.2, -1.75, 1.5], 'Wood')
    k.box([-0.2, -2.5, -0.2], [0.2, -1.85, 0.2], 'Metal')
    k.box([-2, -2.5, 13], [2, -2.1, 17.4], 'Metal')
    k.box([-2, -2.1, 13], [2, -1.9, 17.4], 'Fabric')
    k.cylinder((0, 2.6, -4), (0, 2.55, -4), 0.8, 16, 'Trim', caps=(False, True))  # the hatch up to the carrier
    for (z0, z1) in ((-4, 0), (12, 15)):
        face(k, [(-0.8, 2.58, z0), (0.8, 2.58, z0), (0.8, 2.58, z1), (-0.8, 2.58, z1)], (0, -1, 0), 'LightPanel')
    sk = k.make(coll)
    with bpy.context.temp_override(active_object=yo, selected_editable_objects=[yo, sk], selected_objects=[yo, sk]):
        bpy.ops.object.join()
    # escape pod: a capsule 6 m long, nose along +x in its own frame (the game turns it)
    pm = MB('pod')
    pm.cylinder((-2.5, 0, 0), (2.0, 0, 0), 1.5, 12, 'Hull', PAINT_SECOND, caps=(True, False))
    pm.cylinder((2.0, 0, 0), (3.2, 0, 0), 1.5, 12, 'Hull', PAINT_STRIPE, caps=(False, True), r1=0.7)
    pm.box([-2.6, -0.4, -0.5], [-2.4, 0.4, 0.5], 'Metal')
    pm.make(coll, recalc=True)


# ------------------------------------------------------------------ export

def export():
    import os
    os.makedirs(os.path.dirname(OUT_GLB), exist_ok=True)
    os.makedirs(os.path.dirname(OUT_BLEND), exist_ok=True)
    objs = []
    for cname in ('Bastion exterior', 'Bastion interior', 'Bastion craft'):
        c = bpy.data.collections.get(cname)
        if c:
            objs += [o for o in c.objects if not o.name.startswith('_')]
    # select exactly these, in every view layer (the export may run in another scene's context)
    for sc in bpy.data.scenes:
        for vl in sc.view_layers:
            vl.update()
            for o in vl.objects:
                if o is not None:  # (an object removed earlier in the run can linger as None)
                    o.select_set(o in objs, view_layer=vl)
    for me in list(bpy.data.meshes):
        if me.users == 0:
            bpy.data.meshes.remove(me)
    kw = dict(filepath=OUT_GLB, export_format='GLB', use_selection=True, export_yup=True, export_apply=True)
    props = bpy.ops.export_scene.gltf.get_rna_type().properties
    if 'export_vertex_color' in props:
        kw['export_vertex_color'] = 'ACTIVE'
    if 'export_all_vertex_colors' in props:
        kw['export_all_vertex_colors'] = False
    if 'export_colors' in props:
        kw['export_colors'] = True
    bpy.ops.export_scene.gltf(**kw)
    bpy.ops.wm.save_as_mainfile(filepath=OUT_BLEND, copy=True)
    return OUT_GLB


def stats():
    out = {}
    for cname in ('Bastion exterior', 'Bastion interior', 'Bastion craft'):
        c = bpy.data.collections.get(cname)
        if not c:
            continue
        tris = 0
        for o in c.objects:
            if o.type == 'MESH':
                tris += sum(len(p.vertices) - 2 for p in o.data.polygons)
        out[cname] = {'objects': len(c.objects), 'tris': tris}
    return out


def build(what='all'):
    scene()
    if what in ('all', 'materials'):
        for k in MATS:
            mat(k)
    if what in ('all', 'exterior'):
        build_exterior()
    if what in ('all', 'interior'):
        build_interior()
    if what in ('all', 'craft'):
        build_craft()
    if what in ('all', 'export'):
        export()
    return stats()
