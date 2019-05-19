import React, { Component } from 'react';

import { toast } from 'react-toastify';
import { connect } from 'react-redux';
import { cloneDeep } from 'lodash';
import * as types from '../constants/actionTypes';
import 'react-toastify/dist/ReactToastify.css';
import DropArea from './DropArea';
import { shuffleFunc } from '../utils/base';
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
    const { updateDir, updateCurrentFile } = this.props;

    updateDir(dir);
    updateCurrentFile(list[0]);
    const callback = this.setPosition;
    if (handleDir) this.initializeDirectory(dir, callback);
    if (!handleDir) this.initializeFileList(list, callback);
  };

  handleShuffle = async () => {
    const { viewModes, fileSystem } = this.props;
    const { toggleShuffle, updateFileList, updateFileSystem } = this.props;
    const { shuffle } = viewModes;
    const { fileList } = fileSystem;

    let newList = [];
    if (!shuffle) {
      this.fileList = fileList;
      const clone = cloneDeep(this.fileList);
      newList = await shuffleFunc(clone);
    }

    if (shuffle) {
      newList = await cloneDeep(this.fileList);
    }
    await toggleShuffle();
    // await updateFileList(newList);
    this.setPosition({ fileList: newList });
  };

  setPosition = (objects?) => {
    const { fileSystem, updatePosition, updateFileSystem } = this.props;
    const { fileList: list, currentFile } = fileSystem;
    const fileList = objects && objects.fileList ? objects.fileList : list;
    const isSamePath = f => f.fullPath === currentFile.fullPath;
    const fileObject = fileList.find(file => isSamePath(file));

    const currentPosition = fileList.indexOf(fileObject);
    updatePosition(currentPosition);
    updateFileSystem({ currentPosition, ...objects });
  };

  initializeFileList = (fileList, callback?) => {
    const { updateFileList } = this.props;
    const listFiltered = this.filterFileList(fileList);
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

  // destructFilePath = filePath => {
  //   const dirName = path.dirname(filePath);
  //   const fileName = path.basename(filePath);
  //   return {
  //     dirName,
  //     fileName,
  //   };
  // };

  render() {
    const { fileSystem } = this.props;
    const { currentFile } = fileSystem;
    return (
      <React.Fragment>
        <DropArea onDrop={this.handleFiles} />
        <FileHandler
          // imageEl={this.imageEl}
          currentFile={currentFile}
        />

        <GUI
          onShuffle={this.handleShuffle}
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
  updateFileSystem: payload => ({ type: types.UPDATE_FILESYSTEM, payload }),
  toggleShuffle: () => ({ type: types.TOGGLE_SHUFFLE }),
  updateDir: payload => ({ type: types.UPDATE_DIR, payload }),
  updateCurrentFile: payload => ({ type: types.UPDATE_CURRENT_FILE, payload }),
  updatePosition: payload => ({ type: types.UPDATE_CURRENT_POSITION, payload }),
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(FSInterface);
