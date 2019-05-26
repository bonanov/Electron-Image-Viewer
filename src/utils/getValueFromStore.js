import { clone } from 'lodash';
import { store as _store } from '../reducers';
import { mod } from './base';

const { remote } = window.electron;
const fs = remote.require('fs');

export const getStore = () => _store.getState(_store);

export const getFileSystem = () => getStore().fileSystem;
export const getViewModes = () => getStore().viewModes;
export const getPopups = () => getStore().popups;

export const getInitialFile = () => getFileSystem().currentFile;

export const getFileAtNPosition = n => {
  const { fileList } = getFileSystem();
  const length = fileList.length;
  if (!length) return;
  const position = mod(n, length);
  return fileList[position];
};

export const getCurrentFile = () => {
  const { currentPosition } = getFileSystem();
  return getFileAtNPosition(currentPosition);
};

export const getFileByPath = () => {};

export const getCurrentFilePath = () => {
  const currentFile = getCurrentFile();
  if (!currentFile) return;
  const { fullPath } = currentFile;
  if (!fullPath) return;
  return fullPath;
};

export const getClosestNFiles = n => {
  const { currentPosition } = getFileSystem();
  const array = [];
  for (let i = 1; i < n + 1; i++) {
    array.push(getFileAtNPosition(currentPosition - i));
    array.push(getFileAtNPosition(currentPosition + i));
  }
  return array;
};

export const getFilePositionByPath = path => {
  const { fileList } = getFileSystem();
  const findedFile = fileList.find(file => file.fullPath === path);
  return fileList.indexOf(findedFile);
};

let removedFile;

// TODO: dumb naming
export const removeFileFromList = fullPath => {
  const { fileList } = getFileSystem();
  if (!fileList) return;
  const fileListCloned = clone(fileList);

  const fileToRemove = fileListCloned.find(file => file.fullPath === fullPath);
  const index = fileListCloned.indexOf(fileToRemove);
  removedFile = { file: fileToRemove, position: index };

  return fileListCloned.filter(file => file.fullPath !== fullPath);
};

export const undoFileRemoving = async () => {
  const { trash } = getFileSystem();
  const fileList = new Promise((resolve, reject) => {
    fs.rename(trash.trashPath, trash.initialPath, async err => {
      if (err) reject(err);
      const list = await addFileToList(removedFile);
      resolve(list);
    });
  });
  return fileList;
};

export const addFileToList = ({ file, position }) => {
  const { fileList } = getFileSystem();
  if (!fileList) return;
  const fileListCloned = clone(fileList);
  fileListCloned.splice(position, 0, file);
  return fileListCloned;
};
