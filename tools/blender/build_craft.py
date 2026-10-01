# Rough drafts of the carrier's vehicles and landers, one file for the game:
# assets/models/craft.glb. Each craft is a top-level object named for its
# template (cart, crate, tank, lifter, dropship, fighter) in its own frame
# (x starboard, y up, z aft, metres; the numbers match src/sim/vesselTypes.js:
# legs, seats, colliders, clamp positions). Moving parts are child objects
# named '<template>:<part>' (the game swings them about their hinges).
#
# In Blender's Python (the MCP add-on runs this):
#   exec(open('/Users/dave/dev/starseed/tools/blender/build_craft.py').read())
#   build_vehicles()
#
# It borrows the carrier script's mesh builder and materials, and builds in
# its own scene, "Craft", laid out in a row for viewing (the game puts each
# template at its own origin).

exec(open('/Users/dave/dev/starseed/tools/blender/build_carrier.py').read())

CRAFT_GLB = ROOT + '/assets/models/craft.glb'
CRAFT_BLEND = ROOT + '/assets/blender/craft.blend'
CRAFT_COLL = 'Starseed craft'


def craft_scene():
    sc = bpy.data.scenes.get('Craft') or bpy.data.scenes.new('Craft')
    for w in bpy.context.window_manager.windows:
        w.scene = sc
    col = bpy.data.collections.get(CRAFT_COLL)
    if not col:
        col = bpy.data.collections.new(CRAFT_COLL)
        sc.collection.children.link(col)
    return sc, col


def slab(mb, xz, y0, y1, m, col=NOPAINT, grime=0.0):
    """a convex outline in plan (x, z points), from y0 up to y1"""
    top = [(x, y1, z) for x, z in xz]
    bot = [(x, y0, z) for x, z in xz]
    face(mb, top, (0, 1, 0), m, col, grime)
    face(mb, bot, (0, -1, 0), m, col, grime)
    cx = sum(x for x, _ in xz) / len(xz)
    cz = sum(z for _, z in xz) / len(xz)
    for i in range(len(xz)):
        j = (i + 1) % len(xz)
        (xa, za), (xb, zb) = xz[i], xz[j]
        out = Vector(((xa + xb) / 2 - cx, 0, (za + zb) / 2 - cz))
        face(mb, [(xa, y0, za), (xb, y0, zb), (xb, y1, zb), (xa, y1, za)], out, m, col, grime)


def wheel(mb, x, y, z, r, w, side):
    """a wheel on an axle along x (side: -1 port, +1 starboard)"""
    mb.cylinder((x - side * w / 2, y, z), (x + side * w / 2, y, z), r, 14, 'Metal')
    mb.cylinder((x + side * w / 2, y, z), (x + side * (w / 2 + 0.02), y, z), r * 0.55, 10, 'Trim')


def strut(mb, x, y0, y1, z, t=0.3, foot=0.9):
    """a landing leg: strut down from y1 to a foot pad at y0"""
    mb.box([x - t / 2, y0 + 0.15, z - t / 2], [x + t / 2, y1, z + t / 2], 'Metal')
    mb.box([x - foot / 2, y0, z - foot / 2], [x + foot / 2, y0 + 0.15, z + foot / 2], 'Metal')


class Craft:
    """a template: its solid hull (normals recalculated), its loose skin
    (glows, stripes, already facing out) and its moving parts"""

    def __init__(self, name):
        self.name = name
        self.solid = MB(name)
        self.skin = MB('_skin_' + name)
        self.parts = []

    def part(self, pname):
        mb = MB(f'{self.name}:{pname}')
        self.parts.append(mb)
        return mb

    def make(self, coll, at):
        ob = self.solid.make(coll, recalc=True)
        if getattr(self, 'cuts', None):
            punch(ob, self.cuts)  # (a hole through the skin: no cavity walls to see in it)
        if self.skin.faces:
            sk = self.skin.make(coll)
            with bpy.context.temp_override(active_object=ob, selected_editable_objects=[ob, sk], selected_objects=[ob, sk]):
                bpy.ops.object.join()
        ob.location = G(*at)
        for p in self.parts:
            po = p.make(coll, recalc=True)
            po.parent = ob
            po.matrix_parent_inverse.identity()
            po.location = (0, 0, 0)
        return ob


# ------------------------------------------------------------------ the craft

