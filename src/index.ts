import fs from 'fs';

import { build } from './build';

const configPath = process.cwd() + '/rollupx.config.js';
if (fs.existsSync(configPath)) {
  import(configPath).then((res) => {
    build(res);
  });
} else {
  build();
}
