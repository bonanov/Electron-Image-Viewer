/* eslint no-restricted-globals: ["error", "event"] */
const sharp = require('sharp');
// $(npm bin)/webpack src/resizeWindow/app.js -o src/resizeWindow/bundle.js

// export default () => {
const resizeImage = ({ path, width, height }) => {
  const pngBase64Prefix = 'data:image/png;base64,';
  sharp(path)
    .resize(width, height, {
      fit: sharp.fit.inside,
      kernel: sharp.kernel.lanczos3,
      withoutEnlargement: true,
    })
    .png({ compressionLevel: 0 })
    .toBuffer()
    .then(data => {
      const base64 = data.toString('base64');
      console.log(base64);
      return pngBase64Prefix + base64;
    })
    // eslint-disable-next-line prefer-promise-reject-errors
    .catch(err => console.log(err));
};

addEventListener('message', async e => {
  // eslint-disable-line no-restricted-globals
  console.log(e);
  if (!e) return;
  const { type } = e.data;
  console.log(type);
  switch (type) {
    case 'RESIZE_MESSAGE': {
      console.log('ke');
      const base64 = await new Promise((resolve, reject) =>
        resizeImage(e.data)
      );
      return postMessage(base64);
    }
    default:
      break;
  }
});
// };
