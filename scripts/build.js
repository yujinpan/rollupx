const typescript = require('@rollup/plugin-typescript');
const fs = require('fs');
const { resolve, sep } = require('path');
const rollup = require('rollup');

async function build() {
  const buildModule = resolve(__dirname, '_build.js');

  await rollup
    .rollup({
      input: resolve(__dirname, '../src/build.ts'),
      plugins: [
        typescript({
          tsconfig: resolve(__dirname, '../tsconfig.app.json'),
        }),
      ],
      external: (id, importer, isResolved) => {
        if (isResolved) {
          if (id.includes('node_modules') || !id.startsWith(sep)) {
            return true;
          }
        }
      },
    })
    .then((res) =>
      res.write({
        file: buildModule,
        format: 'cjs',
      }),
    );

  // 生成临时 cjs 文件再使用 rollupx 打包
  await require(buildModule).build(
    require(resolve(__dirname, '../rollupx.config.js')),
  );

  fs.rmSync(buildModule);
}

build();
