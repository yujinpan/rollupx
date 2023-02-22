import { babel } from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import { nodeResolve as resolve } from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import url from '@rollup/plugin-url';
import path from 'path';
import postcss from 'rollup-plugin-postcss';
import { terser } from 'rollup-plugin-terser';
import { visualizer } from 'rollup-plugin-visualizer';
import vue from 'rollup-plugin-vue';
import sass from 'sass';

import type { Options } from './config';
import type { RollupBabelInputPluginOptions } from '@rollup/plugin-babel';
import type { TemplateOptions } from '@vue/component-compiler';
import type { RollupOptions } from 'rollup';

import {
  getPostcssPlugins,
  getSassDefaultOptions,
  isNodeModules,
  styleExtensions,
  suffixTo,
  transformToRelativePath,
} from './utils';

/**
 * 生成 rollup 配置
 */
export function generateRollupConfig(filePath: string, options: Options) {
  const {
    inputDir,
    outputDir,
    banner,
    format,
    outputName,
    outputGlobals,
    outputPaths,
  } = options;
  const rollupConfig = getRollupBaseConfig(options);
  const relativePath = path.relative(inputDir, filePath);
  const outputFile = path.join(
    outputDir,
    path.dirname(relativePath) +
      '/' +
      suffixTo(path.basename(relativePath), '.js'),
  );
  let output;
  if (format === 'es') {
    output = {
      file: outputFile,
      format,
      banner: banner,
    };
  } else {
    output = {
      file: outputFile,
      format,
      banner: banner,
      name: outputName,
      globals: outputGlobals,
      paths: outputPaths,
      plugins: [terser()],
    };
  }
  return {
    ...rollupConfig,
    input: filePath,
    output,
  };
}

/**
 * 将文件中的缩写路径转换为相对路径
 */
function relativePlugin(
  aliasConfig: Options['aliasConfig'],
  extensions: Options['extensions'],
  newSuffix: string | false,
) {
  return {
    name: 'rollup-plugin-relative',
    transform(code, id) {
      if (id.includes('node_modules')) return code;
      return transformToRelativePath(
        code,
        id,
        aliasConfig,
        extensions,
        newSuffix,
      );
    },
  };
}

function getRollupBaseConfig(options: Options): RollupOptions {
  const { aliasConfig, extensions, singleFile, stat, external, format } =
    options;

  const assetsReg = /\.(png|svg|jpg|gif|scss|sass|less|css)$/;
  const vuePluginReg = /rollup-plugin-vue/;

  const isNotES = format !== 'es';
  const babelOptions: RollupBabelInputPluginOptions = {
    extensions: extensions,
    babelHelpers: isNotES ? 'bundled' : 'runtime',
    presets: [
      [
        '@vue/app',
        {
          // fix: @babel/plugin-transform-runtime option's absoluteRuntime default is false
          absoluteRuntime: false,
          useBuiltIns: !isNotES,
        },
      ],
      '@babel/preset-typescript',
    ],
    plugins: [
      '@babel/plugin-proposal-export-default-from',
      '@babel/plugin-proposal-optional-chaining',
    ],
  };

  const plugins: RollupOptions['plugins'] = [
    // 全部 js/css 文件转换为相对路径
    relativePlugin(
      aliasConfig,
      extensions.concat(styleExtensions),
      singleFile || isNotES ? false : undefined,
    ),
    resolve({
      extensions,
      browser: true,
      preferBuiltins: true,
    }),
    // 替换 env 文件的环境变量
    replace({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      'process.env.VUE_APP_BASE_URL': JSON.stringify(
        process.env.VUE_APP_BASE_URL,
      ),
      preventAssignment: true,
    }),
    commonjs({
      include: /node_modules/,
    }),
    vue({
      css: false, // Dynamically inject css as a <style> tag
      template: {
        compilerOptions: {
          whitespace: 'condense', // 丢弃模版空格
        },
      } as TemplateOptions,
      // https://github.com/vuejs/rollup-plugin-vue/issues/262
      normalizer: '~vue-runtime-helpers/dist/normalize-component.js',
      // https://github.com/vuejs/rollup-plugin-vue/issues/300#issuecomment-663098421
      style: {
        preprocessOptions: {
          scss: getSassDefaultOptions(options),
        },
      },
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
      plugins: getPostcssPlugins(options),
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
              ...getSassDefaultOptions(options),
            });
            return { code: css, map };
          },
        },
      ],
    }),
    babel(babelOptions),
    url(),
    json(),
  ];

  if (stat && singleFile) {
    plugins.push(
      visualizer({
        filename: './stat/statistics.html',
      }),
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
          if (isNodeModules(parentId, id, extensions, aliasConfig)) return true;

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
    },
  };
}