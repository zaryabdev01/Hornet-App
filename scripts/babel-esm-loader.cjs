// Dev-only helper: lets plain Node `require()` load the project's ESM source
// files (src/**) directly, by transpiling import/export -> CommonJS on the fly
// via the already-installed @babel/core. Node's native ESM loader requires
// explicit file extensions on relative imports (which this codebase doesn't
// use), so requiring the real .js files unmodified isn't otherwise possible
// without a bundler. This changes nothing under src/ — it's purely a test
// harness utility (used by scripts/*.cjs) and is not shipped in the app.
const path = require('path');
const babel = require('@babel/core');
const Module = require('module');

const projectRoot = path.resolve(__dirname, '..');
const srcRoot = path.join(projectRoot, 'src');

const originalJsLoader = Module._extensions['.js'];
Module._extensions['.js'] = function (mod, filename) {
  if (filename.startsWith(srcRoot)) {
    const { code } = babel.transformFileSync(filename, {
      plugins: ['@babel/plugin-transform-modules-commonjs'],
      babelrc: false,
      configFile: false,
    });
    mod._compile(code, filename);
    return;
  }
  return originalJsLoader(mod, filename);
};

module.exports = {};
