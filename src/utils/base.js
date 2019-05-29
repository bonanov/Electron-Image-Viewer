import { FILE_TYPES, FILE_EXT } from '../constants/fileTypes';

const { remote } = window.electron;
const path = remote.require('path');
const { argv } = remote.process;
const { NODE_ENV } = process.env;
const dev = NODE_ENV === 'development';
const fs = remote.require('fs');

export const getError = callback => {
  try {
    callback();
  } catch (error) {
    return error;
  }
};

export const destructFilePath = filePath => {
  const dirName = path.dirname(filePath) + '/';
  const fileName = path.basename(filePath);
  return {
    dirName,
    fileName,
  };
};

export const shuffleFunc = async array => {
  const copy = [];
  let n = array.length;
  let i;

  // While there remain elements to shuffle…
  while (n) {
    // Pick a remaining element…
    i = Math.floor(Math.random() * array.length);

    // If not already shuffled, move it to the new array.
    if (i in array) {
      copy.push(array[i]);
      delete array[i];
      n--;
    }
  }

  return copy;
};

export const getFullPath = (a, b) => {
  if (a && b) return `${a}/${b}`;
  return '';
};
export const formatPath = a => {
  if (a) {
    return `file://${a}`;
  }
  return '';
};

export const formatFullPath = (a, b) => formatPath(getFullPath(a, b));

export function toggleFullscreen(event) {
  let element = document.body;

  if (event instanceof HTMLElement) {
    element = event;
  }

  const isFullscreen = document.webkitIsFullScreen || document.mozFullScreen || false;

  element.requestFullScreen =
    element.requestFullScreen ||
    element.webkitRequestFullScreen ||
    element.mozRequestFullScreen ||
    function() {
      return false;
    };
  document.cancelFullScreen =
    document.cancelFullScreen ||
    document.webkitCancelFullScreen ||
    document.mozCancelFullScreen ||
    function() {
      return false;
    };

  // eslint-disable-next-line no-unused-expressions
  isFullscreen ? document.cancelFullScreen() : element.requestFullScreen();
}

export const getBlobFromBase64 = async b64Data => {
  // const url = `b64Data`;
  const response = await fetch(b64Data);
  const blob = await response.blob();
  return URL.createObjectURL(blob);
};

export const mod = (n, m) => ((n % m) + m) % m;

export const spinArrayPosition = (arr, position) => mod(position, arr.length);

const isSupportedType = type => !!FILE_TYPES.includes(type.toLowerCase());

const filterFileList = list => {
  const newList = list.filter(item => isSupportedType(item.type));
  return newList;
};

const getFileType = name => name.replace(FILE_EXT, '$1');

const formatFileObject = async list => {
  const fileList = [];
  await list.forEach(async file => {
    const { mtimeMs, atimeMs, ctimeMs } = await fs.statSync(file);
    const id = Math.floor(Math.random() * Date.now());
    const type = getFileType(file);
    const { fileName, dirName } = destructFilePath(file);
    const object = {
      fileName: fileName.replace(/\?/g, '%3F'),
      fullPath: (dirName + fileName).replace(/\?/g, '%3F'),
      url: '',
      dir: dirName.replace(/\?/g, '%3F'),
      size: '',
      mtime: mtimeMs,
      atime: atimeMs,
      ctime: ctimeMs,
      isUrl: false,
      type,
      id,
    };
    fileList.push(object);
  });
  const newList = filterFileList(fileList);
  return newList;
};

const getDirectory = async dir => {
  const files = await new Promise(resolve => {
    fs.readdir(dir, async (err, fileList) => {
      const list = await formatFileObject(fileList, dir);
      const listFiltered = await filterFileList(list);
      resolve(listFiltered);
    });
  });
  return files;
};

const getFiles = arg => {
  const isExist = fs.existsSync(arg);
  if (!isExist) return;
  // const isDirectory = fs.lstatSync(arg).isDirectory();
  const isFile = fs.lstatSync(arg).isFile();
  if (isFile) {
    return arg;
    // console.log(arg);
    // const file = destructFilePath(arg);
    // const type = path.extname(arg);
    // formatFileObject([formatFileObject], file.dirName);
    // console.log(type);
    // console.log(file);
  }
};

export const parseArguments = async args => {
  const fileList = [];
  const parseArgs = {
    list: [],
    dir: '',
    omitDir: false,
  };
  args.forEach(arg => {
    const ar = getFiles(arg);
    if (ar) fileList.push(ar);
  });

  if (!fileList) return parseArgs;
  parseArgs.list = await formatFileObject(fileList);
  const firstFile = parseArgs.list[0];
  if (!firstFile) return parseArgs;
  parseArgs.dir = firstFile.dir;

  return parseArgs;
  // for (let i = 0; i < argv.length; i++) {}
};

// fileObject = {
//   id,
//   fileName: file.name,
//   fullPath: file.path,
//   dir,
//   type,
//   size: file.size,
//   lastModified: file.lastModified,
//   isUrl: false,
// };
