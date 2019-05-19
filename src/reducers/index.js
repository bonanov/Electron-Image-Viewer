import { combineReducers } from 'redux';
import viewModes from './viewModes';
import fileSystem from './fileSystem';

export default combineReducers({
  viewModes,
  fileSystem,
});
