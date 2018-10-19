import React, { Component } from 'react';

export function ConnectWsServerWrapper(WrappedComponent, CONFIG) {
  return class extends Component {
    componentDidMount() {
      this.props.wsConnectServer(CONFIG.ws);
    }
    render() {
      return <WrappedComponent {...this.props} />;
    }
  }
}
