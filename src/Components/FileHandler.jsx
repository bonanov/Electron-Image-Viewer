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
  }

  componentDidMount() {
    window.addEventListener('resize', throttle(this.handleResize, 200));

    ipcRenderer.on('asynchronous-message', (event, arg) => {
      const { type, data } = arg;
      switch (type) {
        case 'SEND_PROPS': {
          this.setProps(data);
          break;
        }

        case 'SEND_RESIZED': {
          this.setResized(data);
          break;
        }

        case 'SEND_BLURED': {
          this.setBlur(data);
          break;
        }

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
    if (!currentFile) return;
    if (!prevFile || prevFile.fullPath !== currentFile.fullPath) {
      this.handleFileChange();
    }
  }

  handleFileChange = async () => {
    const { updateCurrentBlob } = this.props;
    const currentFile = getInitialFile();
    const { type } = currentFile;
    this.handleProps();
    this.handleBlur();
    updateCurrentBlob('');
    this.handleScale();
    if (type !== 'gif') this.handleResize();
  };

  handleScale = () => {
    const { zoomMode } = getViewModes();
    const { fileProps } = getCurrentFile();
    const { updateScale } = this.props;
    if (!fileProps) return;
    if (zoomMode !== 2) return;
    if (this.imageEl) return;
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
    return;
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
    // const { fullPath, blurBlob } = getCurrentFilePath();
    const { fileList } = getFileSystem();
    const { updateFileList } = this.props;
    // if (!fullPath) return;
    // if (path !== fullPath) return;
    // updateBase64(base64);
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

    // We have to keep reference to our blob and cleaning
    // to prevent memory from leaking
    URL.revokeObjectURL(this.blob);
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
    return (
      <ImageContainer
        base64Bg={base64Bg}
        base64={base64}
        onRef={this.handleRef}
      />
    );
  }
}

const mapStateToProps = state => ({
  fileSystem: state.fileSystem,
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
