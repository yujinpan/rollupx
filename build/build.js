const fs = require('fs');
const path = require('path');
const config = require('./config');
const utils = require('./utils');

/**
 * @param {import('./config.js')} options
 */
async function build(options = {}) {
  if (Array.isArray(options.extensions))
    options.extensions = config.extensions.concat(options.extensions);
  options = utils.mergeProps(config, options);

  // validate
  if (!options.inputDir || !options.outputDir)
    return printErr('rollupx.config.js', '"inputDir/outputDir" required');
  if (options.format !== 'es' && !options.outputName)
    return printErr(
      'rollupx.config.js',
      'when "format" is not "es", "outputName" required'
    );

  // resolve path
  options.inputDir = path.resolve(options.inputDir);
  options.outputDir = path.resolve(options.outputDir);
  options.typesOutputDir = path.resolve(
    options.outputDir || options.typesOutputDir
  );
  const aliasConfig = options.aliasConfig;
  for (let key in aliasConfig) {
    // ~ 为 scss @import 语法前缀
    aliasConfig[key] = aliasConfig['~' + key] = path.resolve(aliasConfig[key]);
  }

  // clear
  fs.rmdirSync(options.outputDir, { recursive: true });
  fs.mkdirSync(options.outputDir);
  // types 不一定在 src 下面，所以单独创建
  fs.rmdirSync(options.typesOutputDir, { recursive: true });
  fs.mkdirSync(options.typesOutputDir);

  // build js
  await require('./js')(options)
    .then(() => printMsg('build js completed!'))
    .catch((e) => printErr('build js error:', e));

  // build styles
  if (fs.existsSync(path.resolve(options.inputDir, options.stylesDir))) {
    await require('./styles')(options)
      .then(() => printMsg('build styles completed!'))
      .catch((e) => printErr('build styles error:', e));
  }

  // build types
  await require('./types')(options)
    .then(() => printMsg('build types completed!'))
    .catch((e) => printErr('build types error:', e));
}

function printMsg(msg) {
  console.log(`\x1b[32m[rollupx] ${msg}\x1b[0m`);
}

function printErr(name, err) {
  console.log(`\x1b[31m[rollupx] ${name}\x1b[0m`, err);
}

module.exports = build;
