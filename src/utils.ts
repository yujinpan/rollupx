import autoprefixer from 'autoprefixer';
import { Progress } from 'cmd-ops';
import fs from 'fs';
import glob from 'glob';
import path from 'path';
import postcssUrl from 'postcss-url';
import resolve from 'resolve';
import { pathToFileURL } from 'url';

import type { Options } from './config';

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
      const relative = toRelative(filepath, oldPath, aliasConfig, extensions);

      let newPath = normalizeFilePath(
        relative,
        extensions,
        path.dirname(filepath),
      );

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

    return normalizeRelativePath(resolvePath);
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

// ./utils => ./utils.js
// ./utils => ./utils/index.js
export function normalizeFilePath(
  relativePath: string,
  extensions?: string[],
  base = '/',
): string {
  if (!relativePath.startsWith('.')) return relativePath;

  try {
    return normalizeRelativePath(
      path.relative(
        base,
        resolve.sync(path.resolve(base, relativePath), { extensions }),
      ),
    );
  } catch (e) {
    return relativePath;
  }
}

export function normalizeRelativePath(filePath: string) {
  return filePath.startsWith('.') ? filePath : './' + filePath;
}

export function suffixTo(file: string, suffix = '') {
  return file.replace(/\.[^.]+$/, suffix);
}

export function readFileTempExt(fileTemp: string) {
  const filename = parseFileTemp(fileTemp, '', 'name');
  return filename.slice(filename.indexOf('.'));
}

export function parseFileTemp(
  fileTemp: string,
  dir: string,
  name: string,
  ext = '.js',
) {
  return fileTemp
    .replace('[dir]', dir)
    .replace('[name]', name)
    .replace('[ext]', ext);
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

export function getSuffixPattern(extensions: string[]) {
  return new RegExp(`(${extensions.map((item) => '\\' + item).join('|')})$`);
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

export interface Task {
  (progressObservable: Observable<ProgressEvent>): any;
}

export class TaskRunner {
  private progressObservable: Observable<ProgressEvent>;

  constructor(private readonly name: string, private readonly task: Task) {}

  async start() {
    const progress = new Progress({
      title: this.name,
      titleWidth: 12,
      countWidth: 6,
      total: 0,
      bar: true,
    });

    this.progressObservable = new Observable<ProgressEvent>();

    this.progressObservable.on('progress:add-total', (e) => {
      progress.update(progress.current, progress.total + e.addTotal);
    });
    this.progressObservable.on('progress:next', (e) => {
      progress.update(progress.current + (e.addDone || 1));
    });

    await this.task(this.progressObservable)
      .then(() => progress.end())
      .catch((e) => {
        progress.end();
        printErr(`${this.name} task error!`);
        return Promise.reject(e);
      });
  }

  static start(
    name: string,
    task: (progressObservable: Observable<ProgressEvent>) => any,
  ) {
    return new TaskRunner(name, task).start();
  }
}

export interface ProgressEvent extends ObservableEvent {
  type: 'progress:next' | 'progress:add-total';
  addTotal?: number;
  addDone?: number;
}

export type ObservableEvent = {
  type: string;
  [key: string]: any;
};

export type ObservableListener<T extends ObservableEvent> = (e: T) => void;

export class Observable<T extends ObservableEvent> {
  private listeners: Record<string, ObservableListener<T>[]> = {};

  on(type: T['type'], listener: ObservableListener<T>) {
    const listeners = (this.listeners[type] = this.listeners[type] || []);
    listeners.push(listener);
  }
  un(type: T['type'], listener: ObservableListener<T>) {
    const index = this.listeners[type]?.indexOf(listener);
    if (index > -1) {
      this.listeners[type].splice(index, 1);
    }
  }
  dispatch(e: T) {
    this.listeners[e.type]?.forEach((item) => item(e));
  }
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
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const result = require('sass').compile(filepath, {
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
