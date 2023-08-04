// UNUSED FILE
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
    productionSourceMap: false,
    lintOnSave: process.env.NODE_ENV !== 'production',
    // configureWebpack: {
    //     plugins: [new BundleAnalyzerPlugin()]
    // },
};