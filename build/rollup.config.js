const vue = require('rollup-plugin-vue'); // Handle .vue SFC files
const { babel } = require('@rollup/plugin-babel');
const { nodeResolve: resolve } = require('@rollup/plugin-node-resolve');
const postcss = require('rollup-plugin-postcss');
const json = require('@rollup/plugin-json');
const commonjs = require('@rollup/plugin-commonjs');
const alias = require('@rollup/plugin-alias');
const visualizer = require('rollup-plugin-visualizer');
const replace = require('@rollup/plugin-replace');
const url = require('@rollup/plugin-url');
const nodePath = require('path');
const fs = require('fs');

function getRollupBaseConfig(aliasConfig, extensions, singleFile) {
  const aliasKeys = Object.keys(aliasConfig);
  const nodeAliasKeys = aliasKeys.filter((item) =>
    aliasConfig[item].includes('node_modules')
  );
  const assetsReg = /\.(png|svg|jpg|gif|scss|sass|less|css)$/;
  const vuePluginReg = /rollup-plugin-vue/;
  return {
    plugins: [
      alias({
        entries: aliasConfig
      }),
      resolve({
        extensions
      }),
      // 替换 env 文件的环境变量
      replace({
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
        'process.env.VUE_APP_BASE_URL': JSON.stringify(
          process.env.VUE_APP_BASE_URL
        )
      }),
      commonjs({
        include: /node_modules/
      }),
      vue({
        target: 'browser',
        css: false, // Dynamically inject css as a <style> tag
        compileTemplate: true, // Explicitly convert template to render function
        template: {
          compilerOptions: {
            preserveWhitespace: false // 丢弃模版空格
          }
        },
        // https://github.com/vuejs/rollup-plugin-vue/issues/262
        normalizer: '~vue-runtime-helpers/dist/normalize-component.js'
      }),
      postcss({
        minimize: true,
        // custom inject，require [style-inject] package
        // fix the postcss import path is absolute
        inject(cssVariableName) {
          return (
            `import styleInject from 'style-inject/dist/style-inject.es.js';\n` +
            `styleInject(${cssVariableName});`
          );
        }
      }),
      babel({
        extensions: extensions,
        babelHelpers: 'runtime',
        ...require('../babel.config')
      }),
      url(),
      json(),
      visualizer({
        filename: './stat/statistics.html'
      })
    ],
    external: (id, parentId, resolved) => {
      // 内部 - 编译的临时文件需要编译
      if (vuePluginReg.test(id)) return false;

      // 外部 - 第三方模块跳过
      if (isNodeModules(id, parentId, nodeAliasKeys, aliasKeys)) return true;

      // 内部 - 静态资源需要编译
      if (assetsReg.test(id)) return false;

      // 内部 - js 文件单文件模式需要编译
      if (singleFile) return false;

      // 内部 - 多文件模式则跳过
      return true;
    }
  };
}

function isNodeModules(path, parentPath, nodeAliasKeys, aliasKeys) {
  // 包含 node_modules 的直接为 true
  // 未包含的判断是否有相对模块
  return (
    path.includes('node_modules') ||
    path.startsWith('~') ||
    nodeAliasKeys.some((item) => isStartsWidthAlias(path, item)) ||
    (!path.startsWith('/') &&
      !aliasKeys.some((item) => isStartsWidthAlias(path, item)) &&
      !fs.existsSync(nodePath.dirname(parentPath) + '/' + path))
  );
}

function isStartsWidthAlias(path, alias) {
  return path === alias || path.startsWith(alias + '/');
}

module.exports = {
  getRollupBaseConfig
};
