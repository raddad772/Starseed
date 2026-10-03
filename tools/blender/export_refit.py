# Export the refit fleet from the open Blender file (Dave's redesign, ~/aackpnt-craft-redesign.blend):
# the Bastion scene -> assets/models/bastion.glb, the Craft scene -> assets/models/craft.glb, and a
# copy of the whole file -> assets/blender/fleet-refit.blend. Run in Blender (MCP):
#   exec(open('/Users/dave/dev/starseed/tools/blender/export_refit.py').read()); export_all()
# It never saves over the open file, and puts back the selection and the window's scene after.

import bpy, os

ROOT = '/Users/dave/dev/starseed/assets'
SKIP = ('exclude from export', 'PREVIEW', 'DIAGRAM')   # (collections the game doesn't take)


def _objects(scene):
    out = []
    for c in [scene.collection] + list(scene.collection.children_recursive):
        if any(s.lower() in c.name.lower() for s in SKIP):
            continue
        for o in c.objects:
            if o.name.startswith('_') or o.get('exclude_from_game_export'):
                continue
            if o not in out:
                out.append(o)
    return out


def _export(scene, path):
    objs = _objects(scene)
    win = bpy.context.window
    prev_scene = win.scene
    win.scene = scene
    vl = scene.view_layers[0]
    sel = [o for o in vl.objects if o.select_get(view_layer=vl)]
    act = vl.objects.active
    for o in vl.objects:
        o.select_set(o in objs, view_layer=vl)
    kw = dict(filepath=path, export_format='GLB', use_selection=True, export_yup=True, export_apply=True)
    props = bpy.ops.export_scene.gltf.get_rna_type().properties
    if 'export_vertex_color' in props:
        kw['export_vertex_color'] = 'ACTIVE'
    if 'export_all_vertex_colors' in props:
        kw['export_all_vertex_colors'] = False
    if 'export_colors' in props:
        kw['export_colors'] = True
    if 'export_extras' in props:
        kw['export_extras'] = True        # (the objects' custom properties: doors, roles, turbolift data)
    if 'export_animations' in props:
        kw['export_animations'] = False
    try:
        bpy.ops.export_scene.gltf(**kw)
    finally:
        for o in vl.objects:
            o.select_set(o in sel, view_layer=vl)
        vl.objects.active = act
        win.scene = prev_scene
    return len(objs)


def export_all():
    os.makedirs(ROOT + '/models', exist_ok=True)
    os.makedirs(ROOT + '/blender', exist_ok=True)
    n1 = _export(bpy.data.scenes['Bastion'], ROOT + '/models/bastion.glb')
    n2 = _export(bpy.data.scenes['Craft'], ROOT + '/models/craft.glb')
    bpy.ops.wm.save_as_mainfile(filepath=ROOT + '/blender/fleet-refit.blend', copy=True)
    return {'bastion objects': n1, 'craft objects': n2}
