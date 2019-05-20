// eslint-disable-next-line import/no-extraneous-dependencies
const path = require('path');
const WorkerPlugin = require('worker-plugin');

module.exports = {
  entry: {
    app: './src/App.js',
    worker: './src/utils/resize.js',
  },
  output: {
    path: path.join(process.cwd(), 'dist'),
    filename: '[name].bundle.js',
    chunkFilename: '[id].chunk.js',
  },
  module: {
    rules: [
      {
        test: /\.resize\.js$/,
        use: { loader: 'worker-loader' },
      },
    ],
  },
  plugins: [new WorkerPlugin()],
};
