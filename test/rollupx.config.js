module.exports = {
  outputDir: 'test',
  aliasConfig: {
    '@': 'src',
    test: './'
  },
  // typesOutputDir: 'types',
  singleFile: false,
  inputFiles: ['**/*'],
  stylesDir: 'styles',
  // stylesParseFiles: [],
  stylesCopyFiles: ['**/*'],
  typesOutputDir: 'test',
  typesGlobal: 'src/global.d.ts'
};
