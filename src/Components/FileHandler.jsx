import React, { Component } from 'react';
import { connect } from 'react-redux';
import { throttle, clone } from 'lodash';
import FastAverageColor from 'fast-average-color';
import ImageContainer from './Image';
import * as types from '../constants/actionTypes';
import * as message from '../constants/asyncMessages';
import { formatPath, getBlobFromBase64 } from '../utils/base';
import {
  getCurrentFilePath,
  getCurrentFile,
  getInitialFile,
  getFileSystem,
  getClosestNFiles,
  getViewModes,
  getFilePositionByPath,
} from '../utils/getValueFromStore';

const fac = new FastAverageColor();

const { remote } = window.electron;
const fs = remote.require('fs');

const { ipcRenderer } = window.electron;

class FileHandler extends Component {
  constructor() {
    super();
    this.state = {
      base64: '',
      base64Bg: '',
    };
    this.imageEl = null;
    this.resizeTimer = null;
  }

  componentDidMount() {
    window.addEventListener('resize', throttle(this.handleResize, 500));
    document.addEventListener('webkitfullscreenchange', this.handleResize);

    ipcRenderer.on('asynchronous-message', (event, arg) => {
      const { type, data } = arg;
      switch (type) {
        case 'SEND_PROPS':
          return this.setProps(data);

        case 'SEND_RESIZED':
          return this.setResized(data);

        case 'SEND_BLURED':
          return this.setBlur(data);

        case 'SEND_EXIF':
          console.log(data);
          return this.setExif(data);

        default:
          break;
      }
    });
  }

  async componentDidUpdate(prevProps) {
    const { fileList, currentPosition } = getFileSystem();
    const currentFile = fileList[currentPosition];
    const newPosition = prevProps.fileSystem.currentPosition;
    const prevFile = prevProps.fileSystem.fileList[newPosition];
    if (!currentFile) return (document.title = 'Bonana Image Viewer');

    if (!prevFile || prevFile.fullPath !== currentFile.fullPath) {
      this.handleFileChange();
    }
  }

  handleFileChange = async () => {
    const { updateCurrentBlob } = this.props;
    const { config: c } = this.props;
    const currentFile = getCurrentFile();
    const { fileName } = currentFile;
    document.title = fileName;
    const { type } = currentFile;
    this.handleProps();

    updateCurrentBlob('');
    if (c.backgroundBlur) this.handleBlur();
    if (c.backgroundColor) this.handleColor();
    if (c.hqResize && type !== 'gif') this.handleResize();
    this.handleScale();
  };

  handleScale = () => {
    const { zoomMode } = getViewModes();
    const { fileProps } = getCurrentFile();
    const { updateScale } = this.props;
    if (!fileProps) return;
    if (zoomMode !== 2) return;
    if (!this.imageEl) return;
    const image = this.imageEl.querySelector('.image-inner');
    const elementWidth = image.offsetWidth;
    const scale = fileProps.width / elementWidth;
    updateScale(scale);
    // this.handleResize();
  };

  handleColor = () => {
    const { updateBgColor } = this.props;
    const fullPath = getCurrentFilePath();
    if (!fullPath) return;

    let image = new Image();
    image.onload = () => {
      const color = fac.getColor(image, {
        mode: 'speed',
        algorithm: 'dominant',
      });
      updateBgColor(color.hex);
      image = null;
    };
    image.src = formatPath(fullPath);
  };

  handleBlur = () => {
    // return;
    const { fullPath, blurBlob } = getCurrentFile();
    if (!fullPath) return;

    const { innerHeight: height, innerWidth: width } = window;
    const aspect = Math.round(width / height);
    const newMessage = {
      fullPath,
      width: 200,
      height: 200 / aspect,
    };

    const closestFiles = getClosestNFiles(1);

    closestFiles.forEach(file => {
      if (file.blurBlob) return;
      ipcRenderer.send(
        'asynchronous-message',
        message.getBlured({ ...newMessage, fullPath: file.fullPath })
      );
    });

    if (blurBlob) return;
    ipcRenderer.send('asynchronous-message', message.getBlured(newMessage));
  };

