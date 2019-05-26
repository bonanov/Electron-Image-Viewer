import React, { Component } from 'react';

class ControlPanel extends Component {
  state = {
    trashTooltip: false,
  };

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
    const { randomMode, onToggleShuffle } = this.props;
    const classes = `control random-mode ${randomMode ? 'random-enabled' : ''}`;
    return (
      <span title="Shuffle" onClick={onToggleShuffle} className={classes}>
        <i className="fa fa-random" />
      </span>
    );
  };

  tooltipOn = () => this.setState({ trashTooltip: true });

  tooltipOff = () => this.setState({ trashTooltip: false });

  onDeleteClick = () => {
    const { trashTooltip } = this.state;
    const { onFileDelete } = this.props;
    if (!trashTooltip) return;
    onFileDelete();
    this.tooltipOff();
  };

  getTrashIcon = () => {
    const { trashTooltip } = this.state;
    const classes = `control trash`;
    return (
      <span
        onMouseLeave={this.tooltipOff}
        onMouseEnter={this.tooltipOn}
        title="Delete"
        className={classes}
      >
        <div className="trash-tooltip_container" hidden={!trashTooltip}>
          <div
            onClick={this.onDeleteClick}
            className={`trash-tooltip ${
              trashTooltip ? 'trash-visible' : 'trash-hidden'
            }`}
          >
            Delete
          </div>
        </div>
        <i className="fa fa-trash" />
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
          {this.getTrashIcon()}
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
