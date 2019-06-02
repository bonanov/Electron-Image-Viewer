import React, { Component } from 'react';
import { connect } from 'react-redux';
import { formatPath } from '../utils/base';
import * as types from '../constants/actionTypes.js';
import { getCurrentFile, getViewModes, getFileSystem } from '../utils/getValueFromStore';

class ImageContainer extends Component {
  imageContainer = null;

  imageEl = null;

  getStyle = () => {
    const { scale, imagePosition } = getViewModes();
    const { fileProps } = getCurrentFile();
    if (!fileProps) return;
    const { width } = fileProps;
    if (!width) return;
    const scaleValue = scale;
    const { x, y } = imagePosition;
    const transform = `translateX(${x}px) translateY(${y}px) scale(${scaleValue})`;

    return { transform };
  };

  handleRef = ref => {
    const { onRef } = this.props;
    onRef(ref);
    this.imageContainer = ref;
  };

  render() {
    const { fileSystem, viewModes, config } = this.props;
    const { backgroundBlur } = config;
    const { currentBlob } = fileSystem;
    const { handleRef } = this;
    const currentFile = getCurrentFile();
    if (!currentFile) return null;
    const { fullPath, blurBlob } = currentFile;

    const { scale } = viewModes;
    const noZoom = scale <= 1;
    // const isGif = type === 'gif';
    const style = this.getStyle();

    if (blurBlob) this.blob = blurBlob;
    const blur = blurBlob || this.blob;

    let src = formatPath(fullPath);
    if (noZoom && currentBlob) src = currentBlob;

    return (
      <React.Fragment>
        {backgroundBlur && blur && this.renderBlur({ blur })}
        {this.renderImage({ fullPath, src, handleRef, style })}
      </React.Fragment>
    );
  }

  renderBlur = ({ blur, fullPath }) => (
    <div style={{ backgroundImage: `url(${blur})` }} className="blur-container">
      <img src={fullPath} className="blured" />
    </div>
  );

  renderImage = ({ src, handleRef, style }) => (
    <div ref={handleRef} className="image-container image-container-selector">
      {src && (
        <div style={{ ...style }} className="image">
          <img ref={ref => (this.imageEl = ref)} className="image-inner" src={src} />
        </div>
      )}
    </div>
  );
}

const mapStateToProps = state => ({
  viewModes: state.viewModes,
  fileSystem: state.fileSystem,
  config: state.config,
});

export default connect(mapStateToProps)(ImageContainer);
