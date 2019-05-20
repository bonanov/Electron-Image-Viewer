import React, { Component } from 'react';
import { toast } from '../../node_modules/react-toastify';
import { FILE_TYPES, SUPPORTED_EXTENSIONS } from '../constants/fileTypes';
import { FILE_EXT } from '../constants/base';

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
    startEvents.map(ev =>
      document.addEventListener(ev, this.handleDropStart, false)
    );
    endEvents.map(ev =>
      document.addEventListener(ev, this.handleDropEnd, false)
    );
  }

  componentWillUnmount() {
    const { startEvents, endEvents } = this;
    startEvents.map(ev =>
      document.removeEventListener(ev, this.handleDropStart, false)
    );
    endEvents.map(ev =>
      document.removeEventListener(ev, this.handleDropEnd, false)
    );
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
      this.onTextDrop(droppedText);
      return;
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
      handleDir: true,
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
      fileList.handleDir = false;
    }
    onDrop(fileList);
  };

  isSupportedType = type => !!FILE_TYPES.includes(type);

  formatFileObject = file => {
    const dir = file.path.replace(file.name, '');
    const type = file.type.replace('image/', '');
    // const supportedFile = this.isSupportedType(type);
    // if (!supportedFile) return;
    const fileObject = {
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

  formatUrlObject = file => {
    const dir = file.path.replace(file.name, '');
    const fileObject = {
      filename: file.name,
      fullPath: '',
      url: file.url,
      dir,
      type: file.type,
      size: '',
      lastModified: '',
      isUrl: true,
    };

    return fileObject;
  };

  // onTextDrop = text => {
  //   const { onLinkDrop } = this.props;
  //   const isSupportedType = text.match(SUPPORTED_EXTENSIONS);
  //   const type = isSupportedType[0];
  //   if (type) {
  //     onLinkDrop(text);
  //     return;
  //     this.handleTextDrop(type);
  //   }
  // };

  // handleTextDrop = type => {};

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
    const { highlight } = this.state;
    const classes = highlight ? 'drop-area drop-area_highlighted' : 'drop-area';
    return (
      <div className={classes}>
        <h1 className="drop-area_title">Drop Files</h1>
      </div>
    );
  }
}

export default DropArea;
