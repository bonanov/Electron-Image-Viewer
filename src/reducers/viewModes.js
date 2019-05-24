import * as types from '../constants/actionTypes';

const initialState = {
  zoomMode: 1,
  shuffle: false,
  uiHidden: false,
  scale: 1,
  bgColor: '#222',
  imagePosition: {
    x: 0,
    y: 0,
  },
};

const viewModes = (state = initialState, action) => {
  if (action.type === types.UPDATE_IMAGE_POSITION) {
    return { ...state, imagePosition: { ...action.payload } };
  }

  if (action.type === types.RESET_IMAGE_POSITION) {
    return { ...state, imagePosition: { x: 0, y: 0 } };
  }

  if (action.type === types.UPDATE_BG_COLOR) {
    return { ...state, bgColor: action.payload };
  }

  if (action.type === types.TOGGLE_ZOOM_MODE) {
    const { zoomMode } = state;
    let newZoomMode;
    switch (zoomMode) {
      case 0:
        newZoomMode = 1;
        break;
      case 1:
        newZoomMode = 2;
        break;
      case 2:
        newZoomMode = 1;
        break;

      default:
        break;
    }
    return { ...state, zoomMode: newZoomMode };
  }

  if (action.type === types.UPDATE_SCALE) {
    return { ...state, scale: action.payload };
  }

  if (action.type === types.TOGGLE_UI_HIDDEN) {
    return { ...state, uiHidden: !state.uiHidden };
  }

  if (action.type === types.HIDE_UI) {
    return { ...state, uiHidden: true };
  }

  if (action.type === types.SHOW_UI) {
    return { ...state, uiHidden: false };
  }

  if (action.type === types.ZOOM_FREE) {
    return { ...state, zoomMode: 0 };
  }

  if (action.type === types.ZOOM_FIT) {
    return { ...state, zoomMode: 1 };
  }

  if (action.type === types.ZOOM_EXPAND) {
    return { ...state, zoomMode: 2 };
  }

  if (action.type === types.TOGGLE_SHUFFLE) {
    return { ...state, shuffle: !state.shuffle };
  }

  if (action.type === types.SET_SHUFFLE) {
    return { ...state, shuffle: action.payload };
  }

  return state;
};

export default viewModes;
