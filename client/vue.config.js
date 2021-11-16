// vue.config.js
module.exports = {
  devServer: {
    proxy: 'http://localhost:3000',
  },
  css: {
    loaderOptions: {
      sass: {
        // eslint-disable-next-line global-require
        implementation: require('sass'), // This line must in sass option
      },
    },
  },
};
