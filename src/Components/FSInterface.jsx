import React, { Component } from 'react';

import { throttle } from 'lodash';
import { ToastContainer, toast } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';
import { HIDE_TIMEOUT, CONTROL_PANEL_SEL } from '../constants/base';
import ControlPanel from './ControlPanel';
import ImagePreloader from './ImagePreloader';
import PositionPanel from './PositionPanel';
import DropArea from './DropArea';
import { getFileProps, handleResizeImage } from '../utils/imageProcessing';
import {
  shuffle,
  getFullPath,
  destructFilePath,
  formatPath,
} from '../utils/base';
import ImageContainer from './Image';
import { FILE_TYPES, FILE_EXT } from '../constants/fileTypes';
import FileHandler from './FileHandler';
// import FilesHandler from './FilesHandler';
import GUI from './GUI';

const { remote, nativeImage } = window.electron;
const fs = remote.require('fs');
const path = remote.require('path');
const gm = window.gm;
const sharp = window.sharp;
const { argv } = remote.process;

const { NODE_ENV } = process.env;

class FSInterface extends Component {
  constructor() {
    super();
    this.state = {
      amount: 0,
      currentFile: {},
      currentPosition: 0,
      dirName: '',
      dir: '',
      fileName: '',
      fullPath: '',
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

    // this.imageEl = null;
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
    const callback = this.setPosition;
    this.setState(newState, callback);
  };

  handleShiftImage = order => this.shiftImage(order);

  shiftImage = order => {
    if (this.updating) return;
    this.updating = true;

    const { amount, currentPosition, fileList } = this.state;
    if (amount === currentPosition) return;
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
      // this.initializeFileProps(this.resizeImage);
    };
    this.setState(newState, callback);

    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.updating = false;
    }, 50);
  };

  // initializeLinkProps = () => {
  //   const self = this;
  //   const { fullPath } = this.state;
  //   const { imageEl } = this.imageEl;
  //   const img = new Image();
  //   img.addEventListener('load', function() {
  //     const height = this.naturalWidth;
  //     const width = imageEl.naturalWidth;
  //     const aspect = width / height;
  //     const newState = { fileProps: { width, height, aspect } };
  //     self.setState(newState);
  //   });
  //   img.src = fullPath;
  // };

  // initializeFileProps = async (callback?) => {
  //   const { dirName, fileName, fullPath } = this.state;
  //   const filePath = getFullPath(dirName, fileName);
  //   const props = await getFileProps(fullPath || filePath);

  //   const { width, height, aspect, err } = props;
  //   if (err) return;

  //   const newState = { fileProps: { width, height, aspect } };
  //   // const callback = this.resizeImage;
  //   this.setState(newState, callback);
  // };

  resizeImage = async () => {
    // return;
    const { dirName, fileName, fileProps } = this.state;
    if (!fileName) return;
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

      if (dev && i > 1) return this.handleFilesOpen(ar);
      if (!dev && i > 0) return this.handleFilesOpen(ar);
    });
  };

  handleFiles = ({ list, dir, handleDir }) => {
    // this.setState({ dir, fileList: list });

    const callback = () => {
      const callback_ = this.setPosition;
      if (handleDir) this.initializeDirectory(dir, callback_);
      if (!handleDir) this.initializeFileList(list, callback_);
    };

    this.setState({ dir, currentFile: list[0] }, callback);
  };

  setPosition = () => {
    const { fileList, currentFile } = this.state;

    const isExactPath = f => f.fullPath === currentFile.fullPath;
    const fileObject = fileList.find(file => isExactPath(file));

    const currentPosition = fileList.indexOf(fileObject);
    this.setState({ currentPosition });
  };

  // handleLinkOpen = url => {
  //   const callback = this.initializeLinkProps;
  //   this.setState({ fullPath: url }, callback);
  // };

  handleFilesOpen = fileList => {
    this.setState({ fileList });
  };

  initializeFileList = (fileList, callback?) => {
    const listFiltered = this.filterFileList(fileList);
    this.setState({ fileList: listFiltered }, callback);
  };

  initializeDirectory = (dir, callback?) => {
    fs.readdir(dir, (err, fileList) => {
      if (err) return toast.error(err);
      const list = this.formatFileObject(fileList, dir);
      const listFiltered = this.filterFileList(list);
      this.setState({ fileList: listFiltered }, callback);
    });
  };

  formatFileObject = (fileNameList, dir) => {
    const fileList = [];
    fileNameList.forEach(fileName => {
      const type = this.getFileType(fileName);
      const object = {
        fileName,
        fullPath: dir + fileName,
        url: '',
        dir,
        size: '',
        lastModified: '',
        isUrl: false,
        type,
      };
      fileList.push(object);
    });
    return fileList;
  };

  getFileType = name => name.replace(FILE_EXT, '$1');

  isSupportedType = type => !!FILE_TYPES.includes(type);

  filterFileList = list => {
    const newList = list.filter(item => this.isSupportedType(item.type));
    return newList;
  };

  // destructFilePath = filePath => {
  //   const dirName = path.dirname(filePath);
  //   const fileName = path.basename(filePath);
  //   return {
  //     dirName,
  //     fileName,
  //   };
  // };

  render() {
    const { base64, zoomMode, fileProps, randomMode, currentFile } = this.state;
    const { width, height } = fileProps;
    const {
      amount,
      currentPosition,
      fileName,
      fileList,
      fullPath,
      dirName,
    } = this.state;
    const filesExists = !!fileList.length || fullPath;
    const filePath = `${formatPath(getFullPath(dirName, fileName))}`;
    return (
      <React.Fragment>
        <DropArea onDrop={this.handleFiles} />
        <FileHandler currentFile={currentFile} />
        <GUI />
      </React.Fragment>
    );
  }
}

export default FSInterface;
