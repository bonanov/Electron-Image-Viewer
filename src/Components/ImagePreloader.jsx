import React, { Component } from 'react';
import { getClosestNFiles } from '../utils/getValueFromStore';

class ImagePreloader extends Component {
  state = {};

  render() {
    const {
      fileList,
      bgColor,
      backgroundColor,
      shouldPreload,
      onlyPreloadNext,
      imagesToPreload,
    } = this.props;
    if (fileList.length < 1) return null;
    const color = backgroundColor ? bgColor : null;
    const preloadList = getClosestNFiles(imagesToPreload, onlyPreloadNext);
    if (preloadList.length < 1) return null;

    return (
      <React.Fragment>
        <div className="preload-image_container">
          {shouldPreload &&
            preloadList.map((file, index) => (
              <img
                key={index}
                alt=""
                className="preload-image"
                src={`file:///${file.fullPath}`}
              />
            ))}

          <div style={{ backgroundColor: color }} className="preload-overlay" />
        </div>
      </React.Fragment>
    );
  }
}

export default ImagePreloader;
