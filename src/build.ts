import fs from 'fs';
import path from 'path';

import type { Options } from './config';

import config from './config';
import { build as buildDocs } from './docs';
import { build as buildJS } from './js';
import { build as buildStyles } from './styles';
import { build as buildTypes } from './types';
import { mergeProps, printErr, runTask, toLowerCamelCase } from './utils';

export async function build(options: Options = {}) {
  if (Array.isArray(options.extensions)) {
    options.extensions = config.extensions.concat(options.extensions);
  }

  options = mergeProps(config, options);

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

  // clear
  fs.rmSync(options.outputDir, { recursive: true, force: true });
  fs.mkdirSync(options.outputDir);

  // init alias
  const aliasConfig = options.aliasConfig;
  for (const key in aliasConfig) {
    // ~ 为 scss @import 语法前缀
    aliasConfig[key] = aliasConfig['~' + key] = path.resolve(aliasConfig[key]);
  }

  // build js
  if (options.outputs.includes('js')) {
    await runTask('build js', buildJS(options));
  }

  // build styles
  if (
    options.outputs.includes('styles') &&
    fs.existsSync(path.resolve(options.inputDir, options.stylesDir))
  ) {
    await runTask('build styles', buildStyles(options));
  }

  // build types
  if (options.outputs.includes('types')) {
    await runTask('build types', buildTypes(options));
  }

  // build docs
  if (options.outputs.includes('docs') && options.docsOutputDir) {
    await runTask('build docs', buildDocs(options));
  }
}
