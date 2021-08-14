const fs = require('fs');
const path = require('path');
const config = require('./config');
const utils = require('./utils');

/**
 * @param {import('./config.js').Options} options
 */
async function build(options = {}) {
  if (Array.isArray(options.extensions))
    options.extensions = config.extensions.concat(options.extensions);
  options = utils.mergeProps(config, options);

  // validate
  if (!options.inputDir || !options.outputDir)
    return console.log('inputDir/outputDir required');

  // resolve path
  options.inputDir = path.resolve(options.inputDir);
  options.outputDir = path.resolve(options.outputDir);
  options.typesOutputDir = path.resolve(options.typesOutputDir);
  const aliasConfig = options.aliasConfig;
  for (let key in aliasConfig) {
    aliasConfig[key] = path.resolve(aliasConfig[key]);
  }

  // clear
  fs.rmdirSync(options.outputDir, { recursive: true });
  fs.mkdirSync(options.outputDir);

  // build js
  await require('./js')(
    options.inputFiles,
    options.inputDir,
    options.outputDir,
    options.banner,
    options.aliasConfig,
    options.extensions,
    options.singleFile
  )
    .then(() => printMsg('build js completed!'))
    .catch((e) => printErr('build js error:', e));

  // build styles
  const stylesDir = path.resolve(options.inputDir, options.stylesDir);
  if (fs.existsSync(stylesDir)) {
    // build styles
    await require('./styles')(
      stylesDir,
      path.resolve(options.outputDir, options.stylesDir),
      options.stylesParseFiles,
      options.stylesCopyFiles,
      options.aliasConfig
    )
      .then(() => printMsg('build styles completed!'))
      .catch((e) => printErr('build styles error:', e));
  }

  // build types
  await require('./types')(
    options.tsConfig,
    options.inputDir,
    options.typesOutputDir,
    options.extensions,
    options.aliasConfig,
    options.typesGlobal
  )
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
