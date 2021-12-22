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
    return utils.printErr('rollupx.config.js', '"inputDir/outputDir" required');
  if (options.format !== 'es' && !options.outputName)
    return utils.printErr(
      'rollupx.config.js',
      'when "format" is not "es", "outputName" required'
    );

  // resolve path
  options.inputDir = path.resolve(options.inputDir);
  options.outputDir = path.resolve(options.outputDir);

  // clear
  fs.rmdirSync(options.outputDir, { recursive: true });
  fs.mkdirSync(options.outputDir);

  const aliasConfig = options.aliasConfig;
  for (let key in aliasConfig) {
    // ~ 为 scss @import 语法前缀
    aliasConfig[key] = aliasConfig['~' + key] = path.resolve(aliasConfig[key]);
  }

  // build js
  await require('./js')(options)
    .then(() => utils.printMsg('build js completed!'))
    .catch((e) => utils.printErr('build js error:', e));

  // build styles
  if (fs.existsSync(path.resolve(options.inputDir, options.stylesDir))) {
    await require('./styles')(options)
      .then(() => utils.printMsg('build styles completed!'))
      .catch((e) => utils.printErr('build styles error:', e));
  }

  // build types
  await require('./types')(options)
    .then(() => utils.printMsg('build types completed!'))
    .catch((e) => utils.printErr('build types error:', e));

  // build docs
  if (options.docsOutputDir) {
    await require('./docs')(options)
      .then(() => utils.printMsg('build docs completed!'))
      .catch((e) => utils.printErr('build docs error:', e));
  }
}

module.exports = build;
