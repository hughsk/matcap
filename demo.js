var createCamera = require('game-shell-orbit-camera')
var createTexture = require('gl-texture2d')
var createBuffer = require('gl-buffer')
var createShell = require('gl-now')
var createVAO = require('gl-vao')

var getNormals = require('normals')
var unindex = require('unindex-mesh')
var mat4 = require('gl-matrix').mat4
var eye = require('eye-vector')

var model = require('stanford-dragon/3')
var matcap = require('./')
var fs = require('fs')

var textures = fs.readdirSync(__dirname + '/textures')
var texture = document.createElement('img')
var camera
var shader
var shell
var cells
var mesh
var gl

texture.onload = ready
texture.src = 'textures/00001.png'

function ready() {
  shell = createShell({
    clearColor: [0, 0, 0, 1]
  })

  shell.on('gl-init', init)
  shell.on('gl-render', render)

  camera = createCamera(shell)
  camera.distance = 150
}

function init() {
  gl = shell.gl

  shader = matcap(gl)
  texture = createTexture(gl, texture)
  cells = createBuffer(gl, pack(model.cells))

  var positions = unindex(model.positions, model.cells)
  var normals = unindex(getNormals.vertexNormals(
      model.cells
    , model.positions
  ), model.cells)

  // center the model to the
  // camera's origin
  center(positions, 0, 3)
  center(positions, 1, 3)
  center(positions, 2, 3)

  mesh = createVAO(gl, [{
      size: 3
    , buffer: createBuffer(gl, positions)
  }, {
      size: 3
    , buffer: createBuffer(gl, normals)
  }])

  mesh.length = positions.length / 3

  console.log('init')
}

var scratch0 = new Float32Array(16)
var scratch1 = new Float32Array(16)
var scratch2 = new Float32Array(16)
var scratch3 = new Float32Array(3)
var t = 0

function render() {
  var view = camera.view()

  gl.enable(gl.DEPTH_TEST)
  gl.enable(gl.CULL_FACE)

  shader.bind()
  shader.attributes.aPosition.location = 0
  shader.attributes.aNormal.location = 1

  shader.uniforms.uTexture = texture.bind(0)
  shader.uniforms.uEye = eye(view, scratch3)

  shader.uniforms.mView = view
  shader.uniforms.mModel = mat4.identity(scratch1)
  shader.uniforms.mNormal = mat4.identity(scratch2)
  shader.uniforms.mProjection = mat4.perspective(scratch0
    , Math.PI / 4
    , shell.width / shell.height
    , 0.001
    , 1000
  )

  mesh.bind()
  mesh.draw(gl.TRIANGLES, mesh.length)
}

function pack(arr, els) {
  els = els || 3

  var f32 = new Float32Array(arr.length * els)
  var i = 0

  for (var x = 0; x < arr.length; x++)
  for (var y = 0; y < els; y++)
    f32[i++] = arr[x][y]

  return f32
}

function center(points, offset, stride) {
  if ((stride = +(stride|0)) < 1) throw new Error(
    'Stride must be equal to or greater than 1'
  )

  var l = points.length
  var min = +Infinity
  var max = -Infinity

  for (var i = offset; i < l; i += stride) {
    var p = points[i]
    if (p < min) min = p
    if (p > max) max = p
  }

  var mid = min + (max - min) / 2

  for (var i = offset; i < l; i += stride) {
    points[i] -= mid
  }

  return points
}

// Switch to different textures
var textureSelect = document.body.appendChild(
  document.createElement('div')
)

textureSelect.style.zIndex = 9
textureSelect.style.position = 'absolute'
textureSelect.style.left = '1em'
textureSelect.style.top = '1em'
textureSelect.style.width = '128px'
textureSelect.style.cursor = 'pointer'

textureSelect.addEventListener('click', function(e) {
  var img = e.target
  if (img.nodeName !== 'IMG') return
  if (texture) texture.dispose()
  texture = createTexture(gl, img)
}, false)

for (var i = 0; i < textures.length; i++) (function(src) {
  var img = document.createElement('img')
  img.onload = loaded
  img.src = src = 'textures/' + src

  function loaded() {
    img.style.width = '32px'
    img.style.height = '32px'
    img.style.float = 'left'
    textureSelect.appendChild(img)
  }
}(textures[i]))
