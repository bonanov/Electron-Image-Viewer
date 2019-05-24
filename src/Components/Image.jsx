import React, { Component } from 'react';
import { toast } from 'react-toastify';
import { connect } from 'react-redux';
import { formatPath } from '../utils/base';
import * as types from '../constants/actionTypes.js';
import { getCurrentFile, getViewModes } from '../utils/getValueFromStore';

class ImageContainer extends Component {
  imageEl = null;

  getStyle = () => {
    const { scale, zoomMode, imagePosition } = getViewModes();
    const { fileProps } = getCurrentFile();
    if (!fileProps) return;
    const { width } = fileProps;
    if (!width) return;
    const scaleValue = scale;
    // if (zoomMode === 1) scaleValue = 1;
    // if (zoomMode === 2) {
    //   const image = this.imageEl.querySelector('.image-inner');
    //   const elementWidth = image.offsetWidth;
    //   scaleValue = width / elementWidth;
    // }
    const { x, y } = imagePosition;
    const transform = `translateX(${x}px) translateY(${y}px) scale(${scaleValue})`;
    const style = {
      transform,
    };
    return style;
  };

  handleRef = ref => {
    const { onRef } = this.props;
    onRef(ref);
    this.imageEl = ref;
  };

  render() {
    const { fileSystem, base64, base64Bg, onRef } = this.props;
    const { zoomMode, scale } = getViewModes();
    // const { fullPath, base64 } = fileSystem.currentFile;

    const { currentPosition, fileList } = fileSystem;
    const currentFile = fileList[currentPosition];
    if (!currentFile) return null;
    const { fullPath, type } = currentFile;

    const zoomFit = zoomMode === 1;
    const noScale = scale <= 1;
    const style = this.getStyle();
    const src = base64 && (zoomFit || noScale) ? base64 : formatPath(fullPath);
    return (
      <React.Fragment>
        {/* TODO: use flozz/StackBlur instead */}
        {/* <div style={{ backgroundImage: `url(${src})` }} className="blured" /> */}
        <div
          style={{ backgroundImage: `url(${base64Bg})` }}
          className="blur-container"
        >
          {type !== 'gif' && (
            <img src={formatPath(fullPath)} className="blured" />
          )}
        </div>
        <div
          ref={this.handleRef}
          className="image-container image-container-selector"
        >
          <div style={{ ...style }} className="image">
            {src && <img className="image-inner" src={src} />}
          </div>
        </div>
      </React.Fragment>
    );
  }
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
