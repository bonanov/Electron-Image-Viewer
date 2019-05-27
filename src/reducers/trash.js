import { clone } from 'lodash';
import * as types from '../constants/actionTypes';
import { mod } from '../utils/base';

const initialState = {
  list: [],
};

const fileSystem = (state = initialState, action) => {
  switch (action.type) {
    case types.UPDATE_TRASH:
      return { list: action.payload };

    case types.SET_TRASH_SEEN: {
      const { list } = state;
      if (!list.length) return state;

      const file = list.find(
        trashed => trashed.file.fullPath === action.payload
      );
      const index = list.indexOf(file);
      const listNew = clone(list);
      if (!listNew[index]) return state;
      listNew[index].seen = true;

      return { list: listNew };
    }

    case types.CLEAR_TRASH:
      return { list: [] };

    case types.ADD_TO_TRASH:
      return { list: [...state.list, action.payload] };

    case types.REMOVE_FROM_TRASH: {
      const list = state.list.filter(el => el.file.fullPath !== action.payload);
      return { list };
    }

    case types.REMOVE_LAST_FROM_TRASH: {
      const list = clone(state.list);
      list.pop();
      return { list };
    }

    case types.REMOVE_FIRST_FROM_TRASH: {
      const list = clone(state.list);
      list.shift();
      return { list };
    }

    default:
      return state;
  }
};

export default fileSystem;
