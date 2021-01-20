const fileTypes = ['js', 'jsx', 'ts', 'tsx', 'vue'];

module.exports = {
  banner:
    '/*!\n' +
    ` * (rollupx banner) v${require('../package.json').version}\n` +
    ` * (c) 2019-${new Date().getFullYear()}\n` +
    ' */\n',
  inputFiles: ['src/**/!(*.d).*(' + fileTypes.join('|') + ')'],
  inputDir: 'src',
  outputDir: 'dist',
  extensions: fileTypes.map((item) => '.' + item),
  aliasConfig: require('../alias.config'),
  tsConfig: require('../tsconfig.json'),
  stylesDir: 'styles',
  stylesCopyFiles: ['common-variables.scss'],
  typesOutputDir: '' // inherit outputDir
};
