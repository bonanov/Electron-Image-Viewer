import React, { Component } from 'react';
import { connect } from 'react-redux';
import { toast } from 'react-toastify';
import { throttle } from 'lodash';
import FastAverageColor from 'fast-average-color';
import ImageContainer from './Image';
import { handleResizeImage, getFileProps } from '../utils/imageProcessing';
import * as types from '../constants/actionTypes';
import * as message from '../constants/asyncMessages';
import { formatFullPath, formatPath } from '../utils/base';

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

  getCurrentPath() {
    const { fileList, currentPosition } = this.props.fileSystem;
    const currentFile = fileList[currentPosition];
    if (!currentFile) return;
    const { fullPath } = currentFile;
    if (!fullPath) return;
    return fullPath;
  }

  async componentDidUpdate(prevProps) {
    const { fileList, currentPosition } = this.props.fileSystem;
    const currentFile = fileList[currentPosition];
    const newPosition = prevProps.fileSystem.currentPosition;
    const prevFile = prevProps.fileSystem.fileList[newPosition];
    if (!prevFile || !currentFile) return;
    const { type } = currentFile;
    if (prevFile.fullPath !== currentFile.fullPath) {
      this.handleBlur();
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ base64: '' });
      this.handleProps();
      if (type !== 'gif') this.handleResize();
      // this.handleColor();
    }
  }

  handleColor = () => {
    const { updateBgColor } = this.props;
    const fullPath = this.getCurrentPath();
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

  handleProps = () => {
    const fullPath = this.getCurrentPath();
    if (!fullPath) return;

    ipcRenderer.send('asynchronous-message', message.getProps(fullPath));
  };

  handleBlur = () => {
    const fullPath = this.getCurrentPath();
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

  handleResize = () => {
    const { fileList, currentPosition } = this.props.fileSystem;
    const currentFile = fileList[currentPosition];
    if (!currentFile) return;
    const { fullPath } = currentFile;
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

  setProps = async props => {
    const { fileList, currentPosition } = this.props.fileSystem;
    const { updateFileProps, onFileError } = this.props;
    const currentFile = fileList[currentPosition];
    if (!currentFile) return;
    const { fullPath } = currentFile;
    if (!fullPath) return;

    const { width, height, aspect, err, fullPath: path } = props;

    if (err) {
      // toast.error(err.message);
      onFileError(currentFile.fullPath);
      return;
    }

    const fileProps = { width, height, aspect };
    if (path !== fullPath) return;
    updateFileProps(fileProps);
    // this.handleResize();
  };

  setResized = ({ base64, fullPath: path }) => {
    const { fileList, currentPosition } = this.props.fileSystem;
    const currentFile = fileList[currentPosition];
    if (!currentFile) return;
    const { fullPath } = currentFile;
    if (!fullPath) return;
    if (path !== currentFile.fullPath) return;
    // updateBase64(base64);
    this.setState({ base64 });
  };

  setBlur = ({ base64, fullPath: path }) => {
    const { fileList, currentPosition } = this.props.fileSystem;
    const currentFile = fileList[currentPosition];
    if (!currentFile) return;
    const { fullPath } = currentFile;
    if (!fullPath) return;
    if (path !== currentFile.fullPath) return;
    // updateBase64(base64);
    this.setState({ base64Bg: base64 });
  };

  render() {
    const { onRef } = this.props;
    const { base64, base64Bg } = this.state;
    const { currentFile } = this.props.fileSystem;
    return <ImageContainer base64Bg={base64Bg} base64={base64} onRef={onRef} />;
  }
}

const mapStateToProps = state => ({
  fileSystem: state.fileSystem,
});

const mapDispatchToProps = {
  updateFileList: payload => ({ type: types.UPDATE_FILELIST, payload }),
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
