import autoprefixer from 'autoprefixer';
import glob from 'glob';
import path from 'path';
import postcssUrl from 'postcss-url';
import resolve from 'resolve';
import through from 'through2';

import type { Options } from './config';
import type { SFCDescriptor } from '@vue/compiler-sfc';

export const styleExtensions = ['.scss', '.sass', '.less', '.css'];

/**
 * transform absolute path to relative path
 */
export function transformToRelativePath(
  codes: string,
  filepath: string,
  aliasConfig: Options['aliasConfig'],
  extensions: Options['extensions'],
  newSuffix: string | false = '.js',
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
      'g',
    ),
  );

  if (imports) {
    imports.forEach((item) => {
      const oldPath = item.replace(/.*['"](.+)['"].*/, '$1');
      let newPath = toRelative(filepath, oldPath, aliasConfig, extensions);
      // 尾部的 .vue 转换
      if (
        newSuffix !== false &&
        !newPath.includes('?vue&') &&
        /\.(jsx|ts|tsx|vue)$/.test(newPath) &&
        !isNodeModules(filepath, newPath, extensions, aliasConfig)
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

export function toRelative(
  filepath: string,
  resolvePath: string,
  aliasConfig: Options['aliasConfig'],
  extensions: Options['extensions'],
) {
  if (
    resolvePath.startsWith('node_modules') ||
    resolvePath.startsWith(path.sep) ||
    resolvePath.startsWith('.')
  ) {
    return resolvePath;
  }

  const aliasKey = findAliasKey(resolvePath, aliasConfig);

  if (aliasKey) {
    resolvePath = path
      .relative(
        path.dirname(filepath),
        resolve.sync(
          resolvePath.replace(
            new RegExp('^' + aliasKey),
            aliasConfig[aliasKey] +
              (aliasConfig[aliasKey].endsWith('/') ? '' : '/'),
          ),
          { extensions },
        ),
      )
      // fix: windows path will be \
      .split(path.sep)
      .join('/');
    resolvePath = resolvePath.startsWith('.')
      ? resolvePath
      : './' + resolvePath;

    return resolvePath;
  } else {
    // not alias path
    if (resolvePath.startsWith('~')) {
      return resolvePath;
    }

    // scss & not alias path, and maybe: 1. relative path 2. node_modules
    if (
      /.(sass|scss)$/.test(filepath) &&
      !isCurrentDir(filepath, resolvePath, extensions)
    ) {
      return '~' + resolvePath;
    }

    return resolvePath;
  }
}

export function suffixTo(file: string, suffix = '') {
  return file.replace(/\.[^.]+$/, suffix);
}

export function mergeProps<T extends object>(source: T, target: T): T {
  for (const key in target) {
    const sourceItem = source[key];
    const targetItem = target[key];
    if (isPlainObj(sourceItem) && isPlainObj(targetItem)) {
      mergeProps(sourceItem as object, targetItem as object);
    } else {
      source[key] = targetItem;
    }
  }
  return source;
}

export function getFiles(arrPattern, dir, includeReg, excludes = []) {
  return deDup(
    arrPattern
      .map((item) => {
        return glob.sync(path.resolve(dir, item), {
          ignore: excludes,
        });
      })
      .flat()
      .filter((item) => includeReg.test(item)),
  );
}

export function deDup(arr: any[]) {
  return Array.from(new Set(arr));
}

export function isPlainObj(obj: any) {
  return typeof obj === 'object' && obj !== null && !Array.isArray(obj);
}

export function isCurrentDir(
  currentDir: string,
  resolvePath: string,
  extensions: Options['extensions'],
) {
  try {
    resolve.sync(path.resolve(path.dirname(currentDir), resolvePath), {
      extensions,
    });
    return true;
  } catch (e) {
    return false;
  }
}

export function findAliasKey(
  resolvePath: string,
  aliasConfig: Options['aliasConfig'],
) {
  // 调整顺序，提高多个字符的匹配度，例如：~@ 比 ～ 优先级高
  const keys = Object.keys(aliasConfig).sort((a, b) => b.length - a.length);
  return keys.find((key) => {
    // 仅有 @ 或者 @/
    return resolvePath === key || resolvePath.startsWith(key + '/');
  });
}

export function isNodeModules(
  currentDir: string,
  resolvePath: string,
  extensions: Options['extensions'],
  aliasConfig: Options['aliasConfig'],
) {
  if (resolvePath.includes('node_modules') || resolvePath.startsWith('~'))
    return true;

  if (findAliasKey(resolvePath, aliasConfig)) return false;

  return !isCurrentDir(currentDir, resolvePath, extensions);
}

/**
 * 移除注释代码
 * - //
 * - /*
 * - *
 * - <
 */
export function removeComment(codes: string) {
  return codes.replace(/^\s*(\/\/|\/\*|\*|<).*$/gm, '');
}

/**
 * gulp 获取 vue 的 script 内容插件
 */
export function gulpPickVueScript(languages = ['js', 'jsx', 'ts', 'tsx']) {
  return through.obj(function (file, _, cb) {
    if (file.extname === '.vue') {
      const code = file.contents.toString();
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const parsed = require('@vue/compiler-sfc').parse(code);
      const { script } = (parsed.descriptor || parsed) as SFCDescriptor;

      const lang = script?.lang || 'js';

      if (!languages.includes(lang)) return cb();

      file.contents = Buffer.from(
        (script ? script.content : `export default {};`).trim(),
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
export async function runTask(label: string, task: Promise<any>) {
  printMsg(`${label} start...`);
  // eslint-disable-next-line no-console
  console.time(`${label} time`);
  await task.catch((e) => printErr(`${label} error!`, e));
  // eslint-disable-next-line no-console
  console.timeEnd(`${label} time`);
  printMsg(`${label} completed!\n`);
}

export function printMsg(msg: string) {
  // eslint-disable-next-line no-console
  console.log(`\x1b[32m[rollupx] ${msg}\x1b[0m`);
}

export function printErr(name: string, ...errs) {
  // eslint-disable-next-line no-console
  console.log(`\x1b[31m[rollupx] ${name}\x1b[0m`, ...errs);
}

export function printWarn(name: string, ...warn) {
  // eslint-disable-next-line no-console
  console.log(`\x1b[33m[rollupx] ${name}\x1b[0m`, ...warn);
}

export function toLowerCamelCase(str: string) {
  const words = str.split('');

  let result = '';
  for (let i = 0; i < words.length; i++) {
    if (words[i] === '-') {
      words[i + 1] = words[i + 1].toUpperCase();
    } else {
      result += words[i];
    }
  }
  return result;
}

export function getSassImporter(options: Options) {
  return (url, filepath) => {
    let file = toRelative(filepath, url, options.aliasConfig, styleExtensions);

    // rollup-plugin-vue cannot parse '~', replace to 'node_modules' here
    if (file.startsWith('~')) {
      file = file.replace(/^~/, 'node_modules/');
    }

    return {
      file,
    };
  };
}

export function getSassDefaultOptions(options: Options) {
  return {
    importer: getSassImporter(options),
    // ignore warnings for symbol "/"
    quietDeps: true,
  };
}

export function getPostcssPlugins(options: Options) {
  return [
    autoprefixer(),
    postcssUrl({
      url: 'copy',
      relative: true,
      basePath: options.inputDir,
      assetsPath: options.outputDir,
    }),
  ];
}

export function readPkgVersion(name: string) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require(`${name}/package.json`).version;
  } catch (e) {
    return undefined;
  }
}
