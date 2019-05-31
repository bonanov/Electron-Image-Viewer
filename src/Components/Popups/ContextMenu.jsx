import React, { Component } from 'react';
import { connect } from 'react-redux';
import { mapKeys } from 'lodash';
import * as types from '../../constants/actionTypes';
import * as message from '../../constants/asyncMessages';
import { getCurrentFile } from '../../utils/getValueFromStore';

const { ipcRenderer, clipboard, shell, screen } = window.electron;

class ContextMenu extends Component {
  state = {
    top: 0,
    left: 0,
  };

  menuEl = null;

  componentDidMount() {
    document.addEventListener('mousedown', this.handleMouseDown);
  }

  componentDidUpdate(prevProps, prevState) {
    const { contextMenu } = this.props.popups;
    if (contextMenu && !prevProps.popups.contextMenu) {
      // console.log('vis');
    }
  }

  handleMouseDown = e => {
    let { target, clientY, clientX } = e;
    clientY += 2;
    clientX += 2;
    if (!this.menuEl) return;
    const { height, width } = this.menuEl.getBoundingClientRect();

    const { innerHeight, innerWidth } = window;

    const shouldMoveY = innerHeight - (clientY + height) < 0;
    const shouldMoveX = innerWidth - (clientX + width) < 0;
    let newLeft = clientX;
    let newTop = clientY;
    if (shouldMoveY) newTop = innerHeight - height;
    if (shouldMoveX) newLeft = innerWidth - width;
    this.setState({ left: newLeft, top: newTop });
  };

  copyToClipboard = () => {
    const { fullPath } = getCurrentFile();
    clipboard.writeImage(fullPath);
  };

  handleClick = callback => {
    const { togglePopup } = this.props;

    if (callback) callback();
    togglePopup('contextMenu');
  };

  onPathOpen = () => {
    const { fullPath } = getCurrentFile();
    this.handleClick(() => {
      shell.showItemInFolder(fullPath);
    });
  };

  onDelete = () => this.handleClick(this.props.onDelete);

  onCopy = () => this.handleClick(this.copyToClipboard);

  onContextMenu = () => this.handleClick(() => this.props.togglePopup('info'));

  render() {
    const { contextMenu } = this.props.popups;
    const { top, left } = this.state;
    const currentFile = getCurrentFile();
    if (!currentFile) return null;
    const zIndex = contextMenu ? 102 : -1;

    return (
      <div
        ref={ref => (this.menuEl = ref)}
        style={{ left, top, zIndex }}
        className="popup context-menu"
      >
        <div onClick={this.onPathOpen} className="context-menu-item">
          Open in a file manager
        </div>
        <div onClick={this.onCopy} className="context-menu-item">
          Copy image to clipboard
        </div>
        <div onClick={this.onContextMenu} className="context-menu-item">
          Properties
        </div>
        <div onClick={this.onDelete} className="context-menu-item context-menu-delete">
          Delete
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  viewModes: state.viewModes,
  fileSystem: state.fileSystem,
  popups: state.popups,
  config: state.config,
});

const mapDispatchToProps = {
  updateConfig: payload => ({ type: types.UPDATE_CONFIG, payload }),
  togglePopup: payload => ({ type: types.TOGGLE_POPUP, payload }),
};
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ContextMenu);
