const { terser } = require('rollup-plugin-terser');
const iife = require('rollup-plugin-iife');


module.exports = (config) => {

  return {
    ...config,
    // output: {
    //   ...config.output,
    //   format: 'cjs',
    //   name: 'watchmaker'
    // },
    plugins: [
      ...config.plugins,
      terser(),
    ]
  };
};
