import React, { Component } from 'react';
import { getFullPath } from '../utils/base';

class ImagePreloader extends Component {
  state = {};

  render() {
    const { currentPosition, fileList } = this.props;

    const amount = fileList.length;
    if (!fileList.length) return null;

    const nextPos = currentPosition + 1;
    const prevPos = currentPosition - 1;
    const nextFile = nextPos > amount - 2 ? fileList[0] : fileList[nextPos];
    const prevFile = prevPos < 0 ? fileList[amount - 1] : fileList[prevPos];

    const nextFilePath = `file://${nextFile.fullPath}`;
    const prevFilePath = `file://${prevFile.fullPath}`;

    return (
      <React.Fragment>
        <div className="preload-image_container">
          <img alt="" className="preload-image" src={nextFilePath} />
          <img alt="" className="preload-image" src={prevFilePath} />
          <div className="preload-overlay" />
        </div>
      </React.Fragment>
    );
  }
}

export default ImagePreloader;
