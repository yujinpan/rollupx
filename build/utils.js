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
      path.dirname(relativePath) +
        '/' +
        suffixTo(path.basename(relativePath), '.js')
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
  const imports = codes.match(
    new RegExp('(from\\s|require\\(|import(\\(|\\s))(\'|")[^\'"]*[\'"]', 'g')
  );
  if (imports) {
    // js/jsx/ts/tsx/vue to .js
    const isJS = new RegExp('(' + extensions.join('|') + ')$');
    // relative path
    const isAliasImport = new RegExp(
      '(' + Object.keys(aliasConfig).join('|') + ')(\\/|$)'
    );
    imports.forEach((item) => {
      const oldPath = item.replace(/.*['"]([^'"]*)['"].*/, '$1');
      let newPath = oldPath;
      if (isAliasImport.test(newPath)) {
        // read alias path config
        for (const key in aliasConfig) {
          if (newPath.startsWith(key)) {
            newPath = path.relative(
              path.dirname(filepath),
              resolve.sync(
                newPath.replace(new RegExp('^' + key), aliasConfig[key]),
                { extensions: extensions }
              )
            );
            newPath = newPath.startsWith('.') ? newPath : './' + newPath;
          }
        }
      }
      if (!newPath.includes('rollup-plugin-vue') && isJS.test(newPath)) {
        newPath = suffixTo(newPath, '');
      }
      if (oldPath !== newPath) {
        codes = codes.replace(item, item.replace(oldPath, newPath));
      }
    });
  }
  return codes;
}

/**
 * 校验文件
 */
function validate(files) {
  const filesBaseName = files.map((item) => suffixTo(item, ''));
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

function suffixTo(file, suffix = '') {
  return file.replace(/.[^.]+$/, suffix);
}

module.exports = {
  createRollupOption,
  transformToRelativePath
};
