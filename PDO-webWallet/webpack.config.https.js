// Generated using webpack-cli https://github.com/webpack/webpack-cli
const webpack = require('webpack');
const path = require('path');
const Dotenv = require('dotenv-webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const fs = require('fs');

const isProduction = process.env.NODE_ENV == 'production';

const stylesHandler = isProduction ? MiniCssExtractPlugin.loader : 'style-loader';

const config = {
  entry: './src/index.tsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/',
    // clean: true,
    // assetModuleFilename: './images/[name][ext][query]',
    // chunkFilename: '[name].chunk.js',
  },
  devServer: {
    open: false,
    // host: 'localhost',
    historyApiFallback: true,
    // static: path.join(__dirname, 'dist'),
    // compress: true,
    hot:true,
    port: 443,
    allowedHosts: 'all',
    https:true,
    https: {
      key: fs.readFileSync('/certs/cert.key'),
      cert: fs.readFileSync('/certs/cert.crt'),
      //ca: fs.readFileSync('/path/to/ca.pem'),
    }
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'index.html',
    }),
    new Dotenv({
      systemvars: true,
    }),
    new webpack.ProvidePlugin({
      process: 'process/browser',
    }),
    new webpack.IgnorePlugin({
      checkResource(resource) {
        return /.*\/wordlists\/(?!english).*\.json/.test(resource);
      },
    }),

    // Add your plugins here
    // Learn more about plugins from https://webpack.js.org/configuration/plugins/
  ],
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/i,
        loader: 'ts-loader',
        // exclude: ['/node_modules/'],
        exclude: /node_modules|\.d\.ts$/, // this line as well
        options: {
          compilerOptions: {
            noEmit: false, // this option will solve the issue
          },
        },
        // use: {
        //   loader: 'ts-loader',
        //   options: {
        //     compilerOptions: {
        //       noEmit: false, // this option will solve the issue
        //     },
        //   },
        // },
      },
      {
        test: /\.css$/i,
        use: [stylesHandler, 'css-loader'],
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
        type: 'asset',
      },

      // Add your rules for custom modules here
      // Learn more about loaders from https://webpack.js.org/loaders/
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js', '...'],
    fallback: {
      // Here paste
      process:false,
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify'),
    },
  },
};

module.exports = () => {
  if (isProduction) {
    config.mode = 'production';

    config.plugins.push(new MiniCssExtractPlugin());
  } else {
    config.mode = 'development';
  }

  return config;
};
