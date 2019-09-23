/* eslint-env node */
const webpack = require('webpack')
const path = require('path');

module.exports = {
  entry: 'src/index.js',
  output: {
    filename: 'index.js',
    libraryTarget: 'commonjs2',
    path: path.resolve(__dirname, 'build'),
  },
  mode: 'production',
  module: {
    rules: [
      {parser: {System: false}},
      {
        test: /\.(js|jsx)$/,
        exclude: [path.resolve(__dirname, 'node_modules')],
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env', '@babel/preset-react']
            }
          }
        ],
      },
      {
        test: /\.css$/,
        exclude: [path.resolve(__dirname, 'node_modules'), /\.krem.css$/],
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              localIdentName: '[path][name]__[local]',
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              plugins() {
                return [
                  require('autoprefixer')
                ];
              },
            },
          },
        ],
      },
      {
        test: /\.css$/,
        include: [path.resolve(__dirname, 'node_modules')],
        exclude: [/\.krem.css$/],
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  resolve: {
    modules: [
      __dirname,
      'node_modules',
    ],
  },
  plugins: [],
  devtool: 'source-map',
};

