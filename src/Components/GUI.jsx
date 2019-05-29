import React, { Component } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { connect } from 'react-redux';
import * as types from '../constants/actionTypes.js';
import PositionPanel from './PositionPanel';
import ControlPanel from './ControlPanel';
import ImagePreloader from './ImagePreloader';
import Popups from './Popups/Popups';
import * as message from '../constants/asyncMessages';
import { HIDE_TIMEOUT, CONTROL_PANEL_SEL, IMAGE_CONTAINER_SEL } from '../constants/base';
import { toggleFullscreen, mod } from '../utils/base.js';
import {
  getCurrentFile,
  getViewModes,
  getCurrentFilePath,
  removeFileFromList,
  getFileSystem,
  undoFileRemoving,
  getTrash,
} from '../utils/getValueFromStore.js';

const { ipcRenderer } = window.electron;

const { remote } = window.electron;
const fs = remote.require('fs');
const trash = window.trash;

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
    this.wheelTimer = null;
    this.undoRemoveTime = null;
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

    if (code === 'ArrowRight' || code === 'Space') return this.handleShiftImage(1);
    if (code === 'ArrowLeft' || code === 'Backspace') return this.handleShiftImage(-1);

    if (code === 'Home') return updatePosition(0);
    if (key === '+') return this.handleZoom({ delta: +1 });
    if (key === '-') return this.handleZoom({ delta: -1 });
    if (code === 'End') return updatePosition(fileList.length - 1);
    if (code === 'KeyF') return toggleFullscreen();
    if (!ctrlKey && code === 'KeyI') return this.handleInfo();
    if (!ctrlKey && code === 'KeyZ') return this.handleZoomToggle();
    if (key === 'F11') {
      e.preventDefault();
      toggleFullscreen();
      return;
    }
    if (code === 'KeyS') {
      this.handlePanelsHide();
      onShuffle();
    }
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
    this.undoRemoveTime = setTimeout(() => {
      // removePopup('undoRemove');
      setTrashSeen(currentFile.fullPath);
    }, 5000);
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
      target.closest(CONTROL_PANEL_SEL) || target.closest('.settings_container');

    if (target && unclosableTargets()) return;
    this.hideTimer = setTimeout(hideUi, HIDE_TIMEOUT);
  };

  handleWheel = e => {
    const delta = e.deltaY > 0 ? -1 : 1;
    const { clientX, clientY, target } = e;

    if (target.closest('.info_container')) return;

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
    const {
      updatePosition,
      resetImagePosition,
      updateFileList,
      setZoomMode,
      updateScale,
    } = this.props;
    const { fileList, currentPosition } = fileSystem;
    const { scale, zoomMode } = getViewModes();
    if (this.updating) return;
    this.updating = true;

    if (fileList.length === currentPosition) return;
    let newPosition = currentPosition + order;
    newPosition = mod(newPosition, fileList.length);

    const newFile = fileList[newPosition];
    if (!newFile) return;

    const isExist = fs.existsSync(newFile.fullPath);
    if (!isExist) {
      const newList = removeFileFromList(newFile.fullPath);
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
    }, 50);
  };

  handleSettingsOpen = () => {
    const { togglePopup } = this.props;
    togglePopup('settings');
  };

  handleInfo = () => {
    const { togglePopup } = this.props;
    const { fullPath } = getCurrentFile();
    console.log();
    togglePopup('info');
    // ipcRenderer.send('asynchronous-message', message.getExif(fullPath));
  };

  mainGui = () => {
    const { viewModes, fileSystem } = this.props;
    const { currentPosition, fileList } = fileSystem;
    const { onShuffle, imageEl } = this.props;
    const currentFile = getCurrentFile();
    if (!imageEl || !currentFile) return null;
    return (
      <React.Fragment>
        <PositionPanel
          hidden={viewModes.uiHidden}
          amount={fileList.length}
          currentPosition={currentPosition}
          onInfo={this.handleInfo}
        />
        <ControlPanel
          onToggleFullscreen={() => toggleFullscreen()}
          onFileDelete={this.handleFileDelete}
          onSettingsClick={this.handleSettingsOpen}
          onShiftImage={this.handleShiftImage}
          onZoomChange={this.handleZoomToggle}
          zoomMode={viewModes.zoomMode}
          randomMode={viewModes.shuffle}
          hidden={viewModes.uiHidden}
          onToggleShuffle={onShuffle}
        />
      </React.Fragment>
    );
  };

  preloader = () => {
    const { viewModes, fileSystem, config } = this.props;
    const { backgroundColor, preloadImages } = config;
    const { bgColor } = viewModes;
    const { currentPosition, fileList } = fileSystem;
    return (
      <ImagePreloader
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
        <Popups onUndoRemove={this.handleUndoRemove} />
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
});

const mapDispatchToProps = {
  toggleZoomMode: () => ({ type: types.TOGGLE_ZOOM_MODE }),
  togglePopup: payload => ({ type: types.TOGGLE_POPUP, payload }),
  addPopup: payload => ({ type: types.ADD_POPUP, payload }),
  removePopup: payload => ({ type: types.REMOVE_POPUP, payload }),
  setZoomMode: payload => ({ type: types.SET_ZOOM_MODE, payload }),
  setZoomFree: () => ({ type: types.ZOOM_FREE }),
  updateFileList: payload => ({ type: types.UPDATE_FILELIST, payload }),
  updatePosition: payload => ({ type: types.UPDATE_CURRENT_POSITION, payload }),
  addToTrash: payload => ({ type: types.ADD_TO_TRASH, payload }),
  setTrashSeen: payload => ({ type: types.SET_TRASH_SEEN, payload }),
  removeFromTrash: payload => ({ type: types.REMOVE_FROM_TRASH, payload }),
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
