module.exports = {
  outputDir: 'test',
  aliasConfig: {
    '@': 'src',
    test: './',
  },

  formats: [
    // { format: 'es' },
    { format: 'es', inputFiles: ['**/*'], outputDir: 'test/es' },
    { format: 'cjs', inputFiles: ['**/*'], outputDir: 'test/cjs' },
    {
      format: 'cjs',
      inputFiles: ['index.ts'],
      outputFile: '[name].cjs.js',
      singleFile: true,
      external: ['vue'],
    },
    {
      format: 'umd',
      inputFiles: ['index.ts'],
      outputFile: '[name].umd[ext]',
      singleFile: true,
      external: ['vue'],
      outputGlobals: {
        vue: 'Vue',
      },
    },
    { format: 'es', inputFiles: ['test.js'], outputFile: '[dir]-[name][ext]' },
  ],

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

  watch: true,
};
