import sharp from 'sharp';
import gm from 'gm';
import fs from 'fs';
import path from 'path';
import { ExifImage } from 'exif';
import { FILE_EXT, FILE_TYPES } from '../constants/fileTypes';

const setImmediate = require('setimmediate');

const { ipcRenderer } = window.electron;

// const ExifImage = require('exif').ExifImage;

export const getExif = async image => {
  const promise = await new Promise(resolve => {
    // eslint-disable-next-line no-new
    new ExifImage({ image }, (err, data) => {
      if (err) return resolve({ err });
      resolve(data);
    });
  });
  return promise;
};

export const blurImage = async ({ fullPath, width, height }) => {
  const prefix = 'data:image/jpeg;base64,';
  const base64 = await new Promise((resolve, reject) => {
    sharp(fullPath)
      .resize(Math.round(width), height, {
        fit: sharp.fit.fill,
        kernel: sharp.kernel.nearest,
        withoutEnlargement: true,
      })
      .blur(15)
      .png({ compressionLevel: 0 })
      // .jpeg({
      //   quality: 100,
      //   chromaSubsampling: '4:4:4',
      // })
      .toBuffer()
      .then(data => resolve(prefix + data.toString('base64')))
      // eslint-disable-next-line prefer-promise-reject-errors
      .catch(err => reject(err));
  });
  return base64;
};

export const resizeImage = async ({ fullPath, width, height }) => {
  const prefix = 'data:image/png;base64,';
  const base64 = await new Promise((resolve, reject) => {
    sharp(fullPath)
      .resize(Math.round(width), Math.round(height), {
        fit: sharp.fit.inside,
        kernel: sharp.kernel.lanczos3,
        withoutEnlargement: true,
      })
      .png({ compressionLevel: 0 })
      .toBuffer()
      .then(data => resolve([new Uint8Array(data)]))
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

const isSupportedType = type => !!FILE_TYPES.includes(type.toLowerCase());

const filterFileList = list => {
  const newList = list.filter(item => isSupportedType(item.type));
  return newList;
};

const getFileType = name => name.replace(FILE_EXT, '$1');

const formatFileObject = async (fileNameList, dir) => {
  const fileList = [];
  await fileNameList.forEach(async fileName => {
    const { size, mtimeMs, atimeMs, ctimeMs } = await fs.statSync(
      path.join(dir, fileName)
    );
    const id = Math.floor(Math.random() * Date.now());
    const type = getFileType(fileName);
    const object = {
      fileName,
      fullPath: path.normalize(path.join(dir, fileName)),
      url: '',
      dir,
      size,
      mtime: mtimeMs,
      atime: atimeMs,
      ctime: ctimeMs,
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
    fs.readdir(dir, async (err, fileList) => {
      const list = await formatFileObject(fileList, dir);
      // ipcRenderer.send('asynchronous-message', { type: 'LOG', data: dir });
      const listFiltered = await filterFileList(list);
      // ipcRenderer.send('asynchronous-message', { type: 'LOG', data: listFiltered });
      resolve(listFiltered);
    });
  });
  return files;
};