def cart():
    c = Craft('cart')
    s, k = c.solid, c.skin
    # tub
    loft(s, [chamfer_ring(-1.55, 0.55, -0.3, 0.0, 0.15), chamfer_ring(-1.25, 0.65, -0.35, 0.15, 0.1), chamfer_ring(1.55, 0.65, -0.35, 0.15, 0.1)], 'Hull', PAINT_MAIN, grime=0.3)
    # seat, dash, wheel
    s.box([-0.3, 0.15, -0.1], [0.3, 0.5, 0.45], 'Fabric')
    s.box([-0.3, 0.5, 0.33], [0.3, 1.1, 0.48], 'Fabric')
    s.box([-0.6, 0.15, -0.95], [0.6, 0.55, -0.65], 'Console')
    # (low and forward: from the driver's eye only its rim shows at the bottom of the view)
    s.cylinder((0, 0.5, -0.62), (0, 0.76, -0.46), 0.03, 6, 'Metal')
    # the wheel: a rim and two spokes (a solid disc read as a blot at the bottom of the view)
    import math
    cx, cy, cz = 0, 0.78, -0.445
    # its plane faces the driver along the column (tilted back ~45 degrees)
    ux, uy, uz = 1, 0, 0
    vx, vy, vz = 0, 0.707, 0.707
    pts = [(cx + 0.16 * (math.cos(a) * ux + math.sin(a) * vx), cy + 0.16 * (math.cos(a) * uy + math.sin(a) * vy), cz + 0.16 * (math.cos(a) * uz + math.sin(a) * vz))
           for a in [i * math.pi / 6 for i in range(12)]]
    for i in range(12):
        s.cylinder(pts[i], pts[(i + 1) % 12], 0.018, 5, 'Metal')
    s.cylinder(pts[0], pts[6], 0.012, 5, 'Metal')
    s.cylinder((cx, cy, cz), pts[9], 0.012, 5, 'Metal')
    # roll cage
    for x in (-0.6, 0.6):
        for z in (-0.7, 0.9):
            s.box([x - 0.03, 0.15, z - 0.03], [x + 0.03, 1.36, z + 0.03], 'Metal')
        s.box([x - 0.03, 1.3, -0.73], [x + 0.03, 1.36, 0.93], 'Metal')
    for z in (-0.7, 0.9):
        s.box([-0.63, 1.3, z - 0.03], [0.63, 1.36, z + 0.03], 'Metal')
    # cargo bed
    s.box([-0.65, 0.15, 0.6], [0.65, 0.3, 1.5], 'Grate')
    for x in (-0.63, 0.63):
        s.box([x - 0.02, 0.3, 0.6], [x + 0.02, 0.6, 1.5], 'Metal')
    # wheels and fenders
    for sx in (-1, 1):
        for z in (-1.05, 1.05):
            wheel(s, sx * 0.72, -0.42, z, 0.38, 0.22, sx)
            s.box([sx * 0.6 if sx > 0 else -0.86, 0.0, z - 0.45], [0.86 if sx > 0 else -0.6, 0.06, z + 0.45], 'Hull', PAINT_SECOND)
    # headlights and side stripes
    for x in (-0.4, 0.4):
        face(k, [(x - 0.12, -0.12, -1.56), (x + 0.12, -0.12, -1.56), (x + 0.12, -0.02, -1.56), (x - 0.12, -0.02, -1.56)], (0, 0, -1), 'WindowGlow')
    for sx in (-1, 1):
        face(k, [(sx * 0.66, -0.2, -1.1), (sx * 0.66, -0.2, 1.4), (sx * 0.66, -0.08, 1.4), (sx * 0.66, -0.08, -1.1)], (sx, 0, 0), 'Hull', PAINT_STRIPE)
    return c


def crate():
    c = Craft('crate')
    s, k = c.solid, c.skin
    # shell: floor, roof, sides, front (the rear is the door)
    s.box([-1.3, -0.15, -3.5], [1.3, 0, 3.5], 'Hull', PAINT_SECOND, grime=0.4)
    s.box([-1.3, 2.5, -3.5], [1.3, 2.7, 3.5], 'Hull', PAINT_MAIN, grime=0.3)
    for sx in (-1, 1):
        s.box([sx * 1.18 if sx > 0 else -1.3, 0, -3.5], [1.3 if sx > 0 else -1.18, 2.5, 3.5], 'Hull', PAINT_MAIN, grime=0.3)
        # corrugation ribs
        for z in [-3.1 + 0.5 * i for i in range(13)]:
            s.box([sx * 1.3 if sx > 0 else -1.36, 0.1, z - 0.06], [1.36 if sx > 0 else -1.3, 2.4, z + 0.06], 'Hull', PAINT_MAIN, grime=0.4)
    s.box([-1.18, 0, -3.5], [1.18, 2.5, -3.38], 'Hull', PAINT_MAIN, grime=0.3)
    # corner posts and feet
    for sx in (-1, 1):
        for z in (-3.5, 3.5):
            s.box([sx * 1.3 - 0.09, -0.14, z - 0.09], [sx * 1.3 + 0.09, 2.69, z + 0.09], 'Metal')  # (1 cm inside the base and the roof: not in their planes)
        for z in (-3.2, 3.2):
            s.box([sx * 1.1 - 0.15, -0.45, z - 0.15], [sx * 1.1 + 0.15, -0.15, z + 0.15], 'Metal')
    # door panel on the starboard rear corner
    s.box([1.36, 1.0, 3.1], [1.48, 1.4, 3.45], 'Console')
    face(k, [(1.49, 1.08, 3.15), (1.49, 1.08, 3.4), (1.49, 1.32, 3.4), (1.49, 1.32, 3.15)], (1, 0, 0), 'Screen')
    # inside: a light, hazard stripes along the floor edges
    face(k, [(-0.5, 2.48, -1.5), (0.5, 2.48, -1.5), (0.5, 2.48, 1.5), (-0.5, 2.48, 1.5)], (0, -1, 0), 'LightPanel')
    for sx in (-1, 1):
        face(k, [(sx * 1.17, 0.01, -3.3), (sx * 1.17, 0.01, 3.4), (sx * 1.17, 0.12, 3.4), (sx * 1.17, 0.12, -3.3)], (-sx, 0, 0), 'Hazard')
        face(k, [(sx * 1.37, 2.0, -3.0), (sx * 1.37, 2.0, 3.0), (sx * 1.37, 2.2, 3.0), (sx * 1.37, 2.2, -3.0)], (sx, 0, 0), 'Hull', PAINT_STRIPE)
    # the door (hinged along its bottom edge at z 3.5)
    d = c.part('door')
    d.box([-1.18, 0, 3.5], [1.18, 2.5, 3.62], 'Hull', PAINT_MAIN, grime=0.3)
    for x in (-0.6, 0.6):
        d.box([x - 0.04, 0.1, 3.62], [x + 0.04, 2.4, 3.68], 'Metal')
    d.box([-1.1, 0.02, 3.42], [1.1, 0.04, 3.5], 'Hazard')
    return c


