const { terser } = require('rollup-plugin-terser');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const autoExternal = require('rollup-plugin-auto-external');
const internal = require('rollup-plugin-internal');

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
      nodeResolve(),
      commonjs({
        extensions: ['.js'],
        transformMixedEsModules: true,
      }),
      autoExternal(),
      internal.default(['watchmaker-js']),
    ],
  };
};
