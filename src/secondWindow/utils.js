import sharp from 'sharp';
import stackblur from 'stackblur';

import gm from 'gm';
import fs from 'fs';

import FastAverageColor from 'fast-average-color';
import { FILE_EXT, FILE_TYPES } from '../constants/fileTypes';

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

const isSupportedType = type => !!FILE_TYPES.includes(type);

const filterFileList = list => {
  const newList = list.filter(item => isSupportedType(item.type));
  return newList;
};

const getFileType = name => name.replace(FILE_EXT, '$1');

const formatFileObject = (fileNameList, dir) => {
  const fileList = [];
  fileNameList.forEach(fileName => {
    const id = Math.floor(Math.random() * Date.now());
    const type = getFileType(fileName);
    const object = {
      fileName: fileName.replace(/\?/g, '%3F'),
      fullPath: (dir + fileName).replace(/\?/g, '%3F'),
      url: '',
      dir: dir.replace(/\?/g, '%3F'),
      size: '',
      lastModified: '',
      isUrl: false,
      type,
      id,
    };
    fileList.push(object);
  });
  return fileList;
};

export const getDirectory = async dir => {
  const files = await new Promise(resolve => {
    fs.readdir(dir, (err, fileList) => {
      const list = formatFileObject(fileList, dir);
      const listFiltered = filterFileList(list);
      resolve(listFiltered);
    });
  });
  return files;
};
