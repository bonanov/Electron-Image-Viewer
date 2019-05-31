import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as types from '../../constants/actionTypes';
import { getPopups, undoFileRemoving } from '../../utils/getValueFromStore';
import UndoRemove from './UndoRemove';
import Animate from '../Animate';
import Settings from './Settings';
import Info from './Info';
import ContextMenu from './ContextMenu';

class Popups extends Component {
  handlePopupClose = name => {
    const { togglePopup } = this.props;

    togglePopup(name);
  };

  render() {
    const { popups, trash } = this.props;
    const { onUndoRemove, onDelete, onPathOpen } = this.props;
    const { undoRemove, settings, info, contextMenu } = popups;
    const { contextMenuPos } = popups;
    return (
      <aside className="popups-container">
        {undoRemove && <UndoRemove trash={trash} onClick={onUndoRemove} />}
        {settings && <Settings onClose={() => this.handlePopupClose('settings')} />}
        <Info visible={info} />

        <ContextMenu
          visible={contextMenu}
          onDelete={onDelete}
          position={contextMenuPos}
        />
      </aside>
    );
  }
}

const mapStateToProps = state => ({
  viewModes: state.viewModes,
  fileSystem: state.fileSystem,
  popups: state.popups,
  trash: state.trash.list,
});

const mapDispatchToProps = {
  toggleZoomMode: () => ({ type: types.TOGGLE_ZOOM_MODE }),
  setZoomMode: payload => ({ type: types.SET_ZOOM_MODE, payload }),
  setZoomFree: () => ({ type: types.ZOOM_FREE }),
  updateFileList: payload => ({ type: types.UPDATE_FILELIST, payload }),
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
  togglePopup: payload => ({ type: types.TOGGLE_POPUP, payload }),
};
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Popups);
