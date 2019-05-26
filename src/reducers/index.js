import { combineReducers, createStore } from 'redux';
import viewModes from './viewModes';
import fileSystem from './fileSystem';
import popups from './popups';

const reducer = combineReducers({
  viewModes,
  fileSystem,
  popups,
});

let tempStore;
if (process.env.NODE_ENV === 'development') {
  tempStore = createStore(
    reducer,
    window.__REDUX_DEVTOOLS_EXTENSION__ &&
      window.__REDUX_DEVTOOLS_EXTENSION__({
        actionsBlacklist: ['SHOW_UI', 'HIDE_UI', 'SET_SCALE'],
      })
  );
} else {
  tempStore = createStore(reducer);
}

export const store = tempStore;
