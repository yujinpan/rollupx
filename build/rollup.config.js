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
const aliasConfig = require('../alias.config');

require('dotenv').config();

const extensions = ['.js', '.jsx', '.ts', '.tsx', '.vue'];

module.exports = {
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
      minimize: true
    }),
    babel({
      extensions,
      exclude: 'node_modules/**',
      babelHelpers: 'runtime'
    }),
    url(),
    json(),
    visualizer({
      filename: './stat/statistics.html'
    })
  ],
  // 所有文件都打包了，所以所有的引入都作为外部
  external: (id) =>
    ![
      'rollup-plugin-vue' // 编译的临时文件需要保留
    ].some((item) => id.includes(item))
};
