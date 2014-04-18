var glslify = require('glslify')

module.exports = glslify({
    fragment: './matcap.frag'
  , vertex: './matcap.vert'
})
