import * as types from '../constants/actionTypes';

const initialState = {
  undoRemove: false,
};

const popups = (state = initialState, action) => {
  if (action.type === types.TOGGLE_POPUP) {
    const name = action.payload;
    return { ...state, [name]: !state[name] };
  }

  if (action.type === types.REMOVE_POPUP) {
    const name = action.payload;
    return { ...state, [name]: false };
  }

  if (action.type === types.ADD_POPUP) {
    const name = action.payload;
    return { ...state, [name]: true };
  }

  return state;
};

export default popups;
