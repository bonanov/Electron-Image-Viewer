import { store as _store } from '../reducers';
import { mod } from './base';

export const getStore = () => _store.getState(_store);

export const getFileSystem = () => getStore().fileSystem;
export const getViewModes = () => getStore().viewModes;

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
