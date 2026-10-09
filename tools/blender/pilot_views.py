"""What each pilot sees: from every craft's pilot eye, rays across the game camera's view (70 deg
vertical at 16:10, looking ahead) through its GLB, and what each meets: out through glass (a view),
out through nothing (an opening), or the ship (blocked). Prints a score per craft and writes a map
of the view per craft (blue: through glass; pale: open; grey: the ship; dark: glass then the ship).
Run headless: blender -b --factory-startup --python tools/blender/pilot_views.py -- outdir [key ...]
(the craft from src/sim/layouts/{horizon,expedition,pioneer}.data.js, or only those keys; the maps
are PPM, views.json the scores.) tools/tests/pilot-view.test.mjs checks the middle of each view.
"""
import bpy, json, math, sys
from pathlib import Path
from mathutils import Vector

args = sys.argv[sys.argv.index('--') + 1:]
OUT = Path(args[0]); OUT.mkdir(parents=True, exist_ok=True)
ROOT = Path(__file__).resolve().parents[2]
SEATS = {}
for fleet in ('horizon', 'expedition', 'pioneer'):
    src = (ROOT / 'src/sim/layouts' / f'{fleet}.data.js').read_text()
    for key, t in json.loads(src[src.index('=') + 1:].strip().rstrip(';')).items():
        if args[1:] and key not in args[1:]: continue
        seat = next((q for q in t['seats'] if q.get('pilot')), t['seats'][0])
        SEATS[key] = {'model': t['model'], 'eye': seat['eye'], 'heading': seat.get('heading')}
W, H, VFOV = 128, 80, 70
G = lambda p: Vector((p[0], -p[2], p[1]))  # game -> Blender

def classify(depsgraph, scene, o, d):
    glass = False
    for _ in range(12):
        hit, loc, normal, face, ob, _m = scene.ray_cast(depsgraph, o, d, distance=400)
        if not hit: return 'glass' if glass else 'open'
        slots = ob.material_slots; mesh = ob.data
        name = slots[mesh.polygons[face].material_index].material.name if slots and face < len(mesh.polygons) and slots[mesh.polygons[face].material_index].material else ''
        if 'Glass' not in name: return 'glass-blocked' if glass else 'blocked'
        glass = True; o = loc + d * 1e-3
    return 'blocked'

report = {}
for key, s in SEATS.items():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=str(ROOT / s['model']))
    scene = bpy.context.scene; depsgraph = bpy.context.evaluated_depsgraph_get()
    eye = G(s['eye']); fwd = G(s.get('heading') or [0, 0, -1]).normalized(); up = Vector((0, 0, 1)); right = fwd.cross(up).normalized()
    th = math.tan(math.radians(VFOV) / 2); tw = th * W / H
    counts = {'glass': 0, 'open': 0, 'blocked': 0, 'glass-blocked': 0}; px = []
    # (the middle band, where the horizon ahead is: what a pilot needs most)
    band = {'glass': 0, 'open': 0, 'blocked': 0, 'glass-blocked': 0}
    for j in range(H):
        row = []
        for i in range(W):
            u = (2 * (i + 0.5) / W - 1) * tw; v = (1 - 2 * (j + 0.5) / H) * th
            d = (fwd + right * u + up * v).normalized(); c = classify(depsgraph, scene, eye, d)
            counts[c] += 1; row.append(c)
            if abs(v) < th * 0.35 and abs(u) < tw * 0.6: band[c] += 1
        px.append(row)
    n = W * H; nb = sum(band.values())
    report[key] = {'view': round((counts['glass'] + counts['open']) / n, 3), 'ahead': round((band['glass'] + band['open']) / nb, 3), 'open': round(counts['open'] / n, 3)}
    # the map as a PPM (converted by the caller)
    col = {'glass': (110, 170, 230), 'open': (235, 225, 170), 'blocked': (70, 72, 76), 'glass-blocked': (30, 40, 60)}
    data = bytearray()
    for row in px:
        for c in row: data += bytes(col[c])
    (OUT / f'{key}.ppm').write_bytes(f'P6 {W} {H} 255\n'.encode() + bytes(data))
    print('VIEW', key, json.dumps(report[key]), flush=True)
(OUT / 'views.json').write_text(json.dumps(report, indent=1))
print('VIEWS_DONE')
