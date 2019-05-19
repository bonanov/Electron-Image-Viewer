import React, { Component } from 'react';
import { ToastContainer } from 'react-toastify';
import PositionPanel from './PositionPanel';
import ControlPanel from './ControlPanel';
import ImagePreloader from './ImagePreloader';

class GUI extends Component {
  constructor() {
    super();
    this.state = {
      hidden: false,
      zoomMode: 1,
      randomMode: false,
      fileProps: {
        width: 0,
        height: 0,
      },
    };

    this.imageEl = null;
    this.fileListTemp = [];
    this.updating = false;
    this.resizeImage_ = throttle(this.resizeImage, 300);
    this.timer = null;
    this.hideTimer = null;
  }

  render() {
    return (
      <React.Fragment>
        <ToastContainer />
        <React.Fragment>
          <PositionPanel
            hidden={hidden}
            amount={amount}
            currentPosition={currentPosition}
          />
          <ControlPanel
            onShiftImage={this.handleShiftImage}
            onZoomChange={this.handleZoomChange}
            zoomMode={zoomMode}
            randomMode={randomMode}
            hidden={hidden}
            onRandomModeChange={this.handleRandomMode}
          />
        </React.Fragment>
        <ImagePreloader
          currentPosition={currentPosition}
          dirName={dirName}
          amount={amount}
          fileList={fileList}
        />
      </React.Fragment>
    );
  }
}

export default GUI;
