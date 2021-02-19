const path = require('path');
const glob = require('glob');
const { getRollupBaseConfig } = require('./rollup.config');
const resolve = require('resolve');

function createRollupOption(
  filePath,
  inputDir,
  outputDir,
  banner,
  aliasConfig,
  extensions,
  singleFile
) {
  const rollupConfig = getRollupBaseConfig(aliasConfig, extensions, singleFile);
  const files = glob.sync(filePath);
  validate(files);
  return files.map((item) => {
    const relativePath = path.relative(inputDir, item);
    const file = path.join(
      outputDir,
      path.dirname(relativePath) + '/' + suffixToJS(path.basename(relativePath))
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

/**
 * 校验文件
 */
function validate(files) {
  const filesBaseName = files.map(suffixToJS);
  filesBaseName.forEach((item1, index1) => {
    filesBaseName.forEach((item2, index2) => {
      if (index1 !== index2 && item1 === item2) {
        throw new Error(
          `[rollupx] '${item1}' are multiple in the same name, when the suffix is different, the file name must also be different.`
        );
      }
    });
  });
}

function suffixToJS(file) {
  return file.replace(/.[^.]+$/, '');
}

module.exports = {
  createRollupOption,
  transformToRelativePath
};