def tank():
    """a Battlezone-ish hover-tank: wedge nose, two seats under a canopy, a rear
    compartment (TANK.rooms) with a ramp; its skin wound by hand (it is open
    over the cockpit and at the back)"""
    c = Craft('tank')
    s, k = c.solid, c.skin
    H, P2 = PAINT_MAIN, PAINT_SECOND
    # underside, nose, flanks
    face(k, [(-2.2, -0.5, -4.2), (2.2, -0.5, -4.2), (2.2, -0.5, 4.2), (-2.2, -0.5, 4.2)], (0, -1, 0), 'Hull', P2, 0.4)
    face(k, [(-2.2, -0.5, -4.2), (2.2, -0.5, -4.2), (2.2, 0.0, -4.2), (-2.2, 0.0, -4.2)], (0, 0, -1), 'Hull', H, 0.3)
    face(k, [(-2.2, 0.0, -4.2), (2.2, 0.0, -4.2), (2.2, 1.0, -2.8), (-2.2, 1.0, -2.8)], (0, 1, -0.7), 'Hull', H, 0.3)
    for sx in (-1, 1):
        x = sx * 2.2
        face(k, [(x, -0.5, -4.2), (x, -0.5, 4.2), (x, 0.0, 4.2), (x, 0.0, -4.2)], (sx, 0, 0), 'Hull', H, 0.35)
        face(k, [(x, 0.0, -4.2), (x, 0.0, -2.8), (x, 1.0, -2.8)], (sx, 0, 0), 'Hull', H, 0.3)
        face(k, [(x, 0.0, -2.8), (x, 0.0, 4.2), (x, 1.0, 4.2), (x, 1.0, -2.8)], (sx, 0, 0), 'Hull', H, 0.3)
        face(k, [(x, 1.0, -0.2), (x, 1.0, 4.2), (x, 2.0, 4.2), (x, 2.0, -0.2)], (sx, 0, 0), 'Hull', H, 0.3)
        # the sill either side of the canopy
        face(k, [(sx * 1.2, 1.0, -2.8), (x, 1.0, -2.8), (x, 1.0, -0.2), (sx * 1.2, 1.0, -0.2)], (0, 1, 0), 'Hull', P2, 0.3)
        # stripe, skirts
        face(k, [(sx * 2.21, 0.2, -3.6), (sx * 2.21, 0.2, 4.0), (sx * 2.21, 0.45, 4.0), (sx * 2.21, 0.45, -3.6)], (sx, 0, 0), 'Hull', PAINT_STRIPE)
        s.box([min(x, x + sx * 0.12), -0.45, -3.6], [max(x, x + sx * 0.12), 0.15, 3.8], 'Hull', P2, grime=0.4)
    # the rear body: its face behind the canopy (a doorway through it), its roof, the frame round the ramp
    for (a, b) in ((-2.2, -0.6), (0.6, 2.2)):
        face(k, [(a, 1.0, -0.2), (b, 1.0, -0.2), (b, 2.0, -0.2), (a, 2.0, -0.2)], (0, 0, -1), 'Hull', H, 0.3)
    face(k, [(-0.6, 1.6, -0.2), (0.6, 1.6, -0.2), (0.6, 2.0, -0.2), (-0.6, 2.0, -0.2)], (0, 0, -1), 'Hull', H, 0.3)
    face(k, [(-2.2, 2.0, -0.2), (2.2, 2.0, -0.2), (2.2, 2.0, 4.2), (-2.2, 2.0, 4.2)], (0, 1, 0), 'Hull', P2, 0.35)
    for (a, b) in ((-2.2, -1.5), (1.5, 2.2)):
        face(k, [(a, -0.5, 4.2), (b, -0.5, 4.2), (b, 2.0, 4.2), (a, 2.0, 4.2)], (0, 0, 1), 'Hull', P2, 0.4)
    face(k, [(-1.5, 1.6, 4.2), (1.5, 1.6, 4.2), (1.5, 2.0, 4.2), (-1.5, 2.0, 4.2)], (0, 0, 1), 'Hull', P2, 0.4)
    face(k, [(-1.5, -0.5, 4.2), (1.5, -0.5, 4.2), (1.5, -0.4, 4.2), (-1.5, -0.4, 4.2)], (0, 0, 1), 'Hull', P2, 0.4)
    # side cannons, a dorsal sensor, the hover pads
    for sx in (-1, 1):
        s.cylinder((sx * 2.55, 1.35, 2.2), (sx * 2.55, 1.35, -2.0), 0.3, 10, 'Hull', P2)
        s.cylinder((sx * 2.55, 1.35, -2.0), (sx * 2.55, 1.35, -4.6), 0.1, 8, 'Metal')
        for z in (-2.8, 2.8):
            s.cylinder((sx * 1.7, -0.45, z), (sx * 1.7, -0.6, z), 0.6, 14, 'Metal', caps=(True, False))  # (its top inside the hull, under the cockpit floor)
            s.cylinder((sx * 1.7, -0.6, z), (sx * 1.7, -0.62, z), 0.45, 14, 'EngineGlow', caps=(False, True))
    s.box([-0.5, 2.0, 2.4], [0.5, 2.35, 3.6], 'Metal')
    s.cylinder((0, 2.35, 3.0), (0, 2.5, 3.0), 0.35, 10, 'Hull', P2)
    # inside: the cockpit (low walls; the canopy above), the compartment behind
    room_shell(k, (-1.2, -0.3, -2.8), (1.2, 1.0, -0.2), open_sides=('+y',), holes={'+z': [(-0.6, 0.6, -0.3, 1.6)]}, low={'-z': 0.4})
    room_shell(k, (-1.6, -0.3, -0.2), (1.6, 1.8, 4.2), open_sides=('+z',), holes={'-z': [(-0.6, 0.6, -0.3, 1.6)]})
    k.box([-1.1, -0.3, -2.8], [1.1, 0.4, -2.45], 'Console')
    face(k, [(-1.0, 0.42, -2.78), (1.0, 0.42, -2.78), (1.0, 0.42, -2.47), (-1.0, 0.42, -2.47)], (0, 1, 0), 'Screen')
    for sx in (-1, 1):
        k.box([sx * 0.55 - 0.25, -0.3, -1.9], [sx * 0.55 + 0.25, 0.15, -1.35], 'Fabric')
        k.box([sx * 0.55 - 0.25, 0.15, -1.35], [sx * 0.55 + 0.25, 0.9, -1.22], 'Fabric')
        k.box([min(sx * 1.2, sx * 1.6), -0.3, 0.6], [max(sx * 1.2, sx * 1.6), 0.15, 3.6], 'Fabric')
    face(k, [(0.75, 0.55, -0.19), (1.5, 0.55, -0.19), (1.5, 1.3, -0.19), (0.75, 1.3, -0.19)], (0, 0, 1), 'Screen')  # the view outside
    face(k, [(-0.5, 1.78, 1.2), (0.5, 1.78, 1.2), (0.5, 1.78, 2.8), (-0.5, 1.78, 2.8)], (0, -1, 0), 'LightPanel')
    # the canopy (hinged at its back, lifts its front) and the ramp
    cp = c.part('canopy')
    # (its back end 5 cm short of the body's front: not in the compartment wall's plane)
    loft(cp, [chamfer_ring(-2.8, 1.2, 1.0, 1.4, 0.15), chamfer_ring(-2.0, 1.2, 1.0, 1.9, 0.3), chamfer_ring(-0.25, 1.2, 1.0, 1.95, 0.3)], 'Console', NOPAINT)
    r = c.part('ramp')
    r.box([-1.5, -0.4, 4.2], [1.5, 1.6, 4.32], 'Hull', P2, grime=0.3)
    for y in (0.0, 0.5, 1.0):
        r.box([-1.3, y, 4.32], [1.3, y + 0.05, 4.36], 'Metal')
    return c


