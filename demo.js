const fs = require('fs')
const mesh = require('stanford-dragon/3')
const textures = fs.readdirSync(__dirname + '/textures')
const glslify = require('glslify')
const regl = require('regl')()
const h = require('h')
const normalMatrix = require('gl-mat3/normal-from-mat4');
const identity = require('gl-mat4/identity');

const camera = require('regl-camera')(regl, {
  distance: 2,
  theta: 1.5,
  phi: 0.4
})

const model = identity([]);
const transformModel = regl({
  uniforms: {
    model: model,
    normalMatrix: ctx => normalMatrix([], model)
  }
});

var texture, drawMesh
function init (img) {
  texture = regl.texture({data: img, flipY: true})
  drawMesh = regl({
    vert: `
      precision mediump float;
      attribute vec3 position, normal;
      uniform vec3 eye;
      uniform mat4 projection, view, model;
      uniform mat3 normalMatrix;
      varying vec3 n, peye;
      void main () {
        // Transform the normal by the model matrix (which because normals transform
        // differently means multiplication by the normal matrix):
        n = normalize(normalMatrix * normal);

        // Transform the position by the model matrix:
        vec4 mp = model * vec4(position, 1);

        // Compute the direction of the eye relative to the position:
        peye = normalize(mp.xyz - eye);

        // Transfomr the *directions* of the normal and position-relative-to-eye so
        // that the matcap stays aligned with the view:
        n = mat3(view) * n;
        peye = mat3(view) * peye;

        gl_Position = projection * view * mp;
      }
    `,
    frag: glslify(`
      precision mediump float;
      #pragma glslify: matcap = require('./matcap.glsl')
      varying vec3 n, peye;
      uniform sampler2D texture;
      void main () {
        // This could be done in the vertex shader to optimize slightly:
        vec2 uv = matcap(peye, n);

        gl_FragColor = vec4(texture2D(texture, uv).rgb, 1);
      }
    `),
    cull: {enable: true, face: 'back'},
    uniforms: {texture: texture},
    attributes: {
      position: require('geom-center-and-normalize')(mesh.positions),
      normal: require('normals').vertexNormals(mesh.cells, mesh.positions)
    },
    elements: mesh.cells,
    count: mesh.cells.length * 3
  })
}

regl.frame(() => {
  regl.clear({color: [0, 0, 0, 1], depth: 1})
  if (drawMesh) camera(() => {
    transformModel(() => {
      drawMesh()
    })
  })
})

const textureSelect = document.body.appendChild(h('div', {
  style: {
    left: '1em',
    top: '1em',
    position: 'absolute',
    cursor: 'pointer',
    width: '128px'
  }
}))

textureSelect.addEventListener('click', function(e) {
  var img = e.target
  if (img.nodeName !== 'IMG') return
  texture = (texture || regl.texture)({data: img, flipY: true})
}, false)

for (var i = 0; i < textures.length; i++) (function(src) {
  var img = h('img', {style: {width: '32px', height: '32px', float: 'left'}});

  img.onload = function () {
    textureSelect.appendChild(img)
    if (src === '00001.png') init(img)
  }

  img.src = 'textures/' + src
}(textures[i]))
