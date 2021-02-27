'use strict';
exports.__esModule = true;
exports.createRollupOptions = void 0;
var devkit_1 = require('@nrwl/devkit');
var rollup = require('rollup');
var peerDepsExternal = require('rollup-plugin-peer-deps-external');
var localResolve = require('rollup-plugin-local-resolve');
var plugin_babel_1 = require('@rollup/plugin-babel');
// These use require because the ES import isn't correct.
var resolve = require('@rollup/plugin-node-resolve');
var commonjs = require('@rollup/plugin-commonjs');
var typescript = require('rollup-plugin-typescript2');
var image = require('@rollup/plugin-image');
var json = require('@rollup/plugin-json');
var copy = require('rollup-plugin-copy');
var postcss = require('rollup-plugin-postcss');
var filesize = require('rollup-plugin-filesize');
var path_1 = require('path');
var rxjs_1 = require('rxjs');
var operators_1 = require('rxjs/operators');
var rxjs_for_await_1 = require('rxjs-for-await');
var autoprefixer = require('autoprefixer');
var fileutils_1 = require('@nrwl/workspace/src/utilities/fileutils');
var project_graph_1 = require('@nrwl/workspace/src/core/project-graph');
var buildable_libs_utils_1 = require('@nrwl/workspace/src/utilities/buildable-libs-utils');
var normalize_1 = require('../../utils/normalize');
var delete_output_dir_1 = require('../../utils/delete-output-dir');
var run_rollup_1 = require('./run-rollup');
var outputConfigs = [
  { format: 'umd', extension: 'umd' },
  { format: 'iife', extension: 'iife' },
];
var fileExtensions = ['.js', '.jsx', '.ts', '.tsx'];
function run(rawOptions, context) {
  var project = context.workspace.projects[context.projectName];
  var sourceRoot = project.sourceRoot;
  var projGraph = project_graph_1.createProjectGraph();
  var _a = buildable_libs_utils_1.calculateProjectDependencies(
      projGraph,
      context.root,
      context.projectName,
      context.targetName,
      context.configurationName
    ),
    target = _a.target,
    dependencies = _a.dependencies;
  if (
    !buildable_libs_utils_1.checkDependentProjectsHaveBeenBuilt(
      context.root,
      context.projectName,
      context.targetName,
      dependencies
    )
  ) {
    throw new Error();
  }
  var options = normalize_1.normalizePackageOptions(rawOptions, context.root, sourceRoot);
  var packageJson = fileutils_1.readJsonFile(options.project);
  var rollupOptions = createRollupOptions(options, dependencies, context, packageJson, sourceRoot);
  if (options.watch) {
    var watcher_1 = rollup.watch(rollupOptions);
    return rxjs_for_await_1.eachValueFrom(
      new rxjs_1.Observable(function (obs) {
        watcher_1.on('event', function (data) {
          if (data.code === 'START') {
            devkit_1.logger.info('Bundling ' + context.projectName + '...');
          } else if (data.code === 'END') {
            updatePackageJson(options, context, target, dependencies, packageJson);
            devkit_1.logger.info('Bundle complete. Watching for file changes...');
            obs.next({ success: true });
          } else if (data.code === 'ERROR') {
            devkit_1.logger.error('Error during bundle: ' + data.error.message);
            obs.next({ success: false });
          }
        });
        // Teardown logic. Close watcher when unsubscribed.
        return function () {
          return watcher_1.close();
        };
      })
    );
  } else {
    devkit_1.logger.info('Bundling ' + context.projectName + '...');
    // Delete output path before bundling
    if (options.deleteOutputPath) {
      delete_output_dir_1.deleteOutputDir(context.root, options.outputPath);
    }
    return rxjs_1
      .from(rollupOptions)
      .pipe(
        operators_1.concatMap(function (opts) {
          return run_rollup_1.runRollup(opts).pipe(
            operators_1.catchError(function (e) {
              devkit_1.logger.error('Error during bundle: ' + e);
              return rxjs_1.of({ success: false });
            }),
            operators_1.last(),
            operators_1.tap({
              next: function (result) {
                if (result.success) {
                  updatePackageJson(options, context, target, dependencies, packageJson);
                  devkit_1.logger.info('Bundle complete: ' + context.projectName);
                } else {
                  devkit_1.logger.error('Bundle failed: ' + context.projectName);
                }
              },
            })
          );
        })
      )
      .toPromise();
  }
}
exports['default'] = run;
// -----------------------------------------------------------------------------
function createRollupOptions(options, dependencies, context, packageJson, sourceRoot) {
  return outputConfigs.map(function (config) {
    var compilerOptionPaths = buildable_libs_utils_1.computeCompilerOptionsPaths(options.tsConfig, dependencies);
    var plugins = [
      copy({
        targets: convertCopyAssetsToRollupOptions(options.outputPath, options.assets),
      }),
      image(),
      typescript({
        check: true,
        tsconfig: options.tsConfig,
        tsconfigOverride: {
          compilerOptions: {
            rootDir: options.entryRoot,
            allowJs: false,
            declaration: true,
            paths: compilerOptionPaths,
            target: config.format === 'esm' ? undefined : 'es5',
          },
        },
      }),
      peerDepsExternal({
        packageJsonPath: options.project,
      }),
      postcss({
        inject: true,
        extract: options.extractCss,
        autoModules: true,
        plugins: [autoprefixer],
      }),
      localResolve(),
      resolve['default']({
        preferBuiltins: true,
        extensions: fileExtensions,
      }),
      plugin_babel_1.getBabelInputPlugin({
        cwd: path_1.join(context.root, sourceRoot),
        rootMode: 'upward',
        babelrc: true,
        extensions: fileExtensions,
        babelHelpers: 'bundled',
        exclude: /node_modules/,
        plugins: [
          config.format === 'esm' ? undefined : require.resolve('babel-plugin-transform-async-to-promises'),
        ].filter(Boolean),
      }),
      commonjs(),
      filesize(),
      json(),
    ];
    var globals = options.globals
      ? options.globals.reduce(function (acc, item) {
          acc[item.moduleId] = item.global;
          return acc;
        }, {})
      : {};
    var externalPackages = dependencies
      .map(function (d) {
        return d.name;
      })
      .concat(options.external || [])
      .concat(Object.keys(packageJson.dependencies || {}));
    var rollupConfig = {
      input: options.entryFile,
      output: {
        globals: globals,
        format: config.format,
        file: options.outputPath + '/' + context.projectName + '.' + config.extension + '.js',
        name: options.umdName || devkit_1.names(context.projectName).className,
      },
      external: function (id) {
        return externalPackages.includes(id);
      },
      plugins: plugins,
    };
    return options.rollupConfig ? require(options.rollupConfig)(rollupConfig, options) : rollupConfig;
  });
}
exports.createRollupOptions = createRollupOptions;
function updatePackageJson(options, context, target, dependencies, packageJson) {
  var entryFileTmpl = './' + context.projectName + '.<%= extension %>.js';
  var typingsFile = path_1.relative(options.entryRoot, options.entryFile).replace(/\.[jt]sx?$/, '.d.ts');
  packageJson.main = entryFileTmpl.replace('<%= extension %>', 'umd');
  packageJson.module = entryFileTmpl.replace('<%= extension %>', 'cjs');
  packageJson.typings = './' + typingsFile;
  fileutils_1.writeJsonFile(options.outputPath + '/package.json', packageJson);
  if (dependencies.length > 0 && options.updateBuildableProjectDepsInPackageJson) {
    buildable_libs_utils_1.updateBuildableProjectPackageJsonDependencies(
      context.root,
      context.projectName,
      context.targetName,
      context.configurationName,
      target,
      dependencies,
      options.buildableProjectDepsInPackageJsonType
    );
  }
}
function convertCopyAssetsToRollupOptions(outputPath, assets) {
  return assets
    ? assets.map(function (a) {
        return {
          src: path_1.join(a.input, a.glob).replace(/\\/g, '/'),
          dest: path_1.join(outputPath, a.output).replace(/\\/g, '/'),
        };
      })
    : undefined;
}
