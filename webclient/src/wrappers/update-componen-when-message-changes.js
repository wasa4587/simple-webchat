
import React, { Component } from 'react';

export function UpdateComponenWhenMessageChangesWrapper(WrappedComponent) {
  return class extends Component {
    shouldComponentUpdate(nextProps) {
      return nextProps.messages.length !== this.props.messages.length;
    }

    render() {
      return <WrappedComponent {...this.props} />;
    }
  }
}
