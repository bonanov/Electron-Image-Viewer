import * as types from '../constants/actionTypes';

const initialState = {
  fileList: [],
  currentFile: {},
  currentPosition: 0,
  base64: '',
  dir: '',
};

const fileSystem = (state = initialState, action) => {
  if (action.type === types.UPDATE_FILESYSTEM) {
    return { ...state, ...action.payload };
  }
  if (action.type === types.UPDATE_FILELIST) {
    return { ...state, fileList: action.payload };
  }

  if (action.type === types.UPDATE_CURRENT_FILE) {
    return { ...state, currentFile: action.payload };
  }

  if (action.type === types.UPDATE_BASE64) {
    return { ...state, base64: action.payload };
  }

  if (action.type === types.UPDATE_FILE_PROPS) {
    return {
      ...state,
      currentFile: { ...state.currentFile, fileProps: action.payload },
    };
  }

  if (action.type === types.UPDATE_CURRENT_POSITION) {
    return { ...state, currentPosition: action.payload };
  }

  if (action.type === types.UPDATE_DIR) {
    return { ...state, dir: action.payload };
  }

  return state;
};

export default fileSystem;
