const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const path = require('path')
const webpack = require('webpack')

module.exports = {
  entry:'./src/assets/js/app.js',
  output: {
    filename: 'app.min.js',
    chunkFilename: './chunks/[name].js',
    publicPath: '/assets/js/'
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
          presets: ['@babel/env'],
          plugins: ['@babel/plugin-syntax-dynamic-import']
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
  optimization: {
    splitChunks: {
      cacheGroups: {
        commons: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendors",
          chunks: "all"
        }
      }
    }
  },
  plugins: [
    new MiniCssExtractPlugin({
      chunkFilename: '../css/chunks.css'
    }),
    // new webpack.ProvidePlugin({
    //   $: 'jquery',
    //   jQuery: 'jquery'
    // }),
  ]
}