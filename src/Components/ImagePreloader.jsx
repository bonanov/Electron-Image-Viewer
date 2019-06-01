import React, { Component } from 'react';
import { getClosestNFiles } from '../utils/getValueFromStore';
import { formatPath } from '../utils/base';

const ImagePreloader = props => {
  const { fileList, bgColor, backgroundColor } = props;
  const { shouldPreload, onlyPreloadNext, imagesToPreload } = props;

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
              src={formatPath(file.fullPath)}
            />
          ))}

        <div style={{ backgroundColor: color }} className="preload-overlay" />
      </div>
    </React.Fragment>
  );
};

export default ImagePreloader;
