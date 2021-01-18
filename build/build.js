const fs = require('fs');
const config = require('./config');
const utils = require('./utils');

/**
 * @param {object} options
 * @property {string[]} [inputFiles] 匹配输入的文件
 * @property {string} [inputDir] 输入文件根目录名
 * @property {string} [outputDir] 输出目录名
 * @property {string} [banner] 文件头信息
 * @property {object} [aliasConfig] 路径别名配置
 * @property {string[]} [extensions] 扩展名配置
 * @property {object} [tsConfig] tsconfig.json 配置
 * @property {string} [stylesDir] 样式目录名，基于 inputDir
 * @property {string[]} [stylesCopyFiles] 需要拷贝的样式文件，例如 scss 变量可能需要拷贝
 */
function build(options) {
  options = Object.assign(config, options);

  // validate
  if (!options.inputDir || !options.outputDir || !options.stylesDir)
    return console.log('inputDir/outputDir/stylesDir required');
  if (!/^\w+$/.test(options.inputDir + options.outputDir + options.stylesDir))
    return console.log('inputDir/outputDir/stylesDir must be a dirname');

  options.inputDir = utils.toAbsolutePath(options.inputDir);
  options.outputDir = utils.toAbsolutePath(options.outputDir);

  // clear
  fs.rmdirSync(options.outputDir, { recursive: true });
  fs.mkdirSync(options.outputDir);

  // build js
  require('./js')(
    options.inputFiles,
    options.inputDir,
    options.outputDir,
    options.banner,
    options.aliasConfig,
    options.extensions
  ).then(() => {
    console.log('build js completed!');
  });

  // build types
  require('./types')(
    options.tsConfig,
    options.inputDir,
    options.outputDir,
    options.extensions,
    options.aliasConfig
  ).then(() => {
    console.log('build types completed!');
  });

  // build styles
  require('./styles')(
    options.inputDir + '/' + options.stylesDir,
    options.outputDir + '/' + options.stylesDir,
    options.stylesCopyFiles
  ).then(() => {
    console.log('build styles completed!');
  });
}

module.exports = build;
