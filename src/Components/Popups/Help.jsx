import React from 'react';
import cx from 'classnames';

const helpItems = [
  { shortcut: 'F1', description: 'Toggle shortucts panel' },
  { shortcut: 'C', description: 'Toggle crop mode' },
  { shortcut: 'M', description: 'Mirror image' },
  { shortcut: 'F', description: 'Toggle fullscreen mode' },
  { shortcut: 'R', description: 'Toggle shuffle mode' },
  { shortcut: 'S', description: 'Toggle slideshow mode' },
  { shortcut: 'Z', description: 'Toggle zoom modes' },
  { shortcut: 'I', description: 'Toggle properties' },
  { shortcut: 'O', description: 'Toggle settings' },
  { shortcut: 'Q', description: 'Minimize app' },
  { shortcut: 'Ctrl+C', description: 'Copy full image path' },
  { shortcut: 'Ctrl+R or F5', description: 'Reload window' },
  { shortcut: 'Home', description: 'Jump to first image' },
  { shortcut: 'End', description: 'Jump to last image' },
];

const Help = ({ visible }) => (
  <div className={cx('popup', 'help_container', { help_container_visible: visible })}>
    <div className="info basic-info">
      <div className="info-title basic-info_title">Hotkeys</div>
      {helpItems.map((item, index) => (
        <div key={index} className="info-item_container">
          <div className="info-item ">
            <span className="info-value">{item.shortcut}: </span>
            <span className="info-name">{item.description}</span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default Help;
