module.exports = {
  outputDir: 'test',
  aliasConfig: {
    '@': 'src',
    test: './'
  },
  // typesOutputDir: 'types',
  singleFile: false,
  inputFiles: ['src/**/!(*.d).*(ts|js|vue)'],
  stylesDir: 'styles',
  stylesCopyFiles: ['index.scss']
};
