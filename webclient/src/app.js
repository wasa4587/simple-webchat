import React from 'react';
import {
  MessageList,
  UserList,
  NewMessage,
  ShouldMessageListChangedWrapper
} from './components';

import { ConnectWsServerWrapper } from './connect-ws-server-wrapper';

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
const WrappedApp = ConnectWsServerWrapper(App);


export function App(props) {
  let typingText = '';
  if (props.typingUsers.length === 1) {
    const username = props.typingUsers[0];
    typingText = `${username} is typing...`;
  } else if (props.typingUsers.length > 1) {
    typingText = `Several users are typing...`;
  }
  return (
    <div className='app'>
      <div className='webchat'>
        <div className='messages-container'>
          <div className='messages-container-top'>
            <WrappedMessageList username={props.username} messages={props.messages}>
            </WrappedMessageList>
          </div>
          <div className='messages-container-bot'>
            <div className='typing-container'>
              { typingText }
            </div>
            <div className='new-message-container'>
              <NewMessage
                onSend={props.wsSendMessage}
                onTyping={props.wsSendTyping}>
              </NewMessage>
            </div>
          </div>
        </div>
        <div className='users-list-container'>
          <UserList username={props.username} users={props.users}></UserList>
        </div>
      </div>
    </div>
  );
}
export default connect(mapStateToProps, mapDispatchToProps)(WrappedApp);
