import React, { Component } from 'react';
import { connect } from 'react-redux';
import { toast } from 'react-toastify';
import { throttle, clone } from 'lodash';
import FastAverageColor from 'fast-average-color';
import ImageContainer from './Image';
import { handleResizeImage, getFileProps } from '../utils/imageProcessing';
import * as types from '../constants/actionTypes';
import * as message from '../constants/asyncMessages';
import { formatFullPath, formatPath } from '../utils/base';
import {
  getCurrentFilePath,
  getCurrentFile,
  getInitialFile,
  getFileSystem,
  getClosestNFiles,
  getViewModes,
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
    this.onResize = throttle(this.handleResize, 500);
  }

  componentDidMount() {
    window.addEventListener('resize', this.onResize);

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
    const { fileList, currentPosition } = this.props.fileSystem;
    const currentFile = fileList[currentPosition];
    const newPosition = prevProps.fileSystem.currentPosition;
    const prevFile = prevProps.fileSystem.fileList[newPosition];
    if (!prevFile || !currentFile) return;

    if (prevFile.fullPath !== currentFile.fullPath) {
      this.handleFileChange();
    }
  }

  handleFileChange() {
    const currentFile = getInitialFile();
    const { type } = currentFile;

    this.handleBlur();
    this.setState({ base64: '' });
    this.handleProps();
    this.handleScale();
    if (type !== 'gif') this.handleResize();
  }

  handleScale = () => {
    const { zoomMode } = getViewModes();
    const { fileProps } = getCurrentFile();
    const { updateScale } = this.props;
    if (zoomMode !== 2) return;
    const image = this.imageEl.querySelector('.image-inner');
    const elementWidth = image.offsetWidth;
    const scale = fileProps.width / elementWidth;
    updateScale(scale);
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
    const fullPath = getCurrentFilePath();
    if (!fullPath) return;

    const { innerHeight: height, innerWidth: width } = window;
    const aspect = Math.round(width / height);
    const newMessage = {
      fullPath,
      width,
      height,
    };
    ipcRenderer.send(
      'asynchronous-message',
      message.getBlured({ ...newMessage, width: 200, height: 200 / aspect })
    );
  };

  setBlur = ({ base64, fullPath: path }) => {
    const fullPath = getCurrentFilePath();
    if (!fullPath) return;
    if (path !== fullPath) return;
    // updateBase64(base64);
    // TODO: store blured image in store as a blob
    this.setState({ base64Bg: base64 });
  };

  handleResize = () => {
    const fullPath = getCurrentFilePath();
    if (!fullPath) return;
    const { innerHeight: height, innerWidth: width } = window;
    const aspect = Math.round(width / height);
    const newMessage = {
      fullPath,
      width,
      height,
    };
    ipcRenderer.send('asynchronous-message', message.getResized(newMessage));
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
    const { updateFileProps, onFileError, updateFileList } = this.props;
    const { fileList, currentPosition } = getFileSystem();
    const fullPath = getCurrentFilePath();
    if (!fullPath) return;

    const { width, height, aspect, err, fullPath: path } = data;

    if (err) {
      // toast.error(err.message);
      onFileError(fullPath);
      return;
    }

    const proppedFile = fileList.find(file => file.fullPath === data.fullPath);
    const position = fileList.indexOf(proppedFile);
    const clonedList = clone(fileList);
    // if (clonedList[position].fileProps) return;
    clonedList[position].fileProps = { width, height, aspect };
    updateFileList(clonedList);
  };

  setResized = ({ base64, fullPath: path }) => {
    const fullPath = getCurrentFilePath();
    if (!fullPath) return;
    if (path !== fullPath) return;
    this.setState({ base64 });
  };

  handleRef = ref => {
    const { onRef } = this.props;
    onRef(ref);
    this.imageEl = ref;
  };

  render() {
    const { onRef } = this.props;
    const { base64, base64Bg } = this.state;
    const { currentFile } = this.props.fileSystem;
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
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(FileHandler);
