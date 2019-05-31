import React, { Component } from 'react';

class Animate extends Component {
  state = {
    visible: false,
  };

  componentDidMount() {
    setTimeout(() => this.setState({ visible: true }), 1);
  }

  render() {
    const { children, key_, customClass } = this.props;
    const { visible } = this.state;
    const classes = `anim ${visible ? 'anim-visible' : 'anim-hidden'} ${customClass ||
      ''}`;
    return <aside className={classes}>{children}</aside>;
  }
}

export default Animate;
