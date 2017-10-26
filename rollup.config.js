import babel from 'rollup-plugin-babel';
var uglify = require('rollup-plugin-uglify');
var pkg = require('./package.json');

var banner = '//  Fluxi v' + pkg.version + '\n'
  + '//  https://github.com/vigneshwaransivasamy/fluxi\n'
  + '//  (c)' + new Date().getFullYear() + ' Vigneshwaran Sivasamy\n'
  + '//  Fluxi may be freely distributed under the MIT license.\n';

var config = {
  entry: 'source/index.js',
  dest: 'dist/fluxi.js',
  format: 'umd',
  sourceMap: 'inline',
  name: 'fluxi',
  exports: 'named',
  banner: banner,
  plugins: [
    babel({
      exclude: 'node_modules/**'
    })
  ]
};

if (process.env.NODE_ENV === 'production') {
  config.plugins.push(
    uglify({
      compress: {
        pure_getters: true,
        unsafe: true,
        unsafe_comps: true,
        warnings: false
      }
    })
  );
}

module.exports = config;