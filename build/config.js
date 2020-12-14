const banner =
  '/*!\n' +
  ` * your-component v${require('../package.json').version}\n` +
  ` * (c) 2019-${new Date().getFullYear()} your-name\n` +
  ' * Released under the MIT License.\n' +
  ' */\n';

// multi package
const inputFiles = ['src/**/!(*.d|types).*(ts|js|vue)'];

module.exports = {
  banner,
  inputFiles,
  inputDir: 'src',
  outputDir: 'dist',
  typesDir: 'types'
};
