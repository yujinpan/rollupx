import { Obj } from '../test/src/types';

export type Options = {
  // 输出文件头信息
  banner?: string;

  // 输入文件目录，相对与 cwd，默认 src
  inputDir?: string;
  // 输出目录，相对于 cwd，默认 lib
  outputDir?: string;
  // 输入文件，支持 glob 规则，相对于 inputDir
  inputFiles?: string[];
  // 排除文件，支持 glob 规则，相对于 inputDir
  excludeFiles?: string[];

  // 指定输出类型
  outputs?: ('js' | 'styles' | 'types')[];

  // 是否打包为单文件，默认 false 每个文件独立输出
  singleFile?: boolean;

  // 多种格式同时打包
  formats?: Options[];

  // 输出格式
  format?: 'amd' | 'cjs' | 'es' | 'iife' | 'umd' | 'system';

  // 输出文件地址，/ 开头时将基于 outputDir，例如：'/[name][ext]'
  // [dir] 文件夹名 [name] 文件名 [ext] 扩展名
  outputFile?: string;
  // 模块导出名称
  outputName?: string;
  // 引入的全局属性，例如：{ jquery: '$' }
  outputGlobals?: Record<string, string>;
  // 引入的外链
  outputPaths?: string[];
  // 作为外部引入的库，例如：['jquery']
  external?: string[];

  // 扩展名配置
  extensions?: string[];
  // 路径别名配置
  aliasConfig?: Record<string, string>;
  // tsconfig.json 配置
  tsConfig?: Obj;

  // 样式目录名，相对于 inputDir
  stylesDir?: string;
  // 需要编译的样式文件，相对于 stylesDir，例如：index.scss 入口文件
  stylesParseFiles?: string[];
  // 需要拷贝的样式文件，相对于 stylesDir，例如：var.scss 变量文件
  stylesCopyFiles?: string[];

  // 输出的 d.ts 目录名
  typesOutputDir?: string;

  // 是否统计模块占用情况，仅在 singleFile 为 true 时生效，默认为 false
  stat?: boolean;

  // 是否为 node 模块
  node?: boolean;

  // 全局替换变量，例如：{ 'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV) }
  replace?: Record<string, string>;

  // 组合式 API
  compositionAPI?: boolean;
};

const defaultOptions: Options = {
  banner:
    '/*!\n' +
    ` * (rollupx banner) v1.0.0\n` +
    ` * (c) 2019-${new Date().getFullYear()}\n` +
    ' */\n',

  inputDir: 'src',
  outputDir: 'dist',
  // multi file
  inputFiles: ['**/*'],
  // single file
  // inputFiles: ['index.*'],

  excludeFiles: ['**/+(__tests__|__specs__)/**', '**/*.spec.*'],

  // output types
  outputs: ['js', 'styles', 'types'],

  singleFile: false,

  /**
   * custom build format, example:
   * ```
   * // rollupx.config.js
   * export default {
   *   format: 'umd',
   *   external: ['jquery'],
   *   outputName: 'MyBundle',
   *   outputGlobals: {
   *     jquery: '$'
   *   }
   * }
   * // bundle.js
   * // var MyBundle = (function ($) {
   * //   $.doSomeThing();
   * // }($));
   * ```
   */
  /** @type {'amd' | 'cjs' | 'es' | 'iife' | 'umd' | 'system'} */
  format: 'es',
  outputName: undefined,
  outputGlobals: undefined,
  outputPaths: undefined,
  external: undefined,

  extensions: ['.js', '.jsx', '.ts', '.tsx', '.vue'],
  aliasConfig: {
    '@': 'src',
    '~': process.cwd() + '/node_modules/',
  },
  tsConfig: undefined,

  stylesDir: '',
  stylesParseFiles: [],
  stylesCopyFiles: [],

  // inherit outputDir
  typesOutputDir: '',

  stat: false,

  node: false,

  replace: {},
};

export default defaultOptions;
