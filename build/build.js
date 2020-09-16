const rollup = require('rollup');
const fs = require('fs');

const config = require('./config');
const utils = require('./utils');
const defaultRollupConfig = require('./rollup.config.js');

// 清空目录
fs.rmdirSync(config.typesDir, { recursive: true });
fs.mkdirSync(config.typesDir);
fs.rmdirSync(config.outputDir, { recursive: true });
fs.mkdirSync(config.outputDir);

// run build
build(config.inputFiles.map(utils.createRollupFileOption)).then(() => {
  // eslint-disable-next-line no-console
  console.log('build completed!');
  // eslint-disable-next-line no-console
}, console.error);

// build: rollup -> terser
function build(options) {
  return Promise.all(
    options.map((option) => {
      // eslint-disable-next-line prefer-const
      let { input, output } = option;
      if (!Array.isArray(output)) {
        output = [output];
      }
      return rollup.rollup({ ...defaultRollupConfig, input }).then((bundle) => {
        return Promise.all(output.map(bundle.write));
      });
    })
  );
}
