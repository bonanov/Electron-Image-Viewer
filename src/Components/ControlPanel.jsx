import React, { Component } from 'react';

class ControlPanel extends Component {
  state = {};

  getZoomIcon = () => {
    const { zoomMode, onZoomChange } = this.props;
    return (
      <span
        title="Zoom mode"
        onClick={onZoomChange}
        className="control zoom-mode"
      >
        {zoomMode === 2 && <i className="fa fa-compress" />}
        {zoomMode === 1 && <i className="fa fa-expand" />}
        {zoomMode === 0 && <i className="fa fa-compress" />}
      </span>
    );
  };

  getRandomIcon = () => {
    const { randomMode, onRandomModeChange } = this.props;
    const classes = `control random-mode ${randomMode ? 'random-enabled' : ''}`;
    return (
      <span title="Shuffle" onClick={onRandomModeChange} className={classes}>
        <i className="fa fa-random" />
      </span>
    );
  };

  render() {
    const { onShiftImage } = this.props;
    const { hidden } = this.props;
    const hiddenClasses = hidden ? 'panel-hidden' : 'panel-visible';
    return (
      <div
        className={`control-panel-container control-panel-bottom ${hiddenClasses}`}
      >
        <div className="controls">
          {this.getRandomIcon()}
          {this.getZoomIcon()}
          <span
            title="Previous image"
            onClick={() => onShiftImage(-1)}
            className="control angle angle-left"
          >
            <i className="fa fa-chevron-left" />
          </span>
          <span
            title="Next image"
            onClick={() => onShiftImage(1)}
            className="control angle angle-right"
          >
            <i className="fa fa-chevron-right" />
          </span>
        </div>
      </div>
    );
  }
}

export default ControlPanel;
