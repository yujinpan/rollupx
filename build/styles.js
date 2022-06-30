const sass = require('node-sass');
const fs = require('fs');
const path = require('path');
const postcss = require('postcss');
const autoprefixer = require('autoprefixer');
const utils = require('./utils');

const cssSuffixReg = /\.(scss|sass|less|css)$/;

/**
 * @param {import('./config')} options
 */
async function build(options) {
  const {
    inputDir,
    outputDir,
    stylesDir,
    stylesParseFiles,
    stylesCopyFiles,
    aliasConfig
  } = options;
  const styleInputDir = path.resolve(inputDir, stylesDir);
  const styleOutputDir = path.resolve(outputDir, stylesDir);

  const parseFiles = utils.getFiles(
    stylesParseFiles,
    styleInputDir,
    cssSuffixReg
  );
  const copyFiles = utils.getFiles(
    stylesCopyFiles,
    styleInputDir,
    cssSuffixReg
  );
  const allFiles = parseFiles.concat(copyFiles);

  utils.deDup(allFiles.map((item) => path.dirname(item))).forEach((item) => {
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
      utils.transformToRelativePath(
        code,
        item,
        copyAliasConfig,
        utils.styleExtensions
      )
    );
  });

  return Promise.all(
    parseFiles.map((filepath) => {
      const outputPath = filepath
        .replace(styleInputDir, styleOutputDir)
        .replace(cssSuffixReg, '.css');

      const { css } = sass.renderSync({
        file: filepath,
        output: styleOutputDir,
        outputStyle: 'expanded',
        importer: function(url) {
          return {
            file: utils.toRelative(
              filepath,
              url,
              aliasConfig,
              utils.styleExtensions
            )
          };
        }
      });

      return postcss([autoprefixer])
        .process(css, {
          from: filepath,
          to: outputPath
        })
        .then((result) => {
          fs.writeFileSync(outputPath, removeElementComments(result.css));
        });
    })
  );
}

function removeElementComments(buffer) {
  return Buffer.from(
    buffer
      .toString()
      .replace(
        /(@charset\s"UTF-8";\n)?\/\*\sElement\sChalk\sVariables(.|\n)*-{5,}\s?\*\/(\s|\n)?/gm,
        ''
      )
  );
}

module.exports = build;
