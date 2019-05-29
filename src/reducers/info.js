import * as types from '../constants/actionTypes';

const initialState = {
  exif: [],
};

const info = (state = initialState, action) => {
  switch (action.type) {
    case types.UPDATE_INFO:
      return { ...state, ...action.payload };

    default:
      return state;
  }
};

export default info;
