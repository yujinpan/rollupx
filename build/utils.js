const path = require('path');
const resolve = require('resolve');
const glob = require('glob');

const styleExtensions = ['.scss', '.sass', '.less', '.css'];

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
  const imports = removeComment(codes).match(
    // import {} from '...'
    // import '...'
    // require('...')
    // import('...')
    // @import('...')
    // @import url('...')
    new RegExp(
      '(from\\s+|import\\s+|require\\(|import\\(|@import\\s+(url\\()?)(\'|").+(\'|")',
      'g'
    )
  );

  if (imports) {
    imports.forEach((item) => {
      const oldPath = item.replace(/.*['"](.+)['"].*/, '$1');
      let newPath = toRelative(filepath, oldPath, aliasConfig, extensions);
      // 尾部的 .vue 转换
      if (
        newSuffix !== false &&
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

function toRelative(filepath, resolvePath, aliasConfig, extensions) {
  // 调整顺序，提高多个字符的匹配度，例如：~@ 比 ～ 优先级高
  const keys = Object.keys(aliasConfig).sort((a, b) => b.length - a.length);
  keys.forEach((key) => {
    // 仅有 @ 或者 @/ 或者 ~xxx 形式
    if (
      resolvePath === key ||
      resolvePath.startsWith(key + '/') ||
      (key === '~' && resolvePath.startsWith('~'))
    ) {
      resolvePath = path.relative(
        path.dirname(filepath),
        resolve.sync(
          resolvePath.replace(
            new RegExp('^' + key),
            // 当前缀为 ～ 时，需要补充 /
            aliasConfig[key] + (key === '~' ? '/' : '')
          ),
          { extensions }
        )
      );
      resolvePath = resolvePath.startsWith('.')
        ? resolvePath
        : './' + resolvePath;
    }
  });
  return resolvePath;
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

/**
 * 移除注释代码
 * - //
 * - /*
 * - *
 * - <
 */
function removeComment(codes) {
  return codes.replace(/^\s*(\/\/|\/\*|\*|<).*$/gm, '');
}

module.exports = {
  deDup,
  getFiles,
  mergeProps,
  suffixTo,
  transformToRelativePath,
  toRelative,
  styleExtensions
};
