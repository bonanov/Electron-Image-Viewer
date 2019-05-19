import React, { Component } from 'react';
import { getFullPath } from '../utils/base';

class ImagePreloader extends Component {
  state = {};

  render() {
    const { currentPosition, amount, dirName, fileList } = this.props;
    if (!amount) return null;
    const nextPos = currentPosition + 1;
    const nextFileName = nextPos > amount ? fileList[0] : fileList[nextPos];
    const nextFilePath = `file://${getFullPath(dirName, nextFileName)}`;
    const prevPos = [currentPosition - 1];
    const prevFileName = prevPos < 0 ? fileList[amount] : fileList[prevPos];
    const prevFilePath = `file://${getFullPath(dirName, prevFileName)}`;
    return (
      <React.Fragment>
        <img alt="" className="preload-image" src={nextFilePath} />
        <img alt="" className="preload-image" src={prevFilePath} />
        <div className="preload-overlay" />
      </React.Fragment>
    );
  }
}

export default ImagePreloader;
