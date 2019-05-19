import React, { Component } from 'react';
import ImageContainer from './Image';
import { handleResizeImage, getFileProps } from '../utils/imageProcessing';

class FileHandler extends Component {
  state = {
    base64: '',
    fileProps: {},
  };

  componentDidMount() {
    this.initializeFileProps();
  }

  componentDidUpdate(prevProps, prevState) {
    const { currentFile } = this.props;
    if (prevProps.currentFile.fullPath !== currentFile.fullPath) {
      const callback = this.initializeFileProps;
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ base64: '' }, callback);
    }
  }

  initializeFileProps = async () => {
    const { currentFile } = this.props;
    if (!currentFile.fullPath) return;
    const { fullPath } = currentFile;
    const props = await getFileProps(fullPath);
    const { width, height, aspect, err } = props;
    if (err) return;

    const newState = { fileProps: { width, height, aspect } };
    const callback = this.handleResize;
    this.setState(newState, callback);
  };

  handleResize = async () => {
    // return;
    const { dirName, fileName, fileProps, currentFile } = this.props;
    const { fullPath } = currentFile;

    let base64 = await handleResizeImage(fullPath);
    // Check if image did not change
    // eslint-disable-next-line react/destructuring-assignment
    if (base64 && fullPath === this.props.currentFile.fullPath) {
      this.setState({ base64 });
    } else {
      base64 = null;
    }
  };

  handleZoomChange = () => {
    const { zoomMode } = this.state;
    let zoom;
    if (zoomMode === 0) zoom = 1;
    if (zoomMode === 1) zoom = 2;
    if (zoomMode === 2) zoom = 1;
    this.setState({ zoomMode: zoom });
  };

  handleZoomMode = mode => {
    this.setState({ zoomMode: mode });
  };

  render() {
    const { currentFile } = this.props;
    const { base64 } = this.state;
    return (
      <ImageContainer
        onRef={ref => (this.imageEl = ref)}
        // zoomMode={zoomMode}
        base64={base64}
        path={currentFile.fullPath}
        // width={width}
        // height={height}
        onZoomModeChange={this.handleZoomMode}
      />
    );
  }
}

export default FileHandler;
