const path = require("path");
const webpack = require("webpack");

const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const TerserWebpackPlugin = require("terser-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const WorkboxPlugin = require("workbox-webpack-plugin");

module.exports = function (_env, argv) {
  const isProduction = argv.mode === "production";
  const isDevelopment = !isProduction;

  return {
    devtool: isDevelopment && "cheap-module-source-map",

    entry: "./src/index.js",
    output: {
      path: path.resolve(__dirname, "dist/"),
      filename: "assets/js/[name].[contenthash:8].js",
      publicPath: "/",
    },

    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /(node_modules|bower_components)/,
          use: {
            loader: "babel-loader",
            options: {
              cacheDirectory: true,
              cacheCompression: false,
              envName: isProduction ? "production" : "development",
            },
          },
        },

        {
          test: /\.worker\.js$/,
          loader: "worker-loader",
        },

        {
          test: /\.css$/,
          use: [
            isProduction ? MiniCssExtractPlugin.loader : "style-loader",
            "css-loader",
          ],
        },

        {
          test: /\.(png|jpg|gif)$/i,
          use: {
            loader: "url-loader",
            options: {
              limit: 8192,
              name: "static/media/[name].[hash:8].[ext]",
            },
          },
        },

        {
          test: /\.svg$/,
          use: ["@svgr/webpack"],
        },

        {
          test: /\.(eot|otf|ttf|woff|woff2)$/,
          loader: require.resolve("file-loader"),
          options: {
            name: "static/media/[name].[hash:8].[ext]",
          },
        },
      ],
    },

    resolve: { extensions: [".js", ".jsx"] },

    plugins: [
      isProduction &&
        new MiniCssExtractPlugin({
          filename: "assets/css/[name].[contenthash:8].css",
          chunkFilename: "assets/css/[name].[contenthash:8].chunk.css",
        }),
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, "public/index.html"),
        inject: true,
      }),
      new webpack.DefinePlugin({
        "process.env.NODE_ENV": JSON.stringify(
          isProduction ? "production" : "development"
        ),
      }),
      new WorkboxPlugin.GenerateSW({
        swDest: "service-worker.js",
        clientsClaim: true,
        skipWaiting: true,
      }),
    ].filter(Boolean),

    optimization: {
      minimize: isProduction,
      minimizer: [
        new TerserWebpackPlugin({
          terserOptions: {
            compress: {
              comparisons: false,
            },
            mangle: {
              safari10: true,
            },
            output: {
              comments: false,
              ascii_only: true,
            },
            warnings: false,
          },
        }),
        new CssMinimizerPlugin(),
      ],
    },

    // devServer: {
    //   contentBase: path.join(__dirname, "public/"),
    //   port: 3000,
    //   publicPath: "http://localhost:3000/dist/",
    //   hotOnly: true,
    // },
    devServer: {
      compress: true,
      historyApiFallback: true,
      open: true,
      overlay: true,
    },
  };
};
