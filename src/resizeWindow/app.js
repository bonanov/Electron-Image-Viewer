/* eslint no-restricted-globals: ["error", "event"] */
// const sharp = 'sharp';
// const sharp = require('sharp');
import sharp from 'sharp';
import gm from 'gm';
import * as message from '../constants/asyncMessages';

const { ipcRenderer } = window.electron;
ipcRenderer.on('asynchronous-message', async (event, arg) => {
  const { data, type } = arg;
  switch (type) {
    case 'GET_PROPS': {
      const props = await getFileProps(data.fullPath);
      const newProps = { ...props, path: data.fullPath };
      ipcRenderer.send('asynchronous-message', message.sendProps(newProps));
      break;
    }

    case 'GET_RESIZED': {
      const { width, height, fullPath } = data;
      const base64 = await resizeImage({ width, height, path: fullPath });
      const newMessage = { path: fullPath, base64 };
      ipcRenderer.send('asynchronous-message', message.sendResized(newMessage));
      break;
    }

    default:
      break;
  }
  // ipcRenderer.on('asynchronous-reply', () => {});
});

// import sharp from 'sharp';

// export default () => {
const resizeImage = async ({ path, width, height }) => {
  const pngBase64Prefix = 'data:image/png;base64,';
  const base64 = await new Promise((resolve, reject) => {
    sharp(path)
      .resize(width, height, {
        fit: sharp.fit.inside,
        kernel: sharp.kernel.lanczos3,
        withoutEnlargement: true,
      })
      .png({ compressionLevel: 0 })
      .toBuffer()
      .then(data => resolve(pngBase64Prefix + data.toString('base64')))
      // eslint-disable-next-line prefer-promise-reject-errors
      .catch(err => console.log(err));
  });
  return base64;
};

const getFileProps = async filePath => {
  const size = await getFileSize(filePath);
  const { width, height, err } = size;
  const aspect = width / height;

  return { width, height, aspect, err };
};

const getFileSize = async dir => {
  const fileSize = await new Promise((resolve, reject) => {
    gm(dir).size(async (err, size) => {
      if (err) return resolve({ err });
      resolve({ width: size.width, height: size.height });
    });
  });
  return { ...fileSize };
};

// addEventListener('message', async e => {
//   // eslint-disable-line no-restricted-globals
//   console.log(e);
//   if (!e) return;
//   const { type } = e.data;
//   console.log(type);
//   switch (type) {
//     case 'RESIZE_MESSAGE': {
//       console.log('ke');
//       const base64 = await new Promise((resolve, reject) =>
//         resizeImage(e.data)
//       );
//       return postMessage(base64);
//     }
//     default:
//       break;
//   }
// });
// };
