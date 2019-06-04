import React, { Component } from 'react';
import { toast } from '../../node_modules/react-toastify';
import { FILE_TYPES, SUPPORTED_EXTENSIONS } from '../constants/fileTypes';
// import { FILE_EXT } from '../constants/base';

const { remote } = window.electron;
const fs = remote.require('fs');

class DropArea extends Component {
  constructor() {
    super();
    this.state = {
      highlight: false,
    };
    this.startEvents = ['dragenter', 'dragover'];
    this.endEvents = ['dragleave', 'drop'];
  }

  componentDidMount() {
    const { startEvents, endEvents } = this;
    startEvents.map(ev => document.addEventListener(ev, this.handleDropStart, false));
    endEvents.map(ev => document.addEventListener(ev, this.handleDropEnd, false));
  }

  componentWillUnmount() {
    const { startEvents, endEvents } = this;
    startEvents.map(ev => document.removeEventListener(ev, this.handleDropStart, false));
    endEvents.map(ev => document.removeEventListener(ev, this.handleDropEnd, false));
  }

  handleDropStart = e => {
    e.preventDefault();
    const { highlight } = this.state;
    if (!highlight) {
      this.setState({ highlight: true });
    }
  };

  handleDropEnd = e => {
    e.preventDefault();
    this.setState({ highlight: false });

    const { files, items } = e.dataTransfer;
    const firstItem = items[0];
    const droppedText = e.dataTransfer.getData('text');
    // console.log(droppedText);
    if (droppedText) {
      return this.onTextDrop(droppedText);
    }

    if (!firstItem) return;
    if (files.length) {
      this.handleFiles(files);
    }
  };

  // lastModified: 1558258963115
  // lastModifiedDate: Sun May 19 2019 12:42:43 GMT+0300 (Moscow Standard Time) {}
  // name: "D65bMw-VsAEaVto.jpg"
  // path: "/mnt/hdd_1tb/Other/Images/Girls/WJSN/Jiyeon/WJ Stay/D65bMw-VsAEaVto.jpg"
  // size: 241370
  // type: "image/jpeg"

  handleFiles = files => {
    const { onDrop } = this.props;
    const fileList = {
      list: [],
      dir: '',
      omitDir: false,
    };

    [...files].forEach(file => {
      const fileObject = this.formatFileObject(file);
      if (!fileObject) return;
      fileList.list.push(fileObject);
    });

    const firstFile = fileList.list[0];
    if (!firstFile) {
      toast.error('No supported files found');
    }
    fileList.dir = firstFile.dir;
    if (fileList.list.length > 1) {
      fileList.omitDir = true;
    }
    onDrop(fileList);
  };

  // file object
  // fileObject = {
  //   id,
  //   fileName: file.name,
  //   fullPath: file.path,
  //   dir,
  //   type,
  //   size: file.size,
  //   lastModified: file.lastModified,
  //   isUrl: false,
  // };

  formatFileObject = file => {
    const id = Math.floor(Math.random() * Date.now());
    const dir = file.path.replace(file.name, '');
    const type = file.type.replace('image/', '').toLowerCase();
    // const supportedFile = this.isSupportedType(type);
    // if (!supportedFile) return;
    const fileObject = {
      id,
      fileName: file.name,
      fullPath: file.path,
      url: '',
      dir,
      type,
      size: file.size,
      lastModified: file.lastModified,
      isUrl: false,
    };

    return fileObject;
  };

  // formatUrl = url => {
  //   const id = Math.floor(Math.random() * Date.now());
  //   const dir = url.path.replace(file.name, '');
  //   const fileObject = {
  //     id,
  //     fileName: file.name,
  //     fullPath: file.path,
  //     url: '',
  //     dir,
  //     type,
  //     size: file.size,
  //     lastModified: file.lastModified,
  //     isUrl: false,
  //   };

  //   return fileObject;
  // };

  onTextDrop = text => {
    const { onLinkDrop } = this.props;
    const isSupportedType = text.match(SUPPORTED_EXTENSIONS);
    const isLink = /^(http|ftp)(s)?/.test(text);
    if (!isLink || !isSupportedType) return;
    let img = new Image();
    img.onload = () => {
      onLinkDrop(text);
      img = null;
    };
    img.src = text;

    // const type = isSupportedType[0];
    // if (type) {
    //   onLinkDrop(text);
    //   return;
    // this.handleTextDrop(type);
    // }
  };

  handleDirectoryDrop = item => {
    const dirReader = item.createReader();
    dirReader.readEntries((entries, error) => {
      const files = [];
      for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];
        console.log(entry);
        entry.getFile(file => console.log(file));
      }

      this.handleFiles(files);
    });
  };

  render() {
    const { currentFile } = this.props;
    const { highlight } = this.state;

    const classes = highlight ? 'drop-area drop-area_highlighted' : 'drop-area';
    return (
      <div className={classes}>
        {!currentFile && <h1 className="drop-area_title">Drop Files</h1>}
      </div>
    );
  }
}

export default DropArea;
