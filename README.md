# rollupx

js/ts/vue/scss/less to a library.

```
# single file
- src             =>  - dist
  - test1.js      =>    - test1.js
  - test2.js
  - test3.js

# multi file
- src             =>  - dist
  - test.vue      =>    - test.vue.js
  - test-ts.vue   =>    - test-ts.vue.js, vue-ts.vue.d.ts
  - test.js       =>    - test.js
  - test.ts       =>    - test.js, test.d.ts
  - test.scss     =>    - (inline js)
  - test.css      =>    - (inline js)
  - test.png      =>    - (inline js OR 3dac04548057e393.png)
```

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
 * @property {string} [typesOutputDir] 类型文件输出目录名，默认继承 outputDir
 * @property {boolean} [singleFile] 是否打包为单文件，默认为 true
 */
module.exports = {
  banner:
    '/*!\n' +
    ` * (rollupx banner) v${require('../package.json').version}\n` +
    ` * (c) 2019-${new Date().getFullYear()}\n` +
    ' */\n',
  // multi file
  // inputFiles: ['src/**/!(*.d|types).*(ts|js|vue)'],
  // single file
  inputFiles: ['src/index.*(ts|js|vue)'],
  inputDir: 'src',
  outputDir: 'dist',
  extensions: ['.js', '.jsx', '.ts', '.tsx', '.vue'],
  aliasConfig: require('../alias.config'),
  tsConfig: require('../tsconfig.json'),
  stylesDir: '',
  stylesCopyFiles: [],
  typesOutputDir: 'types', // inherit outputDir
  singleFile: false
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
