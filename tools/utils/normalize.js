'use strict';
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };
exports.__esModule = true;
exports.convertBuildOptions = exports.normalizeWebBuildOptions = exports.normalizeAssets = exports.normalizeBuildOptions = exports.normalizePackageOptions = void 0;
var devkit_1 = require('@nrwl/devkit');
var path_1 = require('path');
var fs_1 = require('fs');
function normalizePackageOptions(options, root, sourceRoot) {
  var entryFile = root + '/' + options.entryFile;
  var entryRoot = path_1.dirname(entryFile);
  var project = root + '/' + options.project;
  var projectRoot = path_1.dirname(project);
  var outputPath = root + '/' + options.outputPath;
  if (options.buildableProjectDepsInPackageJsonType == undefined) {
    options.buildableProjectDepsInPackageJsonType = 'peerDependencies';
  }
  return __assign(__assign({}, options), {
    babelConfig: normalizePluginPath(options.babelConfig, root),
    rollupConfig: normalizePluginPath(options.rollupConfig, root),
    assets: options.assets ? normalizeAssets(options.assets, root, sourceRoot) : undefined,
    entryFile: entryFile,
    entryRoot: entryRoot,
    project: project,
    projectRoot: projectRoot,
    outputPath: outputPath,
  });
}
exports.normalizePackageOptions = normalizePackageOptions;
function normalizeBuildOptions(options, root, sourceRoot) {
  return __assign(__assign({}, options), {
    root: root,
    sourceRoot: sourceRoot,
    main: path_1.resolve(root, options.main),
    outputPath: path_1.resolve(root, options.outputPath),
    tsConfig: path_1.resolve(root, options.tsConfig),
    fileReplacements: normalizeFileReplacements(root, options.fileReplacements),
    assets: normalizeAssets(options.assets, root, sourceRoot),
    webpackConfig: normalizePluginPath(options.webpackConfig, root),
  });
}
exports.normalizeBuildOptions = normalizeBuildOptions;
function normalizePluginPath(pluginPath, root) {
  if (!pluginPath) {
    return '';
  }
  try {
    return require.resolve(pluginPath);
  } catch (_a) {
    return path_1.resolve(root, pluginPath);
  }
}
function normalizeAssets(assets, root, sourceRoot) {
  return assets.map(function (asset) {
    if (typeof asset === 'string') {
      var assetPath = devkit_1.normalizePath(asset);
      var resolvedAssetPath = path_1.resolve(root, assetPath);
      var resolvedSourceRoot = path_1.resolve(root, sourceRoot);
      if (!resolvedAssetPath.startsWith(resolvedSourceRoot)) {
        throw new Error(
          'The ' + resolvedAssetPath + ' asset path must start with the project source root: ' + sourceRoot
        );
      }
      var isDirectory = fs_1.statSync(resolvedAssetPath).isDirectory();
      var input = isDirectory ? resolvedAssetPath : path_1.dirname(resolvedAssetPath);
      var output = path_1.relative(resolvedSourceRoot, path_1.resolve(root, input));
      var glob = isDirectory ? '**/*' : path_1.basename(resolvedAssetPath);
      return {
        input: input,
        output: output,
        glob: glob,
      };
    } else {
      if (asset.output.startsWith('..')) {
        throw new Error('An asset cannot be written to a location outside of the output path.');
      }
      var assetPath = devkit_1.normalizePath(asset.input);
      var resolvedAssetPath = path_1.resolve(root, assetPath);
      return __assign(__assign({}, asset), {
        input: resolvedAssetPath,
        // Now we remove starting slash to make Webpack place it from the output root.
        output: asset.output.replace(/^\//, ''),
      });
    }
  });
}
exports.normalizeAssets = normalizeAssets;
function normalizeFileReplacements(root, fileReplacements) {
  return fileReplacements.map(function (fileReplacement) {
    return {
      replace: path_1.resolve(root, fileReplacement.replace),
      with: path_1.resolve(root, fileReplacement['with']),
    };
  });
}
function normalizeWebBuildOptions(options, root, sourceRoot) {
  return __assign(__assign({}, normalizeBuildOptions(options, root, sourceRoot)), {
    optimization:
      typeof options.optimization !== 'object'
        ? {
            scripts: options.optimization,
            styles: options.optimization,
          }
        : options.optimization,
    sourceMap:
      typeof options.sourceMap === 'object'
        ? options.sourceMap
        : {
            scripts: options.sourceMap,
            styles: options.sourceMap,
            hidden: false,
            vendors: false,
          },
    polyfills: options.polyfills ? path_1.resolve(root, options.polyfills) : undefined,
    es2015Polyfills: options.es2015Polyfills ? path_1.resolve(root, options.es2015Polyfills) : undefined,
  });
}
exports.normalizeWebBuildOptions = normalizeWebBuildOptions;
function convertBuildOptions(buildOptions) {
  var options = buildOptions;
  return __assign(__assign({}, options), {
    buildOptimizer: options.optimization,
    aot: false,
    forkTypeChecker: false,
    lazyModules: [],
  });
}
exports.convertBuildOptions = convertBuildOptions;
