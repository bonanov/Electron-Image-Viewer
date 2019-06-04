import React, { Component } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { connect } from 'react-redux';
import Cropper from 'react-cropper';
import setSelfAdjustingInterval from 'self-adjusting-interval';
import * as types from '../constants/actionTypes.js';
import PositionPanel from './PositionPanel';
import ControlPanel from './ControlPanel';
import ImagePreloader from './ImagePreloader';
import Popups from './Popups/Popups';
import * as message from '../constants/asyncMessages';
import {
  HIDE_TIMEOUT,
  CONTROL_PANEL_SEL,
  IMAGE_CONTAINER_SEL,
  PRELOAD_N_IMAGES,
} from '../constants/base';
import {
  toggleFullscreen,
  mod,
  formatPath,
  writeDateToDisk,
  formatFileObject,
} from '../utils/base.js';
import {
  getCurrentFile,
  getViewModes,
  getCurrentFilePath,
  removeFileFromList,
  getFileSystem,
  undoFileRemoving,
  getTrash,
  addFileToList,
} from '../utils/getValueFromStore.js';

process.hrtime = window.hrtime;

const { ipcRenderer, clipboard, nativeImage, remote } = window.electron;
const fs = remote.require('fs');
const trash = window.trash;
class GUI extends Component {
  constructor() {
    super();
    // this.resizeImage_ = throttle(this.resizeImage, 300);

    this.offsetX = null;
    this.offsetY = null;
    this.initX = null;
    this.cropperEl = null;
    this.initY = null;
    this.transitionEnded = true;
    this.transitionTimer = null;
    this.hideTimer = null;
    this.wheelTimer = null;
    this.undoRemoveTime = null;
    this.slideShowTimer = null;
    this.state = {
      moving: false,
    };
  }

