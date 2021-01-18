/**
 * vue config
 * @description
 * vue构建配置文件，[文档地址](https://cli.vuejs.org/zh/config/#vue-config-js)
 */

module.exports = {
  indexPath: '../_layouts/default.html',
  publicPath:
    process.env.NODE_ENV === 'production' ? process.env.VUE_APP_BASE_URL : '/',
  productionSourceMap: false,

  // webpack config
  configureWebpack: {
    entry: './examples/main.ts'
  }
};
