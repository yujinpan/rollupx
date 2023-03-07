import fs from 'fs';
import gulp from 'gulp';
import ts from 'gulp-typescript';
import jsdocToMarkdown from 'jsdoc-to-markdown';
import prettier from 'prettier';
import through from 'through2';

import type { Options } from './config';

import { gulpPickVueScript } from './utils';

const compilerOptions = {
  strict: false,
  target: 'esnext',
  module: 'commonjs',
  isolatedModules: true,
  allowJs: true,
  jsx: 'preserve',
};

export async function build(options: Options) {
  const { inputDir, docsOutputDir } = options;

  fs.rmSync(docsOutputDir, { recursive: true });

  return new Promise((resolve) => {
    const files = ['/**/*.js', '/**/*.ts', '/**/*.tsx', '/**/*.vue'].map(
      (item) => inputDir + item,
    );
    gulp
      .src(files, { allowEmpty: true })
      .pipe(gulpPickVueScript())
      .pipe(ts(compilerOptions))
      .on('error', () => undefined)
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
        'no-cache': true,
      }),
    );
    if (docs.length) {
      file.contents = Buffer.from(
        prettier.format(JSON.stringify(docs), {
          parser: 'json',
        }),
      );
      file.extname = '.json';
      cb(null, file);
    } else {
      cb();
    }
  });
}