  setBlur = async ({ base64, fullPath: path }) => {
    // TODO: blob caching causes memory leak
    const { fileList } = getFileSystem();
    const { updateFileList } = this.props;
    const blob = await getBlobFromBase64(base64);

    const position = getFilePositionByPath(path);
    const clonedList = clone(fileList);

    clonedList[position].blurBlob = blob;
    updateFileList(clonedList);

    // this.setState({ base64Bg: base64 });
  };

  handleProps = () => {
    const currentFile = getCurrentFile();
    const fullPath = getCurrentFilePath();
    if (!fullPath) return;

    const closestFiles = getClosestNFiles(1);
    ipcRenderer.send('asynchronous-message', message.getExif(fullPath));
    closestFiles.forEach(file => {
      if (file.fileProps) return;
      ipcRenderer.send('asynchronous-message', message.getProps(file.fullPath));
    });

    if (currentFile.fileProps) return;
    ipcRenderer.send('asynchronous-message', message.getProps(fullPath));
  };

  setProps = async data => {
    const { onFileError, updateFileList } = this.props;
    const { fileList } = getFileSystem();

    const { width, height, aspect, err, fullPath: path } = data;

    if (err) {
      // toast.error(err.message);
      onFileError(data);
      return;
    }

    const position = getFilePositionByPath(path);
    const clonedList = clone(fileList);
    // if (clonedList[position].fileProps) return;
    clonedList[position].fileProps = { width, height, aspect };
    updateFileList(clonedList);
  };

  setExif = ({ exifData, fullPath }) => {
    if (exifData.err) return;

    const { updateFileList } = this.props;
    const { fileList } = getFileSystem();

    const position = getFilePositionByPath(fullPath);
    const clonedList = clone(fileList);
    // if (clonedList[position].fileProps) return;
    const currentProps = clonedList[position].fileProps;
    if (!currentProps) clonedList[position].fileProps = {};
    clonedList[position].fileProps = { ...currentProps, exifData };
    updateFileList(clonedList);
  };

  handleResize = () => {
    const fullPath = getCurrentFilePath();
    if (!fullPath) return;

    const { innerHeight, innerWidth } = window;
    // const image = this.imageEl.querySelector('.image');
    const newMessage = {
      fullPath,
      width: innerWidth,
      height: innerHeight,
    };

    ipcRenderer.send('asynchronous-message', message.getResized(newMessage));
  };

  setResized = async ({ base64, fullPath: path }) => {
    const { updateCurrentBlob } = this.props;
    const blob = await getBlobFromBase64(base64);

    // We have to keep a reference to our blob and cleaning it
    // to prevent from a memory leak
    // URL.revokeObjectURL(this.blob);
    this.blob = blob;
    const fullPath = getCurrentFilePath();
    if (!fullPath) return;
    if (path !== fullPath) return;
    // this.setState({ base64 });
    updateCurrentBlob(blob);
    // updateFileList(clonedList);
  };

  handleRef = ref => {
    const { onRef } = this.props;
    onRef(ref);
    this.imageEl = ref;
  };

  render() {
    const { base64, base64Bg } = this.state;
    return <ImageContainer base64Bg={base64Bg} base64={base64} onRef={this.handleRef} />;
  }
}

const mapStateToProps = state => ({
  fileSystem: state.fileSystem,
  config: state.config,
});

const mapDispatchToProps = {
  updateFileList: payload => ({ type: types.UPDATE_FILELIST, payload }),
  updateScale: payload => ({ type: types.UPDATE_SCALE, payload }),
  updateBgColor: payload => ({ type: types.UPDATE_BG_COLOR, payload }),
  updateDir: payload => ({ type: types.UPDATE_DIR, payload }),
  updateCurrentFile: payload => ({ type: types.UPDATE_CURRENT_FILE, payload }),
  updateFileProps: payload => ({ type: types.UPDATE_FILE_PROPS, payload }),
  updateBase64: payload => ({ type: types.UPDATE_BASE64, payload }),
  updateCurrentBlob: payload => ({ type: types.UPDATE_CURRENT_BLOB, payload }),
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(FileHandler);
