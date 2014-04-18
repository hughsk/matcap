precision mediump float;

uniform sampler2D uTexture;
varying vec3 vNormal;
varying vec3 vEye;

#pragma glslify: matcap = require(./matcap)

void main() {
  vec2 uv = matcap(vEye, vNormal).xy;

  gl_FragColor = vec4(
    texture2D(uTexture, uv).rgb,
    1.0
  );
}
