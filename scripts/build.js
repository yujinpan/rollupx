const typescript = require('@rollup/plugin-typescript');
const { globSync } = require('eslint-import-resolver-typescript');
const fs = require('fs');
const { resolve } = require('path');
const rollup = require('rollup');

async function build() {
  const dist = resolve(__dirname, '../lib');
  fs.rmSync(dist, { recursive: true, force: true });
  fs.mkdirSync(dist, { recursive: true });

  rollup
    .rollup({
      input: globSync(resolve(__dirname, '../src/*.ts')),
      plugins: [
        typescript({
          tsconfig: resolve(__dirname, '../tsconfig.app.json'),
        }),
      ],
      external: () => true,
    })
    .then((res) => {
      return Promise.all[
        (res.write({
          format: 'cjs',
          dir: resolve(dist, 'cjs'),
          exports: 'auto',
          footer: 'module.exports = Object.assign(exports.default, exports);',
        }),
        res.write({
          format: 'es',
          dir: resolve(dist, 'es'),
        }))
      ];
    });
}

build();