def lifter():
    c = Craft('lifter')
    s, k = c.solid, c.skin
    # spine over the cradle, cockpit forward, tail
    loft(s, [chamfer_ring(-9.2, 1.8, 2.9, 5.0, 0.45), chamfer_ring(12, 1.8, 2.9, 5.0, 0.45)], 'Hull', PAINT_MAIN, grime=0.3)
    loft(s, [chamfer_ring(-14.5, 1.4, 2.2, 4.4, 0.6), chamfer_ring(-13, 2.2, 1.5, 5.2, 0.6), chamfer_ring(-9, 2.2, 1.5, 5.2, 0.6)], 'Hull', PAINT_MAIN, grime=0.3)
    c.cuts = [([-2.6, 1.8, -12.2], [-1.6, 4.0, -10.8])]  # (the hatch, through the pod's port side)
    loft(s, [chamfer_ring(12, 1.3, 3.2, 4.6, 0.3), chamfer_ring(14, 0.9, 3.4, 4.4, 0.25)], 'Hull', PAINT_SECOND, grime=0.3)
    # outrigger beams, engines on their ends, legs below
    for z in (-6.5, 6.5):
        s.box([-5.8, 3.2, z - 0.7], [5.8, 4.2, z + 0.7], 'Hull', PAINT_SECOND, grime=0.3)
        for sx in (-1, 1):
            s.cylinder((sx * 6.6, 4.9, z), (sx * 6.6, 2.5, z), 1.1, 14, 'Metal', caps=(True, False))
            s.cylinder((sx * 6.6, 2.5, z), (sx * 6.6, 2.45, z), 0.85, 14, 'EngineGlow', caps=(False, True))
            strut(s, sx * 4.9, -0.75, 3.2, z, t=0.35, foot=1.0)
    # clamp jaws at the container's corners, hazard-striped
    for sx in (-1, 1):
        for z in (-3.2, 3.2):
            s.box([sx * 1.4 - 0.2, 2.65, z - 0.25], [sx * 1.4 + 0.2, 2.95, z + 0.25], 'Hazard')
    # canopy, cradle floodlights, stripes
    face(k, [(-1.1, 3.3, -14.25), (1.1, 3.3, -14.25), (1.6, 4.6, -13.35), (-1.6, 4.6, -13.35)], (0, 0.6, -1), 'Console')
    # a side window to starboard (the hatch is to port)
    face(k, [(2.21, 3.0, -12.8), (2.21, 3.0, -10.2), (2.21, 4.5, -10.2), (2.21, 4.5, -12.8)], (1, 0, 0), 'Console')
    for sx in (-1, 1):
        face(k, [(sx * 1.81, 3.6, -8.8), (sx * 1.81, 3.6, 11.6), (sx * 1.81, 3.9, 11.6), (sx * 1.81, 3.9, -8.8)], (sx, 0, 0), 'Hull', PAINT_STRIPE)
    for z in (-4.5, 0, 4.5):
        face(k, [(-0.6, 2.88, z - 0.6), (0.6, 2.88, z - 0.6), (0.6, 2.88, z + 0.6), (-0.6, 2.88, z + 0.6)], (0, -1, 0), 'LightPanel')
    # the flight deck (see LIFTER.rooms): floor, ceiling, low walls forward to
    # see out over, the port hatch, the seat and console
    face(k, [(-1.8, 1.8, -13.6), (1.8, 1.8, -13.6), (1.8, 1.8, -9.4), (-1.8, 1.8, -9.4)], (0, 1, 0), 'Floor')
    face(k, [(-1.8, 4.6, -12.0), (1.8, 4.6, -12.0), (1.8, 4.6, -9.4), (-1.8, 4.6, -9.4)], (0, -1, 0), 'Ceiling')
    face(k, [(-1.8, 1.8, -13.6), (1.8, 1.8, -13.6), (1.8, 2.8, -13.6), (-1.8, 2.8, -13.6)], (0, 0, 1), 'Wall')
    face(k, [(-1.8, 1.8, -9.4), (1.8, 1.8, -9.4), (1.8, 4.6, -9.4), (-1.8, 4.6, -9.4)], (0, 0, -1), 'Wall')
    face(k, [(1.8, 1.8, -13.6), (1.8, 1.8, -9.4), (1.8, 3.0, -9.4), (1.8, 3.0, -13.6)], (-1, 0, 0), 'Wall')
    for (z0, z1) in ((-13.6, -12.2), (-10.8, -9.4)):
        face(k, [(-1.8, 1.8, z0), (-1.8, 1.8, z1), (-1.8, 3.0, z1), (-1.8, 3.0, z0)], (1, 0, 0), 'Wall')
    face(k, [(-1.8, 4.0, -12.2), (-1.8, 4.0, -10.8), (-1.8, 4.6, -10.8), (-1.8, 4.6, -12.2)], (1, 0, 0), 'Wall')
    face(k, [(-2.25, 1.75, -12.2), (-1.8, 1.75, -12.2), (-1.8, 1.75, -10.8), (-2.25, 1.75, -10.8)], (0, 1, 0), 'Floor')
    k.box([-1.6, 1.8, -13.6], [1.6, 2.8, -13.1], 'Console')
    face(k, [(-1.5, 2.82, -13.55), (1.5, 2.82, -13.55), (1.5, 2.82, -13.15), (-1.5, 2.82, -13.15)], (0, 1, 0), 'Screen')
    k.box([-0.32, 1.8, -12.8], [0.32, 2.3, -12.2], 'Fabric')
    k.box([-0.32, 2.3, -12.2], [0.32, 3.2, -12.05], 'Fabric')
    face(k, [(-0.5, 4.58, -11.0), (0.5, 4.58, -11.0), (0.5, 4.58, -10.0), (-0.5, 4.58, -10.0)], (0, -1, 0), 'LightPanel')
    return c


