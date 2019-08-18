import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as types from '../../constants/actionTypes';
import * as message from '../../constants/asyncMessages';

const { ipcRenderer } = window.electron;

class Settings extends Component {
  constructor() {
    super();
    this.settings = [
      // { name: 'hqResize', text: 'High quality image resizing' },
      // { name: 'keepInstance', text: 'Keep process working in the background' },
      // { name: 'trayIcon', text: 'Keep tray icon' },
      { name: 'backgroundBlur', text: 'Background blur (might be slow)' },
      { name: 'backgroundColor', text: 'Background average color' },
      // { name: 'preloadImages', text: "Preload images (you don't want to turn this off)" },
    ];
  }

  handleChange = e => {
    const { config, updateConfig } = this.props;
    const { target } = e;
    const { dataset } = target;
    let { name } = target;
    name = name || dataset.name;
    if (!name) return;
    const confItem = { [name]: !config[name] };

    if (name === 'keepInstance') confItem.trayIcon = false;

    updateConfig(confItem);
    ipcRenderer.send('asynchronous-message', message.updateConfigs(confItem));
  };

  getItem = (name, text, checked, index) => (
    <div
      data-name={name}
      onClick={this.handleChange}
      key={index}
      className="settings-item"
    >
      <input
        onClick={this.handleChange}
        className="checkbox"
        data-name={name}
        checked={checked}
        readOnly
        type="checkbox"
      />
      <span data-name={name} className="settings-name">
        {text}
      </span>
    </div>
  );

  render() {
    const { config, onClose } = this.props;
    const settings = this.settings;
    return (
      <div className="popup settings_container">
        <form className="settings-form">
          <div className="settings-inner">
            {settings.map((item, i) =>
              this.getItem(item.name, item.text, config[item.name], i)
            )}
          </div>
        </form>
        <button className="button settings-button" type="button" onClick={onClose}>
          Close
        </button>
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
)(Settings);
