const gulp = require('gulp');
const ts = require('gulp-typescript');
const through = require('through2');
const { parseComponent } = require('vue-template-compiler');
const utils = require('./utils');

async function build(tsConfig, extensions, aliasConfig, declarationDir) {
  return gulp
    .src(tsConfig.include)
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
            file.path,
            aliasConfig,
            extensions
          )
        );
        cb(null, file);
      })
    )
    .pipe(ts.createProject(tsConfig.compilerOptions)())
    .dts.pipe(
      gulp.dest(declarationDir || tsConfig.compilerOptions.declarationDir)
    );
}

module.exports = build;
