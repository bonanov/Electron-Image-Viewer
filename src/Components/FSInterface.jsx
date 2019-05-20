import React, { Component } from 'react';

import { toast } from 'react-toastify';
import { connect } from 'react-redux';
import { clone, shuffle as _shuffle } from 'lodash';
import * as types from '../constants/actionTypes';
import 'react-toastify/dist/ReactToastify.css';
import DropArea from './DropArea';
import { FILE_TYPES, FILE_EXT } from '../constants/fileTypes';
import FileHandler from './FileHandler';
// import FilesHandler from './FilesHandler';
import GUI from './GUI';

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
    // this.initializeArguments();
  }

  // initializeArguments = async () => {
  // const isDirectory = arg => fs.lstatSync(arg).isDirectory();

  //   const dirExist = dir => fs.existsSync(dir);
  //   const isFile = arg => fs.lstatSync(arg).isFile();
  //   const dev = NODE_ENV === 'development';
  //   argv.forEach(async (ar, i) => {
  //     const existD = await dirExist(ar);
  //     if (!existD) return;
  //     const existF = await isFile(ar);
  //     if (!existF) return;

  //     if (dev && i > 1) return this.handleFilesOpen(ar);
  //     if (!dev && i > 0) return this.handleFilesOpen(ar);
  //   });
  // };

  handleFiles = ({ list, dir, handleDir }) => {
    const { updateDir, updateCurrentFile, setShuffle } = this.props;

    updateDir(dir);
    updateCurrentFile(list[0]);
    setShuffle(false);
    const callback = this.setPosition;
    if (handleDir) this.initializeDirectory(dir, callback);
    if (!handleDir) this.initializeFileList(list, callback);
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
    this.setPosition({ fileList: clone(newList) });
  };

  setPosition = (objects?) => {
    const { fileSystem, updatePosition, updateFileSystem } = this.props;
    const { fileList: list, currentFile } = fileSystem;
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
    updateFileList(listFiltered);
  };

  initializeDirectory = (dir, callback?) => {
    const { updateFileList } = this.props;

    fs.readdir(dir, (err, fileList) => {
      if (err) return toast.error(err);
      const list = this.formatFileObject(fileList, dir);
      const listFiltered = this.filterFileList(list);
      updateFileList(listFiltered);
      if (callback) callback();
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

  // TODO: rework! some dumb shit is going on here
  handleFileError = async path => {
    const {
      fileSystem,
      viewModes,
      updateFileList,
      updatePosition,
    } = this.props;
    const { fileList, currentPosition: i } = fileSystem;
    const { shuffle } = viewModes;
    const fileExists = fs.existsSync(path);
    if (!fileExists) {
      let newList = [];
      if (shuffle) {
        this.fileList = this.fileList.filter(file => file.fullPath !== path);
        newList = this.fileList;
      }

      if (!shuffle) {
        newList = fileList.filter(file => file.fullPath !== path);
      }
      await updateFileList(clone(newList));
      // this.setPosition();
      if (i > fileList.length || i < 0) return updatePosition(0);
      updatePosition(i - 1);
    }
  };

  render() {
    const { fileSystem } = this.props;
    const { currentFile } = fileSystem;
    return (
      <React.Fragment>
        <DropArea onDrop={this.handleFiles} />
        <FileHandler
          onFileError={this.handleFileError}
          // imageEl={this.imageEl}
          currentFile={currentFile}
        />

        <GUI
          onShuffle={this.handleToggleShuffle}
          FSInterface={this}
          imageEl={this.imageEl}
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
