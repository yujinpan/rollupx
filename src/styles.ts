import fs from 'fs';
import path from 'path';
import postcss from 'postcss';
import sass from 'sass';

import type { Options } from './config';

import {
  deDup,
  getFiles,
  getPostcssPlugins,
  getSassDefaultOptions,
  styleExtensions,
  transformToRelativePath,
} from './utils';

const cssSuffixReg = /\.(scss|sass|less|css)$/;

export async function build(options: Options) {
  const {
    inputDir,
    outputDir,
    stylesDir,
    stylesParseFiles,
    stylesCopyFiles,
    aliasConfig,
  } = options;
  const styleInputDir = path.resolve(inputDir, stylesDir);
  const styleOutputDir = path.resolve(outputDir, stylesDir);

  const parseFiles = getFiles(stylesParseFiles, styleInputDir, cssSuffixReg);
  const copyFiles = getFiles(stylesCopyFiles, styleInputDir, cssSuffixReg);
  const allFiles = parseFiles.concat(copyFiles);

  deDup(allFiles.map((item) => path.dirname(item))).forEach((item) => {
    const dir = item.replace(styleInputDir, styleOutputDir);
    !fs.existsSync(dir) && fs.mkdirSync(dir, { recursive: true });
  });

  // 注意：由于外部引用的 node_modules 与库的目录不同，所以这里拷贝的 scss 文件的 ～ 缩写不进行替换
  const copyAliasConfig = { ...aliasConfig };
  delete copyAliasConfig['~'];
  copyFiles.forEach((item) => {
    const code = fs.readFileSync(item).toString();
    const dest = item.replace(styleInputDir, styleOutputDir);
    // to relative path
    fs.writeFileSync(
      dest,
      transformToRelativePath(code, item, copyAliasConfig, styleExtensions),
    );
  });

  return Promise.all(
    parseFiles.map((filepath) => {
      const outputPath = filepath
        .replace(styleInputDir, styleOutputDir)
        .replace(cssSuffixReg, '.css');

      const { css } = sass.renderSync({
        ...getSassDefaultOptions(options),
        file: filepath,
        outputStyle: 'expanded',
      });

      return postcss(getPostcssPlugins(options))
        .process(css, {
          from: filepath,
          to: outputPath,
        })
        .then((result) => {
          fs.writeFileSync(outputPath, removeElementComments(result.css));
        });
    }),
  );
}

function removeElementComments(css: string) {
  return Buffer.from(
    css.replace(
      /(@charset\s"UTF-8";\n)?\/\*\sElement\sChalk\sVariables(.|\n)*-{5,}\s?\*\/(\s|\n)?/gm,
      '',
    ),
  );
}

module.exports = build;
