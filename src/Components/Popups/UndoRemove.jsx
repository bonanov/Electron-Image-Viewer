import React from 'react';

const UndoRemove = ({ onClick }) => (
  <div className="popup undo-remove">
    <span onClick={onClick} className="undo-text">
      Undo
    </span>
  </div>
);

export default UndoRemove;
