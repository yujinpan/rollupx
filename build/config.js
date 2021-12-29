/**
 * @typedef {object} Options
 * @property {string} [banner] 文件头信息
 *
 * @property {string} [inputDir] 输入文件根目录名，相对于 cwd
 * @property {string} [outputDir] 输出目录名，相对于 cwd
 * @property {string[]} [inputFiles] 匹配输入的文件，相对于 inputDir
 *
 * @property {(js|styles|types|docs)[]} [outputs] 指定输出类型
 *
 * @property {'amd' | 'cjs' | 'es' | 'iife' | 'umd' | 'system'} [format] js 编译类型
 * @property {string} [outputName] js 编译的导出名
 * @property {object} [outputGlobals] 引入的全局属性，例如：{ jquery: '$' }
 * @property {string[]} [outputPaths] 引入的外链
 * @property {string[]} [external] 作为外部引入的库，例如：['jquery']
 *
 * @property {string[]} [extensions] 扩展名配置
 * @property {object} [aliasConfig] 路径别名配置
 * @property {object} [tsConfig] tsconfig.json 配置
 *
 * @property {string} [stylesDir] 样式目录名，相对于 inputDir
 * @property {string[]} [stylesParseFiles] 需要编译的样式文件，相对于 stylesDir，例如 index.scss 入口文件
 * @property {string[]} [stylesCopyFiles] 需要拷贝的样式文件，相对于 stylesDir，例如 var.scss 变量文件
 *
 * @property {string} [typesOutputDir] 类型目录名
 * @property {string} [typesGlobal] 全局类型文件，相对于 cwd
 *
 * @property {string} [docsOutputDir] 文档目录名
 *
 * @property {boolean} [singleFile] 是否打包为单文件，默认为 true
 */

/**
 * @type {Options}
 */
module.exports = {
  banner:
    '/*!\n' +
    ` * (rollupx banner) v${require('../package.json').version}\n` +
    ` * (c) 2019-${new Date().getFullYear()}\n` +
    ' */\n',

  inputDir: 'src',
  outputDir: 'dist',
  // multi file
  inputFiles: ['**/*'],
  // single file
  // inputFiles: ['index.*'],

  // output types
  outputs: ['js', 'styles', 'types', 'docs'],

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
    '~': process.cwd() + '/node_modules/'
  },
  tsConfig: require('../tsconfig.json'),

  stylesDir: 'styles',
  stylesParseFiles: [],
  stylesCopyFiles: [],

  // inherit outputDir
  typesOutputDir: '',
  typesGlobal: 'global.d.ts',

  docsOutputDir: '',

  singleFile: false
};
