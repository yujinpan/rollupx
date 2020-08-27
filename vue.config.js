/**
 * vue config
 * @description
 * vue构建配置文件，[文档地址](https://cli.vuejs.org/zh/config/#vue-config-js)
 */
const argv = process.argv.splice(2);

// 打包体积分析插件
const BundleAnalyzerPlugin = argv.includes('--analyzer')
  ? [new (require('webpack-bundle-analyzer').BundleAnalyzerPlugin)()]
  : [];

module.exports = {
  indexPath: '../_layouts/default.html',
  publicPath:
    process.env.NODE_ENV === 'production' ? process.env.VUE_APP_BASE_URL : '/',
  productionSourceMap: false,

  // webpack config
  configureWebpack: {
    entry: './examples/main.ts',
    plugins: [...BundleAnalyzerPlugin]
  }
};
