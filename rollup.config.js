import babel from 'rollup-plugin-babel';

export default {
  entry: 'view/index.js',
  dest: 'build/view-engine.js',
  format: 'umd',
  sourceMap: 'inline',
  name: 'ViewEngine',
  exports: 'named',
  plugins: [
    babel({
      exclude: 'node_modules/**',
    }),
  ],
};