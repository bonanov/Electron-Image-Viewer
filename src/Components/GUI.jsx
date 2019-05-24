import React, { Component } from 'react';
import { ToastContainer } from 'react-toastify';
import { connect } from 'react-redux';
import * as types from '../constants/actionTypes.js';
import PositionPanel from './PositionPanel';
import ControlPanel from './ControlPanel';
import ImagePreloader from './ImagePreloader';
import {
  HIDE_TIMEOUT,
  CONTROL_PANEL_SEL,
  IMAGE_CONTAINER_SEL,
} from '../constants/base';
import { shuffleFunc, toggleFullscreen } from '../utils/base.js';

class GUI extends Component {
  constructor() {
    super();
    // this.resizeImage_ = throttle(this.resizeImage, 300);

    this.offsetX = null;
    this.offsetY = null;
    this.initX = null;
    this.initY = null;
    this.transitionEnded = true;
    this.transitionTimer = null;
    this.hideTimer = null;
    this.state = {
      moving: false,
    };
  }

  componentDidMount() {
    const { hideUi } = this.props;
    document.addEventListener('keydown', this.handleKey);
    document.addEventListener('mousedown', this.handleMouseDown);
    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('mouseup', this.handleMouseUp);
    document.addEventListener('wheel', this.handleWheel);
    document.addEventListener('mouseleave', this.handleMouseLeave);
    this.hideTimer = setTimeout(hideUi, HIDE_TIMEOUT);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKey);
    window.removeEventListener('resize', this.resizeImage_);
    document.removeEventListener('wheel', this.handleWheel);
    document.removeEventListener('mousedown', this.handleMouseDown);
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.handleMouseUp);
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

  handleMouseDown = e => {
    const { imageEl, viewModes } = this.props;
    const { imagePosition } = viewModes;
    if (!imageEl) return;

    const { target } = e;
    if (target.closest(IMAGE_CONTAINER_SEL)) {
      const { left, top } = imageEl.getBoundingClientRect();
      const { clientX, clientY } = e;
      const { x, y } = imagePosition;
      this.offsetX = clientX - left;
      this.offsetY = clientY - top;
      this.initX = x;
      this.initY = y;
      this.setState({ moving: true });
      document.body.classList.toggle('image-moving');
    }
  };

  handleMouseMove = e => {
    e.preventDefault();
    const { moving } = this.state;
    const { target } = e;
    this.handlePanelsHide(target);

    if (!moving) return;
    this.handleImageMove(e);
  };

  handleImageMove = e => {
    const { updateImagePosition } = this.props;
    const { imageEl, viewModes } = this.props;
    const { imagePosition } = viewModes;
    if (!imageEl) return;

    const { clientX, clientY } = e;
    const offsetX = clientX - this.offsetX;
    const offsetY = clientY - this.offsetY;
    const x = offsetX + this.initX;
    const y = offsetY + this.initY;

    updateImagePosition({ x, y });
  };

  handleMouseUp = () => {
    const { moving } = this.state;

    if (moving) {
      this.setState({ moving: false });
      document.body.classList.toggle('image-moving');
    }
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

  handleZoom = async ({ delta, initialScale }) => {
    const { updateScale, setZoomFree } = this.props;
    const { viewModes } = this.props;
    const { zoomMode } = viewModes;
    let { scale } = viewModes;
    if (!this.transitionEnded) return;
    this.transitionEnded = false;
    if (zoomMode !== 0) {
      scale = 1;
      setZoomFree();
    }
    let scaleNew = initialScale || scale + 0.15 * delta * Math.exp(scale / 4);
    scaleNew = Math.min(Math.max(0.1, scaleNew), 15);
    let scaleFormated = Number(scaleNew.toFixed(2));
    if (scaleFormated <= 1.1 && scaleFormated >= 0.94) scaleFormated = 1;
    console.log('wheel');
    updateScale(scaleFormated);
    clearTimeout(this.transitionTimer);
    this.transitionTimer = setTimeout(() => {
      this.transitionEnded = true;
    }, 20);
  };

  handleZoomToggle = () => {
    const { toggleZoomMode, resetImagePosition } = this.props;
    resetImagePosition();
    toggleZoomMode();
  };

  handleShiftImage = order => {
    const { fileSystem } = this.props;
    const {
      updatePosition,
      updateCurrentFile,
      resetImagePosition,
    } = this.props;
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
    resetImagePosition();

    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.updating = false;
    }, 50);
  };

  render() {
    const { onShuffle, imageEl } = this.props;
    const { viewModes, fileSystem } = this.props;

    const { bgColor } = viewModes;
    const { currentPosition, fileList } = fileSystem;
    if (!imageEl) return null;
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
          bgColor={bgColor}
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
  updateImagePosition: payload => ({
    type: types.UPDATE_IMAGE_POSITION,
    payload,
  }),
  resetImagePosition: () => ({ type: types.RESET_IMAGE_POSITION }),
  updateCurrentFile: payload => ({ type: types.UPDATE_CURRENT_FILE, payload }),
  updateScale: payload => ({ type: types.UPDATE_SCALE, payload }),
  showUi: () => ({ type: types.SHOW_UI }),
  hideUi: () => ({ type: types.HIDE_UI }),
};
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(GUI);
