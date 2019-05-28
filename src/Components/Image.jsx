import React, { Component } from 'react';
import { connect } from 'react-redux';
import { formatPath } from '../utils/base';
import * as types from '../constants/actionTypes.js';
import { getCurrentFile, getViewModes, getFileSystem } from '../utils/getValueFromStore';

class ImageContainer extends Component {
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
    this.imageEl = ref;
  };

  render() {
    const { fileSystem, viewModes } = this.props;
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
        {blur && this.renderBlur({ blur })}
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
          <img className="image-inner" src={src} />
        </div>
      )}
    </div>
  );
}

const mapStateToProps = state => ({
  viewModes: state.viewModes,
  fileSystem: state.fileSystem,
});

const mapDispatchToProps = {
  setZoomFree: () => ({ type: types.ZOOM_FREE }),
  setZoomFit: () => ({ type: types.ZOOM_FIT }),
  setZoomExpand: () => ({ type: types.ZOOM_EXPAND }),
};
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ImageContainer);
