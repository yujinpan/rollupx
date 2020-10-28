const gulp = require('gulp');
const ts = require('gulp-typescript');
const through = require('through2');
const fs = require('fs');
const path = require('path');
const aliasConfig = require('./alias.config');
const { parseComponent } = require('vue-template-compiler');

function build() {
  // clear types folder first
  fs.rmdirSync('types', { recursive: true });

  return gulp
    .src(require('./tsconfig.json').include)
    .pipe(
      through.obj(function(file, _, cb) {
        // get scripts
        if (file.extname === '.vue') {
          const code = file.contents.toString();
          const scripts = parseComponent(code);
          file.contents = Buffer.from(
            (scripts.script
              ? scripts.script.content
              : createEmptyVueClass()
            ).trim()
          );
          file.extname = '.vue.ts';
        }
        file.contents = Buffer.from(
          transformToRelativePath(
            file.contents.toString(),
            path.resolve(file.path, '../')
          )
        );
        cb(null, file);
      })
    )
    .pipe(ts.createProject('./tsconfig.json')())
    .dts.pipe(gulp.dest('types'));
}

// create empty vue class
function createEmptyVueClass(className = '') {
  return `import { Vue } from 'vue-property-decorator';export default class ${className} extends Vue {}`;
}

// transform absolute path to relative path
function transformToRelativePath(codes, filepath) {
  const imports = codes.match(/(from\s|require\(|import\()'@\/[^']*'\)?/g);
  if (imports) {
    // get source path
    const paths = imports.map((item) =>
      item.replace(/^(from\s|require\(|import\()'/, '').replace(/'\)?/, '')
    );

    // get relative path
    const relativePaths = paths
      .map((item) => {
        // read alias path config
        for (let key in aliasConfig) {
          if (item.startsWith(key)) {
            return path.relative(
              filepath,
              item.replace(new RegExp('^' + key), aliasConfig[key])
            );
          }
        }
        console.warn(
          'gulpfile.js warn:',
          'can not find the path config:' + item
        );
        return item;
      })
      // add ./
      .map((item) => (item.startsWith('.') ? item : './' + item));

    // replace source code
    paths.forEach((item, index) => {
      codes = codes.replace(item, relativePaths[index]);
    });
  }
  return codes;
}

module.exports.default = build;
