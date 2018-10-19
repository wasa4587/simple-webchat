import React, { Component } from 'react';
import { CONFIG } from './config';
import {
  MessageList,
  UserList,
  NewMessage,
  ShouldMessageListChangedWrapper
} from './components';
import { connect } from 'react-redux';
import {
  mapStateToProps,
  mapDispatchToProps
} from './utils';

import './app.scss';

/**
 * Example of wrapping a HOC component
 */
const WrappedMessageList = ShouldMessageListChangedWrapper(MessageList);


class App extends Component {

  componentDidMount() {
    this.props.wsConnectServer(CONFIG.ws);
  }

  render() {
    let typingText = '';
    if (this.props.typingUsers.length === 1) {
      const username = this.props.typingUsers[0];
      typingText = `${username} is typing...`
    } else if (this.props.typingUsers.length > 1) {
      typingText = `Several users are typing...`
    }
    return (
      <div className='app'>
        <div className='webchat'>
          <div className='messages-container'>
            <div className='messages-container-top'>
              <WrappedMessageList username={this.props.username} messages={this.props.messages}>
              </WrappedMessageList>
            </div>
            <div className='messages-container-bot'>
              <div className='typing-container'>
                { typingText }
              </div>
              <div className='new-message-container'>
                <NewMessage
                  onSend={this.props.wsSendMessage}
                  onTyping={this.props.wsSendTyping}>
                </NewMessage>
              </div>
            </div>
          </div>
          <div className='users-list-container'>
            <UserList username={this.props.username} users={this.props.users}></UserList>
          </div>
        </div>
      </div>
    );
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(App);
