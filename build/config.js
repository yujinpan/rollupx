const banner =
  '/*!\n' +
  ` * rollupx v${require('../package.json').version}\n` +
  ` * (c) 2019-${new Date().getFullYear()}\n` +
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
