const fs = require('fs');
const path = require('path');
const config = require('./config');
const utils = require('./utils');

/**
 * @param {import('./config.js')} options
 */
async function build(options = {}) {
  if (Array.isArray(options.extensions)) {
    options.extensions = config.extensions.concat(options.extensions);
  }

  options = utils.mergeProps(config, options);

  // parse arguments
  const args = process.argv.slice(2);
  if (args.length) {
    args.forEach((arg) => {
      if (arg.startsWith('--')) {
        let [key, val] = arg.slice(2).split('=');
        key = utils.toLowerCamelCase(key);
        if (key in options) {
          options[key] = Array.isArray(options[key]) ? val.split(',') : val;
        }
      }
    });
  }

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
  fs.rmSync(options.outputDir, { recursive: true, force: true });
  fs.mkdirSync(options.outputDir);

  // init alias
  const aliasConfig = options.aliasConfig;
  for (let key in aliasConfig) {
    // ~ 为 scss @import 语法前缀
    aliasConfig[key] = aliasConfig['~' + key] = path.resolve(aliasConfig[key]);
  }

  // build js
  if (options.outputs.includes('js')) {
    await utils.runTask('build js', require('./js')(options));
  }

  // build styles
  if (
    options.outputs.includes('styles') &&
    fs.existsSync(path.resolve(options.inputDir, options.stylesDir))
  ) {
    await utils.runTask('build styles', require('./styles')(options));
  }

  // build types
  if (options.outputs.includes('types')) {
    await utils.runTask('build types', require('./types')(options));
  }

  // build docs
  if (options.outputs.includes('docs') && options.docsOutputDir) {
    await utils.runTask('build docs', require('./docs')(options));
  }
}

module.exports = build;
