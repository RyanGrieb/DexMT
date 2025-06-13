const path = require("path");

module.exports = {
  mode: process.env.NODE_ENV === "production" ? "production" : "development",
  entry: "./static/ts-front-end/app.ts",
  output: {
    filename: "app.bundle.js",
    path: path.resolve(__dirname, "static/js-compiled"),
    publicPath: "/js/",
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: {
          loader: "ts-loader",
          options: {
            configFile: "tsconfig.frontend.json",
          },
        },
      },
      {
        enforce: "pre",
        test: /\.js$/,
        use: "source-map-loader",
      },
    ],
  },
  devtool: "source-map",
};
