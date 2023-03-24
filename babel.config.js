module.exports = {
  presets: [
    [
      '@vue/app',
      {
        // fix: @babel/plugin-transform-runtime option's absoluteRuntime default is false
        absoluteRuntime: false,
      },
    ],
    '@babel/preset-typescript',
  ],
  plugins: [
    '@babel/plugin-proposal-export-default-from',
    '@babel/plugin-proposal-optional-chaining',
  ],
};
