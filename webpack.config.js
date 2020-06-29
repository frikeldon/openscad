const path = require('path')

module.exports = {
  mode: 'development',
  entry: {
    player: path.resolve('lib', 'player', 'index.js')
  },
  output: {
    filename: '[name].js',
    publicPath: 'script'
  },
  module: {
    rules: [{
      test: /\.css$/,
      use: ['style-loader', 'css-loader']
    }, {
      test: /\.ttf$/,
      use: ['file-loader']
    }]
  },
  devServer: {
    contentBase: path.join(__dirname, 'public')
  }
}
