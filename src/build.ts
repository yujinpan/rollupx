import chokidar from 'chokidar';
import fs from 'fs';
import debounce from 'lodash/debounce';
import path from 'path';

import type { Options } from './config';

import config from './config';
import { build as buildJS, getJsFiles } from './js';
import { build as buildStyles, cssSuffixReg, getCssFiles } from './styles';
import { build as buildTypes } from './types';
import {
  getSuffixPattern,
  mergeProps,
  printErr,
  printMsg,
  readPkgVersion,
  runTask,
  toLowerCamelCase,
} from './utils';

export async function build(options: Options = {}, _clear = true) {
  await normalizeOptions(options);

  if (_clear) {
    // clear
    fs.rmSync(options.outputDir, { recursive: true, force: true });
    fs.mkdirSync(options.outputDir);
  }

  // build js
  if (options.outputs.includes('js') && options.inputFiles.length) {
    await runTask('build js', buildJS(options));
  }

  // build styles
  if (
    options.outputs.includes('styles') &&
    fs.existsSync(path.resolve(options.inputDir, options.stylesDir)) &&
    (options.stylesCopyFiles.length || options.stylesParseFiles.length)
  ) {
    await runTask('build styles', buildStyles(options));
  }

  // build types
  if (options.outputs.includes('types') && options.inputFiles.length) {
    await runTask('build types', buildTypes(options));
  }
}

export async function watch(options: Options = {}) {
  await normalizeOptions(options);

  let inputFilesJs = getJsFiles(options);
  let { parseFiles, copyFiles } = getCssFiles(options);

  const inputFiles: string[] = [];
  const stylesParseFiles: string[] = [];
  const stylesCopyFiles: string[] = [];

  let buildPromise = Promise.resolve();
  const buildDebounce = debounce(async () => {
    await buildPromise;

    printMsg(`[${new Date().toLocaleTimeString()} Update files]:`, {
      inputFiles,
      stylesParseFiles,
      stylesCopyFiles,
    });

    buildPromise = build(
      {
        ...options,
        inputFiles: [...inputFiles],
        stylesParseFiles: [...stylesParseFiles],
        stylesCopyFiles: [...stylesCopyFiles],
      },
      false,
    );

    inputFiles.length = 0;
    stylesParseFiles.length = 0;
    stylesCopyFiles.length = 0;
  }, 200);

  const jsSuffixPattern = getSuffixPattern(options.extensions);
  const handleAdd = (path: string) => {
    if (jsSuffixPattern.test(path)) {
      inputFilesJs = getJsFiles(options);
      handleChange(path);
    } else if (cssSuffixReg.test(path)) {
      const result = getCssFiles(options);
      parseFiles = result.parseFiles;
      copyFiles = result.copyFiles;
      handleChange(path);
    }
  };
  const handleChange = (path: string) => {
    if (inputFilesJs.includes(path)) {
      inputFiles.push(path);
      buildDebounce();
    } else if (parseFiles.includes(path)) {
      stylesParseFiles.push(path);
      buildDebounce();
    } else if (copyFiles.includes(path)) {
      stylesCopyFiles.push(path);
      buildDebounce();
    }
  };

  const watcher = chokidar.watch(options.inputDir, {
    ignored: '**/*.d.ts',
  });
  watcher.on('add', handleAdd);
  watcher.on('change', handleChange);
}

async function normalizeOptions(options: Options = {}) {
  if (!validateVueVersion()) return Promise.reject();

  if (Array.isArray(options.extensions)) {
    options.extensions = config.extensions.concat(options.extensions);
  }

  Object.assign(options, mergeProps(config, options));

  // parse arguments
  const args = process.argv.slice(2);
  if (args.length) {
    args.forEach((arg) => {
      if (arg.startsWith('--')) {
        const entries = arg.slice(2).split('=');
        const key = toLowerCamelCase(entries[0]);
        const val = entries[1];
        if (key in options) {
          options[key] = Array.isArray(options[key]) ? val.split(',') : val;
        }
      }
    });
  }

  // validate
  if (!options.inputDir || !options.outputDir)
    return printErr('rollupx.config.js', '"inputDir/outputDir" required');

  // resolve path
  options.inputDir = path.resolve(options.inputDir);
  options.outputDir = path.resolve(options.outputDir);

  // init alias
  const aliasConfig = options.aliasConfig;
  for (const key in aliasConfig) {
    if (key === '~') continue;

    // 移除 key 后面的 /
    let newKey = key;
    if (newKey !== '/' && newKey.endsWith('/')) {
      newKey = newKey.slice(0, -1);
    }

    // ~ 为 scss @import 语法前缀
    aliasConfig[newKey] = aliasConfig['~' + newKey] = path.resolve(
      aliasConfig[key],
    );

    if (newKey !== key) {
      delete aliasConfig[key];
    }
  }

  return options;
}

function validateVueVersion() {
  const vueVersion = readPkgVersion('vue');
  const vuePluginVersion = readPkgVersion('rollup-plugin-vue');

  if (vueVersion && vuePluginVersion) {
    if (vueVersion.startsWith('2') && !vuePluginVersion.startsWith('5')) {
      printErr(
        `Vue2 need rollup-plugin-vue@5, try "npm i -D rollup-plugin-vue@5".`,
      );
      return false;
    } else if (
      vueVersion.startsWith('3') &&
      !vuePluginVersion.startsWith('6')
    ) {
      printErr(
        `Vue3 need rollup-plugin-vue@6, try "npm i -D rollup-plugin-vue@6".`,
      );
      return false;
    }
  }

  return true;
}
