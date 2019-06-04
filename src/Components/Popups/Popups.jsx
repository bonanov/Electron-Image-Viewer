import React from 'react';
import { connect } from 'react-redux';
import * as types from '../../constants/actionTypes';
import UndoRemove from './UndoRemove';
import Settings from './Settings';
import Info from './Info';
import ContextMenu from './ContextMenu';
import CropHint from './CropHint';
import Help from './Help';

const Popups = props => {
  const handlePopupClose = name => props.togglePopup(name);
  const { onUndoRemove, onDelete } = props;
  const { popups, trash, viewModes } = props;
  const { undoRemove, settings, info, contextMenu, contextMenuPos, help } = popups;
  const { cropMode } = viewModes;
  return (
    <aside className="popups-container">
      {undoRemove && <UndoRemove trash={trash} onClick={onUndoRemove} />}
      {settings && <Settings onClose={() => handlePopupClose('settings')} />}
      <Info visible={info} />
      <Help visible={help} />
      <ContextMenu visible={contextMenu} onDelete={onDelete} position={contextMenuPos} />
      {cropMode && <CropHint />}
    </aside>
  );
};

const mapStateToProps = state => ({
  viewModes: state.viewModes,
  popups: state.popups,
  trash: state.trash.list,
});

const mapDispatchToProps = {
  togglePopup: payload => ({ type: types.TOGGLE_POPUP, payload }),
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Popups);
