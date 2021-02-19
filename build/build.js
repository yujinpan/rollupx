const fs = require('fs');
const path = require('path');
const config = require('./config');

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
 * @property {string} [typesOutputDir] 类型文件输出目录名，默认继承 outputDir
 * @property {boolean} [singleFile] 是否打包为单文件，默认为 true
 */
async function build(options) {
  options = Object.assign(config, options);

  // validate
  if (!options.inputDir || !options.outputDir)
    return console.log('inputDir/outputDir required');

  // resolve path
  options.inputDir = path.resolve(options.inputDir);
  options.outputDir = path.resolve(options.outputDir);
  if (options.typesOutputDir) {
    options.typesOutputDir = path.resolve(options.typesOutputDir);
    // clear
    fs.rmdirSync(options.typesOutputDir, { recursive: true });
    fs.mkdirSync(options.typesOutputDir);
  }
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
  ).then(() => {
    printMsg('build js completed!');
  });

  // build types
  await require('./types')(
    options.tsConfig,
    options.inputDir,
    options.typesOutputDir || options.outputDir,
    options.extensions,
    options.aliasConfig,
    options.typesGlobal
  ).then(() => {
    printMsg('build types completed!');
  });

  if (
    options.stylesDir &&
    fs.existsSync(options.inputDir + '/' + options.stylesDir)
  ) {
    // build styles
    await require('./styles')(
      options.inputDir + '/' + options.stylesDir,
      options.outputDir + '/' + options.stylesDir,
      options.stylesCopyFiles
    ).then(() => {
      printMsg('build styles completed!');
    });
  }
}

function printMsg(msg) {
  console.log(`\x1b[32m${msg}\x1b[0m`);
}

module.exports = build;
