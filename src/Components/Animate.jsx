import React, { Component } from 'react';

class Animate extends Component {
  state = {
    visible: false,
  };

  componentDidMount() {
    // setTimeout(() => this.setState({ visible: true }), 1);
    this.setState({ visible: true });
  }

  render() {
    const { children, key_ } = this.props;
    const { visible } = this.state;
    const classes = `anim ${visible ? 'anim-visible' : 'anim-hidden'}`;
    return <aside className={classes}>{children}</aside>;
  }
}

export default Animate;
