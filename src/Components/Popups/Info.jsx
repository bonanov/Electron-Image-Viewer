import React, { Component } from 'react';
import { connect } from 'react-redux';
import { mapKeys } from 'lodash';
import * as types from '../../constants/actionTypes';
import * as message from '../../constants/asyncMessages';
import { getCurrentFile } from '../../utils/getValueFromStore';

const { Scrollbars } = window.rcs;

const { ipcRenderer } = window.electron;
const prettyBytes = window.prettyBytes;
const dates = window.dates;
const TimeAgo = window.timeAgo;
const en = window.timeEn;
TimeAgo.addLocale(en);

class Info extends Component {
  copyToClipboard = value => {
    ipcRenderer.send('asynchronous-message', message.writeToClipboard(value));
  };

  getInfoItem = (name, value, index, classes) => (
    <div
      key={index}
      title={`${value} (Press to copy)`}
      onClick={() => this.copyToClipboard(value)}
      className={`info-item ${classes || ''}`}
    >
      <span className="info-name">{name}:</span>
      <span className="info-value">{value}</span>
    </div>
  );

  getBasicInfo = file => {
    const { fileProps } = file;
    let dimensions;
    let size;
    let date;

    if (fileProps && fileProps.width) {
      dimensions = `${fileProps.width}×${fileProps.height}`;
    }
    if (file.size) size = prettyBytes(file.size);
    const timeAgo = new TimeAgo('en');
    if (file.mtime) {
      const now = new Date(file.mtime);
      const relative = timeAgo.format(now);
      date = `${relative} (${dates.format(now, 'MMMM DD, YYYY at HH:mm')})`;
    }

    return (
      <div className="info basic-info">
        <div className="info-title basic-info_title">Basic image info</div>
        <div className="info-item_container">
          {this.getInfoItem('Name', file.fileName)}
          {fileProps && this.getInfoItem('Dimensions', dimensions)}
          {fileProps && this.getInfoItem('Size', size)}
          {this.getInfoItem('Path', file.fullPath)}
          {this.getInfoItem('Date modified', date, null, 'date')}
        </div>
      </div>
    );
  };

  formatExif = exifData => {
    const isValidValue = value => typeof value === 'number' || typeof value === 'string';
    const infos = [];

    mapKeys(exifData, val =>
      mapKeys(val, (vals, keys) => {
        if (!isValidValue(vals)) return;
        if (keys === 'undefined') return;
        infos.push({ keys, vals });
      })
    );
    return infos;
  };

  getExifInfo = file => {
    const { fileProps } = file;
    const { exifData } = fileProps;
    let dimensions;
    let size;

    if (fileProps && fileProps.width) {
      dimensions = `${fileProps.width}×${fileProps.height}`;
    }
    // exifDataEntries.map(en => console.log(en));

    const infos = this.formatExif(exifData);
    let infosText = '';
    infos.map(entry => (infosText = `${infosText}\n${entry.keys}: ${entry.vals}`));

    if (file.size) size = prettyBytes(file.size);
    return (
      <div className="info exif-info">
        <div
          title="Copy all metadata to clipboard"
          onClick={() => this.copyToClipboard(infosText)}
          className="info-title exif-info_title"
        >
          Metadata
          <span className="control">
            <i className="fa fa-copy" />
          </span>
        </div>
        <div className="info-item_container">
          {/* <Scrollbars
            style={{ height: '100%' }}
            autoHeight
            autoHeightMin="50px"
            autoHeightMax="100%"
          > */}
          {infos.map((entry, index) => this.getInfoItem(entry.keys, entry.vals, index))}
          {/* </Scrollbars> */}
        </div>
      </div>
    );
  };

  render() {
    const currentFile = getCurrentFile();
    if (!currentFile) return null;
    const { fileProps } = currentFile;
    // if (!fileProps) return null;
    // const { exifData } = fileProps;
    // if (!exifData) return null;
    // console.log(exifData);

    const exif = fileProps && fileProps.exifData;

    const { config, onClose } = this.props;
    return (
      <div className="popup info_container">
        {this.getBasicInfo(currentFile)}
        {exif && this.getExifInfo(currentFile)}
      </div>
    );
  }
}

const mapStateToProps = state => ({
  viewModes: state.viewModes,
  fileSystem: state.fileSystem,
  popups: state.popups,
  config: state.config,
});

const mapDispatchToProps = {
  updateConfig: payload => ({ type: types.UPDATE_CONFIG, payload }),
};
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Info);