export const CLUSTER_PARAMETERS=/* wgsl */`
struct Frame { inverseVP:mat4x4f, view:mat4x4f, toRoom:mat4x4f, viewport:vec4f, grid:vec4f, range:vec4f };
struct Light { positionRange:vec4f, colorBounce:vec4f, directionOuter:vec4f, kindInner:vec4f, roomMin:vec4f, roomMax:vec4f };
@group(0) @binding(0) var<uniform> clusterFrame:Frame;
@group(0) @binding(1) var<storage,read> lights:array<Light>;
fn clusterID(tile:vec2u,slice:u32)->u32{return (slice*u32(clusterFrame.grid.y)+tile.y)*u32(clusterFrame.grid.x)+tile.x;}
fn sliceDepth(slice:f32)->f32{return clusterFrame.range.x*pow(clusterFrame.range.y/clusterFrame.range.x,slice/24.0);}
`;
export const CLUSTER_LIGHTING=CLUSTER_PARAMETERS+/* wgsl */`
@group(0) @binding(2) var<storage,read> clusters:array<u32>;
@group(0) @binding(3) var<storage,read> localShadowMatrices:array<mat4x4f>;
@group(0) @binding(4) var localShadowMaps:texture_depth_2d_array;
@group(0) @binding(5) var localShadowSampler:sampler_comparison;
fn localShadow(world:vec3f,normal:vec3f,index:f32)->f32{
 if(index<0.5){return 1.0;}let slot=i32(index)-1;
 let q=localShadowMatrices[slot]*vec4f(world+normal*0.018,1.0);let p=q.xyz/q.w;
 if(q.w<=0.0||any(abs(p.xy)>vec2f(1))||p.z< -1.0||p.z>1.0){return 1.0;}
 let uv=vec2f(p.x*0.5+0.5,0.5-p.y*0.5);var sum=0.0;
 for(var y= -1;y<=1;y++){for(var x= -1;x<=1;x++){sum+=textureSampleCompareLevel(localShadowMaps,localShadowSampler,uv+vec2f(f32(x),f32(y))/512.0,slot,p.z*0.5+0.5-0.0003);}}
 return sum/9.0;
}
fn clusterLight(world:vec3f,normal:vec3f,alb:vec4f,s:vec4f,rough:f32,kind:u32,pixel:vec2f)->vec3f{
 if(clusterFrame.grid.z<0.5){return vec3f(0);}
 let p=(clusterFrame.view*vec4f(world,1.0)).xyz;
 if(-p.z>clusterFrame.range.y){return vec3f(0);}
 let N=normalize((clusterFrame.view*vec4f(normal,0.0)).xyz);let V=normalize(-p);let local=(clusterFrame.toRoom*vec4f(p,1.0)).xyz;
 let slice=u32(clamp(log(max(-p.z,clusterFrame.range.x)/clusterFrame.range.x)/log(clusterFrame.range.y/clusterFrame.range.x)*24.0,0.0,23.0));
 let base=clusterID(vec2u(pixel)/64u,slice)*65u;let n=clusters[base];let overflow=n>64u;let limit=select(n,u32(clusterFrame.grid.z),overflow);
 var color=vec3f(0);
 for(var j=0u;j<limit;j++){
  let i=select(clusters[base+1u+min(j,63u)],j,overflow);let l=lights[i];
  if(l.kindInner.z>0.5&&(any(local<l.roomMin.xyz)||any(local>l.roomMax.xyz))){continue;}
  let delta=l.positionRange.xyz-p;let d2=max(dot(delta,delta),select(0.01,0.25,l.kindInner.x==2.0));let dist=sqrt(d2);if(dist>=l.positionRange.w){continue;}
  let L=delta/dist;let nd=max(dot(N,L),0.0);var attenuation=pow(max(1.0-pow(dist/l.positionRange.w,4.0),0.0),2.0)/d2;
  if(l.kindInner.x>0.5){let c=dot(-L,l.directionOuter.xyz);let beam=smoothstep(l.directionOuter.w,l.kindInner.y,c);attenuation*=select(beam,max(beam,0.04*smoothstep(l.directionOuter.w-0.3,l.directionOuter.w,c)),l.kindInner.x==2.0);}
  let E=l.colorBounce.xyz*attenuation*localShadow(world,normal,l.kindInner.w);let diffuse=alb.rgb*(1.0-s.z)/3.14159265;
  color+=E*diffuse*(nd+select(s.x,0.0,kind==0u)*max(-dot(N,L),0.0)+l.colorBounce.w*alb.a);
  if(kind!=2u){let H=normalize(V+L);let nv=max(dot(N,V),0.001);let nh=max(dot(N,H),0.0);let vh=max(dot(V,H),0.0);let rough=max(rough,0.05);let a2=pow(rough,4.0);let D=a2/(3.14159265*pow(nh*nh*(a2-1.0)+1.0,2.0));let k=pow(rough+1.0,2.0)/8.0;let G=nv/(nv*(1.0-k)+k)*nd/(nd*(1.0-k)+k);let F0=mix(vec3f(s.w),alb.rgb,s.z);let F=F0+(1.0-F0)*pow(1.0-vh,5.0);color+=E*D*G*F/(4.0*nv);}
 }
 return color;
}
`;
