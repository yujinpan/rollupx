import { babel } from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import { nodeResolve as resolve } from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import url from '@rollup/plugin-url';
import { createFilter, FilterPattern } from '@rollup/pluginutils';
import fs from 'fs';
import makeDir from 'make-dir';
import path from 'path';
import postcss from 'rollup-plugin-postcss';
import { terser } from 'rollup-plugin-terser';
import { visualizer } from 'rollup-plugin-visualizer';

import type { Options } from './config';
import type { RollupBabelInputPluginOptions } from '@rollup/plugin-babel';
import type { OutputOptions, RollupOptions } from 'rollup';

import {
  getPostcssPlugins,
  getSassDefaultOptions,
  isNodeModules,
  readPkgVersion,
  styleExtensions,
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
  const fileTemplate = options.outputFile || '[name][ext]';

  const dir = path.basename(path.dirname(relativePath));
  const filename = path.basename(relativePath, path.extname(relativePath));
  const outputFilename = fileTemplate
    .replace('[dir]', dir)
    .replace('[name]', filename)
    .replace('[ext]', '.js');

  const outputFile = path.join(
    outputDir,
    outputFilename.startsWith('/')
      ? outputFilename
      : path.join(path.dirname(relativePath), outputFilename),
  );

  const output: OutputOptions = {
    file: outputFile,
    format,
    banner: banner,
  };

  if (format === 'iife' || format === 'umd') {
    Object.assign(output, {
      name: outputName || 'Bundle',
      globals: outputGlobals,
      paths: outputPaths,
      plugins: [terser()],
      inlineDynamicImports: true,
    });
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
export function relativePlugin(
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

  const assetsReg = /\.(png|svg|jpe?g|gif|webp)$/;
  const vuePluginReg = /\?(vue|rollup-plugin-vue)/;

  const isModule = ['es', 'cjs'].includes(format);
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
          useBuiltIns: isNotES ? 'entry' : 'usage',
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
      singleFile || !isModule ? false : undefined,
    ),
    resolve({
      extensions,
      browser: true,
      preferBuiltins: true,
    }),
    // 替换 env 文件的环境变量
    replace({
      values: options.replace,
      preventAssignment: true,
    }),
    commonjs({
      include: /node_modules/,
    }),
    vuePlugin(options),
    postcss({
      minimize: true,
      // custom inject，require [style-inject] package
      // fix the postcss import path is absolute
      inject(cssVariableName) {
        return (
          `import styleInject from 'style-inject';\n` +
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
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const { css } = require('sass').renderSync({
              file: this.id,
              ...getSassDefaultOptions(options),
            });
            return { code: css, map };
          },
        },
      ],
    }),
    babel(babelOptions),
    json(),
  ];

  if (options.node) {
    process.env.VUE_CLI_BABEL_TARGET_NODE = 'true';
  }

  if (stat && singleFile) {
    plugins.push(
      visualizer({
        filename: './stat/statistics.html',
      }),
    );
  }

  if (isModule) {
    plugins.push(
      copyPlugin({
        include: assetsReg,
      }),
    );
  }
  // umd/iife 不复制图片等静态资源
  else {
    plugins.push(
      url({
        include: assetsReg,
        limit: Infinity,
      }),
    );
  }

  return {
    plugins,
    external:
      !isModule || external
        ? external
        : (id, parentId) => {
            // 内部 - 入口文件
            if (parentId === undefined) return false;

            // 内部 - 编译的临时文件需要编译
            if (vuePluginReg.test(id)) return false;

            // 外部 - 第三方模块跳过
            if (isNodeModules(parentId, id, extensions, aliasConfig))
              return true;

            // 内部 - css/json 需要编译
            if (/\.(scss|sass|less|css|json)$/.test(id)) return false;

            // 内部 - 图片资源直使用 copyPlugin
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

function copyPlugin(options: { include: FilterPattern }) {
  const filter = createFilter(options.include);
  const copyFiles: Record<string, string> = {};

  return {
    name: 'copy',
    resolveId: {
      order: 'pre' as const,
      handler(source, importer) {
        const id = importer
          ? path.join(path.dirname(importer), source)
          : source;

        if (!filter(id)) return null;

        copyFiles[id] = source;

        return {
          id: source,
          external: true,
        };
      },
    },
    async generateBundle(outputOptions) {
      const base = outputOptions.dir || path.dirname(outputOptions.file);

      await Promise.all(
        Object.keys(copyFiles).map(async (file) => {
          const destFile = path.join(base, copyFiles[file]);

          await makeDir(path.dirname(destFile));

          return copy(file, destFile);
        }),
      );
    },
  };
}

function copy(src, dest) {
  return new Promise((resolve, reject) => {
    const read = fs.createReadStream(src);
    read.on('error', reject);
    const write = fs.createWriteStream(dest);
    write.on('error', reject);
    write.on('finish', resolve);
    read.pipe(write);
  });
}

function vuePlugin(options: Options) {
  const vuePluginVueVersion = readPkgVersion('rollup-plugin-vue');

  return (
    vuePluginVueVersion &&
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require('rollup-plugin-vue')(
      vuePluginVueVersion.startsWith('6')
        ? {
            // use "sass" preprocess
            preprocessStyles: true,
            preprocessOptions: getSassDefaultOptions(options),
            compilerOptions: {
              whitespace: 'condense',
            },
          }
        : ({
            css: false, // Dynamically inject css as a <style> tag
            template: {
              compilerOptions: {
                whitespace: 'condense', // 丢弃模版空格
              },
            },
            // https://github.com/vuejs/rollup-plugin-vue/issues/262
            normalizer: '~vue-runtime-helpers/dist/normalize-component.js',
            // https://github.com/vuejs/rollup-plugin-vue/issues/300#issuecomment-663098421
            style: {
              preprocessOptions: {
                scss: getSassDefaultOptions(options),
              },
            },
          } as any),
    )
  );
}
