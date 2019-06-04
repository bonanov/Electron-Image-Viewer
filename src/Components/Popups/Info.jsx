import React, { Component } from 'react';
import { connect } from 'react-redux';
import { mapKeys } from 'lodash';
import cx from 'classnames';
import { getCurrentFile } from '../../utils/getValueFromStore';
const { clipboard } = window.electron;
const prettyBytes = window.prettyBytes;
const dates = window.dates;
const TimeAgo = window.timeAgo;
const en = window.timeEn;
TimeAgo.addLocale(en);

class Info extends Component {
  copyToClipboard = value => {
    clipboard.writeText(value.toString());
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
    const infos = this.formatExif(exifData);
    let infosText = '';
    infos.map(entry => (infosText = `${infosText}\n${entry.keys}: ${entry.vals}`));
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
          {infos.map((entry, index) => this.getInfoItem(entry.keys, entry.vals, index))}
        </div>
      </div>
    );
  };

  render() {
    const currentFile = getCurrentFile();
    if (!currentFile) return null;
    const { fileProps } = currentFile;
    const exif = fileProps && fileProps.exifData;
    const { visible } = this.props;

    const classes = cx('popup', 'info_container', { info_container_visible: visible });
    return (
      <div className={classes}>
        {this.getBasicInfo(currentFile)}
        {exif && this.getExifInfo(currentFile)}
      </div>
    );
  }
}

const mapStateToProps = state => ({
  fileSystem: state.fileSystem,
});
export default connect(mapStateToProps)(Info);
