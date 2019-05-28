// // eslint-disable-next-line import/no-extraneous-dependencies
const path = require('path');
// const sharp = require('sharp');
// const WorkerPlugin = require('worker-plugin');

module.exports = {
  externals: ['sharp', 'gm', 'fs', 'process'],
  target: 'node',
  resolve: {
    extensions: ['.js', '.node'],
  },

  //   entry: {
  //     app: './src/resizeWindow/app.js',
  //     resize: './src/utils/resize.js',
  //   },
  //   output: {
  //     path: path.join(process.cwd(), 'dist'),
  //     filename: '[name].bundle.js',
  //     chunkFilename: '[id].chunk.js',
  //   },
  //   module: {
  //     rules: [
  //       {
  //         test: /\.resize\.js$/,
  //         use: { loader: 'worker-loader' },
  //       },
  //     ],
  //   },
  //   plugins: [new WorkerPlugin()],
};