def dropship():
    c = Craft('dropship')
    s, k = c.solid, c.skin
    # fuselage: nose to the open rear (the troop bay)
    # (open at the back, so not a closed solid: normals can't be worked out
    # by recalculation, which turned some inward. Rings reversed: loft winds
    # its quads inward for rings as chamfer_ring makes them.)
    rings = [chamfer_ring(-14.5, 0.6, -0.4, 0.8, 0.3), chamfer_ring(-12, 1.6, -1.0, 1.9, 0.5),
             chamfer_ring(-9, 2.2, -1.2, 2.6, 0.6), chamfer_ring(8, 2.2, -1.2, 2.6, 0.6), chamfer_ring(10, 2.2, -1.2, 2.6, 0.05)]
    loft(k, [list(reversed(r)) for r in rings], 'Hull', PAINT_MAIN, cap_back=False, grime=0.3)
    # stub wings, engine nacelles, tail fins
    # (two wings, from the hull out: one slab through it crossed the troop bay)
    for sx in (-1, 1):
        slab(s, [(sx * 2.15, -1.0), (sx * 7.2, -1.0), (sx * 7.2, 5.0), (sx * 2.15, 5.0)], 0.5, 1.15, 'Hull', PAINT_SECOND, grime=0.3)
    for sx in (-1, 1):
        s.cylinder((sx * 7.4, 0.8, -2.5), (sx * 7.4, 0.8, 6.5), 1.3, 14, 'Hull', PAINT_MAIN)
        s.cylinder((sx * 7.4, 0.8, 6.5), (sx * 7.4, 0.8, 6.6), 1.05, 14, 'EngineGlow', caps=(False, True))
        s.box([sx * 0.9 - 0.12, 2.5, 6.5], [sx * 0.9 + 0.12, 4.6, 9.8], 'Hull', PAINT_SECOND)
        # sponsons for the legs, struts down to the deck
        s.box([sx * 2.15 if sx > 0 else -3.75, -1.2, -8.3], [3.75 if sx > 0 else -2.15, -0.6, -6.7], 'Hull', PAINT_SECOND)
        s.box([sx * 2.15 if sx > 0 else -3.75, -1.2, 5.7], [3.75 if sx > 0 else -2.15, -0.6, 7.3], 'Hull', PAINT_SECOND)
        for z in (-7.5, 6.5):
            strut(s, sx * 3.4, -2.73, -0.9, z, t=0.35, foot=1.0)
        # gun pods under the wings
        s.cylinder((sx * 4.6, 0.2, -1.5), (sx * 4.6, 0.2, 3.5), 0.35, 8, 'Metal')
    # belly clamp rails
    for sx in (-1, 1):
        s.box([sx * 1.5 - 0.15, -1.5, -3.2], [sx * 1.5 + 0.15, -1.2, 4.2], 'Hazard')
    # the rear frame round the bay opening, and the bay inside
    for sx in (-1, 1):
        face(k, [(sx * 1.6, -1.2, 10), (sx * 2.2, -1.2, 10), (sx * 2.2, 2.6, 10), (sx * 1.6, 2.6, 10)], (0, 0, 1), 'Hull', PAINT_SECOND)
    face(k, [(-1.6, 2.2, 10), (1.6, 2.2, 10), (1.6, 2.6, 10), (-1.6, 2.6, 10)], (0, 0, 1), 'Hull', PAINT_SECOND)
    # the troop bay (walkable: see DROPSHIP.rooms): floor, walls, ceiling, the
    # bulkhead forward with a doorway to the cockpit
    face(k, [(-1.6, -1.0, -6), (1.6, -1.0, -6), (1.6, -1.0, 10), (-1.6, -1.0, 10)], (0, 1, 0), 'Floor')
    face(k, [(-1.6, 2.2, -6), (1.6, 2.2, -6), (1.6, 2.2, 10), (-1.6, 2.2, 10)], (0, -1, 0), 'Ceiling')
    for sx in (-1, 1):
        face(k, [(sx * 1.6, -1.0, -6), (sx * 1.6, -1.0, 10), (sx * 1.6, 2.2, 10), (sx * 1.6, 2.2, -6)], (-sx, 0, 0), 'Wall')
    face(k, [(-1.6, -1.0, -6), (-0.6, -1.0, -6), (-0.6, 2.2, -6), (-1.6, 2.2, -6)], (0, 0, 1), 'Wall')
    face(k, [(0.6, -1.0, -6), (1.6, -1.0, -6), (1.6, 2.2, -6), (0.6, 2.2, -6)], (0, 0, 1), 'Wall')
    face(k, [(-0.6, 1.0, -6), (0.6, 1.0, -6), (0.6, 2.2, -6), (-0.6, 2.2, -6)], (0, 0, 1), 'Wall')
    for sx in (-1, 1):
        k.box([min(sx * 1.15, sx * 1.6), -1.0, -4.5], [max(sx * 1.15, sx * 1.6), -0.55, 8.5], 'Fabric')
        k.box([min(sx * 1.5, sx * 1.6), -0.55, -4.5], [max(sx * 1.5, sx * 1.6), 0.6, 8.5], 'Fabric')
    for z in (-2, 3, 8):
        face(k, [(-0.5, 2.18, z - 1), (0.5, 2.18, z - 1), (0.5, 2.18, z + 1), (-0.5, 2.18, z + 1)], (0, -1, 0), 'LightPanel')
    # the cockpit: low walls (you see out over them), two seats, the console
    face(k, [(-1.3, -0.8, -11), (1.3, -0.8, -11), (1.3, -0.8, -5.8), (-1.3, -0.8, -5.8)], (0, 1, 0), 'Floor')
    face(k, [(-1.3, -1.0, -5.8), (1.3, -1.0, -5.8), (1.3, -0.8, -5.8), (-1.3, -0.8, -5.8)], (0, 0, 1), 'Trim')
    face(k, [(-1.3, 1.9, -9.5), (1.3, 1.9, -9.5), (1.3, 1.9, -5.8), (-1.3, 1.9, -5.8)], (0, -1, 0), 'Ceiling')
    for sx in (-1, 1):
        face(k, [(sx * 1.3, -0.8, -11), (sx * 1.3, -0.8, -5.8), (sx * 1.3, 0.3, -5.8), (sx * 1.3, 0.3, -11)], (-sx, 0, 0), 'Wall')
        face(k, [(sx * 1.3, 0.3, -9.5), (sx * 1.3, 0.3, -5.8), (sx * 1.3, 1.9, -5.8), (sx * 1.3, 1.9, -9.5)], (-sx, 0, 0), 'Wall')
    face(k, [(-1.3, -0.8, -5.8), (-0.6, -0.8, -5.8), (-0.6, 1.9, -5.8), (-1.3, 1.9, -5.8)], (0, 0, -1), 'Wall')
    face(k, [(0.6, -0.8, -5.8), (1.3, -0.8, -5.8), (1.3, 1.9, -5.8), (0.6, 1.9, -5.8)], (0, 0, -1), 'Wall')
    face(k, [(-0.6, 1.0, -5.8), (0.6, 1.0, -5.8), (0.6, 1.9, -5.8), (-0.6, 1.9, -5.8)], (0, 0, -1), 'Wall')
    k.box([-1.2, -0.8, -11], [1.2, 0.1, -10.5], 'Console')
    # a display in front of each seat (one strip the console's width glowed too much)
    for x in (-0.6, 0.6):
        face(k, [(x - 0.26, 0.12, -10.9), (x + 0.26, 0.12, -10.9), (x + 0.26, 0.12, -10.62), (x - 0.26, 0.12, -10.62)], (0, 1, 0), 'Screen')
    for sx in (-1, 1):
        k.box([sx * 0.6 - 0.28, -0.8, -9.9], [sx * 0.6 + 0.28, -0.35, -9.3], 'Fabric')
        k.box([sx * 0.6 - 0.28, -0.35, -9.3], [sx * 0.6 + 0.28, 0.5, -9.15], 'Fabric')
    face(k, [(-0.5, 1.88, -8.4), (0.5, 1.88, -8.4), (0.5, 1.88, -7.0), (-0.5, 1.88, -7.0)], (0, -1, 0), 'LightPanel')
    # cockpit glazing, stripes
    face(k, [(-1.3, 1.95, -12.0), (1.3, 1.95, -12.0), (1.8, 2.55, -10.0), (-1.8, 2.55, -10.0)], (0, 1, -0.6), 'Console')
    for sx in (-1, 1):
        face(k, [(sx * 2.21, 0.2, -8.5), (sx * 2.21, 0.2, 7.5), (sx * 2.21, 0.55, 7.5), (sx * 2.21, 0.55, -8.5)], (sx, 0, 0), 'Hull', PAINT_STRIPE)
    # the ramp (hinged along its bottom edge at the rear)
    r = c.part('ramp')
    r.box([-1.6, -1.2, 10], [1.6, 2.2, 10.35], 'Hull', PAINT_MAIN, grime=0.3)
    for z in (10.36,):
        for y in [-0.8 + 0.5 * i for i in range(6)]:
            r.box([-1.4, y, 10.35], [1.4, y + 0.06, z + 0.04], 'Metal')
    return c


