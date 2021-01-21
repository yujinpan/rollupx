const fileTypes = ['js', 'jsx', 'ts', 'tsx', 'vue'];

module.exports = {
  banner:
    '/*!\n' +
    ` * (rollupx banner) v${require('../package.json').version}\n` +
    ` * (c) 2019-${new Date().getFullYear()}\n` +
    ' */\n',
  // multi file
  // inputFiles: ['src/**/!(*.d).*(' + fileTypes.join('|') + ')'],
  // single file
  inputFiles: ['src/index.*(' + fileTypes.join('|') + ')'],
  inputDir: 'src',
  outputDir: 'dist',
  extensions: fileTypes.map((item) => '.' + item),
  aliasConfig: {
    '@': 'src'
  },
  tsConfig: require('../tsconfig.json'),
  stylesDir: '',
  stylesCopyFiles: [],
  typesOutputDir: 'types', // inherit outputDir
  singleFile: true
};
