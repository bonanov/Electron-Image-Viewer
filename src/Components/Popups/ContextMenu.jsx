import React, { Component } from 'react';
import { connect } from 'react-redux';
import { mapKeys } from 'lodash';
import * as types from '../../constants/actionTypes';
import * as message from '../../constants/asyncMessages';
import { getCurrentFile } from '../../utils/getValueFromStore';

const { ipcRenderer } = window.electron;

class Info extends Component {
  copyToClipboard = () => {
    const { togglePopup } = this.props;
    const { fullPath } = getCurrentFile();
    ipcRenderer.send('asynchronous-message', message.writeImageToClipboard(fullPath));
    // togglePopup('contextMenu');
  };

  handleClick = callback => {
    const { togglePopup } = this.props;

    if (callback) callback();
    togglePopup('contextMenu');
  };

  // eslint-disable-next-line react/destructuring-assignment
  onDelete = () => this.handleClick(this.props.onDelete);

  onCopy = () => this.handleClick(this.copyToClipboard);

  render() {
    const { position } = this.props;
    const { onDelete } = this.props;
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
        <div className="context-menu-item">Properties (i)</div>
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
