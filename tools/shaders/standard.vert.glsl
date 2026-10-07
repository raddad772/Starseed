attribute vec2 uv;
attribute vec2 uv1;
attribute vec2 uv2;
attribute vec4 color;
uniform mat3 normalMatrix;uniform float uUseColor;
varying vec3 vWorld;
varying vec3 vNormal;
varying vec4 vColor;
varying vec2 vUv;
varying vec2 vUv1;
varying vec2 vUv2;
void main(){
 mat4 im=instanceMatrix;vec4 wp=modelMatrix*im*vec4(position,1.0);
 mat3 im3=mat3(im);vec3 n=normal/max(vec3(dot(im3[0],im3[0]),dot(im3[1],im3[1]),dot(im3[2],im3[2])),vec3(1e-12));
 vWorld=wp.xyz;vNormal=normalize(normalMatrix*im3*n);vColor=mix(vec4(1.0),color,uUseColor)*vec4(instanceColor,1.0);vUv=uv;vUv1=uv1;vUv2=uv2;
 gl_Position=projectionMatrix*viewMatrix*wp;
}
