const sass = require('node-sass');
const fs = require('fs');
const path = require('path');
const postcss = require('postcss');
const autoprefixer = require('autoprefixer');
const utils = require('./utils');

const cssSuffixReg = /\.(scss|sass|less|css)$/;

async function build(inputDir, outputDir, parseFiles, copyFiles, aliasConfig) {
  parseFiles = utils.getFiles(parseFiles, inputDir, cssSuffixReg);
  copyFiles = utils.getFiles(copyFiles, inputDir, cssSuffixReg);
  const allFiles = parseFiles.concat(copyFiles);

  fs.rmdirSync(outputDir, { recursive: true });
  fs.mkdirSync(outputDir, { recursive: true });
  utils.deDup(allFiles.map((item) => path.dirname(item))).forEach((item) => {
    const dir = item.replace(inputDir, outputDir);
    !fs.existsSync(dir) && fs.mkdirSync(dir);
  });

  copyFiles.forEach((item) => {
    const code = fs.readFileSync(item).toString();
    const dest = item.replace(inputDir, outputDir);
    // to relative path
    fs.writeFileSync(
      dest,
      utils.transformToRelativePath(
        code,
        item,
        aliasConfig,
        utils.styleExtensions
      )
    );
  });

  return Promise.all(
    parseFiles.map((filepath) => {
      const outputPath = filepath
        .replace(inputDir, outputDir)
        .replace(cssSuffixReg, '.css');

      const { css } = sass.renderSync({
        file: filepath,
        output: outputDir,
        outputStyle: 'expanded',
        importer: function(url) {
          return {
            file: utils.toRelative(filepath, url, aliasConfig)
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
