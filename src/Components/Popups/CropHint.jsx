import React from 'react';

const CropHint = () => (
  <div className="crop-hint_container">
    <div className="crop-hint">
      <span className="crop-hint_key">Enter</span> to save cropped image
    </div>
    <div className="crop-hint">
      <span className="crop-hint_key">Escape</span> to quit
    </div>
  </div>
);

export default CropHint;
