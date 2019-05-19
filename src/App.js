import React, { Component } from 'react';
import './App.css';

import { throttle } from 'lodash';
import { ToastContainer, toast } from '../node_modules/react-toastify';
import Image from './Components/Image';
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

const { remote, nativeImage } = window.electron;
const fs = remote.require('fs');
const path = remote.require('path');
const gm = window.gm;
const sharp = window.sharp;
const { argv } = remote.process;

const { NODE_ENV } = process.env;

class App extends Component {
  constructor() {
    super();
    this.state = {
      amount: 0,
      currentPosition: 0,
      dirName: '',
      fileName: '',
      hidden: false,
      base64: '',
      zoomMode: 1,
      fileList: [],
      randomMode: false,
      fileProps: {
        width: 0,
        height: 0,
      },
    };

    this.imageEl = null;
    this.fileListTemp = [];
    this.updating = false;
    this.resizeImage_ = throttle(this.resizeImage, 300);
    this.timer = null;
    this.hideTimer = null;
  }

  componentDidMount() {
    this.initializeArguments();
    document.addEventListener('keydown', this.handleKey);
    window.addEventListener('resize', this.resizeImage_);
    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('mouseleave', this.handleMouseLeave);
    this.hideTimer = setTimeout(() => {
      this.setState({ hidden: true });
    }, HIDE_TIMEOUT);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKey);
    window.removeEventListener('resize', this.resizeImage_);
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseleave', this.handleMouseLeave);
  }

  handleMouseLeave = () => {
    this.setState({ hidden: true });
  };

  handleMouseMove = e => {
    const { target } = e;
    this.handlePanelsHide(target);
  };

  handlePanelsHide = target => {
    const { hidden } = this.state;
    clearTimeout(this.hideTimer);

    if (hidden) {
      this.setState({ hidden: false });
    }

    if (target.closest(CONTROL_PANEL_SEL)) return;
    this.hideTimer = setTimeout(() => {
      this.setState({ hidden: true });
    }, HIDE_TIMEOUT);
  };

  handleKey = e => {
    const { code } = e;

    let order = 0;
    if (code === 'ArrowRight') order = 1;
    if (code === 'ArrowLeft') order = -1;
    if (order) {
      this.shiftImage(order);
    }
  };

  handleZoomChange = () => {
    const { zoomMode } = this.state;
    let zoom;
    if (zoomMode === 0) zoom = 1;
    if (zoomMode === 1) zoom = 2;
    if (zoomMode === 2) zoom = 1;
    this.setState({ zoomMode: zoom });
  };

  handleZoomMode = mode => {
    this.setState({ zoomMode: mode });
  };

  handleRandomMode = async () => {
    const { randomMode, fileList } = this.state;
    let newList;
    if (!randomMode) {
      this.fileListTemp = fileList.slice(0);
      newList = await shuffle(fileList);
    }

    if (randomMode) {
      newList = this.fileListTemp.slice(0);
    }

    const newState = { randomMode: !randomMode, fileList: newList };
    const callback = this.setCurrentPosition;
    this.setState(newState, callback);
  };

  handleShiftImage = order => this.shiftImage(order);

  shiftImage = order => {
    if (this.updating) return;
    this.updating = true;

    const { amount, currentPosition, fileList } = this.state;

    let newPosition = currentPosition + order;
    if (newPosition > amount) newPosition = 0;
    if (newPosition < 0) newPosition = amount;

    const newFileName = fileList[newPosition];
    const newState = {
      currentPosition: newPosition,
      fileName: newFileName,
      base64: '',
    };

    const callback = () => {
      this.initializeFileProps(this.resizeImage);
    };
    this.setState(newState, callback);

    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.updating = false;
    }, 50);
  };

  initializeFileProps = async (callback?) => {
    const { dirName, fileName } = this.state;
    const filePath = getFullPath(dirName, fileName);
    const props = await getFileProps(filePath);

    const { width, height, aspect, err } = props;
    if (err) return;

    const newState = { fileProps: { width, height, aspect } };
    // const callback = this.resizeImage;
    this.setState(newState, callback);
  };

  resizeImage = async () => {
    // return;
    const { dirName, fileName, fileProps } = this.state;
    const url = getFullPath(dirName, fileName);

    const base64 = await handleResizeImage(url, fileProps);
    // eslint-disable-next-line react/destructuring-assignment
    if (base64 && fileName === this.state.fileName) {
      this.setState({ base64 });
    }
  };

  initializeArguments = async () => {
    // const isDirectory = arg => fs.lstatSync(arg).isDirectory();

    const dirExist = dir => fs.existsSync(dir);
    const isFile = arg => fs.lstatSync(arg).isFile();
    const dev = NODE_ENV === 'development';
    argv.forEach(async (ar, i) => {
      const existD = await dirExist(ar);
      if (!existD) return;
      const existF = await isFile(ar);
      if (!existF) return;

      if (dev && i > 1) return this.handleFileOpen(ar);
      if (!dev && i > 0) return this.handleFileOpen(ar);
    });
  };

  handleDrop = files => {
    const firstFile = files[0].path;
    if (files.length <= 1) {
      return this.handleFileOpen(firstFile, false);
    }
    this.handleFileOpen(firstFile, true);
    const formatedFileList = [];
    files.map(file => formatedFileList.push(file.name));
    this.handleFileList(formatedFileList);
  };

  handleFileOpen = (fullPath, skipDir = false) => {
    const { dirName, fileName } = destructFilePath(fullPath);

    const callback = () => {
      this.initializeFileProps(this.resizeImage);
    };
    this.setState({ dirName, fileName }, callback);

    if (!skipDir) this.initializeDirectory(dirName);
  };

  initializeDirectory = dirName => {
    fs.readdir(dirName, (err, fileList) => {
      if (err) return toast.error(err);
      this.handleFileList(fileList);
    });
  };

  handleFileList = list => {
    const fileListFiltered = list.filter(file =>
      fileTypes.includes(file.replace(FILE_EXT, '$1'))
    );

    const amount = fileListFiltered.length - 1;
    this.setState({ fileList: fileListFiltered, amount }, () => {
      this.setCurrentPosition();
    });
  };

  setCurrentPosition = () => {
    const { dirName, fileName, fileList } = this.state;
    const currentPosition = fileList.indexOf(fileName);
    this.setState({ currentPosition });
  };

  destructFilePath = filePath => {
    const dirName = path.dirname(filePath);
    const fileName = path.basename(filePath);
    return {
      dirName,
      fileName,
    };
  };

  render() {
    const { base64, zoomMode, fileProps, randomMode, hidden } = this.state;
    const { width, height } = fileProps;
    const { amount, currentPosition, fileName, fileList, dirName } = this.state;
    const filesExists = !!fileList.length;
    const filePath = `${formatPath(getFullPath(dirName, fileName))}`;
    return (
      <React.Fragment>
        {<DropArea onDrop={this.handleDrop} />}
        <ToastContainer />
        {filesExists && (
          <React.Fragment>
            <PositionPanel
              hidden={hidden}
              amount={amount}
              currentPosition={currentPosition}
            />
            <ControlPanel
              onShiftImage={this.handleShiftImage}
              onZoomChange={this.handleZoomChange}
              zoomMode={zoomMode}
              randomMode={randomMode}
              hidden={hidden}
              onRandomModeChange={this.handleRandomMode}
            />
          </React.Fragment>
        )}
        {filePath && (
          <Image
            ref={ref => (this.imageEl = ref)}
            zoomMode={zoomMode}
            base64={base64}
            path={filePath}
            width={width}
            height={height}
            onZoomModeChange={this.handleZoomMode}
          />
        )}
        <ImagePreloader
          currentPosition={currentPosition}
          dirName={dirName}
          amount={amount}
          fileList={fileList}
        />
      </React.Fragment>
    );
  }
}

export default App;
