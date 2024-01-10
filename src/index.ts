import fs from 'fs';

import { build, watch } from './build';

const configPath = process.cwd() + '/rollupx.config.js';
if (fs.existsSync(configPath)) {
  import(configPath).then((res) => {
    res = { ...res };
    res.watch || process.argv.includes('--watch') ? watch(res) : build(res);
  });
} else {
  build();
}
