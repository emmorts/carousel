const path = require('path');

module.exports = {
  mode: 'development',
  entry: './index.js',
  output: {
    filename: 'app.js',
    path: path.resolve(__dirname, 'dist')
  },
  devtool: 'source-map',
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    proxy: {
      '/api': 'http://localhost:3000'
    }
  },
  module: {
     rules: [
       {
         test: /\.js$/,
         exclude: /node_modules/,
         use: {
           loader: 'babel-loader'
         }
       },
       {
         test: /\.css$/,
         use: [ 'style-loader', 'css-loader' ]
       }
     ],
  }
};