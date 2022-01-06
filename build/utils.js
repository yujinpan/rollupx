const path = require('path');
const resolve = require('resolve');
const glob = require('glob');
const through = require('through2');
const { parseComponent } = require('vue-template-compiler');

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
      resolvePath = path
        .relative(
          path.dirname(filepath),
          resolve.sync(
            resolvePath.replace(
              new RegExp('^' + key),
              // 当前缀为 ～ 时，需要补充 /
              aliasConfig[key] + (key === '~' ? '/' : '')
            ),
            { extensions }
          )
        )
        // fix: windows path will be \
        .split(path.sep)
        .join('/');
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

/**
 * gulp 获取 vue 的 script 内容插件
 */
function gulpPickVueScript() {
  return through.obj(function (file, _, cb) {
    if (file.extname === '.vue') {
      const code = file.contents.toString();
      const scripts = parseComponent(code);
      const lang = scripts.script.lang;
      file.contents = Buffer.from(
        (scripts.script
          ? scripts.script.content
          : `import { Vue } from 'vue-property-decorator';export default class extends Vue {}`
        ).trim()
      );
      file.extname = '.' + lang;
    }
    cb(null, file);
  });
}

/**
 * run task
 * @param {string} label
 * @param {Promise} task
 * @return {Promise<void>}
 */
async function runTask(label, task) {
  printMsg(`${label} start...`);
  console.time(`${label} time`);
  await task.catch((e) => printErr(`${label} error!`, e));
  console.timeEnd(`${label} time`);
  printMsg(`${label} completed!\n`);
}

function printMsg(msg) {
  console.log(`\x1b[32m[rollupx] ${msg}\x1b[0m`);
}

function printErr(name, err) {
  console.log(`\x1b[31m[rollupx] ${name}\x1b[0m`, err);
}

function toLowerCamelCase(str) {
  let result = '';
  str = str.split('');
  for (let i = 0; i < str.length; i++) {
    if (str[i] === '-') {
      str[i + 1] = str[i + 1].toUpperCase();
    } else {
      result += str[i];
    }
  }
  return result;
}

module.exports = {
  deDup,
  getFiles,
  mergeProps,
  suffixTo,
  transformToRelativePath,
  toRelative,
  styleExtensions,
  gulpPickVueScript,
  printMsg,
  printErr,
  runTask,
  toLowerCamelCase
};
