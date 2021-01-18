const fs = require('fs');

const configPath = process.cwd() + '/vue-component-pack.config.js';
let config = {};
if (fs.existsSync(configPath)) {
  config = require(configPath);
}

require('./build')(config);
