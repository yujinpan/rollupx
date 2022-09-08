# rollupx

JS/TS/Vue/Scss/Less to a library, and jsdoc to a JSON.

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

- create a `rollupx.config.js` file in your project.

````js
// project/rollupx.config.js
// default config
module.exports = {
  // 文件头信息 String
  banner:
    '/*!\n' +
    ` * (rollupx banner) v${require('../package.json').version}\n` +
    ` * (c) 2019-${new Date().getFullYear()}\n` +
    ' */\n',

  // 输入目录 String
  inputDir: 'src',

  // 输出目录 String
  outputDir: 'dist',

  // 输入文件 String[]，基于 inputDir，规则为 [glob](https://github.com/isaacs/node-glob) 语句
  // multi file
  inputFiles: ['**/*'],
  // single file
  // inputFiles: ["index.*"],

  // 排除输入的文件
  excludeFiles: ['**/+(__tests__|__specs__)/**', '**/*.spec.*'],

  // 输出类型
  outputs: ['js', 'styles', 'types', 'docs'],

  /**
   * 自定义打包格式，例如:
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

  // 扩展名 String[]
  extensions: ['.js', '.jsx', '.ts', '.tsx', '.vue'],

  // 别名配置 Object
  aliasConfig: { '@': 'src', '~': 'node_modules' },

  // TS 配置文件 Object
  tsConfig: require('./tsconfig.json'),

  // 样式目录 String，基于 inputDir
  stylesDir: '',

  // 需要编译的文件 String[]，基于 stylesDir，例如：["index.scss"]；["**/*"] 为编译所有样式文件。
  stylesParseFiles: [],
  // 需要拷贝的样式文件 String[]，基于 stylesDir，例如：["var.scss"]；["**/*"] 为复制所有样式文件。
  stylesCopyFiles: [],

  // 类型文件输出目录 String，继承 outputDir，例如："types"
  typesOutputDir: '',

  // 全局的类型文件 String，相对于根目录
  typesGlobal: 'global.d.ts',

  // 文档目录名
  docsOutputDir: '',

  // 是否单文件（不按文件分模块） Boolean
  singleFile: false,

  // 是否统计体积，仅在 singleFile 为 true 时生效，默认为 false
  stat: false
};
````

- recommend use the rollupx babel config `babel.config.js` [babel.config.js](./babel.config.js)

example in your `project/babel.config.js`:

```js
module.exports = {
  extends: 'rollupx/babel.config.js',
  exclude: 'node_modules/**'
};
```

- recommend use the rollupx TS config `tsconfig.json` [tsconfig.json](./tsconfig.json)

example in your `project/tsconfig.json`:

```json
{
  "extends": "rollupx/tsconfig.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["global.d.ts", "src/**/*.ts", "src/**/*.tsx", "src/**/*.vue"]
}
```

### Build

```shell
$ rollupx

# only js
$ rollupx --outputs=js

# input files
$ rollupx --input-files=index.ts
```

> more args see config's field.

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
  "files": ["dist", "README.md"],
  "dependencies": {
    // must be includes --- start
    "@babel/runtime": "^7.x",
    "core-js": "^3.x",
    "style-inject": "^0.x",
    "vue-runtime-helpers": "^1.x",
    // must be includes --- end

    // your package required external
    "element-ui": "^2.x",
    "vue": "^2.x",
    "vue-class-component": "^7.x",
    "vue-property-decorator": "^8.x"
  }
}
```

### @TODO

- [ ] `url(...)` in style file can not be rebase path when multi-level nested import.
- [ ] `rollup-plugin-vue@5(vue2)` has not updated for two years, required packages version too low:
  - `postcss@7`
- [ ] `gulp@4` has not updated for three years, required packages version too low:
  - `glob-parent`
