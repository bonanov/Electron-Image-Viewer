import React, { Component } from 'react';
import { ToastContainer } from 'react-toastify';
import { connect } from 'react-redux';
import * as types from '../constants/actionTypes.js';
import PositionPanel from './PositionPanel';
import ControlPanel from './ControlPanel';
import ImagePreloader from './ImagePreloader';
import { HIDE_TIMEOUT, CONTROL_PANEL_SEL } from '../constants/base';
import { shuffleFunc, toggleFullscreen } from '../utils/base.js';

class GUI extends Component {
  constructor() {
    super();
    // this.resizeImage_ = throttle(this.resizeImage, 300);
    this.hideTimer = null;
  }

  componentDidMount() {
    const { hideUi } = this.props;
    document.addEventListener('keydown', this.handleKey);
    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('wheel', this.handleWheel);
    document.addEventListener('mouseleave', this.handleMouseLeave);
    this.hideTimer = setTimeout(hideUi, HIDE_TIMEOUT);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKey);
    window.removeEventListener('resize', this.resizeImage_);
    document.removeEventListener('wheel', this.handleWheel);
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseleave', this.handleMouseLeave);
  }

  handleKey = e => {
    const { updatePosition } = this.props;
    const { fileSystem } = this.props;
    const { code } = e;

    let order = 0;
    if (code === 'ArrowRight') order = 1;
    if (code === 'ArrowLeft') order = -1;
    if (order) return this.handleShiftImage(order);

    const lastPosition = fileSystem.fileList.length - 1;
    if (code === 'Home') return updatePosition(0);
    if (code === 'End') return updatePosition(lastPosition);
    if (code === 'KeyF') return toggleFullscreen();
  };

  handleMouseLeave = () => {
    const { hideUi } = this.props;
    hideUi();
  };

  handleMouseMove = e => {
    const { target } = e;
    this.handlePanelsHide(target);
  };

  handlePanelsHide = target => {
    const { hideUi, showUi, viewModes } = this.props;
    clearTimeout(this.hideTimer);

    if (viewModes.uiHidden) {
      showUi();
    }

    if (target.closest(CONTROL_PANEL_SEL)) return;
    this.hideTimer = setTimeout(hideUi, HIDE_TIMEOUT);
  };

  handleWheel = e => {
    const delta = e.deltaY > 0 ? -1 : 1;
    this.handleZoom({ delta });
  };

  handleZoom = ({ delta, initialScale }) => {
    const { updateScale, setZoomFree } = this.props;
    const { viewModes } = this.props;
    const { zoomMode } = viewModes;
    let { scale } = viewModes;
    if (zoomMode !== 0) scale = 1;
    const scaleNew = initialScale || scale + 0.05 * delta * Math.exp(scale / 3);
    if (scaleNew < 0.1) return;
    if (scaleNew > 15) return;
    setZoomFree();
    const scaleFormated = Number(scaleNew.toFixed(2));
    updateScale(scaleFormated);
  };

  handleZoomToggle = () => {
    const { toggleZoomMode } = this.props;
    toggleZoomMode();
  };

  handleShiftImage = order => {
    const { fileSystem } = this.props;
    const { updatePosition, updateCurrentFile } = this.props;
    const { fileList, currentPosition } = fileSystem;
    if (this.updating) return;
    this.updating = true;

    if (fileList.length === currentPosition) return;
    let newPosition = currentPosition + order;
    if (newPosition > fileList.length - 1) newPosition = 0;
    if (newPosition < 0) newPosition = fileList.length - 1;

    const newFile = fileList[newPosition];
    updatePosition(newPosition);
    updateCurrentFile(newFile);

    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.updating = false;
    }, 50);
  };

  render() {
    const { onShuffle } = this.props;
    const { viewModes, fileSystem } = this.props;

    const { currentPosition, fileList } = fileSystem;
    return (
      <React.Fragment>
        <ToastContainer />
        <React.Fragment>
          <PositionPanel
            hidden={viewModes.uiHidden}
            amount={fileList.length}
            currentPosition={currentPosition}
          />
          <ControlPanel
            onShiftImage={this.handleShiftImage}
            onZoomChange={this.handleZoomToggle}
            zoomMode={viewModes.zoomMode}
            randomMode={viewModes.shuffle}
            hidden={viewModes.uiHidden}
            onToggleShuffle={onShuffle}
          />
        </React.Fragment>
        <ImagePreloader
          currentPosition={currentPosition}
          // dirName={dirName}
          // amount={amount}
          fileList={fileList}
        />
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => ({
  viewModes: state.viewModes,
  fileSystem: state.fileSystem,
});

const mapDispatchToProps = {
  toggleZoomMode: () => ({ type: types.TOGGLE_ZOOM_MODE }),
  setZoomFree: () => ({ type: types.ZOOM_FREE }),
  updatePosition: payload => ({ type: types.UPDATE_CURRENT_POSITION, payload }),
  updateCurrentFile: payload => ({ type: types.UPDATE_CURRENT_FILE, payload }),
  updateScale: payload => ({ type: types.UPDATE_SCALE, payload }),
  showUi: () => ({ type: types.SHOW_UI }),
  hideUi: () => ({ type: types.HIDE_UI }),
};
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(GUI);
