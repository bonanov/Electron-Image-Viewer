import React from 'react';
import Animate from '../Animate';

const UndoRemove = ({ onClick, trash }) => {
  if (!trash.length) return null;
  return (
    <div className="popup undo-remove_container">
      {trash.map((trashObject, i) => {
        const { seen, file } = trashObject;

        if (seen) return null;
        let { fileName, fullPath } = file;

        if (fileName.length > 10) {
          fileName = `${fileName.slice(0, 8)}...${file.type}`;
        }

        return (
          <Animate key={fullPath}>
            <div className="undo-remove">
              <span onClick={() => onClick(fullPath)} className="undo-text">
                Undo <span className="undo-file-name">{fileName}</span> deletion
                {trash.length - 1 === i && (
                  <span className="undo-hotkey"> (ctrl+z)</span>
                )}
              </span>
            </div>
          </Animate>
        );
      })}
    </div>
  );
};

export default UndoRemove;
