const rollup = require('rollup');
const utils = require('./utils');
const { generateRollupConfig } = require('./rollup');

/**
 * @param {import('./config')} options
 */
async function build(options) {
  const { inputFiles, inputDir, extensions } = options;
  const jsSuffixReg = new RegExp(
    `(${extensions.map((item) => '\\' + item).join('|')})$`
  );
  const files = utils
    .getFiles(inputFiles, inputDir, jsSuffixReg)
    .filter((item) => !item.endsWith('.d.ts'));
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
      })
  );
}

/**
 * 校验文件
 */
function validate(files) {
  const filesBaseName = files.map((item) => utils.suffixTo(item, ''));
  filesBaseName.forEach((item1, index1) => {
    filesBaseName.forEach((item2, index2) => {
      if (index1 !== index2 && item1 === item2) {
        throw new Error(
          `[rollupx] '${item1}' are multiple in the same name, when the suffix is different, the file name must also be different.`
        );
      }
    });
  });
}

module.exports = build;
