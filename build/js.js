const rollup = require('rollup');
const utils = require('./utils');

function build(
  inputFiles,
  inputDir,
  outputDir,
  banner,
  aliasConfig,
  extensions
) {
  return Promise.all(
    inputFiles
      .map((item) => {
        return utils.createRollupOption(
          item,
          inputDir,
          outputDir,
          banner,
          aliasConfig,
          extensions
        );
      })
      .flat()
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

module.exports = build;
