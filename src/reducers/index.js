import { combineReducers, createStore } from 'redux';
import viewModes from './viewModes';
import fileSystem from './fileSystem';

const reducer = combineReducers({
  viewModes,
  fileSystem,
});

let tempStore;
if (process.env.NODE_ENV === 'development') {
  tempStore = createStore(
    reducer,
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
  );
} else {
  tempStore = createStore(reducer);
}

export const store = tempStore;
