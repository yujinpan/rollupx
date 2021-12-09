const gulp = require('gulp');
const ts = require('gulp-typescript');
const through = require('through2');
const { parseComponent } = require('vue-template-compiler');
const utils = require('./utils');

/**
 * @param {import('./config')} options
 */
async function build(options) {
  const {
    tsConfig,
    inputDir,
    outputDir,
    extensions,
    aliasConfig,
    typesGlobal
  } = options;
  return new Promise((resolve, reject) => {
    const files = ['/**/*.ts', '/**/*.tsx', '/**/*.vue'].map(
      (item) => inputDir + item
    );
    if (typesGlobal) files.push(typesGlobal);
    gulp
      .src(files, { allowEmpty: true })
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
              extensions,
              ''
            )
          );
          cb(null, file);
        })
      )
      .pipe(
        ts
          .createProject(tsConfig.compilerOptions)()
          .on('error', reject)
      )
      .dts.pipe(gulp.dest(outputDir || tsConfig.compilerOptions.declarationDir))
      .on('finish', resolve);
  });
}

module.exports = build;
