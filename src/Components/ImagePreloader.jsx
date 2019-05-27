import React, { Component } from 'react';
import { getClosestNFiles } from '../utils/getValueFromStore';
import { PRELOAD_N_IMAGES } from '../constants/base';

class ImagePreloader extends Component {
  state = {};

  render() {
    const { fileList, bgColor } = this.props;
    if (fileList.length < 1) return null;

    const preloadList = getClosestNFiles(PRELOAD_N_IMAGES);
    if (preloadList.length < 1) return null;

    return (
      <React.Fragment>
        <div className="preload-image_container">
          {preloadList.map((file, index) => (
            <img
              key={index}
              alt=""
              className="preload-image"
              src={`file:///${file.fullPath}`}
            />
          ))}

          <div
            style={{ backgroundColor: bgColor }}
            className="preload-overlay"
          />
        </div>
      </React.Fragment>
    );
  }
}

export default ImagePreloader;
