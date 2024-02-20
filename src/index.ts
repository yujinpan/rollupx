import fs from 'fs';
import path from 'path';

import { build, watch } from './build';
import { Options } from './config';
import { printErr } from './utils';

readConfig().then((config) => {
  if (config?.watch || process.argv.includes('--watch')) {
    watch(config);
  } else {
    build(config);
  }
});

async function readConfig(): Promise<Options> {
  let configPath = path.resolve(process.cwd(), 'rollupx.config.js');
  if (isESM()) {
    configPath = path.resolve(process.cwd(), 'rollupx.config.cjs');
    if (!fs.existsSync(configPath)) {
      printErr('ESM module must be use rollupx.config.cjs');
      return Promise.reject();
    }
  }
  if (fs.existsSync(configPath)) {
    return import(configPath).then((res) => ({ ...res }));
  }
}

function isESM() {
  const pkPath = path.resolve(process.cwd(), 'package.json');

  const pk = JSON.parse(fs.readFileSync(pkPath).toString());

  return pk.type === 'module';
}
