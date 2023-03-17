import rollup from 'rollup';

import type { Options } from './config';

import { generateRollupConfig } from './rollup';
import { getFiles, suffixTo } from './utils';

export async function build(options: Options) {
  const optionsArr = options.formats
    ? options.formats.map((item) => ({ ...options, ...item }))
    : [options];

  if (optionsArr.length > 1) {
    optionsArr.slice(1).forEach((item) => {
      if (!item.outputFile) {
        item.outputFile = `[name].${item.format}[ext]`;
      }
    });
  }

  return Promise.all(optionsArr.map(buildInternal));
}

function buildInternal(options: Options) {
  const { inputFiles, excludeFiles, inputDir, extensions } = options;
  const jsSuffixReg = new RegExp(
    `(${extensions.map((item) => '\\' + item).join('|')})$`,
  );
  const files = getFiles(inputFiles, inputDir, jsSuffixReg, [
    ...excludeFiles,
    '**/*.d.ts',
  ]);
  validate(files);

  return Promise.all(
    files
      .map((item) => generateRollupConfig(item, options))
      .map((option) => {
        let { output } = option;
        if (!Array.isArray(output)) {
          output = [output];
        }
        return rollup.rollup(option).then((bundle) => {
          return Promise.all(output.map(bundle.write));
        });
      }),
  );
}

/**
 * 校验文件
 */
function validate(files: string[]) {
  const filesBaseName = files.map((item) => suffixTo(item, ''));
  filesBaseName.forEach((item1, index1) => {
    filesBaseName.forEach((item2, index2) => {
      if (index1 !== index2 && item1 === item2) {
        throw new Error(
          `[rollupx] '${item1}' are multiple in the same name, when the suffix is different, the file name must also be different.`,
        );
      }
    });
  });
}
