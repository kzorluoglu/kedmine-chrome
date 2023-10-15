const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/dist/plugin').default;
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = (env, argv) => {
  const isDevelopment = argv.mode !== 'production';

  return {
    entry: {
      index: path.join(__dirname, 'src', 'index.js'),
      background: path.join(__dirname, 'src', 'background.js'),
    },
    output: {
      path: path.join(__dirname, 'dist'),
      filename: '[name].js',
    },
    module: {
      rules: [
        {
          test: /\.vue$/,
          loader: 'vue-loader'
        },
        {
          test: /\.css$/,
          use: [
            'vue-style-loader',
            'css-loader'
          ]
        },
        {
          test: /\.less$/,
          use: [
            'vue-style-loader',
            'css-loader',
            'less-loader'
          ]
        },
        {
          test: /\.s(c|a)ss$/,
          use: [
            'vue-style-loader',
            'css-loader',
            'sass-loader'
          ]
        }
      ]
    },
    plugins: [
      new VueLoaderPlugin(),
      new HtmlWebpackPlugin({
        template: path.join(__dirname, 'src', 'index.html'),
        inject: 'body'
      }),
      new CopyWebpackPlugin({
        patterns: [
          { from: 'src/images', to: 'images' },
          { from: 'src/manifest.json', to: 'manifest.json' },
          { from: 'src/background.js', to: 'background.js' }
        ]
      })
    ],
    devServer: {
      devMiddleware: {
        writeToDisk: true
      },
      hot: isDevelopment
    }
  };
};
