import React, { Component } from 'react';
import {
  MessageList,
  UserList,
  NewMessage,
  ShouldMessageListChangedWrapper
} from './components';
import { ChatClient, MESSAGE_TYPE } from './models/chat-client'

import './app.scss';

/**
 * Example of wrapping a HOC component 
 */
const WrappedMessageList = ShouldMessageListChangedWrapper(MessageList);

const TYPING_TIMEOUT = 3000;

class App extends Component {
  _chatClient;
  _timer;
  constructor(props) {
    super(props);
    this.state = {
      messages: [],
      users: [],
      username: '',
      typing: {
        text: '',
        user: []
      },
    };
  }
  componentDidMount() {
    this._chatClient = new ChatClient('ws://localhost:1337');
    this._chatClient.subcribe(this._onChatClientMessageReceived.bind(this));
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
  _updateTyping(username) {
    if (username !== this.state.username) {
      clearTimeout(this._timer);
      this._timer = setTimeout(() => {
        const typing = {users: [], text: ''};
        this.setState({typing});
      }, TYPING_TIMEOUT);

      this.setState((prevState, props) => {
        const usersSet = new Set(prevState.typing.users);
        usersSet.add(username);
        const users = [...usersSet];
        const text = users.length > 1 ? 'Several users are typing...' : `${users[0]} is typing...`;
        const typing = {
          users,
          text,
        };
        return {typing};
      });
    }
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
        this._updateTyping(message.username);
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
    this._chatClient.sendTyping();
  }

  /**
    * Send message through websocket
    * @private
   */
  _sendMessage(message) {
    this._chatClient.sendMessage(message);
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
              <div className='typing-container'>
                { this.state.typing.text }
              </div>
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
