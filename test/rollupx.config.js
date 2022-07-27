module.exports = {
  outputDir: 'test',
  aliasConfig: {
    '@': 'src',
    test: './'
  },

  // format: 'umd',
  // external: ['vue'],
  // outputName: 'MyBundle',
  // outputGlobals: {
  //   vue: 'Vue'
  // },

  // typesOutputDir: 'types',
  // singleFile: false,
  // inputFiles: ['index.*'],
  // stylesDir: '',
  stylesParseFiles: ['**/*.scss'],
  stylesCopyFiles: ['**/*'],
  // typesOutputDir: 'test',
  // typesGlobal: 'src/global.d.ts'
  docsOutputDir: 'docs'
};
