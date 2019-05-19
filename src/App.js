import React, { Component } from 'react';
import './App.css';

import { throttle } from 'lodash';
import { ToastContainer, toast } from '../node_modules/react-toastify';
import ImageContainer from './Components/Image';
import {
  getError,
  destructFilePath,
  getFullPath,
  formatPath,
  formatFullPath,
  shuffle,
} from './utils/base';
import 'react-toastify/dist/ReactToastify.css';
import { fileTypes } from './constants/fileTypes';
import { FILE_EXT, HIDE_TIMEOUT, CONTROL_PANEL_SEL } from './constants/base';
import ControlPanel from './Components/ControlPanel';
import ImagePreloader from './Components/ImagePreloader';
import PositionPanel from './Components/PositionPanel';
import DropArea from './Components/DropArea';
import { getFileProps, handleResizeImage } from './utils/imageProcessing';
import FSInterface from './Components/FSInterface';

const { remote, nativeImage } = window.electron;
const fs = remote.require('fs');
const path = remote.require('path');
const gm = window.gm;
const sharp = window.sharp;
const { argv } = remote.process;

const { NODE_ENV } = process.env;

function App() {
  return <FSInterface />;
}

export default App;
