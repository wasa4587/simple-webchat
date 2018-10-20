import React from 'react';
import {
  MessageList,
  UserList,
  NewMessage,
} from './components';
import { CONFIG } from './config';
import { ConnectWsServerWrapper, UpdateComponenWhenMessageChangesWrapper } from './wrappers';

import { connect } from 'react-redux';
import {
  mapStateToProps,
  mapDispatchToProps
} from './utils';

import './app.scss';

/**
 * Example of wrapping a HOC component
 */
const WrappedMessageList = UpdateComponenWhenMessageChangesWrapper(MessageList);
const WrappedApp = ConnectWsServerWrapper(App, CONFIG);


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
                disabled={!props.connected}
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
