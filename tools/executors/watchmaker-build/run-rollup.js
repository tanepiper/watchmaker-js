'use strict';
exports.__esModule = true;
exports.runRollup = void 0;
var rollup = require('rollup');
var rxjs_1 = require('rxjs');
var operators_1 = require('rxjs/operators');
function runRollup(options) {
  return rxjs_1.from(rollup.rollup(options)).pipe(
    operators_1.switchMap(function (bundle) {
      var outputOptions = Array.isArray(options.output) ? options.output : [options.output];
      return rxjs_1.from(
        Promise.all(
          outputOptions.map(function (o) {
            return bundle.write(o);
          })
        )
      );
    }),
    operators_1.map(function () {
      return { success: true };
    })
  );
}
exports.runRollup = runRollup;
