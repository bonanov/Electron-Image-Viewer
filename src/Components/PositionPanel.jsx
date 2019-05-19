import React, { Component } from 'react';

class PositionPanel extends Component {
  state = {};

  render() {
    const { amount, currentPosition, hidden } = this.props;
    const position = `${currentPosition + 1 || 0} / ${amount + 1 || 0}`;
    const hiddenClasses = hidden ? 'panel-hidden' : 'panel-visible';
    return (
      <div
        className={`control-panel-container control-panel-upper ${hiddenClasses}`}
      >
        <div className="controls">
          <span title="Position" className="amount">
            {position}
          </span>
        </div>
      </div>
    );
  }
}

export default PositionPanel;
