module.exports = {
  presets: [
    [
      '@vue/app',
      // fix: @babel/plugin-transform-runtime option's absoluteRuntime default is false
      { absoluteRuntime: false }
    ],
    // fix: constructor public/private defined is lose when
    // @babel/preset-typescript in here and project at the same time
    ['@babel/preset-typescript', {}, 'rollupx-preset-typescript']
  ],
  plugins: [
    '@babel/plugin-proposal-export-default-from',
    '@babel/plugin-proposal-optional-chaining'
  ],
  exclude: 'node_modules/**'
};
