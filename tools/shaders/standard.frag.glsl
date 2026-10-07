uniform vec4 uBase;
uniform vec3 uEmissive;
uniform vec4 uPBR; // roughness, metalness, alpha cutoff, AO intensity
uniform vec4 uFlags; // vertex colors, unlit, normal map, flat shading
uniform vec2 uNormalScale;
uniform mat3 mapTransform;uniform mat3 normalMapTransform;uniform mat3 roughnessMapTransform;
uniform mat3 metalnessMapTransform;uniform mat3 emissiveMapTransform;uniform mat3 aoMapTransform;uniform mat3 alphaMapTransform;
uniform ivec4 uChannels;uniform ivec3 uChannels2;
uniform sampler2D map;uniform sampler2D normalMap;uniform sampler2D roughnessMap;
uniform sampler2D metalnessMap;uniform sampler2D emissiveMap;uniform sampler2D aoMap;uniform sampler2D alphaMap;
varying vec3 vWorld;varying vec3 vNormal;varying vec4 vColor;varying vec2 vUv;varying vec2 vUv1;varying vec2 vUv2;
vec2 texUV(int channel,mat3 transform){return (transform*vec3(channel==1?vUv1:channel==2?vUv2:vUv,1.0)).xy;}
void main(){
 vec3 dpX=dFdx(vWorld),dpY=dFdy(vWorld);vec2 nUV=texUV(uChannels.y,normalMapTransform),dx=dFdx(nUV),dy=dFdy(nUV);
 vec2 uv0=texUV(uChannels.x,mapTransform),uvR=texUV(uChannels.z,roughnessMapTransform),uvM=texUV(uChannels.w,metalnessMapTransform);
 vec2 uvE=texUV(uChannels2.x,emissiveMapTransform),uvA=texUV(uChannels2.y,aoMapTransform),uvAlpha=texUV(uChannels2.z,alphaMapTransform);
 vec4 base=uBase*textureGrad(map,uv0,dFdx(uv0),dFdy(uv0));
 if(uFlags.x>0.5)base*=vColor;else base.rgb*=vColor.rgb;
 base.a*=textureGrad(alphaMap,uvAlpha,dFdx(uvAlpha),dFdy(uvAlpha)).g;
 float rough=uPBR.x*textureGrad(roughnessMap,uvR,dFdx(uvR),dFdy(uvR)).g;
 float metal=uPBR.y*textureGrad(metalnessMap,uvM,dFdx(uvM),dFdy(uvM)).b;
 float ao=mix(1.0,textureGrad(aoMap,uvA,dFdx(uvA),dFdy(uvA)).r,uPBR.w);
 vec3 emit=uEmissive*textureGrad(emissiveMap,uvE,dFdx(uvE),dFdy(uvE)).rgb;
 vec3 N=normalize(uFlags.w>0.5?cross(dpX,dpY):vNormal);if(!gl_FrontFacing)N=-N;
 vec3 mapN=textureGrad(normalMap,nUV,dx,dy).xyz*2.0-1.0;
 if(uFlags.z>0.5){mapN.xy*=uNormalScale;vec3 q1=cross(dpY,N),q0=cross(N,dpX);vec3 T=q1*dx.x+q0*dy.x,B=q1*dx.y+q0*dy.y;float scale=inversesqrt(max(max(dot(T,T),dot(B,B)),1e-20));N=normalize(T*(mapN.x*scale)+B*(mapN.y*scale)+N*mapN.z);}
 if(base.a<uPBR.z)discard;
 materialOutput(base.rgb,N,clamp(rough,0.04,1.0),ao,0.0,0.0,0.04);
 gSurface.z=metal;gEmission.rgb=emit;
 if(uFlags.y>0.5){gAlbedo.rgb=vec3(0.0);gEmission.rgb+=base.rgb;}
}
