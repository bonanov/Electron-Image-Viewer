import React from 'react';
import ReactDOM from 'react-dom';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import reducer from './reducers/index';
import './index.css';
import App from './App';
import '../node_modules/font-awesome/css/font-awesome.min.css';
import * as serviceWorker from './serviceWorker';

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
ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
