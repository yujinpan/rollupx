const gulp = require('gulp');
const ts = require('gulp-typescript');
const through = require('through2');
const fs = require('fs');
const path = require('path');
const { parseComponent } = require('vue-template-compiler');
const utils = require('./build/utils');

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
              : `import { Vue } from 'vue-property-decorator';export default class extends Vue {}`
            ).trim()
          );
          file.extname = '.vue.ts';
        }
        file.contents = Buffer.from(
          utils.transformToRelativePath(
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

module.exports.default = build;
