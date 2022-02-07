// vue.config.js
module.exports = {
  css: {
    loaderOptions: {
      sass: {
        // eslint-disable-next-line global-require
        implementation: require('sass'), // This line must in sass option
      },
    },
  },
  devServer: {
    disableHostCheck: true,
    port: 8080,
    public: '0.0.0.0:8080',
    proxy: {
      '/api': {
        target: 'http://192.168.0.34:3000',
        changeOrigin: true,
      },
    },
  },
  publicPath: '/',
};
