import sharp from 'sharp';
import stackblur from 'stackblur';

import gm from 'gm';

import FastAverageColor from 'fast-average-color';

const fac = new FastAverageColor();

export const getAverageColor = async buffer => {
  const color = fac.getColorFromArray4(buffer);
};

export const blurImage = async ({ fullPath, width, height }) => {
  const pngBase64Prefix = 'data:image/png;base64,';
  const base64 = await new Promise((resolve, reject) => {
    sharp(fullPath)
      .resize(width, height, {
        fit: sharp.fit.fill,
        kernel: sharp.kernel.cubic,
        withoutEnlargement: true,
      })
      .blur(15)
      .png({ compressionLevel: 0 })
      .toBuffer()
      .then(data => resolve(pngBase64Prefix + data.toString('base64')))
      // eslint-disable-next-line prefer-promise-reject-errors
      .catch(err => reject(err));
  });
  return base64;
};

export const resizeImage = async ({ fullPath, width, height }) => {
  const pngBase64Prefix = 'data:image/png;base64,';
  const base64 = await new Promise((resolve, reject) => {
    sharp(fullPath)
      .resize(width, height, {
        fit: sharp.fit.inside,
        kernel: sharp.kernel.lanczos3,
        withoutEnlargement: true,
      })
      .png({ compressionLevel: 0 })
      .toBuffer()
      .then(data => resolve(pngBase64Prefix + data.toString('base64')))
      // eslint-disable-next-line prefer-promise-reject-errors
      .catch(err => reject(err));
  });
  return base64;
};

export const getFileProps = async filePath => {
  const size = await getFileSize(filePath);

  const { width, height, err } = size;
  const aspect = width / height;

  return { width, height, aspect, err, fullPath: filePath };
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
