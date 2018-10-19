import React, { Component } from 'react';
import {
  MessageList,
  UserList,
  NewMessage,
  ShouldMessageListChangedWrapper
} from './components';
import { ChatClient, MESSAGE_TYPE } from './models/chat-client'

import './app.scss';

const WrappedMessageList = ShouldMessageListChangedWrapper(MessageList);

class App extends Component {
  chatClient;

  constructor(props) {
    super(props);
    this.state = {
      messages: [],
      users: [],
      username: '',
      typing: {
        show: false,
        user: []
      },
    };
  }
  componentDidMount() {
    this.chatClient = new ChatClient('ws://localhost:1337');
    this.chatClient.subcribe(this._onChatClientMessageReceived.bind(this));
  }

  /**
    * Add message
    * @param {object} message
    * @private
   */
  _addMessage(message) {
    this.setState((prevState, props) => {
      const messages = [...prevState.messages];
      messages.push(message);
      return {messages};
    });
  }

  /**
    * Update users list in state
    * @param {Array<string>} users
    * @private
   */
  _updateUsers(users) {
    this.setState({users});
  }

  /**
    * Update users list in state
    * @param {Array<string>} users
    * @private
   */
  _updateTyping(user) {

    this.setState((prevState, props) => {
      const typing = {
        show: true,
        users: [],
      };
      return {typing};
    });
  }
  /**
    * handles new message from websocket
    * @param {object} message
    * @private
   */
  _onChatClientMessageReceived(message) {
    switch(message.type) {
      case MESSAGE_TYPE.WELCOME:
        this.setState({username: message.username});
        break;
      case MESSAGE_TYPE.TYPING:
      //  this._updateTyping(message.username);
        break;
      case MESSAGE_TYPE.MESSAGE:
        this._addMessage(message);
        break;
      case MESSAGE_TYPE.USER_LIST:
        this._updateUsers(message.users);
        break;
      default:
    }
  }

  /**
    * Send typing indicator
    * @private
   */
  _sendTyping() {
    this.chatClient.sendTyping();
  }

  /**
    * Send message through websocket
    * @private
   */
  _sendMessage(message) {
    this.chatClient.sendMessage(message);
  }

  render() {
    return (
      <div className='app'>
        <div className='webchat'>
          <div className='messages-container'>
            <div className='messages-container-top'>
              <WrappedMessageList username={this.state.username} messages={this.state.messages}>
              </WrappedMessageList>
            </div>
            <div className='messages-container-bot'>
              <div className='typing-container'>User is typing...</div>
              <div className='new-message-container'>
                <NewMessage
                  onSend={this._sendMessage.bind(this)}
                  onTyping={this._sendTyping.bind(this)}>
                </NewMessage>
              </div>
            </div>
          </div>
          <div className='users-list-container'>
            <UserList username={this.state.username} users={this.state.users}></UserList>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
