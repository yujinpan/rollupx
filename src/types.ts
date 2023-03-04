import fs from 'fs';
import gulp from 'gulp';
import ts from 'gulp-typescript';
import path from 'path';
import through from 'through2';

import type { Options } from './config';
import type { TsConfig } from 'gulp-typescript/release/types';

import { gulpPickVueScript, transformToRelativePath } from './utils';

export async function build(options: Options) {
  const { inputDir, outputDir, inputFiles, excludeFiles, typesGlobal } =
    options;

  const tsConfig = options.tsConfig || defaultTsConfig();

  const typesOutputDir = path.resolve(options.typesOutputDir);

  if (typesOutputDir !== outputDir) {
    fs.rmSync(typesOutputDir, { recursive: true });
    fs.mkdirSync(typesOutputDir);
  }

  const compilerOptions: TsConfig['compilerOptions'] = {
    ...tsConfig.compilerOptions,
    strict: false,
    declaration: true,
    emitDeclarationOnly: true,
  };

  return new Promise((resolve) => {
    const files = inputFiles.map((item) => path.resolve(inputDir, item));
    if (typesGlobal) {
      files.push(typesGlobal);
    }

    gulp
      .src(files, {
        allowEmpty: true,
        ignore: [...excludeFiles, '**/!(*.ts|*.tsx|*.vue)'],
      })
      .pipe(gulpPickVueScript(['ts', 'tsx']))
      .pipe(gulpToRelativePath(options))
      .pipe(ts(compilerOptions, ts.reporter.nullReporter()))
      .on('error', () => undefined)
      .dts.pipe(gulp.dest(typesOutputDir))
      .on('finish', resolve);
  });
}

function gulpToRelativePath(options: Options) {
  const { aliasConfig, extensions } = options;
  return through.obj(function (file, _, cb) {
    file.contents = Buffer.from(
      transformToRelativePath(
        file.contents.toString(),
        file.path,
        aliasConfig,
        extensions,
        '',
      ),
    );
    cb(null, file);
  });
}

function defaultTsConfig(): TsConfig {
  return {
    compilerOptions: {
      target: 'ESNext',
      module: 'ESNext',
      jsx: 'preserve',
      moduleResolution: 'node',
      experimentalDecorators: true,
      allowSyntheticDefaultImports: true,
      skipLibCheck: true,
      allowJs: true,
    },
  };
}
