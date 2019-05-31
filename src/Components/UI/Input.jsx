import React, { Component } from 'react';

class Input extends Component {
  state = {
    value: 0,
    step: 1,
    max: 10,
    min: 0,
  };

  inputEl = null;

  inputContainer = null;

  componentDidMount() {
    const { initialValue, step, min, max } = this.props;
    this.setState({
      value: initialValue || 1,
      step: step || 1,
      min: min || 0,
      max: max || 10,
    });
    document.addEventListener('wheel', this.handleWheel, { passive: false });
  }

  handleWheel = e => {
    e.preventDefault();
    if (!e.target.closest('.tooltip-overlay')) return;
    if (e.deltaY > 0) this.handleStepDown();
    if (e.deltaY < 0) this.handleStepUp();
  };

  handleInputChange = e => {
    const { value } = e.target;
    this.handleValueChange(value);
  };

  handleValueChange = value => {
    const { onChange } = this.props;
    const { min, max } = this.state;

    let newValue = Math.min(Math.max(min, value), max);
    newValue = parseFloat(newValue.toFixed(2));

    this.setState({ value: newValue });
    if (onChange) onChange(newValue);
  };

  handleStepUp = () => this.handleStep(1);

  handleStepDown = () => this.handleStep(-1);

  handleStep = delta => {
    if (!this.inputEl) return;
    const { value, step } = this.state;

    this.handleValueChange(value + step * delta);
  };

  render() {
    const { value, step, min, max } = this.state;
    return (
      <div
        ref={ref => (this.inputContainer = ref)}
        className="custom-input unwheel unhide"
      >
        <input
          step={step}
          autoFocus
          min={min}
          max={max}
          type="number"
          value={value}
          ref={ref => (this.inputEl = ref)}
          onChange={this.handleInputChange}
          className="custom-input-element"
        />
        <div className="input-buttons">
          <div onClick={this.handleStepUp} className="input-button input-up">
            <i className="fa fa-chevron-up" />
          </div>
          <div onClick={this.handleStepDown} className="input-button input-down">
            <i className="fa fa-chevron-down" />
          </div>
        </div>
      </div>
    );
  }
}

export default Input;
