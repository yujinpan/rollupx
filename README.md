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

- create a `rollupx.config.js` file in your project.

```js
// project/rollupx.config.js
// default config
module.exports = {
  // 文件头信息
  banner:
    '/*!\n' +
    ` * (rollupx banner) v${require('../package.json').version}\n` +
    ` * (c) 2019-${new Date().getFullYear()}\n` +
    ' */\n',

  // 输入文件 [glob](https://github.com/isaacs/node-glob) 语句
  // multi file
  // inputFiles: ['src/**/!(*.d).*(ts|js|vue)'],
  // single file
  inputFiles: ['src/index.*(ts|js|vue)'],

  // 输入目录
  inputDir: 'src',

  // 输出目录
  outputDir: 'dist',

  // 扩展名
  extensions: ['.js', '.jsx', '.ts', '.tsx', '.vue'],

  // 别名配置
  aliasConfig: {'@': 'src'},

  // TS 配置文件
  tsConfig: require('./tsconfig.json'),

  // 样式目录
  stylesDir: '',

  // 需要拷贝的样式文件，例如一些 scss 变量文件
  stylesCopyFiles: [],

  // 类型文件输出目录
  typesOutputDir: 'types', // inherit outputDir

  // 是否单文件（不按文件分模块）
  singleFile: true
};
```

- recommend use the rollupx babel config `babel.config.js` [babel.config.js](./babel.config.js)

example in your `project/babel.config.js`:

```js
module.exports = {
  extends: 'rollupx/babel.config.js',
  exclude: 'node_modules/**'
}
```

- recommend use the rollupx TS config `tsconfig.json` [tsconfig.json](./tsconfig.json)

example in your `project/tsconfig.json`:

```json
{
  "extends": "rollupx/tsconfig.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": [
        "src/*"
      ]
    }
  },
  "include": [
    "global.d.ts",
    "src/**/*.ts",
    "src/**/*.tsx",
    "src/**/*.vue"
  ]
}
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
