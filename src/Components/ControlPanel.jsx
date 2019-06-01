import React, { Component } from 'react';
import Input from './UI/Input';

const Tooltip = window.rcTooltip;

class ControlPanel extends Component {
  getZoomIcon = () => {
    const { zoomMode, onZoomChange } = this.props;
    return (
      <span title="Zoom mode" onClick={onZoomChange} className="control zoom-mode">
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

  getFullScreenIcon = () => {
    const { onToggleFullscreen } = this.props;
    const classes = `control fullscreen-mode`;
    return (
      <span title="Fullscreen" onClick={onToggleFullscreen} className={classes}>
        <i className="fa fa-window-maximize" />
      </span>
    );
  };

  getSlideShowIcon = slideShow => {
    const { onToggleSlideShow, onSlideShowTimeoutChange } = this.props;
    const { slideShowTimeOut } = this.props;
    const classes = `control slideshow-mode unwheel ${
      slideShow ? 'slideshow-enabled' : ''
    }`;
    return (
      <Tooltip
        destroyTooltipOnHide
        placement="top"
        trigger={['hover']}
        mouseLeaveDelay={0.2}
        overlay={
          <Input
            step={0.25}
            min={0.25}
            max={120}
            initialValue={slideShowTimeOut / 1000}
            onChange={onSlideShowTimeoutChange}
          />
        }
        overlayClassName="tooltip-overlay"
      >
        <span title="Slideshow" onClick={onToggleSlideShow} className={classes}>
          <i className="fa fa-film" />
        </span>
      </Tooltip>
    );
  };

  getTrashIcon = () => {
    const { onFileDelete } = this.props;
    const classes = `control trash`;
    return (
      <Tooltip
        destroyTooltipOnHide
        placement="top"
        align={{ offset: [-20, 30] }}
        trigger={['hover']}
        overlayClassName="trash-tooltip_container"
        overlay={
          <div onClick={onFileDelete} className="trash-tooltip trash-visible">
            Delete
          </div>
        }
      >
        <span
          onMouseLeave={this.tooltipOff}
          onMouseEnter={this.tooltipOn}
          title="Delete"
          className={classes}
        >
          <i className="fa fa-trash" />
        </span>
      </Tooltip>
    );
  };

  getCogIcon = () => {
    const { onSettingsClick } = this.props;
    return (
      <span title="Settings" onClick={onSettingsClick} className="control settings">
        <i className="fa fa-cog" />
      </span>
    );
  };

  getShiftIcons = () => (
    <React.Fragment>
      <span
        title="Previous image"
        onClick={this.onShiftLeft}
        className="control angle angle-left"
      >
        <i className="fa fa-chevron-left" />
      </span>
      <span
        title="Next image"
        onClick={this.onShiftRight}
        className="control angle angle-right"
      >
        <i className="fa fa-chevron-right" />
      </span>
    </React.Fragment>
  );

  onShiftLeft = () => this.props.onShiftImage(-1);

  onShiftRight = () => this.props.onShiftImage(1);

  render() {
    const { hidden, slideShow } = this.props;
    const hiddenClasses = hidden ? 'panel-hidden' : 'panel-visible';
    return (
      <div className={`control-panel-container control-panel-bottom ${hiddenClasses}`}>
        <div className="controls">
          {this.getTrashIcon()}
          {this.getSlideShowIcon(slideShow)}
          {this.getRandomIcon()}
          {this.getZoomIcon()}
          {this.getShiftIcons()}
          {this.getCogIcon()}
          {this.getFullScreenIcon()}
        </div>
      </div>
    );
  }
}

export default ControlPanel;
