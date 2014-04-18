# matcap [![Flattr this!](https://api.flattr.com/button/flattr-badge-large.png)](https://flattr.com/submit/auto?user_id=hughskennedy&url=http://github.com/hughsk/matcap&title=matcap&description=hughsk/matcap%20on%20GitHub&language=en_GB&tags=flattr,github,javascript&category=software)[![experimental](http://hughsk.github.io/stability-badges/dist/experimental.svg)](http://github.com/hughsk/stability-badges) <img src="http://imgur.com/2KPQKaJ.png" align="right"> #

GLSL shaders for calculating/rendering Spherical Environment Maps, or "matcaps".

For more information, check out
[Creating a Spherical Reflection/Environment Mapping shader](http://www.clicktorelease.com/blog/creating-spherical-environment-mapping-shader),
which was used as a reference when writing this module and the demo.

Most of the images in the demo were sourced from
[this demo](http://www.clicktorelease.com/code/spherical-normal-mapping/),
though a couple I made myself.

### [view demo](http://hughsk.github.io/matcap/) ###

## Usage ##

[![matcap](https://nodei.co/npm/matcap.png?mini=true)](https://nodei.co/npm/matcap)

### With glslify ###

You can import the module using
[glslify](http://github.com/chrisdickinson/glslify) to get the bare function
responsible for generating the texture coordinate to look up.

This function takes two arguments:

* `vec3 eye`: the camera's current position.
* `vec3 normal`: the surface's normal vector.

Returning a `vec2` you can use on your `sampler2D`.

``` glsl
#pragma glslify: matcap = require(matcap)

uniform sampler2D texture; // the matcap texture you want to use
uniform vec3 eyeVector;
varying vec3 normalVector;

void main() {
  vec2 uv = matcap(eyeVector, normalVector);

  gl_FragColor = vec4(texture2D(
    texture, uv
  ).rgb, 1.0);
}
```

### With browserify ###

If you're looking to get started a little more quickly, you can require matcap
as a module from [browserify](http://github.com/substack/node-browserify).

The required function simply takes the current WebGL context, and returns a
a GLSL program wrapped up in
[gl-shader-core](http://github.com/gl-modules/gl-shader-core).

You'll still need to take care of its uniforms and attributes though:

``` javascript
shader.bind()
shader.attributes.aPosition.location = 0
shader.attributes.aNormal.location = 0

shader.uniforms.uTexture = textureIndex
shader.uniforms.uEye = eyeVector

shader.uniforms.mView = viewMatrix
shader.uniforms.mModel = modelMatrix
shader.uniforms.mNormal = normalMatrix
shader.uniforms.mProjection = projectionMatrix
```

If you're looking for a full example, check out the demo!

## License ##

MIT. See [LICENSE.md](http://github.com/hughsk/matcap/blob/master/LICENSE.md) for details.
