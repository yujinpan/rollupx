/**
 * @typedef {object} Options
 * @property {string} [inputDir] 输入文件根目录名，相对于 cwd
 * @property {string} [outputDir] 输出目录名，相对于 cwd
 * @property {string[]} [inputFiles] 匹配输入的文件，相对于 inputDir
 *
 * @property {string} [banner] 文件头信息
 * @property {object} [aliasConfig] 路径别名配置
 * @property {string[]} [extensions] 扩展名配置
 * @property {object} [tsConfig] tsconfig.json 配置
 *
 * @property {string} [stylesDir] 样式目录名，相对于 inputDir
 * @property {string[]} [stylesParseFiles] 需要编译的样式文件，相对于 stylesDir，例如 index.scss 入口文件
 * @property {string[]} [stylesCopyFiles] 需要拷贝的样式文件，相对于 stylesDir，例如 var.scss 变量文件
 *
 * @property {string} [typesOutputDir] 类型目录名，相对于 inputDir
 * @property {string} [typesGlobal] 全局类型文件，相对于 cwd
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
  // inputFiles: ['**/*'],
  // single file
  inputFiles: ['index.*'],
  extensions: ['.js', '.jsx', '.ts', '.tsx', '.vue'],

  aliasConfig: {
    '@': 'src',
    '~': 'node_modules'
  },
  tsConfig: require('../tsconfig.json'),

  stylesDir: 'styles',
  stylesParseFiles: ['index.scss'],
  stylesCopyFiles: ['var.scss'],

  typesOutputDir: 'types',
  typesGlobal: 'global.d.ts',

  singleFile: true
};
