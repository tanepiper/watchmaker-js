'use strict';
exports.__esModule = true;
exports.deleteOutputDir = void 0;
var path_1 = require('path');
var rimraf = require('rimraf');
/**
 * Delete an output directory, but error out if it's the root of the project.
 */
function deleteOutputDir(root, outputPath) {
  var resolvedOutputPath = path_1.resolve(root, outputPath);
  if (resolvedOutputPath === root) {
    throw new Error('Output path MUST not be project root directory!');
  }
  rimraf.sync(resolvedOutputPath);
}
exports.deleteOutputDir = deleteOutputDir;
