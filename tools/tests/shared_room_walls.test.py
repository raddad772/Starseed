"""Regression checks for authored room partitions, without a Blender runtime."""
import ast
from pathlib import Path
from types import SimpleNamespace
import unittest

builder=Path(__file__).resolve().parents[1]/'blender/build_horizon.py'
tree=ast.parse(builder.read_text())
functions=[n for n in tree.body if isinstance(n,ast.FunctionDef) and n.name in {'_wall_rectangle','_wall_subtract_rect','clean_shared_room_walls'}]
assert len(functions)==3
namespace={};exec(compile(ast.Module(body=functions,type_ignores=[]),str(builder),'exec'),namespace)
clean=namespace['clean_shared_room_walls']

def panel(x0,x1,y0,y1,reverse=False,material='Wall'):
    pts=[(x0,y0,0),(x1,y0,0),(x1,y1,0),(x0,y1,0)]
    return (pts[::-1] if reverse else pts,material,'authored')
def mesh(*panels):return SimpleNamespace(polys=list(panels))
def area(meshes):
    return sum(abs(sum(a[0]*b[1]-b[0]*a[1] for a,b in zip(p,p[1:]+p[:1])))/2
               for m in meshes for p,_,_ in m.polys)

class SharedPartitionTests(unittest.TestCase):
    def test_partial_shared_partition_has_one_visible_surface(self):
        rooms=[mesh(panel(0,8,0,3)),mesh(panel(2,10,0,3))]
        clean(rooms);self.assertAlmostEqual(area(rooms),30)
        first=[m.polys[:] for m in rooms];clean(rooms)
        self.assertEqual([m.polys for m in rooms],first)

    def test_opposing_contact_faces_disappear_only_at_the_join(self):
        walls=[mesh(panel(0,4,0,3)),mesh(panel(2,6,0,3,reverse=True))]
        clean(walls);self.assertAlmostEqual(area(walls),12)

    def test_shared_door_opening_stays_open(self):
        frame=[panel(0,1,0,3),panel(1,3,2,3),panel(3,4,0,3)]
        rooms=[mesh(*frame),mesh(*frame)];clean(rooms)
        self.assertAlmostEqual(area(rooms),8)
        for room in rooms:
            for p,_,_ in room.polys:
                self.assertFalse(min(v[0] for v in p)<2<max(v[0] for v in p) and min(v[1] for v in p)<1<max(v[1] for v in p))

    def test_other_materials_and_authored_metadata_are_preserved(self):
        a=panel(0,4,0,3,material='Floor');b=panel(0,4,0,3,material='LightPanel')
        rooms=[mesh(a,b)];clean(rooms)
        self.assertEqual(rooms[0].polys,[a,b])

if __name__=='__main__':unittest.main()
