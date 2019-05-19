import React, { Component } from 'react';
import { toast } from '../../node_modules/react-toastify';
import { fileTypes } from '../constants/fileTypes';
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
    if (!firstItem) return;
    // const entry = firstItem.webkitGetAsEntry();
    // const isDirectory = entry.isDirectory;
    // if (isDirectory) {
    //   this.handleDirectoryDrop(entry);
    //   return;
    // }

    if (files.length) {
      this.handleFiles(files);
    }
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
    // fs.readdir(item, (err, fileList) => {
    //   if (err) return toast.error(err);

    //   const newList = fileList.find(f =>
    //     fileTypes.includes(f.replace(FILE_EXT, '$1'))
    //   );
    //   const firstElement = newList[0];
    //   const dirReader = item.createReader();
    //   dirReader.readEntries(function(entries) {
    //     for (let i = 0; i < entries.length; i++) {
    //       traverseFileTree(entries[i], item + item.name + '/');
    //     }
    //   });
    //   if (firstElement) {
    //     this.handleFiles(firstElement);
    //   }
    // });
  };

  handleFiles = files => {
    const { onDrop } = this.props;
    const file = files[0];

    // Accept only "image" prefix
    const prefix = /.*\//;
    console.log(file);
    let fileList = [];
    fileList = [...files].filter(f =>
      fileTypes.includes(f.type.replace(prefix, '.'))
    );

    // type = type.replace(prefix, '.');
    // const acceptableType = fileTypes.includes(type);
    // if (!acceptableType) return toast.error('Not acceptable file');
    if (!fileList.length) return toast.error('Not acceptable file');
    onDrop(fileList);
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
