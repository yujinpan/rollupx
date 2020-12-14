const sass = require('node-sass');
const fs = require('fs');
const path = require('path');
const config = require('./config');
const postcss = require('postcss');
const autoprefixer = require('autoprefixer');

const inputDir = path.resolve(__dirname, '../src/styles');
const output = path.resolve(__dirname, `../${config.outputDir}/styles`);

build().finally(() => {
  console.log('打包 styles 完毕！');
});

async function build() {
  const files = fs.readdirSync(inputDir).filter((item) => /.scss$/.test(item));

  fs.mkdirSync(output, { recursive: true });

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
