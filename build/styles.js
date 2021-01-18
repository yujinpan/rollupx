const sass = require('node-sass');
const fs = require('fs');
const path = require('path');
const postcss = require('postcss');
const autoprefixer = require('autoprefixer');

async function build(inputDir, output, copyFiles) {
  const files = fs
    .readdirSync(inputDir)
    .filter(
      (item) =>
        /.scss$/.test(item) &&
        !copyFiles.some((file) => item.includes(path.basename(file)))
    );

  fs.rmdirSync(output, { recursive: true });
  fs.mkdirSync(output, { recursive: true });
  copyFiles.forEach((item) => {
    fs.copyFileSync(inputDir + '/' + item, output + '/' + path.basename(item));
  });

  return await Promise.all(
    files.map((filename) => {
      const filepath = inputDir + '/' + filename;
      const outputPath = output + '/' + filename.replace(/.scss$/, '.css');

      const { css } = sass.renderSync({
        file: filepath,
        output: output,
        outputStyle: 'expanded'
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
