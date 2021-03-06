/* eslint-disable import/no-unresolved */
import { toast } from 'react-toastify';

const { ipcRenderer } = window.electron;
const gm = window.gm;

export const getFileProps = async filePath => {
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

export const handleResizeImage = async path => {
  const { innerHeight: height, innerWidth: width } = window;
  const { base64, err } = await resizeImageMain(path, { width, height });
  if (!err) return base64;
  toast.error(err);
};

const RESIZE_MESSAGE = ({ path, width, height }) => ({
  path,
  width,
  height,
  type: 'RESIZE_MESSAGE',
});

const resizeImageMain = async (path, { width, height }) => {
  // const worker = new Worker('./resize.js', { type: 'module' });
  const pngBase64Prefix = 'data:image/png;base64,';
  const promise = await new Promise((resolve, reject) => {
    // worker.onmessage = ev => console.log(ev);
    const message = RESIZE_MESSAGE({ path, width, height });
    console.log(message);
    // worker.postMessage(message);
  });

  return promise;
};

// const resizeImageMain = async (path, { width, height }) => {
//   const pngBase64Prefix = 'data:image/png;base64,';
//   const promise = await new Promise((resolve, reject) => {
//     sharp(path)
//       .resize(width, height)
//       .png({ compressionLevel: 0 })
//       .toBuffer()
//       .then(data => {
//         const base64 = pngBase64Prefix + data.toString('base64');
//         resolve({ base64, err: null });
//       })
//       // eslint-disable-next-line prefer-promise-reject-errors
//       .catch(err => reject({ base64: null, err }));
//   });

//   return promise;
// };
