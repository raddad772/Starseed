// A hull-sized bow shock and a downstream wake, driven by the flight model.
// Colours are art direction for broad gas families, not a spectral simulation.
import * as THREE from 'three';
import { hullEnvelope } from '../sim/reentry.js';

export const ENTRY_VERT = /* glsl */`
uniform vec3 uRadii;
varying vec3 vLocal;
varying vec3 vNormalLocal;
varying vec3 vN;
varying vec3 vView;
#include <common>
#include <logdepthbuf_pars_vertex>
void main() {
  vLocal = position;
  // Scale in the shader so the inverse-transpose normal stays correct even
  // for a very flat lifting body. The scene matrices contain only rotation.
  vNormalLocal = normalize(normal / uRadii);
  vec4 wp = modelMatrix * vec4(position * uRadii, 1.0);
  vN = mat3(modelMatrix) * vNormalLocal;
  vView = -wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
  #include <logdepthbuf_vertex>
}
`;
export const ENTRY_FRAG = /* glsl */`
uniform float uHeat;
uniform float uTime;
uniform float uWake;
uniform vec3 uFlow;
uniform vec3 uColor;
varying vec3 vLocal;
varying vec3 vNormalLocal;
varying vec3 vN;
varying vec3 vView;
#include <common>
#include <logdepthbuf_pars_fragment>
void main() {
  #include <logdepthbuf_fragment>
  float edge = 1.0 - abs(dot(normalize(vN), normalize(vView)));
  float facing = dot(normalize(vNormalLocal), uFlow);
  float front = smoothstep(-0.15, 0.8, facing);
  float arc = pow(max(0.0, facing), 5.0);
  // Smooth advected bands: no frame-random noise or high-frequency flashes.
  float bands = 0.86 + 0.14 * sin(dot(vLocal, vec3(5.0, 9.0, 3.0)) - uTime * 4.0);
  float shell = front * (0.035 + 0.9 * pow(edge, 5.0)) + arc * 0.055;
  float t = clamp(vLocal.y, 0.0, 1.0);
  float streaks = 0.35 + 0.65 * pow(0.5 + 0.5*sin(atan(vLocal.z,vLocal.x)*7.0 + t*8.0-uTime*1.5),2.0);
  float wake = smoothstep(0.0, 0.12, t) * pow(1.0-t, 2.0) * pow(1.0-edge,1.2) * streaks * 0.45;
  float emission = mix(shell, wake, uWake) * bands * uHeat;
  vec3 core = mix(uColor, vec3(0.72, 0.86, 1.0), clamp(arc * 0.5 + max(0.0,uHeat-2.5)*0.2, 0.0, 0.7));
  gl_FragColor = vec4(core * 2.5, clamp(emission * 0.22,0.0,0.8));
}
`;

function material(wake) {
  return new THREE.ShaderMaterial({
    uniforms: {uRadii:{value:new THREE.Vector3(1,1,1)},uHeat:{value:0},uTime:{value:0},uWake:{value:wake},uFlow:{value:new THREE.Vector3(0,0,-1)},uColor:{value:new THREE.Vector3(1,.32,.07)}},
    vertexShader:ENTRY_VERT,fragmentShader:ENTRY_FRAG,
    transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.FrontSide,
  });
}
const AXIS = new THREE.Vector3(0,1,0);
export class ReentryVisual {
  constructor(ship, parent) {
    this.ship=ship;this.envelope=hullEnvelope(ship.type);
    this.root=new THREE.Group();parent.add(this.root);this.root.visible=false;
    const bowGeometry=new THREE.SphereGeometry(1,64,32),points=bowGeometry.attributes.position;
    // A rounded box follows cabin/wing envelopes more closely than an egg.
    for(let i=0;i<points.count;i++)for(let k=0;k<3;k++) {
      const x=points.array[i*3+k];points.array[i*3+k]=Math.sign(x)*Math.abs(x)**.7;
    }
    bowGeometry.computeVertexNormals();
    this.bow=new THREE.Mesh(bowGeometry,material(0));
    const wakeGeometry=new THREE.CylinderGeometry(.55,1,1,48,16,true);
    wakeGeometry.translate(0,.5,0);
    this.wake=new THREE.Mesh(wakeGeometry,material(1));
    // Geometry bounds are unit sized; dimensions are applied in the shader.
    this.bow.frustumCulled=this.wake.frustumCulled=false;
    this.root.add(this.bow,this.wake);this.downstream=new THREE.Vector3();
  }
  update() {
    const s=this.ship,heat=Math.min(3.5,Math.max(0,s.heatGlow||0)*5);
    this.root.visible=!s.dead&&!s.parent&&s.env.density>1e-10&&s.env.mach>2.5&&heat>.015;
    if(!this.root.visible)return;
    const e=this.envelope,[a,b,c]=e.semi,n=s.entry.direction;
    const stand=Math.min(Math.min(a,b,c)*.5,Math.max(.12,s.entry.radius*.08));
    this.bow.position.fromArray(e.center);
    this.bow.material.uniforms.uRadii.value.set(a*1.08+stand,b*1.08+stand,c*1.08+stand);
    const tail=1/Math.hypot(n.x/a,n.y/b,n.z/c);
    this.downstream.copy(n).negate();
    this.wake.quaternion.setFromUnitVectors(AXIS,this.downstream);
    this.wake.position.fromArray(e.center).addScaledVector(this.downstream,tail*.6);
    const radius=Math.sqrt(s.entry.projectedArea/Math.PI)*.8;
    const length=Math.max(a,b,c)*Math.min(6,1.2+heat+s.env.mach*.05);
    this.wake.material.uniforms.uRadii.value.set(radius,length,radius);
    const comp=s.body?.atm?.comp||{},hydrogen=(comp.H2||0)+(comp.He||0),co2=comp.CO2||0;
    for(const mesh of [this.bow,this.wake]) {
      const u=mesh.material.uniforms;
      u.uHeat.value=heat;u.uTime.value=(s.game.t||0)%4096;
      if(mesh===this.bow)u.uFlow.value.copy(n);else u.uFlow.value.set(0,-1,0);
      u.uColor.value.set(hydrogen>.5?.55:1,hydrogen>.5?.3:co2>.5?.44:.26,hydrogen>.5?1:co2>.5?.12:.055);
    }
  }
  dispose() {
    this.root.removeFromParent();
    for(const mesh of [this.bow,this.wake]) {mesh.geometry.dispose();mesh.material.dispose();}
  }
}
