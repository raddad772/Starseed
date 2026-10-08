import * as THREE from 'three';

// A sealed depth glimpse beneath the traversable zero-g shaft. The forcefield
// is the same floor used by collision; the void below is deliberately inaccessible.
export function buildTransitShaft(c,{root,scene,mat,box,cylinder,lamp}){
 const [a,b,d,e]=c.bounds,y=c.base,x=(a+b)/2,z=(d+e)/2,bottom=y-120;
 for(const xx of [a-.3,b+.3])box(xx,(bottom+y)/2,z,.6,y-bottom,e-d,'concrete');
 for(const zz of [d-.3,e+.3])box(x,(bottom+y)/2,zz,b-a,y-bottom,.6,'concrete');
 box(x,bottom-.3,z,b-a,.6,e-d,'dark');
 for(const xx of [a+.7,b-.7])for(const zz of [d+.7,e-.7]){
  cylinder([xx,bottom,zz],[xx,c.ceiling,zz],.16,'metal');
  for(let h=y-6;h>bottom;h-=12){box(xx,h,zz,.22,.5,.22,'cyan');}
 }
 for(let h=y-8;h>bottom;h-=16){
  for(const zz of [d+.3,e-.3])box(x,h,zz,b-a,.28,.4,'rust');
  for(const xx of [a+.3,b-.3])box(xx,h,z,.4,.28,e-d,'rust');
  const l=new THREE.PointLight(0x608dba,30,22,2);l.position.set(x,h,z);scene.add(l);
 }
 const field=new THREE.Mesh(new THREE.PlaneGeometry(b-a,e-d),new THREE.MeshBasicMaterial({color:'#91cbed',transparent:true,opacity:.12,depthWrite:false,side:THREE.DoubleSide}));
 field.rotation.x=-Math.PI/2;field.position.set(x,y-.015,z);field.name='transit-depth-forcefield';field.userData.noLocalShadow=true;root.add(field);
 const lines=[],add=(a,b,c,d)=>{for(const p of [a,b,c,a,c,d])lines.push(...p);};
 for(let xx=a;xx<=b;xx+=1.4)add([xx,y,d],[xx+.025,y,d],[xx+.025,y,e],[xx,y,e]);
 for(let zz=d;zz<=e;zz+=1.4)add([a,y,zz],[b,y,zz],[b,y,zz+.025],[a,y,zz+.025]);
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(lines,3));g.computeVertexNormals();const grid=new THREE.Mesh(g,new THREE.MeshBasicMaterial({color:'#91cbed',transparent:true,opacity:.38,depthWrite:false,side:THREE.DoubleSide}));grid.position.y=-.005;grid.userData.noLocalShadow=true;root.add(grid);

 for(const zz of [d,e])box(x,y-.15,zz,b-a,.3,.18,'metal');for(const xx of [a,b])box(xx,y-.15,z,.18,.3,e-d,'metal');
 // Physical field emitters and guide strips mark the safe vertical column.
 for(const xx of [a+.2,b-.2]){box(xx,y+.3,z,.3,.6,.8,'metal');box(xx,y+.64,z,.18,.08,.6,'cyan');for(let h=y+3;h<c.ceiling;h+=4)box(xx,h,z,.08,.8,.16,'cyan');}
 lamp(a+.4,y+20,z,'cyan',220);
}
