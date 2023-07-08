import autoprefixer from 'autoprefixer';
import fs from 'fs';
import glob from 'glob';
import path from 'path';
import postcssUrl from 'postcss-url';
import resolve from 'resolve';
import sass from 'sass';
import { pathToFileURL } from 'url';

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
    const suffix = resolvePath.slice(aliasKey.length);

    resolvePath = path
      .relative(
        path.dirname(filepath),
        resolve.sync(path.join(aliasConfig[aliasKey], suffix), { extensions }),
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

export function pickVueScript(code: string): string {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const compiler = require('@vue/compiler-sfc');
  const isVue2 = readPkgVersion('@vue/compiler-sfc')[0] === '2';

  let content = '';
  if (isVue2) {
    const { script } = compiler.parseComponent(code);
    content = script?.content;
  } else {
    const parsed = compiler.parse(code);
    const { script } = parsed.descriptor;
    content = script?.content;
  }

  return content || 'export default {};';
}

export function rollupPluginVueScript() {
  return {
    name: 'vue-script',
    transform(code, id) {
      if (!/\.vue$/.test(id)) return code;

      return pickVueScript(code);
    },
  };
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

export function printMsg(msg: string, ...infos) {
  // eslint-disable-next-line no-console
  console.log(`\x1b[32m[rollupx] ${msg}\x1b[0m`, ...infos);
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
    return {
      file: getSassRelativePath(options, url, filepath),
    };
  };
}

export function getSassRelativePath(options: Options, url, filepath) {
  let file = toRelative(filepath, url, options.aliasConfig, styleExtensions);

  // rollup-plugin-vue cannot parse '~', replace to 'node_modules' here
  if (file.startsWith('~')) {
    file = file.replace(/^~/, 'node_modules/');
  }

  const isNodeModules = file.startsWith('node_modules');

  const fileDir = path.dirname(filepath);
  const absolutePath = isNodeModules ? file : path.resolve(fileDir, file);
  const existFile = glob
    .sync(absolutePath)
    .concat(
      glob.sync(`${absolutePath}.{sass,scss,css}`),
      glob.sync(`${absolutePath}/index.{sass,scss,css}`),
    )[0];

  if (existFile) {
    file = existFile;
  }

  return file;
}

export function getSassDefaultOptions(options: Options) {
  return {
    importer: getSassImporter(options),
    // ignore warnings for symbol "/"
    quietDeps: true,
  };
}

export function getPostcssPlugins(options: Options & { inline?: boolean }) {
  return [
    autoprefixer(),
    postcssUrl({
      url: options.inline ? 'inline' : 'copy',
      maxSize: Infinity,
    }),
  ];
}

export function parseSass(options: Options, filepath) {
  const result = sass.compile(filepath, {
    importers: [
      {
        findFileUrl(url: string) {
          return pathToFileURL(getSassRelativePath(options, url, filepath));
        },
      },
    ],
  });

  // rebase code use source replaces
  const replaces = [];
  result.loadedUrls.forEach((item) => {
    getCssRebaseUrlReplaces(
      fs.readFileSync(item).toString(),
      item.pathname,
      filepath,
    ).forEach(({ from, to }) => {
      if (!replaces.find((item) => item.from === from)) {
        replaces.push({ from, to });
      }
    });
  });
  replaces.forEach(({ from, to }) => {
    result.css = result.css.replaceAll(from, to);
  });

  return result.css;
}

export function getCssUrls(code: string) {
  return deDup(
    removeComment(code)
      .match(
        // url('...')
        new RegExp('url\\([^)]*\\)', 'g'),
      )
      ?.map((item) => item.replace(/.*\(['"]?([^'"]+)['"]?\).*/, '$1')) || [],
  );
}

export function getCssRebaseUrlReplaces(
  code: string,
  from: string,
  to: string,
) {
  const replaces = [];
  const urls = getCssUrls(code);
  urls.forEach((url) => {
    const sourcePath = path.resolve(path.dirname(from), url);
    if (glob.sync(sourcePath, { root: from })) {
      const toPath = path.relative(path.dirname(to), sourcePath);

      replaces.push({
        from: url,
        to: toPath,
      });
    }
  });
  return replaces;
}

export function readPkgVersion(name: string) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require(`${name}/package.json`).version;
  } catch (e) {
    return undefined;
  }
}
