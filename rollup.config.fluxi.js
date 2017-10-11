import babel from 'rollup-plugin-babel';

export default {
  entry: 'index.mjs',
  dest: 'build/fluxi.js',
  format: 'umd',
  sourceMap: 'inline',
  name: 'fluxi',
  exports: 'named',
  plugins: [
    babel({
      exclude: 'node_modules/**',
    }),
  ],
};