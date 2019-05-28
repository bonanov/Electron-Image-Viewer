import * as types from '../constants/actionTypes';

const initialState = {
  trayIcon: true,
  keepInstance: true,
  preloadImages: true,
  imagesToPreload: 1,
  backgroundBlur: true,
  backgroundColor: false,
  hqResize: true,
};

const config = (state = initialState, action) => {
  switch (action.type) {
    case types.UPDATE_CONFIG:
      return { ...state, ...action.payload };

    default:
      return state;
  }
};

export default config;
