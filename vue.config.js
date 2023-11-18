module.exports = {
  configureWebpack: {
    resolve: {
      fallback: {
        // fs: false,
        // util: require.resolve("util/"),
        // http: require.resolve("stream-http"),
        // https: require.resolve("https-browserify"),
        // url: require.resolve("url/"),
        // zlib: require.resolve("browserify-zlib"),
        // assert: require.resolve("assert/"),
        // stream: require.resolve("stream-browserify")
      }
    }
  }
}