def fighter():
    c = Craft('fighter')
    s, k = c.solid, c.skin
    loft(s, [chamfer_ring(-6.5, 0.25, -0.2, 0.3, 0.1), chamfer_ring(-4, 0.9, -0.7, 0.9, 0.3),
             chamfer_ring(-1, 1.2, -0.9, 1.2, 0.4), chamfer_ring(4, 1.2, -0.9, 1.0, 0.4), chamfer_ring(5.5, 0.9, -0.6, 0.7, 0.3)], 'Hull', PAINT_MAIN, grime=0.25)
    cp = c.part('canopy')  # (lifts on its hinge at the back while you climb in or out)
    loft(cp, [chamfer_ring(-4, 0.45, 0.85, 1.0, 0.15), chamfer_ring(-2.5, 0.6, 0.9, 1.6, 0.3), chamfer_ring(-0.8, 0.5, 0.9, 1.4, 0.3)], 'Console', NOPAINT)
    for sx in (-1, 1):
        slab(s, [(sx * 1.1, 0.4), (sx * 5.0, 3.0), (sx * 5.0, 4.6), (sx * 1.1, 4.6)], -0.05, 0.25, 'Hull', PAINT_SECOND, grime=0.3)
        s.cylinder((sx * 5.1, 0.6, 3.6), (sx * 5.1, -0.4, 3.6), 0.55, 12, 'Metal', caps=(True, False))
        s.cylinder((sx * 5.1, -0.4, 3.6), (sx * 5.1, -0.45, 3.6), 0.42, 12, 'EngineGlow', caps=(False, True))
        s.box([sx * 0.8 - 0.06, 0.9, 3.4], [sx * 0.8 + 0.06, 2.3, 5.4], 'Hull', PAINT_SECOND)
        face(k, [(sx * 1.21, -0.1, -3.5), (sx * 1.21, -0.1, 3.5), (sx * 1.21, 0.15, 3.5), (sx * 1.21, 0.15, -3.5)], (sx, 0, 0), 'Hull', PAINT_STRIPE)
    s.cylinder((0, 0.1, 5.4), (0, 0.1, 6.3), 0.6, 12, 'Metal', caps=(False, False))
    s.cylinder((0, 0.1, 6.2), (0, 0.1, 6.25), 0.5, 12, 'EngineGlow', caps=(False, True))
    for (x, z) in ((-1.4, -3.5), (1.4, -3.5), (-2.4, 2.5), (2.4, 2.5)):
        strut(s, x, -2.03, -0.7, z, t=0.18, foot=0.5)
    return c