  componentDidMount() {
    const { hideUi } = this.props;
    document.addEventListener('keydown', this.handleKey);
    document.addEventListener('keyup', this.handleKeyUp);
    document.addEventListener('mousedown', this.handleMouseDown);
    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('mouseup', this.handleMouseUp);
    document.addEventListener('wheel', this.handleWheel);
    document.addEventListener('mouseleave', this.handleMouseLeave);
    this.hideTimer = setTimeout(hideUi, HIDE_TIMEOUT);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKey);
    document.removeEventListener('keyup', this.handleKeyUp);
    window.removeEventListener('resize', this.resizeImage_);
    document.removeEventListener('wheel', this.handleWheel);
    document.removeEventListener('mousedown', this.handleMouseDown);
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.handleMouseUp);
    document.removeEventListener('mouseleave', this.handleMouseLeave);
  }

  handleKeyUp = e => {
    const { code, ctrlKey, key } = e;
    if (code === 'Delete') return this.handleFileDelete();
    if (ctrlKey && code === 'KeyZ') return this.handleUndoRemoveLast();
  };

  handleKey = e => {
    const { updatePosition, onShuffle } = this.props;
    const { fileList } = getFileSystem();
    const { code, ctrlKey, key } = e;

    const inputHasFocus = document.activeElement.tagName === 'INPUT';
    if (inputHasFocus) return;

    if (code === 'ArrowRight' || code === 'Space') return this.handleShiftImage(1);
    if (code === 'ArrowLeft' || code === 'Backspace') return this.handleShiftImage(-1);
    if (code === 'ArrowUp') return this.handleShiftImage(10);
    if (code === 'ArrowDown') return this.handleShiftImage(-10);
    if (code === 'Home') return updatePosition(0);
    if (!ctrlKey && key === '+') return this.handleZoom({ delta: +1 });
    if (!ctrlKey && key === '-') return this.handleZoom({ delta: -1 });
    if (!ctrlKey && code === 'End') return updatePosition(fileList.length - 1);
    if (!ctrlKey && code === 'KeyO') return this.handleSettingsOpen();
    if (!ctrlKey && code === 'KeyF') return toggleFullscreen();
    if (!ctrlKey && code === 'KeyI') return this.handleInfo();
    if ((ctrlKey && code === 'KeyR') || code === 'F5') return window.location.reload();
    if (!ctrlKey && code === 'Escape') return this.handleEscape();
    if (!ctrlKey && code === 'Enter') return this.handleEnter();
    if (!ctrlKey && code === 'KeyZ') return this.handleZoomToggle();
    if (!ctrlKey && code === 'KeyQ') return this.handleQuit();
    if (key === 'F11') {
      e.preventDefault();
      toggleFullscreen();
      return;
    }

    if (!ctrlKey && code === 'KeyS') {
      this.handleSlideShowToggle();
      return;
    }

    if (!ctrlKey && code === 'KeyR') {
      this.handlePanelsHide();
      onShuffle();
    }
  };

  handleQuit = () => ipcRenderer.send('asynchronous-message', message.sendQuit());

  handleEnter = () => (this.props.viewModes.cropMode ? this.handleCrop() : null);

  handleEscape = () => {
    const { toggleCropMode, showUi } = this.props;
    const { cropMode } = this.props.viewModes;
    if (!cropMode) return;
    toggleCropMode();
    showUi();
  };

  handleUndoRemoveLast = () => {
    const list = getTrash();

    if (list.length < 1) return;
    const i = list.length - 1;
    const { fullPath } = list[i].file;
    this.handleUndoRemove(fullPath);
  };

  handleUndoRemove = async fullPath => {
    const { removeFromTrash } = this.props;

    const err = await undoFileRemoving(fullPath);
    if (err) return;
    removeFromTrash(fullPath);
  };

  handleFileDelete = async () => {
    const { addToTrash, addPopup, removePopup, setTrashSeen } = this.props;

    const { currentPosition } = getFileSystem();
    const currentFile = getCurrentFile();
    if (!currentFile) return;

    removeFileFromList(currentFile.fullPath);
    const trashed = await trash([currentFile.fullPath]);

    if (!trashed) return toast.error('something went wrong while deleting a file');

    const trashedFile = {
      file: currentFile,
      trashPath: trashed[0].path,
      position: currentPosition,
    };

    addToTrash(trashedFile);

    addPopup('undoRemove');
    // clearTimeout(this.undoRemoveTime);
    setTimeout(() => {
      // removePopup('undoRemove');
      setTrashSeen(currentFile.fullPath);
    }, 3000);
  };

  handleRmb = e => {
    const { togglePopup } = this.props;
    const currentFile = getCurrentFile();
    if (!currentFile) return;
    const { target } = e;
    if (!target.closest('.image-container')) return;
    togglePopup('contextMenu');
  };

  handleMouseDown = e => {
    const { imageEl, viewModes } = this.props;
    const { removePopup } = this.props;
    const { imagePosition } = viewModes;
    const { target } = e;
    const targetNotContextMenu = !target.closest('.context-menu');
    if (e.which === 3 && targetNotContextMenu) this.handleRmb(e);
    if (e.which !== 1) return;

    if (!imageEl) return;

    if (targetNotContextMenu) removePopup('contextMenu');
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
    const { moving } = this.state;
    const { target } = e;
    if (target.tagName !== 'INPUT') e.preventDefault();
    this.handlePanelsHide(target);

    if (!moving) return;
    const { clientX, clientY } = e;
    this.handleImageMove({ clientX, clientY });
  };

  handleImageMove = ({ clientX, clientY }) => {
    const { updateImagePosition } = this.props;
    const { imageEl } = this.props;
    if (!imageEl) return;

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
    const { moving } = this.state;
    if (moving && !viewModes.uiHidden) {
      hideUi();
      return;
    }
    clearTimeout(this.hideTimer);

    if (!moving && viewModes.uiHidden) {
      showUi();
    }

    const unclosableTargets = () =>
      target.closest(CONTROL_PANEL_SEL) ||
      target.closest('.settings_container') ||
      target.closest('.unhide') ||
      target.closest('.rc-tooltip-inner');

    if (target && unclosableTargets()) return;

    this.hideTimer = setTimeout(() => {
      if (this.props.popups.contextMenu) return;
      hideUi();
    }, HIDE_TIMEOUT);
  };

  handleWheel = e => {
    const { cropMode } = this.props.viewModes;
    const delta = e.deltaY > 0 ? -1 : 1;
    const { clientX, clientY, target } = e;

    if (cropMode) return;
    if (target.closest('.popup')) return;
    if (target.closest('.unwheel')) return;
    if (target.closest('.rc-tooltip-inner')) return;
    if (target.closest('.control-panel-bottom')) return this.handleShiftImage(delta);

    this.handleZoom({ delta, clientX, clientY });
    const { imageEl } = this.props;
  };

  handleWheelResize = () => {
    const { imageEl } = this.props;
    const fullPath = getCurrentFilePath();
    const { innerHeight, innerWidth } = window;
    const image = imageEl.querySelector('.image-inner');
    const { height, width } = image.getBoundingClientRect();
    const newMessage = {
      fullPath,
      width: width || innerWidth,
      height: height || innerHeight,
    };
    ipcRenderer.send('asynchronous-message', message.getResized(newMessage));
  };

  handleZoom = async ({ delta, initialScale }) => {
    const { updateScale, setZoomFree } = this.props;
    const { viewModes } = this.props;
    const { zoomMode } = viewModes;
    const { scale } = viewModes;
    // if (!this.transitionEnded) return;
    // this.transitionEnded = false;
    if (zoomMode !== 0) {
      //   scale = 1;
      setZoomFree();
    }

    const mult = Math.exp(scale / 2);

    let scaleNew = initialScale || scale + 0.1 * delta * Math.min(15, mult);

    scaleNew = Math.min(Math.max(0.1, scaleNew), 15);
    scaleNew = parseFloat(scaleNew.toFixed(2));
    if (scaleNew <= 1.1 && scaleNew >= 0.94) scaleNew = 1;
    updateScale(scaleNew);
    // clearTimeout(this.transitionTimer);
    // this.transitionTimer = setTimeout(() => {
    //   this.transitionEnded = true;
    // }, 20);
  };

  getZoomMultiplier = () => {
    const { imageEl } = this.props;
    const { width, height } = imageEl
      .querySelector('.image-inner')
      .getBoundingClientRect();
    const { innerHeight, innerWidth } = window;
    const imageDims = width * height;
    const windowDims = innerHeight * innerWidth;
    return imageDims / windowDims;
  };

  handleZoomToggle = () => {
    const currentFile = getCurrentFile();
    if (!currentFile) return;

    const { fileProps } = currentFile;

    const { resetImagePosition, setZoomMode, updateScale } = this.props;
    const { viewModes, imageEl } = this.props;

    if (!fileProps) return;
    const { width } = fileProps;

    switch (viewModes.zoomMode) {
      case 0:
        // fit
        setZoomMode(1);
        updateScale(1);
        break;
      case 1: {
        // expand
        setZoomMode(2);
        const image = imageEl.querySelector('.image-inner');
        const elementWidth = image.offsetWidth;
        const scale = width / elementWidth;
        updateScale(scale);
        break;
      }
      case 2:
        // free
        updateScale(1);
        setZoomMode(1);
        break;
      default:
        break;
    }
    resetImagePosition();
    // toggleZoomMode();
  };

  handleShiftImage = order => {
    const { fileSystem } = this.props;
    const { updatePosition, resetImagePosition, setZoomMode, updateScale } = this.props;
    const { fileList, currentPosition } = fileSystem;
    const { scale, zoomMode, cropMode } = getViewModes();

    if (this.updating) return;
    if (cropMode) return;
    this.updating = true;

    if (fileList.length === currentPosition) return;
    let newPosition = currentPosition + order;
    newPosition = mod(newPosition, fileList.length);

    const newFile = fileList[newPosition];
    if (!newFile) return;

    const isExist = fs.existsSync(newFile.fullPath);
    if (!isExist) {
      removeFileFromList(newFile.fullPath);
    } else {
      updatePosition(newPosition);
    }

    if (scale !== 1) {
      resetImagePosition();
      setZoomMode(1);
      updateScale(1);
    }

    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.updating = false;
    }, 20);
  };

  handleSettingsOpen = () => this.props.togglePopup('settings');

  handleInfo = () => this.props.togglePopup('info');

  handleMouseLeave = () => this.props.hideUi();

  handleSlideShowToggle = () => {
    const { toggleSlideShow } = this.props;
    const { viewModes } = this.props;
    const { slideShow } = viewModes;

    // clearTimeout(this.slideShowTimer);
    if (this.slideShowTimer) this.slideShowTimer();
    toggleSlideShow();
    // this.slideTimer.clearTimeout();
    if (!slideShow) this.handleSlideShow();
  };

  // listen = () => {
  //   let now = 0;
  //   const array = [];
  //   let n = 0;
  //   document.addEventListener('keydown', e => {
  //     const { code } = e;
  //     if (code !== 'Space') return;
  //     array.push(performance.now() - now);
  //     if (array.length > 100) array.shift();
  //     if (n === 0) {
  //       array.shift();
  //       n = 1;
  //     }
  //     console.log(array);
  //     console.log(array.reduce((a, b) => a + b, 0) / array.length);
  //     now = performance.now();
  //   });
  // };

  handleSlideShow = () => {
    const { slideTimeOut } = this.props.config;

    this.slideShowTimer = setSelfAdjustingInterval(() => {
      const { config, viewModes } = this.props;
      const { slideShow } = viewModes;

      if (config.slideTimeOut !== slideTimeOut) {
        this.slideShowTimer();
        this.handleSlideShow();
      }

      // this clears interval
      if (!slideShow) this.slideShowTimer();
      this.handleShiftImage(1);
    }, slideTimeOut);

    // this.slideShowTimer = setTimeout(() => {
    //   const { slideShow } = this.props.viewModes;
    //   if (slideShow) this.handleSlideShow();
    // }, slideTimeOut);

    // this.handleShiftImage(1);
  };

  handleSlideShowTimeOutChange = value => {
    const { updateConfig } = this.props;

    const confItem = { slideTimeOut: value * 1000 };
    updateConfig(confItem);
    ipcRenderer.send('asynchronous-message', message.updateConfigs(confItem));
  };

  handleCrop = () => {
    if (!this.cropperEl) return;
    const { toggleCropMode } = this.props;
    const { fullPath } = getCurrentFile();
    const { currentPosition } = getFileSystem();
    // const dataUrl = this.cropperEl.getCroppedCanvas().toDataURL('image/jpeg');
    this.cropperEl.getCroppedCanvas().toBlob(async blob => {
      const savePath = await writeDateToDisk(fullPath, blob);
      const file = await formatFileObject([savePath]);
      if (!file || !file[0]) return;
      toggleCropMode();
      addFileToList({ file: file[0], position: currentPosition });
    });
  };

  onCrop = () => {
    const { toggleCropMode, resetImagePosition, updateScale } = this.props;
    resetImagePosition();
    updateScale(1);
    toggleCropMode();
  };

  mainGui = () => {
    const { viewModes, fileSystem, config } = this.props;
    const { onShuffle, imageEl } = this.props;
    const { slideShow, cropMode } = viewModes;
    const { currentPosition, fileList } = fileSystem;
    const currentFile = getCurrentFile();
    if ((!imageEl && !cropMode) || !currentFile) return null;
    return (
      <React.Fragment>
        <PositionPanel
          hidden={viewModes.uiHidden}
          amount={fileList.length}
          currentPosition={currentPosition}
          onInfo={this.handleInfo}
        />
        <ControlPanel
          slideShow={slideShow}
          slideShowTimeOut={config.slideTimeOut}
          zoomMode={viewModes.zoomMode}
          randomMode={viewModes.shuffle}
          hidden={viewModes.uiHidden}
          onToggleFullscreen={toggleFullscreen}
          onToggleSlideShow={this.handleSlideShowToggle}
          onSlideShowTimeoutChange={this.handleSlideShowTimeOutChange}
          onFileDelete={this.handleFileDelete}
          onSettingsClick={this.handleSettingsOpen}
          onShiftImage={this.handleShiftImage}
          onZoomChange={this.handleZoomToggle}
          onToggleShuffle={onShuffle}
          onCrop={this.onCrop}
        />
        {cropMode && (
          <div className="cropper-container_custom">
            <Cropper
              checkCrossOrigin={false}
              autoCrop={false}
              zoomOnWheel={false}
              viewMode={1}
              style={{ height: '100%', width: '100%' }}
              ref={ref => (this.cropperEl = ref)}
              src={formatPath(currentFile.fullPath)}
              guides={false}
              background={false}
            />
          </div>
        )}
      </React.Fragment>
    );
  };

  preloader = () => {
    const { viewModes, fileSystem, config } = this.props;
    const { backgroundColor, preloadImages } = config;
    const { bgColor, slideShow } = viewModes;
    const { currentPosition, fileList } = fileSystem;
    const imagesToPreload = slideShow ? PRELOAD_N_IMAGES + 1 : PRELOAD_N_IMAGES;
    return (
      <ImagePreloader
        imagesToPreload={imagesToPreload}
        onlyPreloadNext={slideShow}
        shouldPreload={preloadImages}
        bgColor={bgColor}
        backgroundColor={backgroundColor}
        currentPosition={currentPosition}
        fileList={fileList}
      />
    );
  };

  render() {
    return (
      <React.Fragment>
        <ToastContainer />
        <Popups onDelete={this.handleFileDelete} onUndoRemove={this.handleUndoRemove} />
        {this.mainGui()}
        {this.preloader()}
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => ({
  viewModes: state.viewModes,
  fileSystem: state.fileSystem,
  config: state.config,
  popups: state.popups,
});

const mapDispatchToProps = {
  toggleSlideShow: () => ({ type: types.TOGGLE_SLIDESHOW }),
  toggleCropMode: () => ({ type: types.TOGGLE_CROPMODE }),
  updateConfig: payload => ({ type: types.UPDATE_CONFIG, payload }),
  toggleZoomMode: () => ({ type: types.TOGGLE_ZOOM_MODE }),
  togglePopup: payload => ({ type: types.TOGGLE_POPUP, payload }),
  addPopup: payload => ({ type: types.ADD_POPUP, payload }),
  removePopup: payload => ({ type: types.REMOVE_POPUP, payload }),
  setZoomMode: payload => ({ type: types.SET_ZOOM_MODE, payload }),
  setZoomFree: () => ({ type: types.ZOOM_FREE }),
  updatePosition: payload => ({ type: types.UPDATE_CURRENT_POSITION, payload }),
  addToTrash: payload => ({ type: types.ADD_TO_TRASH, payload }),
  setTrashSeen: payload => ({ type: types.SET_TRASH_SEEN, payload }),
  removeFromTrash: payload => ({ type: types.REMOVE_FROM_TRASH, payload }),
  updateImagePosition: payload => ({
    type: types.UPDATE_IMAGE_POSITION,
    payload,
  }),
  resetImagePosition: () => ({ type: types.RESET_IMAGE_POSITION }),
  updateScale: payload => ({ type: types.UPDATE_SCALE, payload }),
  showUi: () => ({ type: types.SHOW_UI }),
  hideUi: () => ({ type: types.HIDE_UI }),
};
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(GUI);
