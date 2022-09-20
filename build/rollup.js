const vue = require('rollup-plugin-vue'); // Handle .vue SFC files
const { babel } = require('@rollup/plugin-babel');
const { nodeResolve: resolve } = require('@rollup/plugin-node-resolve');
const postcss = require('rollup-plugin-postcss');
const json = require('@rollup/plugin-json');
const commonjs = require('@rollup/plugin-commonjs');
const { visualizer } = require('rollup-plugin-visualizer');
const replace = require('@rollup/plugin-replace');
const url = require('@rollup/plugin-url');
const { terser } = require('rollup-plugin-terser');
const path = require('path');
const utils = require('./utils');
const sass = require('sass');

/**
 * 生成 rollup 配置
 * @param {string} filePath
 * @param {import('./config')} options
 */
function generateRollupConfig(filePath, options) {
  const {
    inputDir,
    outputDir,
    banner,
    format,
    outputName,
    outputGlobals,
    outputPaths
  } = options;
  const rollupConfig = getRollupBaseConfig(options);
  const relativePath = path.relative(inputDir, filePath);
  const outputFile = path.join(
    outputDir,
    path.dirname(relativePath) +
      '/' +
      utils.suffixTo(path.basename(relativePath), '.js')
  );
  let output;
  if (format === 'es') {
    output = {
      file: outputFile,
      format,
      banner: banner
    };
  } else {
    output = {
      file: outputFile,
      format,
      banner: banner,
      name: outputName,
      globals: outputGlobals,
      paths: outputPaths,
      plugins: [terser()]
    };
  }
  return {
    ...rollupConfig,
    input: filePath,
    output
  };
}

/**
 * 将文件中的缩写路径转换为相对路径
 */
function relativePlugin(aliasConfig, extensions, newSuffix) {
  return {
    name: 'rollup-plugin-relative',
    transform(code, id) {
      if (id.includes('node_modules')) return code;
      return utils.transformToRelativePath(
        code,
        id,
        aliasConfig,
        extensions,
        newSuffix
      );
    }
  };
}

/**
 * @param {import('./config')} options
 */
function getRollupBaseConfig(options) {
  const {
    aliasConfig,
    extensions,
    singleFile,
    stat,
    external,
    format
  } = options;

  const assetsReg = /\.(png|svg|jpg|gif|scss|sass|less|css)$/;
  const vuePluginReg = /rollup-plugin-vue/;
  const babelOptions = {
    extensions: extensions,
    babelHelpers: 'runtime',
    ...require('../babel.config')
  };
  const isNotES = format !== 'es';

  if (isNotES) {
    babelOptions.babelHelpers = 'bundled';
    babelOptions.presets.find(
      (item) => (item[0] = '@vue/app')
    )[1].useBuiltIns = false;
  }

  const plugins = [
    // 全部 js/css 文件转换为相对路径
    relativePlugin(
      aliasConfig,
      extensions.concat(utils.styleExtensions),
      singleFile || isNotES ? false : undefined
    ),
    resolve({
      extensions,
      browser: true,
      preferBuiltins: true
    }),
    // 替换 env 文件的环境变量
    replace({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      'process.env.VUE_APP_BASE_URL': JSON.stringify(
        process.env.VUE_APP_BASE_URL
      ),
      preventAssignment: true
    }),
    commonjs({
      include: /node_modules/
    }),
    vue({
      css: false, // Dynamically inject css as a <style> tag
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
          scss: utils.getSassDefaultOptions(options)
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
      },
      plugins: utils.getPostcssPlugins(options),
      // plugins will need the path
      to: path.resolve(options.outputDir, './index.css'),
      loaders: [
        // custom sass loader
        {
          name: 'sass',
          test: /\.(sass|scss)$/,
          process({ map }) {
            const { css } = sass.renderSync({
              file: this.id,
              ...utils.getSassDefaultOptions(options)
            });
            return { code: css, map };
          }
        }
      ]
    }),
    babel(babelOptions),
    url(),
    json()
  ];

  if (stat && singleFile) {
    plugins.push(
      visualizer({
        filename: './stat/statistics.html'
      })
    );
  }

  return {
    plugins,
    external: isNotES
      ? external
      : (id, parentId) => {
          // 内部 - 入口文件
          if (parentId === undefined) return false;

          // 内部 - 编译的临时文件需要编译
          if (vuePluginReg.test(id)) return false;

          // 外部 - 第三方模块跳过
          if (utils.isNodeModules(parentId, id, extensions, aliasConfig))
            return true;

          // 内部 - 静态资源需要编译
          if (assetsReg.test(id)) return false;

          // 内部 - js 文件单文件模式需要编译
          if (singleFile) return false;

          // 内部 - 多文件模式则跳过
          return true;
        },
    onwarn(warning, warn) {
      if (
        warning.code === 'CIRCULAR_DEPENDENCY' ||
        warning.code === 'UNUSED_EXTERNAL_IMPORT' ||
        warning.code === 'EMPTY_BUNDLE' ||
        warning.code === 'THIS_IS_UNDEFINED'
      )
        return;

      warn(warning);
    }
  };
}

module.exports = {
  generateRollupConfig
};
