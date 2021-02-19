const gulp = require('gulp');
const ts = require('gulp-typescript');
const through = require('through2');
const { parseComponent } = require('vue-template-compiler');
const utils = require('./utils');

function build(tsConfig, inputDir, outputDir, extensions, aliasConfig) {
  return new Promise((resolve) => {
    gulp
      .src(
        ['/**/*.ts', '/**/*.tsx', '/**/*.vue'].map((item) => inputDir + item)
      )
      .pipe(
        through.obj(function(file, _, cb) {
          // get scripts
          if (file.extname === '.vue') {
            const code = file.contents.toString();
            const scripts = parseComponent(code);
            const lang = scripts.script.lang;
            // must be ts
            if (!['ts', 'tsx'].includes(lang)) {
              return cb();
            }
            file.contents = Buffer.from(
              (scripts.script
                ? scripts.script.content
                : `import { Vue } from 'vue-property-decorator';export default class extends Vue {}`
              ).trim()
            );
            file.extname = '.' + lang;
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
      .dts.pipe(gulp.dest(outputDir || tsConfig.compilerOptions.declarationDir))
      .on('finish', function() {
        resolve();
      });
  });
}

module.exports = build;
