const fs = require('fs')
const mesh = require('stanford-dragon/3')
const textures = fs.readdirSync(__dirname + '/textures')
const glslify = require('glslify')
const regl = require('regl')()
const h = require('h')

const camera = require('regl-camera')(regl, {
  distance: 2,
  theta: 1.5,
  phi: 0.4
})

var texture, drawMesh
function init (img) {
  texture = regl.texture({data: img, flipY: true})
  drawMesh = regl({
    vert: `
      precision mediump float;
      attribute vec3 position, normal;
      uniform mat4 projection, view;
      varying vec3 n, p;
      void main () {
        n = normal;
        p = position;
        gl_Position = projection * view * vec4(position, 1);
      }
    `,
    frag: glslify(`
      precision mediump float;
      #pragma glslify: matcap = require('./matcap.glsl')
      uniform mat4 view;
      uniform vec3 eye;
      varying vec3 n, p;
      uniform sampler2D texture;
      void main () {
        vec3 ray = normalize(mat3(view) * (p - eye));
        vec3 norm = normalize(mat3(view) * n);
        vec2 uv = matcap(ray, norm);
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
  if (drawMesh) camera(drawMesh)
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
