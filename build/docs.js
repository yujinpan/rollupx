const gulp = require('gulp');
const ts = require('gulp-typescript');
const through = require('through2');
const jsdocToMarkdown = require('jsdoc-to-markdown');
const prettier = require('prettier');
const fs = require('fs');
const utils = require('./utils');

const compilerOptions = {
  strict: false,
  target: 'esnext',
  module: 'commonjs',
  isolatedModules: true,
  allowJs: true,
  jsx: 'preserve'
};

/**
 * @param {import('./config')} options
 */
async function build(options) {
  const { inputDir, docsOutputDir } = options;

  fs.rmdirSync(docsOutputDir, { recursive: true });

  return new Promise((resolve) => {
    const files = ['/**/*.js', '/**/*.ts', '/**/*.tsx', '/**/*.vue'].map(
      (item) => inputDir + item
    );
    gulp
      .src(files, { allowEmpty: true })
      .pipe(utils.gulpPickVueScript())
      .pipe(ts(compilerOptions))
      .on('error', () => {})
      .pipe(gulpJsToDocData())
      .pipe(gulp.dest(docsOutputDir))
      .on('finish', resolve);
  });
}

function gulpJsToDocData() {
  return through.obj((file, _, cb) => {
    const docs = Array.from(
      jsdocToMarkdown.getTemplateDataSync({
        source: file.contents,
        'no-cache': true
      })
    );
    if (docs.length) {
      file.contents = Buffer.from(
        prettier.format(JSON.stringify(docs), {
          parser: 'json'
        })
      );
      file.extname = '.json';
      cb(null, file);
    } else {
      cb();
    }
  });
}

module.exports = build;
