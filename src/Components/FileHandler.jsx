import React, { Component } from 'react';
import { connect } from 'react-redux';
import { toast } from 'react-toastify';
import ImageContainer from './Image';
import { handleResizeImage, getFileProps } from '../utils/imageProcessing';
import * as types from '../constants/actionTypes';
import * as message from '../constants/asyncMessages';

const { ipcRenderer } = window.electron;

class FileHandler extends Component {
  state = {
    base64: '',
  };

  componentDidMount() {
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

        default:
          break;
      }
    });
  }

  componentDidUpdate(prevProps, prevState) {
    const { fileList, currentPosition } = this.props.fileSystem;
    const currentFile = fileList[currentPosition];
    const newPosition = prevProps.fileSystem.currentPosition;
    const prevFile = prevProps.fileSystem.fileList[newPosition];
    if (!prevFile || !currentFile) return;
    if (prevFile.fullPath !== currentFile.fullPath) {
      const { updateBase64 } = this.props;
      // updateBase64('');
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ base64: '' });
      // this.setProps();
      this.handleProps();
      this.handleResize();
    }
  }

  handleProps = () => {
    const { fileList, currentPosition } = this.props.fileSystem;
    const currentFile = fileList[currentPosition];
    if (!currentFile) return;
    const { fullPath } = currentFile;
    if (!fullPath) return;

    ipcRenderer.send('asynchronous-message', message.getProps(fullPath));
  };

  handleResize = () => {
    const { fileList, currentPosition } = this.props.fileSystem;
    const currentFile = fileList[currentPosition];
    if (!currentFile) return;
    const { fullPath } = currentFile;
    if (!fullPath) return;
    const { innerHeight: height, innerWidth: width } = window;

    const newMessage = {
      path: fullPath,
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
    await updateFileProps(fileProps);
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

  // setProps = async () => {
  //   const { fileList, currentPosition } = this.props.fileSystem;
  //   const { updateFileProps, onFileError } = this.props;
  //   const currentFile = fileList[currentPosition];
  //   if (!currentFile) return;
  //   const { fullPath } = currentFile;
  //   if (!fullPath) return;

  //   const props = await getFileProps(fullPath);
  //   const { width, height, aspect, err } = props;
  //   if (err) {
  //     // toast.error(err.message);
  //     onFileError(currentFile.fullPath);
  //     return;
  //   }
  //   const fileProps = { width, height, aspect };
  //   await updateFileProps(fileProps);
  //   this.handleResize();
  // };

  // handleResize = async () => {
  //   // return;
  //   const { fileList, currentPosition } = this.props.fileSystem;
  //   const currentFile = fileList[currentPosition];
  //   if (!currentFile) return null;
  //   const { fullPath } = currentFile;
  //   const { updateBase64 } = this.props;
  //   if (currentFile.type === 'gif') return;
  //   let base64 = await handleResizeImage(fullPath);

  //   // Check if image did not change
  //   const newFile = this.props.fileSystem.currentFile;
  //   if (base64 && fullPath === newFile.fullPath) {
  //     updateBase64(base64);
  //   }
  //   base64 = null;
  // };

  render() {
    const { base64 } = this.state;
    const { currentFile } = this.props.fileSystem;
    return (
      <ImageContainer base64={base64} onRef={ref => (this.imageEl = ref)} />
    );
  }
}

const mapStateToProps = state => ({
  fileSystem: state.fileSystem,
});

const mapDispatchToProps = {
  updateFileList: payload => ({ type: types.UPDATE_FILELIST, payload }),
  updateDir: payload => ({ type: types.UPDATE_DIR, payload }),
  updateCurrentFile: payload => ({ type: types.UPDATE_CURRENT_FILE, payload }),
  updateFileProps: payload => ({ type: types.UPDATE_FILE_PROPS, payload }),
  updateBase64: payload => ({ type: types.UPDATE_BASE64, payload }),
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(FileHandler);
