const path = require('path');
const glob = require('glob');
const config = require('./config');
const aliasConfig = require('../alias.config');
const rollupConfig = require('./rollup.config');

/**
 * 创建配置项
 * @param {String} filePath 例如：src/index.ts
 */
function createRollupFileOption(filePath) {
  const files = glob.sync(filePath);
  return files.map((item) => {
    const relativePath = path.relative('src', item);
    const file = path.join(
      config.outputDir,
      path.dirname(relativePath) +
        '/' +
        path.basename(relativePath).replace('.ts', '.js') +
        (item.endsWith('.vue') ? '.js' : '')
    );
    return {
      ...rollupConfig,
      plugins: rollupConfig.plugins.concat([relativePlugin()]),
      input: item,
      output: [
        {
          file: file,
          format: 'es',
          banner: config.banner
        }
      ]
    };
  });
}

/**
 * 将文件中的缩写路径转换为相对路径
 */
function relativePlugin() {
  return {
    name: 'rollup-plugin-relative',
    transform(code, id) {
      return transformToRelativePath(code, id);
    }
  };
}

/**
 * transform absolute path to relative path
 */
function transformToRelativePath(codes, filepath) {
  const imports = codes.match(/(from\s|require\(|import\()'@\/[^']*'\)?/g);
  if (imports) {
    // get source path
    const paths = imports.map((item) =>
      item.replace(/^(from\s|require\(|import\()'/, '').replace(/'\)?/, '')
    );

    // get relative path
    const relativePaths = paths
      .map((item) => {
        // read alias path config
        for (let key in aliasConfig) {
          if (item.startsWith(key)) {
            return path.relative(
              filepath,
              item.replace(new RegExp('^' + key), aliasConfig[key])
            );
          }
        }
        console.warn(
          'gulpfile.js warn:',
          'can not find the path config:' + item
        );
        return item;
      })
      // add ./
      .map((item) => (item.startsWith('.') ? item : './' + item));

    // replace source code
    paths.forEach((item, index) => {
      codes = codes.replace(item, relativePaths[index]);
    });
  }
  return codes;
}

module.exports = {
  createRollupFileOption,
  transformToRelativePath
};
