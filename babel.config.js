module.exports = {
  presets: ['@vue/app', '@babel/preset-typescript'],
  plugins: [
    '@babel/plugin-proposal-export-default-from',
    '@babel/plugin-proposal-optional-chaining'
  ],
  exclude: 'node_modules/**'
};
