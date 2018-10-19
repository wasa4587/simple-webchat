import React, { Component } from 'react';
import { CONFIG } from './config';

export function ConnectWsServerWrapper(WrappedComponent) {
  return class extends Component {
    componentDidMount() {
      this.props.wsConnectServer(CONFIG.ws);
    }
    render() {
      return <WrappedComponent {...this.props} />;
    }
  }
}
