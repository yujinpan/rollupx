import rollup, { OutputOptions } from 'rollup';

import type { Options } from './config';

import { generateRollupConfig } from './rollup';
import { getFiles, getSuffixPattern, suffixTo } from './utils';

export async function build(options: Options) {
  const optionsArr = options.formats
    ? options.formats.map((item) => ({ ...options, ...item }))
    : [options];

  optionsArr.slice(1).forEach((item) => {
    if (!item.outputFile) {
      item.outputFile = `[name].${item.format}[ext]`;
    }
  });

  return Promise.all(optionsArr.map(buildInternal));
}

export function getJsFiles({
  extensions,
  inputDir,
  inputFiles,
  excludeFiles,
}: Options) {
  return getFiles(inputFiles, inputDir, getSuffixPattern(extensions), [
    ...excludeFiles,
    '**/*.d.ts',
  ]);
}

function buildInternal(options: Options) {
  const files = getJsFiles(options);

  validate(files);

  return Promise.all(
    files
      .map((item) => generateRollupConfig(item, options))
      .map((option) => {
        const outputs: OutputOptions[] = Array.isArray(option.output)
          ? option.output
          : [option.output];
        return rollup.rollup(option).then((bundle) => {
          return Promise.all(outputs.map(bundle.write)).finally(() =>
            bundle.close(),
          );
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
