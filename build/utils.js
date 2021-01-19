const path = require('path');
const glob = require('glob');
const { getRollupConfig } = require('./rollup.config');
const resolve = require('resolve');

/**
 * 创建配置项
 * @param {String} filePath 例如：src/index.ts
 * @param {String} inputDir 例如：src
 * @param {String} outputDir 例如：dist
 * @param {String} banner
 * @param {Object} aliasConfig
 * @param {Array} extensions
 */
function createRollupOption(
  filePath,
  inputDir,
  outputDir,
  banner,
  aliasConfig,
  extensions
) {
  const rollupConfig = getRollupConfig(aliasConfig, extensions);
  const files = glob.sync(filePath);
  return files.map((item) => {
    const relativePath = path.relative(inputDir, item);
    const file = path.join(
      outputDir,
      path.dirname(relativePath) +
        '/' +
        path.basename(relativePath).replace('.ts', '.js') +
        (item.endsWith('.vue') ? '.js' : '')
    );
    return {
      ...rollupConfig,
      plugins: rollupConfig.plugins.concat([
        relativePlugin(aliasConfig, extensions)
      ]),
      input: item,
      output: [
        {
          file: file,
          format: 'es',
          banner: banner
        }
      ]
    };
  });
}

/**
 * 将文件中的缩写路径转换为相对路径
 */
function relativePlugin(aliasConfig, extensions) {
  return {
    name: 'rollup-plugin-relative',
    transform(code, id) {
      return transformToRelativePath(code, id, aliasConfig, extensions);
    }
  };
}

/**
 * transform absolute path to relative path
 */
function transformToRelativePath(codes, filepath, aliasConfig, extensions) {
  const isAliasImports = new RegExp(
    '(from\\s|require\\(|import(\\(|\\s))(\'|")' +
      '(' +
      Object.keys(aliasConfig).join('|') +
      ')(\\/[^\'"]*)?[\'"]',
    'g'
  );
  const imports = codes.match(isAliasImports);
  if (imports) {
    // get source path
    const paths = imports.map((item) =>
      item.replace(/.*['"]([^'"]*)['"].*/, '$1')
    );

    // get relative path
    const relativePaths = paths
      .map((item) => {
        // read alias path config
        for (const key in aliasConfig) {
          if (item.startsWith(key)) {
            return path
              .relative(
                path.dirname(filepath),
                resolve.sync(
                  item.replace(new RegExp('^' + key), aliasConfig[key]),
                  { extensions: extensions }
                )
              )
              .replace(/.ts$/, '');
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
  createRollupOption,
  transformToRelativePath
};
