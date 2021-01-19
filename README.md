# rollupx

js/ts/vue/scss/less to a library.

## Usage

### Install

```
npm install --save-dev rollupx
```

### Config

create a `rollupx.config.js` file in your project.

```js
// project/rollupx.config.js
// default config
/**
 * @property {string[]} [inputFiles] 匹配输入的文件
 * @property {string} [inputDir] 输入文件根目录名
 * @property {string} [outputDir] 输出目录名
 * @property {string} [banner] 文件头信息
 * @property {object} [aliasConfig] 路径别名配置
 * @property {string[]} [extensions] 扩展名配置
 * @property {object} [tsConfig] tsconfig.json 配置
 * @property {string} [stylesDir] 样式目录名，基于 inputDir
 * @property {string[]} [stylesCopyFiles] 需要拷贝的样式文件，例如 scss 变量可能需要拷贝
 */
module.exports = {
  banner:
    '/*!\n' +
    ` * (rollupx banner) v${require('../package.json').version}\n` +
    ` * (c) 2019-${new Date().getFullYear()}\n` +
    ' */\n',
  inputFiles: ['src/**/!(*.d|types).*(ts|js|vue)'],
  inputDir: 'src',
  outputDir: 'dist',
  extensions: ['.js', '.jsx', '.ts', '.tsx', '.vue'],
  aliasConfig: require('../alias.config'),
  tsConfig: require('../tsconfig.json'),
  stylesDir: 'styles',
  stylesCopyFiles: ['common-variables.scss']
};
```

### Build

```shell
$ rollupx
```
