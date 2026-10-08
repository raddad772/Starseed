import * as THREE from 'three';

// Broad, feathered spectral lobes: coloured edges belong to the same wisp,
// rather than individual saturated points. The border is completely transparent.
export function spectralHazeTexture(){
 const size=128,data=new Uint8Array(size*size*4);
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const u=(x+.5)/size*2-1,v=(y+.5)/size*2-1;
  const bend=v+.15*Math.sin(u*3.5)+.07*Math.sin(u*7+1);
  const lobe=(dx,dy)=>Math.exp(-((u-dx)**2*3.8+(bend-dy)**2*11));
  const r=lobe(-.12,.06),g=lobe(.02,-.045),b=lobe(.14,.035),peak=Math.max(r,g,b);
  const feather=Math.max(0,1-Math.max(Math.abs(u),Math.abs(v)))**.65;
  const density=.78+.14*Math.sin(u*8+v*5)+.08*Math.sin(u*13-v*9);
  const i=(y*size+x)*4;
  data.set([Math.round(255*(.32+.68*r/(peak||1))),Math.round(255*(.32+.68*g/(peak||1))),Math.round(255*(.32+.68*b/(peak||1))),Math.round(peak*feather*density*190)],i);
 }
 const texture=new THREE.DataTexture(data,size,size);texture.needsUpdate=true;
 texture.minFilter=texture.magFilter=THREE.LinearFilter;texture.colorSpace=THREE.SRGBColorSpace;
 return texture;
}