# ------------------------------------------------------------------ build and export

def build_vehicles(export=True):
    for k in MATS:
        mat(k)
    sc, coll = craft_scene()
    for o in list(coll.objects):
        me = o.data if o.type == 'MESH' else None
        bpy.data.objects.remove(o, do_unlink=True)
        if me and me.users == 0:
            bpy.data.meshes.remove(me)
    made = {}
    x = 0
    for fn, gap in ((cart, 8), (crate, 8), (tank, 12), (lifter, 22), (dropship, 22), (fighter, 14)):
        c = fn()
        made[c.name] = c.make(coll, (x, 0, 0))
        x += gap * 2
    out = {}
    for name, ob in made.items():
        tris = sum(len(p.vertices) - 2 for o in [ob, *ob.children] for p in o.data.polygons)
        out[name] = tris
    if export:
        export_craft()
    return out


def export_craft():
    import os
    os.makedirs(os.path.dirname(CRAFT_GLB), exist_ok=True)
    coll = bpy.data.collections.get(CRAFT_COLL)
    objs = [o for o in coll.objects if not o.name.startswith('_')]
    for s in bpy.data.scenes:
        for vl in s.view_layers:
            vl.update()
            for o in vl.objects:
                if o is not None:
                    o.select_set(o in objs, view_layer=vl)
    for me in list(bpy.data.meshes):
        if me.users == 0:
            bpy.data.meshes.remove(me)
    kw = dict(filepath=CRAFT_GLB, export_format='GLB', use_selection=True, export_yup=True, export_apply=True)
    props = bpy.ops.export_scene.gltf.get_rna_type().properties
    if 'export_vertex_color' in props:
        kw['export_vertex_color'] = 'ACTIVE'
    if 'export_all_vertex_colors' in props:
        kw['export_all_vertex_colors'] = False
    if 'export_colors' in props:
        kw['export_colors'] = True
    bpy.ops.export_scene.gltf(**kw)
    bpy.ops.wm.save_as_mainfile(filepath=CRAFT_BLEND, copy=True)
    return CRAFT_GLB
