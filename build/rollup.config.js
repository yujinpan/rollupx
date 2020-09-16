const vue = require('rollup-plugin-vue'); // Handle .vue SFC files
const { babel } = require('@rollup/plugin-babel');
const { nodeResolve: resolve } = require('@rollup/plugin-node-resolve');
const postcss = require('rollup-plugin-postcss');
const json = require('@rollup/plugin-json');
const commonjs = require('@rollup/plugin-commonjs');
const alias = require('@rollup/plugin-alias');
const visualizer = require('rollup-plugin-visualizer');
const sizes = require('rollup-plugin-sizes');
const replace = require('@rollup/plugin-replace');
const url = require('@rollup/plugin-url');

const pkg = require('../package.json');
const utils = require('./utils');

require('dotenv').config();

const externalReg = new RegExp(
  '^(' + Object.keys(pkg.dependencies).join('|') + ')(/|$)'
);
const extensions = ['.js', '.jsx', '.ts', '.tsx', '.vue'];

module.exports = {
  // input: 'src/index.js',
  // output: {
  //   dir: 'lib/',
  //   format: 'es'
  // },
  plugins: [
    alias({
      entries: utils.getAliasEntries()
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
    babel({
      extensions,
      include: ['src/**/*'],
      babelHelpers: 'runtime'
    }),
    url(),
    json(),
    postcss({
      minimize: true
    }),
    sizes(),
    visualizer({
      filename: './stat/statistics.html'
    })
  ],
  external: (id) => externalReg.test(id)
};
