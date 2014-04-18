precision mediump float;

attribute vec3 aPosition;
attribute vec3 aNormal;

varying vec3 vNormal;
varying vec3 vEye;

uniform mat4 mProjection;
uniform mat4 mModel;
uniform mat4 mView;
uniform mat4 mNormal;
uniform vec3 uEye;

void main() {
  vEye = uEye;
  vNormal = normalize((mNormal * vec4(aNormal, 0.0)).xyz);

  gl_Position = mProjection * mModel * mView * vec4(aPosition, 1.0);
}
