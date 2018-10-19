
import React, { Component } from 'react';

export function ShouldMessageListChangedWrapper(WrappedComponent) {
  return class extends Component {
    shouldComponentUpdate(nextProps) {
      return nextProps.messages.length !== this.props.messages.length;
    }

    render() {
      return <WrappedComponent {...this.props} />;
    }
  }
}
