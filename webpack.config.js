const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = {
  plugins: [
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      reportFilename: 'bundle-report.html',
      openAnalyzer: true,
    }),
  ],
  devServer: {
    hot: true, // Kích hoạt HMR
    liveReload: true, // Kích hoạt Live Reloading
    progress: true, // Hiển thị tiến trình build
    overlay: {
      warnings: true,
      errors: true
    }
  }
};
