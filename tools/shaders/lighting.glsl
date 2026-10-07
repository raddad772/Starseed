// All opaque surface families share these equations. Shape-dependent alpha and
// material sampling have already run in the G-buffer pass.
vec3 deferredLight(vec3 p, vec3 N, vec3 albedo, float roughness, float ao, float wet, float f0, float cave, float trans, float foot, float metal, float kind, float selfShadow) {
  if(kind==5.0)return vec3(0.0);
  vec3 rel=p-uCenter; float r=length(rel); vec3 up=rel/max(r,1e-6); float muS=dot(up,uSunDir);
  vec3 sunT=atmoSunTransmittance(r,muS),skyE=atmoSkyIrradiance(r,muS);
  float cloudT=cloudLight(rel,r,muS,foot,sunT,skyE); sunT*=cloudT;
  vec3 pF=uToFixed*rel;
  sunT*=terrainShadow(pF,normalize(pF),uToFixed*uSunDir,uRadius);
  vec3 sunTop=sunT;float keySh=sunShadowMap(p,N);sunT*=keySh;
  float nd=dot(N,uSunDir),ndl=max(nd,0.0),wrap=kind==2.0?0.55+0.45*dot(N,up):0.5+0.5*dot(N,up);
  if(kind==7.0)return albedo/PI*uSunE*(sunT*ndl*pow(max(dot(N,normalize(-p)),0.0),0.15)*selfShadow+skyE*0.6);
  vec3 direct=uSunE*sunT*(ndl+trans*max(-nd,0.0));
  float skyBl=skyBlocked(p),skyK=(1.0-skyBl)*(kind==1.0?exp(-trunkSum(p)):trunkSky(p));
  vec3 ambient=uSunE*(skyE*wrap*skyK+canopyLit(skyBl,sunTop,muS,skyE))+uAmbientFloor+moonLit(rel,r,up,N,keySh,trans,wrap,skyK);
  float gSum=kind==3.0?0.0:grassCover(p),gCov=exp(-2.2*gSum);direct*=gCov*selfShadow;ambient*=1.0-0.35*(1.0-exp(-0.8*gSum));
  vec3 diffuse=albedo*(1.0-metal);
  vec3 color=diffuse/PI*(direct*mix(1.0,ao,0.35)+ambient*ao)*cave;
  vec3 V=normalize(-p),H=normalize(V+uSunDir);float rg=clamp(mix(roughness,0.12,wet*0.8),0.05,1.0),a2=rg*rg*rg*rg;
  float NdH=max(dot(N,H),0.0),NdV=max(dot(N,V),1e-3),VdH=max(dot(V,H),0.0);
  float Dg=a2/(PI*pow(NdH*NdH*(a2-1.0)+1.0,2.0)),kk=(rg+1.0)*(rg+1.0)/8.0;
  float Gg=NdV/(NdV*(1.0-kk)+kk)*ndl/(ndl*(1.0-kk)+kk),Fs=f0+(1.0-f0)*pow(1.0-VdH,5.0);
  if(kind!=2.0)color+=uSunE*sunT*gCov*selfShadow*Dg*Gg*mix(vec3(Fs),albedo+(vec3(1.0)-albedo)*pow(1.0-VdH,5.0),metal)/(4.0*NdV);
  float poolK=smoothstep(0.85,1.0,wet);
  if(poolK>0.0){float cP=max(dot(up,V),1e-3),Fp=0.02+0.98*pow(1.0-cP,5.0);color=mix(color,color*(1.0-Fp)+uSunE*skyE/PI*1.1*Fp+uSunE*sunT*0.05*pow(max(dot(reflect(-V,up),uSunDir),0.0),200.0),poolK);}
  if(uThermal.x>0.0){vec3 a=clamp(albedo,0.0,1.0);color+=(vec3(1.0)-a)*blackbodyGlow(uThermal.x-uThermal.y*(r-uRadius));color+=a*(vec3(1.0)-atmoSunTransmittance(r,1.0))*blackbodyGlow(uThermal.x-uThermal.z*max(r-uRadius,0.0));}
  return color;
}
void main(){gl_FragColor=vec4(deferredLight(vec3(0,0,-1),vec3(0,1,0),vec3(1),0.8,1.0,0.0,0.04,1.0,0.0,1.0,0.0,0.0,1.0),1);}
