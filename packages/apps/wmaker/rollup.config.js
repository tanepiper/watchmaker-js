const { terser } = require('rollup-plugin-terser');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');


module.exports = (config) => {
  return {
    ...config,
    output: {
      ...config.output,
      format: 'cjs',
      name: 'watchmaker'
    },
    plugins: [...config.plugins, nodeResolve(), commonjs(), terser()]
  };
};
