import fs from 'node:fs/promises';
import { translate } from './translate.mjs';
const root=process.env.STARSEED_SHADER_ROOT,compiler=process.argv[2],output=process.argv[3];
const S=await import(root+'/src/render/sky.js'),E=await import(root+'/src/render/engine.js');
const direction=`varying vec2 vUv;uniform int uFace;
vec3 cubeDirection(vec2 uv){vec2 p=uv*2.0-1.0;if(uFace==0)return vec3(1.0,-p.y,-p.x);if(uFace==1)return vec3(-1.0,-p.y,p.x);if(uFace==2)return vec3(p.x,1.0,p.y);if(uFace==3)return vec3(p.x,-1.0,-p.y);if(uFace==4)return vec3(p.x,-p.y,1.0);return vec3(-p.x,-p.y,-1.0);}
`;
await translate('galaxy',direction+S.BAKE_FRAG.replace('varying vec3 vDir;','').replace('normalize(vDir)','normalize(cubeDirection(vUv))'),output,compiler,{group:0});
await translate('background',E.BG_FRAG,output,compiler,{group:0,screen:true});
console.log('Generated galaxy/background WGSL');

const clean=s=>s.replace(/#include[^\n]*/g,'');
let starVertex=clean(S.STAR_VERT).replaceAll('position','aStar').replaceAll('attribute vec3 color','attribute vec3 aColor').replace('vColor = color','vColor = aColor').replaceAll('attribute float size','attribute float aSize').replace('gl_PointSize = size * uPixelRatio;','vQuad=corner*0.5+0.5;gl_Position.xy+=corner*aSize*uPixelRatio/uViewport*gl_Position.w;');
starVertex='uniform mat4 modelMatrix;uniform mat4 viewMatrix;uniform mat4 projectionMatrix;uniform vec2 uViewport;attribute vec3 aStar;attribute vec2 corner;varying vec2 vQuad;\n'+starVertex;
const starFragment='varying vec2 vQuad;\n'+clean(S.STAR_FRAG).replace('gl_PointCoord','vQuad');
await translate('starVertex',starVertex,output,compiler,{stage:'vert',group:0,varyings:['vColor','vQuad']});
await translate('starFragment',starFragment,output,compiler,{group:1,varyings:['vColor','vQuad']});
