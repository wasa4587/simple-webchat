import React, { Component } from 'react';
import { MessageList, UserList, NewMessage, ShouldMessageListChangedWrapper } from './components';
import { ChatClient, MESSAGE_TYPE } from './models/chat-client'

import './app.scss';


const WrappedMessageList = ShouldMessageListChangedWrapper(MessageList);

class App extends Component {
  chatClient;
  username;
  timer;

  constructor(props) {
    super(props);
    this.state = {
      messages: [],
      users: [],
      isTyping: false,
    };
  }
  componentDidMount() {
    this.chatClient = new ChatClient('ws://localhost:1337');
    this.chatClient.subcribe(this.onChatClientMessageReceived.bind(this));
  }
  addMessage(message) {
    this.setState((prevState, props) => {
      const messages = [...prevState.messages];
      messages.push(message);
      return {messages};
    });
  }
  updateUsers(users) {
    this.setState({users});
  }

  onChatClientMessageReceived(message) {
    switch(message.type) {
      case MESSAGE_TYPE.WELCOME:
        this.username = message.username;
        break;
      case MESSAGE_TYPE.TYPING:
        this.setState({isTyping: true});
        break;
      case MESSAGE_TYPE.MESSAGE:
        this.addMessage(message);
        break;
      case MESSAGE_TYPE.USER_LIST:
        this.updateUsers(message.users);
        break;
      default:
    }
  }
  sendTyping() {
    this.chatClient.sendTyping();
  }
  sendMessage(message) {
    this.chatClient.sendMessage(message);
  }

  render() {
    return (
      <div className='app'>
        <div className='webchat'>
          <div className='messages-container'>
            <div className='messages-list-container'>
              <WrappedMessageList username={this.username} messages={this.state.messages}>
              </WrappedMessageList>
            </div>
            <div className='new-message-container'>
              <NewMessage
                onSend={this.sendMessage.bind(this)}
                onTyping={this.sendTyping.bind(this)}>
              </NewMessage>
            </div>
          </div>
          <div className='users-list-container'>
            <UserList users={this.state.users}></UserList>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
