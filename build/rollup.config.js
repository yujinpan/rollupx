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

function getRollupBaseConfig(aliasConfig, extensions, singleFile) {
  const isNodeModules = /node_modules/;
  const prefix = Object.keys(aliasConfig)
    .filter((item) => !isNodeModules.test(aliasConfig[item]))
    .concat(['\\.']);
  const isRelative = new RegExp('^(' + prefix.join('|') + ')(/|$)');
  const isFile = /\.(png|svg|jpg|gif|scss|sass|less|css)$/;
  const isVueFile = /rollup-plugin-vue/;
  return {
    plugins: [
      alias({
        entries: aliasConfig
      }),
      resolve({
        extensions: extensions
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
    external: (id) => {
      // 编译的临时文件需要编译
      if (isVueFile.test(id)) return false;

      if (isNodeModules.test(id)) {
        // 其他类型文件需要编译
        return !isFile.test(id);
      }

      // 使用相对路径与单文件模式时需要编译
      if (isRelative.test(id)) {
        return !singleFile;
      }

      // 绝对路径的非 node_modules 里面的文件需要编译
      return !(id.startsWith('/') && !isNodeModules.test(id));
    }
  };
}

module.exports = {
  getRollupBaseConfig: getRollupBaseConfig
};
