import * as types from '../constants/actionTypes';

const initialState = {
  undoRemove: true,
  settings: false,
};

const popups = (state = initialState, action) => {
  switch (action.type) {
    case types.TOGGLE_POPUP:
      return { ...state, [action.payload]: !state[action.payload] };

    case types.REMOVE_POPUP:
      return { ...state, [action.payload]: false };

    case types.ADD_POPUP:
      return { ...state, [action.payload]: true };

    default:
      return state;
  }
};

export default popups;
