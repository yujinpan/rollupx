const banner =
  '/*!\n' +
  ` * vue-component-pack v${require('../package.json').version}\n` +
  ` * (c) 2019-${new Date().getFullYear()} yujinpan\n` +
  ' * Released under the MIT License.\n' +
  ' */\n';

// multi package
const inputFiles = ['src/**/!(*.d|types).*(ts|js|vue)'];

module.exports = {
  banner,
  inputFiles,
  inputDir: 'src',
  outputDir: 'dist',
  extensions: ['.js', '.jsx', '.ts', '.tsx', '.vue'],
  aliasConfig: require('../alias.config'),
  tsConfig: require('../tsconfig.json'),
  stylesDir: 'styles',
  stylesCopyFiles: ['common-variables.scss']
};
