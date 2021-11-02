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
};
