import { terser } from 'rollup-plugin-terser';

export default {
  input : './src/index.js',
  output : {
    file : 'build/hyphae.umd.js',
    name : 'Hyphae',
    format : 'umd'
  },
  plugins : [
    terser()
  ]
};
