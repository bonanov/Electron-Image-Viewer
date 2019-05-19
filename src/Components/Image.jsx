import React, { Component } from 'react';
import { toast } from 'react-toastify';

const { remote, nativeImage } = window.electron;

class Image extends Component {
  state = {
    translateX: 0,
    translateY: 0,
    scale: 1,
  };

  imageEl = null;

  componentDidMount() {
    document.addEventListener('wheel', this.handleWheel);
  }

  handleWheel = e => {
    const { scale } = this.state;
    const delta = e.deltaY > 0 ? -1 : 1;
    this.handleZoom({ delta });
  };

  handleZoom = ({ delta, initialScale }) => {
    const { onZoomModeChange, zoomMode } = this.props;
    let { scale } = this.state;
    if (zoomMode !== 0) scale = 1;
    const scaleNew = initialScale || scale + 0.1 * delta * Math.exp(scale / 4);
    if (scaleNew < 0.1) return;
    if (scaleNew > 15) return;
    const scaleFixed = Number(scaleNew.toFixed(2));
    onZoomModeChange(0);
    this.setState({ scale: scaleFixed });
  };

  getStyle = () => {
    const { scale } = this.state;
    const { width, height, zoomMode } = this.props;
    let scaleValue;
    if (zoomMode === 0) scaleValue = scale;
    if (zoomMode === 1) scaleValue = 1;
    if (zoomMode === 2) {
      const elementWidth = this.imageEl.offsetWidth;
      scaleValue = width / elementWidth;
    }

    const transform = `scale(${scaleValue})`;
    const style = {
      transform,
    };
    return style;
  };

  render() {
    const { path, zoomMode, base64 } = this.props;
    const zoomFit = zoomMode === 1;
    const style = this.getStyle();
    const noScale = style.scale <= 1;
    const src = base64 && (zoomFit || noScale) ? base64 : path;
    return (
      <div className="image-container">
        <div style={{ ...style }} className="image">
          {path && (
            <img
              ref={ref => (this.imageEl = ref)}
              className="image-inner"
              src={src}
            />
          )}
        </div>
      </div>
    );
  }
}

export default Image;
