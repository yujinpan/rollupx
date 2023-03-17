module.exports = {
  outputDir: 'test',
  aliasConfig: {
    '@': 'src',
    test: './',
  },

  formats: [
    { format: 'es' },
    { format: 'esm', inputFiles: ['index.ts'], outputFile: '/esm/[name][ext]' },
    { format: 'esm', inputFiles: ['index.ts'], outputFile: '[name].esm.js' },
    { format: 'cjs', inputFiles: ['index.ts'], outputFile: '/cjs/[name][ext]' },
    { format: 'cjs', inputFiles: ['index.ts'], outputFile: '[name].cjs.js' },
    { format: 'umd', inputFiles: ['index.ts'], outputFile: '[name].umd[ext]' },
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
  // typesGlobal: 'src/global.d.ts'
  docsOutputDir: 'docs',
};
