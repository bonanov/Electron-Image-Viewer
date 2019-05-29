import React, { Component } from 'react';

class PositionPanel extends Component {
  state = {};

  render() {
    const { onInfo } = this.props;
    const { amount, currentPosition, hidden } = this.props;
    let position = '0/0';
    if (amount) position = `${currentPosition + 1 || 0} / ${amount || 0}`;

    const hiddenClasses = hidden ? 'panel-hidden' : 'panel-visible';
    return (
      <div className={`control-panel-container control-panel-upper ${hiddenClasses}`}>
        <div className="controls">
          <span title="Position" className="amount">
            {position}
          </span>
        </div>
        <span onClick={onInfo} title="File info" className="control file-info">
          <i className="fa fa-info-circle" />
        </span>
      </div>
    );
  }
}

export default PositionPanel;
