# rollupx

> Now the 3.0-alpha version has been released, supporting vue3.

JS/TS/Vue/Scss/Less to a library, and jsdoc to a JSON.

## Usage

### Install

```
npm install --save-dev rollupx
```

vue2

```
npm install --save-dev rollupx rollup-plugin-vue@5
```

### Examples

- [SingleFile](#singlefile)
- [MultiFile](#multifile)
- [MultiFormat](#multiformat)

#### SingleFile

- config

```js
// rollupx.config.js
module.exports = {
  inputFiles: ["index.ts"],
  singleFile: true,
  outputDir: "lib",
};
```

- result

```
- src             =>  - lib
  - index.ts      =>    - index.js & index.d.ts
  - import1.ts    =>    - (bundle)
  - import2.ts    =>    - (bundle)
  - test.scss     =>    - (bundle)
  - test.css      =>    - (bundle)
  - test.png      =>    - test.png
```

#### MultiFile

- config

```js
// rollupx.config.js
module.exports = {
  outputDir: "lib",
};
```

- result

```
- src             =>  - lib
  - index.ts      =>    - index.js & index.d.ts
  - import1.ts    =>    - import1.js & import1.d.ts
  - import2.ts    =>    - import2.js & import2.d.ts
  - test.scss     =>    - (bundle)
  - test.css      =>    - (bundle)
  - test.png      =>    - test.png
```

#### MultiFormat

- config

```js
// rollupx.config.js
module.exports = {
  outputDir: "lib",
  formats: [
    { format: "es", inputFiles: ["**/*"] },
    { format: "esm", inputFiles: ["index.ts"], outputFile: "/esm/[name][ext]" },
    { format: "esm", inputFiles: ["index.ts"], outputFile: "[name].esm.js" },
    { format: "cjs", inputFiles: ["index.ts"], outputFile: "/cjs/[name][ext]" },
    { format: "cjs", inputFiles: ["index.ts"], outputFile: "[name].cjs.js" },
    { format: "umd", inputFiles: ["index.ts"], outputFile: "[name].umd[ext]" },
  ],
};
```

- result

```
- src             =>  - lib
  - index.ts      =>    - index.js & index.d.ts
  - import1.ts          - import1.js & import1.d.ts
  - import2.ts          - import2.js & import2.d.ts
  - test.scss     =>    - (bundle)
  - test.css      =>    - (bundle)
  - test.png      =>    - test.png

  - index.ts      =>    - esm
                  =>      - index.js

  - index.ts      =>    - cjs
                  =>      - index.js

  - index.ts      =>    - index.ems.js
  - index.ts      =>    - index.cjs.js
  - index.ts      =>    - index.umd.js
```

### Config

#### types

```ts
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
  outputs?: ("js" | "styles" | "types" | "docs")[];

  // 是否打包为单文件，默认 false 每个文件独立输出
  singleFile?: boolean;

  // 多种格式同时打包
  formats?: Options[];

  // 输出格式
  format?: "amd" | "cjs" | "es" | "iife" | "umd" | "system";

  // 输出文件地址，/ 开头时将基于 outputDir，例如：'/[name][ext]'
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
  tsConfig?: TsConfig;

  // 样式目录名，相对于 inputDir
  stylesDir?: string;
  // 需要编译的样式文件，相对于 stylesDir，例如：index.scss 入口文件
  stylesParseFiles?: string[];
  // 需要拷贝的样式文件，相对于 stylesDir，例如：var.scss 变量文件
  stylesCopyFiles?: string[];

  // 输出的 d.ts 目录名
  typesOutputDir?: string;
  // 全局 d.ts 文件，相对于 cwd;
  typesGlobal?: string;

  // 文档目录名
  docsOutputDir?: string;

  // 是否统计模块占用情况，仅在 singleFile 为 true 时生效，默认为 false
  stat?: boolean;
};
```

#### default config

````js
// project/rollupx.config.js
// default config
module.exports = {
  banner:
    "/*!\n" +
    ` * (rollupx banner) v1.0.0\n` +
    ` * (c) 2019-${new Date().getFullYear()}\n` +
    " */\n",

  inputDir: "src",
  outputDir: "dist",
  // multi file
  inputFiles: ["**/*"],
  // single file
  // inputFiles: ['index.*'],

  excludeFiles: ["**/+(__tests__|__specs__)/**", "**/*.spec.*"],

  // output types
  outputs: ["js", "styles", "types", "docs"],

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
  format: "es",
  outputName: undefined,
  outputGlobals: undefined,
  outputPaths: undefined,
  external: undefined,

  extensions: [".js", ".jsx", ".ts", ".tsx", ".vue"],
  aliasConfig: {
    "@": "src",
    "~": process.cwd() + "/node_modules/",
  },
  tsConfig: undefined,

  stylesDir: "",
  stylesParseFiles: [],
  stylesCopyFiles: [],

  // inherit outputDir
  typesOutputDir: "",
  typesGlobal: "global.d.ts",

  docsOutputDir: "",

  stat: false,
};
````

#### recommend config

- recommend use the rollupx babel config `babel.config.js` [babel.config.js](./babel.config.js)

example in your `project/babel.config.js`:

```js
module.exports = {
  extends: "rollupx/babel.config.js",
  exclude: "node_modules/**",
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
    // must be includes --- end

    // your package required external
    "element-plus": "^2.x",
    "vue": "^3.x"
  }
}
```

### @TODO

- [ ] `url(...)` in style file can not be rebase path when multi-level nested import.
- [ ] `rollup-plugin-vue@5(vue2)` has not updated for two years, required packages version too low:
  - `postcss@7`
- [ ] `gulp@4` has not updated for three years, required packages version too low:
  - `glob-parent`
