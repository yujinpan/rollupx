const gulp = require('gulp');
const ts = require('gulp-typescript');
const through = require('through2');
const utils = require('./utils');
const fs = require('fs');
const path = require('path');

/**
 * @param {import('./config')} options
 */
async function build(options) {
  let {
    tsConfig,
    inputDir,
    outputDir,
    inputFiles,
    excludeFiles,
    typesGlobal,
    typesOutputDir
  } = options;

  typesOutputDir = path.resolve(outputDir || typesOutputDir);

  if (typesOutputDir !== outputDir) {
    fs.rmdirSync(typesOutputDir, { recursive: true });
    fs.mkdirSync(typesOutputDir);
  }

  const compilerOptions = {
    ...tsConfig.compilerOptions,
    strict: false,
    emitDeclarationOnly: true,
    declaration: true
  };

  return new Promise((resolve) => {
    const files = inputFiles.map((item) => path.resolve(inputDir, item));
    if (typesGlobal) {
      files.push(typesGlobal);
    }

    gulp
      .src(files, {
        allowEmpty: true,
        ignore: [...excludeFiles, '**/!(*.js|*.ts|*.vue)']
      })
      .pipe(utils.gulpPickVueScript(['ts', 'tsx']))
      .pipe(gulpToRelativePath(options))
      .pipe(ts(compilerOptions))
      .on('error', () => {})
      .dts.pipe(gulp.dest(typesOutputDir))
      .on('finish', resolve);
  });
}

/**
 * @param {import('./config')} options
 */
function gulpToRelativePath(options) {
  const { aliasConfig, extensions } = options;
  return through.obj(function(file, _, cb) {
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
  });
}

module.exports = build;
