import { terser } from 'rollup-plugin-terser';

export default {
  input : './src/index.js',
  output : {
    file : 'build/hyphae.min.js',
    name : 'NodeStore',
    format : 'umd'
  },
  plugins : [
    terser()
  ]
};
