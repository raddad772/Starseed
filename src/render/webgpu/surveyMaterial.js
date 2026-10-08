import * as vertex from './generated/standardVertex.js';
import * as standard from './generated/standardMaterial3.js';

// Opt-in material variant for survey architecture. Adjacent surfaces use world
// UVs; randomly translated samples blend continuously across a triangular grid.
// No visible repeat period, per-object UV seams or changes to other game assets.
const sampling=/* wgsl */`
fn surveyHash(p:vec2f)->vec2f {
 let q=vec2u(vec2i(p)+vec2i(1048576));
 var a=(q.x*1597334677u)^(q.y*3812015801u); a^=a>>16u;a*=2246822519u;
 var b=a*747796405u+2891336453u;b^=b>>13u;
 return vec2f(f32(a>>8u),f32(b>>8u))/16777216.0;
}
fn surveySample(t:texture_2d<f32>,s:sampler,uv:vec2f,dx:vec2f,dy:vec2f)->vec4f {
 let skew=vec2f(uv.x-uv.y*0.577350269,uv.y*1.154700538);
 let cell=floor(skew);let f=fract(skew);
 var a=cell;var b=cell+vec2f(1,0);var c=cell+vec2f(0,1);
 var w=vec3f(1-f.x-f.y,f.x,f.y);
 if(f.x+f.y>1){a=cell+1;b=cell+vec2f(0,1);c=cell+vec2f(1,0);w=vec3f(f.x+f.y-1,1-f.x,1-f.y);}
 w=w*w;w/=w.x+w.y+w.z;
 return textureSampleGrad(t,s,uv+surveyHash(a)*13.7,dx,dy)*w.x
  +textureSampleGrad(t,s,uv+surveyHash(b)*13.7,dx,dy)*w.y
  +textureSampleGrad(t,s,uv+surveyHash(c)*13.7,dx,dy)*w.z;
}
`;
export const surveyProgram={name:'survey',key:'survey',mode:3,vertex,fragment:{...standard,code:sampling+standard.code.replace(/textureSampleGrad\((mapTexture|normalMapTexture|roughnessMapTexture),/g,'surveySample($1,')}};
