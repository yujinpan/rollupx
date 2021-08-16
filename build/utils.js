const path = require('path');
const { getRollupBaseConfig } = require('./rollup.config');
const resolve = require('resolve');
const glob = require('glob');

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
  const relativePath = path.relative(inputDir, filePath);
  const outputFile = path.join(
    outputDir,
    path.dirname(relativePath) +
      '/' +
      suffixTo(path.basename(relativePath), '.js')
  );
  return {
    ...rollupConfig,
    plugins: rollupConfig.plugins.concat(
      singleFile ? [] : [relativePlugin(aliasConfig, extensions)]
    ),
    input: filePath,
    output: [
      {
        file: outputFile,
        format: 'es',
        banner: banner
      }
    ]
  };
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
function transformToRelativePath(
  codes,
  filepath,
  aliasConfig,
  extensions,
  newSuffix = '.js'
) {
  const imports = codes.match(
    // import {} from '...'
    // require('...')
    // import('...')
    // @import('...')
    // @import url('...')
    new RegExp(
      '(from\\s+|require\\(|import\\(|@import\\s+(url\\()?)(\'|").+(\'|")',
      'g'
    )
  );

  if (imports) {
    const isAlias = new RegExp(
      '^(' + Object.keys(aliasConfig).join('|') + ')(\\/.*)?$'
    );
    imports.forEach((item) => {
      const oldPath = item.replace(/.*['"](.+)['"].*/, '$1');
      let newPath = oldPath;
      // 别名路径转换
      if (isAlias.test(oldPath)) {
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
      // 尾部的 .vue 转换
      if (
        !newPath.includes('rollup-plugin-vue') &&
        /\.(jsx|ts|tsx|vue)$/.test(newPath)
      ) {
        newPath = suffixTo(newPath, newSuffix);
      }
      if (oldPath !== newPath) {
        codes = codes.replace(item, item.replace(oldPath, newPath));
      }
    });
  }
  return codes;
}

function suffixTo(file, suffix = '') {
  return file.replace(/\.[^.]+$/, suffix);
}

function mergeProps(source, target) {
  for (let key in source) {
    if (key in target) {
      const sourceItem = source[key];
      const targetItem = target[key];
      if (isPlainObj(sourceItem) && isPlainObj(targetItem)) {
        mergeProps(sourceItem, targetItem);
      } else {
        source[key] = targetItem;
      }
    }
  }
  return source;
}

function getFiles(arrPattern, dir, reg) {
  return deDup(
    arrPattern
      .map((item) => glob.sync(path.resolve(dir, item)))
      .flat()
      .filter((item) => reg.test(item))
  );
}

function deDup(arr) {
  return Array.from(new Set(arr));
}

function isPlainObj(obj) {
  return typeof obj === 'object' && obj !== null && !Array.isArray(obj);
}

module.exports = {
  deDup,
  getFiles,
  mergeProps,
  suffixTo,
  createRollupOption,
  transformToRelativePath
};
