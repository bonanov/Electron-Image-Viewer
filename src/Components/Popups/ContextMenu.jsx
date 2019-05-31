import React, { Component } from 'react';
import { connect } from 'react-redux';
import { mapKeys } from 'lodash';
import * as types from '../../constants/actionTypes';
import * as message from '../../constants/asyncMessages';
import { getCurrentFile } from '../../utils/getValueFromStore';

const { ipcRenderer, clipboard } = window.electron;

class Info extends Component {
  copyToClipboard = () => {
    const { fullPath } = getCurrentFile();
    clipboard.writeImage(fullPath);
  };

  handleClick = callback => {
    const { togglePopup } = this.props;

    if (callback) callback();
    togglePopup('contextMenu');
  };

  onDelete = () => this.handleClick(this.props.onDelete);

  onCopy = () => this.handleClick(this.copyToClipboard);

  onContextMenu = () => this.handleClick(() => this.props.togglePopup('info'));

  render() {
    const { position } = this.props;
    const { x, y } = position;
    const currentFile = getCurrentFile();
    if (!currentFile) return null;

    return (
      <div style={{ left: x, top: y }} className="popup context-menu">
        <div className="context-menu-item">Open in file manager (o)</div>
        <div onClick={this.onCopy} className="context-menu-item">
          Copy image to clipboard (ctrl+c)
        </div>
        <div onClick={this.onDelete} className="context-menu-item">
          Delete
        </div>
        <div onClick={this.onContextMenu} className="context-menu-item">
          Properties (i)
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
)(Info);
