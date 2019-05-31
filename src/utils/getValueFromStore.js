import { clone } from 'lodash';
import { store } from '../reducers';
import { mod } from './base';
import * as types from '../constants/actionTypes';

const { remote } = window.electron;
const fs = remote.require('fs');

export const getStore = () => store.getState();
const dispatch = action => store.dispatch(action);

export const getFileSystem = () => getStore().fileSystem;
export const getViewModes = () => getStore().viewModes;
export const getPopups = () => getStore().popups;
export const getTrash = () => getStore().trash.list;

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

export const getClosestNFiles = (n, onlyNext = false) => {
  const { currentPosition } = getFileSystem();
  const array = [];
  for (let i = 1; i < n + 1; i++) {
    if (!onlyNext) array.push(getFileAtNPosition(currentPosition - i));
    array.push(getFileAtNPosition(currentPosition + i));
  }
  return array;
};

export const getFilePositionByPath = path => {
  const { fileList } = getFileSystem();
  const findedFile = fileList.find(file => file.fullPath === path);
  return fileList.indexOf(findedFile);
};

export const removeFileFromList = fullPath => {
  const { fileList: fileList_, currentPosition } = getFileSystem();
  if (!fileList_) return;
  const fileList = clone(fileList_);

  // const file = fileList.find(f => f.fullPath === fullPath);
  // if (!file) return;
  // const position = fileList.indexOf(file);
  // const removedFile = { file, position };

  const newList = fileList.filter(f => f.fullPath !== fullPath);
  const newPosition = mod(currentPosition, newList.length) || 0;

  dispatch({ type: types.UPDATE_FILELIST, payload: newList });
  dispatch({ type: types.UPDATE_CURRENT_POSITION, payload: newPosition });
};

export const undoFileRemoving = async initialPath => {
  const trash = getTrash();

  const isExactPath = trashed => trashed.file.fullPath === initialPath;
  const trashedFile = trash.find(trashed => isExactPath(trashed));

  if (!trashedFile) return;

  const { trashPath, file, position } = trashedFile;

  const undone = new Promise((resolve, reject) => {
    fs.rename(trashPath, initialPath, async err => {
      if (err) return resolve(err);
      addFileToList({ file, position });
      resolve();
      // resolve(list);
    });
  });
  return undone;
};

export const addFileToList = ({ file, position: position_ }) => {
  const { fileList: fileList_ } = getFileSystem();
  if (!fileList_) return;

  let position = position_;

  const fileList = clone(fileList_);
  if (fileList.length === 0) position = 0;
  fileList.splice(position, 0, file);
  dispatch({ type: types.UPDATE_FILELIST, payload: fileList });
  dispatch({ type: types.UPDATE_CURRENT_POSITION, payload: position });

  return true;
};
