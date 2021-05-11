const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const path = require('path')

module.exports = {
  entry:'./src/assets/js/app.js',
  output: {
    filename: 'app.min.js'
  },
  mode: 'production',
  performance: {
    hints: false,
    maxEntrypointSize: 512000,
    maxAssetSize: 512000
  },
  module: {
    rules: [
      {
        test: /\.(js)$/,
        exclude: /(node_modules)/,
        loader: 'babel-loader',
        query: {
          presets: ['@babel/env']
        }
      },
      {
        test: /\.css$/,
        loaders: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: './src/assets/css',
            },
          },
          "css-loader"]
      },
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      chunkFilename: 'plugins.css'
    })
  ]
}