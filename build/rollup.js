const vue = require('rollup-plugin-vue'); // Handle .vue SFC files
const { babel } = require('@rollup/plugin-babel');
const { nodeResolve: resolve } = require('@rollup/plugin-node-resolve');
const postcss = require('rollup-plugin-postcss');
const json = require('@rollup/plugin-json');
const commonjs = require('@rollup/plugin-commonjs');
const visualizer = require('rollup-plugin-visualizer');
const replace = require('@rollup/plugin-replace');
const url = require('@rollup/plugin-url');
const nodePath = require('path');
const fs = require('fs');
const path = require('path');
const { suffixTo, transformToRelativePath } = require('./utils');

/**
 * 生成 rollup 配置
 */
function generateRollupConfig(
  filePath,
  inputDir,
  outputDir,
  banner,
  aliasConfig,
  extensions,
  singleFile
) {
  const rollupConfig = getRollupBaseConfig(aliasConfig, extensions, singleFile);
  const relativePath = path.relative(inputDir, filePath);
  const outputFile = path.join(
    outputDir,
    path.dirname(relativePath) +
      '/' +
      suffixTo(path.basename(relativePath), '.js')
  );
  return {
    ...rollupConfig,
    input: filePath,
    output: [
      {
        file: outputFile,
        format: 'es',
        banner: banner
      }
    ]
  };
}

/**
 * 将文件中的缩写路径转换为相对路径
 */
function relativePlugin(aliasConfig, extensions, newSuffix) {
  return {
    name: 'rollup-plugin-relative',
    transform(code, id) {
      return transformToRelativePath(
        code,
        id,
        aliasConfig,
        extensions,
        newSuffix
      );
    }
  };
}

function getRollupBaseConfig(aliasConfig, extensions, singleFile) {
  const utils = require('./utils');
  const aliasKeys = Object.keys(aliasConfig);
  const nodeAliasKeys = aliasKeys.filter((item) =>
    aliasConfig[item].includes('node_modules')
  );
  const assetsReg = /\.(png|svg|jpg|gif|scss|sass|less|css)$/;
  const vuePluginReg = /rollup-plugin-vue/;
  return {
    plugins: [
      // 全部 js/css 文件转换为相对路径
      relativePlugin(
        aliasConfig,
        extensions.concat(utils.styleExtensions),
        singleFile ? false : undefined
      ),
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
        normalizer: '~vue-runtime-helpers/dist/normalize-component.js',
        // https://github.com/vuejs/rollup-plugin-vue/issues/300#issuecomment-663098421
        style: {
          preprocessOptions: {
            scss: {
              importer: [
                (url, filepath) => {
                  return {
                    file: utils.toRelative(
                      filepath,
                      url,
                      aliasConfig,
                      utils.styleExtensions
                    )
                  };
                }
              ]
            }
          }
        }
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
    // 1. 'jquery' 可能存在 node_modules 中，也可以在当前目录中
    // 2. 排除 / 开头
    // 3. 排除 . 开头
    // 4. 排除缩写路径开头
    (!path.startsWith('/') &&
      !path.startsWith('.') &&
      !aliasKeys.some((item) => isStartsWidthAlias(path, item)) &&
      !fs.existsSync(nodePath.dirname(parentPath) + '/' + path))
  );
}

function isStartsWidthAlias(path, alias) {
  return path === alias || path.startsWith(alias + '/');
}

module.exports = {
  generateRollupConfig
};
