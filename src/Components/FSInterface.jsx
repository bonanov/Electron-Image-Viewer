import React, { Component } from 'react';

import { connect } from 'react-redux';
import { clone, shuffle as _shuffle } from 'lodash';
import * as types from '../constants/actionTypes';
import 'react-toastify/dist/ReactToastify.css';
import DropArea from './DropArea';
import { FILE_TYPES, FILE_EXT } from '../constants/fileTypes';
import FileHandler from './FileHandler';
// import FilesHandler from './FilesHandler';
import GUI from './GUI';
import * as message from '../constants/asyncMessages';
import {
  getInitialFile,
  getCurrentFile,
  getFileSystem,
  getFileByPath,
  removeFileFromList,
} from '../utils/getValueFromStore';
import { parseArguments, mod } from '../utils/base';

const { ipcRenderer } = window.electron;

const { remote } = window.electron;
const fs = remote.require('fs');

class FSInterface extends Component {
  constructor() {
    super();

    this.fileList = [];
    this.imageEl = null;
    this.updating = false;
    this.timer = null;
    this.hideTimer = null;
  }

  componentDidMount() {
    ipcRenderer.on('asynchronous-message', (event, arg) => {
      const { type, data } = arg;
      switch (type) {
        case 'SEND_FILELIST': {
          this.handleDirectory(data);
          break;
        }

        case 'SEND_ARGUMENTS': {
          this.initializeArguments(data);
          break;
        }

        default:
          break;
      }
    });
    this.initializeArguments();
  }

  initializeArguments = async (args?) => {
    const { resetFileSystem } = this.props;
    resetFileSystem();
    const { argv } = remote.process;
    if (!argv && !args) return;

    const fileList = await parseArguments(args || argv);
    if (!fileList) return;
    this.handleFiles(fileList);
  };

  handleFiles = ({ list, dir, handleDir }) => {
    const { updateDir, updateCurrentFile, setShuffle, clearTrash } = this.props;
    clearTrash();

    updateDir(dir);
    updateCurrentFile(list[0]);
    setShuffle(false);
    const callback = this.findPosition;

    // if (handleDir) this.initializeDirectory(dir, callback);
    if (handleDir) {
      ipcRenderer.send('asynchronous-message', message.getFileList(dir));
    }
    if (!handleDir) this.initializeFileList(list, callback);
  };

  handleDirectory = ({ fileList: oldList }) => {
    const { updateFileList, updatePosition } = this.props;
    const initialFile = getInitialFile();
    const fileList = clone(oldList).sort((a, b) => {
      if (a.mtime < b.mtime) return 1;
      if (a.mtime > b.mtime) return -1;
      return 0;
    });

    const currentFile = fileList.filter(
      file => file.fullPath === initialFile.fullPath
    )[0];
    const currentPosition = fileList.indexOf(currentFile);
    updateFileList(fileList);
    updatePosition(currentPosition);
  };

  handleToggleShuffle = async () => {
    const { viewModes, fileSystem } = this.props;
    const { toggleShuffle } = this.props;
    const { shuffle } = viewModes;
    const { fileList } = fileSystem;

    let newList = [];
    if (!shuffle) {
      this.fileList = fileList;
      newList = await _shuffle(fileList);
    }

    if (shuffle) {
      newList = await this.fileList;
    }

    await toggleShuffle();
    this.findPosition({ fileList: clone(newList) });
  };

  findPosition = (objects?) => {
    const { updateFileSystem } = this.props;
    const list = message.getFileList();
    const currentFile = getCurrentFile();
    const fileList = objects && objects.fileList ? objects.fileList : list;

    const isSamePath = f => f && f.fullPath === currentFile.fullPath;

    const fileObject = fileList.find(file => isSamePath(file));
    if (!fileObject) return;
    const currentPosition = fileList.indexOf(fileObject);
    // updatePosition(currentPosition);
    updateFileSystem({ currentPosition, ...objects });
  };

  initializeFileList = async (fileList, callback?) => {
    const { updateFileList } = this.props;
    const listFiltered = await this.filterFileList(fileList);
    console.log(listFiltered);
    updateFileList(listFiltered);
  };

  // initializeDirectory = (dir, callback?) => {
  //   const { updateFileList } = this.props;
  //   ipcRenderer.send('asynchronous-message', message.getFileList(dir));
  //   fs.readdir(dir, (err, fileList) => {
  //     if (err) return toast.error(err);
  //     const list = this.formatFileObject(fileList, dir);
  //     const listFiltered = this.filterFileList(list);
  //     updateFileList(listFiltered);
  //     if (callback) callback();
  //   });
  // };

  // formatFileObject = (fileNameList, dir) => {
  //   const fileList = [];
  //   fileNameList.forEach(fileName => {
  //     const id = Math.floor(Math.random() * Date.now());
  //     const type = this.getFileType(fileName);
  //     const object = {
  //       fileName: fileName.replace(/\?/g, '%3F'),
  //       fullPath: (dir + fileName).replace(/\?/g, '%3F'),
  //       url: '',
  //       dir: dir.replace(/\?/g, '%3F'),
  //       size: '',
  //       lastModified: '',
  //       isUrl: false,
  //       type,
  //       id,
  //     };
  //     fileList.push(object);
  //   });
  //   return fileList;
  // };

  getFileType = name => name.replace(FILE_EXT, '$1');

  isSupportedType = type => !!FILE_TYPES.includes(type);

  filterFileList = list => {
    const newList = list.filter(item => this.isSupportedType(item.type));
    return newList;
  };

  // TODO: rework! some dumb shit is going on here
  handleFileError = async path => {
    const {
      fileSystem,
      viewModes,
      updateFileList,
      updatePosition,
    } = this.props;
    const isExist = fs.existsSync(path);
    if (isExist) return;

    const { currentPosition } = getFileSystem();
    const currentFile = getFileByPath(path);
    removeFileFromList(currentFile.fullPath);
  };

  render() {
    const { fileSystem } = this.props;
    const currentFile = getCurrentFile();
    return (
      <React.Fragment>
        <DropArea currentFile={currentFile} onDrop={this.handleFiles} />
        <FileHandler
          onRef={ref => (this.imageEl = ref)}
          onFileError={this.handleFileError}
          // imageEl={this.imageEl}
          // currentFile={currentFile}
        />

        <GUI
          imageEl={this.imageEl}
          onShuffle={this.handleToggleShuffle}
          FSInterface={this}
          // onRef={onRef}
        />
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => ({
  fileSystem: state.fileSystem,
  viewModes: state.viewModes,
});

const mapDispatchToProps = {
  updateFileList: payload => ({ type: types.UPDATE_FILELIST, payload }),
  clearTrash: () => ({ type: types.CLEAR_TRASH }),
  resetFileSystem: () => ({ type: types.RESET_FILESYSTEM }),
  toggleShuffle: () => ({ type: types.TOGGLE_SHUFFLE }),
  setShuffle: () => ({ type: types.SET_SHUFFLE }),
  updateFileSystem: payload => ({ type: types.UPDATE_FILESYSTEM, payload }),
  updateDir: payload => ({ type: types.UPDATE_DIR, payload }),
  updateCurrentFile: payload => ({ type: types.UPDATE_CURRENT_FILE, payload }),
  updatePosition: payload => ({ type: types.UPDATE_CURRENT_POSITION, payload }),
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(FSInterface);
