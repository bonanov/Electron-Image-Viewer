import { toast } from 'react-toastify';
import { resizeConf } from '../constants/configs';

const gm = window.gm;
const sharp = window.sharp;

export const getFileProps = async filePath => {
  const size = await getFileSize(filePath);
  const { width, height } = size;
  const aspect = width / height;

  return { width, height, aspect };
};

const getFileSize = async dir => {
  const fileSize = await new Promise((resolve, reject) => {
    gm(dir).size(async (err, size) => {
      if (err) return reject(err);
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

const resizeImageMain = async (path, { width, height }) => {
  const pngBase64Prefix = 'data:image/png;base64,';
  const promise = await new Promise((resolve, reject) => {
    sharp(path)
      .resize(width, height, resizeConf)
      .png({ compressionLevel: 0 })
      .toBuffer()
      .then(data => {
        const base64 = pngBase64Prefix + data.toString('base64');
        resolve({ base64, err: null });
      })
      // eslint-disable-next-line prefer-promise-reject-errors
      .catch(err => reject({ base64: null, err }));
  });

  return promise;
};
