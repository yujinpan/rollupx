const path = require('path');

const config = require('./config');
const tsPaths = require('../tsconfig.json').compilerOptions.paths;

/**
 * 创建配置项
 * @param {String} filePath 例如：src/index.ts
 */
function createRollupFileOption(filePath) {
  const filename = filePath.split('/').pop();
  const outputPath = filePath
    .replace(filename, '')
    .replace(config.inputDir, config.outputDir);
  const outputName = `${outputPath}${filename.replace(/\.[^.]+$/g, '')}`;
  return {
    input: filePath,
    output: [
      // {
      //   file: `${outputName}.common.js`,
      //   format: 'cjs',
      //   banner: config.banner
      // },
      {
        file: `${outputName}.js`,
        format: 'es',
        banner: config.banner
      }
    ]
  };
}

function getAliasFromTSConfig() {
  const aliasConfig = {};

  for (const key in tsPaths) {
    if (tsPaths[key].length > 1) {
      console.warn(
        'alias.config.js warn:',
        'tsconfig.json paths value must be only one.\n'
      );
    }
    // must use root path
    aliasConfig[transformPath(key)] =
      path.resolve('./') + '/' + transformPath(tsPaths[key][0]);
  }

  return aliasConfig;
}

function transformPath(path) {
  return path.replace('/*', '');
}

function getAliasEntries() {
  const aliasEntries = [];
  const aliasConfig = getAliasFromTSConfig();
  for (let key in aliasConfig) {
    aliasEntries.push({
      find: key,
      replacement: aliasConfig[key]
    });
  }
  return aliasEntries;
}

module.exports = {
  createRollupFileOption,
  getAliasFromTSConfig,
  getAliasEntries
};
