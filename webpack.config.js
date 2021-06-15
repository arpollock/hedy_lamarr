const path = require('path');
module.exports = {
  entry: './src/main.ts',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      }//,
      // {
      //   test: /\.css$/i,
      //   use: ['style-loader', 'css-loader'],
      // },
      // {
      //   test: /\.(png|svg|jpg|jpeg|gif)$/i,
      //   use: 'html-loader',
      //   type: 'asset/resource',
      // }
    ]
  },
  resolve: {
    extensions: [ '.ts', '.tsx', '.js' ]
  },
  mode: 'development',
};