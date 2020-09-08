const path = require('path');
const tsPaths = require('./tsconfig.json').compilerOptions.paths;

// read tsconfig.json
const aliasConfig = {};
for (let key in tsPaths) {
  if (tsPaths[key].length > 1) {
    console.warn(
      'alias.config.js warn:',
      'tsconfig.json paths value must be only one.\n'
    );
  }
  // must use root path
  aliasConfig[transformPath(key)] =
    path.resolve('./') + '/' + transformPath(tsPaths[key][0]);
}

console.log('alias.config.js result：', aliasConfig, '\n');

module.exports = aliasConfig;

function transformPath(path) {
  return path.replace('/*', '');
}
