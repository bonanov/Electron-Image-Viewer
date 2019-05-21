import React, { Component } from 'react';
import { toast } from 'react-toastify';
import { connect } from 'react-redux';
import { formatPath } from '../utils/base';
import * as types from '../constants/actionTypes.js';

class ImageContainer extends Component {
  imageEl = null;

  getStyle = () => {
    const { viewModes, fileSystem } = this.props;
    const { scale, zoomMode } = viewModes;
    const { fileProps } = fileSystem.currentFile;
    if (!fileProps) return;
    const { width, height } = fileProps;
    if (!width) return;
    let scaleValue;
    if (zoomMode === 0) scaleValue = scale;
    if (zoomMode === 1) scaleValue = 1;
    if (zoomMode === 2) {
      const elementWidth = this.imageEl.offsetWidth;
      scaleValue = width / elementWidth;
    }

    const transform = `scale(${scaleValue})`;
    const style = {
      transform,
    };
    return style;
  };

  render() {
    const { fileSystem, viewModes, base64 } = this.props;
    // const { fullPath, base64 } = fileSystem.currentFile;

    const { currentPosition, fileList } = fileSystem;
    const currentFile = fileList[currentPosition];
    if (!currentFile) return null;
    const { fullPath } = currentFile;

    const zoomFit = viewModes.zoomMode === 1;
    const style = this.getStyle();
    const noScale = viewModes.scale <= 1;
    const src = base64 && (zoomFit || noScale) ? base64 : formatPath(fullPath);
    return (
      <div className="image-container">
        <div style={{ ...style }} className="image">
          {src && (
            <img
              ref={ref => (this.imageEl = ref)}
              className="image-inner"
              src={src}
            />
          )}
        </div>
      </div>
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
