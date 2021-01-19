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

### Publish

- update your `package.json`
  - `name` your package name
  - `version` current version
  - `author` your name
  - `module` main esm module
  - `types` main ts module
  - `files` need to publish files
  - **`dependencies` your package required external dependencies**

```json
{
  "name": "xxx",
  "version": "1.1.1",
  "author": "your name",
  "module": "dist/index.js",
  "types": "dist/index.d.ts",
  "files": [
    "dist",
    "README.md"
  ],
  "dependencies": {
    // must be includes --- start
    "@babel/runtime": "^7.12.5",
    "core-js": "^3.8.1",
    "style-inject": "^0.3.0",
    "vue-runtime-helpers": "^1.1.2",
    // must be includes --- end

    // your package required external
    "element-ui": "^2.12.0",
    "vue": "^2.6.10",
    "vue-class-component": "^7.2.3",
    "vue-property-decorator": "^8.4.2"
  }
}

```
