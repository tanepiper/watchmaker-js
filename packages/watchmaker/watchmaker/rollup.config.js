const { terser } = require('rollup-plugin-terser');


module.exports = (config) => {

  return {
    ...config,
    output: {
      ...config.output,
      format: 'cjs',
      name: 'watchmaker'
    },
    plugins: [
      ...config.plugins,
      terser()
    ]
  };
};
